/**
 * Armador: la misma lógica del diseñador de clicker y de lápiz, pero en
 * cualquier línea del catálogo. Escribe el nombre, elige el diseño o la
 * silueta, los colores (esqueleto, carcasa y letra) y cómo lo recibes.
 * Deja todo preparado en un borrador de WhatsApp; no envía nada solo.
 */
import { FILAMENTS, contrastInk } from './palette.js';

const T = (etiqueta, placeholder, max, requerido = true) => ({ etiqueta, placeholder, max, requerido });

/**
 * @param {object} opciones
 * @param {HTMLElement} opciones.mount  contenedor donde se pinta el armador
 * @param {object} opciones.producto   datos de la línea (ver catalogo-data.js)
 * @param {(resumen: string[]) => void} opciones.onChange
 */
export function crearArmador({ mount, producto, onChange }) {
  const estado = {
    nombre: '',
    extra: '',
    cliente: '',
    diseno: producto.disenos?.[0]?.id || '',
    colores: {},
    medida: producto.medidas?.[0] || '',
    cantidad: 1,
    notas: '',
    entrega: 'recoger',
    ciudad: '',
    direccion: '',
    foto: null
  };

  (producto.slots || []).forEach((slot) => { estado.colores[slot.key] = slot.porDefecto; });

  mount.innerHTML = plantilla(producto);
  const q = (sel) => mount.querySelector(sel);

  /* ------------------------------------------------------ 1. tu texto */

  const inputNombre = q('#arm-nombre');
  inputNombre.placeholder = producto.texto.placeholder;
  inputNombre.maxLength = producto.texto.max;
  q('#arm-nombre-label').textContent = producto.texto.etiqueta + (producto.texto.requerido ? '' : ' (opcional)');

  const bloqueExtra = q('#arm-extra-campo');
  if (producto.textoExtra) {
    bloqueExtra.hidden = false;
    q('#arm-extra-label').textContent = producto.textoExtra.etiqueta + (producto.textoExtra.requerido ? '' : ' (opcional)');
    q('#arm-extra').placeholder = producto.textoExtra.placeholder;
    q('#arm-extra').maxLength = producto.textoExtra.max;
  }

  inputNombre.addEventListener('input', () => {
    estado.nombre = inputNombre.value;
    refrescar();
  });
  q('#arm-extra').addEventListener('input', (event) => {
    estado.extra = event.target.value;
    refrescar();
  });
  q('#arm-cliente').addEventListener('input', (event) => {
    estado.cliente = event.target.value;
  });

  /* ------------------------------------------------------- 2. diseño */

  const contDisenos = q('#arm-disenos');
  (producto.disenos || []).forEach((diseno) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'opcion';
    boton.dataset.diseno = diseno.id;
    boton.setAttribute('aria-pressed', String(diseno.id === estado.diseno));
    boton.innerHTML =
      `<span class="opcion__art"><svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">${diseno.art}${diseno.extra || ''}</svg></span>` +
      `<span class="opcion__name">${diseno.nombre}</span>`;
    boton.addEventListener('click', () => {
      estado.diseno = diseno.id;
      contDisenos.querySelectorAll('.opcion').forEach((otro) => {
        otro.setAttribute('aria-pressed', String(otro === boton));
      });
      refrescar();
    });
    contDisenos.append(boton);
  });

  /* ------------------------------------------------------ 3. colores */

  const contSlots = q('#arm-slots');
  (producto.slots || []).forEach((slot) => {
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

    FILAMENTS.forEach((filamento) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'swatch' + (filamento.finish === 'seda' ? ' swatch--silk' : '');
      boton.dataset.id = filamento.id;
      boton.style.setProperty('--c', filamento.hex);
      boton.style.setProperty('--swatch-ink', contrastInk(filamento.hex));
      boton.setAttribute('aria-pressed', String(estado.colores[slot.key] === filamento.id));
      boton.setAttribute('aria-label', filamento.name);
      boton.title = filamento.name;
      boton.innerHTML = '<span class="swatch__check"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12.5 9 17 19 7"/></svg></span>';
      boton.addEventListener('click', () => {
        estado.colores[slot.key] = filamento.id;
        marcar(swatches, filamento.id);
        refrescar();
      });
      swatches.append(boton);
    });

    const propio = document.createElement('label');
    propio.className = 'swatch swatch--custom';
    propio.title = 'Elegir otro color';
    propio.innerHTML = '<span class="swatch__plus" aria-hidden="true">+</span><input type="color" value="#FF7A59" aria-label="Elegir otro color para ' + slot.label + '">';
    const inputColor = propio.querySelector('input');
    inputColor.addEventListener('input', () => {
      estado.colores[slot.key] = inputColor.value;
      marcar(swatches, inputColor.value);
      refrescar();
    });
    swatches.append(propio);

    wrap.append(head, hint, swatches);
    contSlots.append(wrap);
  });

  /* ------------------------------------------------------ 4. entrega */

  const botonesEntrega = mount.querySelectorAll('#arm-entrega .seg');
  const detalleEntrega = q('#arm-entrega-detalle');
  botonesEntrega.forEach((boton) => {
    boton.addEventListener('click', () => {
      estado.entrega = boton.dataset.entrega;
      botonesEntrega.forEach((otro) => otro.setAttribute('aria-pressed', String(otro === boton)));
      pintarEntrega();
      refrescar();
    });
  });

  function pintarEntrega() {
    if (estado.entrega === 'recoger') {
      detalleEntrega.innerHTML = '<p class="hint">Te lo entregamos en Cajamarca: coordinamos el punto y el día por WhatsApp.</p>';
      return;
    }
    detalleEntrega.innerHTML = `
      <div class="field">
        <label for="arm-ciudad">Ciudad</label>
        <input class="input" id="arm-ciudad" type="text" autocomplete="address-level2" placeholder="Ej. Trujillo">
      </div>
      <div class="field">
        <label for="arm-direccion">Dirección o referencia</label>
        <input class="input" id="arm-direccion" type="text" autocomplete="street-address" placeholder="Ej. Av. También lo recojo en la agencia">
      </div>`;
    detalleEntrega.querySelector('#arm-ciudad').addEventListener('input', (event) => {
      estado.ciudad = event.target.value;
      refrescar();
    });
    detalleEntrega.querySelector('#arm-direccion').addEventListener('input', (event) => {
      estado.direccion = event.target.value;
      refrescar();
    });
  }
  pintarEntrega();

  /* ------------------------------------------------------ 5. avanzado */

  const contAvanzado = q('#arm-avanzado');
  if (producto.medidas && producto.medidas.length) {
    const fila = document.createElement('div');
    fila.className = 'arm-medidas';
    fila.setAttribute('role', 'group');
    fila.setAttribute('aria-label', 'Tamaño');
    producto.medidas.forEach((medida, i) => {
      const boton = document.createElement('button');
      boton.type = 'button';
      boton.className = 'chip-medida';
      boton.textContent = medida;
      boton.setAttribute('aria-pressed', String(i === 0));
      boton.addEventListener('click', () => {
        estado.medida = medida;
        fila.querySelectorAll('.chip-medida').forEach((otro) => {
          otro.setAttribute('aria-pressed', String(otro === boton));
        });
        refrescar();
      });
      fila.append(boton);
    });
    contAvanzado.append(fila);
  }

  const cantidad = document.createElement('div');
  cantidad.className = 'field';
  cantidad.innerHTML = `
    <label for="arm-cantidad">Cantidad</label>
    <input class="input" id="arm-cantidad" type="number" min="1" max="500" value="1" inputmode="numeric">`;
  contAvanzado.append(cantidad);
  cantidad.querySelector('input').addEventListener('input', (event) => {
    estado.cantidad = Number(event.target.value) || 1;
    refrescar();
  });

  const notas = document.createElement('div');
  notas.className = 'field';
  notas.innerHTML = `
    <label for="arm-notas">Algo más que debamos saber</label>
    <textarea class="input" id="arm-notas" rows="3" placeholder="Para quién es, la fecha en que lo necesitas, si lo quieres con caja…"></textarea>`;
  contAvanzado.append(notas);
  notas.querySelector('textarea').addEventListener('input', (event) => {
    estado.notas = event.target.value;
  });

  /* --------------------------------------------------------- la foto */

  const zonaFoto = q('#arm-dropzone');
  const inputFoto = q('#arm-foto');
  const archivo = q('#arm-archivo');
  if (producto.foto && zonaFoto && inputFoto) {
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
      estado.foto = { name: file.name, size: file.size };
      archivo.hidden = false;
      archivo.textContent = file.name + ' · ' + Math.max(1, Math.round(file.size / 1024)) + ' KB · adjúntala en el chat';
    });
  }

  /* ------------------------------------------------------- resumen */

  function disenoActual() {
    return (producto.disenos || []).find((d) => d.id === estado.diseno) || (producto.disenos || [])[0];
  }

  function filasResumen() {
    const filas = [['Pieza', producto.nombre]];
    if (estado.nombre.trim()) filas.push([producto.texto.etiqueta, estado.nombre.trim()]);
    if (producto.textoExtra && estado.extra.trim()) filas.push([producto.textoExtra.etiqueta, estado.extra.trim()]);
    const diseno = disenoActual();
    if (diseno) filas.push(['Diseño', diseno.nombre]);
    (producto.slots || []).forEach((slot) => filas.push([slot.label, nombreColor(estado.colores[slot.key])]));
    if (estado.medida) filas.push(['Tamaño', estado.medida]);
    filas.push(['Cantidad', String(estado.cantidad)]);
    filas.push(['Entrega', estado.entrega === 'recoger' ? 'Recoger en Cajamarca' : 'Envío a ' + (estado.ciudad.trim() || 'mi ciudad')]);
    if (estado.foto) filas.push(['Foto', estado.foto.name]);
    return filas;
  }

  function refrescar() {
    const diseno = disenoActual();
    const arte = q('#arm-art');
    if (arte && diseno) {
      arte.innerHTML = diseno.art + (diseno.extra || '');
      arte.querySelectorAll('[data-slot]').forEach((parte) => {
        const key = parte.dataset.slot;
        if (!estado.colores[key]) return;
        parte.style.color = hexColor(estado.colores[key]);
      });
    }

    const nombre = q('#arm-name');
    if (nombre) {
      const texto = estado.nombre.trim();
      nombre.textContent = texto || producto.texto.etiqueta.toLowerCase();
      nombre.classList.toggle('is-vacio', !texto);
      nombre.style.color = estado.colores.letra ? hexColor(estado.colores.letra) : '';
    }

    const cuenta = q('#arm-cuenta');
    if (cuenta) cuenta.textContent = `${estado.nombre.length}/${producto.texto.max}`;

    const resumen = q('#arm-resumen');
    if (resumen) {
      resumen.innerHTML = filasResumen()
        .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
        .join('');
    }

    if (onChange) onChange(filasResumen());
  }

  function mensaje() {
    const diseno = disenoActual();
    const lineas = [];
    lineas.push(estado.cliente.trim() ? `Hola Vicunia 👋 Soy ${estado.cliente.trim()}.` : 'Hola Vicunia 👋');
    lineas.push(`Quiero encargar: ${producto.nombre} (x${estado.cantidad}).`);
    if (estado.nombre.trim()) lineas.push(`${producto.texto.etiqueta}: ${estado.nombre.trim()}`);
    if (producto.textoExtra && estado.extra.trim()) lineas.push(`${producto.textoExtra.etiqueta}: ${estado.extra.trim()}`);
    if (diseno) lineas.push(`Diseño: ${diseno.nombre}`);
    (producto.slots || []).forEach((slot) => lineas.push(`${slot.label}: ${nombreColor(estado.colores[slot.key])}`));
    if (estado.medida) lineas.push(`Tamaño: ${estado.medida}`);
    if (estado.foto) lineas.push(`Foto: ${estado.foto.name} — la adjunto en este chat.`);
    if (estado.entrega === 'recoger') {
      lineas.push('Entrega: recojo en Cajamarca (coordinamos punto y día).');
    } else {
      lineas.push('Entrega: envío a ' + (estado.ciudad.trim() || 'mi ciudad') + (estado.direccion.trim() ? ' · ' + estado.direccion.trim() : ''));
    }
    if (estado.notas.trim()) lineas.push(`Notas: ${estado.notas.trim()}`);
    lineas.push('');
    lineas.push('¿Me confirman precio y tiempo de entrega?');
    return lineas.join('\n');
  }

  refrescar();

  return { estado, mensaje, refrescar, filasResumen };
}

