/**
 * Ficha de producto: la pantalla a la que llega quien escanea el QR de un
 * cartel o quien toca una tarjeta del catálogo.
 *
 * Muestra la pieza, deja personalizarla con la misma lógica del clicker y del
 * lápiz (nombre, diseño, colores, entrega) y prepara el borrador de WhatsApp.
 * No se envía nada automáticamente.
 */
import { waLink } from './config.js';
import { PRODUCTOS } from './catalogo-data.js';
import { initSite } from './site.js';
import { actualizarSeo, actualizarEsquema } from './seo.js';
import { crearArmador } from './armador/index.js';
import { colorHex } from './muestras.js';
import { $, setText } from './dom.js';

/** Qué líneas se recomiendan desde cada línea. */
const RECOMENDADOS = {
  clickers: [
    ['Lápiz con nombre', 'Un detalle para usar todos los días.', 'producto.html?tipo=lapiz'],
    ['Figura desde tu foto', 'Transforma una foto en un regalo 3D.', 'producto.html?tipo=figuras'],
    ['Dummy a tu estilo', 'Combina los colores de una figura para armar.', 'producto.html?tipo=dummy']
  ],
  lápices: [
    ['Clicker con nombre', 'Lleva tus letras también en un llavero.', 'producto.html?tipo=clicker'],
    ['Recuerdos para eventos', 'Detalles para bautizos y promociones.', 'catalogo.html#eventos'],
    ['Dummy a tu estilo', 'Una figura para combinar a tu gusto.', 'producto.html?tipo=dummy']
  ],
  figuras: [
    ['Clicker con nombre', 'Tu nombre en un llavero con teclas.', 'producto.html?tipo=clicker'],
    ['Lápiz con nombre', 'Un detalle personalizado para regalar.', 'producto.html?tipo=lapiz'],
    ['Catálogo completo', 'Conoce todas las líneas impresas en Cajamarca.', 'catalogo.html']
  ],
  dummys: [
    ['Clicker con nombre', 'Tu nombre en un llavero con teclas.', 'producto.html?tipo=clicker'],
    ['Figura desde tu foto', 'Transforma una foto en un regalo 3D.', 'producto.html?tipo=figuras'],
    ['Lápiz con nombre', 'Un detalle personalizado para regalar.', 'producto.html?tipo=lapiz']
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

const POR_DEFECTO = [
  ['Clicker con nombre', 'Tu nombre en un llavero con teclas.', 'producto.html?tipo=clicker'],
  ['Lápiz con nombre', 'Un detalle personalizado para regalar.', 'producto.html?tipo=lapiz'],
  ['Catálogo completo', 'Conoce todas las líneas impresas en Cajamarca.', 'catalogo.html']
];

/* ------------------------------------------------------------------ SEO */

function pintarSeo(producto, tipo) {
  const url = `${window.location.origin}/producto.html?tipo=${encodeURIComponent(tipo)}`;
  actualizarSeo({
    titulo: `${producto.nombre} · Vicunia 3D Cajamarca`,
    descripcion: producto.descripcion,
    imagen: producto.ogImage,
    categoria: producto.categoria || producto.linea,
    url
  });
  actualizarEsquema({
    nombre: producto.nombre,
    descripcion: producto.descripcion,
    imagen: producto.ogImage,
    categoria: producto.categoria || producto.linea
  });
}

/* ----------------------------------------------------------------- arte */

/** Dibuja la silueta de la pieza en el escenario, con los colores por defecto. */
function pintarArteHero(producto) {
  const caja = $('#product-visual-art');
  const diseno = (producto.disenos || [])[0];
  if (!caja || !diseno) return;

  caja.innerHTML = `<svg viewBox="0 0 64 64" role="img">${diseno.art}${diseno.extra || ''}</svg>`;
  caja.querySelectorAll('[data-slot]').forEach((parte) => {
    const slot = (producto.slots || []).find((entrada) => entrada.key === parte.dataset.slot);
    if (slot) parte.style.color = colorHex(slot.porDefecto);
  });
}

/* ------------------------------------------------------------ compartir */

/** Botón de compartir: usa el menú del móvil y si no, copia el enlace. */
function iniciarCompartir(producto) {
  const boton = $('#product-share');
  if (!boton) return;

  boton.addEventListener('click', async () => {
    const datos = {
      title: `${producto.nombre} · Vicunia 3D`,
      text: `${producto.descripcion} - Diseñado en Cajamarca, Perú:`,
      url: window.location.href
    };

    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share(datos);
        return;
      } catch (error) {
        // el usuario canceló: seguimos con el portapapeles
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      const original = boton.innerHTML;
      boton.innerHTML = '¡Enlace copiado! ✓';
      setTimeout(() => { boton.innerHTML = original; }, 2600);
    } catch (error) {
      window.prompt('Copia este enlace para compartir:', window.location.href);
    }
  });
}

/* -------------------------------------------------------- recomendados */

/** Miniatura de la línea recomendada, si es una ficha del catálogo. */
function miniatura(linea) {
  const tipo = /tipo=([a-z-]+)/.exec(linea.href || '')?.[1];
  const producto = tipo ? PRODUCTOS[tipo] : null;
  const diseno = producto?.disenos?.[0];
  if (!diseno) return null;

  // Se arma en un elemento real para poder pintar cada parte con su color.
  const caja = document.createElement('div');
  caja.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">${diseno.art}${diseno.extra || ''}</svg>`;

  const svg = caja.querySelector('svg');
  svg.querySelectorAll('[data-slot]').forEach((parte) => {
    const slot = (producto.slots || []).find((entrada) => entrada.key === parte.dataset.slot);
    if (slot) parte.style.color = colorHex(slot.porDefecto);
  });
  return svg;
}

function pintarRecomendados(producto) {
  const grid = $('#product-recommendations');
  if (!grid) return;

  grid.innerHTML = '';
  const lista = RECOMENDADOS[producto.linea.toLowerCase()] || POR_DEFECTO;

  lista.forEach(([titulo, descripcion, href]) => {
    const link = document.createElement('a');
    link.className = 'product-recommendation';
    link.href = href;

    const art = document.createElement('span');
    art.className = 'product-recommendation__art';
    const svg = miniatura({ href });
    if (svg) {
      art.append(svg);
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
  });
}

/* ----------------------------------------------------------------- ficha */

/** Conecta los botones de WhatsApp con el borrador que arma el armador. */
function conectarMensajes(producto, armador) {
  if (!armador) return;
  const url = waLink(armador.mensaje());
  [$('#product-whatsapp'), $('#product-armar-whatsapp')].forEach((link) => {
    if (link) link.href = url;
  });
}

function pintarFicha(producto, tipo) {
  pintarSeo(producto, tipo);
  setText('#product-crumb', producto.nombre);
  setText('#product-category', producto.categoria || producto.linea);
  setText('#product-title', producto.nombre);
  setText('#product-description', producto.descripcion);
  setText('#product-status', estadoDeLinea(producto.estado));
  setText('#product-visual-label', 'Ilustración orientativa');
  $('#product-visual').dataset.product = tipo;
  pintarArteHero(producto);

  // Botón principal: si hay diseñador 3D en la portada, lleva allí.
  const principal = $('#product-primary');
  if (principal) {
    if (producto.diseno3d) {
      principal.textContent = producto.diseno3d.label;
      principal.href = producto.diseno3d.href;
    } else {
      principal.textContent = 'Personalizar ahora';
      principal.href = '#armador';
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

  iniciarCompartir(producto);
  pintarRecomendados(producto);

  // El armador arma el resumen y el borrador de WhatsApp.
  const mount = $('#product-armador');
  if (!mount) return;

  let armador = null;
  crearArmador({
    mount,
    producto,
    onChange: () => conectarMensajes(producto, armador)
  }).then((instancia) => {
    armador = instancia;
    conectarMensajes(producto, armador);
  });
}

function estadoDeLinea(estado) {
  if (estado === 'listo') return 'Configurador en línea · pedido por WhatsApp';
  if (estado === 'temporada') return 'Temporada · por encargo';
  return 'Por encargo · colores y disponibilidad a confirmar';
}

/* --------------------------------------------------------------- arranque */

function mostrarCatalogo() {
  setText('#product-title', 'Explora el catálogo de Vicunia');
  setText('#product-description', 'Este enlace no corresponde a un producto disponible. Mira todas las líneas y elige la que buscas.');
  setText('#product-status', 'Catálogo completo');
  $('#product-whatsapp')?.remove();
  $('#product-share')?.remove();
  $('.product-options')?.remove();
  $('.product-delivery')?.remove();
  $('.product-more')?.remove();
}

function init() {
  initSite();

  const tipo = new URLSearchParams(window.location.search).get('tipo') || 'clicker';
  const producto = PRODUCTOS[tipo];

  if (!producto) {
    mostrarCatalogo();
    return;
  }

  pintarFicha(producto, tipo);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
