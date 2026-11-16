/**
 * Piezas compartidas por los editores de la portada: el aviso flotante, el
 * sonido de clic, la descarga de archivos y el cálculo de nombres de archivo.
 */
import { $ } from '../dom.js';

/** Limita un número entre un mínimo y un máximo. */
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/* ------------------------------------------------------------------ aviso */

let toastTimer = 0;

/**
 * Muestra el aviso flotante de la página durante unos segundos.
 * @param {string} message
 * @param {number} [timeout=3200] milisegundos visibles
 */
export function toast(message, timeout = 3200) {
  const el = $('#toast');
  if (!el) return;

  el.textContent = message;
  el.hidden = false;
  window.clearTimeout(toastTimer);
  requestAnimationFrame(() => el.classList.add('is-visible'));

  toastTimer = window.setTimeout(() => {
    el.classList.remove('is-visible');
    window.setTimeout(() => { el.hidden = true; }, 260);
  }, timeout);
}

/* ----------------------------------------------------------------- sonido */

/**
 * Sonido corto de tecla, generado con la Web Audio API (sin archivos).
 * Se activa con el primer gesto del usuario y se puede apagar.
 */
class ClickSound {
  constructor() {
    this.enabled = true;
    this.context = null;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (enabled) this.ensure();
  }

  ensure() {
    if (!this.context) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.context = new Ctx();
    }
    if (this.context.state === 'suspended') this.context.resume().catch(() => {});
    return this.context;
  }

  play(volume = 1) {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Golpe seco: ruido filtrado muy corto.
    const duration = 0.055;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 2400;
    band.Q.value = 1.1;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.22 * volume;
    noise.connect(band).connect(noiseGain).connect(ctx.destination);
    noise.start(now);

    // Cuerpo del clic.
    const body = ctx.createOscillator();
    body.type = 'triangle';
    body.frequency.setValueAtTime(430, now);
    body.frequency.exponentialRampToValueAtTime(165, now + 0.06);
    const bodyGain = ctx.createGain();
    bodyGain.gain.setValueAtTime(0.18 * volume, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.09);
    body.connect(bodyGain).connect(ctx.destination);
    body.start(now);
    body.stop(now + 0.1);

    // Remate agudo.
    const tick = ctx.createOscillator();
    tick.type = 'square';
    tick.frequency.value = 1900;
    const tickGain = ctx.createGain();
    tickGain.gain.setValueAtTime(0.045 * volume, now);
    tickGain.gain.exponentialRampToValueAtTime(0.0005, now + 0.02);
    tick.connect(tickGain).connect(ctx.destination);
    tick.start(now);
    tick.stop(now + 0.025);
  }
}

export const sound = new ClickSound();

/* --------------------------------------------------------------- descargas */

/**
 * Descarga un archivo generado en el navegador (PNG o STL).
 * @param {Blob} blob
 * @param {string} nombre nombre completo, con extensión
 */
export function descargar(blob, nombre) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombre;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Convierte un texto en un nombre de archivo seguro. */
export function slug(texto, respaldo = 'vicunia') {
  return String(texto || '').toLowerCase().replace(/[^a-z0-9]/g, '') || respaldo;
}
