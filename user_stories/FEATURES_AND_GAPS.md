# Feature-Liste und Gap-Analyse - SIAVIBioFit

Quelle: `Enunciados trabalhos de avaliação 2 e 3 en-US (1).pdf`

## Geforderte Features aus der Aufgabenstellung

| Nr. | Feature | Beschreibung | Status im Projekt |
| --- | --- | --- | --- |
| F-01 | Initiale Registrierung | Neue Benutzer geben Name, Alter und Geschlecht ein und starten auf Level 1. | Teilweise umgesetzt |
| F-02 | Facial Recognition | Die App erkennt registrierte Benutzer automatisch per Gesichtserkennung. | Umgesetzt |
| F-03 | Persönliche Bio anzeigen | Nach Erkennung/Login werden Name, Alter, Geschlecht, Level, Score und Login-Anzahl angezeigt. | Teilweise umgesetzt |
| F-04 | Login-Zähler | Die App speichert, wie oft ein Benutzer die App verwendet bzw. sich eingeloggt hat. | Fehlt |
| F-05 | Fitness-Level | Benutzer starten auf Level 1; nach erfolgreich abgeschlossenem Set steigt das Level. | Fehlt |
| F-06 | Wiederholungsziel pro Level | Standard: 5 Wiederholungen, danach +5 pro Level oder Trainerwert. | Fehlt |
| F-07 | Übungsauswahl oder Trainingsplan | Benutzer wählen Übungen aus oder folgen einem sequentiellen Plan. | Teilweise umgesetzt |
| F-08 | Hand Weight Lifting | Gestenübung: Handgewicht-Heben erkennen und Wiederholungen zählen. | Fehlt |
| F-09 | Jumping Tracks | Sprünge auf der Stelle erkennen und zählen. | Fehlt |
| F-10 | Dritte Übung | Eine frei gewählte Übung, z. B. Arm Raises oder Push-ups, erkennen und zählen. | Fehlt |
| F-11 | Tracking und Speichern | Wiederholungen, abgeschlossene Sets, Score und Level dauerhaft pro Benutzer speichern. | Fehlt |
| F-12 | Score-System | Erfolgreiche Übungen erhöhen einen gespeicherten Score. | Fehlt |
| F-13 | Regeln | Die App stellt Regeln bzw. Anleitungen für korrekte Übungsausführung bereit. | Fehlt |
| F-14 | Benutzerfreundliche Dialoge | Verständliche Meldungen bei Kamera, Erkennung, Login und Übungen. | Teilweise umgesetzt |
| F-15 | Customization | Wiederholungsziele oder Schwierigkeit können angepasst werden. | Fehlt |
| F-16 | Interface-Design und Heuristik-Analyse | Bewertung der Gesteninteraktion anhand von Designprinzipien/Heuristiken. | Fehlt |
| F-17 | Funktionale Gestennutzung | Gesten werden in jeder Übung sinnvoll und funktionsfähig eingesetzt. | Fehlt |
| F-18 | Funktionale Gesichtserkennung | Gesichtserkennung ist sinnvoll integriert und funktioniert für mehrere Benutzer. | Umgesetzt |
| F-19 | Abgabestruktur | ZIP mit 3 Ordnern: Executable, Source Code, Presentation. | Fehlt |

## Bereits vorhandene Features im Projekt

- Lokale Web-App mit FastAPI und MJPEG-Kamerastream.
- OpenCV-Webcam-Anbindung mit Windows/macOS/Linux-Backend-Auswahl.
- FPS-Optimierung über kleinere Auflösung, Kamera-Buffer und Detection-Intervalle.
- Registrierung mit Name, Alter und Geschlecht.
- Gesichtserkennung mit InsightFace oder OpenCV-Fallback.
- SQLite-Datenbank `data/faces.sqlite` für mehrere registrierte Personen.
- Login per erkanntem Gesicht.
- Live-Overlay für erkannte Gesichter.
- Grundlegende Handgestenerkennung mit MediaPipe, wenn die passende Version verfügbar ist.
- Mehrsprachige UI mit Englisch, Deutsch, Portugiesisch, Serbisch, vereinfachtem Chinesisch, Französisch, Tamil und Kikuyu.
- Geschützter Trainingsbereich nach Login.

## Features, die noch fehlen

1. Vollständige Bio-Anzeige nach Login:
   - Alter anzeigen
   - Geschlecht anzeigen
   - Level anzeigen
   - Score anzeigen
   - Login-Anzahl anzeigen

2. Persistenter Benutzerfortschritt:
   - Login-Zähler pro Benutzer
   - Level pro Benutzer
   - Score pro Benutzer
   - abgeschlossene Übungen/Sets pro Benutzer

3. Trainingslogik:
   - Übungsauswahl oder sequentieller Trainingsplan
   - Status pro Übung: bereit, läuft, Wiederholung erkannt, Set abgeschlossen
   - Übergang zur nächsten Übung

4. Wiederholungszählung:
   - Hand Weight Lifting zählen
   - Jumping Tracks zählen
   - dritte Übung zählen, empfohlen: Arm Raises

5. Level-System:
   - Start bei Level 1
   - Standardziel 5 Wiederholungen
   - +5 Wiederholungen pro Level
   - Level-Up nach erfolgreichem Set

6. Score-System:
   - Punkte für Wiederholungen
   - Bonus für abgeschlossene Sets
   - dauerhafte Speicherung

7. Regeln und Anleitungen:
   - kurze Regelbeschreibung pro Übung
   - Erklärung, wann eine Wiederholung zählt
   - sichtbare Hinweise während der Übung

8. Customization:
   - Wiederholungsziel manuell setzen
   - optional Trainerwerte speichern
   - Schwierigkeit pro Benutzer anpassen

9. Interface-Evaluation:
   - Heuristik-Analyse dokumentieren
   - Gesteninteraktion bewerten
   - Usability-Probleme und Verbesserungen dokumentieren

10. Abgabestruktur:
    - Ordner `1_Executable`
    - Ordner `2_Source_Code`
    - Ordner `3_Presentation`
    - ZIP-Datei vorbereiten

