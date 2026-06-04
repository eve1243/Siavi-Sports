# User Stories - SIAVIBioFit

Diese User Stories basieren auf der Aufgabenstellung aus `Assessment Assignment #3 - Evaluation of Interfaces with Gesture and Voice Interaction Systems with Facial Recognition` und auf dem aktuellen Projektstand.

## Epic 1 - Registrierung und Face Recognition

### US-01 - Erstregistrierung

Als neuer Benutzer möchte ich Name, Alter und Geschlecht eingeben, damit die App ein persönliches Profil für mich anlegen kann.

Akzeptanzkriterien:
- Der Benutzer kann Name, Alter und Geschlecht eingeben.
- Ohne sichtbares Gesicht kann keine Registrierung abgeschlossen werden.
- Die Profildaten werden lokal gespeichert.
- Neue Benutzer starten auf Level 1.

Status: Umgesetzt. Name, Alter, Geschlecht und Gesichtsdaten werden gespeichert; neue Benutzer starten mit Level 1.

### US-02 - Gesicht registrieren

Als Benutzer möchte ich mein Gesicht registrieren, damit die App mich später automatisch wiedererkennen kann.

Akzeptanzkriterien:
- Die Kamera erkennt ein sichtbares Gesicht.
- Das Gesicht wird dem richtigen Benutzerprofil zugeordnet.
- Mehrere Personen können getrennt registriert werden.
- Wird dieselbe Person erneut registriert, wird ein weiteres Face-Sample gespeichert.
- Die Daten werden lokal in einer Datenbank gespeichert.

Status: Umgesetzt.

### US-03 - Automatische Gesichtserkennung

Als registrierter Benutzer möchte ich beim Öffnen der App automatisch erkannt werden, damit ich schnell mein Profil nutzen kann.

Akzeptanzkriterien:
- Die App erkennt registrierte Gesichter im Livebild.
- Erkannte Personen werden intern als Login-Kandidaten geführt.
- Die App zeigt den erkannten Namen im Kamerabild.
- Recognition-Scores laufen im Hintergrund und werden nicht als Prozentwert angezeigt.

Status: Umgesetzt.

### US-04 - FaceID-Login

Als registrierter Benutzer möchte ich mich mit meinem erkannten Gesicht einloggen, damit nur mein persönlicher Trainingsbereich geöffnet wird.

Akzeptanzkriterien:
- Ein erkannter Name kann zum Login verwendet werden.
- Der Login-Button funktioniert nur mit erkanntem Profil.
- Nach erfolgreichem Login wird der Trainingsbereich angezeigt.
- Bei nicht erkanntem Gesicht erscheint eine verständliche Meldung.

Status: Umgesetzt.

## Epic 2 - Persönliches Profil und Fortschritt

### US-05 - Persönliche Bio anzeigen

Als eingeloggter Benutzer möchte ich meine persönlichen Informationen sehen, damit die App personalisiert wirkt.

Akzeptanzkriterien:
- Die App zeigt Name, Alter und Geschlecht an.
- Die App zeigt den aktuellen Fitness-Level an.
- Die App zeigt den aktuellen Score an.
- Die App zeigt die Anzahl der bisherigen Logins an.

Status: Umgesetzt. Der Trainingsbereich zeigt Name, Alter, Geschlecht, Level, Score und Login-Zähler an.

### US-06 - Login-Zähler speichern

Als Benutzer möchte ich, dass meine Logins gezählt werden, damit meine Nutzung nachvollziehbar ist.

Akzeptanzkriterien:
- Jeder erfolgreiche Login erhöht den Login-Zähler des Profils.
- Der Login-Zähler wird dauerhaft gespeichert.
- Der Login-Zähler wird im Trainingsbereich angezeigt.

Status: Fehlt.

### US-07 - Score speichern

Als Benutzer möchte ich Punkte für erfolgreich erkannte Übungen erhalten, damit meine Leistung messbar wird.

Akzeptanzkriterien:
- Jede gültige Wiederholung erhöht den Score oder trägt zum Score bei.
- Ein abgeschlossenes Set gibt zusätzliche Punkte.
- Der Score wird dauerhaft pro Benutzer gespeichert.
- Der Score wird nach dem Login wieder geladen.

Status: Fehlt.

### US-08 - Fitness-Level erhöhen

Als Benutzer möchte ich nach abgeschlossenen Übungssets im Level steigen, damit die App herausfordernder wird.

Akzeptanzkriterien:
- Jeder Benutzer startet auf Level 1.
- Nach Abschluss eines kompletten Sets steigt das Level.
- Das Level wird pro Benutzer gespeichert.
- Das aktuelle Level wird im Trainingsbereich angezeigt.

Status: Fehlt.

### US-09 - Wiederholungsziel pro Level

Als Benutzer möchte ich ein Wiederholungsziel sehen, damit ich weiß, wann ein Set abgeschlossen ist.

Akzeptanzkriterien:
- Level 1 startet mit 5 Wiederholungen.
- Pro Level steigt das Ziel um 5 Wiederholungen.
- Alternativ kann ein Trainerwert gesetzt werden.
- Die App zeigt aktuelle Wiederholungen und Zielwiederholungen an.

Status: Fehlt.

## Epic 3 - Übungen und Gestensteuerung

### US-10 - Übungsauswahl

