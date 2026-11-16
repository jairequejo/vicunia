/**
 * Galería de la portada: abre cada foto en el cuadro de diálogo con su
 * descripción y se cierra al tocar fuera o con el botón.
 */
import { $, $$ } from '../dom.js';

/** Conecta las miniaturas con el visor de la galería. */
export function initGaleria() {
  const dialog = $('#lightbox');
  const image = $('#lightbox-img');
  const caption = $('#lightbox-caption');
  const close = $('#lightbox-close');
  if (!dialog || !image) return;

  $$('.gallery__item').forEach((button) => {
    button.addEventListener('click', () => {
      const full = button.dataset.full;
      const thumb = button.querySelector('img');
      image.src = full || thumb?.src || '';
      image.alt = thumb?.alt || '';
      if (caption) caption.textContent = button.dataset.caption || '';
      dialog.showModal();
    });
  });

  close?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}
