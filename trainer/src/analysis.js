/* =====================================================================
   Fehleranalyse: Fragetypen (skills), Fehlermuster, Erkenntnisse, Zeit.
   Wird von build.py in app.js eingesetzt (Platzhalter INCLUDE analysis.js).
   ===================================================================== */

/* Wissensbasis je Fragetyp: n = Name, how = Erkennen, trap = typische Falle, fix = Vorgehen */
const KB={
  "r.detail":{n:"Detailfragen (Reading)",how:"Fragt nach einer Information, die im Text steht: According to …, What / When / Why …",trap:"Option benutzt Wörter aus dem Text, aber mit falscher Zahl, Person oder aus einem anderen Absatz.",fix:"Schlüsselwort der Frage im Text suchen, den Satz davor und danach lesen. Richtig ist die Option, die denselben Inhalt mit anderen Worten sagt."},
  "r.vocab":{n:"Wortbedeutung im Kontext",how:"The word X is closest in meaning to … / What does X mean?",trap:"Die häufigste Bedeutung des Worts passt in diesem Satz nicht, oder eine Option klingt nur ähnlich.",fix:"Jede Option in den Satz einsetzen. Nur die richtige erhält den Sinn. Unbekanntes Wort aus Gegensatz oder Beispiel im Satz erschließen."},
  "r.infer":{n:"Schlussfolgerungen (Reading)",how:"infer, imply, suggest, most likely: Die Antwort steht nicht wörtlich im Text.",trap:"Zu weit gehen: Die Option klingt logisch, ist aber durch keinen Satz gedeckt. Oder: etwas wörtlich Abgeschriebenes wählen.",fix:"Die richtige Option folgt zwingend aus einem bestimmten Satz. Probe: Kann ich auf den Satz zeigen, der sie belegt? Bei Regeln und Bedingungen den Fall durchrechnen. Extreme Wörter (always, never, all) sind meist falsch."},
  "r.purpose":{n:"Funktion einer Textstelle",how:"Why does the author mention …?",trap:"Die Option beschreibt, was dort steht, statt wozu es dient.",fix:"Den Satz davor lesen. Die Stelle ist fast immer Beispiel, Beleg, Gegensatz oder Erklärung für die Aussage direkt davor."},
  "r.main":{n:"Hauptaussage und Zweck des Textes",how:"mainly about, main purpose, What is the purpose of the email / notice?",trap:"Option nennt nur ein Detail aus einem Absatz oder ist zu allgemein.",fix:"Betreff, Überschrift und ersten Satz lesen. Die richtige Option deckt den ganzen Text ab."},
  "r.neg":{n:"NOT- und EXCEPT-Fragen",how:"NOT oder EXCEPT in Großbuchstaben.",trap:"Die erste Option ankreuzen, die im Text vorkommt.",fix:"Drei Optionen stehen im Text: abhaken. Die übrige ist die Antwort. Bei Bedingungen (Alter, Zeit, Preis) jede Option gegen die Regel prüfen."},
  "r.attitude":{n:"Haltung und Meinung (Reading)",how:"opinion, attitude, view, How does X react?",trap:"Zu extreme Option: völlig begeistert oder völlig ablehnend.",fix:"Auf wertende Wörter achten (however, unfortunately, has a point). Gemischte Urteile sind häufig: gut, aber …"},
  "r.next":{n:"Nächster Schritt (Reading)",how:"What will X probably do next?",trap:"Ein früher genannter, aber verworfener Plan.",fix:"Die letzte Nachricht oder der letzte Satz entscheidet."},
  "l.detail":{n:"Detailfragen (Listening)",how:"Fragt nach einer genannten Information: Grund, Ort, Zeit, Bedingung.",trap:"Option enthält gehörte Wörter in falscher Kombination. Zahl oder Ort verwechselt. Eine erste Angabe wurde im Audio korrigiert.",fix:"Auf Änderungen achten: instead, but, actually, moved to, only. Zahlen und Namen im Kopf wiederholen. Die richtige Option ist fast immer umformuliert."},
  "l.main":{n:"Thema und Hauptzweck (Listening)",how:"mainly about, main purpose, mainly discussing.",trap:"Ein Beispiel aus dem Vortrag wird für das Thema gehalten.",fix:"Die ersten zwei Sätze nennen das Thema, der Schluss wiederholt es. Beispiele dazwischen sind nie das Thema."},
  "l.infer":{n:"Schlussfolgerungen (Listening)",how:"imply, infer, probably, What does X mean when …",trap:"Wörtlich Gehörtes wählen oder mehr hineinlesen als gesagt wurde.",fix:"Fragen: Was meint die Person damit? Der Nachsatz zählt: I'd rather not · More often than you'd think · Let's say …"},
  "l.purpose":{n:"Funktion einer Aussage (Listening)",how:"Why does the speaker mention …?",trap:"Den Inhalt des Beispiels wählen statt seiner Aufgabe.",fix:"Welche Aussage direkt davor wird mit dem Beispiel belegt? Signalwörter: for example, take …, a classic example is …"},
  "l.attitude":{n:"Haltung des Sprechers",how:"attitude, view, opinion of the speaker.",trap:"Extreme Option, obwohl der Sprecher abwägt.",fix:"Abschwächungen hören: isn't ideal, but … · largely · I'm not saying … Die richtige Option ist meist ausgewogen formuliert."},
  "l.next":{n:"Nächster Schritt (Listening)",how:"What will the man / woman probably do next?",trap:"Ein Vorschlag, der im Gespräch abgelehnt wurde.",fix:"Der letzte Sprecherbeitrag entscheidet: Then I'd better … · I'll …"},
  "l.vocab":{n:"Redewendungen im Gespräch",how:"What does X mean when he says …?",trap:"Die wörtliche Bedeutung der einzelnen Wörter.",fix:"Bedeutung aus der Reaktion des Gesprächspartners ableiten. Redewendungen als Ganzes lernen."},
  "c.wh":{n:"W-Fragen (Choose a Response)",how:"When, Where, Who, Whose, Which, How long / far, How come.",trap:"Antwort passt zum Thema, aber nicht zum Fragewort: Ort statt Zeit, Preis statt Linie.",fix:"Nur das Fragewort merken: When → Zeit, How far → Entfernung, How come → Grund. W-Fragen nie mit Yes / No beantworten."},
  "c.yn":{n:"Ja/Nein-, Entweder-oder- und verneinte Fragen",how:"Is …? Did …? … or …? Didn't you …? …, have you?",trap:"Yes / No mit unpassendem Zusatz. Bei or-Fragen mit Yes antworten.",fix:"Die richtige Antwort lässt Yes / No oft weg und gibt direkt die Auskunft. Verneinte Fragen (Shouldn't we …?) sind Rückfragen oder Vorschläge. Do you know whether …? fragt nach der Auskunft, nicht nach deinem Wissen."},
  "c.request":{n:"Bitten, Angebote, Vorschläge, Ratschläge",how:"Could you … · Would you mind … · Why don't we … · How about … · Let's … · It wouldn't hurt to …",trap:"Why don't you …? als Frage nach dem Grund verstehen (Because …). Would you mind …? mit Yes beantworten heißt ablehnen.",fix:"Erst die Funktion erkennen, dann annehmen oder ablehnen: Sure · I'd love to · Not at all · I wish I could, but …"},
  "c.statement":{n:"Aussagen und die passende Reaktion",how:"Kein Fragesatz: Problem, Neuigkeit, Meinung, Entschuldigung, Dank.",trap:"Option wiederholt ein Wort aus dem Satz, das gleich klingt, aber etwas anderes bedeutet.",fix:"Fragen: Was würde ein Freund jetzt sagen? Problem → Hilfe oder Rat. Neuigkeit → Reaktion (Really? That's a relief). Dank → No problem."},
  "c.idiom":{n:"Redewendungen (Choose a Response)",how:"Tell me about it · I take it … · be up for · so much for … · give me a hand.",trap:"Die wörtliche Bedeutung der Einzelwörter.",fix:"Redewendungen als Ganzes lernen (Karteikarten). Im Test: Optionen, die ein Wort aus dem Satz wörtlich wiederholen, sind fast immer falsch."},
  "b.passive":{n:"Passiv (Build a Sentence)",how:"Blöcke wie be, been, being + Partizip.",trap:"be / been / being an der falschen Stelle.",fix:"Reihenfolge: (Modal) + be / been / being + Partizip: has to be submitted · was being used · had been moved."},
  "b.relative":{n:"Relativsätze (Build a Sentence)",how:"Blöcke mit who, which, that, where.",trap:"Relativsatz zu weit weg vom Nomen.",fix:"Der Relativsatz steht direkt hinter dem Nomen, auf das er sich bezieht: the student who sat by the window."},
  "b.indirect":{n:"Indirekte Fragen und indirekte Rede",how:"Fragewort oder whether mitten im Satz; said, asked, told.",trap:"Inversion wie in einer echten Frage: where is the office.",fix:"Nach Fragewort / whether normale Wortstellung Subjekt + Verb: where the office is · whether I had thought. In der indirekten Rede will → would."},
  "b.compare":{n:"Vergleiche und Grad",how:"than, as … as, so … that, too, enough.",trap:"enough vor das Adjektiv setzen; than und as verwechseln.",fix:"Feste Muster: much quieter than · as effective as · so much that · too unusual to · quiet enough to."},
  "b.cond":{n:"Bedingungen (Build a Sentence)",how:"if, unless, as long as, only if, would.",trap:"will im if-Satz; would have an falscher Stelle.",fix:"if / unless / as long as + Present für Zukunft. Unreal: would + Grundform, if + Past. would have + Partizip = hätte."},
  "b.verb":{n:"Verbmuster",how:"Modalverb, to + Grundform, -ing, Zeitformen.",trap:"to nach Modalverb; falsche Reihenfolge bei have been + -ing.",fix:"Modal + Grundform · have to + Grundform · tell sb to + Grundform · have been + -ing · going to + Grundform."},
  "b.order":{n:"Wortstellung, Orts- und Zeitangaben",how:"Adverbien (usually, already), Präpositionen (at, on, in).",trap:"Adverb am Satzanfang oder hinter dem Verb; Zeit vor Ort.",fix:"Häufigkeitsadverb vor dem Vollverb (I usually ride). Am Satzende Ort vor Zeit. at + Uhrzeit, on + Tag, in + Monat."},
  "w.func":{n:"Complete the Words: Funktionswörter",how:"Kurze Lücken: Artikel, Präpositionen, Pronomen, Hilfsverben, Konjunktionen.",trap:"Kleine Wörter werden überlesen: of, than, they, which, about.",fix:"Buchstaben zählen, dann grammatisch prüfen: Was verlangt das Wort davor oder danach? less than · a quarter of · tend to."},
  "w.content":{n:"Complete the Words: Inhaltswörter",how:"Längere Lücken: Nomen, Verben, Adjektive.",trap:"Wort erkannt, aber falsch geschrieben oder mit falscher Endung (-ed, -ing, -s).",fix:"Erst den ganzen Satz lesen. Wortart bestimmen, dann die Endung passend zu Zeit und Zahl wählen. Akademische Wörter mit Schreibweise als Karteikarten üben."},
  "s.short":{n:"Listen and Repeat: kurze Sätze",how:"Sätze bis etwa neun Wörter.",trap:"Kleine Wörter (the, to, a) und Endungen (-s, -ed) gehen verloren.",fix:"Beim Hören still mitsprechen. Jeden Artikel und jede Endung bewusst mitnehmen: 4 statt 5 Punkte entstehen fast immer hier."},
  "s.long":{n:"Listen and Repeat: lange Sätze",how:"Sätze ab etwa zehn Wörtern.",trap:"Der zweite Satzteil fehlt oder wird umgestellt.",fix:"In Sinneinheiten merken: wer · tut was · wo / wann / warum. Lieber den ganzen Sinn mit kleinen Abweichungen als einen perfekten halben Satz."}
};
/* Sprachfehler-Kategorien der KI-Bewertung (Writing, Interview) */
const LANG_CATS=["Artikel","Präposition","Zeitform","Kongruenz","Wortwahl","Wortform","Satzbau","Rechtschreibung","Zeichensetzung","Register"];
const LANG_KB={
  "Artikel":"Zählbares Nomen im Singular braucht a / an / the. Allgemeine Aussagen im Plural stehen ohne Artikel.",
  "Präposition":"Feste Verbindungen lernen: interested in · depend on · on Monday · by Friday (bis spätestens).",
  "Zeitform":"Abgeschlossen mit Zeitangabe → Simple Past. Bezug zur Gegenwart ohne Zeitangabe → Present Perfect. Nach if / when für Zukunft → Present.",
  "Kongruenz":"he / she / it + -s. everyone, each, the number of → Singular.",
  "Wortwahl":"Kollokationen statt Wort für Wort übersetzen: make a decision · do research · take a course.",
  "Wortform":"Nomen, Verb, Adjektiv, Adverb unterscheiden: economy · economic · economically.",
  "Satzbau":"Subjekt · Verb · Objekt · Ort · Zeit. Zwei Hauptsätze nicht nur mit Komma verbinden.",
  "Rechtschreibung":"Fehlerwörter als Karteikarte üben: recommend · necessary · definitely · receive.",
  "Zeichensetzung":"Komma nach einleitendem Nebensatz und nach However, / In addition,",
  "Register":"Email an Dozenten oder Firma: keine Umgangssprache, höfliche Bitten mit could / would."
};
const FUNC=new Set("a an the of to in on at for from by with about as into than then that this these those which who whom whose what when where while if or and but so nor yet because although though unless until since after before over under between among through during without within is are was were be been being am do does did have has had will would can could may might must shall should not no it its they them their he him his she her we us our you your i me my there here also very more most much many some any each every all both such only just even still too".split(" "));

