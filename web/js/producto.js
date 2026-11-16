/**
 * Ficha de producto: es la pantalla a la que llega la persona que escanea el QR
 * de un cartel. Muestra la pieza, permite personalizarla con la misma lógica del
 * clicker y del lápiz (nombre, diseño, colores y entrega) y deja el pedido
 * escrito en WhatsApp. No se envía nada automáticamente.
 */
import { waLink } from './config.js';
import { PRODUCTOS } from './catalogo-data.js';
import { crearArmador, hexColor } from './armador.js';

const $ = (selector) => document.querySelector(selector);

/* Recomendaciones: se ofrecen según la línea abierta. */
const recomendaciones = {
  clicker: [
    ['Lápiz con nombre', 'Un detalle para usar todos los días.', 'producto.html?tipo=lapiz'],
    ['Figura desde tu foto', 'Transforma una foto en un regalo 3D.', 'producto.html?tipo=figuras'],
    ['Dummy a tu estilo', 'Combina los colores de una figura para armar.', 'producto.html?tipo=dummy']
  ],
  lapiz: [
    ['Clicker con nombre', 'Lleva tus letras también en un llavero.', 'producto.html?tipo=clicker'],
    ['Recuerdos para eventos', 'Detalles para bautizos y promociones.', 'catalogo.html#eventos'],
    ['Dummy a tu estilo', 'Una figura para combinar a tu gusto.', 'producto.html?tipo=dummy']
  ],
  dummy: [
    ['Clicker con nombre', 'Tu nombre en un llavero con teclas.', 'producto.html?tipo=clicker'],
    ['Figura desde tu foto', 'Transforma una foto en un regalo 3D.', 'producto.html?tipo=figuras'],
    ['Lápiz con nombre', 'Un detalle personalizado para regalar.', 'producto.html?tipo=lapiz']
  ],
  figuras: [
    ['Clicker con nombre', 'Tu nombre en un llavero con teclas.', 'producto.html?tipo=clicker'],
    ['Lápiz con nombre', 'Un detalle personalizado para regalar.', 'producto.html?tipo=lapiz'],
    ['Catálogo completo', 'Conoce todas las líneas impresas en Cajamarca.', 'catalogo.html']
  ],
  navidad: [
    ['Clicker con nombre', 'Tu nombre en un llavero con teclas.', 'producto.html?tipo=clicker'],
    ['Figura desde tu foto', 'Transforma una foto en un regalo 3D.', 'producto.html?tipo=figuras'],
    ['Catálogo completo', 'Conoce todas las líneas impresas en Cajamarca.', 'catalogo.html']
  ],
  eventos: [
    ['Clicker con nombre', 'Tu nombre en un llavero con teclas.', 'producto.html?tipo=clicker'],
    ['Lápiz con nombre', 'Un detalle personalizado para regalar.', 'producto.html?tipo=lapiz'],
    ['Catálogo completo', 'Conoce todas las líneas impresas en Cajamarca.', 'catalogo.html']
  ],
  cajamarca: [
    ['Clicker con nombre', 'Tu nombre en un llavero con teclas.', 'producto.html?tipo=clicker'],
    ['Figura desde tu foto', 'Transforma una foto en un regalo 3D.', 'producto.html?tipo=figuras'],
    ['Catálogo completo', 'Conoce todas las líneas impresas en Cajamarca.', 'catalogo.html']
  ]
};

const fallback = [
  ['Clicker con nombre', 'Tu nombre en un llavero con teclas.', 'producto.html?tipo=clicker'],
  ['Lápiz con nombre', 'Un detalle personalizado para regalar.', 'producto.html?tipo=lapiz'],
  ['Catálogo completo', 'Conoce todas las líneas impresas en Cajamarca.', 'catalogo.html']
];

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value;
}

/* ------------------------------------------------------------------- SEO */

