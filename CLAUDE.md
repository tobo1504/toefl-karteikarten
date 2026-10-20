# TOEFL-Trainer – Bauplan für Claude-Sitzungen

Dieses Repository gehört Tom (GitHub `tobo1504`). Es enthält zwei Apps für seine persönliche
Vorbereitung auf das **TOEFL iBT im neuen Format (seit 21.01.2026)**, Ziel: Band 5,5–6 in allen Sections.

- `/` (Wurzel): **Karteikarten** (offline-fähige PWA). Quelle liegt außerhalb des Repos als
  Claude-Artifact; `index.html` hier ist der gebaute Stand. Nicht anfassen, außer Tom fragt danach.
- `/trainer/`: **TOEFL-Trainer** – vollständige Übungs-App mit allen vier Sections. **Hier wird weitergebaut.**

Live: https://tobo1504.github.io/toefl-karteikarten/ und …/trainer/
(GitHub Pages, Branch `main`, Ordner `/`. Pages-Einstellungen kann Claude nicht über die API ändern.)

## Arbeitsweise in jeder Sitzung
1. Diese Datei lesen, dann `trainer/ROADMAP.md` – dort steht, was als Nächstes dran ist.
2. Nur an der nächsten offenen Etappe arbeiten; Häkchen in ROADMAP.md setzen, wenn erledigt.
3. Nach Änderungen: `python3 trainer/build.py` → prüft Inhalte, baut `trainer/index.html` (PWA)
   und `trainer/dist/trainer-artifact.html` (Claude-Version mit KI-Bewertung).
4. Headless testen (Playwright, Chromium ist vorinstalliert, `NODE_PATH=$(npm root -g)`):
   `node trainer/tests/smoke.js` – muss ohne Fehler durchlaufen.
5. Committen und auf `main` pushen. Die Claude-Version mit dem Artifact-Tool veröffentlichen
   (Datei `trainer/dist/trainer-artifact.html`, `capabilities: {sample:{}}`). Bestehende
   Artifact-URL steht in ROADMAP.md – immer dorthin aktualisieren, kein neues Artifact.
6. Kommunikation mit Tom: Deutsch, knappe Stichpunkte, keine Ausschmückungen.

## Architektur
- Keine Frameworks, keine externen Skripte. Reines HTML/CSS/JS, alles in **eine** Datei gebaut.
- `trainer/src/`:
  - `shell.html` – Grundgerüst (Platzhalter `/*STYLE*/`, `/*CONTENT*/`, `/*APP*/`)
  - `styles.css` – Design-Tokens identisch zu den Karteikarten (ruhig, Petrol-Akzent, Newsreader + Hanken Grotesk)
  - `app.js` – Router, Speicher, Timer, Test-Engine, Renderer pro Aufgabentyp, Bewertung
- `trainer/content/*.json` – **alle Aufgaben**. Schema siehe unten. Neue Aufgaben nur hier ergänzen.
- `trainer/build.py` – validiert JSON gegen Schema, setzt alles zusammen, schreibt beide Ausgaben.
- Speicherung: `localStorage` Schlüssel `toefl-trainer-v1` (Verlauf, gesehene Aufgaben, Bewertungen).
  Lernstand-Export/Import per Code (`TT1:` + base64), wie bei den Karteikarten.
- KI-Bewertung (Writing, Interview): nur in der Claude-Version über `claude.use("sample")`.
  In der PWA: Button „Bewertungs-Prompt kopieren“ → Tom fügt ihn in Claude ein.
- Listening/Speaking-Audio: `speechSynthesis` (Stimmen en-US/en-GB/en-AU, Mann/Frau getrennt).

## Offizielles Format (Quelle: ETS „Updated TOEFL iBT Test Overview“, Practice Tests 2026)
| Section | Aufgaben | Items | Zeit |
|---|---|---|---|
| Reading (2 Module, adaptiv) | Complete the Words · Read in Daily Life · Read an Academic Passage | 50 | 30 Min |
| Listening (2 Module, adaptiv) | Listen and Choose a Response · Conversation · Announcement · Academic Talk | 47 | 29 Min |
| Writing | Build a Sentence (10) · Write an Email (7 Min) · Academic Discussion (10 Min, ≥100 Wörter) | 12 | 23 Min |
| Speaking | Listen and Repeat (7 Sätze, 8–12 s) · Take an Interview (4 Fragen, 45 s, keine Vorbereitung) | 11 | 8 Min |

Details je Aufgabentyp:
- **Complete the Words:** Absatz 70–100 Wörter, erster Satz vollständig, danach fehlt bei jedem
  zweiten Wort die zweite Hälfte; 10 Lücken = 10 Items. Anweisung: „Fill in the missing letters in the paragraph.“
