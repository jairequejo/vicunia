/**
 * Catálogo de líneas de Vicunia.
 * Filtra las tarjetas y mantiene el tema, el menú y los enlaces de WhatsApp.
 * La lógica de cada línea vive en el armador (configurador.html).
 */
import { initSite } from './site.js';

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

/* --------------------------------------------------------------- filtros */

function initFilters() {
  const grid = $('#cat-grid');
  const buttons = $$('.cat-filter');
  const count = $('#cat-count');
  const empty = $('#cat-empty');
  if (!grid || !buttons.length) return;

  const cards = $$('.cat-card', grid);
  const valid = new Set(buttons.map((button) => button.dataset.filter));

  const apply = (rawKey) => {
    const active = valid.has(rawKey) ? rawKey : 'todo';
    let shown = 0;

    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === active));
    });

    cards.forEach((card) => {
      const cats = (card.dataset.cats || '').split(/\s+/).filter(Boolean);
      const visible = active === 'todo' || cats.includes(active);
      card.hidden = !visible;
      if (visible) shown += 1;
    });

    if (count) count.textContent = shown === 1 ? '1 producto' : `${shown} productos`;
    if (empty) empty.hidden = shown !== 0;
  };

  const keyFromHash = () => window.location.hash.replace('#', '');

  const scrollToCatalog = () => {
    const target = document.getElementById('catalogo');
    if (!target) return;
    // Se espera un frame para que el navegador ya tenga el alto definitivo.
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ block: 'start', behavior: 'auto' });
    });
  };

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.filter;
      apply(key);
      const base = window.location.pathname + window.location.search;
      window.history.replaceState(null, '', key === 'todo' ? base : `${base}#${key}`);
    });
  });

  window.addEventListener('hashchange', () => {
    const key = keyFromHash();
    apply(key);
    if (valid.has(key)) scrollToCatalog();
  });

  apply(keyFromHash() || 'todo');

  // Llegar desde la portada con #navidad, #eventos… abre el catálogo ya filtrado.
  if (valid.has(keyFromHash())) {
    window.setTimeout(scrollToCatalog, 80);
  }
}

function init() {
  initSite();
  initFilters();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
