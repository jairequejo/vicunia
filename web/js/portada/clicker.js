/**
 * Editor de clicker de la portada.
 *
 * Mantiene el diseño (palabra, teclas, símbolos y colores), lo guarda en el
 * navegador, lo refleja en el visor 3D con la malla real de producción y arma
 * el mensaje de WhatsApp. No envía nada solo.
 */
import { ClickerPreview } from '../clicker3d.js';
import {
  FILAMENTS,
  BASE_COLORS,
  SYMBOLS,
  baseColor,
  capColor,
  inkFor,
  normalizeChar,
  normalizeWord,
  isValidColor
} from '../palette.js';
import { CONFIG, openWhatsApp } from '../config.js';
import { $, $$ } from '../dom.js';
import { crearSwatches } from '../muestras.js';
import { clamp, descargar, slug, sound, toast } from './comun.js';

/* -------------------------------------------------------------- constantes */

const STORAGE_KEY = 'vicunia.design.v1';
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** Colores con los que se van turnando las teclas. */
const CICLO = ['rosado', 'azul', 'mango', 'verde', 'lavanda', 'naranja', 'azul-hielo', 'rojo', 'turquesa', 'seda'];

/** Nombre legible de un símbolo. */
const symbolName = (id) => SYMBOLS.find((symbol) => symbol.id === id)?.name || 'Símbolo';

/* ----------------------------------------------------------------- estado */

/** Diseño inicial a partir de una palabra. */
function crearEstado(word = 'VICUNIA') {
  const letters = normalizeWord(word).slice(0, 10);
  const slots = clamp(letters.length, 2, 10);
  const caps = Array.from({ length: slots }, (_, index) => ({
    char: letters[index] || '',
    symbol: null,
    color: CICLO[index % CICLO.length],
    ink: null
  }));
  return { word: letters, slots, caps, baseColor: 'marfil', active: 0 };
}

/** Comprueba y corrige un diseño guardado antes de usarlo. */
function sanearEstado(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const slots = clamp(Number.parseInt(raw.slots, 10) || 2, 2, 10);
  const caps = Array.from({ length: slots }, (_, index) => {
    const source = Array.isArray(raw.caps) ? raw.caps[index] || {} : {};
    const symbol = SYMBOLS.some((entry) => entry.id === source.symbol) ? source.symbol : null;
    const color = isValidColor(source.color) ? source.color : CICLO[index];
    return {
      char: symbol ? '' : normalizeChar(source.char),
      symbol,
      color,
      ink: HEX_COLOR.test(source.ink || '') ? source.ink : null
    };
  });

  return {
    word: caps.map((cap) => cap.char || '').join('').slice(0, 10),
    slots,
    caps,
    baseColor: BASE_COLORS.some((entry) => entry.id === raw.baseColor) ? raw.baseColor : 'marfil',
    active: clamp(Number.parseInt(raw.active, 10) || 0, 0, slots - 1)
  };
}

/** Lee un diseño compartido por enlace (?n=, ?b=, ?c=). */
function cargarEstadoDeUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.includes('?')
      ? new URLSearchParams(window.location.hash.split('?')[1])
      : null;
    const name = params.get('n') || params.get('nombre') || hash?.get('n');
    const base = params.get('b') || params.get('base') || hash?.get('b');
    const caps = params.get('c') || params.get('color') || hash?.get('c');

    if (!name) return null;

    const def = crearEstado(name);
    if (base && BASE_COLORS.some((entry) => entry.id === base)) def.baseColor = base;
    if (caps && isValidColor(caps)) def.caps.forEach((cap) => { cap.color = caps; });
    return def;
  } catch (error) {
    return null;
  }
}

/** Diseño de la URL o, si no hay, el último guardado en este navegador. */
function cargarEstado() {
  const fromUrl = cargarEstadoDeUrl();
  if (fromUrl) return fromUrl;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? sanearEstado(JSON.parse(saved)) : null;
  } catch (error) {
    return null;
  }
}

/* --------------------------------------------------------------- controles */

const els = {
  word: $('#word'),
  wordCount: $('#word-count'),
  wordHint: $('#word-hint'),
  slotStrip: $('#slot-strip'),
  slotsControl: $('#slots-control'),
  editorBadge: $('#editor-badge'),
  charInput: $('#char-input'),
  symbols: $('#symbol-grid'),
  capColors: $('#cap-colors'),
  inkColors: $('#ink-colors'),
  inkAuto: $('#ink-auto'),
  baseColors: $('#base-colors'),
  applyAll: $('#apply-all'),
  shuffle: $('#shuffle'),
  send: $('#send-design'),
  stageSummary: $('#stage-summary'),
  loading: $('#stage-loading'),
  canvas: $('#clicker-canvas'),
  spin: $('#btn-spin'),
  soundBtn: $('#btn-sound'),
  reset: $('#btn-reset'),
  share: $('#btn-share-design'),
  save: $('#btn-save')
};

