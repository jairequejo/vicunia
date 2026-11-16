/**
 * Piezas comunes de todas las páginas: tema claro/oscuro, menú, año del pie y
 * enlaces de WhatsApp. Cada página llama a initSite() una sola vez.
 */
import { waLink } from './config.js';
import { $, $$, setText } from './dom.js';

export const THEME_KEY = 'vicunia.theme.v1';

/* ------------------------------------------------------------------ tema */

/**
 * Aplica el tema al documento y actualiza el botón y el color de la barra del
 * navegador para que coincidan con el modo elegido.
 */
export function applyTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';

  const toggle = $('#theme-toggle');
  toggle?.setAttribute('aria-pressed', String(dark));
  toggle?.setAttribute('aria-label', dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');

  const meta = $('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#1C1008' : '#E9EDFC');
}

/** Recupera el tema guardado (si el navegador lo permite) y lo aplica. */
export function initTheme() {
  let saved = null;
  try {
    saved = window.localStorage.getItem(THEME_KEY);
  } catch (error) {
    saved = null; // almacenamiento no disponible
  }
  applyTheme(saved || 'light');

  $('#theme-toggle')?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch (error) {
      // sin almacenamiento: el tema solo dura esta visita
    }
  });
}

/* ---------------------------------------------------------------- header */

/** Menú móvil: abrir, cerrar, cerrar al navegar y al pulsar Escape. */
export function initHeader() {
  const header = $('.site-header');
  const nav = $('#nav');
  const toggle = $('#nav-toggle');

  const marcarScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  marcarScroll();
  window.addEventListener('scroll', marcarScroll, { passive: true });

  const closeNav = () => {
    nav?.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', 'Abrir menú');
  };

  toggle?.addEventListener('click', () => {
    const open = !nav?.classList.contains('is-open');
    nav?.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });

  nav?.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeNav();
  });

  document.addEventListener('click', (event) => {
    if (!nav?.classList.contains('is-open')) return;
    if (nav.contains(event.target) || toggle?.contains(event.target)) return;
    closeNav();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth >= 900) closeNav();
  });
}

/* ----------------------------------------------------------------- otros */

/** Año del pie de página. */
export function initYear() {
  setText('#year', String(new Date().getFullYear()));
}

/**
 * Los enlaces con `data-wa` abren WhatsApp con el mensaje del atributo.
 * Sin JavaScript, el href sigue llevando a la conversación.
 */
export function initWhatsApp() {
  $$('[data-wa]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const url = waLink(link.dataset.wa);
      const win = window.open(url, '_blank', 'noopener');
      if (!win) window.location.href = url;
    });
  });
}

/** Arranque común de cualquier página de la web. */
export function initSite() {
  initTheme();
  initHeader();
  initYear();
  initWhatsApp();
}
