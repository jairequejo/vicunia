/**
 * Diseñador de las líneas por encargo: silueta plana con el nombre, el
 * diseño y los colores que elige la persona.
 */
import { FILAMENTS } from './palette.js';
import { crearSwatches, marcar, nombreColor, colorHex } from './disenador-utils.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function crearDisenadorPlano({ mount, vista, producto, onChange }) {
  const estado = {
    nombre: '',
    extra: '',
    diseno: producto.disenos[0].id,
    colores: {}
  };
  producto.slots.forEach((slot) => { estado.colores[slot.key] = slot.porDefecto; });

  const texto = producto.texto;

  mount.innerHTML = `
    <section class="arm-step">
      <h3 class="arm-step__title"><span class="arm-step__num">1</span> Tu texto</h3>
      <div class="field">
        <label for="arm-nombre" id="arm-nombre-label">Nombre</label>
        <input class="input" id="arm-nombre" type="text" autocomplete="name" placeholder="Ej. Ana Rojas">
        <p class="hint" id="arm-cuenta">0/16</p>
      </div>
      <div class="field" id="arm-extra-campo" hidden>
        <label for="arm-extra" id="arm-extra-label">Texto extra</label>
        <input class="input" id="arm-extra" type="text" placeholder="Ej. 12 de mayo de 2026">
      </div>
    </section>

    <section class="arm-step">
      <h3 class="arm-step__title"><span class="arm-step__num">2</span> Diseño o silueta</h3>
      <div class="opciones" id="arm-disenos" role="group" aria-label="Diseño o silueta"></div>
    </section>

    <section class="arm-step">
      <h3 class="arm-step__title"><span class="arm-step__num">3</span> Colores</h3>
      <div id="arm-slots"></div>
    </section>`;

  vista.innerHTML = `
    <div class="stage stage--arm" id="arm-stage">
      <svg class="arm-art" id="arm-art" viewBox="0 0 64 64" aria-hidden="true" focusable="false"></svg>
      <p class="arm-name" id="arm-name"></p>
    </div>
    <p class="hint">La silueta se pinta con los colores que eliges. El texto grabado va en el color de la letra.</p>`;

  const inputNombre = $('#arm-nombre', mount);
  inputNombre.placeholder = texto.placeholder;
  inputNombre.maxLength = texto.max;
  $('#arm-nombre-label', mount).textContent = texto.etiqueta + (texto.requerido ? '' : ' (opcional)');

  const bloqueExtra = $('#arm-extra-campo', mount);
  if (producto.textoExtra) {
    bloqueExtra.hidden = false;
    $('#arm-extra-label', mount).textContent = producto.textoExtra.etiqueta + (producto.textoExtra.requerido ? '' : ' (opcional)');
    $('#arm-extra', mount).placeholder = producto.textoExtra.placeholder;
    $('#arm-extra', mount).maxLength = producto.textoExtra.max;
  }

  inputNombre.addEventListener('input', () => {
    estado.nombre = inputNombre.value;
    pintar();
  });
  $('#arm-extra', mount).addEventListener('input', (event) => {
    estado.extra = event.target.value;
    pintar();
  });

  const contDisenos = $('#arm-disenos', mount);
  producto.disenos.forEach((diseno) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'opcion';
    boton.setAttribute('aria-pressed', String(diseno.id === estado.diseno));
    boton.innerHTML =
      `<span class="opcion__art"><svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">${diseno.art}${diseno.extra || ''}</svg></span>` +
      `<span class="opcion__name">${diseno.nombre}</span>`;
    boton.addEventListener('click', () => {
      estado.diseno = diseno.id;
      $$('.opcion', contDisenos).forEach((otro) => otro.setAttribute('aria-pressed', String(otro === boton)));
      pintar();
    });
    contDisenos.append(boton);
  });

  const contSlots = $('#arm-slots', mount);
  producto.slots.forEach((slot) => {
    const wrap = document.createElement('div');
    wrap.className = 'arm-slot';
    const head = document.createElement('div');
    head.className = 'field__head field__head--sp';
    const label = document.createElement('span');
    label.className = 'field__label';
    label.textContent = slot.label;
    head.append(label);
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = slot.hint || '';
    const swatches = document.createElement('div');
    swatches.className = 'swatches';
    swatches.setAttribute('role', 'group');
    swatches.setAttribute('aria-label', slot.label);
    crearSwatches(swatches, FILAMENTS, (id) => {
      estado.colores[slot.key] = id;
      marcar(swatches, id);
      pintar();
    }, { sufijo: ` para ${slot.label}` });
    wrap.append(head, hint, swatches);
    contSlots.append(wrap);
  });

  function disenoActual() {
    return producto.disenos.find((d) => d.id === estado.diseno) || producto.disenos[0];
  }

  function pintar() {
    const diseno = disenoActual();
    const arte = $('#arm-art', vista);
    if (arte) {
      arte.innerHTML = diseno.art + (diseno.extra || '');
      arte.querySelectorAll('[data-slot]').forEach((parte) => {
        const key = parte.dataset.slot;
        if (!estado.colores[key]) return;
        parte.style.color = colorHex(estado.colores[key]);
      });
    }
    const nombre = $('#arm-name', vista);
    if (nombre) {
      const limpio = estado.nombre.trim();
      nombre.textContent = limpio || texto.etiqueta.toLowerCase();
      nombre.classList.toggle('is-vacio', !limpio);
      nombre.style.color = estado.colores.letra ? colorHex(estado.colores.letra) : '';
    }
    $('#arm-cuenta', mount).textContent = `${estado.nombre.length}/${texto.max}`;
    if (onChange) onChange();
  }

  pintar();

  return {
    estado,
    pasos: 3,
    filasResumen: () => {
      const filas = [];
      if (estado.nombre.trim()) filas.push([texto.etiqueta, estado.nombre.trim()]);
      if (producto.textoExtra && estado.extra.trim()) filas.push([producto.textoExtra.etiqueta, estado.extra.trim()]);
      filas.push(['Diseño', disenoActual().nombre]);
      producto.slots.forEach((slot) => filas.push([slot.label, nombreColor(estado.colores[slot.key])]));
      return filas;
    },
    mensajeLineas: () => {
      const lineas = [];
      if (estado.nombre.trim()) lineas.push(`${texto.etiqueta}: ${estado.nombre.trim()}`);
      if (producto.textoExtra && estado.extra.trim()) lineas.push(`${producto.textoExtra.etiqueta}: ${estado.extra.trim()}`);
      lineas.push(`Diseño: ${disenoActual().nombre}`);
      producto.slots.forEach((slot) => lineas.push(`${slot.label}: ${nombreColor(estado.colores[slot.key])}`));
      return lineas;
    }
  };
}
