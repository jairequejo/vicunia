const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = path.resolve(__dirname);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.bin':  'application/octet-stream',
  '.xml':  'application/xml; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  let rawPath;
  try {
    rawPath = decodeURIComponent(req.url.split('?')[0]);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('400 - Solicitud inválida');
    return;
  }

  // Redirigir la raíz a la web pública de Vicunia
  if (rawPath === '/' || rawPath === '') {
    res.writeHead(302, { Location: '/web/' });
    res.end();
    return;
  }

  let filePath = path.join(ROOT, rawPath);

  try {
    if (fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
  } catch (e) {
    /* deja que readFile responda 404 */
  }

  const resolvedPath = path.resolve(filePath);

  if (!resolvedPath.startsWith(ROOT + path.sep) && resolvedPath !== ROOT) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 - Acceso denegado');
    return;
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - Archivo no encontrado');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 - Error interno del servidor');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  🦙  Vicunia — Un detalle tuyo, hecho en Cajamarca');
  console.log('');
  console.log(`  ✅  Web pública (Vicunia):       http://localhost:${PORT}/web/`);
  console.log(`  📦  Inventario (Mundo Suni):     http://localhost:${PORT}/mundo-suni/`);
  console.log(`  🎨  Presentación de Marca:       http://localhost:${PORT}/identidad-vicunia/brand_presentation.html`);
  console.log('');
  console.log('  Presiona Ctrl+C para detener.');
  console.log('');
});
