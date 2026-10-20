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

Stand nach Sitzung 1: Reading 9 CtW / 28 Daily / 8 Academic (reicht für 2 Reading-Tests), Writing 24 BaS / 6 Email / 6 Discussion,
Listening 26 Choose / 7 Conv / 7 Ann / 7 Talks, Speaking 6 Repeat / 8 Interviews.
Hilfsskripte für neue Inhalte: `trainer/tools/` (u. a. automatische CtW-Lückensetzung und Antwortpositions-Rotation).

## Etappe 2 – Listening (Sitzung 1)
- [x] Audio-Engine (speechSynthesis): Stimmenwahl US/UK/AU, Mann/Frau, einmaliges Abspielen im Testmodus
- [x] 4 Aufgabentypen, adaptive Module, Timer 29 Min
- [x] Inhalte: 1 vollständiger Section-Test + Übungspool (26 Choose, 7 Conversations, 7 Announcements, 7 Talks)

## Etappe 3 – Speaking (Sitzung 1)
- [x] Listen and Repeat: Satz vorspielen, Antwortfenster 8–12 s, Eingabe per Diktat/Spracherkennung, automatischer Abgleich → Score 0–5
- [x] Take an Interview: 4 Fragen, 45 s Zeitfenster, Transkript per Diktat, KI-Bewertung
- [x] Inhalte: 6 Repeat-Szenarien, 8 Interviews

## Etappe 4 – Komplette Probetests
- [x] Ganzer Test am Stück (R → L → W → S, ~90 Min), Band pro Section + Gesamt
- [x] Auswertung mit Fehlerliste, Erklärungen, Transkripten
- [x] Vergleich mit früheren Tests (Trend-Grafik je Section auf der Startseite)
- [ ] Inhalte für insgesamt 4 vollständige Tests ohne Wiederholung (aktuell reicht der Pool für ca. 1–2)

## Etappe 5 – Feinschliff
- [ ] Statistik je Aufgabentyp (Trend), Schwächen-Training
- [ ] Mehr Inhalte bis 6 Tests, Kalibrierung der Band-Tabellen gegen ETS-Ergebnisse von Tom
- [ ] Offline-Test auf iPhone/Android
