/**
 * Datos de producción del clicker.
 * La lista base son los filamentos que Vicunia tiene en carta; además se puede
 * elegir cualquier color con el selector, porque el filamento se pide por código.
 */

export const FILAMENTS = [
  { id: 'blanco', name: 'Blanco', hex: '#F3F0E9', finish: 'mate' },
  { id: 'rosa-pastel', name: 'Rosa pastel', hex: '#FFD1E3', finish: 'mate' },
  { id: 'rosado', name: 'Rosado intenso', hex: '#F0357E', finish: 'mate' },
  { id: 'lavanda', name: 'Lavanda', hex: '#A98BEE', finish: 'mate' },
  { id: 'violeta', name: 'Violeta', hex: '#5A4FE0', finish: 'mate' },
  { id: 'azul-hielo', name: 'Azul hielo', hex: '#9FD4F1', finish: 'mate' },
  { id: 'azul', name: 'Azul', hex: '#1F4FD8', finish: 'mate' },
  { id: 'turquesa', name: 'Turquesa', hex: '#2EC4A6', finish: 'mate' },
  { id: 'lima', name: 'Verde lima', hex: '#9BE564', finish: 'mate' },
  { id: 'verde', name: 'Verde', hex: '#2E9B4F', finish: 'mate' },
  { id: 'mango', name: 'Amarillo mango', hex: '#F7B21C', finish: 'mate' },
  { id: 'seda', name: 'Amarillo sedoso', hex: '#EFC453', finish: 'seda' },
  { id: 'naranja', name: 'Naranja', hex: '#F26A21', finish: 'mate' },
  { id: 'coral', name: 'Coral', hex: '#FF7A59', finish: 'mate' },
  { id: 'arena', name: 'Arena', hex: '#E7C39B', finish: 'mate' },
  { id: 'rojo', name: 'Rojo', hex: '#D2262B', finish: 'mate' },
  { id: 'negro', name: 'Negro', hex: '#1B1B1A', finish: 'mate' }
];

export const BASE_COLORS = [
  { id: 'marfil', name: 'Marfil', hex: '#F6F1E7', finish: 'mate' },
  { id: 'blanco', name: 'Blanco', hex: '#F3F0E9', finish: 'mate' },
  { id: 'arena', name: 'Arena', hex: '#E7C39B', finish: 'mate' },
  { id: 'rosa-pastel', name: 'Rosa pastel', hex: '#FFD1E3', finish: 'mate' },
  { id: 'verde-sierra', name: 'Verde sierra', hex: '#183E36', finish: 'mate' },
  { id: 'seda', name: 'Amarillo sedoso', hex: '#EFC453', finish: 'seda' },
  { id: 'negro', name: 'Negro', hex: '#1B1B1A', finish: 'mate' }
];

/** Formas incluidas en la malla real: todas existen como relieve imprimible. */
export const SYMBOLS = [
  { id: 'heart', name: 'Corazón' },
  { id: 'star', name: 'Estrella' },
  { id: 'paw', name: 'Huella' },
  { id: 'cat', name: 'Gato' },
  { id: 'cloud', name: 'Nube' },
  { id: 'fire', name: 'Fuego' },
  { id: 'lightning', name: 'Rayo' },
  { id: 'moon', name: 'Luna' },
  { id: 'music', name: 'Nota musical' },
  { id: 'flower', name: 'Flor' },
  { id: 'clover', name: 'Trébol' },
  { id: 'ribbon', name: 'Lazo' },
  { id: 'duck', name: 'Pato' },
  { id: 'coffee', name: 'Café' },
  { id: 'airplane', name: 'Avión' }
];

/** Caracteres que la malla trae como relieve. */
export const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ÁÉÍÓÚÜÑ&?!@$:;';

const CAP_BY_ID = new Map(FILAMENTS.map((c) => [c.id, c]));
const BASE_BY_ID = new Map(BASE_COLORS.map((c) => [c.id, c]));
const HEX = /^#[0-9a-f]{6}$/i;

const custom = (hex) => ({
  id: hex.toLowerCase(),
  name: 'Color propio',
  hex: hex.toUpperCase(),
  finish: 'mate'
});

export function capColor(id) {
  if (typeof id === 'string' && HEX.test(id)) return custom(id);
  return CAP_BY_ID.get(id) || FILAMENTS[0];
}

export function baseColor(id) {
  if (typeof id === 'string' && HEX.test(id)) return custom(id);
  return BASE_BY_ID.get(id) || BASE_COLORS[0];
}

export function isValidColor(id) {
  return (typeof id === 'string' && HEX.test(id)) || CAP_BY_ID.has(id) || BASE_BY_ID.has(id);
}

/** Tinta legible sobre un color de filamento (para la letra impresa). */
export function inkFor(hex) {
  const [r, g, b] = hexToRgb(hex);
  const lum = luminance(r, g, b);
  if (lum > 0.5) return '#2B2D42';
  return '#FFFDF8';
}

/** Color de texto/ícono que contrasta sobre una muestra. */
export function contrastInk(hex) {
  const [r, g, b] = hexToRgb(hex);
  return luminance(r, g, b) > 0.55 ? '#183E36' : '#FFF8F1';
}

export function shade(hex, factor) {
  const [r, g, b] = hexToRgb(hex);
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v * factor)));
  return rgbToHex(clamp(r), clamp(g), clamp(b));
}

export function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function luminance(r, g, b) {
  const chan = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

/**
 * Normaliza lo que escribe la gente: mayúsculas y solo caracteres que existen
 * en la malla (letras, números, Ñ y acentos).
 */
export function normalizeChar(value) {
  if (!value) return '';
  const clean = value
    .normalize('NFC')
    .toUpperCase()
    .split('')
    .find((char) => CHARS.includes(char));
  return clean || '';
}

/** Las comillas, tildes raras y espacios no aportan nada a un llavero. */
export function normalizeWord(value) {
  return Array.from((value || '').normalize('NFC').toUpperCase())
    .filter((char) => CHARS.includes(char))
    .join('')
    .slice(0, 10);
}
