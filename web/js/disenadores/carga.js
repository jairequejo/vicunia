/**
 * Carga bajo demanda de los diseñadores.
 *
 * Cada línea usa un diseñador distinto y cada uno pesa distinto:
 *   - clicker → three.js + la malla real de producción
 *   - lapiz   → three.js + el motor de letras (JSCAD)
 *   - plano   → solo la silueta, sin nada pesado
 *
 * Aquí se decide cuál tocar y se carga lo justo cuando se abre esa línea.
 */

/** Carga el motor de letras (JSCAD) una sola vez, si hace falta. */
export function cargarJscad() {
  if (window.jscadModeling) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'vendor/jscad-modeling.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar el motor de letras'));
    document.head.append(script);
  });
}

/**
 * Monta el diseñador que corresponde a la línea.
 *
 * @param {object} producto  línea del catálogo (ver catalogo-data.js)
 * @param {object} opciones  { mount, vista, onChange }
 * @returns {Promise<object>} diseñador con { estado, pasos, filasResumen, mensajeLineas }
 */
export async function cargarDisenador(producto, { mount, vista, onChange }) {
  const modo = producto.modo || 'plano';

  if (modo === 'clicker') {
    const { crearDisenadorClicker } = await import('./clicker.js');
    return crearDisenadorClicker({ mount, vista, onChange });
  }

  if (modo === 'lapiz') {
    await cargarJscad();
    const { crearDisenadorLapiz } = await import('./lapiz.js');
    return crearDisenadorLapiz({ mount, vista, onChange });
  }

  const { crearDisenadorPlano } = await import('./plano.js');
  return crearDisenadorPlano({ mount, vista, producto, onChange });
}
