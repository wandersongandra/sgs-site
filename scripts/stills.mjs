import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const OUT=process.argv[2]; const BASE=process.argv[3]||'http://127.0.0.1:4330/';
await mkdir(OUT,{recursive:true});
const b=await chromium.launch();
for(const [w,h,t] of [[1440,900,'d'],[390,844,'m']]){
  const ctx=await b.newContext({viewport:{width:w,height:h},isMobile:t==='m',hasTouch:t==='m'});
  await ctx.addInitScript(()=>{try{sessionStorage.setItem('sgs-preloader-done','1')}catch{}});
  const p=await ctx.newPage(); await p.goto(BASE,{waitUntil:'networkidle'}); await p.waitForTimeout(4000);
  const n=await p.evaluate(()=>document.querySelectorAll('main > section, footer').length);
  for(let i=0;i<n;i++){
    await p.evaluate(i=>{const el=document.querySelectorAll('main > section, footer')[i];window.scrollTo(0,el.getBoundingClientRect().top+scrollY);},i);
    await p.waitForTimeout(1800);
    await p.screenshot({path:`${OUT}/${t}-${String(i).padStart(2,'0')}.png`});
  }
  await ctx.close();
}
await b.close();
