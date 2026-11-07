import { chromium } from 'playwright';
const b=await chromium.launch();
for (const [w,h,ids] of [[1440,900,['topo','modulos','sophie','seguranca','contato']],[360,740,['jornada','modulos','sophie','contato']]]){
 const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage();
 await p.goto('http://127.0.0.1:4330',{waitUntil:'networkidle'});await p.waitForTimeout(3000);
 for(const id of ids){await p.evaluate(id=>scrollTo(0,id==='topo'?0:document.getElementById(id).offsetTop-64),id);await p.waitForTimeout(900);await p.screenshot({path:`/tmp/s-${w}-${id}.png`});}
}
await b.close();
