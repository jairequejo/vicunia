/**
 * Utilidades compartidas por los diseñadores de la ficha: muestras de color,
 * nombres de filamento y Conversion de color.
 */
import { FILAMENTS, contrastInk } from './palette.js';

export function crearSwatches(container, lista, onPick, { sufijo = '' } = {}) {
  if (!container) return;
  container.innerHTML = '';
  lista.forEach((item) => {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'swatch' + (item.finish === 'seda' ? ' swatch--silk' : '');
    boton.dataset.id = item.id;
    boton.style.setProperty('--c', item.hex);
    boton.style.setProperty('--swatch-ink', contrastInk(item.hex));
    boton.setAttribute('aria-pressed', 'false');
    boton.setAttribute('aria-label', item.name);
    boton.title = item.name;
    boton.innerHTML = '<span class="swatch__check"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12.5 9 17 19 7"/></svg></span>';
    boton.addEventListener('click', () => onPick(item.id));
    container.append(boton);
  });

  const propio = document.createElement('label');
  propio.className = 'swatch swatch--custom';
  propio.title = 'Elegir otro color';
  propio.innerHTML = '<span class="swatch__plus" aria-hidden="true">+</span><input type="color" value="#FF7A59" aria-label="Elegir otro color' + sufijo + '">';
  const input = propio.querySelector('input');
  input.addEventListener('input', () => onPick(input.value));
  container.append(propio);
}

export function marcar(container, id) {
  if (!container) return;
  container.querySelectorAll('button.swatch').forEach((boton) => {
    boton.setAttribute('aria-pressed', String(boton.dataset.id === id));
  });
}

export function nombreColor(id) {
  const encontrado = FILAMENTS.find((f) => f.id === id);
  if (encontrado) return encontrado.name;
  if (typeof id === 'string' && id.startsWith('#')) return 'Color propio (' + id.toUpperCase() + ')';
  return 'A coordinar';
}

export function colorHex(id) {
  const encontrado = FILAMENTS.find((f) => f.id === id);
  if (encontrado) return encontrado.hex;
  if (typeof id === 'string' && id.startsWith('#')) return id;
  return '#8A8FA8';
}

/** Alias con el nombre que usa la ficha de producto. */
export const hexColor = colorHex;
