"use strict";
/* =====================================================================
   TOEFL-Trainer – App-Logik. Aufbau und Regeln: siehe /CLAUDE.md
   ===================================================================== */

/* ---------- Grundlagen ---------- */
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const fmt=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
const countWords=t=>(String(t).trim().match(/[A-Za-z0-9’'-]+/g)||[]).length;
const LETTERS="ABCD";
const today=()=>new Date().toLocaleDateString("de-DE",{day:"2-digit",month:"2-digit",year:"2-digit"});
const app=()=>$("#app");

/* ---------- Speicher ---------- */
const KEY="toefl-trainer-v1";
let S={history:[],seen:{},stats:{},hideTimer:false};
try{const x=JSON.parse(localStorage.getItem(KEY)||"null");if(x&&typeof x==="object")S=Object.assign(S,x)}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function markSeen(id){S.seen[id]=(S.seen[id]||0)+1}
function addStat(type,right,total){const s=S.stats[type]||(S.stats[type]={right:0,total:0,sets:0});s.right+=right;s.total+=total;s.sets++}

/* ---------- KI-Bewertung (nur Claude-Version) ---------- */
let SAMPLE=null;
if(BUILD.artifact&&window.claude&&typeof claude.use==="function"){
  claude.use("sample").then(s=>{SAMPLE=s||null;if(SAMPLE&&(view.name==="home"||view.name==="result"))render()}).catch(()=>{});
}

/* ---------- Aufgabentypen ---------- */
const POOL=(sec,key)=>((DATA[sec]||{})[key])||[];
const TYPES={
  ctw:{sec:"reading",key:"ctw",name:"Complete the Words",de:"Fehlende Buchstaben in einem Absatz ergänzen",kind:"ctw"},
  daily:{sec:"reading",key:"daily",name:"Read in Daily Life",de:"Kurze Alltagstexte, 2–3 Fragen",kind:"mcq"},
  academic:{sec:"reading",key:"academic",name:"Read an Academic Passage",de:"Fachtext, 5 Fragen",kind:"mcq"},
  choose:{sec:"listening",key:"choose",name:"Listen and Choose a Response",de:"Passende Antwort auf einen Satz",kind:"listen"},
  conversation:{sec:"listening",key:"conversation",name:"Listen to a Conversation",de:"Dialog, 2 Fragen",kind:"listen"},
  announcement:{sec:"listening",key:"announcement",name:"Listen to an Announcement",de:"Durchsage, 2 Fragen",kind:"listen"},
  talk:{sec:"listening",key:"talk",name:"Listen to an Academic Talk",de:"Vortrag, 4 Fragen",kind:"listen"},
  bas:{sec:"writing",key:"bas",name:"Build a Sentence",de:"Antwortsatz aus Blöcken bauen",kind:"bas"},
  email:{sec:"writing",key:"email",name:"Write an Email",de:"7 Minuten, 3 Teilaufgaben",kind:"email"},
  discussion:{sec:"writing",key:"discussion",name:"Academic Discussion",de:"10 Minuten, mindestens 100 Wörter",kind:"discussion"},
  repeat:{sec:"speaking",key:"repeat",name:"Listen and Repeat",de:"7 Sätze nachsprechen",kind:"repeat"},
  interview:{sec:"speaking",key:"interview",name:"Take an Interview",de:"4 Fragen, je 45 Sekunden",kind:"interview"}
};
const pool=t=>POOL(TYPES[t].sec,TYPES[t].key);
const ready=t=>pool(t).length>0&&!["listen","repeat","interview"].includes(TYPES[t].kind);
const SECTIONS={
  reading:{name:"Reading",de:"2 Module, adaptiv",min:30,types:["ctw","daily","academic"],stage:1},
  listening:{name:"Listening",de:"2 Module, adaptiv",min:29,types:["choose","conversation","announcement","talk"],stage:2},
  writing:{name:"Writing",de:"Build a Sentence, Email, Discussion",min:23,types:["bas","email","discussion"],stage:1},
  speaking:{name:"Speaking",de:"Listen and Repeat, Interview",min:8,types:["repeat","interview"],stage:3}
};
const sectionReady=s=>SECTIONS[s].types.every(ready);

/* Auswahl: wenig gesehene zuerst, passendes Level bevorzugt */
function pick(type,n,level,exclude){
  exclude=exclude||new Set();
  const all=pool(type).filter(x=>!exclude.has(x.id));
  const score=x=>(S.seen[x.id]||0)*10+(level&&x.level!==level?5:0)+Math.random();
  return all.slice().sort((a,b)=>score(a)-score(b)).slice(0,n);
}

/* ---------- Anweisungen (wie im Test, englisch) ---------- */
const GENRE_NOUN={email:"an email",notice:"a notice",chat:"a text message chain",menu:"a menu",schedule:"a schedule",ad:"an advertisement",receipt:"a receipt",post:"a social media post",form:"a form",flyer:"a flyer",instructions:"some instructions",review:"a review",webpage:"a web page"};
const DIRECTIONS={
  ctw:"Fill in the missing letters in the paragraph.",
  academic:"Read a passage. Then answer the questions.",
  bas:"Make an appropriate sentence.",
  email:"You will read some information and use the information to write an email. You will have 7 minutes to write the email. Write as much as you can and in complete sentences.",
  discussion:"Your professor is teaching a class. Write a post responding to the professor's question. In your response, you should express and support your opinion and make a contribution to the discussion in your own words. An effective response will contain at least 100 words. You will have 10 minutes to write."
};
const dailyDirection=it=>"Read "+(GENRE_NOUN[it.genre]||"a text")+". Then answer the questions.";

/* ---------- Session-Aufbau ---------- */
let view={name:"home"};
let SES=null,TICK=null;

function readingModule(level,exclude){
  const sc=[];
  const ctw=pick("ctw",1,level,exclude)[0];
  const daily=pick("daily",4,level,exclude);
  const ac=pick("academic",1,level,exclude)[0];
  [ctw,...daily,ac].forEach(x=>x&&exclude.add(x.id));
  if(ctw)sc.push({t:"ctw",item:ctw});
  daily.forEach(it=>it.questions.forEach((q,qi)=>sc.push({t:"mcq",type:"daily",item:it,qi})));
  if(ac)ac.questions.forEach((q,qi)=>sc.push({t:"mcq",type:"academic",item:ac,qi}));
  return sc;
}
function newSession(o){
  return Object.assign({answers:{},p:0,i:0,started:Date.now(),route:null,used:[]},o);
}
function startSectionTest(sec){
  if(sec==="reading"){
    const ex=new Set();
    SES=newSession({kind:"test",section:"reading",title:"Reading",exclude:ex,
      parts:[{name:"Reading",limit:30*60,screens:readingModule(2,ex),floor:0,module:1}]});
  }else if(sec==="writing"){
    const bas=pick("bas",10,null),em=pick("email",1)[0],di=pick("discussion",1)[0];
    SES=newSession({kind:"test",section:"writing",title:"Writing",parts:[
      {name:"Build a Sentence",limit:6*60+50,screens:bas.map(it=>({t:"bas",item:it})),floor:0},
      {name:"Write an Email",limit:7*60,screens:[{t:"email",item:em}],floor:0},
      {name:"Academic Discussion",limit:10*60,screens:[{t:"discussion",item:di}],floor:0}]});
  }
  SES.parts.forEach(p=>SES.used.push(0));
  go("runner");
}
function startPractice(type){
  const it=pick(type,1)[0];if(!it)return;
  const T=TYPES[type];let screens;
  if(T.kind==="ctw")screens=[{t:"ctw",item:it}];
  else if(T.kind==="mcq")screens=it.questions.map((q,qi)=>({t:"mcq",type,item:it,qi}));
  else if(T.kind==="bas"){screens=pick("bas",5).map(x=>({t:"bas",item:x}))}
  else screens=[{t:T.kind,item:it}];
  const limit=type==="email"?7*60:type==="discussion"?10*60:null;
  SES=newSession({kind:"practice",type,section:T.sec,title:T.name,parts:[{name:T.name,limit,screens,floor:0}]});
  SES.used.push(0);
  go("runner");
}

/* ---------- Bewertung von Antworten ---------- */
const ctwGaps=text=>{const g=[];text.replace(/([A-Za-z’'-]*)\{([^}]+)\}/g,(m,a,b)=>{g.push({shown:a,missing:b})});return g};
function scoreScreen(sc,ans){
  if(sc.t==="ctw"){const gaps=ctwGaps(sc.item.text);const a=ans[sc.item.id]||[];
    const r=gaps.map((g,i)=>((a[i]||"").trim().toLowerCase().replace(/’/g,"'")===g.missing.toLowerCase().replace(/’/g,"'")));
    return {right:r.filter(Boolean).length,total:gaps.length,detail:r};}
  if(sc.t==="mcq"){const a=ans[sc.item.id+"#"+sc.qi];const ok=a===sc.item.questions[sc.qi].answer;return {right:ok?1:0,total:1}}
  if(sc.t==="bas"){const a=ans[sc.item.id]||[];const built=a.map(i=>sc.item.chunks[i]).join(" ");
    const ok=a.length===sc.item.chunks.length&&norm(built)===norm(sc.item.chunks.join(" "));return {right:ok?1:0,total:1}}
  return {right:0,total:0};
}
const norm=s=>String(s).toLowerCase().replace(/[’]/g,"'").replace(/\s+/g," ").trim();
function screensOf(s){return s.parts.flatMap(p=>p.screens)}
function rawScore(s,filter){let r=0,t=0;screensOf(s).filter(x=>!filter||filter(x)).forEach(sc=>{const x=scoreScreen(sc,s.answers);r+=x.right;t+=x.total});return {right:r,total:t}}

/* Band-Schätzung (Annahmen, siehe CLAUDE.md) */
function readingBand(pct,route){
  if(route==="hard"){if(pct>=.94)return 6;if(pct>=.86)return 5.5;if(pct>=.76)return 5;if(pct>=.66)return 4.5;if(pct>=.56)return 4;return 3.5}
  if(pct>=.9)return 4.5;if(pct>=.78)return 4;if(pct>=.64)return 3.5;if(pct>=.5)return 3;if(pct>=.36)return 2.5;if(pct>=.24)return 2;if(pct>=.12)return 1.5;return 1;
}
function writingBand(raw){const t=[[20,6],[18,5.5],[16,5],[14,4.5],[12,4],[10,3.5],[8,3],[6,2.5],[4,2],[2,1.5]];for(const [m,b] of t)if(raw>=m)return b;return 1}
const fmtBand=b=>b==null?"–":(Number.isInteger(b)?b+".0":String(b)).replace(".",",");

/* ---------- Router ---------- */
function go(name,extra){view=Object.assign({name},extra||{});render();window.scrollTo(0,0)}
function render(){
  clearInterval(TICK);TICK=null;document.body.classList.remove("testing");
  if(view.name==="home")renderHome();
  else if(view.name==="runner")renderRunner();
  else if(view.name==="result")renderResult();
  else if(view.name==="history")renderHistory();
}

/* ---------- Start ---------- */
function statText(t){const s=S.stats[t];if(!s||!s.total)return "";return Math.round(100*s.right/s.total)+" % · "+s.sets+"×"}
function renderHome(){
  const tests=S.history.slice().reverse().slice(0,6);
  const tile=sec=>{const sd=SECTIONS[sec];const ok=sectionReady(sec);
    const last=S.history.slice().reverse().find(h=>h.section===sec&&h.band!=null);
    return `<button class="tile" data-test="${sec}" ${ok?"":"disabled"}><b>${sd.name}</b><span>${ok?sd.min+" Min · "+sd.de:"Kommt in Etappe "+sd.stage}</span>${last?`<span class="stat">Zuletzt: Band ${fmtBand(last.band)}</span>`:""}</button>`};
  const rows=Object.keys(SECTIONS).map(sec=>`<div class="sect">${SECTIONS[sec].name}</div>`+SECTIONS[sec].types.map(t=>{const T=TYPES[t];const ok=ready(t);
    return `<button class="typerow" data-practice="${t}" ${ok?"":"disabled"}><div><div class="t">${T.name}</div><div class="d">${ok?T.de:"Kommt in Etappe "+SECTIONS[sec].stage}</div></div><div class="s">${ok?statText(t):""}</div></button>`}).join("")).join("");
  app().innerHTML=`<div class="wrap">
    <header><h1>TOEFL-Trainer</h1><p class="sub">Übungsaufgaben im Format des TOEFL iBT ab 2026. Section-Tests mit Zeitlimit und Band-Schätzung, Training einzelner Aufgabentypen.</p></header>
    <section class="group"><div class="label">Section-Test</div><div class="tiles">${["reading","listening","writing","speaking"].map(tile).join("")}</div></section>
    <section class="group"><div class="label">Training nach Aufgabentyp</div><div class="typelist">${rows}</div></section>
    <section class="group"><div class="row"><div class="label">Letzte Tests</div>${S.history.length?`<button class="btn ghost small" id="h-all">Alle ansehen</button>`:""}</div>
      ${tests.length?`<div class="tw"><table class="hist"><thead><tr><th>Datum</th><th>Section</th><th class="n">Rohpunkte</th><th class="n">Band</th></tr></thead><tbody>${tests.map(h=>`<tr><td>${esc(h.date)}</td><td>${esc(h.title)}</td><td class="n">${h.raw!=null?h.raw+"/"+h.max:"–"}</td><td class="n">${fmtBand(h.band)}</td></tr>`).join("")}</tbody></table></div>`:`<p class="muted small">Noch kein Test gemacht. Starte oben mit einem Section-Test, um dein Ausgangsniveau zu sehen.</p>`}
    </section>
    <section class="group"><div class="label">Bewertung von Writing</div><p class="muted small">${SAMPLE?"KI-Bewertung nach den offiziellen ETS-Rubrics ist hier direkt verfügbar.":BUILD.artifact?"KI-Bewertung wird geladen oder ist in dieser Ansicht nicht verfügbar. Alternativ: Bewertungs-Prompt kopieren und in Claude einfügen.":"Offline-Version: Texte werden gespeichert. Für die Bewertung den Bewertungs-Prompt kopieren und in Claude einfügen."}</p></section>
    <details class="group"><summary class="label" style="cursor:pointer">Lernstand übertragen</summary>
      <p class="muted small">Code kopieren und in der anderen Version (Handy-App oder Claude) einfügen. Beim Übernehmen wird der dortige Stand ersetzt.</p>
      <textarea class="code" id="sync" rows="3" spellcheck="false" aria-label="Lernstand-Code"></textarea>
      <div class="btns"><button class="btn" id="exp">Code kopieren</button><button class="btn" id="imp">Eingefügten Code übernehmen</button></div>
      <p class="muted small" id="syncmsg" aria-live="polite"></p>
    </details>
  </div>`;
  $$("[data-test]").forEach(b=>b.onclick=()=>startSectionTest(b.dataset.test));
  $$("[data-practice]").forEach(b=>b.onclick=()=>startPractice(b.dataset.practice));
  const ha=$("#h-all");if(ha)ha.onclick=()=>go("history");
  let code="";try{code="TT1:"+btoa(unescape(encodeURIComponent(JSON.stringify(S))))}catch(e){}
  $("#sync").value=code;
  $("#exp").onclick=()=>{const done=m=>$("#syncmsg").textContent=m;
    try{navigator.clipboard.writeText(code).then(()=>done("Kopiert."),()=>{$("#sync").select();done("Code markiert: mit Strg+C / Cmd+C kopieren.")})}catch(e){$("#sync").select();done("Code markiert: mit Strg+C / Cmd+C kopieren.")}};
  $("#imp").onclick=()=>{const t=$("#sync").value.trim();
    try{if(!t.startsWith("TT1:"))throw 0;const x=JSON.parse(decodeURIComponent(escape(atob(t.slice(4)))));if(!x||!Array.isArray(x.history))throw 0;S=Object.assign({history:[],seen:{},stats:{}},x);save();render()}
    catch(e){$("#syncmsg").textContent="Der Code ist ungültig. Er muss mit TT1: beginnen und vollständig sein."}};
}

/* ---------- Testablauf ---------- */
function cur(){const p=SES.parts[SES.p];return {p,sc:p.screens[SES.i]}}
function renderRunner(){
  const {p,sc}=cur();
  const isTest=SES.kind==="test";
  const n=p.screens.length;
  const modLabel=SES.section==="reading"&&isTest?` · Modul ${p.module||1}`:"";
  const limit=p.limit;
  app().innerHTML=`<div class="testbar"><div class="testbar-in">
      <span class="sec">${esc(isTest?SES.title:"Training")}</span>
      <span class="pos">${esc(p.name!==SES.title?p.name+" · ":"")}${SES.i+1} / ${n}${modLabel}</span>
      <span class="sp"></span>
      ${limit||isTest?`<button class="timer ${S.hideTimer?"hide":""}" id="timer" title="Uhr ein-/ausblenden">${fmt((limit||0)-SES.used[SES.p])}</button>`:`<span class="timer" id="timer">${fmt(SES.used[SES.p])}</span>`}
      <button class="btn ghost" id="exit">Beenden</button>
      <div class="navbtns"><button class="btn" id="back" ${SES.i<=p.floor?"disabled":""}>Back</button>
      <button class="btn primary" id="next">Next</button></div>
    </div><div class="progress"><i style="width:${Math.round(100*(SES.i)/n)}%"></i></div></div>
    <div class="wrap wide" id="stage"></div>`;
  const stage=$("#stage");document.body.classList.add("testing");
  if(sc.t==="ctw")renderCtw(stage,sc);
  else if(sc.t==="mcq")renderMcq(stage,sc);
  else if(sc.t==="bas")renderBas(stage,sc);
  else if(sc.t==="email"||sc.t==="discussion")renderWrite(stage,sc);
  $("#next").onclick=next;
  $("#back").onclick=()=>{if(SES.i>p.floor){SES.i--;renderRunner()}};
  $("#exit").onclick=()=>confirmBox("Test beenden? Der Fortschritt dieses Durchgangs geht verloren.","Beenden",()=>{SES=null;go("home")});
  const tb=$("#timer");if(tb&&tb.tagName==="BUTTON")tb.onclick=()=>{S.hideTimer=!S.hideTimer;save();tb.classList.toggle("hide",S.hideTimer)};
  TICK=setInterval(tick,1000);
}
function tick(){
  if(!SES||view.name!=="runner")return;
  SES.used[SES.p]++;
  const p=SES.parts[SES.p],t=$("#timer");
  if(p.limit){const left=p.limit-SES.used[SES.p];if(t){t.textContent=fmt(left);t.classList.toggle("low",left<=60)}
    if(left<=0){if(SES.kind==="test")endPart(true);else if(!p.warned){p.warned=true;toast("Zeit abgelaufen. Im Test wäre die Aufgabe jetzt beendet.")}}}
  else if(t)t.textContent=fmt(SES.used[SES.p]);
}
function toast(m){const d=document.createElement("div");d.className="notice";d.style.cssText="position:fixed;left:50%;bottom:calc(20px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:20;box-shadow:var(--shadow);max-width:90vw";d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),4500)}
function confirmBox(msg,yes,onYes){
  const d=document.createElement("div");
  d.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:30;display:grid;place-items:center;padding:20px";
  d.innerHTML=`<div class="panel stack" style="max-width:380px"><p style="margin:0">${esc(msg)}</p><div class="btns"><button class="btn" id="cb-no">Abbrechen</button><button class="btn primary" id="cb-yes">${esc(yes)}</button></div></div>`;
  document.body.appendChild(d);d.querySelector("#cb-no").onclick=()=>d.remove();d.querySelector("#cb-yes").onclick=()=>{d.remove();onYes()};d.querySelector("#cb-yes").focus();
}
function next(){
  const p=SES.parts[SES.p];
  if(SES.i<p.screens.length-1){SES.i++;renderRunner();window.scrollTo(0,0);return}
  if(SES.kind==="test"&&SES.section==="reading"&&p.module===1){
    confirmBox("Modul 1 abschließen? Danach kannst du nicht mehr zurück.","Weiter zu Modul 2",()=>{
      const r=rawScore(SES);SES.route=r.total&&r.right/r.total>=.7?"hard":"easy";
      const m2=readingModule(SES.route==="hard"?3:1,SES.exclude);
      p.floor=p.screens.length;p.screens.push(...m2);p.module=2;SES.i=p.floor;renderRunner();window.scrollTo(0,0)});
    return;
  }
  const lastPart=SES.p===SES.parts.length-1;
  confirmBox(lastPart?(SES.kind==="test"?"Section beenden und auswerten?":"Aufgabe abgeben?"):"Diesen Teil abschließen? Danach kannst du nicht mehr zurück.",lastPart?"Abgeben":"Weiter",()=>endPart(false));
}
function endPart(timeout){
  if(timeout)toast("Die Zeit für diesen Teil ist abgelaufen.");
  if(SES.p<SES.parts.length-1){SES.p++;SES.i=0;renderRunner();window.scrollTo(0,0);return}
  finish();
}
function finish(){
  const s=SES;screensOf(s).forEach(sc=>markSeen(sc.item.id));
  /* Statistik je Aufgabentyp */
  const by={};screensOf(s).forEach(sc=>{const t=sc.t==="mcq"?sc.type:sc.t;const x=scoreScreen(sc,s.answers);if(!x.total)return;(by[t]=by[t]||{r:0,t:0,ids:new Set()});by[t].r+=x.right;by[t].t+=x.total;by[t].ids.add(sc.item.id)});
  Object.keys(by).forEach(t=>{const st=S.stats[t]||(S.stats[t]={right:0,total:0,sets:0});st.right+=by[t].r;st.total+=by[t].t;st.sets+=by[t].ids.size});
  const r=rawScore(s);
  const entry={id:"h"+Date.now(),date:today(),kind:s.kind,section:s.section,type:s.type||null,title:s.kind==="test"?s.title:"Training: "+s.title,route:s.route,
    raw:r.total?r.right:null,max:r.total||null,band:null,screens:screensOf(s).map(sc=>({t:sc.t,type:sc.type,id:sc.item.id,qi:sc.qi})),answers:s.answers,evals:{}};
  if(s.kind==="test"&&s.section==="reading")entry.band=readingBand(r.right/r.total,s.route);
  if(s.section==="writing"&&s.kind==="test"){entry.raw=r.right;entry.max=20}
  S.history.push(entry);if(S.history.length>200)S.history.shift();save();
  SES=null;go("result",{id:entry.id});
}

/* ---------- Bildschirm: Complete the Words ---------- */
function renderCtw(stage,sc){
  const it=sc.item,key=it.id,a=SES.answers[key]||(SES.answers[key]=[]);
  let gi=0;
  const html=esc(it.text).replace(/([A-Za-z’'-]*)\{([^}]+)\}/g,(m,shown,miss)=>{const i=gi++;const n=miss.length;
    return `<span class="gap">${shown}<input data-g="${i}" maxlength="${n}" style="width:calc(${n}*1.32ch + 8px)" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-label="Lücke ${i+1}, ${n} Buchstaben" value="${esc(a[i]||"")}"></span>`});
  stage.innerHTML=`<div class="task single"><div class="panel"><div class="direction">${DIRECTIONS.ctw}</div><div class="ctw">${html}</div></div></div>`;
  const ins=$$(".gap input");
  ins.forEach((inp,i)=>{
    inp.oninput=()=>{a[i]=inp.value;if(inp.value.length>=+inp.maxLength&&ins[i+1])ins[i+1].focus()};
    inp.onkeydown=e=>{if(e.key==="Backspace"&&!inp.value&&ins[i-1]){ins[i-1].focus();e.preventDefault()}if(e.key==="Enter"){e.preventDefault();next()}};
  });
  const first=ins.find(x=>!x.value)||ins[0];if(first&&matchMedia("(pointer:fine)").matches)first.focus();
}

/* ---------- Bildschirm: Multiple Choice mit Text ---------- */
function docHtml(it){
  const lines=String(it.text).split("\n");
  if(it.genre==="chat"){return `<div class="chat">${lines.filter(Boolean).map(l=>{const m=l.match(/^([^:]{1,24}):\s*(.*)$/);const who=m?m[1]:"",tx=m?m[2]:l;
    return `<div class="bubble ${who&&it.me===who?"me":""}"><small>${esc(who)}</small>${esc(tx)}</div>`}).join("")}</div>`}
  let out="",head=[],rows=[];
  const flushRows=()=>{if(rows.length){out+=`<div class="tw"><table>${rows.map((r,i)=>`<tr>${r.map(c=>i===0?`<th>${esc(c)}</th>`:`<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table></div>`;rows=[]}};
  lines.forEach(l=>{
    const hm=l.match(/^(From|To|Subject|Date|Sent):\s*(.*)$/);
    if(hm){head.push(hm);return}
    if(head.length){out+=`<div class="mailhead">${head.map(x=>`<span>${x[1]}:</span><b>${esc(x[2])}</b>`).join("")}</div>`;head=[]}
    if(l.includes(" | ")){rows.push(l.split(" | "));return}
    flushRows();
    if(l.startsWith("# ")){out+=`<div class="dtitle">${esc(l.slice(2))}</div>`;return}
    if(l.trim())out+=`<p>${esc(l)}</p>`;
  });
  flushRows();
  return out;
}
function renderMcq(stage,sc){
  const it=sc.item,q=it.questions[sc.qi],key=it.id+"#"+sc.qi,chosen=SES.answers[key];
  const left=sc.type==="daily"
    ?`<div class="direction">${dailyDirection(it)}</div><div class="doc">${docHtml(it)}</div>`
    :`<div class="direction">${DIRECTIONS.academic}</div><div class="passage"><h3>${esc(it.title)}</h3>${String(it.text).split("\n").filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join("")}</div>`;
  const nav=it.questions.length>1?`<div class="qnav">${it.questions.map((x,i)=>`<button tabindex="-1" class="${i===sc.qi?"on":""} ${SES.answers[it.id+"#"+i]!=null?"done":""}" aria-label="Frage ${i+1}">${i+1}</button>`).join("")}</div>`:"";
  stage.innerHTML=`<div class="task"><div class="panel">${left}</div>
    <div class="panel"><div class="label" style="margin-bottom:10px">Question ${sc.qi+1} of ${it.questions.length}</div>${nav}
      <p class="qtext">${esc(q.q)}</p>
      <div class="opts">${q.options.map((o,i)=>`<button class="opt" data-o="${i}" aria-pressed="${chosen===i}"><span class="k">${LETTERS[i]}</span><span>${esc(o)}</span></button>`).join("")}</div></div></div>`;
  $$(".opt").forEach(b=>b.onclick=()=>{SES.answers[key]=+b.dataset.o;$$(".opt").forEach(x=>x.setAttribute("aria-pressed",x===b));const d=$$(".qnav button")[sc.qi];if(d)d.classList.add("done")});
  keyHandler=e=>{const k=e.key.toUpperCase();const i="ABCD".indexOf(k)>=0?"ABCD".indexOf(k):"1234".indexOf(e.key);if(i>=0&&i<q.options.length){$$(".opt")[i].click()}};
}
let keyHandler=null;
document.addEventListener("keydown",e=>{if(view.name!=="runner"||!keyHandler)return;if(["INPUT","TEXTAREA"].includes(e.target.tagName))return;if(e.key==="Enter"&&e.target.tagName!=="BUTTON"){e.preventDefault();next();return}keyHandler(e)});

/* ---------- Bildschirm: Build a Sentence ---------- */
function renderBas(stage,sc){
  keyHandler=null;
  const it=sc.item,key=it.id;
  if(!SES.order)SES.order={};
  const order=SES.order[key]||(SES.order[key]=shuffle(it.chunks.map((c,i)=>i)));
  const a=SES.answers[key]||(SES.answers[key]=[]);
  const end=(it.answer.match(/[.?!]$/)||["."])[0];
  const draw=()=>{
    const cap=(t,i)=>i===0?t.charAt(0).toUpperCase()+t.slice(1):t;
    stage.innerHTML=`<div class="task single"><div class="panel">
      <div class="direction">${DIRECTIONS.bas}</div>
      <div class="speaker"><div class="avatar">A</div><div class="say">${esc(it.prompt)}</div></div>
      <div class="speaker"><div class="avatar" style="background:var(--surface-2);color:var(--muted)">B</div><div style="flex:1;min-width:0">
        <div class="slots" aria-label="Deine Antwort">${it.chunks.map((c,i)=>a[i]!=null?`<button class="chip" data-slot="${i}">${esc(cap(it.chunks[a[i]],i))}</button>`:`<span class="slot"></span>`).join("")}<span class="punct">${end}</span></div>
        <div class="bank">${order.map(ci=>`<button class="chip ${a.includes(ci)?"used":""}" data-chunk="${ci}">${esc(it.chunks[ci])}</button>`).join("")}</div>
        <div class="btns" style="margin-top:14px"><button class="btn ghost small" id="bas-reset">Zurücksetzen</button></div>
      </div></div></div></div>`;
    $$("[data-chunk]").forEach(b=>b.onclick=()=>{const ci=+b.dataset.chunk;if(a.includes(ci))return;const slot=[...Array(it.chunks.length).keys()].find(i=>a[i]==null);if(slot==null)return;a[slot]=ci;draw()});
    $$("[data-slot]").forEach(b=>b.onclick=()=>{const i=+b.dataset.slot;a[i]=null;while(a.length&&a[a.length-1]==null)a.pop();draw()});
    $("#bas-reset").onclick=()=>{a.length=0;draw()};
  };
  draw();
}

/* ---------- Bildschirm: Email / Discussion ---------- */
function promptHtml(sc){
  const it=sc.item;
  if(sc.t==="email")return `<div class="direction">${DIRECTIONS.email}</div><div class="prompt-box"><p style="margin:0">${esc(it.situation)}</p>
    <p style="margin:12px 0 0">Write an email to ${esc(it.recipient)}. In your email, do the following:</p><ul>${it.tasks.map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>`;
  return `<div class="direction">${DIRECTIONS.discussion.replace("teaching a class","teaching a class on "+esc(it.course))}</div>
    <div class="post"><div class="avatar">${esc(it.professor.name.split(" ").pop()[0])}</div><div><div class="who">${esc(it.professor.name)}</div><p>${esc(it.professor.text)}</p></div></div>
    ${it.students.map(s=>`<div class="post"><div class="avatar" style="background:var(--surface-2);color:var(--muted)">${esc(s.name[0])}</div><div><div class="who">${esc(s.name)}</div><p>${esc(s.text)}</p></div></div>`).join("")}`;
}
function renderWrite(stage,sc){
  keyHandler=null;
  const key=sc.item.id;
  stage.innerHTML=`<div class="task"><div class="panel">${promptHtml(sc)}</div>
    <div class="stack"><textarea class="write" id="w" spellcheck="false" autocorrect="off" autocapitalize="off" autocomplete="off" aria-label="Deine Antwort" placeholder="${sc.t==="email"?"Dear …":"Your response …"}">${esc(SES.answers[key]||"")}</textarea>
    <div class="row"><span class="wc" id="wc"></span><span class="muted small">Keine Rechtschreibprüfung, wie im Test.</span></div></div></div>`;
  const w=$("#w"),wc=$("#wc");const upd=()=>{SES.answers[key]=w.value;const n=countWords(w.value);wc.textContent="Word count: "+n+(sc.t==="discussion"&&n<100?" · Ziel: 100+":"")};
  w.oninput=upd;upd();if(matchMedia("(pointer:fine)").matches)w.focus();
}

/* ---------- KI-Bewertung ---------- */
const RUBRIC={
  email:`Score 5 (fully successful): effective, clearly expressed, consistent facility in language use; elaboration effectively supports the communicative purpose; effective variety of syntactic structures and precise, idiomatic word choice; consistently appropriate social conventions (politeness, register, organization) for the situation and recipient; almost no lexical or grammatical errors other than those expected of a competent writer under time.
Score 4 (generally successful): mostly effective and easily understood; adequate elaboration; variety of structures and appropriate word choice; mostly appropriate social conventions; few lexical or grammatical errors.
Score 3 (partially successful): generally accomplishes the task, but language limitations may prevent parts of the message from being clear; partially relevant elaboration; moderate range of structures and vocabulary; noticeable errors in structure, word forms or conventions.
Score 2 (mostly unsuccessful): mostly ineffective; limited or irrelevant elaboration; limited range; accumulation of errors.
Score 1 (unsuccessful): ineffective attempt; very little elaboration; telegraphic language; serious and frequent errors; mostly borrowed language.
Score 0: blank, rejects the topic, not in English, copied from the prompt, unconnected, or arbitrary keystrokes.
A response that leaves out one of the three required tasks cannot score above 3.`,
  discussion:`Score 5 (fully successful): relevant, very clearly expressed contribution to the online discussion; well-elaborated explanations, exemplifications and/or details; effective variety of syntactic structures and precise, idiomatic word choice; almost no lexical or grammatical errors other than those expected of a competent writer under time.
Score 4 (generally successful): relevant contribution, ideas easily understood; adequately elaborated; variety of syntactic structures and appropriate word choice; few lexical or grammatical errors.
Score 3 (partially successful): mostly relevant and mostly understandable; some elaboration, but parts may be missing, unclear or irrelevant; some variety of structures and range of vocabulary; noticeable lexical and grammatical errors.
Score 2 (mostly unsuccessful): ideas poorly elaborated or only partially relevant; limited range; accumulation of errors that make ideas hard to follow.
Score 1 (unsuccessful): few or no coherent ideas; severely limited range; serious and frequent errors; mostly borrowed language.
Score 0: blank, rejects the topic, not in English, copied from the prompt, unconnected, or arbitrary keystrokes.
Merely restating the classmates' ideas without an own contribution cannot score above 3.`
};
function taskText(kind,it){
  if(kind==="email")return `SITUATION: ${it.situation}\nWrite an email to ${it.recipient}. In your email, do the following:\n${it.tasks.map(t=>"- "+t).join("\n")}\n(7 minutes)`;
  return `Your professor is teaching a class on ${it.course}. Write a post responding to the professor's question (at least 100 words, 10 minutes).\n${it.professor.name}: ${it.professor.text}\n${it.students.map(s=>s.name+": "+s.text).join("\n")}`;
}
function evalPrompt(kind,it,text,human){
  const head=`You are an experienced, strict ETS-certified rater for the TOEFL iBT (format from January 2026). Score the test taker's response to the task "${kind==="email"?"Write an Email":"Write for an Academic Discussion"}" on the official 0–5 scale. Judge exactly like a real rater: do not reward length alone, and do not be generous.

OFFICIAL RUBRIC
${RUBRIC[kind]}

TASK
${taskText(kind,it)}

RESPONSE (${countWords(text)} words)
"""
${text}
"""
`;
  if(human)return head+`
Answer in German, structured like this:
1. Score (0–5) and a 2-sentence justification referring to the rubric.
2. Every language error: original → correction, plus the rule in one short line.
3. An improved version in English that keeps my ideas and would score 5.
4. At most 3 concrete tips for my next attempt.`;
  return head+`
Reply with ONLY a JSON object, no other text:
{"score": <integer 0-5>,
 "verdict_de": "<2 sentences in German: why this score, referring to the rubric>",
 "criteria_de": {"Aufgabe": "<1 sentence>", "Aufbau": "<1 sentence>", "Sprache": "<1 sentence>", "${kind==="email"?"Ton":"Eigener Beitrag"}": "<1 sentence>"},
 "errors": [{"original": "<exact words from the response>", "correction": "<corrected words>", "rule_de": "<the grammar or usage rule, max 12 words, German>"}],
 "improved": "<improved English version keeping the writer's ideas, would score 5>",
 "tips_de": ["<max 3 short concrete tips in German>"]}
List every real error (grammar, word choice, spelling, punctuation that matters), at most 15.`;
}
async function runEval(entry,kind,it,text,box){
  const ctl=new AbortController();
  box.innerHTML=`<p class="muted"><span class="spin"></span>Claude bewertet nach den ETS-Rubrics. Das dauert meist 20–60 Sekunden.</p><button class="btn ghost small" id="ev-stop">Abbrechen</button>`;
  box.querySelector("#ev-stop").onclick=()=>ctl.abort();
  try{
    const r=await SAMPLE.json(evalPrompt(kind,it,text,false),{signal:ctl.signal,modelTier:"default"});
    if(!r||typeof r.score!=="number")throw {code:"invalid_json"};
    entry.evals[kind]=r;
    if(entry.section==="writing"&&entry.kind==="test"&&entry.evals.email&&entry.evals.discussion){
      const bas=entry.screens.filter(x=>x.t==="bas").length?basRight(entry):0;
      entry.raw=bas+entry.evals.email.score+entry.evals.discussion.score;entry.band=writingBand(entry.raw);
    }
    save();render();
  }catch(e){
    const m={not_granted:"Du hast die Nutzung von Claude für diese Seite nicht erlaubt.",rate_limited:"Gerade zu viele Anfragen oder Nutzungslimit erreicht. Später nochmal versuchen.",cancelled:"Abgebrochen.",invalid_json:"Die Antwort war unvollständig. Bitte nochmal versuchen."}[e&&e.code]||"Die Bewertung hat nicht geklappt. Bitte nochmal versuchen.";
    box.innerHTML=`<p class="muted small">${esc(m)}</p>`;evalButtons(entry,kind,it,text,box);
  }
}
function basRight(entry){return entry.screens.filter(x=>x.t==="bas").reduce((n,x)=>{const it=byId(x.id);return n+scoreScreen({t:"bas",item:it},entry.answers).right},0)}
function evalButtons(entry,kind,it,text,box){
  const wrap=document.createElement("div");wrap.className="btns";
  if(SAMPLE){const b=document.createElement("button");b.className="btn primary";b.textContent="Mit Claude bewerten";b.onclick=()=>runEval(entry,kind,it,text,box);wrap.appendChild(b)}
  const c=document.createElement("button");c.className="btn";c.textContent="Bewertungs-Prompt kopieren";
  c.onclick=()=>{const p=evalPrompt(kind,it,text,true);try{navigator.clipboard.writeText(p).then(()=>{c.textContent="Kopiert – in Claude einfügen"},()=>fallbackCopy(p,box))}catch(e){fallbackCopy(p,box)}};
  wrap.appendChild(c);box.appendChild(wrap);
}
function fallbackCopy(p,box){const t=document.createElement("textarea");t.className="code";t.rows=6;t.value=p;box.appendChild(t);t.select()}
function evalHtml(r){
  const crit=r.criteria_de?Object.entries(r.criteria_de).map(([k,v])=>`<div class="err"><b>${esc(k)}:</b> ${esc(v)}</div>`).join(""):"";
  return `<div class="score5"><span class="big">${esc(r.score)}</span><span class="muted">/ 5</span></div>
    <p style="margin:0">${esc(r.verdict_de||"")}</p>
    ${crit?`<div><div class="label">Kriterien</div><div class="errs">${crit}</div></div>`:""}
    ${Array.isArray(r.errors)&&r.errors.length?`<div><div class="label">Fehler (${r.errors.length})</div><div class="errs">${r.errors.map(x=>`<div class="err"><s>${esc(x.original)}</s> → <span class="fix">${esc(x.correction)}</span><div class="r">${esc(x.rule_de||"")}</div></div>`).join("")}</div></div>`:`<p class="muted small">Keine Sprachfehler gefunden.</p>`}
    ${r.improved?`<div><div class="label">Fassung für 5/5</div><div class="improved">${esc(r.improved)}</div></div>`:""}
    ${Array.isArray(r.tips_de)&&r.tips_de.length?`<div><div class="label">Nächstes Mal</div><ul style="margin:6px 0 0;padding-left:18px">${r.tips_de.map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>`:""}`;
}

/* ---------- Ergebnis ---------- */
const ALLITEMS={};Object.keys(TYPES).forEach(t=>pool(t).forEach(it=>{ALLITEMS[it.id]=it}));
const byId=id=>ALLITEMS[id];
function renderResult(){
  const e=S.history.find(h=>h.id===view.id);if(!e){go("home");return}
  const scs=e.screens.map(x=>Object.assign({},x,{item:byId(x.id)})).filter(x=>x.item);
  const reviewRows=[];
  scs.forEach(sc=>{
    if(sc.t==="mcq"){const q=sc.item.questions[sc.qi];const a=e.answers[sc.item.id+"#"+sc.qi];const ok=a===q.answer;
      reviewRows.push(`<div class="ritem"><span class="m ${ok?"ok":"no"}">${ok?"✓":"✗"}</span><div><div class="q">${esc(q.q)}</div>
      <div class="a">${a!=null?"Deine Antwort: "+LETTERS[a]+") "+esc(q.options[a])+" · ":"Keine Antwort · "}Richtig: ${LETTERS[q.answer]}) ${esc(q.options[q.answer])}</div>${q.why?`<div class="why">${esc(q.why)}</div>`:""}</div></div>`)}
    else if(sc.t==="ctw"){const x=scoreScreen(sc,e.answers);const gaps=ctwGaps(sc.item.text);const a=e.answers[sc.item.id]||[];
      reviewRows.push(`<div class="ritem"><span class="m ${x.right===x.total?"ok":"no"}">${x.right}/${x.total}</span><div><div class="q">Complete the Words</div><div class="a">${gaps.map((g,i)=>x.detail[i]?`<span style="color:var(--good)">${esc(g.shown+g.missing)}</span>`:`<span style="color:var(--bad)">${esc(g.shown)}<s>${esc(a[i]||"___")}</s></span> → ${esc(g.shown+g.missing)}`).join(" · ")}</div></div></div>`)}
    else if(sc.t==="bas"){const x=scoreScreen(sc,e.answers);const a=(e.answers[sc.item.id]||[]).filter(i=>i!=null).map(i=>sc.item.chunks[i]).join(" ");
      reviewRows.push(`<div class="ritem"><span class="m ${x.right?"ok":"no"}">${x.right?"✓":"✗"}</span><div><div class="q">${esc(sc.item.prompt)}</div><div class="a">${x.right?"":"Deine Antwort: "+esc(a||"–")+"<br>"}Richtig: ${esc(sc.item.answer)}</div>${sc.item.why&&!x.right?`<div class="why">${esc(sc.item.why)}</div>`:""}</div></div>`)}
  });
  const writes=scs.filter(sc=>sc.t==="email"||sc.t==="discussion");
  const byType={};scs.forEach(sc=>{const t=sc.t==="mcq"?sc.type:sc.t;const x=scoreScreen(sc,e.answers);if(!x.total)return;(byType[t]=byType[t]||{r:0,t:0});byType[t].r+=x.right;byType[t].t+=x.total});
  const isTest=e.kind==="test";
  let head="";
  if(isTest){
    const bandTxt=e.band!=null?fmtBand(e.band):"–";
    head=`<div class="bandrow"><div><div class="label">Band (Schätzung)</div><div class="big">${bandTxt}</div></div><div><div class="label">Rohpunkte</div><div class="big">${e.raw!=null?e.raw:"–"}<span class="muted" style="font-size:1rem"> / ${e.max}</span></div></div>${e.route?`<div><div class="label">Modul 2</div><div class="big" style="font-size:1.4rem;padding-top:10px">${e.route==="hard"?"schwer":"leicht"}</div></div>`:""}</div>
    ${e.section==="writing"&&e.band==null?`<p class="notice">Die Band-Schätzung für Writing erscheint, sobald Email und Discussion bewertet sind. Build a Sentence: ${basRight(e)}/10.</p>`:""}
    ${e.route==="easy"?`<p class="notice">Unter 70 % in Modul 1 führt zum leichten Modul 2. Damit ist die Band-Obergrenze 4,5. Für 5,5+ muss Modul 1 nahezu fehlerfrei sein.</p>`:""}`;
  }
  const typeRows=Object.keys(byType).map(t=>`<tr><td>${TYPES[t].name}</td><td class="n">${byType[t].r} / ${byType[t].t}</td><td class="n">${Math.round(100*byType[t].r/byType[t].t)} %</td></tr>`).join("");
  app().innerHTML=`<div class="wrap">
    <header><div class="label">${esc(e.date)}</div><h1>${esc(e.title)}</h1></header>
    ${head}
    ${typeRows?`<section class="group"><div class="label">Nach Aufgabentyp</div><div class="tw"><table class="hist"><tbody>${typeRows}</tbody></table></div></section>`:""}
    ${writes.map(sc=>`<section class="group panel"><div class="label">${sc.t==="email"?"Write an Email":"Academic Discussion"}</div>
      <details><summary class="muted small" style="cursor:pointer">Aufgabe und deine Antwort (${countWords(e.answers[sc.item.id]||"")} Wörter)</summary><div class="stack" style="margin-top:12px">${promptHtml(sc)}<div class="improved" style="background:var(--bg)">${esc(e.answers[sc.item.id]||"(leer)")}</div></div></details>
      <div class="evalbox" id="ev-${sc.t}">${e.evals[sc.t]?evalHtml(e.evals[sc.t]):""}</div></section>`).join("")}
    ${reviewRows.length?`<section class="group"><div class="label">Auswertung</div><div class="review">${reviewRows.join("")}</div></section>`:""}
    <div class="btns">${e.kind==="practice"&&e.type?`<button class="btn primary grow" id="again">Nächste Aufgabe</button>`:""}<button class="btn grow" id="home">Zur Übersicht</button></div>
  </div>`;
  writes.forEach(sc=>{const box=$("#ev-"+sc.t);if(!e.evals[sc.t])evalButtons(e,sc.t,sc.item,e.answers[sc.item.id]||"",box);
    else{const b=document.createElement("button");b.className="btn ghost small";b.textContent="Neu bewerten";b.onclick=()=>{delete e.evals[sc.t];save();render()};box.appendChild(b)}});
  $("#home").onclick=()=>go("home");
  const ag=$("#again");if(ag)ag.onclick=()=>startPractice(e.type);
}

/* ---------- Verlauf ---------- */
function renderHistory(){
  const rows=S.history.slice().reverse().map(h=>`<tr data-h="${h.id}" style="cursor:pointer"><td>${esc(h.date)}</td><td>${esc(h.title)}</td><td class="n">${h.raw!=null?h.raw+"/"+h.max:"–"}</td><td class="n">${fmtBand(h.band)}</td></tr>`).join("");
  app().innerHTML=`<div class="wrap"><header><h1>Verlauf</h1></header>
    <div class="tw"><table class="hist"><thead><tr><th>Datum</th><th>Durchgang</th><th class="n">Punkte</th><th class="n">Band</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="btns"><button class="btn" id="home">Zur Übersicht</button></div></div>`;
  $$("[data-h]").forEach(r=>r.onclick=()=>go("result",{id:r.dataset.h}));
  $("#home").onclick=()=>go("home");
}

render();
