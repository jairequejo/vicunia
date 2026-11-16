/**
 * Editor del nombre para lápiz de la portada.
 *
 * Usa el motor real de letras (JSCAD), permite uno o dos colores y medidas
 * avanzadas, muestra la pieza en 3D y prepara el pedido de WhatsApp. También
 * descarga el STL listo para laminar.
 */
import { PencilPreview } from '../pencil.js';
import { engine, SLIDERS, PENCIL_DEF } from '../pencil-geo.js';
import { FILAMENTS, capColor } from '../palette.js';
import { openWhatsApp } from '../config.js';
import { $, $$ } from '../dom.js';
import { crearSwatches, marcarHex } from '../muestras.js';
import { descargar, slug, toast } from './comun.js';

/* -------------------------------------------------------------- constantes */

const STORAGE_KEY = 'vicunia.pencil.v2';
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/* ----------------------------------------------------------------- estado */

/** Estado inicial del lápiz. */
function crearEstado() {
  return {
    params: { ...PENCIL_DEF },
    front: '#f0357e',
    back: '#f3f0e9',
    twoTone: true,
    showPen: true
  };
}

/** Comprueba y corrige un estado guardado. */
function sanearEstado(raw) {
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

/** Estado guardado en este navegador, si lo hay. */
function cargarEstado() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? sanearEstado(JSON.parse(saved)) : null;
  } catch (error) {
    return null;
  }
}

/* --------------------------------------------------------------- controles */

const els = {
  word: $('#pencil-word'),
  wordCount: $('#pencil-word-count'),
  error: $('#pencil-error'),
  frontColors: $('#pencil-front-colors'),
  backColors: $('#pencil-back-colors'),
  toneOne: $('#pencil-tone-one'),
  toneTwo: $('#pencil-tone-two'),
  toneHint: $('#pencil-tone-hint'),
  backWrap: $('#pencil-back-wrap'),
  ranges: $('#pencil-ranges'),
  tube: $('#pencil-tube'),
  summary: $('#pencil-summary'),
  canvas: $('#pencil-canvas'),
  loading: $('#pencil-loading'),
  send: $('#pencil-send'),
  stl: $('#pencil-stl'),
  save: $('#pencil-save')
};

const state = cargarEstado() || crearEstado();
let preview = null;
let last = null; // { p, lay } válido más reciente
let saveTimer = 0;
let runTimer = 0;

/* -------------------------------------------------------------- pintado */

/** Crea los seis controles de medida. */
function buildRanges() {
  if (!els.ranges) return;

  els.ranges.innerHTML = '';
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
    input.value = String(state.params[key]);
    input.setAttribute('aria-label', label);
    input.addEventListener('input', () => {
      state.params[key] = Number(input.value);
      out.textContent = Number(input.value).toFixed(1);
      schedule(300);
    });

    out.textContent = Number(state.params[key]).toFixed(1);
    wrap.append(lab, out, input);
    els.ranges.append(wrap);
  });
}

/** Programa la regeneración del nombre (evita recalcular en cada tecla). */
function schedule(delay = 220) {
  window.clearTimeout(runTimer);
  runTimer = window.setTimeout(run, delay);
}

/** Genera el nombre con el motor real y actualiza el visor y el resumen. */
function run() {
  const params = {
    ...state.params,
    nombre: els.word?.value || '',
    refuerzo: els.tube?.checked || false
  };

  let p;
  let lay;
  try {
    p = engine.validar(params);
    lay = engine.layout(p);
  } catch (error) {
    if (els.error) {
      els.error.hidden = false;
      els.error.textContent = error.message;
    }
    return;
  }

  if (els.error) {
    els.error.hidden = true;
    els.error.textContent = '';
  }

  last = { p, lay };
  state.params.nombre = p.nombre;
  state.params.refuerzo = p.refuerzo;

  const y0 = Math.min(...lay.items.map((item) => item.miny));
  const y1 = Math.max(...lay.items.map((item) => item.maxy));
  let lo = y0;
  let hi = y1;
  if (p.refuerzo) {
    const r = p.agujero / 2 + p.pared;
    lo = Math.min(lo, -r);
    hi = Math.max(hi, r);
  }
  const zmax = Math.max(...lay.items.map((item) => item.z));

  if (els.summary) {
    els.summary.textContent = p.nombre + ' · ' + lay.length.toFixed(1) + ' × ' + (hi - lo).toFixed(1) + ' × ' + zmax.toFixed(1) + ' mm';
  }
  if (els.wordCount) els.wordCount.textContent = p.nombre.length + '/24';

  preview?.setState({
    p,
    lay,
    frontColor: state.front,
    backColor: state.twoTone ? state.back : state.front,
    showPen: state.showPen
  });
  queueSave();
}

/** Guarda el estado con un pequeño retraso. */
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

/** Pinta los dos colores, el modo de color y el texto de ayuda. */
function paint() {
  marcarHex(els.frontColors, state.front);
  marcarHex(els.backColors, state.back);

  $$('i[data-tone-dot]').forEach((dot) => {
    dot.style.background = dot.dataset.toneDot === 'back' ? state.back : state.front;
  });

  const two = state.twoTone;
  if (els.toneOne) els.toneOne.setAttribute('aria-pressed', String(!two));
  if (els.toneTwo) els.toneTwo.setAttribute('aria-pressed', String(two));
  if (els.backWrap) els.backWrap.hidden = !two;
  if (els.toneHint) {
    els.toneHint.textContent = two
      ? 'La cara que se lee va de un color y todo lo demás de otro.'
      : 'Todo el nombre del mismo color.';
  }
}

