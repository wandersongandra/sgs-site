import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
const font = 'data:font/woff2;base64,' + readFileSync('node_modules/@fontsource-variable/plus-jakarta-sans/files/plus-jakarta-sans-latin-wght-normal.woff2').toString('base64');
const mark = readFileSync('public/logo-sgs-mark.svg','utf8');
const b = await chromium.launch(); const p = await b.newPage();
const ff = `@font-face{font-family:J;src:url(${font}) format('woff2');font-weight:200 800}*{margin:0;box-sizing:border-box}body{font-family:J}`;
await p.setViewportSize({width:1200,height:630});
await p.setContent(`<style>${ff}
.o{width:1200px;height:630px;background:#1D5B8D;color:#fff;padding:84px 96px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden}
.o::after{content:"";position:absolute;left:0;right:0;bottom:0;height:14px;background:#0D3457}
.b{display:flex;align-items:center;gap:26px}.m{width:104px;height:104px;background:#fff;border-radius:24px;display:grid;place-items:center}.m svg{width:76px;height:76px}
.n{font-size:46px;font-weight:750;letter-spacing:-0.02em}
h1{font-size:68px;line-height:1.08;font-weight:780;letter-spacing:-0.03em;word-spacing:0.04em;max-width:20ch}
.u{font-size:28px;opacity:.82;font-weight:500}</style>
<div class="o"><div class="b"><div class="m">${mark}</div><div class="n">SGS Segurança</div></div>
<h1>Gestão de Segurança e Saúde do Trabalho</h1><div class="u">APR · PT · Checklists · Documentos · Treinamentos</div></div>`);
await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);
await p.screenshot({path:'public/og-image.png'});
for (const [s,name,pad] of [[180,'apple-touch-icon.png',22],[192,'icon-192.png',22],[512,'icon-512.png',60],[32,'favicon-32.png',2]]){
  await p.setViewportSize({width:s,height:s});
  await p.setContent(`<style>*{margin:0}body{width:${s}px;height:${s}px;background:#fff;display:grid;place-items:center}svg{width:${s-pad*2}px;height:${s-pad*2}px}</style>${mark}`);
  await p.screenshot({path:'public/'+name, omitBackground:false});
}
await b.close();