const state = cargarEstado() || crearEstado();
let preview = null;
let saveTimer = 0;

/* -------------------------------------------------------------- pintado */

/** Botones de símbolos (incluido "sin símbolo"). */
function buildSymbolButtons() {
  if (!els.symbols) return;

  els.symbols.setAttribute('role', 'group');
  els.symbols.innerHTML = '';

  const none = document.createElement('button');
  none.type = 'button';
  none.className = 'sym sym--none';
  none.dataset.symbol = '';
  none.textContent = 'ABC';
  none.setAttribute('aria-pressed', 'false');
  none.setAttribute('aria-label', 'Sin símbolo');
  none.title = 'Sin símbolo';
  none.addEventListener('click', () => setSymbol(null));
  els.symbols.append(none);

  SYMBOLS.forEach((symbol) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'sym';
    button.dataset.symbol = symbol.id;
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', symbol.name);
    button.title = symbol.name;
    const iconId = symbol.id === 'moon' ? 'i-moon-sym' : `i-${symbol.id}`;
    button.innerHTML = `<svg aria-hidden="true"><use href="#${iconId}"></use></svg>`;
    button.addEventListener('click', () => setSymbol(symbol.id));
    els.symbols.append(button);
  });
}

/** Botones de 2 a 10 teclas. */
function buildSlotsControl() {
  if (!els.slotsControl) return;

  els.slotsControl.innerHTML = '';
  for (let total = 2; total <= 10; total += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'seg';
    button.textContent = String(total);
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', `${total} teclas`);
    button.addEventListener('click', () => setSlots(total));
    els.slotsControl.append(button);
  }
}

/** Crea la tira de teclas si cambió el número de teclas. */
function ensureSlotStrip() {
  if (!els.slotStrip) return;
  els.slotStrip.setAttribute('role', 'group');
  if (els.slotStrip.children.length === state.slots) return;

  els.slotStrip.innerHTML = '';
  state.caps.forEach((cap, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'slot';
    button.dataset.index = String(index);
    button.setAttribute('aria-label', `Tecla ${index + 1}`);
    button.innerHTML = '<span class="slot__cap" aria-hidden="true"><span class="slot__glyph"></span></span><span class="slot__num" aria-hidden="true" data-num="' + (index + 1) + '"></span>';
    button.addEventListener('click', () => selectSlot(index));
    els.slotStrip.append(button);
  });
}

/** Pinta cada tecla de la tira con su color y su letra o símbolo. */
function paintSlotStrip() {
  if (!els.slotStrip) return;

  Array.from(els.slotStrip.children).forEach((button, index) => {
    const cap = state.caps[index];
    if (!cap) return;

    const color = capColor(cap.color);
    const active = index === state.active;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
    button.style.setProperty('--slot-bg', color.hex);
    button.style.setProperty('--slot-ink', inkFor(color.hex));
    button.setAttribute('aria-label', `Tecla ${index + 1}: ${cap.symbol ? symbolName(cap.symbol) : (cap.char || 'en blanco')}, ${color.name}`);

    const glyph = button.querySelector('.slot__glyph');
    if (!glyph) return;

    if (cap.symbol) {
      const iconId = cap.symbol === 'moon' ? 'i-moon-sym' : `i-${cap.symbol}`;
      glyph.innerHTML = `<svg aria-hidden="true"><use href="#${iconId}"></use></svg>`;
    } else {
      glyph.textContent = cap.char || '·';
    }
  });
}

/** Vuelca el estado completo a la pantalla y al visor 3D. */
function paint() {
  if (els.word) els.word.value = state.word;
  if (els.wordCount) els.wordCount.textContent = `${state.word.length}/10`;

  if (state.word) {
    document.title = `Clicker "${state.word}" en 3D · Vicunia Cajamarca`;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', `Clicker "${state.word}" en 3D · Diseñado en Vicunia`);
  }

  ensureSlotStrip();
  paintSlotStrip();

  $$('.seg', els.slotsControl).forEach((button) => {
    const active = Number(button.textContent) === state.slots;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  const cap = state.caps[state.active] || state.caps[0];
  if (els.editorBadge) els.editorBadge.textContent = `Tecla ${state.active + 1}`;
  if (els.charInput) els.charInput.value = cap?.char || '';

  $$('[data-symbol]', els.symbols).forEach((button) => {
    const active = (cap?.symbol || '') === button.dataset.symbol;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  $$('button.swatch', els.capColors).forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.id === cap?.color));
  });

  $$('button.swatch', els.inkColors).forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.id === cap?.ink));
  });
  if (els.inkAuto) {
    const auto = !cap?.ink;
    els.inkAuto.setAttribute('aria-pressed', String(auto));
    els.inkAuto.textContent = auto ? 'Automático' : 'Usar automático';
  }

  $$('button.swatch', els.baseColors).forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.id === state.baseColor));
  });

  if (els.stageSummary) {
    els.stageSummary.textContent = `${state.slots} teclas · ${baseColor(state.baseColor).name}`;
  }

  preview?.setState(snapshotState());
  queueSave();
}