/* Schlüssel je Bildschirm (für Zeiten, Änderungen, Fehlerheft) */
const scKey=sc=>sc.t==="mcq"||sc.t==="lq"||sc.t==="interview"?sc.item.id+"#"+sc.qi:sc.t==="repeat"?sc.item.id+"#"+sc.si:sc.t==="laudio"?"_a_"+sc.item.id:sc.item.id;
const isBinary=sc=>sc.t==="mcq"||sc.t==="lq"||sc.t==="choose"||sc.t==="bas";
const answered=(sc,ans)=>{const a=ans[scKey(sc)];return sc.t==="bas"?Array.isArray(a)&&a.some(x=>x!=null):a!=null};

/* Fragetyp-Punkte eines Bildschirms: [{k,r,t}] */
function skillParts(sc,ans){
  const x=scoreScreen(sc,ans);
  if(sc.t==="mcq")return [{k:"r."+(sc.item.questions[sc.qi].skill||"detail"),r:x.right,t:1}];
  if(sc.t==="lq")return [{k:"l."+(sc.item.questions[sc.qi].skill||"detail"),r:x.right,t:1}];
  if(sc.t==="choose")return [{k:"c."+(sc.item.skill||"statement"),r:x.right,t:1}];
  if(sc.t==="bas")return [{k:"b."+(sc.item.skill||"order"),r:x.right,t:1}];
  if(sc.t==="ctw")return ctwGaps(sc.item.text).map((g,i)=>({k:FUNC.has((g.shown+g.missing).toLowerCase())?"w.func":"w.content",r:x.detail[i]?1:0,t:1}));
  if(sc.t==="repeat")return [{k:countWords(sc.item.sentences[sc.si])>9?"s.long":"s.short",r:x.right,t:5}];
  return [];
}
const charLev=(a,b)=>tokLev([...a],[...b]);

