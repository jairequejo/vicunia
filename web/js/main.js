/**
 * Portada de Vicunia: estado del clicker y del lápiz, formulario de la foto,
 * exportación de archivos y galería. El tema, el menú y los enlaces de
 * WhatsApp son comunes a toda la web y viven en site.js.
 */
import { ClickerPreview } from './clicker3d.js';
import { PencilPreview } from './pencil.js';
import { engine, SLIDERS, PENCIL_DEF } from './pencil-geo.js';
import {
  FILAMENTS,
  BASE_COLORS,
  SYMBOLS,
  baseColor,
  capColor,
  contrastInk,
  inkFor,
  normalizeChar,
  normalizeWord,
  isValidColor
} from './palette.js';
import { CONFIG, openWhatsApp } from './config.js';
import { initSite } from './site.js';
import { $, $$ } from './dom.js';

/* -------------------------------------------------------------- constantes */

const STORAGE_KEY = 'vicunia.design.v1';
const PENCIL_STORAGE_KEY = 'vicunia.pencil.v2';
const MAX_FILE = 100 * 1024 * 1024;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.gif'];
const DEFAULT_CYCLE = ['rosado', 'azul', 'mango', 'verde', 'lavanda', 'naranja', 'azul-hielo', 'rojo', 'turquesa', 'seda'];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const symbolName = (id) => SYMBOLS.find((symbol) => symbol.id === id)?.name || 'Símbolo';

/* ----------------------------------------------------------------- estado */

function createDefault(word = 'VICUNIA') {
  const letters = normalizeWord(word).slice(0, 10);
  const slots = clamp(letters.length, 2, 10);
  const caps = Array.from({ length: slots }, (_, index) => ({
    char: letters[index] || '',
    symbol: null,
    color: DEFAULT_CYCLE[index % DEFAULT_CYCLE.length],
    ink: null
  }));
  return { word: letters, slots, caps, baseColor: 'marfil', active: 0 };
}

function sanitizeState(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const slots = clamp(Number.parseInt(raw.slots, 10) || 2, 2, 10);
  const caps = Array.from({ length: slots }, (_, index) => {
    const source = Array.isArray(raw.caps) ? raw.caps[index] || {} : {};
    const symbol = SYMBOLS.some((entry) => entry.id === source.symbol) ? source.symbol : null;
    const color = isValidColor(source.color) ? source.color : FILAMENTOS_POR_DEFECTO[index];
    return {
      char: symbol ? '' : normalizeChar(source.char),
      symbol,
      color,
      ink: HEX_COLOR.test(source.ink || '') ? source.ink : null
    };
  });
  const word = caps.map((cap) => cap.char || '').join('').slice(0, 10);
  const base = BASE_COLORS.some((entry) => entry.id === raw.baseColor) ? raw.baseColor : 'marfil';
  return {
    word,
    slots,
    caps,
    baseColor: base,
    active: clamp(Number.parseInt(raw.active, 10) || 0, 0, slots - 1)
  };
}

const FILAMENTOS_POR_DEFECTO = DEFAULT_CYCLE;

function loadStateFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.includes('?') ? new URLSearchParams(window.location.hash.split('?')[1]) : null;
    const name = params.get('n') || params.get('nombre') || hash?.get('n');
    const base = params.get('b') || params.get('base') || hash?.get('b');
    const caps = params.get('c') || params.get('color') || hash?.get('c');
    if (name) {
      const def = createDefault(name);
      if (base && BASE_COLORS.some((entry) => entry.id === base)) def.baseColor = base;
      if (caps && isValidColor(caps)) {
        def.caps.forEach((cap) => { cap.color = caps; });
      }
      return def;
    }
  } catch (error) {
    return null;
  }
  return null;
}

function loadState() {
  const fromUrl = loadStateFromUrl();
  if (fromUrl) return fromUrl;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return sanitizeState(JSON.parse(saved));
  } catch (error) {
    return null;
  }
}

function createPencilState() {
  return {
    params: { ...PENCIL_DEF },
    front: '#f0357e',
    back: '#f3f0e9',
    twoTone: true,
    showPen: true
  };
}

