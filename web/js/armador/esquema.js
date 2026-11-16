/**
 * Esqueleto del armador: la estructura que comparten todas las líneas.
 * El diseñador de cada línea llena la zona de la vista y la de los pasos.
 */

export const VISTA_ID = 'arm-vista';
export const PASOS_ID = 'arm-diseno';
export const RESUMEN_ID = 'arm-resumen';
export const ENTREGA_ID = 'arm-entrega';
export const DETALLE_ENTREGA_ID = 'arm-entrega-detalle';
export const AVANZADO_ID = 'arm-avanzado';
export const NUMERO_ENTREGA_ID = 'arm-num-entrega';

/** HTML del armador completo, antes de que se monte el diseñador. */
export function esqueletoArmador() {
  return `
    <div class="product-armador__grid">
      <div class="product-armador__vista" id="${VISTA_ID}"></div>
      <div class="product-armador__panel">
        <div id="${PASOS_ID}"></div>

        <section class="arm-step">
          <h3 class="arm-step__title">
            <span class="arm-step__num" id="${NUMERO_ENTREGA_ID}">4</span> ¿Dónde lo quieres?
          </h3>
          <div class="segmented segmented--two" id="${ENTREGA_ID}" role="group" aria-label="Entrega">
            <button class="seg" type="button" data-entrega="recoger" aria-pressed="true">Recoger en Cajamarca</button>
            <button class="seg" type="button" data-entrega="envio" aria-pressed="false">Envío a mi ciudad</button>
          </div>
          <div class="arm-entrega" id="${DETALLE_ENTREGA_ID}"></div>
        </section>

        <details class="adv">
          <summary>Opciones avanzadas</summary>
          <div class="ranges" id="${AVANZADO_ID}"></div>
        </details>

        <dl class="arm-resumen" id="${RESUMEN_ID}"></dl>
      </div>
    </div>`;
}