/** Borrador del pedido para WhatsApp. */
function text() {
  const { p, lay } = last || {};
  if (!p || !lay) return 'Hola Vicunia 👋 Quiero un nombre para lápiz.';

  const y0 = Math.min(...lay.items.map((item) => item.miny));
  const y1 = Math.max(...lay.items.map((item) => item.maxy));
  let lo = y0;
  let hi = y1;
  if (p.refuerzo) {
    const r = p.agujero / 2 + p.pared;
    lo = Math.min(lo, -r);
    hi = Math.max(hi, r);
  }
  const zmax = Math.max(...lay.items.map((item) => item.z));

  return [
    'Hola Vicunia 👋 Quiero este nombre para lápiz:',
    '',
    '• Nombre: ' + p.nombre,
    '• Medidas: ' + lay.length.toFixed(1) + ' × ' + (hi - lo).toFixed(1) + ' × ' + zmax.toFixed(1) + ' mm',
    '• Altura: ' + p.altura + ' mm · Espesor: ' + p.espesor + ' mm · Relieve: ' + p.relieve + ' mm',
    '• Agujero: ' + p.agujero + ' mm · Solape: ' + p.solape + ' mm',
    state.twoTone
      ? '• Colores: adelante ' + state.front + ' · atrás ' + state.back
      : '• Color: ' + state.front + ' (un solo color)',
    p.refuerzo ? '• Con tubo de unión (una sola pieza)' : '• Sin tubo de unión',
    '',
    'Lo armé en su web. ¿Me confirman precio, colores y tiempo de entrega?'
  ].join('\n');
}

/** Genera y descarga el STL del nombre. */
function exportSTL() {
  const { p, lay } = last || {};
  if (!p || !lay) {
    toast('Espera a que se genere el nombre.');
    return;
  }

  const btn = els.stl;
  btn.disabled = true;

  window.setTimeout(() => {
    try {
      const m = engine.cuerpo(p, lay);
      const st = engine.stats(m);
      if (!(st.vol > 0)) throw new Error('La malla no es un volumen válido.');
      const buffer = engine.stlBinario(m);
      const name = p.nombre.normalize('NFKD').replace(/[^\x00-\x7F]/g, '').replace(/[^A-Z0-9_-]/g, '_') || 'NOMBRE';
      descargar(new Blob([buffer], { type: 'model/stl' }), name + '.stl');
      toast('STL listo: ' + st.ext.map((v) => v.toFixed(1)).join(' × ') + ' mm. Ábrelo en Bambu Studio.');
    } catch (error) {
      toast('No se pudo generar el STL: ' + (error.message || error));
    }
    btn.disabled = false;
  }, 30);
}

/* ------------------------------------------------------------- arranque */

/** Monta el editor del lápiz y lo deja listo para usar. */
export function initPencil() {
  crearSwatches(els.frontColors, FILAMENTS, (id) => {
    state.front = capColor(id).hex;
    paint();
    run();
  });

  crearSwatches(els.backColors, FILAMENTS, (id) => {
    state.back = capColor(id).hex;
    paint();
    run();
  });

  els.toneOne?.addEventListener('click', () => {
    state.twoTone = false;
    paint();
    run();
  });
  els.toneTwo?.addEventListener('click', () => {
    state.twoTone = true;
    paint();
    run();
  });

  buildRanges();

  els.word?.addEventListener('input', () => {
    state.params.nombre = els.word.value;
    schedule(250);
  });

  els.tube?.addEventListener('change', () => {
    state.params.refuerzo = els.tube.checked;
    schedule(30);
  });

  els.send?.addEventListener('click', () => {
    if (!last) {
      toast('Escribe primero un nombre.');
      els.word?.focus();
      return;
    }
    openWhatsApp(text());
  });

  els.stl?.addEventListener('click', exportSTL);

  els.save?.addEventListener('click', async () => {
    const blob = await preview?.snapshot();
    if (!blob) {
      toast('No se pudo generar la imagen.');
      return;
    }
    descargar(blob, 'vicunia-lapiz-' + slug(last?.p?.nombre) + '.png');
    toast('Imagen descargada. Mándala por WhatsApp con tu pedido.');
  });

  preview = new PencilPreview(els.canvas, {
    onReady: () => {
      els.loading?.classList.add('is-hidden');
      els.canvas?.setAttribute('aria-busy', 'false');
      run();
    },
    onBusy: (busy) => {
      els.loading?.classList.toggle('is-hidden', !busy);
    },
    onError: () => {
      if (els.loading) {
        els.loading.innerHTML = '<div style="max-width:280px;text-align:center;padding:1rem"><strong>No pudimos abrir la vista 3D</strong><p class="hint" style="margin-top:.4rem">Tu navegador no tiene WebGL activo. Igual puedes descargar el STL.</p></div>';
      }
      els.canvas.style.display = 'none';
    }
  });

  paint();
  run();
  preview.init();
}
