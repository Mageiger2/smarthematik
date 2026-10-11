# sMArTHEMATIK – Projekt-Protokoll

Lernplattform für die 10. Klasse Mittelschule Bayern (Mittlerer Schulabschluss, Mathematik).
Live unter https://www.smarthematik.de (GitHub Pages, Branch `main`). Dieses Protokoll wird bei jeder Arbeitssitzung fortgeschrieben.

## Aufbau in Kürze

- **Statische Seiten**, kein Server, kein Konto. Jede Trainer-Seite (`kugel.html`, …) enthält React + Babel aus `assets/vendor/` und ein Inline-Skript, das aus den Dateien in `assets/js/` zusammengesetzt ist:
  - `shared.js` – gemeinsame Bausteine (Kopfzeile, Stufenmenü, Tipps, Rechner, Speicherfunktionen, Prüfungssimulations-Leiste)
  - `lernen-kern.js` – Modus „Lernen“ (Lernkarten, Fortschritt, Status gelernt/geübt/gemeistert)
  - `funktionen-kern.js` + `lernen-lineare.js` / `lernen-quadratische.js` – Lineare und Quadratische Funktionen (Themenkacheln, Schritt-Runner, Prüfungsteile)
  - `lernen-trainer.js` – Lernkarten der acht Trainer ohne Themenauswahl
  - `kopfrechnen-gen.js` – Aufgabengeneratoren und Teil-A-Prüfungsaufgaben (Kopfrechnen und Prüfungssimulation)
  - `pruefung.js` + `pruefung-katalog.js` – Prüfungssimulation; der Katalog wird mit `python3 tools/exam_catalog.py` aus den Trainer-Dateien erzeugt
  - `lehrer.js` + `fehlerheft-map.js` – Klassenübersicht; die Fehlerheft-Zuordnung nutzt auch die Startseite
- **Zusammenbauen:** Nach Änderungen an einer JS-Datei muss das Inline-Skript der betroffenen HTML-Seiten neu erzeugt werden (Reihenfolge: shared, Kern-Dateien, Trainer). Das SCORM-Paket für ByCS/mebis baut `python3 tools/build_scorm.py` nach `build/`.
- **Speicher im Browser (localStorage, Präfix `smarth_`):** Streak und Bestwert (`smarth_streak_*`, `smarth_best_*`), adaptive Statistik (`smarth_adaptive_<trainer>[_<thema>]`), Lernkarten (`smarth_progress`), gelöste Prüfungsteile (`smarth_exams_<trainer>`), Fehlerheft (`smarth_errors_<trainer>`), Optionen (`smarth_opts`, z. B. `tangens`), Prüfungssimulation (`smarth_exam_run`, `smarth_exam_results`), Klassenliste der Lehrkraft (`smarth_lehrer_klasse`). Der Fortschritts-Code (`SMARTH1.` + Base64 von deflate(JSON)) bündelt alle Schlüssel.
- **Status je Thema:** gelernt = alle Lernkarten; geübt = 5 Aufgaben richtig; gemeistert = eine Stufe 10-mal in Folge oder 3 Prüfungsteile.
- **Konventionen:** Du-Form, kurze Texte (lange Erklärungen eingeklappt unter einer Überschrift), echtes Minuszeichen „−“, Startstufe immer „Leicht“, gerundete Ergebnisse werden akzeptiert.

## 2026-10-11

Große Sitzung: vom Übungsportal zum Lernkurs.