function sanitizePencilState(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const params = { ...PENCIL_DEF };
  if (raw.params && typeof raw.params === 'object') {
    Object.keys(PENCIL_DEF).forEach((key) => {
      if (key in raw.params) params[key] = raw.params[key];
    });
  }
  return {
    params,
    front: HEX_COLOR.test(raw.front || '') ? raw.front : '#f0357e',
    back: HEX_COLOR.test(raw.back || '') ? raw.back : '#f3f0e9',
    twoTone: raw.twoTone !== false,
    showPen: raw.showPen !== false
  };
}

function loadPencilState() {
  try {
    const saved = window.localStorage.getItem(PENCIL_STORAGE_KEY);
    if (!saved) return null;
    return sanitizePencilState(JSON.parse(saved));
  } catch (error) {
    return null;
  }
}

let state = loadState() || createDefault();
let currentFile = null;
let toastTimer = 0;
let saveTimer = 0;

let pencilState = loadPencilState() || createPencilState();
let pencilSaveTimer = 0;
let pencilLast = null; // { p, lay } válido más reciente
let pencilPreview = null;
/* ------------------------------------------------------------------ sonido */

class ClickSound {
  constructor() {
    this.enabled = true;
    this.context = null;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (enabled) this.ensure();
  }

  ensure() {
    if (!this.context) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.context = new Ctx();
    }
    if (this.context.state === 'suspended') this.context.resume().catch(() => {});
    return this.context;
  }

  play(volume = 1) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const now = ctx.currentTime;

    const duration = 0.055;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 2400;
    band.Q.value = 1.1;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.22 * volume;
    noise.connect(band).connect(noiseGain).connect(ctx.destination);
    noise.start(now);

    const body = ctx.createOscillator();
    body.type = 'triangle';
    body.frequency.setValueAtTime(430, now);
    body.frequency.exponentialRampToValueAtTime(165, now + 0.06);
    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.18 * volume, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.09);
    body.connect(bodyGain).connect(ctx.destination);
    body.start(now);
    body.stop(now + 0.1);

    const tick = ctx.createOscillator();
    tick.type = 'square';
    tick.frequency.value = 1900;
    const tickGain = ctx.createGain();
    tickGain.gain.setValueAtTime(0.045 * volume, now);
    tickGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.02);
    tick.connect(tickGain).connect(ctx.destination);
    tick.start(now);
    tick.stop(now + 0.025);
  }
}

const sound = new ClickSound();

/* ------------------------------------------------------------------ toast */

function toast(message, timeout = 3200) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  window.clearTimeout(toastTimer);
  requestAnimationFrame(() => el.classList.add('is-visible'));
  toastTimer = window.setTimeout(() => {
    el.classList.remove('is-visible');
    window.setTimeout(() => { el.hidden = true; }, 260);
  }, timeout);
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
  save: $('#btn-save'),
  dropzone: $('#dropzone'),
  fileInput: $('#file'),
  fileCard: $('#file-card'),
  fileName: $('#file-name'),
  fileSize: $('#file-size'),
  fileRemove: $('#file-remove'),
  form: $('#upload-form'),
  submit: $('#submit-design'),
  // lápices
  pencilWord: $('#pencil-word'),
  pencilWordCount: $('#pencil-word-count'),
  pencilError: $('#pencil-error'),
  pencilFrontColors: $('#pencil-front-colors'),
  pencilBackColors: $('#pencil-back-colors'),
  pencilToneOne: $('#pencil-tone-one'),
  pencilToneTwo: $('#pencil-tone-two'),
  pencilToneHint: $('#pencil-tone-hint'),
  pencilBackWrap: $('#pencil-back-wrap'),
  pencilRanges: $('#pencil-ranges'),
  pencilTube: $('#pencil-tube'),
  pencilSummary: $('#pencil-summary'),
  pencilCanvas: $('#pencil-canvas'),
  pencilLoading: $('#pencil-loading'),
  pencilSend: $('#pencil-send'),
  pencilStl: $('#pencil-stl'),
  pencilSave: $('#pencil-save')
};