/** Copia del diseño que entiende el visor 3D. */
function snapshotState() {
  return {
    slots: state.slots,
    caps: state.caps.map((cap) => ({ ...cap })),
    baseColor: state.baseColor
  };
}

/** Guarda el diseño con un pequeño retraso para no escribir en cada tecla. */
function queueSave() {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      /* almacenamiento lleno o bloqueado */
    }
  }, 350);
}

/* -------------------------------------------------------------- acciones */

function selectSlot(index) {
  state.active = clamp(index, 0, state.slots - 1);
  preview?.select(state.active);
  paint();
}

function setSlots(total) {
  const next = clamp(total, 2, 10);
  if (next === state.slots) return;

  const caps = state.caps.slice(0, next);
  while (caps.length < next) {
    caps.push({
      char: '',
      symbol: null,
      color: CICLO[caps.length % CICLO.length],
      ink: null
    });
  }

  state.slots = next;
  state.caps = caps;
  state.active = clamp(state.active, 0, next - 1);
  state.word = caps.map((cap) => cap.char || '').join('');
  paint();
  preview?.select(state.active);
}

function setSymbol(symbol) {
  const cap = state.caps[state.active];
  if (!cap) return;

  cap.symbol = symbol;
  if (symbol) cap.char = '';
  if (els.charInput) els.charInput.value = '';
  paint();
}

function applyChar(raw) {
  const cap = state.caps[state.active];
  if (!cap) return;

  const char = normalizeChar(raw);
  if (!char) {
    if (els.charInput) els.charInput.value = '';
    return;
  }

  cap.char = char;
  cap.symbol = null;
  if (els.charInput) els.charInput.value = char;
  state.word = state.caps.map((entry) => entry.char || '').join('');
  paint();
}

function applyColorToAll() {
  const cap = state.caps[state.active];
  if (!cap) return;

  state.caps = state.caps.map((entry) => ({ ...entry, color: cap.color }));
  paint();
  toast(`Todas las teclas en ${capColor(cap.color).name.toLowerCase()}.`);
}

function shuffleColors() {
  let previous = null;
  state.caps = state.caps.map((cap) => {
    const options = FILAMENTS.filter((entry) => entry.id !== previous);
    const pick = options[Math.floor(Math.random() * options.length)];
    previous = pick.id;
    return { ...cap, color: pick.id };
  });
  paint();
}

/** Borrador del pedido para WhatsApp. */
function designText() {
  const base = baseColor(state.baseColor);
  const keys = state.caps.map((cap, index) => {
    const label = cap.symbol ? symbolName(cap.symbol) : (cap.char || 'en blanco');
    return `${index + 1}. ${label} — ${capColor(cap.color).name}`;
  });

  return [
    'Hola Vicunia 👋 Quiero este clicker personalizado:',
    '',
    `• ${state.slots} teclas:`,
    ...keys.map((line) => `   ${line}`),
    `• Base: ${base.name}`,
    '• Argolla: aro metálico estándar',
    '',
    'Lo armé en su web. ¿Me confirman precio, colores y tiempo de entrega?'
  ].join('\n');
}

/* ------------------------------------------------------------ vista 3D */

