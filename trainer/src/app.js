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
const hash=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))|0;return Math.abs(h)};

/* ---------- Speicher ---------- */
const KEY="toefl-trainer-v1";
let S={history:[],seen:{},stats:{},skills:{},wrong:{},hideTimer:false,rate:1};
try{const x=JSON.parse(localStorage.getItem(KEY)||"null");if(x&&typeof x==="object")S=Object.assign(S,x)}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function markSeen(id){S.seen[id]=(S.seen[id]||0)+1}

/* ---------- KI-Bewertung (nur Claude-Version) ---------- */
let SAMPLE=null;
if(BUILD.artifact&&window.claude&&typeof claude.use==="function"){
  claude.use("sample").then(s=>{SAMPLE=s||null;if(SAMPLE&&(view.name==="home"||view.name==="result"))render()}).catch(()=>{});
}

/* ---------- Sprachausgabe ---------- */
const TTS={ok:typeof window.speechSynthesis!=="undefined"&&typeof window.SpeechSynthesisUtterance!=="undefined",voices:[],token:0};
function loadVoices(){try{TTS.voices=speechSynthesis.getVoices().filter(v=>/^en[-_]/i.test(v.lang))}catch(e){TTS.voices=[]}}
if(TTS.ok){loadVoices();try{speechSynthesis.addEventListener("voiceschanged",loadVoices)}catch(e){}}
const FEM=/female|samantha|karen|moira|tessa|victoria|zira|susan|serena|allison|ava|kate|fiona|hazel|libby|sonia|natasha|jenny|aria|emma|olivia|nicky|catherine|joanna|salli|kendra|kimberly|ivy|amy|emily|michelle|nora|clara/i;
const MAL=/\bmale\b|daniel|alex\b|fred|david|mark|aaron|arthur|rishi|\blee\b|oliver|george|ryan|guy|james|gordon|matthew|joey|justin|brian|eric|thomas|andrew|christopher|william|roger/i;
const ACCENTS=["en-US","en-US","en-GB","en-AU"];
const QUALITY=/natural|neural|premium|enhanced|siri|google|online/i,POOR=/espeak|compact|novelty|whisper|bad news|bells|boing|bubbles|cellos|jester|organ|trinoids|zarvox|albert|fred|junior|ralph|kathy|superstar/i;
function pickVoice(g,accent){
  const vs=TTS.voices.filter(v=>!POOR.test(v.name)).sort((a,b)=>(QUALITY.test(b.name)?1:0)-(QUALITY.test(a.name)?1:0));if(!vs.length)return null;
  const isG=v=>g==="W"?FEM.test(v.name)&&!/\bmale\b/i.test(v.name):MAL.test(v.name)&&!FEM.test(v.name);
  const loc=v=>v.lang.replace("_","-").toLowerCase().startsWith(accent.toLowerCase());
  return vs.find(v=>loc(v)&&isG(v))||vs.find(v=>isG(v)&&/en-(us|gb|au)/i.test(v.lang.replace("_","-")))||vs.find(isG)||vs.find(loc)||vs[0];
}
function splitSentences(t){return String(t).match(/[^.!?]+[.!?]*["”']?\s*/g)||[t]}
/* parts: [{text,g}] – spricht nacheinander, ruft onEnd */
/* Audio: zuerst die erzeugten Audiodateien (natürliche Stimmen), sonst englische Systemstimme */
const PLAYER=typeof Audio!=="undefined"?new Audio():null;
if(PLAYER){PLAYER.preload="auto"}
const hasFile=key=>!!(key&&DATA.audio&&DATA.audio[key]);
function speak(parts,accent,onEnd,key){
  stopSpeech();const tok=TTS.token;
  if(hasFile(key)&&PLAYER){
    let done=false;const fin=ok=>{if(done||tok!==TTS.token)return;done=true;PLAYER.onended=PLAYER.onerror=null;onEnd&&onEnd(ok)};
    PLAYER.onended=()=>fin(true);
    PLAYER.onerror=()=>{if(done)return;done=true;ttsSpeak(parts,accent,onEnd)};
    PLAYER.src="audio/"+key+".mp3";PLAYER.playbackRate=S.rate||1;
    const pr=PLAYER.play();
    if(pr&&pr.catch)pr.catch(err=>{if(done)return;
      /* Autoplay blockiert (z. B. iPhone ohne Antippen): Knopf anbieten */
      if(err&&err.name==="NotAllowedError"){const b=document.createElement("button");b.className="btn primary";b.textContent="▶ Audio abspielen";b.style.cssText="position:fixed;left:50%;top:40%;transform:translateX(-50%);z-index:40";
        document.body.appendChild(b);b.onclick=()=>{b.remove();PLAYER.play().catch(()=>fin(false))}}
      else{done=true;ttsSpeak(parts,accent,onEnd)}});
    return;
  }
  ttsSpeak(parts,accent,onEnd);
}
function ttsSpeak(parts,accent,onEnd){
  const tok=TTS.token;
  if(!TTS.ok){setTimeout(()=>onEnd&&onEnd(false),300);return}
  if(!TTS.voices.length){loadVoices();if(!TTS.voices.length&&!ttsSpeak.waited){ttsSpeak.waited=true;setTimeout(()=>{if(tok===TTS.token)ttsSpeak(parts,accent,onEnd)},1200);return}}
  if(!TTS.voices.length){/* keine englische Stimme: lieber nicht vorlesen als mit deutscher Stimme */setTimeout(()=>onEnd&&onEnd(false),300);return}
  const seq=[];parts.forEach(p=>splitSentences(p.text).forEach((s,i)=>seq.push({text:s.trim(),g:p.g,gap:i===0?450:120})));
  let i=0;
  const next=()=>{
    if(tok!==TTS.token)return;
    if(i>=seq.length){onEnd&&onEnd(true);return}
    const p=seq[i++];if(!p.text){next();return}
    const u=new SpeechSynthesisUtterance(p.text);const v=pickVoice(p.g,accent);
    if(v){u.voice=v;u.lang=v.lang}else u.lang=accent;
    u.rate=(S.rate||1)*0.95;
    const genderKnown=v&&(p.g==="W"?FEM.test(v.name):MAL.test(v.name));
    u.pitch=genderKnown?1:(p.g==="W"?1.08:0.92);
    let done=false;const fin=()=>{if(done)return;done=true;setTimeout(next,i<seq.length?seq[i].gap:0)};
    u.onend=fin;u.onerror=fin;
    /* Sicherheitsnetz, falls ein Browser kein onend liefert */
    setTimeout(()=>{if(!done&&tok===TTS.token&&!speechSynthesis.speaking)fin()},Math.max(4000,p.text.length*110));
    try{speechSynthesis.speak(u)}catch(e){fin()}
  };
  setTimeout(next,250);
}
function stopSpeech(){TTS.token++;if(PLAYER){try{PLAYER.onended=PLAYER.onerror=null;PLAYER.pause()}catch(e){}}if(TTS.ok){try{speechSynthesis.cancel()}catch(e){}}}
const accentOf=it=>ACCENTS[hash(it.id)%ACCENTS.length];

/* ---------- Spracherkennung (nur wo erlaubt, sonst Diktat/Tippen) ---------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
const canRecognize=!!SR&&!BUILD.artifact;
let REC=null;
function startRecognition(onText){
  if(!canRecognize)return false;
  try{REC=new SR();REC.lang="en-US";REC.continuous=true;REC.interimResults=true;
    let finalTxt="";REC.onresult=e=>{let interim="";for(let i=e.resultIndex;i<e.results.length;i++){const r=e.results[i];if(r.isFinal)finalTxt+=r[0].transcript+" ";else interim+=r[0].transcript}onText((finalTxt+interim).trim())};
    REC.onerror=()=>{};REC.start();return true}catch(e){REC=null;return false}
}
function stopRecognition(){if(REC){try{REC.stop()}catch(e){}REC=null}}

/* ---------- Aufgabentypen ---------- */
const POOL=(sec,key)=>((DATA[sec]||{})[key])||[];
const TYPES={
  ctw:{sec:"reading",key:"ctw",name:"Complete the Words",de:"Fehlende Buchstaben in einem Absatz ergänzen",kind:"ctw"},
  daily:{sec:"reading",key:"daily",name:"Read in Daily Life",de:"Kurze Alltagstexte, 2–3 Fragen",kind:"mcq"},
  academic:{sec:"reading",key:"academic",name:"Read an Academic Passage",de:"Fachtext, 5 Fragen",kind:"mcq"},
  choose:{sec:"listening",key:"choose",name:"Listen and Choose a Response",de:"Passende Antwort auf einen gehörten Satz",kind:"choose",audio:true},
  conversation:{sec:"listening",key:"conversation",name:"Listen to a Conversation",de:"Dialog, 2 Fragen",kind:"laudio",audio:true},
  announcement:{sec:"listening",key:"announcement",name:"Listen to an Announcement",de:"Durchsage, 2 Fragen",kind:"laudio",audio:true},
  talk:{sec:"listening",key:"talk",name:"Listen to an Academic Talk",de:"Vortrag, 4 Fragen",kind:"laudio",audio:true},
  bas:{sec:"writing",key:"bas",name:"Build a Sentence",de:"Antwortsatz aus Blöcken bauen",kind:"bas"},
  email:{sec:"writing",key:"email",name:"Write an Email",de:"7 Minuten, 3 Teilaufgaben",kind:"email"},
  discussion:{sec:"writing",key:"discussion",name:"Academic Discussion",de:"10 Minuten, mindestens 100 Wörter",kind:"discussion"},
  repeat:{sec:"speaking",key:"repeat",name:"Listen and Repeat",de:"7 Sätze nachsprechen",kind:"repeat",audio:true},
  interview:{sec:"speaking",key:"interview",name:"Take an Interview",de:"4 Fragen, je 45 Sekunden",kind:"interview",audio:true}
};
const pool=t=>POOL(TYPES[t].sec,TYPES[t].key);
const ALLITEMS={},TYPE_OF={};Object.keys(TYPES).forEach(t=>pool(t).forEach(it=>{ALLITEMS[it.id]=it;TYPE_OF[it.id]=t}));
const byId=id=>ALLITEMS[id];
/* Feste Probetests: jede Aufgabe gehört zu höchstens einem Test (build.py → DATA.forms) */
const FORMS=DATA.forms||[];
const FORM_OF={};FORMS.forEach((f,fi)=>{const add=id=>{FORM_OF[id]=fi};
  ["reading","listening"].forEach(s=>["m1","easy","hard"].forEach(m=>f[s][m].forEach(add)));
  f.writing.bas.forEach(add);[f.writing.email,f.writing.discussion,f.speaking.repeat,f.speaking.interview].forEach(add)});
const formRuns=(fi,sec)=>S.history.filter(h=>h.form===fi+1&&h.kind!=="practice"&&h.sections&&h.sections[sec]);
const formDone=(fi,sec)=>formRuns(fi,sec).length>0;
const ready=t=>pool(t).length>0&&(!TYPES[t].audio||TTS.ok||!!PLAYER);
const SECTIONS={
  reading:{name:"Reading",de:"2 Module, adaptiv",min:30,types:["ctw","daily","academic"]},
  listening:{name:"Listening",de:"2 Module, adaptiv",min:29,types:["choose","conversation","announcement","talk"]},
  writing:{name:"Writing",de:"Build a Sentence, Email, Discussion",min:23,types:["bas","email","discussion"]},
  speaking:{name:"Speaking",de:"Listen and Repeat, Interview",min:8,types:["repeat","interview"]}
};
const SEC_ORDER=["reading","listening","writing","speaking"];
const sectionReady=s=>SECTIONS[s].types.every(ready);
const typeOf=sc=>sc.type||sc.t;

/* Auswahl: wenig gesehene zuerst, passendes Level bevorzugt */
function pick(type,n,level,exclude){
  exclude=exclude||new Set();
  const all=pool(type).filter(x=>!exclude.has(x.id));
  const sec=TYPES[type].sec;
  const hold=x=>{const fo=FORM_OF[x.id];return fo==null?0:formDone(fo,sec)?2:60-fo*6};
  const score=x=>hold(x)+(S.seen[x.id]||0)*10+(level&&x.level!==level?5:0)+Math.random();
  const r=all.slice().sort((a,b)=>score(a)-score(b)).slice(0,n);
  r.forEach(x=>exclude.add(x.id));return r;
}

/* ---------- Anweisungen (wie im Test, englisch) ---------- */
const GENRE_NOUN={email:"an email",notice:"a notice",chat:"a text message chain",menu:"a menu",schedule:"a schedule",ad:"an advertisement",receipt:"a receipt",post:"a social media post",form:"a form",flyer:"a flyer",instructions:"some instructions",review:"a review",webpage:"a web page"};
const DIRECTIONS={
  ctw:"Fill in the missing letters in the paragraph.",
  academic:"Read a passage. Then answer the questions.",
  bas:"Make an appropriate sentence.",
  email:"You will read some information and use the information to write an email. You will have 7 minutes to write the email. Write as much as you can and in complete sentences.",
  discussion:"Your professor is teaching a class. Write a post responding to the professor's question. In your response, you should express and support your opinion and make a contribution to the discussion in your own words. An effective response will contain at least 100 words. You will have 10 minutes to write.",
  choose:"Listen to the speaker. Then choose the best response.",
  conversation:"Listen to a conversation. Then answer the questions.",
  announcement:"Listen to an announcement. Then answer the questions.",
  talk:"Listen to a talk. Then answer the questions.",
  interview:"Please answer the interviewer's questions."
};
const dailyDirection=it=>"Read "+(GENRE_NOUN[it.genre]||"a text")+". Then answer the questions.";

/* ---------- Session-Aufbau ---------- */
let view={name:"home"};
let SES=null,TICK=null,keyHandler=null;

function setScreens(type,item){
  const T=TYPES[type],sec=T.sec;
  if(T.kind==="ctw")return [{t:"ctw",sec,type,item}];
  if(T.kind==="mcq")return item.questions.map((q,qi)=>({t:"mcq",sec,type,item,qi}));
  if(T.kind==="choose")return [{t:"choose",sec,type,item}];
  if(T.kind==="laudio")return [{t:"laudio",sec,type,item},...item.questions.map((q,qi)=>({t:"lq",sec,type,item,qi}))];
  if(T.kind==="bas")return [{t:"bas",sec,type,item}];
  if(T.kind==="repeat")return item.sentences.map((s,si)=>({t:"repeat",sec,type,item,si}));
  if(T.kind==="interview")return item.questions.map((q,qi)=>({t:"interview",sec,type,item,qi}));
  return [{t:T.kind,sec,type,item}];
}
const formScreens=ids=>ids.flatMap(id=>setScreens(TYPE_OF[id],ALLITEMS[id]));
function sectionParts(sec,fi){
  const F=FORMS[fi];
  if(sec==="reading")return [{name:"Reading",sec,limit:30*60,screens:formScreens(F.reading.m1),floor:0,adaptive:true,module:1,intro:true}];
  if(sec==="listening")return [{name:"Listening",sec,limit:29*60,screens:formScreens(F.listening.m1),floor:0,adaptive:true,module:1,noBack:true,intro:true}];
  if(sec==="writing")return [
    {name:"Build a Sentence",sec,limit:6*60,screens:formScreens(F.writing.bas),floor:0,intro:true},
    {name:"Write an Email",sec,limit:7*60,screens:formScreens([F.writing.email]),floor:0},
    {name:"Academic Discussion",sec,limit:10*60,screens:formScreens([F.writing.discussion]),floor:0}];
  if(sec==="speaking")return [
    {name:"Listen and Repeat",sec,limit:null,screens:formScreens([F.speaking.repeat]),floor:0,noBack:true,selfTimed:true,intro:true},
    {name:"Take an Interview",sec,limit:null,screens:formScreens([F.speaking.interview]),floor:0,noBack:true,selfTimed:true}];
}
function newSession(o){const s=Object.assign({answers:{},times:{},changes:{},p:0,i:0,started:Date.now()},o);s.used=s.parts.map(()=>0);return s}
function startSectionTest(sec,fi){
  SES=newSession({kind:"test",section:sec,form:fi,title:"Probetest "+(fi+1)+" · "+SECTIONS[sec].name,parts:sectionParts(sec,fi)});
  go("runner");
}
function startFullTest(fi){
  SES=newSession({kind:"full",section:"full",form:fi,title:"Probetest "+(fi+1)+" · Kompletter Test",parts:SEC_ORDER.flatMap(s=>sectionParts(s,fi))});
  go("runner");
}
function startPractice(type){
  const T=TYPES[type];
  const items=T.kind==="bas"?pick("bas",5):T.kind==="choose"?pick("choose",6):pick(type,1);
  if(!items.length)return;
  const screens=items.flatMap(it=>setScreens(type,it));
  const limit=type==="email"?7*60:type==="discussion"?10*60:null;
  SES=newSession({kind:"practice",type,section:T.sec,title:T.name,parts:[{name:T.name,sec:T.sec,limit,screens,floor:0,noBack:!!T.audio,selfTimed:T.kind==="repeat"||T.kind==="interview"}]});
  go("runner");
}
/* Bildschirme für ausgewählte Fragen: bei Listening zuerst das Audio */
function screensFor(id,qis){
  const t=TYPE_OF[id],it=ALLITEMS[id];if(!it)return [];
  const all=setScreens(t,it);if(!qis)return all;
  return all.filter(sc=>sc.t==="laudio"||qis.includes(sc.qi));
}
function startCustom(title,screens,extra){
  if(!screens.length)return;
  const audio=screens.some(sc=>TYPES[sc.type].audio);
  SES=newSession(Object.assign({kind:"practice",section:screens[0].sec,title,parts:[{name:title,sec:screens[0].sec,limit:null,screens,floor:0,noBack:audio}]},extra||{}));
  go("runner");
}
/* Schwächen-Training: Fragen eines Fragetyps, wenig gesehene zuerst */
function startSkillPractice(k){
  const [g,sk]=k.split(".");
  if(g==="w"){startPractice("ctw");return}
  if(g==="s"){startPractice("repeat");return}
  const types=g==="r"?["daily","academic"]:g==="l"?["conversation","announcement","talk"]:g==="c"?["choose"]:["bas"];
  const cand=[];
  types.forEach(t=>pool(t).forEach(it=>{
    const qis=it.questions?it.questions.map((q,i)=>q.skill===sk?i:-1).filter(i=>i>=0):(it.skill===sk?[0]:[]);
    if(qis.length)cand.push({it,t,qis})}));
  const sec=TYPES[types[0]].sec;
  const hold=x=>{const fo=FORM_OF[x.it.id];return fo==null?0:formDone(fo,sec)?2:60-fo*6};
  cand.sort((a,b)=>(hold(a)+(S.seen[a.it.id]||0)*10+Math.random())-(hold(b)+(S.seen[b.it.id]||0)*10+Math.random()));
  const screens=[];let n=0;const max=g==="l"?6:8;
  for(const c of cand){if(n>=max)break;screens.push(...screensFor(c.it.id,c.it.questions?c.qis:null));n+=c.qis.length}
  startCustom("Training: "+skillName(k),screens,{skill:k});
}
/* Fehlerheft: früher falsch beantwortete Fragen erneut */
function wrongKeys(){return Object.keys(S.wrong||{}).filter(k=>ALLITEMS[k.split("#")[0]]).sort((a,b)=>(S.wrong[a].d||0)-(S.wrong[b].d||0))}
function startRedo(keys){
  keys=(keys||wrongKeys()).slice(0,12);const by={};
  keys.forEach(k=>{const [id,qi]=k.split("#");(by[id]=by[id]||[]).push(qi==null?null:+qi)});
  const screens=Object.keys(by).flatMap(id=>screensFor(id,by[id][0]==null?null:by[id]));
  /* Listening und Reading nicht mischen: nach Section sortieren */
  screens.sort((a,b)=>SEC_ORDER.indexOf(a.sec)-SEC_ORDER.indexOf(b.sec));
  startCustom("Fehler wiederholen",screens,{redo:true});
}

/* ---------- Bewertung von Antworten ---------- */
const ctwGaps=text=>{const g=[];text.replace(/([A-Za-z’'-]*)\{([^}]+)\}/g,(m,a,b)=>{g.push({shown:a,missing:b})});return g};
const norm=s=>String(s).toLowerCase().replace(/[’]/g,"'").replace(/\s+/g," ").trim();
const STOP=new Set("a an the to of in on at for and or but is are was were be been it its this that these those you your we our they their he she his her i my me us them with by from as if so do does did have has had not no".split(" "));
const CONTR={"i'm":"i am","you're":"you are","we're":"we are","they're":"they are","it's":"it is","that's":"that is","let's":"let us","don't":"do not","doesn't":"does not","can't":"cannot","won't":"will not","isn't":"is not","aren't":"are not","i'll":"i will","you'll":"you will","there's":"there is","what's":"what is","i've":"i have","we've":"we have","shouldn't":"should not","wouldn't":"would not"};
const toks=s=>String(s).toLowerCase().replace(/[’]/g,"'").replace(/[^a-z0-9' ]+/g," ").split(/\s+/).filter(Boolean).flatMap(w=>(CONTR[w]||w).split(" "));
function tokLev(a,b){const m=a.length,n=b.length;let p=Array.from({length:n+1},(_,j)=>j);for(let i=1;i<=m;i++){const c=[i];for(let j=1;j<=n;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[n]}
/* Listen and Repeat: Abgleich nach ETS-Rubric (5 exakt … 0 leer) */
function repeatScore(target,said){
  const t=toks(target),s=toks(said);if(!s.length)return 0;
  const d=tokLev(t,s);if(d===0)return 5;
  const ratio=d/t.length;const content=t.filter(w=>!STOP.has(w));const missC=content.filter(w=>!s.includes(w)).length;
  if(missC===0&&ratio<=.25)return 4;
  if(missC<=Math.max(1,Math.round(content.length*.25))&&ratio<=.5)return 3;
  const overlap=t.filter(w=>s.includes(w)).length/t.length;
  if(overlap>=.35)return 2;
  return overlap>0?1:0;
}
function scoreScreen(sc,ans){
  if(sc.t==="ctw"){const gaps=ctwGaps(sc.item.text);const a=ans[sc.item.id]||[];
    const r=gaps.map((g,i)=>((a[i]||"").trim().toLowerCase().replace(/’/g,"'")===g.missing.toLowerCase().replace(/’/g,"'")));
    return {right:r.filter(Boolean).length,total:gaps.length,detail:r};}
  if(sc.t==="mcq"||sc.t==="lq"){const a=ans[sc.item.id+"#"+sc.qi];return {right:a===sc.item.questions[sc.qi].answer?1:0,total:1}}
  if(sc.t==="choose"){return {right:ans[sc.item.id]===sc.item.answer?1:0,total:1}}
  if(sc.t==="bas"){const a=ans[sc.item.id]||[];const built=a.map(i=>sc.item.chunks[i]).join(" ");
    const ok=a.length===sc.item.chunks.length&&a.every(x=>x!=null)&&norm(built)===norm(sc.item.chunks.join(" "));return {right:ok?1:0,total:1}}
  if(sc.t==="repeat"){return {right:repeatScore(sc.item.sentences[sc.si],ans[sc.item.id+"#"+sc.si]||""),total:5}}
  return {right:0,total:0};
}
function tally(screens,answers,filter){let r=0,t=0;screens.filter(x=>!filter||filter(x)).forEach(sc=>{const x=scoreScreen(sc,answers);r+=x.right;t+=x.total});return {right:r,total:t}}

/* Band-Schätzung (Annahmen, siehe CLAUDE.md) */
function adaptiveBand(pct,route){
  if(route==="hard"){if(pct>=.94)return 6;if(pct>=.86)return 5.5;if(pct>=.76)return 5;if(pct>=.66)return 4.5;if(pct>=.56)return 4;return 3.5}
  if(pct>=.9)return 4.5;if(pct>=.78)return 4;if(pct>=.64)return 3.5;if(pct>=.5)return 3;if(pct>=.36)return 2.5;if(pct>=.24)return 2;if(pct>=.12)return 1.5;return 1;
}
const table=(raw,t)=>{for(const [m,b] of t)if(raw>=m)return b;return 1};
const writingBand=raw=>table(raw,[[20,6],[18,5.5],[16,5],[14,4.5],[12,4],[10,3.5],[8,3],[6,2.5],[4,2],[2,1.5]]);
const speakingBand=raw=>table(raw,[[52,6],[47,5.5],[42,5],[37,4.5],[32,4],[27,3.5],[22,3],[17,2.5],[12,2],[6,1.5]]);
const roundHalf=x=>Math.round(x*2)/2;
const fmtBand=b=>b==null?"–":(Number.isInteger(b)?b+".0":String(b)).replace(".",",");

/* ---------- Router ---------- */
function go(name,extra){view=Object.assign({name},extra||{});render();window.scrollTo(0,0)}
function render(){
  clearInterval(TICK);TICK=null;stopSpeech();stopRecognition();keyHandler=null;
  document.body.classList.remove("testing");
  if(view.name==="home")renderHome();
  else if(view.name==="runner")renderRunner();
  else if(view.name==="result")renderResult();
  else if(view.name==="history")renderHistory();
}

/* ---------- Start ---------- */
function bandSeries(sec){return S.history.filter(h=>h.kind!=="practice"&&h.sections&&h.sections[sec]&&h.sections[sec].band!=null).map(h=>h.sections[sec].band).slice(-8)}
function spark(vals){
  const W=150,H=40,pad=4,x=i=>vals.length<2?W/2:pad+i*(W-2*pad)/(vals.length-1),y=v=>H-pad-(v-1)/5*(H-2*pad);
  const pts=vals.map((v,i)=>x(i).toFixed(1)+","+y(v).toFixed(1)).join(" ");
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><line x1="0" x2="${W}" y1="${y(5.5)}" y2="${y(5.5)}" stroke="var(--mark)" stroke-dasharray="3 3" stroke-width="1"/>${vals.length>1?`<polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="1.5"/>`:""}${vals.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="${i===vals.length-1?3:2}" fill="var(--accent)"/>`).join("")}</svg>`;
}
function trendHtml(){
  const rows=SEC_ORDER.map(sec=>({sec,vals:bandSeries(sec)})).filter(r=>r.vals.length);
  if(!rows.length)return "";
  return `<section class="group"><div class="row"><div class="label">Fortschritt</div><span class="muted small">gestrichelt: Ziel 5,5</span></div><div class="typelist">${rows.map(r=>`<div class="typerow" style="cursor:default"><div><div class="t">${SECTIONS[r.sec].name}</div><div class="d">${r.vals.length} Test${r.vals.length>1?"s":""} · zuletzt Band ${fmtBand(r.vals[r.vals.length-1])}</div></div>${spark(r.vals)}</div>`).join("")}</div></section>`;
}
function statText(t){const s=S.stats[t];if(!s||!s.total)return "";return Math.round(100*s.right/s.total)+" % · "+s.sets+"×"}
const cefr=b=>b==null?"":b>=6?"C2":b>=5?"C1":b>=4?"B2":b>=3?"B1":b>=2?"A2":"A1";
const lastBand=(fi,sec)=>{const r=formRuns(fi,sec).pop();return r?{band:r.sections[sec].band,id:r.id}:null};
function renderHome(){
  const tests=S.history.filter(h=>h.kind!=="practice").slice().reverse().slice(0,6);
  const audioOk=TTS.ok||!!PLAYER;
  const nextForm=FORMS.findIndex((f,fi)=>!SEC_ORDER.every(sec=>formDone(fi,sec)));
  const card=(f,fi)=>{
    const full=S.history.filter(h=>h.kind==="full"&&h.form===fi+1).pop();
    const done=SEC_ORDER.filter(sec=>formDone(fi,sec)).length;
    const status=full?(full.band!=null?"Gesamt "+fmtBand(full.band)+" · "+full.date:"Gemacht am "+full.date+" · Bewertung offen"):done?done+" von 4 Sections gemacht":"Noch offen";
    return `<div class="formcard ${fi===nextForm?"next":""}">
      <div class="row"><b class="ft">Probetest ${fi+1}</b><span class="stat">${fi===nextForm&&!done?"Als Nächstes":esc(status)}</span></div>
      <button class="btn primary" data-full="${fi}" ${audioOk?"":"disabled"}>Kompletter Test · ca. 90 Min</button>
      <div class="secbtns">${SEC_ORDER.map(sec=>{const l=lastBand(fi,sec);return `<button data-sec="${sec}" data-form="${fi}" ${sectionReady(sec)?"":"disabled"}><span>${SECTIONS[sec].name}</span><b>${l?(l.band!=null?fmtBand(l.band):"✓"):SECTIONS[sec].min+"′"}</b></button>`}).join("")}</div>
    </div>`};
  const rows=SEC_ORDER.map(sec=>`<div class="sect">${SECTIONS[sec].name}</div>`+SECTIONS[sec].types.map(t=>{const T=TYPES[t];const ok=ready(t);
    return `<button class="typerow" data-practice="${t}" ${ok?"":"disabled"}><div><div class="t">${T.name}</div><div class="d">${ok?T.de:"Sprachausgabe nicht verfügbar"}</div></div><div class="s">${ok?statText(t):""}</div></button>`}).join("")).join("");
  const weak=weakSkills(),wk=wrongKeys();
  app().innerHTML=`<div class="wrap">
    <header><h1>TOEFL-Trainer</h1><p class="sub">${FORMS.length} Probetests im Format des TOEFL iBT ab 2026, jeder mit eigenen Aufgaben. Mit Zeitlimit, Band-Schätzung und Fehleranalyse nach jedem Durchlauf.</p></header>
    <section class="group"><div class="row"><div class="label">Probetests</div><span class="muted small">Zahl = letztes Band · ′ = Minuten</span></div>
      <div class="forms">${FORMS.map(card).join("")}</div></section>
    ${weak.length||wk.length?`<section class="group"><div class="row"><div class="label">Dein Fehlerprofil</div><span class="muted small">über alle Durchgänge</span></div><div class="typelist">
      ${weak.map(w=>`<button class="typerow" data-train="${w.k}"><div><div class="t">${esc(skillName(w.k))}</div><div class="d">${esc(KB[w.k].fix.split(/(?<=[.:]) /)[0])}</div></div><div class="s">${Math.round(100*w.pct)} % richtig</div></button>`).join("")}
      ${wk.length?`<button class="typerow" id="redo"><div><div class="t">Fehler wiederholen</div><div class="d">Falsch beantwortete Fragen erneut, bis sie sitzen</div></div><div class="s">${wk.length} offen</div></button>`:""}
    </div></section>`:""}
    ${trendHtml()}
    <section class="group"><div class="row"><div class="label">Training nach Aufgabentyp</div><span class="muted small">nimmt zuerst Aufgaben aus schon gemachten Tests</span></div><div class="typelist">${rows}</div></section>
    <section class="group"><div class="row"><div class="label">Letzte Tests</div>${S.history.length?`<button class="btn ghost small" id="h-all">Alle Durchgänge</button>`:""}</div>
      ${tests.length?`<div class="tw"><table class="hist"><thead><tr><th>Datum</th><th>Test</th><th class="n">Band</th></tr></thead><tbody>${tests.map(h=>`<tr data-h="${h.id}" style="cursor:pointer"><td>${esc(h.date)}</td><td>${esc(h.title)}</td><td class="n">${fmtBand(h.band)}</td></tr>`).join("")}</tbody></table></div>`:`<p class="muted small">Noch kein Test gemacht. Probetest 1 zeigt dir dein Ausgangsniveau.</p>`}
    </section>
    <section class="group"><div class="label">Einstellungen</div>
      <div class="typelist">
        <div class="typerow" style="cursor:default"><div><div class="t">Sprechtempo der Stimmen</div><div class="d">1,0 entspricht dem Tempo im Test</div></div>
          <select id="rate" style="font:500 .9rem var(--f-body);background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:6px 10px">${[0.85,0.9,0.95,1,1.05,1.1,1.2].map(r=>`<option value="${r}" ${r===S.rate?"selected":""}>${String(r).replace(".",",")}</option>`).join("")}</select></div>
        ${!BUILD.artifact&&"serviceWorker" in navigator&&DATA.audio&&Object.keys(DATA.audio).length?`<button class="typerow" id="offaudio"><div><div class="t">Audios offline speichern</div><div class="d" id="offd">Lädt alle Hörtexte einmal herunter (ca. ${Math.round(Object.values(DATA.audio).reduce((a,b)=>a+b,0)*6/1000)} MB), danach funktioniert Listening ohne Internet.</div></div><div class="s">↓</div></button>`:""}
        <button class="typerow" id="voicetest"><div><div class="t">Stimmen testen</div><div class="d">${DATA.audio&&Object.keys(DATA.audio).length?"Natürliche Stimmen als Audiodateien ("+Object.keys(DATA.audio).length+" Hörtexte)":"Systemstimmen des Geräts"}</div></div><div class="s">▶</div></button>
      </div>
      <p class="muted small">${SAMPLE?"KI-Bewertung und Fehleranalyse durch Claude sind hier direkt verfügbar.":BUILD.artifact?"KI-Bewertung wird geladen oder ist in dieser Ansicht nicht verfügbar. Alternativ: Prompt kopieren und in Claude einfügen.":"Offline-Version: Antworten werden gespeichert. Für die Bewertung von Writing und Interview und für die Tiefenanalyse den Prompt kopieren und in Claude einfügen."}
      ${canRecognize?" Speaking: Spracherkennung des Browsers wird genutzt (braucht Mikrofon-Freigabe).":" Speaking: Antworten per Diktierfunktion der Tastatur eingeben."}</p>
    </section>
    <details class="group"><summary class="label" style="cursor:pointer">Lernstand übertragen</summary>
      <p class="muted small">Code kopieren und in der anderen Version (Handy-App oder Claude) einfügen. Beim Übernehmen wird der dortige Stand ersetzt.</p>
      <textarea class="code" id="sync" rows="3" spellcheck="false" aria-label="Lernstand-Code"></textarea>
      <div class="btns"><button class="btn" id="exp">Code kopieren</button><button class="btn" id="imp">Eingefügten Code übernehmen</button></div>
      <p class="muted small" id="syncmsg" aria-live="polite"></p>
    </details>
  </div>`;
  const again=(fi,sec,go2)=>{const l=sec?lastBand(fi,sec):null;const full=!sec&&S.history.some(h=>h.kind==="full"&&h.form===fi+1);
    if(l||full)confirmBox("Diesen Test hast du schon gemacht"+(l&&l.band!=null?" (Band "+fmtBand(l.band)+")":"")+". Die Aufgaben sind dieselben. Wiederholen?","Wiederholen",go2);else go2()};
  $$("[data-sec]").forEach(b=>b.onclick=()=>{const fi=+b.dataset.form,sec=b.dataset.sec;again(fi,sec,()=>startSectionTest(sec,fi))});
  $$("[data-full]").forEach(b=>b.onclick=()=>{const fi=+b.dataset.full;again(fi,null,()=>confirmBox("Kompletter Test: ca. 90 Minuten ohne Pause, alle vier Sections. Du brauchst Ruhe, Kopfhörer und für Speaking die Diktierfunktion. Jetzt starten?","Starten",()=>startFullTest(fi)))});
  $$("[data-practice]").forEach(b=>b.onclick=()=>startPractice(b.dataset.practice));
  $$("[data-train]").forEach(b=>b.onclick=()=>startSkillPractice(b.dataset.train));
  const rd=$("#redo");if(rd)rd.onclick=()=>startRedo();
  $$("[data-h]").forEach(r=>r.onclick=()=>go("result",{id:r.dataset.h}));
  const ha=$("#h-all");if(ha)ha.onclick=()=>go("history");
  $("#rate").onchange=e=>{S.rate=+e.target.value;save()};
  const oa=$("#offaudio");if(oa)oa.onclick=async()=>{const keys=Object.keys(DATA.audio);let n=0;const d=$("#offd");
    for(const k of keys){try{await fetch("audio/"+k+".mp3")}catch(e){}n++;if(n%10===0||n===keys.length)d.textContent="Gespeichert: "+n+" von "+keys.length}
    d.textContent="Alle "+keys.length+" Hörtexte sind offline verfügbar."};
  $("#voicetest").onclick=()=>speak([{text:"This is a sound check. If you can hear this clearly, you are ready to begin.",g:"W"}],"en-US",()=>{},"soundcheck");
  let code="";try{const slim=Object.assign({},S,{history:S.history.slice(-40)});code="TT1:"+btoa(unescape(encodeURIComponent(JSON.stringify(slim))))}catch(e){}
  $("#sync").value=code;
  $("#exp").onclick=()=>{const done=m=>$("#syncmsg").textContent=m;
    try{navigator.clipboard.writeText(code).then(()=>done("Kopiert."),()=>{$("#sync").select();done("Code markiert: mit Strg+C / Cmd+C kopieren.")})}catch(e){$("#sync").select();done("Code markiert: mit Strg+C / Cmd+C kopieren.")}};
  $("#imp").onclick=()=>{const t=$("#sync").value.trim();
    try{if(!t.startsWith("TT1:"))throw 0;const x=JSON.parse(decodeURIComponent(escape(atob(t.slice(4)))));if(!x||!Array.isArray(x.history))throw 0;S=Object.assign({history:[],seen:{},stats:{},skills:{},wrong:{},rate:1},x);save();render()}
    catch(e){$("#syncmsg").textContent="Der Code ist ungültig. Er muss mit TT1: beginnen und vollständig sein."}};
}

/* ---------- Testablauf ---------- */
function cur(){const p=SES.parts[SES.p];return {p,sc:p.screens[SES.i]}}
let NEXT_LOCK=false;
/* Im Test ist die Oberfläche englisch wie am Testtag, im Training deutsch */
const inTest=()=>!!SES&&SES.kind!=="practice";
const tx=(en,de)=>inTest()?en:de;
const INTRO={
  reading:{title:"Reading Section",html:`<p>In this section, you will show how well you understand written English. There are three types of tasks: <b>Complete the Words</b>, <b>Read in Daily Life</b>, and <b>Read an Academic Passage</b>.</p>
    <p>The section has two modules. Within a module, you may go back to earlier questions and change your answers. Once you finish Module 1, you cannot return to it.</p>
    <p>You have <b>30 minutes</b> for the whole section. The clock at the top of the screen shows the time remaining. There is no penalty for wrong answers, so answer every question.</p>`},
  listening:{title:"Listening Section",html:`<p>In this section, you will show how well you understand spoken English. There are four types of tasks: <b>Listen and Choose a Response</b>, <b>Listen to a Conversation</b>, <b>Listen to an Announcement</b>, and <b>Listen to an Academic Talk</b>.</p>
    <p>You will hear each recording <b>only once</b>. You must answer each question before you continue, and you cannot go back to earlier questions.</p>
    <p>The section has two modules and takes about <b>29 minutes</b>. Put on your headphones now and check the volume.</p>`,sound:true},
  writing:{title:"Writing Section",html:`<p>In this section, you will complete three tasks:</p>
    <ul><li><b>Build a Sentence</b>: 10 items, 6 minutes</li><li><b>Write an Email</b>: 7 minutes</li><li><b>Write for an Academic Discussion</b>: 10 minutes</li></ul>
    <p>Each task has its own time limit. When the time is up, your answer is saved and the next task begins. Spell checking and grammar checking are not available.</p>`},
  speaking:{title:"Speaking Section",html:`<p>In this section, you will complete two tasks:</p>
    <ul><li><b>Listen and Repeat</b>: 7 sentences. Repeat each sentence exactly as you hear it, only once.</li><li><b>Take an Interview</b>: 4 questions, 45 seconds for each answer.</li></ul>
    <p>There is no preparation time. After each recording, a tone tells you when to begin speaking. When the time is up, your answer is saved and the next item begins automatically.</p>`,speak:true}
};
function renderIntro(p){
  const I=INTRO[p.sec];
  app().innerHTML=`<div class="testbar"><div class="testbar-in"><span class="sec" style="display:inline">${esc(SES.title)}</span><span class="sp"></span><button class="btn ghost" id="exit">Exit</button></div><div class="progress"><i style="width:0"></i></div></div>
    <div class="wrap" id="stage"><div class="panel stack intro"><div class="label">Directions</div><h2>${I.title}</h2>${I.html}
      ${I.sound?`<div class="btns"><button class="btn" id="soundcheck">▶ Play sound check</button></div><p class="muted small" id="sc-msg" style="margin:0"></p>`:""}
      ${I.speak?`<p class="muted small" style="margin:0">${canRecognize?"In dieser App: Die Spracherkennung des Browsers schreibt deine Antwort mit (Mikrofon freigeben).":"In dieser App: Antwort über die Diktierfunktion der Tastatur einsprechen (Mikrofon-Symbol), das Textfeld ist dafür schon aktiv."}</p>`:""}
      <div class="btns"><button class="btn primary" id="begin">Begin</button></div></div></div>`;
  document.body.classList.add("testing");
  $("#begin").onclick=()=>{stopSpeech();p.intro=false;renderRunner()};
  $("#exit").onclick=exitConfirm;
  const b=$("#soundcheck");if(b)b.onclick=()=>{$("#sc-msg").textContent="Playing …";speak([{text:"This is a sound check. If you can hear this clearly, you are ready to begin.",g:"W"}],"en-US",ok=>{const m=$("#sc-msg");if(m)m.textContent=ok?"If the voice was clear, select Begin.":"No audio available on this device."},"soundcheck")};
}
function exitConfirm(){confirmBox(tx("Exit the test? Your answers in this run will be lost.","Durchgang beenden? Der Fortschritt dieses Durchgangs geht verloren."),tx("Exit","Beenden"),()=>{SES=null;go("home")},tx("Cancel","Abbrechen"))}
function renderRunner(){
  clearInterval(TICK);stopSpeech();stopRecognition();keyHandler=null;
  const {p,sc}=cur();
  const isPractice=SES.kind==="practice";
  if(p.intro&&!isPractice){renderIntro(p);return}
  const n=p.screens.length;
  const modLabel=p.adaptive&&!isPractice?` · Module ${p.module}`:"";
  const limit=p.limit;
  const secName=isPractice?"Training":SECTIONS[p.sec].name;
  app().innerHTML=`<div class="testbar"><div class="testbar-in">
      <span class="sec">${esc(secName)}</span>
      <span class="pos"><span class="pn">${esc(p.name!==secName?p.name+" · ":"")}</span>${SES.i+1} ${tx("of","/")} ${n}${modLabel}</span>
      <span class="sp"></span>
      ${limit?`<button class="timer ${S.hideTimer?"hide":""}" id="timer" title="${tx("Hide or show time","Uhr ein-/ausblenden")}">${fmt(limit-SES.used[SES.p])}</button>`:p.selfTimed?`<span class="timer" id="timer">–</span>`:`<span class="timer" id="timer">${fmt(SES.used[SES.p])}</span>`}
      <button class="btn ghost" id="exit">${tx("Exit","Beenden")}</button>
      <div class="navbtns">${p.noBack?"":`<button class="btn" id="back" ${SES.i<=p.floor?"disabled":""}>Back</button>`}
      <button class="btn primary" id="next">Next</button></div>
    </div><div class="progress"><i style="width:${Math.round(100*(SES.i)/n)}%"></i></div></div>
    <div class="wrap wide" id="stage"></div>`;
  const stage=$("#stage");document.body.classList.add("testing");
  NEXT_LOCK=false;
  const R={ctw:renderCtw,mcq:renderMcq,lq:renderMcq,bas:renderBas,email:renderWrite,discussion:renderWrite,choose:renderChoose,laudio:renderLAudio,repeat:renderRepeat,interview:renderInterview}[sc.t];
  R(stage,sc);
  $("#next").onclick=()=>{if(!NEXT_LOCK)next()};
  const bk=$("#back");if(bk)bk.onclick=()=>{if(SES.i>p.floor){SES.i--;renderRunner()}};
  $("#exit").onclick=exitConfirm;
  const tb=$("#timer");if(tb&&tb.tagName==="BUTTON")tb.onclick=()=>{S.hideTimer=!S.hideTimer;save();tb.classList.toggle("hide",S.hideTimer)};
  TICK=setInterval(tick,1000);
}
function lockNext(on){NEXT_LOCK=on;const b=$("#next");if(b)b.disabled=on}
function tick(){
  if(!SES||view.name!=="runner")return;
  SES.used[SES.p]++;
  const p=SES.parts[SES.p],t=$("#timer"),sc=p.screens[SES.i];
  if(sc){const k=scKey(sc);SES.times[k]=(SES.times[k]||0)+1}
  if(p.limit){const left=p.limit-SES.used[SES.p];if(t){t.textContent=fmt(left);t.classList.toggle("low",left<=60)}
    if(left<=0){if(SES.kind!=="practice"){p.timedOut=true;endPart(true)}else if(!p.warned){p.warned=true;toast("Zeit abgelaufen. Im Test wäre die Aufgabe jetzt beendet.")}}}
  else if(t&&!p.selfTimed)t.textContent=fmt(SES.used[SES.p]);
}
function toast(m){const d=document.createElement("div");d.className="notice";d.style.cssText="position:fixed;left:50%;bottom:calc(84px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:20;box-shadow:var(--shadow);max-width:90vw";d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),4500)}
function confirmBox(msg,yes,onYes,no){
  const d=document.createElement("div");
  d.style.cssText="position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:30;display:grid;place-items:center;padding:20px";
  d.innerHTML=`<div class="panel stack" style="max-width:400px"><p style="margin:0">${esc(msg)}</p><div class="btns"><button class="btn" id="cb-no">${esc(no||"Abbrechen")}</button><button class="btn primary" id="cb-yes">${esc(yes)}</button></div></div>`;
  document.body.appendChild(d);d.querySelector("#cb-no").onclick=()=>d.remove();d.querySelector("#cb-yes").onclick=()=>{d.remove();onYes()};d.querySelector("#cb-yes").focus();
}
function openCount(p){
  return p.screens.slice(p.floor).filter(sc=>sc.t==="ctw"?ctwGaps(sc.item.text).some((g,i)=>!((SES.answers[sc.item.id]||[])[i]||"").trim()):isBinary(sc)?!answered(sc,SES.answers):(sc.t==="email"||sc.t==="discussion")?!String(SES.answers[sc.item.id]||"").trim():false).length;
}
function next(){
  const p=SES.parts[SES.p];
  if(SES.i<p.screens.length-1){SES.i++;renderRunner();window.scrollTo(0,0);return}
  const open=openCount(p);
  const warnEn=open?`You have ${open} unanswered ${open===1?"item":"items"}. `:"";
  if(SES.kind!=="practice"&&p.adaptive&&p.module===1){
    confirmBox(warnEn+"Finish Module 1? You will not be able to return to these questions.","Continue to Module 2",()=>startModule2(p),"Go back");
    return;
  }
  const lastPart=SES.p===SES.parts.length-1;
  const nextSec=!lastPart&&SES.parts[SES.p+1].sec!==p.sec?SECTIONS[SES.parts[SES.p+1].sec].name:null;
  const msg=SES.kind==="practice"?"Aufgabe abgeben?"
    :warnEn+(lastPart?"Finish the test and see your results?":nextSec?`Finish the ${SECTIONS[p.sec].name} section and continue with ${nextSec}?`:"Finish this part? You will not be able to return to it.");
  confirmBox(msg,tx(lastPart?"Finish":"Continue","Abgeben"),()=>endPart(false),tx("Go back","Abbrechen"));
}
function startModule2(p){
  const m1=tally(p.screens,SES.answers);p.m1=m1.right;p.m1max=m1.total;
  p.route=m1.total&&m1.right/m1.total>=.7?"hard":"easy";
  const m2=formScreens(FORMS[SES.form][p.sec][p.route]);
  p.floor=p.screens.length;p.screens.push(...m2);p.module=2;SES.i=p.floor;renderRunner();window.scrollTo(0,0);
}
function endPart(timeout){
  if(timeout)toast(tx("Time is up for this part.","Die Zeit für diesen Teil ist abgelaufen."));
  const p=SES.parts[SES.p];
  if(timeout)p.limitWas=p.limit,p.limit=null;
  if(p.adaptive&&p.module===1){/* Zeit in Modul 1 abgelaufen: Modul 2 entfällt */const m1=tally(p.screens,SES.answers);p.m1=m1.right;p.m1max=m1.total;p.route=p.route||"easy"}
  if(SES.p<SES.parts.length-1){SES.p++;SES.i=0;renderRunner();window.scrollTo(0,0);return}
  finish();
}
function sectionSummary(sec,screens,answers,ap){
  const r=tally(screens,answers);
  if(sec==="reading"||sec==="listening"){const route=ap&&ap.route||null;
    return {raw:r.right,max:r.total,route,m1:ap?ap.m1:null,m1max:ap?ap.m1max:null,band:r.total?adaptiveBand(r.right/r.total,route||"easy"):null}}
  if(sec==="writing"){const bas=tally(screens,answers,x=>x.t==="bas");return {raw:null,max:20,bas:bas.right,band:null}}
  if(sec==="speaking"){const rp=tally(screens,answers,x=>x.t==="repeat");return {raw:null,max:55,repeat:rp.right,band:null}}
}
function finish(){
  const s=SES;const all=s.parts.flatMap(p=>p.screens);
  all.forEach(sc=>markSeen(sc.item.id));
  /* Statistik je Aufgabentyp (Interview/Email/Discussion ohne Punkte) */
  const by={};all.forEach(sc=>{const t=typeOf(sc);const x=scoreScreen(sc,s.answers);if(!x.total)return;(by[t]=by[t]||{r:0,t:0,ids:new Set()});by[t].r+=x.right;by[t].t+=x.total;by[t].ids.add(sc.item.id)});
  Object.keys(by).forEach(t=>{const st=S.stats[t]||(S.stats[t]={right:0,total:0,sets:0});st.right+=by[t].r;st.total+=by[t].t;st.sets+=by[t].ids.size});
  /* Fehlerprofil je Fragetyp und Fehlerheft */
  S.skills=S.skills||{};S.wrong=S.wrong||{};
  all.forEach(sc=>{
    skillParts(sc,s.answers).forEach(x=>{const k=S.skills[x.k]||(S.skills[x.k]={r:0,t:0});k.r+=x.r;k.t+=x.t});
    if(isBinary(sc)){const key=scKey(sc),ok=scoreScreen(sc,s.answers).right===1;
      if(ok)delete S.wrong[key];else S.wrong[key]={n:((S.wrong[key]||{}).n||0)+1,d:Date.now()}}});
  const secs={};
  [...new Set(s.parts.map(p=>p.sec))].forEach(sec=>{const ps=s.parts.filter(p=>p.sec===sec);if(s.kind==="practice"&&!s.type)return;secs[sec]=sectionSummary(sec,ps.flatMap(p=>p.screens),s.answers,ps.find(p=>p.adaptive))});
  const entry={id:"h"+Date.now(),date:today(),kind:s.kind,section:s.section,type:s.type||null,form:s.form!=null?s.form+1:null,skill:s.skill||null,redo:!!s.redo,
    title:s.kind==="practice"?(s.type?"Training: ":"")+s.title:s.title,
    screens:all.map(sc=>({t:sc.t,type:sc.type,sec:sc.sec,id:sc.item.id,qi:sc.qi,si:sc.si})),answers:s.answers,times:s.times,changes:s.changes,
    parts:s.parts.map((p,i)=>({name:p.name,sec:p.sec,used:s.used[i],limit:p.limit||p.limitWas||null})),evals:{},sections:secs,band:null};
  updateBands(entry);
  S.history.push(entry);if(S.history.length>120)S.history.shift();save();
  SES=null;go("result",{id:entry.id});
}
function updateBands(e){
  const secs=e.sections||{};
  if(secs.writing){const w=secs.writing;if(e.evals.email&&e.evals.discussion){w.raw=w.bas+e.evals.email.score+e.evals.discussion.score;w.band=writingBand(w.raw)}}
  if(secs.speaking){const sp=secs.speaking;if(e.evals.interview&&Array.isArray(e.evals.interview.scores)){const iv=e.evals.interview.scores.reduce((a,b)=>a+(+b||0),0);sp.raw=sp.repeat+iv;sp.band=speakingBand(sp.raw)}}
  if(e.kind==="full"){const bs=SEC_ORDER.map(k=>secs[k]&&secs[k].band);e.band=bs.every(b=>b!=null)?roundHalf(bs.reduce((a,b)=>a+b,0)/4):null}
  else if(e.kind==="test"){e.band=(secs[e.section]||{}).band??null}
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

/* ---------- Bildschirm: Multiple Choice (Reading-Text oder Listening-Frage) ---------- */
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
function transcriptOf(sc){
  const it=sc.item;
  if(sc.type==="conversation")return it.lines.map(l=>(l.who==="W"?"Woman: ":"Man: ")+l.text).join("\n");
  if(sc.type==="choose")return it.prompt;
  return it.text;
}
function audioParts(sc){
  const it=sc.item;
  if(sc.type==="conversation")return it.lines.map(l=>({text:l.text,g:l.who}));
  if(sc.type==="choose")return [{text:it.prompt,g:it.voice||"W"}];
  return [{text:it.text,g:it.voice||"W"}];
}
function optsHtml(q,chosen){return `<div class="opts">${q.options.map((o,i)=>`<button class="opt" data-o="${i}" aria-pressed="${chosen===i}"><span class="k">${LETTERS[i]}</span><span>${esc(o)}</span></button>`).join("")}</div>`}
function bindOpts(key,onPick){
  $$(".opt").forEach(b=>b.onclick=()=>{const v=+b.dataset.o,prev=SES.answers[key];
    const ch=SES.changes[key]||(SES.changes[key]={first:v,n:0});if(prev!=null&&prev!==v)ch.n++;
    SES.answers[key]=v;$$(".opt").forEach(x=>x.setAttribute("aria-pressed",x===b));onPick&&onPick()});
  keyHandler=e=>{const k=e.key.toUpperCase();let i="ABCD".indexOf(k);if(i<0)i="1234".indexOf(e.key);const o=$$(".opt");if(i>=0&&i<o.length)o[i].click()};
}
function renderMcq(stage,sc){
  const it=sc.item,q=it.questions[sc.qi],key=it.id+"#"+sc.qi,chosen=SES.answers[key];
  const nav=it.questions.length>1&&sc.t==="mcq"?`<div class="qnav">${it.questions.map((x,i)=>`<button tabindex="-1" class="${i===sc.qi?"on":""} ${SES.answers[it.id+"#"+i]!=null?"done":""}" aria-label="Frage ${i+1}">${i+1}</button>`).join("")}</div>`:"";
  const qpanel=`<div class="panel"><div class="label" style="margin-bottom:10px">Question ${sc.qi+1} of ${it.questions.length}</div>${nav}<p class="qtext">${esc(q.q)}</p>${optsHtml(q,chosen)}</div>`;
  if(sc.t==="lq"){
    const replay=SES.kind==="practice"?`<button class="btn ghost small" id="replay">Nochmal anhören</button>`:"";
    stage.innerHTML=`<div class="task single"><div class="row muted small" style="margin-bottom:-12px"><span>${esc(TYPES[sc.type].name)}${it.title?" · "+esc(it.title):""}</span>${replay}</div>${qpanel}</div>`;
    const rp=$("#replay");if(rp)rp.onclick=()=>{rp.textContent="Spielt …";speak(audioParts(sc),accentOf(it),()=>{if(rp.isConnected)rp.textContent="Nochmal anhören"},it.id)};
  }else{
    const left=sc.type==="daily"
      ?`<div class="direction">${dailyDirection(it)}</div><div class="doc">${docHtml(it)}</div>`
      :`<div class="direction">${DIRECTIONS.academic}</div><div class="passage"><h3>${esc(it.title)}</h3>${String(it.text).split("\n").filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join("")}</div>`;
    stage.innerHTML=`<div class="task"><div class="panel">${left}</div>${qpanel}</div>`;
  }
  bindOpts(key,()=>{const d=$$(".qnav button")[sc.qi];if(d)d.classList.add("done")});
}

/* ---------- Bildschirm: Listening-Audio (Gespräch, Durchsage, Vortrag) ---------- */
function audioStage(label,sub){
  return `<div class="listen"><div class="wave" aria-hidden="true">${Array.from({length:24},(_,i)=>`<i style="animation-delay:${(i%8)*0.12}s"></i>`).join("")}</div>
    <div class="label">${esc(label)}</div><p class="muted small" id="astatus" style="margin:0">${esc(sub)}</p></div>`;
}
function renderLAudio(stage,sc){
  const it=sc.item,practice=SES.kind==="practice";
  const done=SES.answers["_heard_"+it.id];
  stage.innerHTML=`<div class="task single"><div class="panel stack">
    <div class="direction">${DIRECTIONS[sc.type]}</div>
    ${it.title?`<h2>${esc(it.title)}</h2>`:""}
    ${audioStage(TYPES[sc.type].name,done&&!practice?"You have already heard this recording. Select Next.":tx("The recording will begin automatically. You will hear it only once.","Das Audio startet automatisch. Im Test wird es nur einmal abgespielt."))}
    <div class="btns">${practice?`<button class="btn" id="play">Nochmal abspielen</button><button class="btn ghost small" id="show">Text anzeigen</button>`:""}</div>
    <div id="tx" class="improved" hidden></div></div></div>`;
  const st=$("#astatus"),wave=$(".wave");
  const play=()=>{wave.classList.add("on");st.textContent=tx("Now playing …","Audio läuft …");lockNext(!practice);
    speak(audioParts(sc),accentOf(it),ok=>{wave.classList.remove("on");SES.answers["_heard_"+it.id]=1;lockNext(false);
      st.textContent=ok?tx("Select Next to see the questions.","Audio beendet. Weiter mit Next."):tx("No audio available. The transcript is shown instead.","Kein Audio verfügbar – Text anzeigen.");if(!ok){if($("#show"))$("#show").click();else{const t=$("#tx");t.hidden=false;t.textContent=transcriptOf(sc)}}},it.id)};
  if(practice){$("#play").onclick=play;$("#show").onclick=()=>{const t=$("#tx");t.hidden=!t.hidden;t.textContent=transcriptOf(sc)}}
  if(!done||practice)play();
}

/* ---------- Bildschirm: Listen and Choose a Response ---------- */
function renderChoose(stage,sc){
  const it=sc.item,key=it.id,practice=SES.kind==="practice";
  const heard=SES.answers["_heard_"+it.id];
  stage.innerHTML=`<div class="task single"><div class="panel stack">
    <div class="direction">${DIRECTIONS.choose}</div>
    ${audioStage("Listen and Choose a Response",heard&&!practice?"":tx("Listen carefully. The sentence is not shown.","Hör genau zu: Der Satz wird nicht angezeigt."))}
    <div id="opts" ${heard?"":"hidden"}>${optsHtml({options:it.options},SES.answers[key])}</div>
    ${practice?`<div class="btns"><button class="btn ghost small" id="play">Nochmal anhören</button></div>`:""}</div></div>`;
  bindOpts(key);
  const wave=$(".wave"),st=$("#astatus");
  const play=()=>{wave.classList.add("on");if(st)st.textContent=tx("Now playing …","Audio läuft …");lockNext(!practice);
    speak(audioParts(sc),accentOf(it),ok=>{wave.classList.remove("on");SES.answers["_heard_"+it.id]=1;lockNext(false);$("#opts").hidden=false;if(st)st.textContent=ok?tx("Choose the best response.","Wähle die beste Antwort."):tx("No audio available. The sentence is: ","Kein Audio – der Satz lautet: ")+it.prompt},it.id)};
  const pb=$("#play");if(pb)pb.onclick=play;
  if(!heard||practice)play();
}

/* ---------- Bildschirm: Build a Sentence ---------- */
function renderBas(stage,sc){
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
        <div class="slots" aria-label="Your answer">${it.chunks.map((c,i)=>a[i]!=null?`<button class="chip" data-slot="${i}">${esc(cap(it.chunks[a[i]],i))}</button>`:`<span class="slot"></span>`).join("")}<span class="punct">${end}</span></div>
        <div class="bank">${order.map(ci=>`<button class="chip ${a.includes(ci)?"used":""}" data-chunk="${ci}">${esc(it.chunks[ci])}</button>`).join("")}</div>
        <div class="btns" style="margin-top:14px"><button class="btn ghost small" id="bas-reset">${tx("Reset","Zurücksetzen")}</button></div>
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
  const key=sc.item.id;
  stage.innerHTML=`<div class="task"><div class="panel">${promptHtml(sc)}</div>
    <div class="stack"><textarea class="write" id="w" spellcheck="false" autocorrect="off" autocapitalize="off" autocomplete="off" aria-label="Your response" placeholder="${inTest()?"":sc.t==="email"?"Dear …":"Your response …"}">${esc(SES.answers[key]||"")}</textarea>
    <div class="row"><span class="wc" id="wc"></span><span class="muted small">${tx("","Keine Rechtschreibprüfung, wie im Test.")}</span></div></div></div>`;
  const w=$("#w"),wc=$("#wc");const upd=()=>{SES.answers[key]=w.value;const n=countWords(w.value);wc.textContent="Word count: "+n+(!inTest()&&sc.t==="discussion"&&n<100?" · Ziel: 100+":"")};
  w.oninput=upd;upd();if(matchMedia("(pointer:fine)").matches)w.focus();
}

/* ---------- Speaking: gemeinsame Antwort-Eingabe ---------- */
function beep(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=beep.c||(beep.c=new C());const o=c.createOscillator(),g=c.createGain();o.frequency.value=880;g.gain.value=.07;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.18)}catch(e){}}
function answerBox(key,seconds,label,onDone){
  const box=$("#resp");
  box.innerHTML=`<div class="row"><div class="label">${esc(label)}</div><span class="timer" id="rt">${fmt(seconds)}</span></div>
    <textarea class="write" id="say" style="min-height:120px" spellcheck="false" autocorrect="off" autocapitalize="off" placeholder="${canRecognize?tx("Speak now.","Sprich jetzt – dein Text erscheint hier."):"Tippe auf das Mikrofon deiner Tastatur und sprich, oder tippe, was du gesagt hast."}">${esc(SES.answers[key]||"")}</textarea>
    <p class="muted small" style="margin:0">${canRecognize?tx("Recording …","Spracherkennung läuft."):"Diktierfunktion: auf dem Handy das Mikrofon-Symbol der Tastatur, am Mac zweimal die Fn-Taste, unter Windows Win + H."}</p>`;
  const ta=$("#say");ta.oninput=()=>{SES.answers[key]=ta.value};ta.focus();beep();
  const rec=startRecognition(txt=>{ta.value=txt;SES.answers[key]=txt});
  let left=seconds;const grace=rec?2:8;
  const t=setInterval(()=>{
    if(!document.body.contains(ta)){clearInterval(t);stopRecognition();return}
    left--;const rt=$("#rt");
    if(left>0){rt.textContent=fmt(left);rt.classList.toggle("low",left<=5)}
    else if(left>-grace){rt.textContent=tx("Saving …","Eingabe abschließen …");rt.classList.add("low");stopRecognition()}
    else{clearInterval(t);stopRecognition();ta.disabled=true;SES.answers[key]=ta.value;rt.textContent=tx("Time is up","Zeit vorbei");onDone&&onDone()}
  },1000/(window.__TT_SPEED||1));
}

/* ---------- Bildschirm: Listen and Repeat ---------- */
function renderRepeat(stage,sc){
  const it=sc.item,key=it.id+"#"+sc.si,sent=it.sentences[sc.si],practice=SES.kind==="practice";
  const secs=Math.min(12,8+Math.floor(countWords(sent)/4));
  const doneBefore=SES.answers["_done_"+key];
  stage.innerHTML=`<div class="task single"><div class="panel stack">
    <div class="direction">${sc.si===0?esc(it.intro):"Listen and repeat. Repeat only once."}</div>
    <div class="row"><span class="label">${esc(it.scenario)} · Sentence ${sc.si+1} of 7</span>${practice?`<button class="btn ghost small" id="play">Nochmal anhören</button>`:""}</div>
    ${audioStage("Listen",tx("Listen. Then repeat the sentence after the tone.","Hör zu. Danach hast du "+secs+" Sekunden zum Nachsprechen."))}
    <div id="resp" class="stack"></div><div id="fb"></div></div></div>`;
  const wave=$(".wave"),st=$("#astatus");
  const showFb=()=>{if(!practice)return;const sc5=repeatScore(sent,SES.answers[key]||"");$("#fb").innerHTML=`<div class="why"><b>${sc5}/5</b> · Original: ${esc(sent)}</div>`};
  const run=()=>{wave.classList.add("on");st.textContent=tx("Now playing …","Audio läuft …");lockNext(true);
    speak([{text:sent,g:it.voice||"W"}],accentOf(it),ok=>{wave.classList.remove("on");st.textContent=ok?tx("Repeat now.","Jetzt nachsprechen."):tx("No audio available. The sentence is: ","Kein Audio – der Satz lautet: ")+sent;lockNext(false);
      answerBox(key,secs,tx("Your response","Deine Wiederholung"),()=>{SES.answers["_done_"+key]=1;showFb();if(!practice)setTimeout(()=>{if(view.name==="runner"&&cur().sc===sc)next()},900)})},it.id+"-"+sc.si)};
  const pb=$("#play");if(pb)pb.onclick=run;
  if(!doneBefore)run();else{st.textContent=tx("Already answered.","Bereits beantwortet.");$("#resp").innerHTML=`<div class="improved">${esc(SES.answers[key]||"–")}</div>`;showFb()}
}

/* ---------- Bildschirm: Take an Interview ---------- */
function renderInterview(stage,sc){
  const it=sc.item,key=it.id+"#"+sc.qi,q=it.questions[sc.qi],practice=SES.kind==="practice";
  const doneBefore=SES.answers["_done_"+key];
  stage.innerHTML=`<div class="task single"><div class="panel stack">
    <div class="direction">${sc.qi===0?esc(it.intro):DIRECTIONS.interview}</div>
    ${practice?`<div class="speaker"><div class="avatar">R</div><div class="say" id="iq">${esc(q)}</div></div>`:`<div class="label">Question ${sc.qi+1} of 4</div>`}
    ${audioStage("Interviewer",tx("Listen to the question. You will have 45 seconds to answer after the tone.","Die Frage wird vorgelesen. Danach hast du 45 Sekunden. Es gibt keine Vorbereitungszeit."))}
    <div id="resp" class="stack"></div></div></div>`;
  const wave=$(".wave"),st=$("#astatus");
  const run=()=>{wave.classList.add("on");st.textContent=tx("Now playing …","Frage läuft …");lockNext(true);
    speak([{text:q,g:it.voice||"W"}],accentOf(it),()=>{wave.classList.remove("on");st.textContent=tx("Answer now.","Antworte jetzt.");lockNext(false);
      answerBox(key,45,tx("Your response","Deine Antwort"),()=>{SES.answers["_done_"+key]=1;if(!practice)setTimeout(()=>{if(view.name==="runner"&&cur().sc===sc)next()},900)})},it.id+"-"+sc.qi)};
  if(!doneBefore)run();else{st.textContent=tx("Already answered.","Bereits beantwortet.");$("#resp").innerHTML=`<div class="improved">${esc(SES.answers[key]||"–")}</div>`}
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
Merely restating the classmates' ideas without an own contribution cannot score above 3.`,
  interview:`Score 5 (fully successful): fully addresses the question, on topic and well elaborated with relevant details; good conversational pace with natural pauses; easily intelligible; grammar and vocabulary accurate and effective.
Score 4 (generally successful): addresses the question and is reasonably clear; may lack some connectors between ideas; minor pacing issues; grammar and vocabulary adequate most of the time.
Score 3 (partially successful): addresses the question with limited elaboration or clarity; frequent fillers or long pauses; limited range of grammar and vocabulary with noticeable errors.
Score 2 (mostly unsuccessful): minimally connected to the question; little relevant elaboration; very limited grammar and vocabulary.
Score 1 (unsuccessful): only vaguely connected; isolated words or phrases.
Score 0: no response, not in English, unconnected, or only phrases like "I don't know".`
};
function taskText(kind,it){
  if(kind==="email")return `SITUATION: ${it.situation}\nWrite an email to ${it.recipient}. In your email, do the following:\n${it.tasks.map(t=>"- "+t).join("\n")}\n(7 minutes)`;
  if(kind==="discussion")return `Your professor is teaching a class on ${it.course}. Write a post responding to the professor's question (at least 100 words, 10 minutes).\n${it.professor.name}: ${it.professor.text}\n${it.students.map(s=>s.name+": "+s.text).join("\n")}`;
  return `${it.intro}\nFour questions, 45 seconds per answer, no preparation time.`;
}
function evalPrompt(kind,it,text,human){
  const name={email:"Write an Email",discussion:"Write for an Academic Discussion",interview:"Take an Interview (Speaking)"}[kind];
  const isIv=kind==="interview";
  const resp=isIv?it.questions.map((q,i)=>`QUESTION ${i+1}: ${q}\nANSWER ${i+1} (speech transcript): """${(text[i]||"").trim()||"(no answer)"}"""`).join("\n\n"):`"""\n${text}\n"""`;
  const head=`You are an experienced, strict ETS-certified rater for the TOEFL iBT (format from January 2026). Score the test taker's response${isIv?"s":""} to the task "${name}" on the official 0–5 scale. Judge exactly like a real rater: do not reward length alone and do not be generous.${isIv?" The answers are speech transcripts (dictation), so ignore punctuation and capitalization and do not judge pronunciation; judge content, elaboration, coherence, grammar and vocabulary. Each answer had 45 seconds (a strong answer has roughly 80–120 words).":""}

OFFICIAL RUBRIC
${RUBRIC[kind]}

TASK
${taskText(kind,it)}

RESPONSE${isIv?"S":` (${countWords(text)} words)`}
${resp}
`;
  if(human)return head+`
Answer in German, structured like this:
1. Score (0–5)${isIv?" for each of the four answers":""} and a 2-sentence justification referring to the rubric.
2. Every language error: original → correction, plus the rule in one short line.
3. ${isIv?"For each answer, an improved version in English (about 90 words) that would score 5.":"An improved version in English that keeps my ideas and would score 5."}
4. At most 3 concrete tips for my next attempt.`;
  if(isIv)return head+`
Reply with ONLY a JSON object, no other text:
{"scores": [<integer 0-5 for answer 1>, <answer 2>, <answer 3>, <answer 4>],
 "verdict_de": "<2 sentences in German: overall judgment referring to the rubric>",
 "criteria_de": {"Inhalt": "<1 sentence>", "Ausarbeitung": "<1 sentence>", "Zusammenhang": "<1 sentence>", "Sprache": "<1 sentence>"},
 "errors": [{"original": "<exact words from the transcripts>", "correction": "<corrected words>", "cat": "<one of: ${LANG_CATS.join(", ")}>", "rule_de": "<rule, max 12 words, German>"}],
 "improved": "<for each question a model answer of about 90 words in English that keeps the speaker's ideas, labeled Q1–Q4>",
 "tips_de": ["<max 3 short concrete tips in German>"]}
List real grammar and word-choice errors only (not punctuation), at most 15.`;
  return head+`
Reply with ONLY a JSON object, no other text:
{"score": <integer 0-5>,
 "verdict_de": "<2 sentences in German: why this score, referring to the rubric>",
 "criteria_de": {"Aufgabe": "<1 sentence>", "Aufbau": "<1 sentence>", "Sprache": "<1 sentence>", "${kind==="email"?"Ton":"Eigener Beitrag"}": "<1 sentence>"},
 "errors": [{"original": "<exact words from the response>", "correction": "<corrected words>", "cat": "<one of: ${LANG_CATS.join(", ")}>", "rule_de": "<the grammar or usage rule, max 12 words, German>"}],
 "improved": "<improved English version keeping the writer's ideas, would score 5>",
 "tips_de": ["<max 3 short concrete tips in German>"]}
List every real error (grammar, word choice, spelling, punctuation that matters), at most 15.`;
}
const evalError=e=>({not_granted:"Du hast die Nutzung von Claude für diese Seite nicht erlaubt.",rate_limited:"Gerade zu viele Anfragen oder Nutzungslimit erreicht. Später nochmal versuchen.",cancelled:"Abgebrochen.",invalid_json:"Die Antwort war unvollständig. Bitte nochmal versuchen."}[e&&e.code]||"Das hat nicht geklappt. Bitte nochmal versuchen.");
const blankText=(kind,text)=>kind==="interview"?text.every(t=>!String(t||"").trim()):!String(text||"").trim();
/* Eine Bewertung holen. Leere Antworten bekommen ohne KI 0 Punkte (Rubric: blank = 0). */
async function evalCore(kind,it,text,signal){
  if(blankText(kind,text))return kind==="interview"?{scores:[0,0,0,0],score:0,verdict_de:"Keine Antwort abgegeben. Nach der Rubric sind das 0 Punkte.",errors:[]}:{score:0,verdict_de:"Keine Antwort abgegeben. Nach der Rubric sind das 0 Punkte.",errors:[]};
  const r=await SAMPLE.json(evalPrompt(kind,it,text,false),{signal,modelTier:"default"});
  if(!r||(kind==="interview"?!Array.isArray(r.scores):typeof r.score!=="number"))throw {code:"invalid_json"};
  if(kind==="interview"){r.scores=r.scores.slice(0,4).map(x=>Math.max(0,Math.min(5,Math.round(+x||0))));r.score=Math.round(r.scores.reduce((a,b)=>a+b,0)/r.scores.length*10)/10}
  else r.score=Math.max(0,Math.min(5,Math.round(r.score)));
  return r;
}
async function runEval(entry,kind,it,text,box){
  const ctl=new AbortController();
  box.innerHTML=`<p class="muted"><span class="spin"></span>Claude bewertet nach den ETS-Rubrics. Das dauert meist 20–60 Sekunden.</p><button class="btn ghost small" id="ev-stop-${kind}">Abbrechen</button>`;
  box.querySelector("button").onclick=()=>ctl.abort();
  try{entry.evals[kind]=await evalCore(kind,it,text,ctl.signal);updateBands(entry);save();render()}
  catch(e){box.innerHTML=`<p class="muted small">${esc(evalError(e))}</p>`;evalButtons(entry,kind,it,text,box)}
}
function evalButtons(entry,kind,it,text,box){
  const wrap=document.createElement("div");wrap.className="btns";
  if(SAMPLE){const b=document.createElement("button");b.className="btn primary";b.textContent="Mit Claude bewerten";b.onclick=()=>runEval(entry,kind,it,text,box);wrap.appendChild(b)}
  const c=document.createElement("button");c.className="btn";c.textContent="Bewertungs-Prompt kopieren";
  c.onclick=()=>{const p=evalPrompt(kind,it,text,true);try{navigator.clipboard.writeText(p).then(()=>{c.textContent="Kopiert – in Claude einfügen"},()=>fallbackCopy(p,box))}catch(e){fallbackCopy(p,box)}};
  wrap.appendChild(c);box.appendChild(wrap);
  if(!SAMPLE){const m=document.createElement("div");m.className="row";
    m.innerHTML=`<span class="muted small">${kind==="interview"?"Durchschnitt der vier Punktzahlen":"Punktzahl"} aus Claude eintragen:</span><span class="btns">${[0,1,2,3,4,5].map(n=>`<button class="btn small" data-ms="${n}">${n}</button>`).join("")}</span>`;
    m.querySelectorAll("[data-ms]").forEach(b=>b.onclick=()=>{const n=+b.dataset.ms;
      entry.evals[kind]=Object.assign({score:n,manual:true,verdict_de:"Von Hand eingetragen. Die ausführliche Bewertung steht in deinem Claude-Chat.",errors:[]},kind==="interview"?{scores:[n,n,n,n]}:{});updateBands(entry);save();render()});
    box.appendChild(m)}
}
function fallbackCopy(p,box){const t=document.createElement("textarea");t.className="code";t.rows=6;t.value=p;box.appendChild(t);t.select()}
function evalHtml(r){
  const crit=r.criteria_de?Object.entries(r.criteria_de).map(([k,v])=>`<div class="err"><b>${esc(k)}:</b> ${esc(v)}</div>`).join(""):"";
  const sc=Array.isArray(r.scores)?`<div class="score5"><span class="big">${r.scores.map(esc).join(" · ")}</span><span class="muted">/ 5 je Frage</span></div>`:`<div class="score5"><span class="big">${esc(r.score)}</span><span class="muted">/ 5</span></div>`;
  if(r.manual)return `<div class="score5"><span class="big">${esc(r.score)}</span><span class="muted">/ 5</span></div><p class="muted small" style="margin:0">${esc(r.verdict_de||"")}</p>`;
  return `${sc}
    <p style="margin:0">${esc(r.verdict_de||"")}</p>
    ${crit?`<div><div class="label">Kriterien</div><div class="errs">${crit}</div></div>`:""}
    ${Array.isArray(r.errors)&&r.errors.length?`<div><div class="label">Fehler (${r.errors.length})</div><div class="errs">${r.errors.map(x=>`<div class="err"><s>${esc(x.original)}</s> → <span class="fix">${esc(x.correction)}</span><div class="r">${x.cat?`<b>${esc(x.cat)}</b> · `:""}${esc(x.rule_de||"")}</div></div>`).join("")}</div></div>`:`<p class="muted small">Keine Sprachfehler gefunden.</p>`}
    ${r.improved?`<div><div class="label">Fassung für 5/5</div><div class="improved">${esc(r.improved)}</div></div>`:""}
    ${Array.isArray(r.tips_de)&&r.tips_de.length?`<div><div class="label">Nächstes Mal</div><ul style="margin:6px 0 0;padding-left:18px">${r.tips_de.map(t=>`<li>${esc(t)}</li>`).join("")}</ul></div>`:""}`;
}

/* ---------- Ergebnis ---------- */
function reviewRow(sc,ans){
  if(sc.t==="mcq"||sc.t==="lq"){const q=sc.item.questions[sc.qi];const a=ans[sc.item.id+"#"+sc.qi];const ok=a===q.answer;
    return `<div class="ritem"><span class="m ${ok?"ok":"no"}">${ok?"✓":"✗"}</span><div><div class="q">${esc(q.q)}</div>
    <div class="a">${a!=null?"Deine Antwort: "+LETTERS[a]+") "+esc(q.options[a])+" · ":"Keine Antwort · "}Richtig: ${LETTERS[q.answer]}) ${esc(q.options[q.answer])}</div>${q.why?`<div class="why">${esc(q.why)}</div>`:""}</div></div>`}
  if(sc.t==="choose"){const it=sc.item,a=ans[it.id],ok=a===it.answer;
    return `<div class="ritem"><span class="m ${ok?"ok":"no"}">${ok?"✓":"✗"}</span><div><div class="q">„${esc(it.prompt)}“</div>
    <div class="a">${a!=null?"Deine Antwort: "+esc(it.options[a])+" · ":"Keine Antwort · "}Richtig: ${esc(it.options[it.answer])}</div>${it.why?`<div class="why">${esc(it.why)}</div>`:""}</div></div>`}
  if(sc.t==="laudio")return `<details class="ritem" style="display:block"><summary class="muted small" style="cursor:pointer">Transkript: ${esc(TYPES[sc.type].name)}${sc.item.title?" – "+esc(sc.item.title):""}</summary><div class="improved" style="margin-top:8px">${esc(transcriptOf(sc))}</div></details>`;
  if(sc.t==="ctw"){const x=scoreScreen(sc,ans);const gaps=ctwGaps(sc.item.text);const a=ans[sc.item.id]||[];
    return `<div class="ritem"><span class="m ${x.right===x.total?"ok":"no"}">${x.right}/${x.total}</span><div><div class="q">Complete the Words</div><div class="a">${gaps.map((g,i)=>x.detail[i]?`<span style="color:var(--good)">${esc(g.shown+g.missing)}</span>`:`<span style="color:var(--bad)">${esc(g.shown)}<s>${esc(a[i]||"___")}</s></span> → ${esc(g.shown+g.missing)}`).join(" · ")}</div></div></div>`}
  if(sc.t==="bas"){const x=scoreScreen(sc,ans);const a=(ans[sc.item.id]||[]).filter(i=>i!=null).map(i=>sc.item.chunks[i]).join(" ");
    return `<div class="ritem"><span class="m ${x.right?"ok":"no"}">${x.right?"✓":"✗"}</span><div><div class="q">${esc(sc.item.prompt)}</div><div class="a">${x.right?"":"Deine Antwort: "+esc(a||"–")+"<br>"}Richtig: ${esc(sc.item.answer)}</div>${sc.item.why&&!x.right?`<div class="why">${esc(sc.item.why)}</div>`:""}</div></div>`}
  if(sc.t==="repeat"){const s=sc.item.sentences[sc.si],said=ans[sc.item.id+"#"+sc.si]||"",v=repeatScore(s,said);
    return `<div class="ritem"><span class="m ${v>=4?"ok":"no"}">${v}</span><div><div class="q">${esc(s)}</div><div class="a">Deine Wiederholung: ${esc(said||"–")}</div></div></div>`}
  return "";
}
function renderResult(){
  const e=S.history.find(h=>h.id===view.id);if(!e){go("home");return}
  if(!e.sections){e.sections={};}if(!e.evals)e.evals={};
  const scs=e.screens.map(x=>Object.assign({},x,{item:byId(x.id)})).filter(x=>x.item);
  const secsIn=SEC_ORDER.filter(k=>scs.some(x=>x.sec===k));
  const byType={};scs.forEach(sc=>{const t=typeOf(sc);const x=scoreScreen(sc,e.answers);if(!x.total)return;(byType[t]=byType[t]||{r:0,t:0});byType[t].r+=x.right;byType[t].t+=x.total});
  const practice=e.kind==="practice";
  const A=analyze(e,scs);
  const writes=scs.filter(sc=>sc.t==="email"||sc.t==="discussion");
  const ivItem=scs.find(sc=>sc.t==="interview");
  const ivTexts=ivItem?ivItem.item.questions.map((q,i)=>e.answers[ivItem.item.id+"#"+i]||""):null;
  const pending=[...writes.map(sc=>sc.t),...(ivItem?["interview"]:[])].filter(k=>!e.evals[k]);
  const hasAuto=Object.keys(A.skills).length>0;
  let head="";
  if(!practice){
    const cells=secsIn.map(k=>{const s=e.sections[k]||{};return `<div><div class="label">${SECTIONS[k].name}</div><div class="big">${fmtBand(s.band)}</div><div class="muted small">${s.band!=null?cefr(s.band)+" · ":""}${s.raw!=null?s.raw+" / "+s.max:k==="writing"?"BaS "+s.bas+"/10":k==="speaking"?"Repeat "+s.repeat+"/35":""}${s.route?"<br>Modul 2 "+(s.route==="hard"?"schwer":"leicht"):""}</div></div>`}).join("");
    head=`<div class="bandrow ${e.kind==="full"?"full":""}">${e.kind==="full"?`<div><div class="label">Gesamt</div><div class="big">${fmtBand(e.band)}</div><div class="muted small">${e.band!=null?cefr(e.band)+" · ":""}Band 1–6</div></div>`:""}${cells}</div>
    ${pending.length?`<p class="notice">Writing und Speaking bekommen ihr Band, sobald Email, Discussion und Interview bewertet sind.</p>`:""}`;
  }
  const typeRows=Object.keys(byType).map(t=>`<tr><td>${TYPES[t].name}</td><td class="n">${byType[t].r} / ${byType[t].t}</td><td class="n">${Math.round(100*byType[t].r/byType[t].t)} %</td></tr>`).join("");
  const sectionsHtml=secsIn.map(k=>{
    const rows=scs.filter(sc=>sc.sec===k).map(sc=>reviewRow(sc,e.answers)).filter(Boolean).join("");
    return rows?`<details class="group"><summary class="label" style="cursor:pointer">Alle Aufgaben ${SECTIONS[k].name} mit Lösungen</summary><div class="review">${rows}</div></details>`:""}).join("");
  const deepWanted=hasAuto&&(A.wrong.length>0||A.ctw.wrong>0||A.rep.n>0);
  app().innerHTML=`<div class="wrap">
    <header><div class="label">${esc(e.date)}${practice?"":" · Score Report"}</div><h1>${esc(e.title)}</h1></header>
    ${head}
    ${SAMPLE&&(pending.length||deepWanted&&!e.deep)&&!practice?`<div class="panel stack" id="allbox"><div class="row"><div><b>Alles von Claude auswerten lassen</b><div class="muted small">${[pending.length?pending.length+" offene Bewertung"+(pending.length>1?"en":""):"",deepWanted&&!e.deep?"Fehleranalyse":""].filter(Boolean).join(" und ")} in einem Durchgang</div></div><button class="btn primary" id="runall">Auswerten</button></div><p class="muted small" id="allmsg" style="margin:0" hidden></p></div>`:""}
    ${analysisHtml(e,scs,A)}
    ${deepWanted||e.deep?`<section class="group"><div class="label">Fehleranalyse von Claude</div><div class="panel stack" id="deepbox">${e.deep?deepHtml(e.deep):`<p class="muted small" style="margin:0">Claude liest alle falschen Antworten mit Text und gewählter Option und benennt die Muster dahinter: Ursache, Regel, Übung.</p>`}</div></section>`:""}
    ${writes.map(sc=>`<section class="group panel"><div class="label">${sc.t==="email"?"Write an Email":"Academic Discussion"}</div>
      <details><summary class="muted small" style="cursor:pointer">Aufgabe und deine Antwort (${countWords(e.answers[sc.item.id]||"")} Wörter)</summary><div class="stack" style="margin-top:12px">${promptHtml(sc)}<div class="improved" style="background:var(--bg)">${esc(e.answers[sc.item.id]||"(leer)")}</div></div></details>
      <div class="evalbox" id="ev-${sc.t}">${e.evals[sc.t]?evalHtml(e.evals[sc.t]):""}</div></section>`).join("")}
    ${ivItem?`<section class="group panel"><div class="label">Take an Interview</div>
      <details><summary class="muted small" style="cursor:pointer">Fragen und deine Antworten</summary><div class="stack" style="margin-top:12px">${ivItem.item.questions.map((q,i)=>`<div><b>${esc(q)}</b><div class="improved" style="background:var(--bg);margin-top:6px">${esc(ivTexts[i]||"(keine Antwort)")}</div></div>`).join("")}</div></details>
      <p class="muted small" style="margin:0">Bewertet werden Inhalt, Ausarbeitung und Sprache des Transkripts. Aussprache und Sprechtempo kann die Bewertung nicht beurteilen.</p>
      <div class="evalbox" id="ev-interview">${e.evals.interview?evalHtml(e.evals.interview):""}</div></section>`:""}
    ${typeRows?`<section class="group"><div class="label">Nach Aufgabentyp</div><div class="tw"><table class="hist"><tbody>${typeRows}</tbody></table></div></section>`:""}
    ${sectionsHtml}
    <div class="btns">${A.wrong.length?`<button class="btn primary grow" id="redo-now">Diese ${A.wrong.length} Fehler wiederholen</button>`:""}${practice&&e.type?`<button class="btn ${A.wrong.length?"":"primary"} grow" id="again">Nächste Aufgabe</button>`:""}${practice&&e.skill?`<button class="btn grow" id="again-skill">Weiter trainieren</button>`:""}<button class="btn grow" id="home">Zur Übersicht</button></div>
  </div>`;
  const attach=(kind,it,text)=>{const box=$("#ev-"+kind);if(!box)return;if(!e.evals[kind])evalButtons(e,kind,it,text,box);
    else{const b=document.createElement("button");b.className="btn ghost small";b.textContent="Neu bewerten";b.onclick=()=>{delete e.evals[kind];updateBands(e);save();render()};box.appendChild(b)}};
  writes.forEach(sc=>attach(sc.t,sc.item,e.answers[sc.item.id]||""));
  if(ivItem)attach("interview",ivItem.item,ivTexts);
  const db=$("#deepbox");
  if(db){if(!e.deep)deepButtons(e,scs,A,db);else{const b=document.createElement("button");b.className="btn ghost small";b.textContent="Neu analysieren";b.onclick=()=>{delete e.deep;save();render()};db.appendChild(b)}}
  const ra=$("#runall");
  if(ra)ra.onclick=async()=>{
    const msg=$("#allmsg");msg.hidden=false;ra.disabled=true;const ctl=new AbortController();
    const jobs=[...writes.filter(sc=>!e.evals[sc.t]).map(sc=>({kind:sc.t,it:sc.item,text:e.answers[sc.item.id]||"",label:sc.t==="email"?"Email":"Discussion"})),...(ivItem&&!e.evals.interview?[{kind:"interview",it:ivItem.item,text:ivTexts,label:"Interview"}]:[])];
    const total=jobs.length+(deepWanted&&!e.deep?1:0);let n=0;
    try{
      for(const j of jobs){n++;msg.innerHTML=`<span class="spin"></span>${n} von ${total}: ${j.label} wird bewertet …`;e.evals[j.kind]=await evalCore(j.kind,j.it,j.text,ctl.signal);updateBands(e);save()}
      if(deepWanted&&!e.deep){n++;msg.innerHTML=`<span class="spin"></span>${n} von ${total}: Fehlermuster werden gesucht …`;const A2=analyze(e,scs);const r=await SAMPLE.json(analysisPrompt(e,scs,A2,false),{signal:ctl.signal,modelTier:"default"});if(r&&Array.isArray(r.insights_de)){e.deep=r;save()}}
      if(view.name==="result"&&view.id===e.id)render();
    }catch(err){save();if(view.name==="result"&&view.id===e.id){render();const m=$("#allmsg");if(m){m.hidden=false;m.textContent=evalError(err)+" Fertige Teile sind gespeichert."}}}
  };
  $$("[data-train]").forEach(b=>b.onclick=()=>startSkillPractice(b.dataset.train));
  const rn=$("#redo-now");if(rn)rn.onclick=()=>startRedo(A.wrong.map(scKey));
  $("#home").onclick=()=>go("home");
  const ag=$("#again");if(ag)ag.onclick=()=>startPractice(e.type);
  const as=$("#again-skill");if(as)as.onclick=()=>startSkillPractice(e.skill);
}

/* ---------- Verlauf ---------- */
function renderHistory(){
  const rows=S.history.slice().reverse().map(h=>`<tr data-h="${h.id}" style="cursor:pointer"><td>${esc(h.date)}</td><td>${esc(h.title)}</td><td class="n">${fmtBand(h.band)}</td></tr>`).join("");
  app().innerHTML=`<div class="wrap"><header><h1>Verlauf</h1></header>
    <div class="tw"><table class="hist"><thead><tr><th>Datum</th><th>Durchgang</th><th class="n">Band</th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="btns"><button class="btn" id="home">Zur Übersicht</button></div></div>`;
  $$("[data-h]").forEach(r=>r.onclick=()=>go("result",{id:r.dataset.h}));
  $("#home").onclick=()=>go("home");
}

/*INCLUDE analysis.js*/

document.addEventListener("keydown",e=>{if(view.name!=="runner"||!keyHandler)return;if(["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName))return;
  if(e.key==="Enter"&&e.target.tagName!=="BUTTON"){e.preventDefault();if(!NEXT_LOCK)next();return}keyHandler(e)});
/* Alte Verlaufseinträge (Version 1) ergänzen */
S.history.forEach(h=>{if(!h.sections){h.sections={};if(h.kind==="test"&&h.section&&h.section!=="full")h.sections[h.section]={band:h.band??null,raw:h.raw??null,max:h.max??null,route:h.route||null,bas:0,repeat:0};(h.screens||[]).forEach(x=>{if(!x.sec&&x.id){const t=typeFromId(x.id);if(t)x.sec=TYPES[t].sec}})}});
render();