/* Auswertung eines Durchgangs. e = Verlaufseintrag, scs = Bildschirme mit item */
function analyze(e,scs){
  const ans=e.answers||{},times=e.times||{},changes=e.changes||{};
  const A={skills:{},wrong:[],unanswered:0,r2w:0,w2r:0,ctw:{total:0,wrong:0,empty:0,near:0,other:0,func:0,list:[]},rep:{n:0,sum:0,empty:0,func:0,content:0,ending:0,miss:{}},time:{},lang:{},langN:0};
  scs.forEach(sc=>{
    skillParts(sc,ans).forEach(p=>{const s=A.skills[p.k]||(A.skills[p.k]={r:0,t:0,wrong:[]});s.r+=p.r;s.t+=p.t;if(p.r<p.t&&!s.wrong.includes(sc))s.wrong.push(sc)});
    if(isBinary(sc)){
      const ok=scoreScreen(sc,ans).right===1;
      if(!ok){A.wrong.push(sc);if(!answered(sc,ans))A.unanswered++}
      const ch=changes[scKey(sc)];
      if(ch&&ch.n>0&&sc.t!=="bas"){const corr=sc.t==="choose"?sc.item.answer:sc.item.questions[sc.qi].answer;if(ch.first===corr&&!ok)A.r2w++;if(ch.first!==corr&&ok)A.w2r++}
      const T=A.time[sc.sec]||(A.time[sc.sec]={rs:0,rn:0,ws:0,wn:0,slow:[]});const t=times[scKey(sc)];
      if(t!=null){if(ok){T.rs+=t;T.rn++}else{T.ws+=t;T.wn++}T.slow.push({sc,t,ok})}
    }
    if(sc.t==="ctw"){const gaps=ctwGaps(sc.item.text),a=ans[sc.item.id]||[];
      gaps.forEach((g,i)=>{A.ctw.total++;const got=(a[i]||"").trim().toLowerCase(),want=g.missing.toLowerCase();if(got===want)return;
        A.ctw.wrong++;const word=g.shown+g.missing;if(FUNC.has(word.toLowerCase()))A.ctw.func++;
        const kind=!got?"empty":charLev(got,want)<=1||got[0]===want[0]&&Math.abs(got.length-want.length)<=1&&charLev(got,want)<=2?"near":"other";A.ctw[kind]++;
        A.ctw.list.push({word,got:got?g.shown+got:"",kind})})}
    if(sc.t==="repeat"){const target=sc.item.sentences[sc.si],said=ans[scKey(sc)]||"";const t=toks(target),s=toks(said);
      A.rep.n++;A.rep.sum+=repeatScore(target,said);if(!s.length){A.rep.empty++;return}
      const pool=s.slice();t.forEach(w=>{const i=pool.indexOf(w);if(i>=0){pool.splice(i,1);return}
        const j=pool.findIndex(x=>x.length>2&&w.length>2&&(x.startsWith(w.slice(0,Math.max(3,w.length-2)))||w.startsWith(x.slice(0,Math.max(3,x.length-2)))));
        if(j>=0){pool.splice(j,1);A.rep.ending++}else if(STOP.has(w)||FUNC.has(w))A.rep.func++;else{A.rep.content++}
        A.rep.miss[w]=(A.rep.miss[w]||0)+1})}
  });
  Object.values(e.evals||{}).forEach(ev=>(ev&&Array.isArray(ev.errors)?ev.errors:[]).forEach(x=>{const c=LANG_CATS.includes(x.cat)?x.cat:"Wortwahl";A.lang[c]=(A.lang[c]||0)+1;A.langN++}));
  Object.values(A.time).forEach(T=>T.slow.sort((a,b)=>b.t-a.t));
  A.patterns=Object.keys(A.skills).map(k=>Object.assign({k,lost:A.skills[k].t-A.skills[k].r,pct:A.skills[k].t?A.skills[k].r/A.skills[k].t:1},A.skills[k]))
    .filter(p=>p.lost>0).sort((a,b)=>(b.lost/(b.k[0]==="s"?5:1))-(a.lost/(a.k[0]==="s"?5:1))||a.pct-b.pct);
  A.safe=Object.keys(A.skills).filter(k=>A.skills[k].t>=2&&A.skills[k].r===A.skills[k].t).map(k=>(KB[k]||{n:k}).n+" "+A.skills[k].r+"/"+A.skills[k].t);
  return A;
}
const skillName=k=>(KB[k]||{n:k}).n;
const pctTxt=(r,t)=>t?Math.round(100*r/t)+" %":"–";
const secs=t=>t<60?Math.round(t)+" s":fmt(t)+" min";

