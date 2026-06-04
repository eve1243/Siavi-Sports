# SIAVI Local Recognition

Lokale Webcam-App fuer Gesichtserkennung und Gestenerkennung auf macOS und Windows.

Keine React-App und kein Browser-ML. Die App oeffnet ein normales OpenCV-Fenster oder eine lokale Web-UI.

## Stack

- Python 3.11 empfohlen
- OpenCV fuer Webcam, Fenster und Overlay
- OpenCV-Fallback fuer sichtbare Face Boxes
- optional InsightFace fuer gute Face Recognition mit Embeddings
- MediaPipe Hands fuer vortrainierte Handpunkte
- Regelbasierte Gesten aus Fingerpositionen, kein Training noetig
- MediaPipe Pose plus lokale Exercise-KI fuer Fitnessuebungen
- kNN-Modell, das aus selbst gespeicherten Uebungs-Samples mitlernt
- Alles laeuft lokal auf deinem Rechner

## Wichtig: Python-Version

Bitte fuer Windows und MacBook **Python 3.11** verwenden.

Python 3.13 macht mit MediaPipe Probleme, weil die alte `mp.solutions.hands` API dort nicht mehr vorhanden ist. Dann startet die Kamera kurz und geht nach ca. 1 Sekunde wieder aus.

Pruefen:

```bash
python --version
```

Richtig ist zum Beispiel:

```text
Python 3.11.x
```

Windows kann alle installierten Python-Versionen so anzeigen:

```powershell
py -0p
```

Wenn Python 3.11 fehlt, installiere Python 3.11 von `python.org` oder mit winget:

```powershell
winget install Python.Python.3.11
```

Danach PowerShell neu oeffnen und pruefen:

```powershell
py -3.11 --version
```

## Installation

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Windows PowerShell:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Optional fuer staerkere Face Recognition mit Embeddings:

```bash
pip install -r requirements-face-recognition.txt
```

Auf macOS musst du dem Terminal, VS Code oder PyCharm Kamera-Zugriff erlauben:

`Systemeinstellungen > Datenschutz & Sicherheit > Kamera`

Auf Windows muss die Kamera fuer Desktop-Apps erlaubt sein:

`Einstellungen > Datenschutz & Sicherheit > Kamera > Desktop-Apps den Zugriff auf die Kamera erlauben`

## Start Auf Windows

Oeffne PowerShell im Projektordner und fuehre diese Befehle aus:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python src\web_app.py
```

Das startet das Python-Backend fuer Kamera, Face Recognition und Datenbank.

In einem zweiten PowerShell-Terminal das Next.js-Frontend starten:

```powershell
cd frontend
npm install
npm run dev
```

Dann im Browser oeffnen:

```text
http://127.0.0.1:3000
```

Wenn PowerShell das Aktivieren der venv blockiert, einmalig ausfuehren:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
.\.venv\Scripts\Activate.ps1
```

Wenn du schon eine `.venv` mit Python 3.13 erstellt hast, loesche sie und erstelle sie neu:

```powershell
Remove-Item -Recurse -Force .venv
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Windows Kamera Problem

Wenn beim Start `Could not open webcam index 0` kommt oder das Kamerabild schwarz bleibt:

1. Windows Kamera-Zugriff erlauben:

```text
Einstellungen > Datenschutz & Sicherheit > Kamera
```

Dort aktivieren:

- `Kamerazugriff`
- `Apps den Zugriff auf die Kamera erlauben`
- `Desktop-Apps den Zugriff auf die Kamera erlauben`

2. Andere Kamera-Apps schliessen.

Schliesse Teams, Zoom, Discord, Browser-Tabs mit Kamera, Windows Kamera-App und OBS. Danach die SIAVI-App neu starten.

3. Kamera-Index testen.

In `config.yaml` steht standardmaessig:

```yaml
camera:
  index: 0
```

Wenn du mehrere Kameras hast, probiere:

```yaml
camera:
  index: 1
```

Danach wieder starten:

```powershell
python src\web_app.py
```

4. Kamera-Backend wechseln.

Standard ist:

```yaml
camera:
  backend: auto
```

Unter Windows nutzt `auto` DirectShow. Wenn die Kamera damit nicht startet, probiere in `config.yaml`:

```yaml
camera:
  backend: msmf
```

Wenn `msmf` nicht klappt, wieder zurueck auf:

```yaml
camera:
  backend: dshow
