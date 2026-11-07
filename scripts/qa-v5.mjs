import { chromium } from 'playwright';
import { mkdir, writeFile, readdir, rename } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const BASE='http://127.0.0.1:4330', OUT='/workspace/sgs-site/qa/v5';
await mkdir(OUT,{recursive:true});
const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
const IDS=['topo','produto','modulos','jornada','campo','sophie','seguranca','faq','contato'];
const browser=await chromium.launch();
const errs=[]; const report=[];
const ov=(page,label)=>page.evaluate((label)=>{const iw=innerWidth,sw=document.documentElement.scrollWidth;const off=[];
 for(const el of document.querySelectorAll('body *')){const r=el.getBoundingClientRect();if(r.width<2||r.height<2)continue;
 if(getComputedStyle(el).visibility==='hidden')continue; if(el.closest('.skip-link'))continue;
 if(r.right>iw+1.5||r.left<-1.5)off.push({tag:el.tagName,cls:String(el.className).slice(0,50),right:Math.round(r.right),text:(el.textContent||'').trim().slice(0,40)});}
 // also: clipped text inside elements
 const clip=[...document.querySelectorAll('h1,h2,h3,p,dt,dd,td,li,.st,.btn')].filter(e=>e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflow!=='visible').map(e=>e.textContent.trim().slice(0,40));
 return {label,iw,sw,ok:sw<=iw+1&&off.length===0,offenders:off.slice(0,10),clipped:clip};},label);
for(const [w,h,tag] of [[1440,900,'d1440'],[1280,800,'d1280'],[390,844,'m390'],[360,740,'m360']]){
  const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,isMobile:w<500,hasTouch:w<500});
  const page=await ctx.newPage();
  page.on('pageerror',e=>errs.push(`${tag} pageerror ${e.message}`));
  page.on('console',m=>{if(m.type()==='error')errs.push(`${tag} console ${m.text()}`)});
  await page.goto(BASE,{waitUntil:'networkidle'}); await wait(3200);
  for(const id of IDS){
    await page.evaluate(id=>{const el=document.getElementById(id);window.scrollTo(0,el.getBoundingClientRect().top+scrollY-(id==='topo'?0:64));},id);
    await wait(900);
    await page.screenshot({path:path.join(OUT,`${tag}-${id}.png`)});
    if(['topo','produto','jornada','seguranca','contato'].includes(id)||id==='faq'){ if(id!=='faq') report.push(await ov(page,`${tag}#${id}`)); }
  }
  if(w<500){ await page.evaluate(()=>scrollTo(0,0)); await wait(400); await page.click('[data-nav-toggle]'); await wait(300); await page.screenshot({path:path.join(OUT,`${tag}-menu.png`)}); }
  await ctx.close();
}
// 12/12 summary: per width, every section must pass -> count width×{topo,jornada,contato} = 12
const gate=report.filter(r=>/#(topo|jornada|contato)$/.test(r.label));
// reduced motion
{const ctx=await browser.newContext({viewport:{width:1280,height:800},reducedMotion:'reduce'});const page=await ctx.newPage();
 page.on('pageerror',e=>errs.push('rm '+e.message));
 await page.goto(BASE,{waitUntil:'networkidle'});await wait(500);
 const rm=await page.evaluate(()=>({lenis:document.documentElement.classList.contains('lenis'),hiddenReveal:[...document.querySelectorAll('.reveal')].filter(e=>getComputedStyle(e).opacity!=='1').length,frameOn:document.querySelectorAll('.jr-frame.is-on').length}));
 await page.screenshot({path:path.join(OUT,'rm-topo.png')});
 await page.evaluate(()=>document.getElementById('jornada').scrollIntoView());await wait(300);
 await page.screenshot({path:path.join(OUT,'rm-jornada.png')});
 await writeFile(path.join(OUT,'reduced-motion.json'),JSON.stringify(rm,null,2)); await ctx.close();}
// videos
for(const [w,h,name] of [[1440,900,'desk-scroll'],[390,844,'mob-scroll']]){
  const vd=path.join(OUT,'vid-'+name);await mkdir(vd,{recursive:true});
  const ctx=await browser.newContext({viewport:{width:w,height:h},recordVideo:{dir:vd,size:{width:w,height:h}},isMobile:w<500,hasTouch:w<500});
  const page=await ctx.newPage();await page.goto(BASE,{waitUntil:'networkidle'});await wait(4000);
  const total=await page.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
  for(let y=0;y<=total;y+=Math.round(h/7)){await page.mouse.wheel(0,Math.round(h/7)).catch(()=>{}); if(w<500) await page.evaluate(y=>scrollTo(0,y),y); await wait(260);}
  await wait(800);await ctx.close();
  const f=(await readdir(vd)).find(x=>x.endsWith('.webm'));
  spawnSync('ffmpeg',['-y','-loglevel','error','-i',path.join(vd,f),'-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart',path.join(OUT,name+'.mp4')]);
}
await browser.close();
await writeFile(path.join(OUT,'overflow-check.json'),JSON.stringify({gate:`${gate.filter(r=>r.ok).length}/${gate.length}`,all:report},null,2));
await writeFile(path.join(OUT,'console-errors.json'),JSON.stringify(errs,null,2));
console.log('gate',gate.filter(r=>r.ok).length+'/'+gate.length,'allOk',report.every(r=>r.ok),'errs',errs.length, report.filter(r=>!r.ok||r.clipped.length).map(r=>r.label+JSON.stringify(r.offenders.slice(0,2))+JSON.stringify(r.clipped)).join('\n'));
