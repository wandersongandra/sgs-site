// Servidor estático que aplica dist/_headers (simula Cloudflare Pages) para testar CSP e cache.
import http from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
const DIST = path.resolve('dist'); const PORT = +(process.argv[2] || 4331);
const blocks = []; let cur = null;
for (const line of readFileSync(path.join(DIST, '_headers'), 'utf8').split('\n')) {
  if (!line.trim()) continue;
  if (!line.startsWith(' ')) { cur = { pat: line.trim(), h: [] }; blocks.push(cur); }
  else { const i = line.indexOf(':'); cur.h.push([line.slice(0, i).trim(), line.slice(i + 1).trim()]); }
}
const match = (pat, p) => new RegExp('^' + pat.replace(/[.]/g, '\\.').replace(/\*/g, '.*') + '$').test(p);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  let f = path.join(DIST, p), status = 200;
  if (!f.startsWith(DIST) || !existsSync(f) || statSync(f).isDirectory()) { f = path.join(DIST, '404.html'); status = 404; }
  for (const b of blocks) if (match(b.pat, p)) for (const [k, v] of b.h) res.setHeader(k, v);
  res.setHeader('Content-Type', types[path.extname(f)] || 'application/octet-stream');
  res.writeHead(status); res.end(readFileSync(f));
}).listen(PORT, '127.0.0.1', () => console.log('serving', PORT));
