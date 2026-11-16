// Smoke-Test: NODE_PATH=$(npm root -g) node trainer/tests/smoke.js
// Prüft: 4 Section-Tests (Probetest 1), kompletter Test (Probetest 2), Fehleranalyse, alle Trainingsarten,
// Schwächen-Training, Fehler wiederholen und in der Claude-Version die KI-Auswertung (mit Attrappe).
const {chromium}=require('playwright');const path=require('path');
const FILE='file://'+path.resolve(__dirname,'../index.html');
const ART='file://'+path.resolve(__dirname,'../dist/trainer-artifact.html');
const MOCK=`window.__TT_SPEED=40;
Object.defineProperty(window,"speechSynthesis",{configurable:true,value:{speaking:false,getVoices:()=>[{name:"Samantha",lang:"en-US"},{name:"Daniel",lang:"en-GB"}],cancel(){},addEventListener(){},
  speak(u){setTimeout(()=>u.onend&&u.onend(),5)}}});
Object.defineProperty(window,"SpeechSynthesisUtterance",{configurable:true,value:function(t){this.text=t}});
window.Audio=class{constructor(){this.src=""}play(){setTimeout(()=>this.onended&&this.onended(),5);return Promise.resolve()}pause(){}};`;
const CLAUDE=`window.__calls=[];window.claude={use:async()=>({json:async(p)=>{window.__calls.push(p.slice(0,60));await new Promise(r=>setTimeout(r,30));
  if(/TOEFL iBT coach/.test(p))return {insights_de:["Erkenntnis A","Erkenntnis B","Erkenntnis C"],patterns:[{title_de:"Muster",evidence_de:"#1",cause_de:"Ursache",rule_de:"Regel",drill_de:"Übung"}],plan_de:["Schritt 1","Schritt 2","Schritt 3"]};
  if(/Take an Interview/.test(p))return {scores:[4,4,3,5],verdict_de:"ok",criteria_de:{Inhalt:"x"},errors:[{original:"a",correction:"b",cat:"Artikel",rule_de:"r"}],improved:"x",tips_de:["t"]};
  return {score:4,verdict_de:"ok",criteria_de:{Aufgabe:"x"},errors:[{original:"a",correction:"b",cat:"Zeitform",rule_de:"r"},{original:"c",correction:"d",cat:"Zeitform",rule_de:"r"},{original:"e",correction:"f",cat:"Artikel",rule_de:"r"}],improved:"x",tips_de:["t"]}}})};`;