/* Wichtigste Erkenntnisse: regelbasiert, höchstens 6 */
function insights(e,A){
  const out=[],S5=e.sections||{};
  const top=A.patterns.filter(p=>p.k[0]!=="s"&&p.lost>=1).slice(0,2);
  top.forEach((p,i)=>out.push(`<b>${i?"Zweitgrößter":"Größter"} Punktverlust: ${esc(skillName(p.k))}</b> · ${p.r} von ${p.t} richtig. ${esc((KB[p.k]||{}).fix||"")}`));
  ["reading","listening"].forEach(sec=>{const s=S5[sec];if(!s||s.max==null||!s.max)return;const name=SECTIONS[sec].name;
    if(s.route==="easy"&&s.m1max)out.push(`<b>${name}: Modul 1 mit ${s.m1} von ${s.m1max} (${pctTxt(s.m1,s.m1max)})</b> führte ins leichte Modul 2. Damit ist höchstens Band 4,5 möglich. Für 5,5 und mehr brauchst du in Modul 1 mindestens ${Math.ceil(.7*s.m1max)} richtige.`);
    else if(s.route==="hard"&&s.band<5.5){const need=Math.ceil(.86*s.max)-s.raw;out.push(`<b>${name}: schweres Modul 2 erreicht</b>, Band ${fmtBand(s.band)}. Für Band 5,5 fehlen ${need} Punkt${need===1?"":"e"} (${Math.ceil(.86*s.max)} von ${s.max}).`)}
    else if(s.route==="hard")out.push(`<b>${name}: Zielband erreicht</b> (${fmtBand(s.band)}, ${s.raw} von ${s.max}).`)});
  if(A.unanswered>0)out.push(`<b>${A.unanswered} Frage${A.unanswered===1?"":"n"} unbeantwortet.</b> Falsche Antworten kosten nichts: Bei Zeitnot immer raten und weitergehen.`);
  const P=(e.parts||[]).filter(p=>p.limit&&(p.sec==="reading"));
  P.forEach(p=>{const left=p.limit-p.used,w=A.wrong.filter(sc=>sc.sec===p.sec).length;if(left>p.limit*.2&&w>=4)out.push(`<b>${SECTIONS[p.sec].name}: ${Math.round(left/60)} Minuten übrig bei ${w} Fehlern.</b> Die Restzeit für unsichere Fragen nutzen: Belegstelle im Text noch einmal prüfen.`)});
  Object.keys(A.time).forEach(sec=>{const T=A.time[sec];if(T.rn<4||T.wn<3||sec==="listening")return;const ra=T.rs/T.rn,wa=T.ws/T.wn;
    if(wa<ra*.65)out.push(`<b>${SECTIONS[sec].name}: Falsche Antworten kamen schneller</b> (Ø ${secs(wa)}) als richtige (Ø ${secs(ra)}). Das sind Flüchtigkeitsfehler: vor dem Klick die Belegstelle suchen.`);
    else if(wa>ra*1.6)out.push(`<b>${SECTIONS[sec].name}: Bei falschen Antworten lange überlegt</b> (Ø ${secs(wa)} statt ${secs(ra)}). Das sind Verständnislücken, kein Zeitproblem. Im Test: nach 60 Sekunden beste Option wählen und weiter.`)});
  if(A.r2w>=2&&A.r2w>A.w2r)out.push(`<b>${A.r2w} Antworten von richtig auf falsch geändert</b> (umgekehrt nur ${A.w2r}). Die erste Wahl nur ändern, wenn du eine Belegstelle dagegen findest.`);
  if(A.ctw.total&&A.ctw.wrong>=2){const c=A.ctw;const main=c.near>=c.other&&c.near>=c.empty?`${c.near} davon Schreibweise oder Endung`:c.empty>=c.other?`${c.empty} davon leer gelassen`:`${c.other} davon falsches Wort`;
    out.push(`<b>Complete the Words: ${c.wrong} von ${c.total} Lücken falsch</b>, ${main}${c.func?`, ${c.func} Funktionswörter`:""}.`)}
  if(A.rep.n){const avg=A.rep.sum/A.rep.n;if(avg<4.5){const m=[A.rep.func&&A.rep.func+" kleine Wörter ausgelassen",A.rep.ending&&A.rep.ending+" Endungen verändert",A.rep.content&&A.rep.content+" Inhaltswörter fehlen",A.rep.empty&&A.rep.empty+" Sätze ohne Antwort"].filter(Boolean).join(", ");
    out.push(`<b>Listen and Repeat: Ø ${avg.toFixed(1).replace(".",",")} von 5.</b> ${m?m+".":""}`)}}
  if(A.langN>=3){const c=Object.keys(A.lang).sort((a,b)=>A.lang[b]-A.lang[a])[0];out.push(`<b>Häufigster Sprachfehler: ${esc(c)}</b> (${A.lang[c]} von ${A.langN}). ${esc(LANG_KB[c]||"")}`)}
  const prev=S.history.filter(h=>h!==e&&h.kind===e.kind&&h.section===e.section&&h.band!=null&&h.id<e.id).pop();
  if(prev&&e.band!=null){const d=e.band-prev.band;out.push(`<b>Vergleich zum letzten Durchgang:</b> Band ${fmtBand(prev.band)} → ${fmtBand(e.band)}${d>0?" (besser)":d<0?" (schwächer)":" (gleich)"}.`)}
  if(!out.length&&!A.wrong.length&&Object.keys(A.skills).length)out.push("<b>Keine Fehler in den automatisch bewerteten Aufgaben.</b>");
  return out.slice(0,7);
}

