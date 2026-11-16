/**
 * Utilidades de DOM compartidas por toda la web.
 * Evita repetir los mismos selectores y helpers en cada página.
 */

/** Primer elemento que coincide con el selector. */
export const $ = (selector, root = document) => root.querySelector(selector);

/** Todos los elementos que coinciden con el selector (siempre como arreglo). */
export const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/** Escribe texto en un elemento, si existe. */
export function setText(selector, value, root = document) {
  const element = typeof selector === 'string' ? $(selector, root) : selector;
  if (element) element.textContent = value;
}

/** Escribe HTML en un elemento, si existe. */
export function setHTML(selector, value, root = document) {
  const element = typeof selector === 'string' ? $(selector, root) : selector;
  if (element) element.innerHTML = value;
}

/** Muestra u oculta un elemento con el atributo `hidden`. */
export function toggleHidden(element, hidden) {
  if (element) element.hidden = Boolean(hidden);
}

/** Registra un evento sobre varios elementos a la vez. */
export function onEach(elements, event, handler) {
  elements.forEach((element) => element?.addEventListener(event, handler));
}

/** Espera a que el documento esté listo y ejecuta el arranque. */
export function alListo(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
  } else {
    callback();
  }
}