/* --------------------------------------------------------------- apoyo */

export function nombreColor(id) {
  const encontrado = FILAMENTS.find((f) => f.id === id);
  if (encontrado) return encontrado.name;
  if (typeof id === 'string' && id.startsWith('#')) return 'Color propio (' + id.toUpperCase() + ')';
  return 'A coordinar';
}

export function hexColor(id) {
  const encontrado = FILAMENTS.find((f) => f.id === id);
  if (encontrado) return encontrado.hex;
  if (typeof id === 'string' && id.startsWith('#')) return id;
  return '#8A8FA8';
}

function marcar(container, id) {
  container.querySelectorAll('button.swatch').forEach((boton) => {
    boton.setAttribute('aria-pressed', String(boton.dataset.id === id));
  });
}

function plantilla(producto) {
  return `
    <div class="product-armador__grid">
      <div class="product-armador__vista">
        <div class="stage stage--arm" id="arm-stage">
          <svg class="arm-art" id="arm-art" viewBox="0 0 64 64" aria-hidden="true" focusable="false"></svg>
          <p class="arm-name" id="arm-name"></p>
        </div>
        <p class="hint">La silueta se pinta con los colores que eliges. El texto grabado va en el color de la letra.</p>
      </div>

      <div class="product-armador__panel">
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
          <div class="field">
            <label for="arm-cliente">Cómo te llamas (para el chat)</label>
            <input class="input" id="arm-cliente" type="text" autocomplete="name" placeholder="Ej. Jair">
          </div>
          <div class="field" id="arm-foto-campo" ${producto.foto ? '' : 'hidden'}>
            <div class="dropzone dropzone--compact" id="arm-dropzone" tabindex="0" role="button" aria-describedby="arm-foto-hint">
              <input type="file" id="arm-foto" accept=".jpg,.jpeg,.png,.webp,.heic,.heif" hidden>
              <span class="dropzone__icon"><svg class="icon"><use href="#i-upload"></use></svg></span>
              <strong>Adjunta tu foto aquí</strong>
              <span>o toca para elegirla</span>
              <span class="dropzone__hint" id="arm-foto-hint">Se queda en tu equipo hasta que la envíes en el chat</span>
            </div>
            <p class="arm-file" id="arm-archivo" hidden></p>
          </div>
        </section>

        <section class="arm-step">
          <h3 class="arm-step__title"><span class="arm-step__num">2</span> Diseño o silueta</h3>
          <div class="opciones" id="arm-disenos" role="group" aria-label="Diseño o silueta"></div>
        </section>

        <section class="arm-step">
          <h3 class="arm-step__title"><span class="arm-step__num">3</span> Colores</h3>
          <div id="arm-slots"></div>
        </section>

        <section class="arm-step">
          <h3 class="arm-step__title"><span class="arm-step__num">4</span> ¿Dónde lo quieres?</h3>
          <div class="segmented segmented--two" id="arm-entrega" role="group" aria-label="Entrega">
            <button class="seg" type="button" data-entrega="recoger" aria-pressed="true">Recoger en Cajamarca</button>
            <button class="seg" type="button" data-entrega="envio" aria-pressed="false">Envío a mi ciudad</button>
          </div>
          <div class="arm-entrega" id="arm-entrega-detalle"></div>
        </section>

        <details class="adv">
          <summary>Opciones avanzadas</summary>
          <div class="ranges" id="arm-avanzado"></div>
        </details>

        <dl class="arm-resumen" id="arm-resumen"></dl>
      </div>
    </div>`;
}
