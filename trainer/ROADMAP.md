# TOEFL-Trainer – Roadmap

Claude-Version (Artifact, mit KI-Bewertung): https://claude.ai/artifact/QS92oWEzk9RQ7xuEGgn91q (Datei `trainer/dist/trainer-artifact.html`, `capabilities: {sample:{}}`)
PWA: https://tobo1504.github.io/toefl-karteikarten/trainer/

## Etappe 1 – Fundament, Reading, Writing (Sitzung 1)
- [x] App-Gerüst: Start, Training je Aufgabentyp, Section-Test, Ergebnisse, Verlauf, Speicher, Export/Import
- [x] Build-Skript mit Inhaltsprüfung, zwei Ausgaben (PWA + Claude-Version)
- [x] Reading: Complete the Words, Daily Life, Academic Passage; adaptive Module, Timer 30 Min
- [x] Writing: Build a Sentence, Email, Discussion; Timer; KI-Bewertung (sample) bzw. Prompt kopieren
- [x] Inhalte Reading: 1 vollständiger Section-Test (M1 + M2 leicht + M2 schwer) + Übungspool
- [x] Inhalte Writing: ≥ 20 Build a Sentence, ≥ 6 Emails, ≥ 6 Discussions
- [x] Smoke-Test, Veröffentlichung, Push

Stand nach Sitzung 1: Reading 6 CtW / 16 Daily / 5 Academic, Writing 24 BaS / 6 Email / 6 Discussion.
Hilfsskripte für neue Inhalte: `trainer/tools/` (u. a. automatische CtW-Lückensetzung und Antwortpositions-Rotation).

## Etappe 2 – Listening
- [ ] Audio-Engine (speechSynthesis): Stimmenwahl US/UK/AU, Mann/Frau, einmaliges Abspielen im Testmodus
- [ ] 4 Aufgabentypen, adaptive Module, Timer 29 Min
- [ ] Inhalte: 1 vollständiger Section-Test + Übungspool

## Etappe 3 – Speaking
- [ ] Listen and Repeat: Satz vorspielen, Antwortfenster 8–12 s, Eingabe per Diktat/Spracherkennung, automatischer Abgleich → Score 0–5
- [ ] Take an Interview: 4 Fragen, 45 s Zeitfenster, Transkript per Diktat, KI-Bewertung
- [ ] Inhalte: ≥ 6 Repeat-Szenarien, ≥ 8 Interviews

## Etappe 4 – Komplette Probetests
- [ ] Ganzer Test am Stück (R → L → W → S, ~90 Min), Band pro Section + Gesamt
- [ ] Auswertung mit Fehlerliste, Erklärungen, Vergleich mit früheren Tests
- [ ] Insgesamt 4 vollständige Tests

## Etappe 5 – Feinschliff
- [ ] Statistik je Aufgabentyp (Trend), Schwächen-Training
- [ ] Mehr Inhalte bis 6 Tests, Kalibrierung der Band-Tabellen gegen ETS-Ergebnisse von Tom
- [ ] Offline-Test auf iPhone/Android
