/**
 * Datos de contacto.
 * Cambia solo estas líneas cuando tengas el número definitivo.
 */
export const CONFIG = {
  // Código de país + número, sin "+", sin espacios.
  whatsapp: '51907677175',
  instagram: 'https://www.instagram.com/vicuniacax',
  tiktok: 'https://www.tiktok.com/@vicuniacax',
  facebook: 'https://www.facebook.com/profile.php?id=61590919520057',
  email: '',
  ciudad: 'Cajamarca, Perú',
  web: 'vicunia.pe'
};

/** Arma el enlace de WhatsApp. Si no hay número, abre el selector de contacto. */
export function waLink(text) {
  const message = encodeURIComponent(text);
  if (CONFIG.whatsapp) {
    return `https://wa.me/${CONFIG.whatsapp.replace(/\D/g, '')}?text=${message}`;
  }
  return `https://api.whatsapp.com/send?text=${message}`;
}

export function openWhatsApp(text) {
  const url = waLink(text);
  const win = window.open(url, '_blank', 'noopener');
  if (!win) window.location.href = url;
}
