/**
 * Piezas comunes de todas las páginas: tema claro/oscuro, menú, año y
 * enlaces de WhatsApp. Cada página llama a initSite() una vez.
 */
import { waLink } from './config.js';

export const THEME_KEY = 'vicunia.theme.v1';

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

/* ------------------------------------------------------------------ tema */

const themeToggle = $('#theme-toggle');

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  themeToggle?.setAttribute('aria-pressed', String(dark));
  themeToggle?.setAttribute('aria-label', dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', dark ? '#1C1008' : '#E9EDFC');
}

function initTheme() {
  let saved = null;
  try { saved = window.localStorage.getItem(THEME_KEY); } catch (error) { saved = null; }
  applyTheme(saved || 'light');

  themeToggle?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { window.localStorage.setItem(THEME_KEY, next); } catch (error) { /* sin almacenamiento */ }
  });
}

/* ---------------------------------------------------------------- header */

function initHeader() {
  const header = $('.site-header');
  const nav = $('#nav');
  const toggle = $('#nav-toggle');

  const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

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

function initYear() {
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
}

function initWhatsApp() {
  $$('[data-wa]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const url = waLink(link.dataset.wa);
      const win = window.open(url, '_blank', 'noopener');
      if (!win) window.location.href = url;
    });
  });
}

export function initSite() {
  initTheme();
  initHeader();
  initYear();
  initWhatsApp();
}
