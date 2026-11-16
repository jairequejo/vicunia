/**
 * Catálogo de líneas de Vicunia.
 * Filtra las tarjetas por línea y mantiene el tema, el menú y los enlaces de
 * WhatsApp. La lógica de cada línea vive en la ficha (producto.html).
 */
import { initSite } from './site.js';
import { $, $$ } from './dom.js';

/** Claves de filtro que el catálogo reconoce. */
const FILTROS = new Set([
  'todo', 'figuras', 'nombres', 'clickers', 'lapices', 'dummys', 'navidad', 'eventos', 'cajamarca'
]);

/**
 * @param {HTMLElement} grid     contenedor de las tarjetas
 * @param {HTMLElement[]} botones  botones de filtro
 */
function initFiltros({ grid, botones }) {
  const tarjetas = $$('.cat-card', grid);
  const contador = $('#cat-count');
  const vacio = $('#cat-empty');

  /** Aplica un filtro y cuenta cuántas tarjetas quedan visibles. */
  function aplicar(clave) {
    const activa = FILTROS.has(clave) ? clave : 'todo';
    let visibles = 0;

    botones.forEach((boton) => {
      boton.setAttribute('aria-pressed', String(boton.dataset.filter === activa));
    });

    tarjetas.forEach((tarjeta) => {
      const lineas = (tarjeta.dataset.cats || '').split(/\s+/).filter(Boolean);
      const visible = activa === 'todo' || lineas.includes(activa);
      tarjeta.hidden = !visible;
      if (visible) visibles += 1;
    });

    if (contador) contador.textContent = visibles === 1 ? '1 producto' : `${visibles} productos`;
    if (vacio) vacio.hidden = visibles !== 0;
  }

  /** Clave de filtro a partir del ancla de la URL (#navidad, #eventos…). */
  const desdeHash = () => window.location.hash.replace('#', '');

  /** Lleva la vista al inicio del catálogo (debajo del encabezado). */
  const irAlCatalogo = () => {
    const objetivo = $('#catalogo');
    if (!objetivo) return;
    window.requestAnimationFrame(() => {
      objetivo.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
  };

  botones.forEach((boton) => {
    boton.addEventListener('click', () => {
      const clave = boton.dataset.filter;
      aplicar(clave);
      const base = window.location.pathname + window.location.search;
      window.history.replaceState(null, '', clave === 'todo' ? base : `${base}#${clave}`);
    });
  });

  window.addEventListener('hashchange', () => {
    const clave = desdeHash();
    aplicar(clave);
    if (FILTROS.has(clave)) irAlCatalogo();
  });

  aplicar(desdeHash() || 'todo');

  // Llegar desde la portada con #navidad abre el catálogo ya filtrado.
  if (FILTROS.has(desdeHash())) {
    window.setTimeout(irAlCatalogo, 80);
  }
}

function init() {
  initSite();

  const grid = $('#cat-grid');
  const botones = $$('.cat-filter');
  if (!grid || !botones.length) return;

  initFiltros({ grid, botones });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
