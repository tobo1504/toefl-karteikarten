// Smoke-Test: node trainer/tests/smoke.js  (NODE_PATH=$(npm root -g))
const {chromium}=require('playwright');const path=require('path');
const FILE='file://'+path.resolve(__dirname,'../index.html');
(async()=>{
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:900}});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|net::/.test(m.text()))errs.push(m.text())});
  await p.goto(FILE);await p.waitForSelector('[data-test="reading"]');
  const confirmYes=async()=>{const y=await p.$('#cb-yes');if(y)await y.click()};
  // Reading-Test komplett
  await p.click('[data-test="reading"]');
  for(let k=0;k<200;k++){
    if(await p.$('.ctw')){const ins=await p.$$('.gap input');for(const i of ins)await i.fill('ab')}
    const o=await p.$$('.opt');if(o.length)await o[Math.floor(Math.random()*o.length)].click();
    await p.click('#next');await confirmYes();
    if(await p.$('.bandrow'))break;
  }
  const band=await p.textContent('.bandrow');console.log('Reading-Ergebnis:',band.replace(/\s+/g,' ').trim());
  await p.click('#home');
  // Writing-Test komplett
  await p.click('[data-test="writing"]');
  for(let k=0;k<30;k++){
    if(await p.$('.bank')){let c;while((c=await p.$('.bank .chip:not(.used)')))await c.click()}
    if(await p.$('#w'))await p.fill('#w','Dear Ms. Carter, I hope you are doing well. This is a test response with several words in it.');
    await p.click('#next');await confirmYes();
    if(await p.$('.bandrow'))break;
  }
  console.log('Writing-Ergebnis:',(await p.textContent('.bandrow')).replace(/\s+/g,' ').trim(),'| Bewertungsknöpfe:',(await p.$$('.evalbox .btn')).length);
  await p.click('#home');
  // Training je Typ
  for(const t of ['ctw','daily','academic','bas','email','discussion']){
    await p.click(`[data-practice="${t}"]`);
    for(let k=0;k<10;k++){await p.click('#next');await confirmYes();if(await p.$('#again'))break}
    if(!await p.$('#again'))errs.push('Training '+t+' endet nicht');
    await p.click('#home');
  }
  await p.setViewportSize({width:390,height:800});await p.click('[data-practice="academic"]');await p.screenshot({path:path.resolve(__dirname,'phone.png')});
  console.log(errs.length?'FEHLER:\n'+errs.join('\n'):'Smoke-Test OK');
  await b.close();process.exit(errs.length?1:0);
})();
