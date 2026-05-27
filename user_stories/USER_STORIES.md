# User Stories - SIAVIBioFit

Diese User Stories basieren auf der Aufgabenstellung aus "Assessment Assignment #3: Evaluation of Interfaces with Gesture and Voice Interaction Systems with Facial Recognition".

## US-01 - Erstregistrierung

Als neuer Benutzer moechte ich mich mit Name, Alter und Geschlecht registrieren, damit die App ein persoenliches Profil fuer mich anlegen kann.

Akzeptanzkriterien:
- Der Benutzer kann Name, Alter und Geschlecht eingeben.
- Die App speichert die Profildaten lokal.
- Neue Benutzer starten auf Level 1.
- Ohne sichtbares Gesicht darf keine FaceID-Registrierung abgeschlossen werden.

## US-02 - Gesicht registrieren

Als Benutzer moechte ich mein Gesicht registrieren, damit die App mich spaeter wiedererkennen kann.

Akzeptanzkriterien:
- Die Kamera erkennt ein sichtbares Gesicht.
- Das Gesicht wird dem eingegebenen Benutzerprofil zugeordnet.
- Die Registrierung funktioniert lokal ohne Cloud-Dienst.
- Die App zeigt eine verstaendliche Fehlermeldung, wenn kein Gesicht erkannt wird.

## US-03 - Gesichtserkennung beim Start

Als registrierter Benutzer moechte ich beim Oeffnen der App durch Gesichtserkennung erkannt werden, damit ich mein Profil schnell auswaehlen kann.

Akzeptanzkriterien:
- Die App erkennt registrierte Gesichter im Kamerabild.
- Ein Gesicht gilt nur als erkannt, wenn die Confidence groesser als 60% ist.
- Die App zeigt erkannte Benutzer als Login-Auswahl an.
- Die App loggt den Benutzer nicht automatisch ein.

## US-04 - Manueller FaceID-Login

Als registrierter Benutzer moechte ich nach erkannter FaceID selbst auf "Einloggen" klicken, damit ich die Kontrolle ueber den Login habe.

Akzeptanzkriterien:
- Der Login-Button ist nur sinnvoll nutzbar, wenn ein erkanntes Profil ausgewaehlt wurde.
- Die App loggt nur das ausgewaehlte erkannte Profil ein.
- Wenn kein Profil ueber 60% erkannt wurde, erscheint eine Fehlermeldung.
- Nach erfolgreichem Login wird der geschuetzte Trainingsbereich angezeigt.

## US-05 - Persoenliche Bio anzeigen

Als eingeloggter Benutzer moechte ich meine persoenlichen Informationen sehen, damit die App personalisiert wirkt.

Akzeptanzkriterien:
- Die App zeigt Name, Alter und Geschlecht an.
- Die App zeigt den aktuellen Fitness-Level an.
- Die App zeigt den aktuellen Score an.
- Die App zeigt an, wie oft sich der Benutzer bereits eingeloggt hat.

## US-06 - Login-Zaehler

Als Benutzer moechte ich, dass die App meine Logins zaehlt, damit mein Fortschritt nachvollziehbar ist.

Akzeptanzkriterien:
- Jeder erfolgreiche Login erhoeht den Login-Zaehler des Profils.
- Der Login-Zaehler wird gespeichert.
- Der Login-Zaehler wird im Benutzerbereich angezeigt.

## US-07 - Fitness-Level

Als Benutzer moechte ich ein Fitness-Level haben, das nach erfolgreich abgeschlossenen Trainings steigt, damit ich Fortschritt sehe.

Akzeptanzkriterien:
- Jeder Benutzer startet bei Level 1.
- Nach Abschluss eines kompletten Trainingssets steigt das Level.
- Hoehere Level verlangen mehr Wiederholungen.
- Das Level wird gespeichert und beim naechsten Login geladen.

## US-08 - Wiederholungsziel pro Level

Als Benutzer moechte ich ein Wiederholungsziel pro Uebung sehen, damit ich weiss, wann ein Set abgeschlossen ist.

Akzeptanzkriterien:
- Level 1 startet zum Beispiel mit 5 Wiederholungen pro Uebung.
- Pro Level steigt das Ziel um 5 Wiederholungen oder wird durch einen Trainerwert gesetzt.
- Die App zeigt aktuelle Wiederholungen und Zielwiederholungen an.

## US-09 - Uebungsauswahl

Als Benutzer moechte ich zwischen mehreren Uebungen waehlen koennen, damit ich mein Training steuern kann.

Akzeptanzkriterien:
- Die App bietet mindestens drei Uebungen an.
- Die App enthaelt Hand Weight Lifting.
- Die App enthaelt Jumping Tracks.
- Die App enthaelt eine dritte selbst gewaehlt Uebung, zum Beispiel Arm Raises oder Push-ups.
- Alternativ kann ein vordefinierter sequentieller Trainingsplan gestartet werden.

## US-10 - Hand Weight Lifting erkennen

Als Benutzer moechte ich Handgewicht-Hebe-Bewegungen ausfuehren, damit die App jede Wiederholung erkennt und zaehlt.