- **Read in Daily Life:** Alltagstext 15–150 Wörter (Notiz, Menü, Email, Rechnung, Chat, Aushang, Fahrplan), 2–3 MC-Fragen à 4 Optionen.
- **Read an Academic Passage:** ~200 Wörter, 5 MC-Fragen (Detail, Vokabel im Kontext, Inferenz, Zweck, Beziehung).
- **Listen and Choose a Response:** ein gehörter Satz (nicht angezeigt), 4 geschriebene Antworten, Pragmatik/Idiome.
- **Conversation:** kurzer Dialog, 2 Fragen. **Announcement:** 40–85 Wörter, 2 Fragen. **Academic Talk:** 100–250 Wörter, 4 Fragen.
- **Build a Sentence:** Satz eines Gesprächspartners, Antwort aus Blöcken bauen; alles-oder-nichts.
- **Email:** Szenario + 3 Bullet-Aufgaben. **Discussion:** Professor-Frage + 2 Studierenden-Posts.
- **Listen and Repeat:** Szenario (z. B. Zoo-Führung), 7 Sätze steigender Länge, „Repeat only once.“
- **Interview:** simuliertes Forschungsinterview, 4 Fragen: erst persönlich, dann Meinung.

Annahmen (nicht offiziell belegt, bei besseren Quellen anpassen):
- Modulaufbau Reading je Modul: 1× CtW (10) + 4× Daily (3+3+2+2) + 1× Academic (5) = 25.
- Modulaufbau Listening: M1 = 8 Choose + 2 Conv + 2 Ann + 2 Talk = 24; M2 = 7 + 2 + 2 + 2 = 23.
- Adaptiv: ≥ 70 % richtig in Modul 1 → schweres Modul 2, sonst leichtes.
- Rohpunkte Writing 0–20 (BaS 10 + Email 5 + Discussion 5), Speaking 0–55 (7×5 + 4×5).
- Band-Umrechnung: Tabellen in `app.js` (`BAND_TABLES`), grob an ETS-Konkordanz angelehnt.
- Rückwärts-Navigation: innerhalb eines Moduls erlaubt („Back“), wie im Paper-Practice-Test; zwischen Modulen nicht.

## Bewertungs-Rubrics (ETS, 0–5) – Kurzfassung für Prompts
- Email 5: effektiv, klar, konsequent; Ausarbeitung stützt Zweck; Satzvielfalt, präzise idiomatische Wortwahl,
  angemessene soziale Konventionen; fast keine Fehler. 4: meist effektiv, angemessene Ausarbeitung, wenige Fehler.
  3: erfüllt grob, Teile unklar, merkliche Fehler. 2: meist ineffektiv. 1: Versuch. 0: leer/off-topic/kopiert.
- Discussion 5: relevant, gut ausgearbeitet, klar; Satzvielfalt, präzise Wortwahl; fast keine Fehler. (Rest analog.)
- Listen and Repeat 5: exakte Wiederholung; 4: Bedeutung erfasst, kleine Abweichungen bei Funktionswörtern;
  3: meiste Inhaltswörter, Bedeutung nicht genau; 2: großer Teil fehlt; 1: sehr wenig.
- Interview 5: vollständig, gut ausgearbeitet, gutes Tempo, verständlich, Grammatik/Wortschatz genau.

## Inhaltsschema (`trainer/content/`)
Jede Aufgabe hat `id` (eindeutig, Präfix je Typ) und `level` (1 = leicht/Modul-2-leicht, 2 = mittel/Modul 1, 3 = schwer/Modul-2-schwer).
Jede MC-Frage: `{"q": "...", "options": ["A","B","C","D"], "answer": 0-3, "why": "Kurze deutsche Begründung"}`.
- `reading.json`: `ctw[]` `{id, level, text}` – Lücken als `pop{ular}` (sichtbar „pop“, gesucht „ular“).
  `daily[]` `{id, level, genre, title, text, questions[2-3]}`. `academic[]` `{id, level, title, text, questions[5]}`.
- `writing.json`: `bas[]` `{id, level, prompt, answer, chunks[]}` – `answer` = korrekter Satz, `chunks` = Blöcke in richtiger Reihenfolge
  (die App mischt sie). `email[]` `{id, situation, recipient, tasks[3]}`. `discussion[]` `{id, course, professor{name,text}, students[{name,text}×2]}`.
- `listening.json`: `choose[]` `{id, level, prompt, voice, options, answer, why}`, `conversation[]` `{id, level, lines[{who:"M"|"W",text}], questions[2]}`,
  `announcement[]` `{id, level, voice, text, questions[2]}`, `talk[]` `{id, level, voice, title, text, questions[4]}`.
- `speaking.json`: `repeat[]` `{id, scenario, intro, sentences[7]}`, `interview[]` `{id, topic, intro, questions[4]}`.

## Qualitätsregeln für neue Aufgaben
- Nie echte ETS-Aufgaben oder Texte anderer Anbieter kopieren. Alles neu schreiben, nach dem Muster der ETS-Beispiele.
- Fehlantworten plausibel (gleiche Länge, gleicher Stil). Antwortposition gleichmäßig über A–D verteilen.
- Englisch: amerikanische Schreibweise, natürlich, fehlerfrei. Begründungen (`why`) auf Deutsch, 1 Satz.
- Level 3 (schwer) = seltenerer Wortschatz, längere Sätze, mehr Inferenz.