/* Kurzbeschreibung einer falsch beantworteten Aufgabe */
function wrongLine(sc,ans){
  if(sc.t==="mcq"||sc.t==="lq"){const q=sc.item.questions[sc.qi],a=ans[scKey(sc)];
    return `<div class="wq"><div class="q">${esc(q.q)}</div><div class="a">${a!=null?`Du: <s>${esc(q.options[a])}</s>`:"Keine Antwort"} · Richtig: <span class="fix">${esc(q.options[q.answer])}</span></div>${q.why?`<div class="r">${esc(q.why)}</div>`:""}</div>`}
  if(sc.t==="choose"){const it=sc.item,a=ans[it.id];
    return `<div class="wq"><div class="q">„${esc(it.prompt)}“</div><div class="a">${a!=null?`Du: <s>${esc(it.options[a])}</s>`:"Keine Antwort"} · Richtig: <span class="fix">${esc(it.options[it.answer])}</span></div>${it.why?`<div class="r">${esc(it.why)}</div>`:""}</div>`}
  if(sc.t==="bas"){const it=sc.item,a=(ans[it.id]||[]).filter(i=>i!=null).map(i=>it.chunks[i]).join(" ");
    return `<div class="wq"><div class="q">${esc(it.prompt)}</div><div class="a">${a?`Du: <s>${esc(a)}</s>`:"Keine Antwort"} · Richtig: <span class="fix">${esc(it.answer)}</span></div>${it.why?`<div class="r">${esc(it.why)}</div>`:""}</div>`}
  if(sc.t==="repeat"){const s=sc.item.sentences[sc.si],said=ans[scKey(sc)]||"";
    return `<div class="wq"><div class="q">${esc(s)}</div><div class="a">Du: ${said?esc(said):"–"} · ${repeatScore(s,said)} von 5</div></div>`}
  return "";
}

