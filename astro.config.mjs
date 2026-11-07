// @ts-check
import { defineConfig } from 'astro/config';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SITE = 'https://sgsseguranca.com.br';
/** Único interruptor de indexação: PUBLIC_INDEXABLE=true libera robots meta, X-Robots-Tag e robots.txt. */
const INDEXABLE = process.env.PUBLIC_INDEXABLE === 'true';

/** Gera _headers (CSP com hash dos scripts inline), robots.txt e sitemap.xml depois do build. */
function prodFiles() {
  return {
    name: 'sgs-prod-files',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const out = fileURLToPath(dir);
        const hashes = new Set();
        for (const page of ['index.html', '404.html']) {
          const html = await readFile(path.join(out, page), 'utf8').catch(() => '');
          for (const m of html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)) {
            hashes.add(`'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`);
          }
        }
        const csp = [
          "default-src 'self'",
          `script-src 'self' ${[...hashes].join(' ')}`,
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data:",
          "font-src 'self'",
          "connect-src 'self'",
          "manifest-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'none'",
          "frame-ancestors 'none'",
        ].join('; ');
        const headers = `/*
  Content-Security-Policy: ${csp}
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Cross-Origin-Opener-Policy: same-origin
${INDEXABLE ? '' : '  X-Robots-Tag: noindex, nofollow\n'}
/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/*.png
  Cache-Control: public, max-age=86400

/*.svg
  Cache-Control: public, max-age=86400
`;
        await writeFile(path.join(out, '_headers'), headers);
        await writeFile(
          path.join(out, 'robots.txt'),
          INDEXABLE ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n',
        );
        await writeFile(
          path.join(out, 'sitemap.xml'),
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>\n</urlset>\n`,
        );
      },
    },
  };
}

export default defineConfig({
  site: SITE,
  compressHTML: true,
  build: { inlineStylesheets: 'auto' },
  // Sem data: URIs (fontes/imagens) para manter a CSP estrita
  vite: { build: { assetsInlineLimit: 0 } },
  integrations: [prodFiles()],
});