function updateSeoMeta(producto, key) {
  const origin = window.location.origin;
  const canonicalUrl = `${origin}/producto.html?tipo=${encodeURIComponent(key)}`;
  const ogImgUrl = `${origin}/${producto.ogImage || 'img/og-clicker.jpg'}`;

  document.title = `${producto.nombre} · Vicunia 3D Cajamarca`;

  const metaDesc = $('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', producto.descripcion);

  const setMeta = (prop, content) => {
    let el = $(`meta[property="${prop}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', prop);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  const setTwitter = (name, content) => {
    let el = $(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMeta('og:title', `${producto.nombre} · Vicunia 3D Cajamarca`);
  setMeta('og:description', producto.descripcion);
  setMeta('og:url', canonicalUrl);
  setMeta('og:image', ogImgUrl);
  setMeta('og:image:secure_url', ogImgUrl);
  setMeta('og:image:type', 'image/jpeg');
  setMeta('og:image:width', '1200');
  setMeta('og:image:height', '630');

  setTwitter('twitter:card', 'summary_large_image');
  setTwitter('twitter:title', `${producto.nombre} · Vicunia 3D Cajamarca`);
  setTwitter('twitter:description', producto.descripcion);
  setTwitter('twitter:image', ogImgUrl);

  const canon = $('link[rel="canonical"]');
  if (canon) canon.setAttribute('href', canonicalUrl);

  const script = $('#product-schema');
  if (script) {
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: producto.nombre,
      description: producto.descripcion,
      image: ogImgUrl,
      brand: { '@type': 'Brand', name: 'Vicunia' },
      category: producto.categoria || producto.linea,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'PEN',
        availability: 'https://schema.org/InStock',
        seller: { '@type': 'LocalBusiness', name: 'Vicunia 3D Cajamarca' }
      }
    });
  }
}

/* ------------------------------------------------------------------ arte */

function pintarArteHero(producto) {
  const caja = $('#product-visual-art');
  if (!caja) return;
  const diseno = (producto.disenos || [])[0];
  if (!diseno) return;
  caja.innerHTML = `<svg viewBox="0 0 64 64" role="img">${diseno.art}${diseno.extra || ''}</svg>`;
  caja.querySelectorAll('[data-slot]').forEach((parte) => {
    const slot = producto.slots.find((s) => s.key === parte.dataset.slot);
    if (slot) parte.style.color = hexColor(slot.porDefecto);
  });
}

/* ------------------------------------------------------------ compartir */

function initShareButton(producto) {
  const shareBtn = $('#product-share');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: `${producto.nombre} · Vicunia 3D`,
      text: `${producto.descripcion} - Diseñado en Cajamarca, Perú:`,
      url: window.location.href
    };

    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) { /* sin compartir: seguimos con el portapapeles */ }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      const originalText = shareBtn.innerHTML;
      shareBtn.innerHTML = '¡Enlace copiado! ✓';
      setTimeout(() => { shareBtn.innerHTML = originalText; }, 2600);
    } catch (error) {
      window.prompt('Copia este enlace para compartir:', window.location.href);
    }
  });
}

/* --------------------------------------------------------------- ficha */

function renderProduct(key) {
  const producto = PRODUCTOS[key];

  if (!producto) {
    setText('#product-title', 'Explora el catálogo de Vicunia');
    setText('#product-description', 'Este enlace no corresponde a un producto disponible. Mira todas las líneas y elige la que buscas.');
    setText('#product-status', 'Catálogo completo');
    $('#product-whatsapp')?.remove();
    $('#product-share')?.remove();
    $('.product-options')?.remove();
    $('.product-delivery')?.remove();
    $('.product-more')?.remove();
    return;
  }

  updateSeoMeta(producto, key);
  setText('#product-crumb', producto.nombre);
  setText('#product-category', producto.categoria || producto.linea);
  setText('#product-title', producto.nombre);
  setText('#product-description', producto.descripcion);
  setText('#product-status', producto.estado === 'listo'
    ? 'Configurador en línea · pedido por WhatsApp'
    : producto.estado === 'temporada'
      ? 'Temporada · por encargo'
      : 'Por encargo · colores y disponibilidad a confirmar');
  setText('#product-visual-label', 'Ilustración orientativa');
  $('#product-visual').dataset.product = key;
  pintarArteHero(producto);

  /* CTA principal: si hay diseñador 3D, lleva ahí; si no, al armador. */
  const primary = $('#product-primary');
  if (primary) {
    if (producto.diseno3d) {
      primary.textContent = producto.diseno3d.label;
      primary.href = producto.diseno3d.href;
    } else {
      primary.textContent = 'Personalizar ahora';
      primary.href = '#armador';
    }
  }

  const diseno3d = $('#product-diseno-3d');
  if (diseno3d) {
    if (producto.diseno3d) {
      diseno3d.hidden = false;
      diseno3d.textContent = producto.diseno3d.label;
      diseno3d.href = producto.diseno3d.href;
    } else {
      diseno3d.hidden = true;
    }
  }

  /* Armador: nombre, diseño, colores, entrega y resumen. */
  const mount = $('#product-armador');
  let armador = null;
  if (mount) {
    armador = crearArmador({
      mount,
      producto,
      onChange: () => actualizarMensajes(producto, armador)
    });
  }
  actualizarMensajes(producto, armador);

  initShareButton(producto);

  /* Recomendados */
  const grid = $('#product-recommendations');
  if (grid) {
    grid.innerHTML = '';
    const lista = recomendaciones[producto.linea.toLowerCase()] || fallback;
    for (const [titulo, descripcion, href] of lista) {
      const link = document.createElement('a');
      link.className = 'product-recommendation';
      link.href = href;
      const art = document.createElement('span');
      art.className = 'product-recommendation__art';
      const recomendado = Recomendado(href);
      if (recomendado) {
        art.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">${recomendado}</svg>`;
        art.querySelectorAll('[data-slot]').forEach((parte) => {
          const slot = recomendado.slots.find((s) => s.key === parte.dataset.slot);
          if (slot) parte.style.color = hexColor(slot.porDefecto);
        });
      } else {
        art.textContent = '✦';
        art.setAttribute('aria-hidden', 'true');
      }
      const heading = document.createElement('strong');
      heading.textContent = titulo;
      const copy = document.createElement('small');
      copy.textContent = descripcion;
      link.append(art, heading, copy);
      grid.append(link);
    }
  }
}

