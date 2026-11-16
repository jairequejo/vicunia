/**
 * Muestras de color compartidas por la portada y por el armador de la ficha.
 * Cada muestra es un botón con su nombre de filamento y, al final, un selector
 * de color libre para quien quiera uno que no esté en la lista.
 */
import { FILAMENTS, contrastInk } from './palette.js';

/**
 * Dibuja una fila de muestras de color.
 *
 * @param {HTMLElement} container
 * @param {Array<{id: string, name: string, hex: string, finish?: string}>} lista
 * @param {(id: string) => void} onPick  se llama con el id o el hex elegido
 * @param {{sufijo?: string}} [opciones]
 */
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

/** Marca la muestra activa de un grupo por id de filamento. */
export function marcar(container, id) {
  if (!container) return;
  container.querySelectorAll('button.swatch').forEach((boton) => {
    boton.setAttribute('aria-pressed', String(boton.dataset.id === id));
  });
}

/** Marca la muestra activa comparando por color hex (lo usa el lápiz). */
export function marcarHex(container, hex) {
  if (!container) return;

  const objetivo = String(hex).toLowerCase();
  container.querySelectorAll('button.swatch').forEach((boton) => {
    const activo = boton.dataset.id && colorHex(boton.dataset.id).toLowerCase() === objetivo;
    boton.setAttribute('aria-pressed', String(activo));
  });

  const propio = container.querySelector('input[type=color]');
  if (propio && propio.value.toLowerCase() !== objetivo) propio.value = hex;
}

/** Nombre legible de un color de filamento (o de un hex suelto). */
export function nombreColor(id) {
  const encontrado = FILAMENTS.find((filamento) => filamento.id === id);
  if (encontrado) return encontrado.name;
  if (typeof id === 'string' && id.startsWith('#')) return 'Color propio (' + id.toUpperCase() + ')';
  return 'A coordinar';
}

/** Hex de un color de filamento (o el hex suelto si ya lo es). */
export function colorHex(id) {
  const encontrado = FILAMENTS.find((filamento) => filamento.id === id);
  if (encontrado) return encontrado.hex;
  if (typeof id === 'string' && id.startsWith('#')) return id;
  return '#8A8FA8';
}
