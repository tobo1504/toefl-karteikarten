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

Stand nach Sitzung 1: Reading 9 CtW / 28 Daily / 8 Academic, Writing 40 BaS / 10 Email / 10 Discussion,
Listening 44 Choose / 12 Conv / 12 Ann / 12 Talks, Speaking 6 Repeat / 8 Interviews → reicht für 2 komplette Tests ohne Wiederholung.

Stand nach Sitzung 2 (16.11.2026): Reading 12 CtW / 48 Daily / 12 Academic, Listening 88 Choose / 24 Conv / 24 Ann / 24 Talks,
Writing 40 BaS / 10 Email / 10 Discussion, Speaking 6 Repeat / 8 Interviews, 235 Audiodateien → **4 feste Probetests**, jeder mit eigenen Aufgaben.

## Nächste Sitzung – Vorschlag
1. Rückmeldung von Tom einholen (Schwierigkeit der Tests, Qualität der Fehleranalyse und der KI-Bewertung, Diktat am Handy) und Fehler beheben.
2. Inhalte Batch 4 für Probetest 5 und 6 (Bedarf je Test siehe Etappe 4). Dafür auch 20 neue BaS, damit Writing nicht der Engpass wird.
3. Band-Tabellen nachjustieren, sobald Tom echte ETS-Practice-Test-Ergebnisse hat.
Hilfsskripte für neue Inhalte: `trainer/tools/` (CtW-Lücken, Antwort-Rotation, Fragetyp, Längenausgleich, Audio).

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
- [x] Inhalte für 2 vollständige Tests ohne Wiederholung
- [x] Inhalte für Test 3 und 4 (Batch 3)
- [x] Feste Probetests 1–4 ohne Überschneidung, Auswahl auf der Startseite, Wiederholung mit Rückfrage
- [x] Testablauf wie am Testtag: englische Oberfläche, Anweisungen je Section, Sound-Check, Signalton, Warnung bei offenen Fragen
- [ ] Inhalte für Test 5 und 6 (je Test: Reading 3 CtW / 12 Daily (je Level 2× 3 Fragen + 2× 2 Fragen) / 3 Academic; Listening 22 Choose (8 Level 2, je 7 Level 1 und 3) / 6 Conv / 6 Ann / 6 Talks; Writing 10 BaS / 1 Email / 1 Discussion; Speaking 1 Repeat / 1 Interview)

## Etappe 5 – Fehleranalyse und Feinschliff
- [x] Fragetyp (skill) an jeder Frage; Fehlermuster je Fragetyp mit Erklärung (Erkennen / Falle / Vorgehen)
- [x] Wichtigste Erkenntnisse nach jedem Durchlauf (Punktverlust, Modul-Weg, Zeit, geänderte Antworten, CtW, Repeat, Sprachfehler)
- [x] Tiefenanalyse durch Claude und „Alles auswerten“ in der Claude-Version; Prompt kopieren + Punktzahl eintragen in der PWA
- [x] Fehlerheft („Fehler wiederholen“) und Schwächen-Training je Fragetyp, Fehlerprofil auf der Startseite
- [ ] Mehr Inhalte bis 6 Tests, Kalibrierung der Band-Tabellen gegen ETS-Ergebnisse von Tom
- [ ] Offline-Test auf iPhone/Android
- [ ] Eigene Sprachaufnahme im Speaking zum Anhören (nur PWA möglich, Mikrofon ist in der Claude-Version gesperrt)
