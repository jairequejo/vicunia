/**
 * Filtro interactivo del catálogo en la portada.
 */
import { $, $$ } from '../dom.js';

export function initCatalogoFiltros() {
  const grid = $('#cat-grid');
  const botones = $$('.cat-filter');
  if (!grid || !botones.length) return;

  const tarjetas = $$('.cat-card', grid);
  const contador = $('#cat-count');

  function aplicar(clave) {
    let visibles = 0;
    botones.forEach((boton) => {
      boton.setAttribute('aria-pressed', String(boton.dataset.filter === clave));
    });

    tarjetas.forEach((tarjeta) => {
      const lineas = (tarjeta.dataset.cats || '').split(/\s+/).filter(Boolean);
      const visible = clave === 'todo' || lineas.includes(clave);
      tarjeta.hidden = !visible;
      if (visible) visibles += 1;
    });

    if (contador) {
      contador.textContent = visibles === 1 ? '1 opción destacada' : `${visibles} opciones destacadas`;
    }
  }

  botones.forEach((boton) => {
    boton.addEventListener('click', () => {
      aplicar(boton.dataset.filter || 'todo');
    });
  });
}