/* HTML der Fehleranalyse */
function analysisHtml(e,scs,A){
  const ins=insights(e,A);
  const pat=A.patterns.map((p,i)=>{const kb=KB[p.k]||{n:p.k};
    let body="";
    if(p.k[0]==="w"){const l=A.ctw.list.filter(x=>FUNC.has(x.word.toLowerCase())===(p.k==="w.func"));
      body=`<div class="wq"><div class="a">${l.map(x=>`${x.got?`<s>${esc(x.got)}</s>`:"<s>___</s>"} → <span class="fix">${esc(x.word)}</span>`).join(" · ")}</div></div>`}
    else body=p.wrong.slice(0,8).map(sc=>wrongLine(sc,e.answers)).join("")+(p.wrong.length>8?`<div class="wq"><div class="a">+ ${p.wrong.length-8} weitere, siehe „Alle Aufgaben mit Lösungen“ unten</div></div>`:"");
    const canTrain=!/^s\./.test(p.k);
    return `<details class="pat" ${i<3?"open":""}><summary><span class="pt">${esc(kb.n)}</span><span class="ps">${p.k[0]==="s"?p.r+" / "+p.t+" Punkte":p.r+" / "+p.t+" richtig"}</span></summary>
      <div class="pbar"><i style="width:${Math.round(100*p.pct)}%"></i></div>
      ${kb.how?`<dl class="kb"><dt>Erkennen</dt><dd>${esc(kb.how)}</dd><dt>Falle</dt><dd>${esc(kb.trap)}</dd><dt>Vorgehen</dt><dd>${esc(kb.fix)}</dd></dl>`:""}
      <div class="label" style="margin-top:4px">Deine Fehler</div>${body}
      ${canTrain?`<div class="btns" style="margin-top:10px"><button class="btn small" data-train="${p.k}">Diesen Fragetyp trainieren</button></div>`:""}</details>`}).join("");
  const langRows=Object.keys(A.lang).sort((a,b)=>A.lang[b]-A.lang[a]).map(c=>`<div class="err"><b>${esc(c)}</b> · ${A.lang[c]}×<div class="r">${esc(LANG_KB[c]||"")}</div></div>`).join("");
  const timeRows=(e.parts||[]).filter(p=>p.limit||p.used).map(p=>{const T=A.time[p.sec];const own=T&&(e.parts.filter(x=>x.sec===p.sec).length===1);
    return `<tr><td>${esc(p.name)}</td><td class="n">${fmt(p.used)}${p.limit?" / "+fmt(p.limit):""}</td><td class="n">${own&&T.rn?secs(T.rs/T.rn):"–"}</td><td class="n">${own&&T.wn?secs(T.ws/T.wn):"–"}</td></tr>`}).join("");
  const slow=Object.values(A.time).flatMap(T=>T.slow).filter(x=>x.sc.sec!=="listening").sort((a,b)=>b.t-a.t).slice(0,3).filter(x=>x.t>=45);
  return `${ins.length?`<section class="group"><div class="label">Wichtigste Erkenntnisse</div><ol class="insights">${ins.map(x=>`<li>${x}</li>`).join("")}</ol></section>`:""}
    ${pat?`<section class="group"><div class="row"><div class="label">Fehlermuster nach Fragetyp</div><span class="muted small">sortiert nach Punktverlust</span></div>${pat}
      ${A.safe.length?`<p class="muted small" style="margin:0">Sicher: ${esc(A.safe.join(" · "))}</p>`:""}</section>`:""}
    ${langRows?`<section class="group"><div class="label">Sprachfehler in Writing und Speaking</div><div class="panel errs" style="padding-block:8px">${langRows}</div></section>`:""}
    ${timeRows&&e.kind!=="practice"?`<section class="group"><div class="label">Zeit</div><div class="tw"><table class="hist"><thead><tr><th>Teil</th><th class="n">Genutzt</th><th class="n">Ø richtig</th><th class="n">Ø falsch</th></tr></thead><tbody>${timeRows}</tbody></table></div>
      ${slow.length?`<p class="muted small" style="margin:0">Am längsten gebraucht: ${slow.map(x=>`${esc((x.sc.t==="bas"?x.sc.item.prompt:x.sc.item.questions[x.sc.qi].q).slice(0,60))}… (${secs(x.t)}, ${x.ok?"richtig":"falsch"})`).join(" · ")}</p>`:""}</section>`:""}`;
}