```

5. OpenCV-Fenster direkt testen.

Wenn die Web-UI nicht startet, teste zuerst das einfache Kamera-Fenster:

```powershell
python src\main.py
```

6. Notfalls Aufloesung weiter senken.

Manche Windows-Webcams starten stabiler mit kleinerer Aufloesung:

```yaml
camera:
  width: 640
  height: 480
  target_fps: 30
```

Wenn es immer noch laggt:

```yaml
camera:
  width: 320
  height: 240
  target_fps: 30
```

## Start Auf macOS / Linux

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python src/web_app.py
```

Das startet das Python-Backend fuer Kamera, Face Recognition und Datenbank.

In einem zweiten Terminal das Next.js-Frontend starten:

```bash
cd frontend
npm install
npm run dev
```

Wenn du schon eine `.venv` mit einer falschen Python-Version erstellt hast:

```bash
rm -rf .venv
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Dann oeffnen:

```text
http://127.0.0.1:3000
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

Mit installiertem InsightFace werden Face Embeddings lokal in `data/faces.sqlite` gespeichert. Ohne InsightFace nutzt die App den OpenCV-Fallback, wenn `opencv-contrib-python` installiert ist.

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

## Uebungs-KI Mit Lokal Lernendem Modell

Fuer Aufgabe 3 erkennt die App jetzt auch Fitnessuebungen ueber den ganzen Koerper. Dafuer wird `MediaPipe Pose` verwendet. Die App startet sofort mit einfachen Regeln fuer:

- `weight_lift`
- `jump`
- `arm_raises`

Nach dem FaceID-Login erscheint im Trainingsbereich die Box `Exercise AI`. Dort siehst du:

- erkannte Uebung
- Quelle der Erkennung (`rules` oder `learned`)
- Wiederholungen
- Anzahl gespeicherter Trainings-Samples

Damit die KI mit deinem Projekt mitlernt:

1. Starte Backend und Frontend.
2. Logge dich per FaceID ein.
3. Stelle dich so vor die Kamera, dass der ganze Oberkoerper sichtbar ist.
4. Waehle in `Exercise AI` das richtige Label, z.B. `weight_lift`, `jump` oder `arm_raises`.
5. Klicke mehrmals auf `Save pose`, waehrend du verschiedene Positionen der Uebung zeigst.
6. Nach mindestens 3 Samples pro Label verwendet die App automatisch das gelernte Modell.

Die Trainingsdaten werden lokal in `data/exercise_samples.csv` gespeichert. Das daraus gelernte Modell liegt in `data/exercise_knn.npz`. Beide Dateien bleiben lokal und werden wegen `.gitignore` nicht ins Repository committed.

## Config

Alles Wichtige steht in `config.yaml`:

- Kamera-Index
- Aufloesung
- Kamera-Backend (`auto` nutzt unter Windows DirectShow)
- Capture-Buffer
- Ziel-FPS
- optionales InsightFace-Modell
- Recognition Threshold
- SQLite-Datenbank fuer mehrere Profile
- Detection-Intervalle fuer bessere FPS
- Hand Tracking Confidence
- Exercise-AI Samples und Modellpfad
- Snapshot-Ordner

Fuer mehr FPS ist die Standard-Aufloesung auf `640x480` mit `30 FPS` gesetzt. Face Detection laeuft standardmaessig nur jedes dritte Frame, Gestenerkennung jedes zweite Frame. Wenn dein Rechner stark genug ist, kannst du `process_every_n_frames` wieder niedriger setzen.

Registrierte Personen werden in `data/faces.sqlite` gespeichert. Mehrere Personen koennen sich nacheinander registrieren. Wenn dieselbe Person mehrmals registriert wird, wird ein weiteres Face-Sample gespeichert und die Erkennung wird robuster.

## Stabile Paket-Versionen

Die Versionen in `requirements.txt` sind absichtlich fest gepinnt, damit Windows und MacBook dieselben Bibliotheken verwenden:

```text
numpy==1.26.4
opencv-contrib-python==4.10.0.84
mediapipe==0.10.14
PyYAML==6.0.2
fastapi==0.115.6
uvicorn[standard]==0.30.6
```

Optional fuer Face Recognition:

```text
insightface==0.7.3
onnxruntime==1.19.2
```

## Falls Beim Start Ein Fehler Kommt

Starte zuerst aus dem Projektordner und installiere die Dependencies:

```bash
source .venv/bin/activate
pip install -r requirements.txt
python src/main.py
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python src\main.py
```

Wenn macOS die Kamera blockiert:

`Systemeinstellungen > Datenschutz & Sicherheit > Kamera`