1. **Parabel-Trainer überarbeitet** (bcf0b05): Verschieben, bessere Tipps, Zeichenlösungen platzierbar, Prüfung 2017 I d/e ergänzt, Vorzeichen-Zusammenfassungen. BETA-Bänder bei Linearen und Quadratischen Funktionen entfernt (6f43ce9).
2. **Lernkurs Phase 1–3** (03f9cd6, a04eb19, d7a1649): Modus „Lernen“ mit Lernkarten (Quadratische Funktionen 47 Karten, Lineare Funktionen 32 Karten), Umschalter Lernen ↔ Üben & Prüfen, Status-Chips, „Dein Fortschritt“ auf der Startseite mit Fortschritts-Code zum Mitnehmen auf andere Geräte.
3. **Tangens optional** (7ca37dc): Steigungswinkel ist per Schalter zuschaltbar (`smarth_opts.tangens`), standardmäßig aus; betroffene Übungen, Lernkarten und Prüfungsteile werden ausgeblendet.
4. **Prüfung aller Trainer** (4ead9b2): Keine Rechenfehler in den Prüfungswerten gefunden. Kopfrechnen auf 15 Aufgabentypen erweitert (neu: Wurzeln, Binomische Formeln, Wachstum, Kugel, Trigonometrie, Einheiten), Brüche und Wahrscheinlichkeit „schwer“ jetzt zufällig, Prozent mit Unterarten. Einheitlich: Startstufe Leicht, echtes Minus, gemeinsame Rundungsprüfung `numOk`; Wahrscheinlichkeit akzeptiert Prozent mit einer Nachkommastelle. Beobachtung, bewusst nicht geändert: Kopfrechnen feiert alle 6 statt 3 Treffer und hat einen dunklen „Nächste Aufgabe“-Knopf; Trigonometrie nutzt ein eigenes zweispaltiges Schritt-Layout.
5. **Lernkurs Phase 4** (72e1c83): je 5 Lernkarten für Kugel, Trigonometrie, Binomische Formeln, Potenzen, Wachstum, Halbwertszeit, Bruchgleichungen und Wahrscheinlichkeit (40 Karten, 5 interaktive Beispiele). Lernmodus für Trainer ohne Themenauswahl über `#lernen`. SCORM-Build repariert (Link-Prüfung stolperte über Skript-Strings).
6. **Fehlerheft** (7226ad6): Alle elf Trainer erfassen bei falschen Eingaben die Fehlerart (fachlich benannt, z. B. Definitionsmenge, mittleres Glied). Startseite zeigt die häufigsten Fehler mit Sprung zur passenden Lernkarte (`#lernen/k3` bzw. `#thema/lernen/k3`).
7. **Prüfungssimulation** (acbe258): `pruefung.html` mit Teil A (10 Ankreuzaufgaben ohne Taschenrechner, 15 min, echte Teil-A-Aufgaben plus Generatoren) und Teil B (8 Prüfungsteile aus allen Trainern, 60 min). Trainer öffnen eine Aufgabe über `#pruefung/<key>` und melden das Lösen zurück; Leiste mit Restzeit auf allen Seiten. Keine Note, nur Anteil gelöster Teile.
8. **ISB-Verweis** (64d8185): Fußzeile aller Seiten und Simulationsseite verlinken die ISB-Seite zum Mittleren Schulabschluss Mathematik und das ByCS-Prüfungsarchiv.
9. **Klassenübersicht für Lehrkräfte** (3ce5bc0): `lehrer.html` liest Fortschritts-Codes ein (Text oder Dateien), zeigt Stand je Schüler und Thema, Klassenbalken, häufigste Fehler, Simulationen, CSV-Export. Alles bleibt im Browser.
10. **FAQ und dieses Protokoll** angelegt (dd3a4e1).
11. **Taschenrechner**: Wurzelzeichen ist jetzt eine SVG-Grafik, die sich auf die Höhe des Radikanden streckt (Zahl, Bruch, verschachtelt), Strich endet an der Linie. Rechenfehler behoben: fehlendes Mal-Zeichen wird ergänzt (2π, 3√4, 2(3+4)), „log“ ohne Basis ist der Zehnerlogarithmus (vorher ln), leere Kästchen melden „Ein Kästchen ist noch leer“ statt still 0 zu rechnen.
12. **Zahlenraum einheitlich ℝ** (Definitionsmenge in den Lernkarten, wie Trainer und Prüfungsaufgaben). Taschenrechner: S↔D wirkt nur einmalig, jede neue Rechnung zeigt wieder Dezimal.
13. **Notenschlüssel in der Prüfungssimulation** wie in der echten Prüfung: Teil A 8 Punkte, Teil B 40 Punkte, Summe 48; Note 1: 48–41, 2: 40,5–33, 3: 32,5–25, 4: 24,5–16, 5: 15,5–8, 6: 7,5–0. Einzelne Teile werden auf 48 hochgerechnet, bei „Komplett“ zählt die Summe. Ergebnisverlauf und Klassenübersicht zeigen die Note.
14. **Lernkarten ausgebaut** in einfacher Sprache: Trigonometrie 4 neue Karten (gleichschenkliges Dreieck halbieren, Sachaufgaben mit Skizze, Thaleskreis, Abschnitte im Verhältnis), Wahrscheinlichkeit 3 neue Karten (Gruppen bilden, Reihenfolge egal, „mindestens“ über das Gegenteil).

### Offene Punkte und Ideen

- Wiederholungs-Planer (gemeisterte Themen nach 7 und 30 Tagen wieder vorschlagen).
- Tastaturbedienung der Kontrollfragen, Druckversion der Merkkästen als Formelsammlung.
- Die beiden Beobachtungen aus Punkt 4 (Kopfrechnen-Feier, Trigonometrie-Layout) angleichen.
