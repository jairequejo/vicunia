const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const PORTS = [8080, 8765];
if (process.env.PORT) {
  const p = parseInt(process.env.PORT, 10);
  if (!PORTS.includes(p)) PORTS.unshift(p);
}

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

function handler(req, res) {
  let rawPath;
  try {
    rawPath = decodeURIComponent(req.url.split('?')[0]);
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
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
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 - Acceso denegado');
    return;
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 - Archivo no encontrado');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 - Error interno del servidor');
      }
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(data);
  });
}

const activeServers = [];
PORTS.forEach(port => {
  const s = http.createServer(handler);
  s.on('error', (err) => {
    // Si el puerto ya está en uso, continúa con el otro
  });
  s.listen(port, '0.0.0.0', () => {
    activeServers.push(port);
    if (activeServers.length === 1) {
      console.log('');
      console.log('  🦙  Vicunia — Un detalle tuyo, hecho en Cajamarca');
      console.log('');
      console.log(`  ✅  Catálogo 3D:             http://localhost:${port}/web/catalogo.html`);
      console.log(`  ✅  Web pública:             http://localhost:${port}/web/`);
      console.log(`  🎨  Presentación de Marca:   http://localhost:${port}/identidad-vicunia/brand_presentation.html`);
    } else {
      console.log(`  ✅  Disponible también en:   http://localhost:${port}/web/catalogo.html`);
    }
  });
});
