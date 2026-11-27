/**
 * Formulario de la foto de la portada: arrastrar o elegir un archivo,
 * comprobarlo y armar el pedido de WhatsApp. La foto no se sube a ningún
 * servidor: se adjunta en el chat.
 */
import { openWhatsApp } from '../config.js';
import { $ } from '../dom.js';
import { toast } from './comun.js';

/* -------------------------------------------------------------- constantes */

const MAX_FILE = 100 * 1024 * 1024; // 100 MB
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif', '.gif'];

/* --------------------------------------------------------------- controles */

const els = {
  dropzone: $('#dropzone'),
  fileInput: $('#file'),
  fileCard: $('#file-card'),
  fileName: $('#file-name'),
  fileSize: $('#file-size'),
  fileRemove: $('#file-remove'),
  form: $('#upload-form'),
  submit: $('#submit-design')
};

let currentFile = null;

/* --------------------------------------------------------------- archivo */

/** Valida la foto elegida y la muestra en la tarjeta del formulario. */
function updateFile(file) {
  if (!file) return;

  const dot = file.name.lastIndexOf('.');
  const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : '';

  if (!ALLOWED_EXT.includes(ext)) {
    toast('Ese formato no lo podemos leer. Usa JPG, PNG, WEBP o HEIC.');
    return;
  }
  if (file.size > MAX_FILE) {
    toast('La foto pasa de 100 MB. Envíala por WhatsApp y la vemos desde ahí.');
    return;
  }

  currentFile = file;
  if (els.fileName) els.fileName.textContent = file.name;
  if (els.fileSize) {
    const mb = file.size / (1024 * 1024);
    els.fileSize.textContent = mb < 0.1
      ? `${Math.max(1, Math.round(file.size / 1024))} KB`
      : `${mb.toFixed(1)} MB`;
  }
  if (els.fileCard) els.fileCard.hidden = false;
}

/** Quita la foto del formulario. */
function clearFile() {
  currentFile = null;
  if (els.fileInput) els.fileInput.value = '';
  if (els.fileCard) els.fileCard.hidden = true;
}

/* ------------------------------------------------------------ validación */

function setError(field, message) {
  const input = $(`#${field}`);
  const holder = $(`[data-error-for="${field}"]`);

  if (holder) {
    holder.textContent = message || '';
    holder.hidden = !message;
  }
  if (input) {
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }
}

function validateForm() {
  let firstInvalid = null;
  const name = $('#name');
  const phone = $('#phone');
  const rights = $('#rights');

  setError('name', '');
  setError('phone', '');
  setError('rights', '');

  if (!name || name.value.trim().length < 2) {
    setError('name', 'Escribe tu nombre para saber con quién hablamos.');
    firstInvalid = firstInvalid || name;
  }

  const digits = (phone?.value || '').replace(/\D/g, '');
  if (digits.length > 0 && digits.length < 6) {
    setError('phone', 'Si escribes tu número, ingresa al menos 6 dígitos.');
    firstInvalid = firstInvalid || phone;
  }

  if (!rights?.checked) {
    setError('rights', 'Necesitamos tu confirmación antes de imprimir.');
    firstInvalid = firstInvalid || rights;
  }

  if (firstInvalid) {
    firstInvalid.focus({ preventScroll: false });
    return false;
  }
  return true;
}

/* ------------------------------------------------------------- arranque */

/** Conecta la zona de carga, la validación y el envío del formulario. */
export function initFoto() {
  const dropzone = els.dropzone;
  if (!dropzone) return;

  dropzone.addEventListener('click', () => els.fileInput?.click());
  dropzone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      els.fileInput?.click();
    }
  });

  ['dragenter', 'dragover'].forEach((type) => {
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      dropzone.classList.add('is-over');
    });
  });

  ['dragleave', 'drop', 'dragend'].forEach((type) => {
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      dropzone.classList.remove('is-over');
    });
  });

  dropzone.addEventListener('drop', (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (file) updateFile(file);
  });

  els.fileInput?.addEventListener('change', () => {
    const file = els.fileInput.files?.[0];
    if (file) updateFile(file);
  });

  els.fileRemove?.addEventListener('click', clearFile);

  els.form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateForm()) {
      toast('Revisa los campos marcados.');
      return;
    }

    const name = $('#name')?.value.trim() || '';
    const phone = $('#phone')?.value.trim() || '';
    const kind = $('#kind')?.value || 'Diseño personalizado';
    const qty = $('#qty')?.value || '1';
    const notes = $('#notes')?.value.trim() || '';
    const fileLine = currentFile
      ? `Foto: ${currentFile.name} (${els.fileSize?.textContent || ''}) — la adjunto en este chat.`
      : 'Todavía no tengo la foto: les cuento la idea y lo vemos.';

    const message = [
      `Hola Vicunia 👋 Soy ${name}.`,
      `Quiero encargar: ${kind} (x${qty}).`,
      fileLine,
      notes ? `Idea: ${notes}` : '',
      phone ? `Mi WhatsApp: ${phone}` : '',
      '',
      '¿Me confirman vista previa, precio y tiempo de entrega?'
    ].filter(Boolean).join('\n');

    openWhatsApp(message);
    toast('Abrimos WhatsApp con tu pedido. Adjunta tu foto directo en el chat.');
  });
}
