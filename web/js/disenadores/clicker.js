/**
 * Diseñador del clicker: la misma lógica 3D de la portada (malla real de
 * producción), pero dentro de la ficha de producto.
 *
 * Pasos: 1) tu palabra · 2) tecla seleccionada · 3) color del cuerpo.
 */
import { ClickerPreview } from '../clicker3d.js';
import {
  FILAMENTS,
  BASE_COLORS,
  SYMBOLS,
  capColor,
  baseColor,
  inkFor,
  normalizeWord,
  normalizeChar
} from '../palette.js';
import { $, $$ } from '../dom.js';
import { crearSwatches, marcar, nombreColor } from '../muestras.js';

/** Colores con los que se van turnando las teclas por defecto. */
const CICLO = ['rosado', 'azul', 'mango', 'verde', 'lavanda', 'naranja', 'azul-hielo', 'rojo', 'turquesa', 'seda'];

/**
 * @param {object} opciones
 * @param {HTMLElement} opciones.mount   panel de pasos
 * @param {HTMLElement} opciones.vista   escenario con el visor 3D
 * @param {() => void} [opciones.onChange]
 */
export function crearDisenadorClicker({ mount, vista, onChange }) {
  const estado = {
    word: 'VICUNIA',
    slots: 7,
    caps: [],
    baseColor: 'marfil',
    active: 0
  };

  /** Reparte las letras del nombre entre las teclas y conserva los colores. */
  function crearCaps(word, slots, previos = []) {
    const letras = normalizeWord(word).slice(0, 10);
    return Array.from({ length: slots }, (_, indice) => ({
      char: letras[indice] || '',
      symbol: null,
      color: previos[indice]?.color || CICLO[indice % CICLO.length],
      ink: previos[indice]?.ink ?? null
    }));
  }

  estado.caps = crearCaps(estado.word, estado.slots);

  mount.innerHTML = `
    <section class="arm-step">
      <h3 class="arm-step__title"><span class="arm-step__num">1</span> Tu palabra</h3>
      <div class="field">
        <label for="ficha-word">Nombre o palabra</label>
        <input class="input input--word" id="ficha-word" type="text" maxlength="10" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Ej. TUYO">
        <p class="hint"><span class="counter" id="ficha-word-count">0/10</span> · hasta 10 letras.</p>
      </div>
      <div class="field">
        <div class="field__head"><span class="field__label">Número de teclas</span></div>
        <div class="segmented" id="ficha-slots-control" role="group" aria-label="Número de teclas"></div>
      </div>
      <div class="field">
        <div class="field__head"><span class="field__label">Toca una tecla para editarla</span></div>
        <div class="slot-strip" id="ficha-slot-strip"></div>
      </div>
    </section>

    <section class="arm-step">
      <h3 class="arm-step__title"><span class="arm-step__num">2</span> Tecla seleccionada</h3>
      <div class="editor" id="ficha-editor">
        <div class="editor__head">
          <strong>Letra o símbolo</strong>
          <span class="editor__badge" id="ficha-badge">Tecla 1</span>
        </div>
        <div class="editor__char">
          <label for="ficha-char">Letra</label>
          <input class="input input--char" id="ficha-char" type="text" maxlength="1" autocomplete="off">
        </div>
        <div class="field">
          <div class="field__head"><span class="field__label">Símbolo</span></div>
          <div class="symbol-grid" id="ficha-symbols" role="group" aria-label="Símbolo de la tecla"></div>
        </div>
        <div class="field">
          <div class="field__head"><span class="field__label">Color de la tecla</span></div>
          <div class="swatches" id="ficha-cap-colors" role="group" aria-label="Color de la tecla"></div>
        </div>
        <div class="field">
          <div class="field__head"><span class="field__label">Color de la letra</span></div>
          <div class="swatches swatches--ink" id="ficha-ink-colors" role="group" aria-label="Color de la letra"></div>
          <button class="link-btn" id="ficha-ink-auto" type="button">Automático</button>
        </div>
      </div>
    </section>

    <section class="arm-step">
      <h3 class="arm-step__title"><span class="arm-step__num">3</span> Color del cuerpo</h3>
      <div class="swatches swatches--base" id="ficha-base-colors" role="group" aria-label="Color del cuerpo"></div>
    </section>`;

  vista.innerHTML = `
    <div class="stage stage--visor" id="arm-stage">
      <canvas id="ficha-clicker-canvas" aria-label="Vista 3D de tu clicker con tu nombre"></canvas>
      <div class="stage__loading" id="ficha-loading"><span>Cargando la malla real…</span></div>
      <span class="chip" id="ficha-summary" aria-live="polite"></span>
    </div>
    <p class="hint">Gira el modelo con el dedo. Es la misma pieza que vamos a imprimir.</p>`;

  /* --------------------------------------------------------- controles */

  const controlTeclas = $('#ficha-slots-control', mount);
  for (let total = 2; total <= 10; total += 1) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'seg';
    boton.textContent = String(total);
    boton.setAttribute('aria-label', `${total} teclas`);
    boton.addEventListener('click', () => {
      estado.slots = total;
      estado.caps = crearCaps(estado.word, total, estado.caps);
      estado.active = Math.min(estado.active, total - 1);
      pintar();
    });
    controlTeclas.append(boton);
  }

  const tira = $('#ficha-slot-strip', mount);
  tira.setAttribute('role', 'group');

  const simbolos = $('#ficha-symbols', mount);
  const sinSimbolo = document.createElement('button');
  sinSimbolo.type = 'button';
  sinSimbolo.className = 'sym sym--none';
  sinSimbolo.textContent = 'ABC';
  sinSimbolo.setAttribute('aria-label', 'Sin símbolo');
  sinSimbolo.addEventListener('click', () => {
    estado.caps[estado.active].symbol = null;
    pintar();
  });
  simbolos.append(sinSimbolo);

  SYMBOLS.forEach((simbolo) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'sym';
    boton.dataset.symbol = simbolo.id;
    boton.setAttribute('aria-label', simbolo.name);
    boton.title = simbolo.name;
    boton.innerHTML = `<svg aria-hidden="true"><use href="#i-${simbolo.id === 'moon' ? 'moon-sym' : simbolo.id}"></use></svg>`;
    boton.addEventListener('click', () => {
      estado.caps[estado.active].symbol = simbolo.id;
      estado.caps[estado.active].char = '';
      pintar();
    });
    simbolos.append(boton);
  });

  crearSwatches($('#ficha-cap-colors', mount), FILAMENTS, (id) => {
    estado.caps[estado.active].color = id;
    pintar();
  }, { sufijo: ' de la tecla' });

  crearSwatches($('#ficha-ink-colors', mount), FILAMENTS, (id) => {
    estado.caps[estado.active].ink = id;
    pintar();
  }, { sufijo: ' de la letra' });

  crearSwatches($('#ficha-base-colors', mount), BASE_COLORS, (id) => {
    estado.baseColor = id;
    pintar();
  }, { sufijo: ' del cuerpo' });

  $('#ficha-ink-auto', mount).addEventListener('click', () => {
    estado.caps[estado.active].ink = null;
    pintar();
  });

  $('#ficha-word', mount).addEventListener('input', (event) => {
    estado.word = event.target.value.toUpperCase();
    estado.caps = crearCaps(estado.word, estado.slots, estado.caps);
    pintar();
  });

  $('#ficha-char', mount).addEventListener('input', (event) => {
    estado.caps[estado.active].char = normalizeChar(event.target.value);
    estado.caps[estado.active].symbol = null;
    pintar();
  });

  /* ------------------------------------------------------------ pintado */

  function pintar() {
    $('#ficha-word', mount).value = estado.word;
    $('#ficha-word-count', mount).textContent = `${estado.word.length}/10`;

    $$('.seg', controlTeclas).forEach((boton) => {
      const activo = Number(boton.textContent) === estado.slots;
      boton.classList.toggle('is-active', activo);
      boton.setAttribute('aria-pressed', String(activo));
    });

    pintarTira();
    pintarTeclaActiva();

    const resumen = $('#ficha-summary', vista);
    if (resumen) {
      resumen.textContent = `${estado.word || 'Sin nombre'} · ${estado.slots} teclas · cuerpo ${baseColor(estado.baseColor).name}`;
    }

    preview?.setState({ slots: estado.slots, caps: estado.caps, baseColor: estado.baseColor });
    if (onChange) onChange();
  }

  function pintarTira() {
    if (tira.children.length !== estado.slots) {
      tira.innerHTML = '';
      estado.caps.forEach((_, indice) => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'slot';
        boton.innerHTML = '<span class="slot__cap" aria-hidden="true"><span class="slot__glyph"></span></span><span class="slot__num" aria-hidden="true" data-num="' + (indice + 1) + '"></span>';
        boton.addEventListener('click', () => {
          estado.active = indice;
          pintar();
        });
        tira.append(boton);
      });
    }

    Array.from(tira.children).forEach((boton, indice) => {
      const cap = estado.caps[indice];
      if (!cap) return;
      const color = capColor(cap.color);
      const activo = indice === estado.active;
      boton.classList.toggle('is-active', activo);
      boton.setAttribute('aria-pressed', String(activo));
      boton.style.setProperty('--slot-bg', color.hex);
      boton.style.setProperty('--slot-ink', inkFor(color.hex));
      boton.setAttribute('aria-label', `Tecla ${indice + 1}: ${cap.symbol || cap.char || 'en blanco'}, ${color.name}`);

      const glifo = boton.querySelector('.slot__glyph');
      if (!glifo) return;
      if (cap.symbol) {
        glifo.innerHTML = `<svg aria-hidden="true"><use href="#i-${cap.symbol === 'moon' ? 'moon-sym' : cap.symbol}"></use></svg>`;
      } else {
        glifo.textContent = cap.char || '·';
      }
    });
  }

  function pintarTeclaActiva() {
    const cap = estado.caps[estado.active] || estado.caps[0];
    $('#ficha-badge', mount).textContent = `Tecla ${estado.active + 1}`;
    if (cap) $('#ficha-char', mount).value = cap.char || '';

    $$('[data-symbol]', simbolos).forEach((boton) => {
      const activo = (cap?.symbol || '') === boton.dataset.symbol;
      boton.classList.toggle('is-active', activo);
      boton.setAttribute('aria-pressed', String(activo));
    });

    marcar($('#ficha-cap-colors', mount), cap?.color);
    marcar($('#ficha-ink-colors', mount), cap?.ink);
    $('#ficha-ink-auto', mount).setAttribute('aria-pressed', String(!cap?.ink));
    marcar($('#ficha-base-colors', mount), estado.baseColor);
  }

  /* ------------------------------------------------------------- visor 3D */

  const preview = new ClickerPreview($('#ficha-clicker-canvas', vista), {
    onReady: () => {
      $('#ficha-loading', vista)?.classList.add('is-hidden');
      preview.setState({ slots: estado.slots, caps: estado.caps, baseColor: estado.baseColor });
    },
    onError: () => {
      const carga = $('#ficha-loading', vista);
      if (carga) carga.textContent = 'La vista 3D no está disponible en este equipo; puedes igual escribir tu diseño.';
    },
    onSelect: (indice) => {
      estado.active = indice;
      pintar();
    }
  });
  preview.init();

  pintar();

  return {
    estado,
    pasos: 3,
    filasResumen: () => [
      ['Nombre', estado.word || 'Sin nombre'],
      ['Teclas', String(estado.slots)],
      ...estado.caps.map((cap, indice) => [`Tecla ${indice + 1}`, cap.symbol ? `símbolo ${cap.symbol}` : (cap.char || 'en blanco')]),
      ['Cuerpo', baseColor(estado.baseColor).name]
    ],
    mensajeLineas: () => [
      `Nombre: ${estado.word || 'sin nombre'}`,
      `Teclas: ${estado.slots}`,
      ...estado.caps.map((cap, indice) => `Tecla ${indice + 1}: ${cap.symbol ? `símbolo ${cap.symbol}` : (cap.char || 'en blanco')} · ${capColor(cap.color).name}${cap.ink ? ` · letra ${nombreColor(cap.ink)}` : ''}`),
      `Cuerpo del clicker: ${baseColor(estado.baseColor).name}`
    ]
  };
}
