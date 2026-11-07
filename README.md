# SGS Segurança — site

Site de uma página do SGS Segurança (Astro 5, GSAP, Lenis). O conteúdo e a base azul `#1D5B8D` seguem a identidade já aprovada. `npm run build` gera `dist/` para Cloudflare Pages, com `_headers`, `robots.txt` e `sitemap.xml`.

Por padrão o build sai **noindex**. Para indexar no lançamento:

```bash
PUBLIC_INDEXABLE=true npm run build
```

A página 404 continua noindex. Não há `.env` neste projeto.

## Desenvolvimento

```bash
npm ci
npm run dev -- --host 127.0.0.1 --port 43117
npm run build
node scripts/serve-headers.mjs 4331
node scripts/qa-motion.mjs
QA_BASE=http://127.0.0.1:4331/ node scripts/qa-prod.mjs
```

## Motion

Uma página só (`/` e `404`). A navegação entre seções é o equivalente de transição de rota: âncora com foco, indicador da seção atual e um fio que atravessa a jornada registrar → assinar → evidenciar → acompanhar. Sem preloader bloqueante, sem cursor artificial, sem scroll sequestrado e sem pinning. `prefers-reduced-motion` deixa o conteúdo estático e não liga o Lenis.

Detalhe em `NOTA-TECNICA.md`.

## Cloudflare Pages

O build usa a raiz do repositório. No conector, deixe o diretório raiz vazio.

| Campo | Valor |
| --- | --- |
| Branch de produção | `main` |
| Comando de build | `npm run build` |
| Diretório de saída | `dist` |
| Node.js | `22.23.4` |

A versão está em `.node-version`. O build image v3 do Pages não lê `engines` do `package.json`; o arquivo é o que o build usa. `package.json` continua com `engines.node` `>=22`. Se `NODE_VERSION` for definida no projeto, ela substitui o arquivo — use `22.23.4` ou deixe sem definir.

Deixe `PUBLIC_INDEXABLE` sem definir. Assim o build permanece noindex (`X-Robots-Tag`, meta robots e `robots.txt` com `Disallow: /`). A página 404 continua noindex mesmo com a variável ligada. Não há `_redirects`. Um fallback `/* /index.html 200` faria a rota inexistente responder 200.
