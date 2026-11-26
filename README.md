# SGS Segurança: site

Astro 5 estático. `npm run build` gera `dist/` (inclui `_headers`, `robots.txt`, `sitemap.xml`).

## Indexação (PUBLIC_INDEXABLE)
Por padrão o site sai **noindex** (meta robots `noindex, nofollow`, header `X-Robots-Tag: noindex, nofollow`, `robots.txt` com `Disallow: /`).

Para liberar no lançamento, uma única flag:

```bash
PUBLIC_INDEXABLE=true npm run build
```

Isso troca as três coisas juntas: meta robots `index, follow`, remove o `X-Robots-Tag` e gera `robots.txt` com `Allow: /` + `Sitemap: https://sgsseguranca.com.br/sitemap.xml`. No Cloudflare Pages, defina a variável de ambiente `PUBLIC_INDEXABLE=true` no projeto e refaça o build. A página 404 continua sempre noindex.

## Deploy (Cloudflare Pages)
- Build command: `npm run build` · Output: `dist`
- Domínio canônico: `https://sgsseguranca.com.br/` (definido em `astro.config.mjs` → `site` e `src/config.ts`).
- Headers de segurança (CSP com hashes dos scripts inline, HSTS, nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors none) e cache longo de `/_astro/*` são gerados no build. Não edite `dist/_headers` à mão; altere `astro.config.mjs`.
- Se adicionar script inline novo, o hash entra na CSP automaticamente no build.
- Sem analytics e sem cookies.

## QA
`node scripts/serve-headers.mjs` (porta 4331, aplica `_headers`) e `node scripts/qa-prod.mjs`.