function buildSwatches(container, list, onPick) {
  if (!container) return;
  container.setAttribute('role', 'group');
  container.innerHTML = '';
  list.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'swatch' + (item.finish === 'seda' ? ' swatch--silk' : '');
    button.dataset.id = item.id;
    button.style.setProperty('--c', item.hex);
    button.style.setProperty('--swatch-ink', contrastInk(item.hex));
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', item.name);
    button.title = item.name;
    button.innerHTML = '<span class="swatch__check"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12.5 9 17 19 7"/></svg></span>';
    button.addEventListener('click', () => onPick(item.id));
    container.append(button);
  });

  const custom = document.createElement('label');
  custom.className = 'swatch swatch--custom';
  custom.title = 'Elegir otro color';
  custom.innerHTML = '<span class="swatch__plus" aria-hidden="true">+</span><input type="color" value="#FF7A59" aria-label="Elegir otro color">';
  const input = custom.querySelector('input');
  input.addEventListener('input', () => onPick(input.value));
  container.append(custom);
}

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

function snapshotState() {
  return {
    slots: state.slots,
    caps: state.caps.map((cap) => ({ ...cap })),
    baseColor: state.baseColor
  };
}

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
      color: DEFAULT_CYCLE[caps.length % DEFAULT_CYCLE.length],
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

/* --------------------------------------------------------- vista 3D / stage */

const preview = new ClickerPreview(els.canvas, {
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
preview.init();

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
      } catch (e) {
        // Fallback a clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url.toString());
      toast('¡Enlace de tu diseño copiado! Listo para enviar por WhatsApp.');
    } catch (e) {
      prompt('Copia este enlace de tu diseño:', url.toString());
    }
  });

  els.save?.addEventListener('click', async () => {
    const blob = await preview.snapshot();
    if (!blob) {
      toast('No se pudo generar la imagen.');
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const name = (state.word || 'vicunia').toLowerCase().replace(/[^a-z0-9]/g, '') || 'vicunia';
    link.href = url;
    link.download = `vicunia-clicker-${name}.png`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast('Imagen descargada. Mándala por WhatsApp con tu pedido.');
  });
}

/* ---------------------------------------------------------------- catálogo */

function initDesigner() {
  buildSwatches(els.capColors, FILAMENTS, (id) => {
    const cap = state.caps[state.active];
    if (!cap) return;
    cap.color = id;
    paint();
  });

  buildSwatches(els.inkColors, FILAMENTS, (id) => {
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

  buildSwatches(els.baseColors, BASE_COLORS, (id) => {
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
        color: state.caps[index]?.color || DEFAULT_CYCLE[index % DEFAULT_CYCLE.length],
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

  els.send?.addEventListener('click', () => {
    openWhatsApp(designText());
  });
}

/* ------------------------------------------------------------------- subida */

function updateFile(file) {
  if (!file) return;
  const dot = file.name.lastIndexOf('.');
  const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : '';
  if (!ALLOWED_EXT.includes(ext)) {
    toast('Ese formato no lo podemos leer. Usa JPG, PNG, WEBP o HEIC.');
    return;
  }
  if (file.size > MAX_FILE) {
    toast('La foto pasa de 100 MB. Envíala por WhatsApp y la vemos desde ahí.');
    return;
  }
  currentFile = file;
  if (els.fileName) els.fileName.textContent = file.name;
  if (els.fileSize) {
    const mb = file.size / (1024 * 1024);
    els.fileSize.textContent = mb < 0.1
      ? `${Math.max(1, Math.round(file.size / 1024))} KB`
      : `${mb.toFixed(1)} MB`;
  }
  if (els.fileCard) els.fileCard.hidden = false;
}

function clearFile() {
  currentFile = null;
  if (els.fileInput) els.fileInput.value = '';
  if (els.fileCard) els.fileCard.hidden = true;
}

function setError(field, message) {
  const input = $(`#${field}`);
  const holder = $(`[data-error-for="${field}"]`);
  if (holder) {
    holder.textContent = message || '';
    holder.hidden = !message;
  }
  if (input) {
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }
}

function validateForm() {
  let firstInvalid = null;
  const name = $('#name');
  const phone = $('#phone');
  const rights = $('#rights');

  setError('name', '');
  setError('phone', '');
  setError('rights', '');

  if (!name || name.value.trim().length < 2) {
    setError('name', 'Escribe tu nombre para saber con quién hablamos.');
    firstInvalid = firstInvalid || name;
  }

  const digits = (phone?.value || '').replace(/\D/g, '');
  if (digits.length < 6) {
    setError('phone', 'Escribe tu WhatsApp con el código de tu país.');
    firstInvalid = firstInvalid || phone;
  }

  if (!rights?.checked) {
    setError('rights', 'Necesitamos tu confirmación antes de imprimir.');
    firstInvalid = firstInvalid || rights;
  }

  if (firstInvalid) {
    firstInvalid.focus({ preventScroll: false });
    return false;
  }
  return true;
}

function initUpload() {
  const dropzone = els.dropzone;
  if (!dropzone) return;

  dropzone.addEventListener('click', () => els.fileInput?.click());
  dropzone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      els.fileInput?.click();
    }
  });

  ['dragenter', 'dragover'].forEach((type) => {
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      dropzone.classList.add('is-over');
    });
  });

  ['dragleave', 'drop', 'dragend'].forEach((type) => {
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      dropzone.classList.remove('is-over');
    });
  });

  dropzone.addEventListener('drop', (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (file) updateFile(file);
  });

  els.fileInput?.addEventListener('change', () => {
    const file = els.fileInput.files?.[0];
    if (file) updateFile(file);
  });

  els.fileRemove?.addEventListener('click', clearFile);

  els.form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateForm()) {
      toast('Revisa los campos marcados.');
      return;
    }

    const name = $('#name')?.value.trim() || '';
    const phone = $('#phone')?.value.trim() || '';
    const kind = $('#kind')?.value || 'Diseño personalizado';
    const qty = $('#qty')?.value || '1';
    const notes = $('#notes')?.value.trim() || '';
    const fileLine = currentFile
      ? `Foto: ${currentFile.name} (${els.fileSize?.textContent || ''}) — la adjunto en este chat.`
      : 'Todavía no tengo la foto: les cuento la idea y lo vemos.';

    const message = [
      `Hola Vicunia 👋 Soy ${name}.`,
      `Quiero encargar: ${kind} (x${qty}).`,
      fileLine,
      notes ? `Idea: ${notes}` : '',
      `Mi WhatsApp: ${phone}`,
      '',
      '¿Me confirman precio y tiempo de entrega?'
    ].filter(Boolean).join('\n');

    openWhatsApp(message);
    toast('Abrimos WhatsApp con tu pedido. Adjunta tu foto y envíala.');
  });
}

