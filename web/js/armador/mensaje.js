/**
 * Resumen y borrador de WhatsApp del armador.
 * La persona ve lo que eligió y el chat se abre con todo escrito; nunca se
 * envía solo.
 */
import { $, setHTML } from '../dom.js';
import { RESUMEN_ID } from './esquema.js';

/**
 * Filas del resumen (lo que ve la persona debajo de los pasos).
 *
 * @param {object} datos
 * @param {object} datos.producto  línea del catálogo
 * @param {object} datos.diseno    diseñador de la línea (filas y mensaje)
 * @param {object} datos.estado    estado compartido del armador
 * @param {string} datos.entrega   texto de la entrega
 * @returns {Array<[string, string]>}
 */
export function filasResumen({ producto, diseno, estado, entrega }) {
  const filas = [['Pieza', producto.nombre]];
  filas.push(...diseno.filasResumen());
  filas.push(['Cantidad', String(estado.cantidad)]);
  filas.push(['Entrega', entrega]);
  return filas;
}

/**
 * Borrador del mensaje de WhatsApp.
 *
 * @returns {string} mensaje con saltos de línea
 */
export function construirMensaje({ producto, diseno, estado, entrega }) {
  const lineas = [];

  lineas.push(estado.cliente.trim() ? `Hola Vicunia 👋 Soy ${estado.cliente.trim()}.` : 'Hola Vicunia 👋');
  lineas.push(`Quiero encargar: ${producto.nombre} (x${estado.cantidad}).`);
  lineas.push(...diseno.mensajeLineas());

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

/** Pinta el resumen en el armador. */
export function pintarResumen(mount, filas) {
  setHTML($(`#${RESUMEN_ID}`, mount), filas.map(([clave, valor]) => `<dt>${clave}</dt><dd>${valor}</dd>`).join(''));
}
