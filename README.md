# SIAVI Local Recognition

Lokale Webcam-App fuer Gesichtserkennung und Gestenerkennung auf dem MacBook.

Keine React-App und kein Browser-ML. Die App oeffnet ein normales OpenCV-Fenster auf deinem Mac.

## Stack

- Python 3.9+
- OpenCV fuer Webcam, Fenster und Overlay
- OpenCV-Fallback fuer sichtbare Face Boxes
- optional InsightFace fuer gute Face Recognition mit Embeddings
- MediaPipe Hands fuer vortrainierte Handpunkte
- Regelbasierte Gesten aus Fingerpositionen, kein Training noetig
- Alles laeuft lokal auf deinem Rechner

## Installation

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Optional fuer staerkere Face Recognition mit Embeddings:

```bash
pip install -r requirements-face-recognition.txt
```

Auf macOS musst du dem Terminal, VS Code oder PyCharm Kamera-Zugriff erlauben:

`Systemeinstellungen > Datenschutz & Sicherheit > Kamera`

## Start Mit Schoener Login-UI

```bash
source .venv/bin/activate
python src/web_app.py
```

Dann oeffnen:

```text
http://127.0.0.1:8000
```

Die UI zeigt Live-Kamera, Login-Status, registrierte Profile und eine Registrieren-Schaltflaeche.

## Start Als Einfaches OpenCV-Fenster

```bash
python src/main.py
```

Tasten im Kamera-Fenster:

- `q`: beenden
- `r`: aktuell sichtbares Gesicht registrieren
- `s`: Snapshot speichern
- `d`: Debug Overlay umschalten

## Gesicht Registrieren

1. Starte die App.
2. Schau in die Kamera.
3. Druecke `r`.
4. Gib im Terminal den Namen ein.

Mit installiertem InsightFace werden Face Embeddings lokal in `data/faces.json` gespeichert. Ohne InsightFace zeigt die App trotzdem Face Boxes, aber keine echte Personenerkennung.

## Gesten Ohne Training

Du musst kein eigenes Modell trainieren. Die App nutzt vortrainierte Hand-Landmarks und erkennt daraus einfache Gesten:

Gewuenschte Gesture-Klassen:

- `open_hand`
- `fist`
- `thumbs_up`
- `peace`
- `stop`
- `pointing`
- `unknown`

Wenn `mediapipe` nicht installiert ist, startet die App trotzdem und zeigt im Overlay den Hinweis `install mediapipe`.

## Config

Alles Wichtige steht in `config.yaml`:

- Kamera-Index
- Aufloesung
- optionales InsightFace-Modell
- Recognition Threshold
- Hand Tracking Confidence
- Snapshot-Ordner

## Falls Beim Start Ein Fehler Kommt

Starte zuerst aus dem Projektordner und installiere die Dependencies:

```bash
source .venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

Wenn macOS die Kamera blockiert:

`Systemeinstellungen > Datenschutz & Sicherheit > Kamera`