/** Botones de girar, sonido, centrar, compartir y guardar imagen. */
function initStageControls() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  els.spin?.setAttribute('aria-pressed', String(!reduced));
  els.soundBtn?.setAttribute('aria-pressed', 'true');

  els.spin?.addEventListener('click', () => {
    const enabled = els.spin.getAttribute('aria-pressed') !== 'true';
    els.spin.setAttribute('aria-pressed', String(enabled));
    preview.setAutoRotate(enabled);
  });

  els.soundBtn?.addEventListener('click', () => {
    const enabled = els.soundBtn.getAttribute('aria-pressed') !== 'true';
    els.soundBtn.setAttribute('aria-pressed', String(enabled));
    sound.setEnabled(enabled);
    if (enabled) sound.play(0.7);
  });

  els.reset?.addEventListener('click', () => {
    preview.resetView();
    toast('Vista centrada.');
  });

  els.share?.addEventListener('click', async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('n', state.word || 'VICUNIA');
    url.searchParams.set('b', state.baseColor || 'marfil');
    if (state.caps[0]?.color) url.searchParams.set('c', state.caps[0].color);
    window.history.replaceState({}, '', url.toString());

    const shareData = {
      title: `Clicker "${state.word}" en 3D · Vicunia Cajamarca`,
      text: `¡Mira el diseño de clicker en 3D que armé para "${state.word}"! Puedes probar tus propios colores aquí:`,
      url: url.toString()
    };

    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        // el usuario canceló: seguimos con el portapapeles
      }
    }

    try {
      await navigator.clipboard.writeText(url.toString());
      toast('¡Enlace de tu diseño copiado! Listo para enviar por WhatsApp.');
    } catch (error) {
      prompt('Copia este enlace de tu diseño:', url.toString());
    }
  });

  els.save?.addEventListener('click', async () => {
    const blob = await preview.snapshot();
    if (!blob) {
      toast('No se pudo generar la imagen.');
      return;
    }
    descargar(blob, `vicunia-clicker-${slug(state.word)}.png`);
    toast('Imagen descargada. Mándala por WhatsApp con tu pedido.');
  });
}

/* ------------------------------------------------------------- arranque */

/** Monta el editor del clicker y lo deja listo para usar. */
export function initClicker() {
  preview = new ClickerPreview(els.canvas, {
    sound,
    onReady: () => {
      els.loading?.classList.add('is-hidden');
      els.canvas?.setAttribute('aria-busy', 'false');
    },
    onError: () => {
      if (els.loading) {
        els.loading.innerHTML = '<div style="max-width:280px;text-align:center;padding:1rem"><strong>No pudimos abrir la vista 3D</strong><p class="hint" style="margin-top:.4rem">Tu navegador no tiene WebGL activo. Igual puedes armar el diseño: el resumen se envía por WhatsApp.</p></div>';
      }
      els.canvas.style.display = 'none';
    },
    onSelect: (index) => {
      state.active = index;
      paint();
    }
  });

  preview.select(state.active);
  preview.setState(snapshotState());

  crearSwatches(els.capColors, FILAMENTS, (id) => {
    const cap = state.caps[state.active];
    if (!cap) return;
    cap.color = id;
    paint();
  });

  crearSwatches(els.inkColors, FILAMENTS, (id) => {
    const cap = state.caps[state.active];
    if (!cap) return;
    cap.ink = id;
    paint();
  });

  els.inkAuto?.addEventListener('click', () => {
    const cap = state.caps[state.active];
    if (!cap) return;
    cap.ink = cap.ink ? null : cap.ink;
    paint();
  });

  crearSwatches(els.baseColors, BASE_COLORS, (id) => {
    state.baseColor = id;
    paint();
  });

  buildSymbolButtons();
  buildSlotsControl();

  els.word?.addEventListener('input', () => {
    const raw = els.word.value;
    const caret = els.word.selectionStart;
    const word = normalizeWord(raw);

    if (word !== raw) {
      els.word.value = word;
      const position = Math.min(caret, word.length);
      els.word.setSelectionRange(position, position);
    }
    state.word = word;

    if (word.length >= 2) {
      const slots = clamp(word.length, 2, 10);
      state.caps = Array.from({ length: slots }, (_, index) => ({
        char: word[index] || '',
        symbol: null,
        color: state.caps[index]?.color || CICLO[index % CICLO.length],
        ink: state.caps[index]?.ink ?? null
      }));
      state.slots = slots;
      state.active = clamp(state.active, 0, slots - 1);
    } else {
      state.caps = state.caps.map((cap, index) => ({
        ...cap,
        char: word[index] || '',
        symbol: word[index] ? null : cap.symbol
      }));
    }
    paint();
  });

  els.word?.addEventListener('blur', () => {
    if (!state.word) {
      state.word = state.caps.map((cap) => cap.char || '').join('');
      paint();
    }
  });

  els.charInput?.addEventListener('input', () => {
    applyChar(els.charInput.value);
  });

  els.applyAll?.addEventListener('click', applyColorToAll);
  els.shuffle?.addEventListener('click', shuffleColors);
  els.send?.addEventListener('click', () => openWhatsApp(designText()));

  initStageControls();
  paint();
  els.wordHint?.setAttribute('data-base', CONFIG.ciudad);
  preview.init();
}