/* -------------------------------------------------------------- lápices */

function markSwatchHex(container, hex) {
  if (!container) return;
  const lower = hex.toLowerCase();
  $$('button.swatch', container).forEach((button) => {
    const active = button.dataset.id && capColor(button.dataset.id).hex.toLowerCase() === lower;
    button.setAttribute('aria-pressed', String(active));
  });
  const custom = $('input[type=color]', container);
  if (custom && custom.value.toLowerCase() !== lower) custom.value = hex;
}

function buildPencilRanges() {
  if (!els.pencilRanges) return;
  els.pencilRanges.innerHTML = '';
  SLIDERS.forEach(([key, label, min, max, step]) => {
    const wrap = document.createElement('div');
    wrap.className = 'range';
    const lab = document.createElement('span');
    lab.className = 'range__label';
    lab.textContent = label;
    const out = document.createElement('output');
    out.className = 'range__output';
    const input = document.createElement('input');
    input.type = 'range';
    input.id = 'pencil-' + key;
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(pencilState.params[key]);
    input.setAttribute('aria-label', label);
    input.addEventListener('input', () => {
      pencilState.params[key] = Number(input.value);
      out.textContent = Number(input.value).toFixed(1);
      pencilSchedule(300);
    });
    out.textContent = Number(pencilState.params[key]).toFixed(1);
    wrap.append(lab, out, input);
    els.pencilRanges.append(wrap);
  });
}

let pencilTimer = 0;

function pencilSchedule(delay = 220) {
  window.clearTimeout(pencilTimer);
  pencilTimer = window.setTimeout(pencilRun, delay);
}

