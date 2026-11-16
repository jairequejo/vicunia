/**
 * Armador: el personalizador que comparten todas las líneas del catálogo.
 *
 * Flujo: un diseñador (clicker, lápiz o silueta) aporta los pasos propios de
 * la línea; el armador suma la entrega, la cantidad, el resumen en vivo y el
 * borrador de WhatsApp.
 *
 *   import { crearArmador } from './js/armador/index.js';
 *   const armador = await crearArmador({ mount, producto, onChange });
 *   armador.mensaje();  // texto para WhatsApp
 */
import { $ } from '../dom.js';
import { esqueletoArmador, NUMERO_ENTREGA_ID, PASOS_ID, VISTA_ID } from './esquema.js';
import { crearEntrega } from './entrega.js';
import { construirMensaje, filasResumen, pintarResumen } from './mensaje.js';
import { cargarDisenador } from '../disenadores/carga.js';

/**
 * @param {object} opciones
 * @param {HTMLElement} opciones.mount    contenedor donde se pinta el armador
 * @param {object} opciones.producto     línea del catálogo (ver catalogo-data.js)
 * @param {(filas: Array<[string,string]>) => void} [opciones.onChange]
 * @returns {Promise<{estado: object, mensaje: () => string, filasResumen: () => Array, refrescar: () => void}>}
 */
export async function crearArmador({ mount, producto, onChange }) {
  const estado = {
    cliente: '',
    cantidad: 1,
    notas: '',
    entrega: 'recoger',
    ciudad: '',
    direccion: ''
  };

  mount.innerHTML = esqueletoArmador();

  const vista = $(`#${VISTA_ID}`, mount);
  const panel = $(`#${PASOS_ID}`, mount);

  let diseno = null;

  const refrescar = () => {
    if (!diseno) return;
    const filas = filasResumen({ producto, diseno, estado, entrega: entrega.texto() });
    pintarResumen(mount, filas);
    if (onChange) onChange(filas);
  };

  const entrega = crearEntrega({ mount, estado, onChange: refrescar });

  // El diseñador de la línea entra después: solo se descarga lo que hace falta.
  diseno = await cargarDisenador(producto, {
    mount: panel,
    vista,
    onChange: refrescar
  });

  const numero = $(`#${NUMERO_ENTREGA_ID}`, mount);
  if (numero) numero.textContent = String((diseno.pasos || 3) + 1);

  refrescar();

  return {
    estado,
    /** Borrador del mensaje de WhatsApp con todo lo elegido. */
    mensaje: () => construirMensaje({ producto, diseno, estado, entrega: entrega.texto() }),
    /** Filas del resumen en vivo. */
    filasResumen: () => filasResumen({ producto, diseno, estado, entrega: entrega.texto() }),
    /** Vuelve a pintar el resumen. */
    refrescar
  };
}