/** Miniatura de la línea que se recomienda, si es una ficha del catálogo. */
function Recomendado(href) {
  const match = /tipo=([a-z-]+)/.exec(href || '');
  if (!match) return null;
  const producto = PRODUCTOS[match[1]];
  if (!producto) return null;
  const diseno = (producto.disenos || [])[0];
  if (!diseno) return null;
  return { slots: producto.slots || [], svg: diseno.art + (diseno.extra || '') };
}

function actualizarMensajes(producto, armador) {
  if (!armador) return;
  const mensaje = armador.mensaje();
  const enlaces = [$('#product-whatsapp'), $('#product-armar-whatsapp')];
  enlaces.forEach((link) => {
    if (!link) return;
    link.href = waLink(mensaje);
  });
}

/* ----------------------------------------------------- tema y navegación */

function initThemeAndHeader() {
  const toggle = $('#theme-toggle');
  const nav = $('#nav');
  const navToggle = $('#nav-toggle');
  const apply = (theme) => {
    document.documentElement.dataset.theme = theme;
    toggle?.setAttribute('aria-pressed', String(theme === 'dark'));
    toggle?.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    $('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1C1008' : '#E9EDFC');
  };
  let saved = 'light';
  try { saved = localStorage.getItem('vicunia.theme.v1') || 'light'; } catch (error) { saved = 'light'; }
  apply(saved);
  toggle?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next);
    try { localStorage.setItem('vicunia.theme.v1', next); } catch (error) { /* sin almacenamiento */ }
  });
  navToggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  nav?.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      nav.classList.remove('is-open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') nav.classList.remove('is-open');
  });
}

const requestedType = new URLSearchParams(window.location.search).get('tipo') || 'clicker';
renderProduct(requestedType);
initThemeAndHeader();
setText('#year', String(new Date().getFullYear()));
