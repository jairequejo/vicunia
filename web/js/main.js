/**
 * Portada de Vicunia.
 *
 * Solo arranca las piezas: el editor del clicker, el del lápiz, el formulario
 * de la foto y la galería. El tema, el menú y los enlaces de WhatsApp son
 * comunes a toda la web y viven en site.js; los editores, en portada/.
 */
import { initSite } from './site.js';
import { initClicker } from './portada/clicker.js';
import { initPencil } from './portada/lapiz.js';
import { initFoto } from './portada/foto.js';
import { initGaleria } from './portada/galeria.js';
import { initCatalogoFiltros } from './portada/catalogo-filtro.js';

function init() {
  initSite();
  initClicker();
  initPencil();
  initFoto();
  initGaleria();
  initCatalogoFiltros();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