function pencilRun() {
  const params = {
    ...pencilState.params,
    nombre: els.pencilWord?.value || '',
    refuerzo: els.pencilTube?.checked || false
  };
  let p;
  let lay;
  try {
    p = engine.validar(params);
    lay = engine.layout(p);
  } catch (error) {
    if (els.pencilError) {
      els.pencilError.hidden = false;
      els.pencilError.textContent = error.message;
    }
    return;
  }
  if (els.pencilError) { els.pencilError.hidden = true; els.pencilError.textContent = ''; }

  pencilLast = { p, lay };
  pencilState.params.nombre = p.nombre;
  pencilState.params.refuerzo = p.refuerzo;

  const y0 = Math.min(...lay.items.map((i) => i.miny));
  const y1 = Math.max(...lay.items.map((i) => i.maxy));
  let lo = y0;
  let hi = y1;
  if (p.refuerzo) {
    const r = p.agujero / 2 + p.pared;
    lo = Math.min(lo, -r);
    hi = Math.max(hi, r);
  }
  const zmax = Math.max(...lay.items.map((i) => i.z));

  if (els.pencilSummary) {
    els.pencilSummary.textContent = p.nombre + ' · ' + lay.length.toFixed(1) + ' × ' + (hi - lo).toFixed(1) + ' × ' + zmax.toFixed(1) + ' mm';
  }
  if (els.pencilWordCount) els.pencilWordCount.textContent = p.nombre.length + '/24';

  pencilPreview?.setState({ p, lay, frontColor: pencilState.front, backColor: pencilState.twoTone ? pencilState.back : pencilState.front, showPen: pencilState.showPen });
  queuePencilSave();
}

function queuePencilSave() {
  window.clearTimeout(pencilSaveTimer);
  pencilSaveTimer = window.setTimeout(() => {
    try {
      window.localStorage.setItem(PENCIL_STORAGE_KEY, JSON.stringify(pencilState));
    } catch (error) {
      /* almacenamiento lleno o bloqueado */
    }
  }, 350);
}

function pencilText() {
  const { p, lay } = pencilLast || {};
  if (!p || !lay) return 'Hola Vicunia 👋 Quiero un nombre para lápiz.';
  const y0 = Math.min(...lay.items.map((i) => i.miny));
  const y1 = Math.max(...lay.items.map((i) => i.maxy));
  let lo = y0;
  let hi = y1;
  if (p.refuerzo) {
    const r = p.agujero / 2 + p.pared;
    lo = Math.min(lo, -r);
    hi = Math.max(hi, r);
  }
  const zmax = Math.max(...lay.items.map((i) => i.z));
  return [
    'Hola Vicunia 👋 Quiero este nombre para lápiz:',
    '',
    '• Nombre: ' + p.nombre,
    '• Medidas: ' + lay.length.toFixed(1) + ' × ' + (hi - lo).toFixed(1) + ' × ' + zmax.toFixed(1) + ' mm',
    '• Altura: ' + p.altura + ' mm · Espesor: ' + p.espesor + ' mm · Relieve: ' + p.relieve + ' mm',
    '• Agujero: ' + p.agujero + ' mm · Solape: ' + p.solape + ' mm',
    pencilState.twoTone
      ? '• Colores: adelante ' + pencilState.front + ' · atrás ' + pencilState.back
      : '• Color: ' + pencilState.front + ' (un solo color)',
    p.refuerzo ? '• Con tubo de unión (una sola pieza)' : '• Sin tubo de unión',
    '',
    'Lo armé en su web. ¿Me confirman precio, colores y tiempo de entrega?'
  ].join('\n');
}

