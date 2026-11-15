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
  '.woff': 'font/woff'
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

  let filePath = path.join(ROOT, rawPath === '/' ? 'index.html' : rawPath);

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
  console.log('  🦙  Vicuinia — Mundo Suni');
  console.log('');
  console.log(`  ✅  Servidor listo en → http://localhost:${PORT}`);
  console.log('');
  console.log('  Presiona Ctrl+C para detener.');
  console.log('');
});
