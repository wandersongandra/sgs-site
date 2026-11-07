import { chromium } from 'playwright';
import fs from 'fs';
const out='qa/prod/vid'; fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch();
for (const [name,vp,mob] of [['desk',{width:1440,height:900},false],['mob',{width:390,height:844},true]]) {
  const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:1,recordVideo:{dir:out,size:vp}});
  const p=await ctx.newPage(); await p.goto('http://127.0.0.1:4331/'); await p.waitForTimeout(4500);
  const H=await p.evaluate(()=>document.documentElement.scrollHeight-innerHeight);
  for(let y=0;y<=H;y+=mob?60:90){ if(mob) await p.evaluate(y=>scrollTo(0,y),y); else await p.mouse.wheel(0,90); await p.waitForTimeout(45);}
  await p.waitForTimeout(1500); const v=p.video(); await ctx.close(); fs.renameSync(await v.path(),`${out}/${name}.webm`);
}
await b.close();
