/**
 * Bloque de entrega del armador: dónde recibe la pieza, cuántas quiere y qué
 * hay que saber. Es igual para todas las líneas.
 */
import { $, $$, setHTML } from '../dom.js';
import { AVANZADO_ID, DETALLE_ENTREGA_ID, ENTREGA_ID } from './esquema.js';

/**
 * @param {object} opciones
 * @param {HTMLElement} opciones.mount     contenedor del armador
 * @param {object} opciones.estado         estado compartido (se modifica aquí)
 * @param {() => void} opciones.onChange   se llama cuando algo cambia
 */
export function crearEntrega({ mount, estado, onChange }) {
  const botones = $$(`#${ENTREGA_ID} .seg`, mount);
  const detalle = $(`#${DETALLE_ENTREGA_ID}`, mount);
  const avanzado = $(`#${AVANZADO_ID}`, mount);

  botones.forEach((boton) => {
    boton.addEventListener('click', () => {
      estado.entrega = boton.dataset.entrega;
      botones.forEach((otro) => otro.setAttribute('aria-pressed', String(otro === boton)));
      pintarDetalle();
      onChange();
    });
  });

  function pintarDetalle() {
    if (estado.entrega === 'recoger') {
      setHTML(detalle, '<p class="hint">Te lo entregamos en Cajamarca: coordinamos el punto y el día por WhatsApp.</p>');
      return;
    }

    setHTML(detalle, `
      <div class="field">
        <label for="arm-ciudad">Ciudad</label>
        <input class="input" id="arm-ciudad" type="text" autocomplete="address-level2" placeholder="Ej. Trujillo">
      </div>
      <div class="field">
        <label for="arm-direccion">Dirección o referencia</label>
        <input class="input" id="arm-direccion" type="text" autocomplete="street-address" placeholder="Ej. Av. También lo recojo en la agencia">
      </div>`);

    $('#arm-ciudad', detalle).addEventListener('input', (event) => {
      estado.ciudad = event.target.value;
      onChange();
    });
    $('#arm-direccion', detalle).addEventListener('input', (event) => {
      estado.direccion = event.target.value;
      onChange();
    });
  }

  /* ------------------------------------------------- datos del pedido */

  const cliente = document.createElement('div');
  cliente.className = 'field';
  cliente.innerHTML = `
    <label for="arm-cliente">Cómo te llamas (para el chat)</label>
    <input class="input" id="arm-cliente" type="text" autocomplete="name" placeholder="Ej. Jair">`;
  avanzado.append(cliente);
  $('#arm-cliente', cliente).addEventListener('input', (event) => {
    estado.cliente = event.target.value;
    onChange();
  });

  const cantidad = document.createElement('div');
  cantidad.className = 'field';
  cantidad.innerHTML = `
    <label for="arm-cantidad">Cantidad</label>
    <input class="input" id="arm-cantidad" type="number" min="1" max="500" value="1" inputmode="numeric">`;
  avanzado.append(cantidad);
  $('#arm-cantidad', cantidad).addEventListener('input', (event) => {
    estado.cantidad = Number(event.target.value) || 1;
    onChange();
  });

  const notas = document.createElement('div');
  notas.className = 'field';
  notas.innerHTML = `
    <label for="arm-notas">Algo más que debamos saber</label>
    <textarea class="input" id="arm-notas" rows="3" placeholder="Para quién es, la fecha en que lo necesitas, si lo quieres con caja…"></textarea>`;
  avanzado.append(notas);
  $('#arm-notas', notas).addEventListener('input', (event) => {
    estado.notas = event.target.value;
    onChange();
  });

  pintarDetalle();

  return {
    /** Texto de la entrega para el resumen y el mensaje. */
    texto() {
      return estado.entrega === 'recoger'
        ? 'Recoger en Cajamarca'
        : 'Envío a ' + (estado.ciudad.trim() || 'mi ciudad');
    }
  };
}