Als Benutzer möchte ich Übungen auswählen oder einem Trainingsplan folgen, damit ich mein Training starten kann.

Akzeptanzkriterien:
- Die App bietet mindestens drei Übungen an.
- Die App enthält Hand Weight Lifting.
- Die App enthält Jumping Tracks.
- Die App enthält eine dritte Gruppenübung, empfohlen: Arm Raises.
- Alternativ kann die App einen sequentiellen Trainingsplan anbieten.

Status: Teilweise umgesetzt. Es gibt Platzhalter-Karten, aber noch keine echte Übungslogik.

### US-11 - Hand Weight Lifting zählen

Als Benutzer möchte ich Hand Weight Lifting ausführen, damit die App jede gültige Wiederholung erkennt und zählt.

Akzeptanzkriterien:
- Die App erkennt die passende Hebebewegung.
- Jede vollständige Wiederholung wird genau einmal gezählt.
- Unvollständige Bewegungen werden nicht gezählt.
- Fortschritt und Ziel werden während der Übung angezeigt.

Status: Fehlt.

### US-12 - Jumping Tracks zählen

Als Benutzer möchte ich auf der Stelle springen, damit die App meine Sprünge erkennt und zählt.

Akzeptanzkriterien:
- Die App erkennt Sprungbewegungen im Kamerabild.
- Jeder gültige Sprung wird genau einmal gezählt.
- Fortschritt und Ziel werden während der Übung angezeigt.
- Nach Erreichen des Ziels wird das Set abgeschlossen.

Status: Fehlt.

### US-13 - Dritte Übung zählen

Als Projektgruppe möchten wir eine dritte Übung definieren, damit die App die Aufgabenstellung vollständig erfüllt.

Akzeptanzkriterien:
- Die Gruppe wählt eine dritte Übung, z. B. Arm Raises.
- Die App erkennt die Bewegung der Übung.
- Jede gültige Wiederholung wird gezählt.
- Die Übung erscheint in der Übungsauswahl oder im Trainingsplan.

Status: Fehlt.

### US-14 - Trainingsstatus anzeigen

Als Benutzer möchte ich während des Trainings klare Rückmeldungen bekommen, damit ich weiß, ob meine Bewegung erkannt wurde.

Akzeptanzkriterien:
- Die App zeigt die aktuelle Übung an.
- Die App zeigt aktuelle Wiederholungen und Ziel an.
- Die App zeigt an, wenn eine Wiederholung gezählt wurde.
- Die App zeigt an, wenn ein Set abgeschlossen ist.

Status: Fehlt.

## Epic 4 - Regeln, Anpassung und Usability

### US-15 - Regeln pro Übung anzeigen

Als Benutzer möchte ich klare Regeln für jede Übung sehen, damit ich weiß, wie ich eine Wiederholung korrekt ausführe.

Akzeptanzkriterien:
- Jede Übung hat eine kurze Regelbeschreibung.
- Die App erklärt, wann eine Wiederholung zählt.
- Die Regeln sind im Trainingsbereich sichtbar.

Status: Fehlt.

### US-16 - Benutzerfreundliche Meldungen

Als Benutzer möchte ich verständliche Meldungen sehen, damit ich weiß, was die App gerade erwartet.

Akzeptanzkriterien:
- Die App zeigt verständliche Fehler bei Kamera-Problemen.
- Die App zeigt verständliche Fehler bei fehlendem Gesicht.
- Die App zeigt verständliche Hinweise während Registrierung, Login und Training.
- Meldungen sind kurz und eindeutig.

Status: Teilweise umgesetzt.

### US-17 - Customization

Als Trainer oder Benutzer möchte ich Wiederholungsziele anpassen können, damit die Schwierigkeit zur Person passt.

Akzeptanzkriterien:
- Das Wiederholungsziel kann pro Übung oder Benutzer angepasst werden.
- Trainerwerte werden gespeichert.
- Automatische Level-Ziele bleiben möglich.

Status: Fehlt.

### US-18 - Mehrsprachige Oberfläche

Als Benutzer möchte ich die Sprache auswählen können, damit ich die App besser verstehe.

Akzeptanzkriterien:
- Die App bietet mehrere Sprachen in einem Dropdown an.
- UI-Texte ändern sich ohne Neustart.
- Die Auswahl wird lokal gespeichert.

Status: Umgesetzt.

## Epic 5 - Bewertung und Abgabe

### US-19 - Heuristik-Analyse dokumentieren

Als Projektgruppe möchten wir die Interface-Qualität anhand von Heuristiken bewerten, damit die Bewertungskriterien erfüllt werden.

Akzeptanzkriterien:
- Es gibt eine kurze Liste relevanter Heuristiken oder Designprinzipien.
- Die Gesteninteraktion wird bewertet.
- Probleme und Verbesserungen werden dokumentiert.

Status: Fehlt.

### US-20 - Abgabestruktur vorbereiten

Als Projektgruppe möchten wir die Abgabeordner vorbereiten, damit die ZIP-Abgabe der Aufgabenstellung entspricht.

Akzeptanzkriterien:
- Es gibt einen Ordner `1_Executable`.
- Es gibt einen Ordner `2_Source_Code`.
- Es gibt einen Ordner `3_Presentation`.
- Die Abgabe kann als ZIP-Datei erstellt werden.

Status: Fehlt.