/* Tiefenanalyse durch Claude: Prompt mit allen Fehlern samt Kontext */
function contextOf(sc){
  const it=sc.item;
  if(sc.type==="conversation")return it.lines.map(l=>(l.who==="W"?"Woman: ":"Man: ")+l.text).join(" ");
  return String(it.text||"").replace(/\s+/g," ");
}
function analysisPrompt(e,scs,A,human){
  const ans=e.answers||{};const seen=new Set();
  const items=A.wrong.slice(0,28).map((sc,i)=>{
    const key=scKey(sc),t=(e.times||{})[key];let s=`#${i+1} [${skillName(skillParts(sc,ans)[0].k)}]${t!=null?" time "+Math.round(t)+"s":""}\n`;
    if((sc.t==="mcq"||sc.t==="lq")&&!seen.has(sc.item.id)){seen.add(sc.item.id);s+=`${sc.t==="lq"?"TRANSCRIPT":"TEXT"}: ${contextOf(sc).slice(0,1100)}\n`}
    if(sc.t==="mcq"||sc.t==="lq"){const q=sc.item.questions[sc.qi],a=ans[key];s+=`Q: ${q.q}\nOptions: ${q.options.map((o,j)=>LETTERS[j]+") "+o).join(" | ")}\nChosen: ${a!=null?LETTERS[a]:"none"} · Correct: ${LETTERS[q.answer]}`}
    else if(sc.t==="choose"){const a=ans[key];s+=`HEARD: "${sc.item.prompt}"\nOptions: ${sc.item.options.map((o,j)=>LETTERS[j]+") "+o).join(" | ")}\nChosen: ${a!=null?LETTERS[a]:"none"} · Correct: ${LETTERS[sc.item.answer]}`}
    else if(sc.t==="bas"){s+=`PROMPT: ${sc.item.prompt}\nBuilt: ${(ans[key]||[]).filter(x=>x!=null).map(x=>sc.item.chunks[x]).join(" ")||"(nothing)"}\nCorrect: ${sc.item.answer}`}
    return s}).join("\n\n");
  const stat=Object.keys(A.skills).map(k=>`${skillName(k)}: ${A.skills[k].r}/${A.skills[k].t}`).join("; ");
  const ctw=A.ctw.list.length?`\nCOMPLETE THE WORDS, wrong gaps (typed → correct): ${A.ctw.list.map(x=>(x.got||"___")+" → "+x.word).join("; ")}`:"";
  const rep=scs.filter(sc=>sc.t==="repeat").map(sc=>`"${sc.item.sentences[sc.si]}" → "${ans[scKey(sc)]||""}"`).join("; ");
  const head=`You are an experienced TOEFL iBT coach (test format from January 2026). A German-speaking learner aiming for band 5.5–6 has just finished: ${e.title}. Analyse the mistakes below and find the real error PATTERNS behind them, not a list of single mistakes. Look at which distractor was chosen and why it was tempting (word repeated from the text, too extreme, true but not asked, wrong referent, literal reading of an idiom, misheard detail), at the time spent, and at grammar or vocabulary gaps.

RESULTS BY QUESTION TYPE: ${stat||"–"}
Unanswered: ${A.unanswered}. Changed from right to wrong: ${A.r2w}.${ctw}${rep?`\nLISTEN AND REPEAT (original → learner): ${rep}`:""}

WRONG ANSWERS
${items||"(none)"}
`;
  if(human)return head+`
Antworte auf Deutsch, knapp und in Stichpunkten:
1. Die 3 wichtigsten Erkenntnisse.
2. Fehlermuster (höchstens 4): Name · Belege (welche Aufgaben) · Ursache · Regel · eine konkrete Übung.
3. Ein Trainingsplan für die nächsten 3 Tage.`;
  return head+`
Reply with ONLY a JSON object, no other text. All texts in German, short, concrete, no filler:
{"insights_de": ["<3 to 5 key findings, one sentence each>"],
 "patterns": [{"title_de": "<name of the pattern>", "evidence_de": "<which items show it, e.g. #2, #5, and what happened>", "cause_de": "<why the learner fell for it>", "rule_de": "<the rule or strategy that prevents it>", "drill_de": "<one concrete exercise>"}],
 "plan_de": ["<3 concrete training steps for the next days>"]}
At most 4 patterns. If there are fewer than 3 mistakes, say so and give only what the data supports.`;
}
function deepHtml(r){
  if(!r)return "";
  return `${Array.isArray(r.insights_de)&&r.insights_de.length?`<ol class="insights">${r.insights_de.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>`:""}
    ${(r.patterns||[]).map(p=>`<div class="pat" style="padding:14px 16px"><div class="pt">${esc(p.title_de||"")}</div>
      <dl class="kb"><dt>Belege</dt><dd>${esc(p.evidence_de||"")}</dd><dt>Ursache</dt><dd>${esc(p.cause_de||"")}</dd><dt>Regel</dt><dd>${esc(p.rule_de||"")}</dd><dt>Übung</dt><dd>${esc(p.drill_de||"")}</dd></dl></div>`).join("")}
    ${Array.isArray(r.plan_de)&&r.plan_de.length?`<div><div class="label">Trainingsplan</div><ol style="margin:6px 0 0;padding-left:20px">${r.plan_de.map(x=>`<li>${esc(x)}</li>`).join("")}</ol></div>`:""}`;
}
async function runDeep(entry,scs,A,box){
  const ctl=new AbortController();
  box.innerHTML=`<p class="muted"><span class="spin"></span>Claude sucht nach Fehlermustern. Das dauert meist 20–60 Sekunden.</p><button class="btn ghost small">Abbrechen</button>`;
  box.querySelector("button").onclick=()=>ctl.abort();
  try{const r=await SAMPLE.json(analysisPrompt(entry,scs,A,false),{signal:ctl.signal,modelTier:"default"});
    if(!r||!Array.isArray(r.insights_de))throw {code:"invalid_json"};
    entry.deep=r;save();if(view.name==="result"&&view.id===entry.id)render();return true}
  catch(err){box.innerHTML=`<p class="muted small">${esc(evalError(err))}</p>`;deepButtons(entry,scs,A,box);return false}
}
function deepButtons(entry,scs,A,box){
  const wrap=document.createElement("div");wrap.className="btns";
  if(SAMPLE){const b=document.createElement("button");b.className="btn primary";b.id="deep-run";b.textContent="Fehleranalyse mit Claude";b.onclick=()=>runDeep(entry,scs,A,box);wrap.appendChild(b)}
  const c=document.createElement("button");c.className="btn";c.textContent="Analyse-Prompt kopieren";
  c.onclick=()=>{const p=analysisPrompt(entry,scs,A,true);try{navigator.clipboard.writeText(p).then(()=>{c.textContent="Kopiert – in Claude einfügen"},()=>fallbackCopy(p,box))}catch(e){fallbackCopy(p,box)}};
  wrap.appendChild(c);box.appendChild(wrap);
}

/* Fehlerprofil über alle Durchgänge (Startseite) */
function weakSkills(){
  return Object.keys(S.skills||{}).map(k=>({k,r:S.skills[k].r,t:S.skills[k].t,pct:S.skills[k].r/S.skills[k].t}))
    .filter(x=>x.t>=(x.k[0]==="s"?10:4)&&x.pct<.85&&KB[x.k]).sort((a,b)=>a.pct-b.pct).slice(0,4);
}
