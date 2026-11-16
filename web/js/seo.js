/**
 * Metadatos de la página: título, descripción, Open Graph, Twitter, enlace
 * canónico y datos estructurados. Se usa en la ficha de producto, que cambia
 * de contenido según el `?tipo=` que llegue en la URL.
 */
import { $ } from './dom.js';

/** Escribe el contenido de una etiqueta de Open Graph o Twitter. */
function setMeta(clave, contenido, tipo) {
  let elemento = $(`meta[${tipo}="${clave}"]`);
  if (!elemento) {
    elemento = document.createElement('meta');
    elemento.setAttribute(tipo, clave);
    document.head.appendChild(elemento);
  }
  elemento.setAttribute('content', contenido);
}

/**
 * @param {object} datos
 * @param {string} datos.titulo      título de la pestaña y de Open Graph
 * @param {string} datos.descripcion  descripción para buscadores y redes
 * @param {string} [datos.imagen]     imagen social relativa (por ejemplo img/og-clicker.jpg)
 * @param {string} [datos.categoria]  categoría del producto
 * @param {string} [datos.url]        URL canónica (por defecto, la de la barra)
 */
export function actualizarSeo({ titulo, descripcion, imagen = 'img/og-clicker.jpg', categoria, url }) {
  const base = url || window.location.href;
  const imagenUrl = imagen.startsWith('http') ? imagen : `${window.location.origin}/${imagen}`;

  document.title = titulo;

  const metaDescripcion = $('meta[name="description"]');
  if (metaDescripcion && descripcion) metaDescripcion.setAttribute('content', descripcion);

  setMeta('og:title', titulo, 'property');
  if (descripcion) setMeta('og:description', descripcion, 'property');
  setMeta('og:url', base, 'property');
  setMeta('og:image', imagenUrl, 'property');
  setMeta('og:image:secure_url', imagenUrl, 'property');
  setMeta('og:image:type', 'image/jpeg', 'property');
  setMeta('og:image:width', '1200', 'property');
  setMeta('og:image:height', '630', 'property');

  setMeta('twitter:card', 'summary_large_image', 'name');
  setMeta('twitter:title', titulo, 'name');
  if (descripcion) setMeta('twitter:description', descripcion, 'name');
  setMeta('twitter:image', imagenUrl, 'name');

  const canonico = $('link[rel="canonical"]');
  if (canonico) canonico.setAttribute('href', base);
}

/** Datos estructurados de Schema.org para que Google muestre la ficha. */
export function actualizarEsquema({ nombre, descripcion, imagen, categoria }) {
  const contenedor = $('#product-schema');
  if (!contenedor) return;

  const imagenUrl = imagen?.startsWith('http')
    ? imagen
    : `${window.location.origin}/${imagen || 'img/og-clicker.jpg'}`;

  contenedor.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: nombre,
    description: descripcion,
    image: imagenUrl,
    brand: { '@type': 'Brand', name: 'Vicunia' },
    ...(categoria ? { category: categoria } : {}),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PEN',
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'LocalBusiness', name: 'Vicunia 3D Cajamarca' }
    }
  });
}
