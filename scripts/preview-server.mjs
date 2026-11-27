import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const port = Number(process.env.PORT) || 3000;

const mimeTypes = {
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
};

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderList(items, folder) {
  return (items || [])
    .map(
      (item) =>
        `<li><a href="/${encodeURIComponent(folder)}/${encodeURIComponent(item.id)}.json">${escapeHtml(item.titleJa || item.id)}</a> <small>[${escapeHtml(item.level || '')}] ${escapeHtml(item.titleFr || '')}</small></li>`
    )
    .join('\n');
}

function renderCatalogHtml() {
  const manifestPath = path.join(rootDir, 'manifest.json');
  const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const texts = m.texts || [];
  const books = m.books || [];
  const gamebooks = m.gamebooks || [];
  const rpgGamebooks = m.rpgGamebooks || [];

  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Nihongo Reader — Catalogue de contenu</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 820px; margin: 36px auto; padding: 0 20px; line-height: 1.6; color: #1f2937; background: #faf8f5; }
    h1 { margin-bottom: 4px; color: #111827; }
    h2 { margin-top: 28px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; font-size: 1.15rem; }
    a { color: #9a3412; text-decoration: none; }
    a:hover { text-decoration: underline; }
    ul { padding-left: 20px; }
    li { margin-bottom: 6px; }
    small { color: #6b7280; }
    .meta { color: #4b5563; margin-bottom: 20px; }
    .pill { display: inline-block; background: #fef3c7; color: #92400e; padding: 2px 10px; border-radius: 6px; font-size: 0.85rem; margin-right: 6px; }
  </style>
</head>
<body>
  <h1>Nihongo Reader — Catalogue</h1>
  <p class="meta">
    Aperçu local du dépôt statique GitHub Pages · <a href="/manifest.json"><strong>manifest.json</strong></a>
  </p>
  <div>
    <span class="pill">Textes : ${texts.length}</span>
    <span class="pill">Livres : ${books.length}</span>
    <span class="pill">Livres-jeux : ${gamebooks.length}</span>
    <span class="pill">RPG : ${rpgGamebooks.length}</span>
  </div>
  <h2>Textes courts</h2>
  <ul>${renderList(texts, 'texts')}</ul>
  <h2>Livres</h2>
  <ul>${renderList(books, 'books')}</ul>
  <h2>Livres-jeux</h2>
  <ul>${renderList(gamebooks, 'gamebooks')}</ul>
  <h2>Livres-jeux RPG</h2>
  <ul>${renderList(rpgGamebooks, 'rpg-gamebooks')}</ul>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let urlPath = '/';
  try {
    urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  } catch {
    res.writeHead(400);
    res.end('Bad Request');
    return;
  }

  if (urlPath === '/' || urlPath === '/index.html') {
    try {
      const html = renderCatalogHtml();
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(req.method === 'HEAD' ? undefined : html);
    } catch {
      res.writeHead(500);
      res.end('Error reading manifest.json');
    }
    return;
  }

  const safePath = path.resolve(rootDir, '.' + urlPath);
  if (!safePath.startsWith(rootDir + path.sep)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(safePath, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(safePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    fs.createReadStream(safePath).pipe(res);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`[Catalog Preview] Serving static Nihongo Reader content on http://localhost:${port}`);
});
