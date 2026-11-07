import { chromium, firefox, webkit } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const BASE='http://127.0.0.1:4331/'; const OUT='qa/prod'; await mkdir(OUT,{recursive:true});
const R={browsers:{},overflow:[],axe:{},keyboard:{},nojs:{},slow3g:{},links:{},notfound:{},errors:[]};
const W=[[1440,900],[1280,800],[768,1024],[390,844],[360,740]];
const ovf=(p)=>p.evaluate(()=>{const iw=innerWidth,sw=document.documentElement.scrollWidth;return {iw,sw,ok:sw<=iw+1};});
for (const bt of [chromium,firefox,webkit]){
  let b; try{ b=await bt.launch(); }catch(e){ R.browsers[bt.name()]='não executado: '+e.message.split('\n')[0].slice(0,120); continue; }
  R.browsers[bt.name()]={};
  for(const [w,h] of W){
    const mob=w<800 && bt.name()!=='firefox';
    const ctx=await b.newContext({viewport:{width:w,height:h},...(mob?{isMobile:true,hasTouch:true}:{})});
    const p=await ctx.newPage(); const errs=[];
    p.on('console',m=>{if(m.type()==='error'||/Content Security Policy|CSP/i.test(m.text()))errs.push(m.text())});
    p.on('pageerror',e=>errs.push('pageerror '+e.message));
    await p.goto(BASE,{waitUntil:'load'}); await p.waitForTimeout(2500);
    const secs=[]; 
    for(const id of ['topo','produto','modulos','jornada','campo','sophie','seguranca','faq','contato']){
      await p.evaluate(id=>{const e=document.getElementById(id);scrollTo(0,e.getBoundingClientRect().top+scrollY)},id); await p.waitForTimeout(350);
      const o=await ovf(p); secs.push(o.ok); if(['topo','jornada','seguranca','contato','produto'].includes(id)&&[1440,1280,390,360].includes(w)) R.overflow.push({b:bt.name(),w,id,...o});
    }
    await p.evaluate(()=>scrollTo(0,document.body.scrollHeight)); await p.waitForTimeout(400);
    const pre=await p.evaluate(()=>{const e=document.querySelector('.preloader');return e?getComputedStyle(e).visibility:'none'});
    R.browsers[bt.name()][w]={allSectionsNoOverflow:secs.every(Boolean),preloaderHidden:pre==='hidden'||pre==='none',errors:errs};
    errs.forEach(e=>R.errors.push(`${bt.name()} ${w}: ${e}`));
    await ctx.close();
  }
  await b.close();
}
const b=await chromium.launch();
// axe 1440 + 390, after scrolling through (all reveals visible)
for(const [w,h] of [[1440,900],[390,844]]){
  const ctx=await b.newContext({viewport:{width:w,height:h}}); const p=await ctx.newPage();
  await p.goto(BASE,{waitUntil:'load'}); await p.waitForTimeout(2500);
  for(let y=0;y<20000;y+=400){await p.evaluate(y=>scrollTo(0,y),y);await p.waitForTimeout(60);}
  await p.waitForTimeout(1200);
  const r=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']).analyze();
  R.axe[w]=r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,targets:v.nodes.slice(0,4).map(n=>n.target.join(' ')),summary:v.nodes[0]?.failureSummary?.slice(0,200)}));
  await ctx.close();
}
// 404 axe + status
{const ctx=await b.newContext({viewport:{width:1280,height:800}});const p=await ctx.newPage();const errs=[];p.on('console',m=>m.type()==='error'&&!/404/.test(m.text())&&errs.push(m.text()));p.on('pageerror',e=>errs.push(e.message));
 const resp=await p.goto(BASE+'nao-existe',{waitUntil:'load'});await p.waitForTimeout(1500);
 const r=await new AxeBuilder({page:p}).analyze();await p.screenshot({path:OUT+'/404-1280.png'});
 R.notfound={status:resp.status(),robots:await p.getAttribute('meta[name=robots]','content'),h1:await p.textContent('h1'),axe:r.violations.map(v=>v.id),errors:errs};await ctx.close();}
// keyboard
{const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await ctx.newPage();await p.goto(BASE);await p.waitForTimeout(2000);
 const k={};
 await p.keyboard.press('Tab'); k.firstFocus=await p.evaluate(()=>document.activeElement.textContent.trim());
 await p.focus('[data-nav-toggle]'); await p.keyboard.press('Enter'); await p.waitForTimeout(300);
 k.menuExpanded=await p.getAttribute('[data-nav-toggle]','aria-expanded'); k.menuLabel=await p.getAttribute('[data-nav-toggle]','aria-label');
 await p.keyboard.press('Escape'); await p.waitForTimeout(300); k.afterEscape=await p.getAttribute('[data-nav-toggle]','aria-expanded');
 if(k.afterEscape==='true'){await p.click('[data-nav-toggle]');}
 await ctx.close();
 const c2=await b.newContext({viewport:{width:1440,height:900}});const q=await c2.newPage();await q.goto(BASE);await q.waitForTimeout(2000);
 await q.focus('[data-mod-tab]'); await q.keyboard.press('ArrowRight'); await q.waitForTimeout(200);
 k.tabArrow=await q.evaluate(()=>({focused:document.activeElement.id,selected:document.querySelector('[data-mod-tab][aria-selected=true]')?.id,visiblePanel:[...document.querySelectorAll('[data-mod-panel]')].filter(x=>!x.hidden).map(x=>x.id)}));
 await q.focus('#faq summary'); await q.keyboard.press('Enter'); k.faqOpen=await q.evaluate(()=>document.querySelector('#faq details').open);
 k.focusRing=await q.evaluate(()=>{const s=getComputedStyle(document.activeElement);return s.outlineStyle+' '+s.outlineWidth+' '+s.outlineColor});
 k.nativeCursorBeforeMouse=await q.evaluate(()=>getComputedStyle(document.body).cursor);
 await q.mouse.move(300,300);await q.mouse.move(320,320);await q.waitForTimeout(200);
 k.cursorOnAfterMouse=await q.evaluate(()=>document.documentElement.classList.contains('cursor-on'));
 await c2.close();
 const c3=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});const r3=await c3.newPage();await r3.goto(BASE);await r3.waitForTimeout(1500);
 k.reducedMotion=await r3.evaluate(()=>({nativeCursor:getComputedStyle(document.body).cursor,cursorOn:document.documentElement.classList.contains('cursor-on'),lenis:document.documentElement.classList.contains('lenis'),preloader:getComputedStyle(document.querySelector('.preloader')).visibility}));
 await c3.close(); R.keyboard=k;}