Akzeptanzkriterien:
- Die App erkennt die relevante Hebe-Geste ueber Kamera/Gestenerkennung.
- Jede gueltige Wiederholung wird genau einmal gezaehlt.
- Ungueltige oder unvollstaendige Bewegungen werden nicht als Wiederholung gezaehlt.
- Der aktuelle Zaehler wird waehrend der Uebung angezeigt.

## US-11 - Jumping Tracks erkennen

Als Benutzer moechte ich Spruenge auf der Stelle machen, damit die App meine Spruenge erkennt und zaehlt.

Akzeptanzkriterien:
- Die App erkennt Sprungbewegungen im Kamerabild.
- Jeder gueltige Sprung wird als Wiederholung gezaehlt.
- Die App zeigt Fortschritt und Ziel der Uebung an.

## US-12 - Dritte Uebung erkennen

Als Benutzer moechte ich eine dritte Uebung ausfuehren, damit die App ein vollstaendigeres Training bietet.

Akzeptanzkriterien:
- Die Gruppe waehlt eine dritte Uebung, zum Beispiel Arm Raises oder Push-ups.
- Die App erkennt die Bewegung der gewaehlten Uebung.
- Jede gueltige Wiederholung wird gezaehlt.
- Die Uebung ist in der Uebungsauswahl sichtbar.

## US-13 - Trainingsfortschritt speichern

Als Benutzer moechte ich, dass mein Trainingsfortschritt gespeichert wird, damit ich spaeter weitermachen kann.

Akzeptanzkriterien:
- Die App speichert Level, Score, Login-Zaehler und abgeschlossene Uebungen.
- Die Daten werden beim naechsten Login wieder geladen.
- Fortschritt wird pro Benutzerprofil getrennt gespeichert.

## US-14 - Score-System

Als Benutzer moechte ich Punkte fuer abgeschlossene Uebungen erhalten, damit meine Leistung messbar wird.

Akzeptanzkriterien:
- Erfolgreiche Wiederholungen oder abgeschlossene Sets erhoehen den Score.
- Der Score wird im Benutzerbereich angezeigt.
- Der Score wird dauerhaft gespeichert.

## US-15 - Benutzerfreundliche Rueckmeldungen

Als Benutzer moechte ich klare Meldungen erhalten, damit ich weiss, was die App gerade erkennt oder von mir erwartet.

Akzeptanzkriterien:
- Die App zeigt verstaendliche Fehler bei fehlender Kamera, fehlendem Gesicht oder nicht erkanntem Profil.
- Die App zeigt waehrend Uebungen den aktuellen Zustand an.
- Meldungen sind kurz, eindeutig und fuer normale Benutzer verstaendlich.

## US-16 - Gesten-Feedback im Kamerabild

Als Benutzer moechte ich im Kamerabild sehen, welche Gesten erkannt werden, damit ich meine Bewegungen korrigieren kann.

Akzeptanzkriterien:
- Erkannte Gesichter werden im Livebild markiert.
- Erkannte Handgesten werden im Livebild angezeigt.
- Die Anzeige enthaelt Confidence- oder Statusinformationen.

## US-17 - Anpassbarkeit

Als Trainer oder Benutzer moechte ich Trainingswerte anpassen koennen, damit die Schwierigkeit zur Person passt.

Akzeptanzkriterien:
- Wiederholungsziele koennen initial gesetzt oder durch Level automatisch gesteigert werden.
- Die App kann unterschiedliche Benutzerprofile getrennt verwalten.
- Die App ist so aufgebaut, dass weitere Uebungen spaeter ergaenzt werden koennen.

## US-18 - Regeln und Anleitung

Als Benutzer moechte ich klare Regeln fuer die Uebungen sehen, damit ich weiss, wie eine Wiederholung korrekt ausgefuehrt wird.

Akzeptanzkriterien:
- Jede Uebung hat eine kurze Regelbeschreibung.
- Die App erklaert, wann eine Wiederholung zaehlt.
- Die Regeln sind in der Trainingsansicht erreichbar.

## US-19 - Interface-Bewertung vorbereiten

Als Projektgruppe moechte ich die Interface-Qualitaet anhand von Heuristiken bewerten koennen, damit die Bewertungskriterien der Aufgabe erfuellt werden.

Akzeptanzkriterien:
- Es gibt eine kurze Liste relevanter Designprinzipien oder Heuristiken.
- Die Gesteninteraktion wird in Bezug auf Benutzerfreundlichkeit bewertet.
- Probleme und Verbesserungen werden dokumentiert.

## US-20 - Abgabe vorbereiten

Als Projektgruppe moechte ich die Projektabgabe strukturiert vorbereiten, damit die geforderten Abgabeordner vorhanden sind.

Akzeptanzkriterien:
- Es gibt einen Ordner fuer die ausfuehrbare Version.
- Es gibt einen Ordner fuer den gesamten Source Code.
- Es gibt einen Ordner fuer die Praesentation.
- Die Abgabe kann als ZIP-Datei erstellt werden.
