/**
 * Portada de Vicunia.
 *
 * Arranca las piezas livianas de inmediato y difiere los configuradores 3D
 * pesados (Three.js, clicker-geo.bin y JSCAD) hasta que el usuario se acerca
 * o interactúa con ellos.
 */
import { initSite } from './site.js';
import { initFoto } from './portada/foto.js';
import { initGaleria } from './portada/galeria.js';
import { initCatalogoFiltros } from './portada/catalogo-filtro.js';
import { cargarJscad } from './disenadores/carga.js';
import { $, $$ } from './dom.js';

/** Ejecuta `cargar` una sola vez cuando la sección se acerca o recibe foco/clic. */
function cuandoSeAcerque(id, cargar) {
  const el = $(`#${id}`);
  if (!el) return;

  let cargado = false;
  const disparar = () => {
    if (cargado) return;
    cargado = true;
    observer?.disconnect();
    cargar();
  };

  const hash = window.location.hash;
  const params = new URLSearchParams(window.location.search);
  const esClickerCompartido = id === 'disena' && (params.has('n') || hash.startsWith('#disena'));
  if (esClickerCompartido || hash === `#${id}` || !('IntersectionObserver' in window)) {
    disparar();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) disparar();
  }, { rootMargin: '400px 0px' });

  observer.observe(el);

  $$(`a[href="#${id}"]`).forEach((link) => {
    link.addEventListener('click', disparar, { once: true });
  });
  el.addEventListener('pointerdown', disparar, { once: true, passive: true });
  el.addEventListener('focusin', disparar, { once: true });
  window.addEventListener('hashchange', () => {
    if (window.location.hash.startsWith(`#${id}`)) disparar();
  });
}

function init() {
  initSite();
  initFoto();
  initGaleria();
  initCatalogoFiltros();

  cuandoSeAcerque('disena', async () => {
    const { initClicker } = await import('./portada/clicker.js');
    initClicker();
  });

  cuandoSeAcerque('lapices', async () => {
    await cargarJscad();
    const { initPencil } = await import('./portada/lapiz.js');
    initPencil();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