// JS disabled
for(const [w,h] of [[1440,900],[390,844]]){const ctx=await b.newContext({viewport:{width:w,height:h},javaScriptEnabled:false});const p=await ctx.newPage();await p.goto(BASE);await p.waitForTimeout(500);
 R.nojs[w]=await p.evaluate(()=>({preloaderDisplay:getComputedStyle(document.querySelector('.preloader')).display,hiddenReveals:[...document.querySelectorAll('.reveal')].filter(e=>getComputedStyle(e).opacity!=='1').length,h1:document.querySelector('h1').innerText.replace(/\s+/g,' '),cursor:getComputedStyle(document.body).cursor}));
 await p.screenshot({path:`${OUT}/nojs-${w}.png`});await p.evaluate(()=>scrollTo(0,3000));await p.screenshot({path:`${OUT}/nojs-${w}-mid.png`});await ctx.close();}
// slow 3G: block the JS bundle entirely and also throttle
{const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();
 await p.route('**/_astro/*.js',r=>r.abort());
 await p.goto(BASE,{waitUntil:'domcontentloaded'});
 const t0=Date.now(); await p.waitForFunction(()=>getComputedStyle(document.querySelector('.preloader')).visibility==='hidden'&&[...document.querySelectorAll('.reveal')].every(e=>getComputedStyle(e).opacity==='1'),null,{timeout:15000}).catch(()=>{});
 R.slow3g.jsBlocked={contentVisibleAfterMs:Date.now()-t0,ok:await p.evaluate(()=>getComputedStyle(document.querySelector('.preloader')).visibility==='hidden')};
 await p.screenshot({path:`${OUT}/jsblocked-390.png`});await ctx.close();
 const c2=await b.newContext({viewport:{width:390,height:844}});const q=await c2.newPage();const cdp=await c2.newCDPSession(q);
 await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:400,downloadThroughput:500*1024/8,uploadThroughput:500*1024/8});
 const t1=Date.now();await q.goto(BASE,{waitUntil:'domcontentloaded'});
 await q.waitForFunction(()=>getComputedStyle(document.querySelector('.preloader')).visibility==='hidden',null,{timeout:30000}).catch(()=>{});
 R.slow3g.throttled={preloaderGoneAfterMs:Date.now()-t1};await c2.close();}
// links
{const ctx=await b.newContext();const p=await ctx.newPage();await p.goto(BASE);
 const links=await p.$$eval('a[href]',as=>as.map(a=>({href:a.getAttribute('href'),target:a.target,rel:a.rel,text:a.textContent.trim().slice(0,30)})));
 const ids=await p.$$eval('[id]',e=>e.map(x=>x.id));
 R.links={total:links.length,
  brokenAnchors:links.filter(l=>l.href.startsWith('#')&&l.href.length>1&&!ids.includes(l.href.slice(1))).map(l=>l.href),
  blankWithoutRel:links.filter(l=>l.target==='_blank'&&!(/noopener/.test(l.rel)&&/noreferrer/.test(l.rel))).map(l=>l.href),
  whatsapp:[...new Set(links.filter(l=>l.href.includes('wa.me')).map(l=>decodeURIComponent(l.href)))],
  external:[...new Set(links.filter(l=>/^(https?:|mailto:)/.test(l.href)).map(l=>l.href.split('?')[0]))]};
 R.links.status={};
 for(const u of R.links.external.filter(u=>u.startsWith('http'))){try{const r=await ctx.request.get(u,{maxRedirects:5,timeout:20000});R.links.status[u]=r.status();}catch(e){R.links.status[u]='erro: '+e.message.slice(0,80)}}
 await ctx.close();}
await b.close();
await writeFile(OUT+'/qa-prod.json',JSON.stringify(R,null,2));
const g=R.overflow.filter(o=>o.b==='chromium'&&['topo','jornada','seguranca','contato','produto'].includes(o.id));
console.log(JSON.stringify({gateChromium:`${g.filter(o=>o.ok).length}/${g.length}`,overflowAllBrowsers:R.overflow.every(o=>o.ok),errors:R.errors,axe:R.axe,notfound:R.notfound,keyboard:R.keyboard,nojs:R.nojs,slow3g:R.slow3g,links:R.links,browsers:Object.fromEntries(Object.entries(R.browsers).map(([k,v])=>[k,typeof v==='string'?v:Object.fromEntries(Object.entries(v).map(([w,x])=>[w,x.allSectionsNoOverflow&&x.preloaderHidden&&!x.errors.length]))]))},null,1));