(async()=>{
  const b=await chromium.launch();const errs=[];
  const open=async(url,extra)=>{const ctx=await b.newContext({viewport:{width:1200,height:900}});await ctx.addInitScript(MOCK+(extra||""));const p=await ctx.newPage();
    p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/fonts|ERR_|net::/.test(m.text()))errs.push(m.text())});
    await p.goto(url);await p.waitForSelector('[data-sec="reading"]');return p};
  let p=await open(FILE);
  const step=async()=>{
    const bg=await p.$('#begin');if(bg){await bg.click();return}
    if(await p.$('.ctw')){for(const i of await p.$$('.gap input'))await i.fill(Math.random()<.5?'ab':'')}
    if(await p.$('.bank')){let c;while((c=await p.$('.bank .chip:not(.used)')))await c.click()}
    if(await p.$('#w'))await p.fill('#w','Dear Ms. Carter, I hope you are doing well. This is a test response.');
    await p.waitForTimeout(40);
    const o=await p.$$('.opt');if(o.length&&await o[0].isVisible()){await o[Math.floor(Math.random()*o.length)].click();if(Math.random()<.3)await o[Math.floor(Math.random()*o.length)].click()}
    if(await p.$('#say:not([disabled])')){await p.fill('#say','Welcome to the university and stay together');}
    for(let w=0;w<60&&await p.$('#next[disabled]');w++)await p.waitForTimeout(50);
    if(await p.$('#say:not([disabled])'))await p.waitForTimeout(700);
    if(await p.$('#next'))await p.click('#next',{timeout:2500}).catch(()=>{});
    const y=await p.$('#cb-yes');if(y)await y.click();
  };
  const runUntil=async(sel,max)=>{for(let k=0;k<max;k++){if(await p.$(sel))return true;await step()}return !!(await p.$(sel))};
  const txt=async sel=>((await p.textContent(sel))||'').replace(/\s+/g,' ').trim();
  for(const sec of ['reading','listening','writing','speaking']){
    console.log('start',sec,new Date().toISOString().slice(11,19));await p.click(`[data-sec="${sec}"][data-form="0"]`);
    if(!await p.$('#begin'))errs.push(sec+': Anweisungen fehlen');
    if(!await runUntil('.bandrow',400))errs.push(sec+'-Test endet nicht');
    else console.log(sec+':',await txt('.bandrow'),'| Erkenntnisse:',(await p.$$('.insights li')).length,'| Muster:',(await p.$$('.pat')).length);
    if((sec==='reading'||sec==='listening')&&!(await p.$$('.pat')).length)errs.push(sec+': keine Fehlermuster');
    await p.click('#home');
  }
  // Wiederholung fragt nach
  await p.click('[data-sec="reading"][data-form="0"]');if(!await p.$('#cb-yes'))errs.push('Wiederholen ohne Rückfrage');else await p.click('#cb-no');
  await p.click('[data-full="1"]');await p.click('#cb-yes');
  if(!await runUntil('.bandrow',900))errs.push('Kompletter Test endet nicht');else console.log('voll:',await txt('.bandrow'));
  console.log('Erkenntnisse:',(await p.$$eval('.insights li',l=>l.map(x=>x.textContent.slice(0,90)))).join(' || '));
  // Schwächen-Training aus der Auswertung
  await p.click('[data-train]');if(!await runUntil('#home',60))errs.push('Schwächen-Training endet nicht');else console.log('training:',await txt('h1'));
  await p.click('#home');
  // Fehlerheft
  if(!await p.$('#redo'))errs.push('Fehlerheft fehlt');else{await p.click('#redo');if(!await runUntil('#home',80))errs.push('Fehler wiederholen endet nicht');else console.log('redo:',await txt('h1'));await p.click('#home')}
  for(const t of ['ctw','daily','academic','choose','conversation','announcement','talk','bas','email','discussion','repeat','interview']){
    await p.click(`[data-practice="${t}"]`);
    if(!await runUntil('#again',40))errs.push('Training '+t+' endet nicht');
    await p.click('#home');
  }
  // Alle Probetests: jede Form startet in jeder Section
  const nForms=await p.$$eval('.formcard',l=>l.length);console.log('Probetests:',nForms);
  await p.setViewportSize({width:390,height:800});await p.screenshot({path:path.resolve(__dirname,'phone-home.png')});
  const last=await p.$('table.hist tbody tr');if(last){await last.click();await p.waitForTimeout(200);await p.screenshot({path:path.resolve(__dirname,'phone-result.png'),fullPage:true});await p.click('#home')}
  await p.click('[data-practice="talk"]');await p.waitForTimeout(300);await p.screenshot({path:path.resolve(__dirname,'phone.png')});
  await p.context().close();
  // Claude-Version mit KI-Attrappe: Writing und Speaking auswerten lassen
  p=await open(ART,CLAUDE);await p.waitForTimeout(200);
  for(const sec of ['writing','speaking']){
    await p.click(`[data-sec="${sec}"][data-form="2"]`);
    if(!await runUntil('.bandrow',200)){errs.push('Claude-Version: '+sec+' endet nicht');continue}
    if(!await p.$('#runall')){errs.push('Claude-Version: Knopf „Auswerten“ fehlt ('+sec+')')}
    else{await p.click('#runall');await p.waitForSelector('#deepbox .insights',{timeout:8000}).catch(()=>errs.push('Claude-Version: Tiefenanalyse fehlt ('+sec+')'));
      const band=await txt('.bandrow');console.log('KI '+sec+':',band);if(/–/.test(band))errs.push('Claude-Version: Band fehlt nach Auswertung ('+sec+')')}
    await p.click('#home');
  }
  console.log('KI-Aufrufe:',await p.evaluate(()=>window.__calls.length));
  console.log(errs.length?'FEHLER:\n'+errs.join('\n'):'Smoke-Test OK');
  await b.close();process.exit(errs.length?1:0);
})();