function pencilSTL() {
  const { p, lay } = pencilLast || {};
  if (!p || !lay) { toast('Espera a que se genere el nombre.'); return; }
  const btn = els.pencilStl;
  btn.disabled = true;
  window.setTimeout(() => {
    try {
      const m = engine.cuerpo(p, lay);
      const st = engine.stats(m);
      if (!(st.vol > 0)) throw new Error('La malla no es un volumen válido.');
      const buffer = engine.stlBinario(m);
      const slug = p.nombre.normalize('NFKD').replace(/[^\x00-\x7F]/g, '').replace(/[^A-Z0-9_-]/g, '_') || 'NOMBRE';
      const blob = new Blob([buffer], { type: 'model/stl' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = slug + '.stl';
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast('STL listo: ' + st.ext.map((v) => v.toFixed(1)).join(' × ') + ' mm. Ábrelo en Bambu Studio.');
    } catch (error) {
      toast('No se pudo generar el STL: ' + (error.message || error));
    }
    btn.disabled = false;
  }, 30);
}

function initPencil() {
  buildSwatches(els.pencilFrontColors, FILAMENTS, (id) => {
    pencilState.front = capColor(id).hex;
    paintPencil();
    pencilRun();
  });
  buildSwatches(els.pencilBackColors, FILAMENTS, (id) => {
    pencilState.back = capColor(id).hex;
    paintPencil();
    pencilRun();
  });

  els.pencilToneOne?.addEventListener('click', () => {
    pencilState.twoTone = false;
    paintPencil();
    pencilRun();
  });
  els.pencilToneTwo?.addEventListener('click', () => {
    pencilState.twoTone = true;
    paintPencil();
    pencilRun();
  });

  buildPencilRanges();

  els.pencilWord?.addEventListener('input', () => {
    pencilState.params.nombre = els.pencilWord.value;
    pencilSchedule(250);
  });

  els.pencilTube?.addEventListener('change', () => {
    pencilState.params.refuerzo = els.pencilTube.checked;
    pencilSchedule(30);
  });

  els.pencilSend?.addEventListener('click', () => {
    if (!pencilLast) {
      toast('Escribe primero un nombre.');
      els.pencilWord?.focus();
      return;
    }
    openWhatsApp(pencilText());
  });

  els.pencilStl?.addEventListener('click', pencilSTL);

  els.pencilSave?.addEventListener('click', async () => {
    const blob = await pencilPreview?.snapshot();
    if (!blob) { toast('No se pudo generar la imagen.'); return; }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const name = (pencilLast?.p?.nombre || 'vicunia').toLowerCase().replace(/[^a-z0-9]/g, '') || 'vicunia';
    link.href = url;
    link.download = 'vicunia-lapiz-' + name + '.png';
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast('Imagen descargada. Mándala por WhatsApp con tu pedido.');
  });

  pencilPreview = new PencilPreview(els.pencilCanvas, {
    onReady: () => {
      els.pencilLoading?.classList.add('is-hidden');
      els.pencilCanvas?.setAttribute('aria-busy', 'false');
      pencilRun();
    },
    onBusy: (busy) => {
      els.pencilLoading?.classList.toggle('is-hidden', !busy);
    },
    onError: () => {
      if (els.pencilLoading) {
        els.pencilLoading.innerHTML = '<div style="max-width:280px;text-align:center;padding:1rem"><strong>No pudimos abrir la vista 3D</strong><p class="hint" style="margin-top:.4rem">Tu navegador no tiene WebGL activo. Igual puedes descargar el STL.</p></div>';
      }
      els.pencilCanvas.style.display = 'none';
    }
  });

  paintPencil();
  pencilRun();
  pencilPreview.init();
}

function paintPencil() {
  markSwatchHex(els.pencilFrontColors, pencilState.front);
  markSwatchHex(els.pencilBackColors, pencilState.back);

  $$('i[data-tone-dot]').forEach((dot) => {
    dot.style.background = dot.dataset.toneDot === 'back' ? pencilState.back : pencilState.front;
  });

  const two = pencilState.twoTone;
  if (els.pencilToneOne) els.pencilToneOne.setAttribute('aria-pressed', String(!two));
  if (els.pencilToneTwo) els.pencilToneTwo.setAttribute('aria-pressed', String(two));
  if (els.pencilBackWrap) els.pencilBackWrap.hidden = !two;
  if (els.pencilToneHint) els.pencilToneHint.textContent = two
    ? 'La cara que se lee va de un color y todo lo demás de otro.'
    : 'Todo el nombre del mismo color.';
}

/* ---------------------------------------------------------------- lightbox */

function initLightbox() {
  const dialog = $('#lightbox');
  const image = $('#lightbox-img');
  const caption = $('#lightbox-caption');
  const close = $('#lightbox-close');
  if (!dialog || !image) return;

  $$('.gallery__item').forEach((button) => {
    button.addEventListener('click', () => {
      const full = button.dataset.full;
      const thumb = button.querySelector('img');
      image.src = full || thumb?.src || '';
      image.alt = thumb?.alt || '';
      if (caption) caption.textContent = button.dataset.caption || '';
      dialog.showModal();
    });
  });

  close?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}

/* -------------------------------------------------------------------- init */

function init() {
  initSite();
  initDesigner();
  initPencil();
  initStageControls();
  initUpload();
  initLightbox();

  paint();
  preview.select(state.active);

  els.wordHint?.setAttribute('data-base', CONFIG.ciudad);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
