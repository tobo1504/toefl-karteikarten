// Smoke-Test: NODE_PATH=$(npm root -g) node trainer/tests/smoke.js
const {chromium}=require('playwright');const path=require('path');
const FILE='file://'+path.resolve(__dirname,'../index.html');
const MOCK=`window.__TT_SPEED=40;
Object.defineProperty(window,"speechSynthesis",{configurable:true,value:{speaking:false,getVoices:()=>[{name:"Samantha",lang:"en-US"},{name:"Daniel",lang:"en-GB"}],cancel(){},addEventListener(){},
  speak(u){setTimeout(()=>u.onend&&u.onend(),5)}}});
Object.defineProperty(window,"SpeechSynthesisUtterance",{configurable:true,value:function(t){this.text=t}});`;
(async()=>{
  const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1200,height:900}});await ctx.addInitScript(MOCK);
  const p=await ctx.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|net::/.test(m.text()))errs.push(m.text())});
  await p.goto(FILE);await p.waitForSelector('[data-test="reading"]');
  const step=async()=>{
    if(await p.$('.ctw')){for(const i of await p.$$('.gap input'))await i.fill('ab')}
    if(await p.$('.bank')){let c;while((c=await p.$('.bank .chip:not(.used)')))await c.click()}
    if(await p.$('#w'))await p.fill('#w','Dear Ms. Carter, I hope you are doing well. This is a test response.');
    await p.waitForTimeout(60);
    const o=await p.$$('.opt');if(o.length&&await o[0].isVisible())await o[Math.floor(Math.random()*o.length)].click();
    if(await p.$('#say:not([disabled])')){await p.fill('#say','Welcome to the university and stay together');}
    for(let w=0;w<60&&await p.$('#next[disabled]');w++)await p.waitForTimeout(50);
    if(await p.$('#say:not([disabled])'))await p.waitForTimeout(700);
    if(await p.$('#next'))await p.click('#next',{timeout:2500}).catch(()=>{});
    const y=await p.$('#cb-yes');if(y)await y.click();
  };
  const runUntil=async(sel,max)=>{for(let k=0;k<max;k++){if(await p.$(sel))return true;await step()}return !!(await p.$(sel))};
  for(const sec of ['reading','listening','writing','speaking']){
    console.log('start',sec,new Date().toISOString().slice(11,19));await p.click(`[data-test="${sec}"]`);
    if(!await runUntil('.bandrow',400))errs.push(sec+'-Test endet nicht');
    else console.log(sec+':',(await p.textContent('.bandrow')).replace(/\s+/g,' ').trim(),'| Bewertungsknöpfe:',(await p.$$('.evalbox .btn')).length);
    await p.click('#home');
  }
  await p.click('#full');await p.click('#cb-yes');
  if(!await runUntil('.bandrow',800))errs.push('Kompletter Test endet nicht');else console.log('voll:',(await p.textContent('.bandrow')).replace(/\s+/g,' ').trim());
  await p.click('#home');
  for(const t of ['ctw','daily','academic','choose','conversation','announcement','talk','bas','email','discussion','repeat','interview']){
    await p.click(`[data-practice="${t}"]`);
    if(!await runUntil('#again',40))errs.push('Training '+t+' endet nicht');
    await p.click('#home');
  }
  await p.setViewportSize({width:390,height:800});await p.click('[data-practice="talk"]');await p.waitForTimeout(300);await p.screenshot({path:path.resolve(__dirname,'phone.png')});
  console.log(errs.length?'FEHLER:\n'+errs.join('\n'):'Smoke-Test OK');
  await b.close();process.exit(errs.length?1:0);
})();
