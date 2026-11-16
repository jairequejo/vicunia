/**
 * Diseñador de las líneas por encargo: silueta plana con el nombre, el
 * diseño y los colores que elige la persona.
 *
 * Pasos: 1) tu texto (y la foto, si la pieza la lleva) · 2) diseño o silueta
 * · 3) colores.
 */
import { FILAMENTS } from '../palette.js';
import { $, $$ } from '../dom.js';
import { crearSwatches, marcar, nombreColor, colorHex } from '../muestras.js';

const TAMANO_MAXIMO = 100 * 1024 * 1024; // 100 MB

/**
 * @param {object} opciones
 * @param {HTMLElement} opciones.mount   panel de pasos
 * @param {HTMLElement} opciones.vista   escenario con la silueta
 * @param {object} opciones.producto     línea del catálogo
 * @param {() => void} [opciones.onChange]
 */
export function crearDisenadorPlano({ mount, vista, producto, onChange }) {
  const estado = {
    nombre: '',
    extra: '',
    diseno: producto.disenos[0].id,
    colores: {},
    foto: null
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
      ${producto.foto ? `
      <div class="field" id="arm-foto-campo">
        <div class="dropzone dropzone--compact" id="arm-dropzone" tabindex="0" role="button" aria-describedby="arm-foto-hint">
          <input type="file" id="arm-foto" accept=".jpg,.jpeg,.png,.webp,.heic,.heif" hidden>
          <span class="dropzone__icon"><svg class="icon"><use href="#i-upload"></use></svg></span>
          <strong>Adjunta tu foto aquí</strong>
          <span>o toca para elegirla</span>
          <span class="dropzone__hint" id="arm-foto-hint">Se queda en tu equipo hasta que la envíes en el chat</span>
        </div>
        <p class="arm-file" id="arm-archivo" hidden></p>
      </div>` : ''}
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

  /* --------------------------------------------------------- texto */

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

  /* ---------------------------------------------------------- foto */

  const zonaFoto = $('#arm-dropzone', mount);
  const inputFoto = $('#arm-foto', mount);
  const archivo = $('#arm-archivo', mount);

  if (zonaFoto && inputFoto) {
    zonaFoto.addEventListener('click', () => inputFoto.click());
    zonaFoto.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        inputFoto.click();
      }
    });
    inputFoto.addEventListener('change', () => {
      const file = inputFoto.files[0];
      if (!file) return;
      if (file.size > TAMANO_MAXIMO) {
        archivo.hidden = false;
        archivo.textContent = 'Esa foto pesa demasiado (máximo 100 MB). Elige otra.';
        estado.foto = null;
      } else {
        estado.foto = { name: file.name, size: file.size };
        archivo.hidden = false;
        archivo.textContent = file.name + ' · ' + Math.max(1, Math.round(file.size / 1024)) + ' KB · adjúntala en el chat';
      }
      if (onChange) onChange();
    });
  }

  /* ------------------------------------------------------- diseños */

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

  /* ------------------------------------------------------- colores */

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

  /* ------------------------------------------------------------ pintado */

  function disenoActual() {
    return producto.disenos.find((diseno) => diseno.id === estado.diseno) || producto.disenos[0];
  }

  function pintar() {
    const diseno = disenoActual();

    const arte = $('#arm-art', vista);
    if (arte) {
      arte.innerHTML = diseno.art + (diseno.extra || '');
      arte.querySelectorAll('[data-slot]').forEach((parte) => {
        const clave = parte.dataset.slot;
        if (!estado.colores[clave]) return;
        parte.style.color = colorHex(estado.colores[clave]);
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
      if (estado.foto) filas.push(['Foto', estado.foto.name]);
      return filas;
    },
    mensajeLineas: () => {
      const lineas = [];
      if (estado.nombre.trim()) lineas.push(`${texto.etiqueta}: ${estado.nombre.trim()}`);
      if (producto.textoExtra && estado.extra.trim()) lineas.push(`${producto.textoExtra.etiqueta}: ${estado.extra.trim()}`);
      lineas.push(`Diseño: ${disenoActual().nombre}`);
      producto.slots.forEach((slot) => lineas.push(`${slot.label}: ${nombreColor(estado.colores[slot.key])}`));
      if (estado.foto) lineas.push(`Foto: ${estado.foto.name} — la adjunto en este chat.`);
      return lineas;
    }
  };
}
