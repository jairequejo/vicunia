/**
 * Diseñador del nombre para lápiz en la ficha de producto: el motor real de
 * letras (JSCAD) con la vista 3D, un color o dos y las medidas ajustables.
 */
import { PencilPreview } from './pencil.js';
import { engine, SLIDERS, PENCIL_DEF } from './pencil-geo.js';
import { FILAMENTS } from './palette.js';
import { crearSwatches, nombreColor } from './disenador-utils.js';

const $ = (sel, root = document) => root.querySelector(sel);

export function crearDisenadorLapiz({ mount, vista, onChange }) {
  const estado = {
    params: { ...PENCIL_DEF },
    front: '#f0357e',
    back: '#f3f0e9',
    twoTone: true,
    showPen: true,
    nombre: 'KAREN',
    medidas: ''
  };

  mount.innerHTML = `
    <section class="arm-step">
      <h3 class="arm-step__title"><span class="arm-step__num">1</span> Tu nombre</h3>
      <div class="field">
        <label for="ficha-pencil-word">Nombre</label>
        <input class="input input--word" id="ficha-pencil-word" type="text" value="KAREN" maxlength="24" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Ej. KAREN">
        <p class="hint"><span class="counter" id="ficha-pencil-count">0/24</span> · hasta 24 caracteres: letras, espacios, guion, tildes y Ñ.</p>
      </div>
    </section>

    <section class="arm-step">
      <h3 class="arm-step__title"><span class="arm-step__num">2</span> Colores</h3>
      <div class="tone-toggle" id="ficha-tone" role="group" aria-label="Cantidad de colores">
        <button class="tone" id="ficha-tone-one" type="button" aria-pressed="false">
          <span class="tone__dots" aria-hidden="true"><i data-tone-dot="front"></i></span>
          Un color
        </button>
        <button class="tone" id="ficha-tone-two" type="button" aria-pressed="true">
          <span class="tone__dots" aria-hidden="true"><i data-tone-dot="front"></i><i data-tone-dot="back"></i></span>
          Dos colores
        </button>
      </div>
      <div class="pencil-colors">
        <div class="pencil-color" id="ficha-front-wrap">
          <div class="field__head"><span class="field__label">Parte de adelante</span></div>
          <div class="swatches" id="ficha-front-colors" role="group" aria-label="Color de la parte de adelante"></div>
        </div>
        <div class="pencil-color" id="ficha-back-wrap">
          <div class="field__head"><span class="field__label">Parte de atrás</span></div>
          <div class="swatches" id="ficha-back-colors" role="group" aria-label="Color de la parte de atrás"></div>
        </div>
      </div>
      <p class="hint">La cara que se lee va de un color y todo lo demás de otro.</p>
    </section>

    <details class="adv">
      <summary>Medidas avanzadas</summary>
      <div class="ranges" id="ficha-ranges"></div>
      <label class="check" for="ficha-tube">
        <input type="checkbox" id="ficha-tube">
        <span>Con tubo de refuerzo (para lápices finos)</span>
      </label>
    </details>`;

  vista.innerHTML = `
    <div class="stage" id="arm-stage">
      <canvas id="ficha-pencil-canvas" aria-label="Vista 3D de tu nombre para lápiz"></canvas>
      <div class="stage__loading" id="ficha-loading"><span>Cargando el motor de letras…</span></div>
      <span class="chip" id="ficha-summary" aria-live="polite"></span>
    </div>
    <p class="hint">Gira la pieza con el dedo. La geometría es la misma que usamos para imprimir.</p>`;

  crearSwatches($('#ficha-front-colors', mount), FILAMENTS, (id) => {
    estado.front = id;
    correr();
  }, { sufijo: ' de adelante' });

  crearSwatches($('#ficha-back-colors', mount), FILAMENTS, (id) => {
    estado.back = id;
    correr();
  }, { sufijo: ' de atrás' });

  const tonoUno = $('#ficha-tone-one', mount);
  const tonoDos = $('#ficha-tone-two', mount);
  tonoUno.addEventListener('click', () => {
    estado.twoTone = false;
    correr();
  });
  tonoDos.addEventListener('click', () => {
    estado.twoTone = true;
    correr();
  });

  function pintarTono() {
    tonoUno.setAttribute('aria-pressed', String(!estado.twoTone));
    tonoDos.setAttribute('aria-pressed', String(estado.twoTone));
    tonoUno.classList.toggle('is-active', !estado.twoTone);
    tonoDos.classList.toggle('is-active', estado.twoTone);
    $('#ficha-back-wrap', mount).hidden = !estado.twoTone;
  }

  const rangos = $('#ficha-ranges', mount);
  SLIDERS.forEach(([key, label, min, max, step]) => {
    const wrap = document.createElement('div');
    wrap.className = 'range';
    const lab = document.createElement('span');
    lab.className = 'range__label';
    lab.textContent = label;
    const out = document.createElement('output');
    out.className = 'range__output';
    out.textContent = Number(estado.params[key]).toFixed(1);
    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(estado.params[key]);
    input.setAttribute('aria-label', label);
    input.addEventListener('input', () => {
      estado.params[key] = Number(input.value);
      out.textContent = Number(input.value).toFixed(1);
      correr();
    });
    wrap.append(lab, out, input);
    rangos.append(wrap);
  });

  $('#ficha-tube', mount).addEventListener('change', (event) => {
    estado.params.refuerzo = event.target.checked;
    correr();
  });

  $('#ficha-pencil-word', mount).addEventListener('input', (event) => {
    estado.nombre = event.target.value;
    correr();
  });

  const preview = new PencilPreview($('#ficha-pencil-canvas', vista), {
    onReady: () => {
      $('#ficha-loading', vista)?.classList.add('is-hidden');
      correr();
    },
    onError: () => {
      const carga = $('#ficha-loading', vista);
      if (carga) carga.textContent = 'La vista 3D no está disponible en este equipo; puedes igual escribir tu diseño.';
    }
  });
  preview.init();

  function correr() {
    $('#ficha-pencil-word', mount).value = estado.nombre;
    $('#ficha-pencil-count', mount).textContent = `${estado.nombre.length}/24`;
    pintarTono();

    let p;
    let lay;
    try {
      p = engine.validar({ ...estado.params, nombre: estado.nombre, refuerzo: $('#ficha-tube', mount).checked });
      lay = engine.layout(p);
    } catch (error) {
      return;
    }
    estado.params = { ...p };
    estado.medidas = `${lay.length.toFixed(1)} × ${Number(p.espesor).toFixed(1)} × ${Number(p.agujero).toFixed(1)} mm`;

    const resumen = $('#ficha-summary', vista);
    if (resumen) resumen.textContent = `${estado.nombre || 'Sin nombre'} · ${estado.medidas}`;

    preview?.setState({
      p,
      lay,
      frontColor: estado.front,
      backColor: estado.twoTone ? estado.back : estado.front,
      showPen: estado.showPen
    });
    if (onChange) onChange();
  }

  pintarTono();
  correr();

  const color = (hex) => FILAMENTS.find((f) => f.hex.toLowerCase() === String(hex).toLowerCase())?.name || 'Color propio';

  return {
    estado,
    pasos: 2,
    filasResumen: () => [
      ['Nombre', estado.nombre || 'Sin nombre'],
      ['Colores', estado.twoTone ? `adelante ${color(estado.front)} / atrás ${color(estado.back)}` : color(estado.front)],
      ['Medidas', estado.medidas || 'A medir'],
      ['Refuerzo', estado.params.refuerzo ? 'Con tubo' : 'Sin tubo']
    ],
    mensajeLineas: () => [
      `Nombre: ${estado.nombre || 'sin nombre'}`,
      `Colores: ${estado.twoTone ? `adelante ${color(estado.front)} / atrás ${color(estado.back)}` : color(estado.front)}`,
      `Medidas: ${estado.medidas || 'a confirmar'}`,
      `Refuerzo: ${estado.params.refuerzo ? 'con tubo' : 'sin tubo'}`
    ]
  };
}

export { nombreColor };
