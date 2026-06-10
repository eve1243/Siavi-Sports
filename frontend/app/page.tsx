"use client";

import { useEffect, useMemo, useState } from "react";

type Language = "en" | "de" | "pt" | "sr" | "zh" | "fr" | "ta" | "ki";

type Profile = {
  name: string;
  age: number | null;
  gender: string | null;
  level: number;
  score: number;
  loginCount: number;
  completedSets: number;
};

type SignInCandidate = {
  name: string;
};

type Gesture = {
  label: string;
  confidence: number;
  handedness: string;
};

type Exercise = {
  label: string;
  confidence: number;
  source: string;
  state: string;
  repetitions: number;
};

type Workout = {
  exercise: string;
  currentReps: number;
  targetReps: number;
  targetSource: string;
  state: string;
  message: string;
  guidance: string;
  completed: boolean;
};

type StatusResponse = {
  authenticated: boolean;
  authenticatedName: string | null;
  activeProfile: Profile | null;
  error: string | null;
  exercise: Exercise;
  exerciseError: string | null;
  exerciseLabels: string[];
  exerciseReady: boolean;
  exerciseSampleCount: number;
  faceCount: number;
  fps: number;
  gestureCount: number;
  gestureError: string | null;
  gestures: Gesture[];
  recognitionReady: boolean;
  registrationSamplesReady: number;
  minRegistrationSamples: number;
  profiles: Profile[];
  signInCandidates: SignInCandidate[];
  workout: Workout;
};

const translations = {
  en: {
    appTitle: "SportsAI Coach",
    appSubtitle: "AI-supported sports training with secure face login and motion tracking.",
    signedOut: "Signed out",
    signedIn: "Signed in",
    signIn: "Sign in",
    register: "Register",
    signInTitle: "Sign in with face recognition",
    signInCopy: "Look into the camera. If more than one person is recognized, choose who should sign in.",
    recognizedFaceLabel: "Recognized face",
    signInButton: "Sign in",
    registerTitle: "Create profile",
    registerCopy: "Enter your profile details and keep your face visible.",
    nameLabel: "Name",
    ageLabel: "Age",
    genderLabel: "Gender",
    genderFemale: "Female",
    genderMale: "Male",
    genderDiverse: "Diverse",
    genderPrivate: "Prefer not to say",
    registerButton: "Register profile",
    statusTitle: "Status",
    trainingCopy: "This training area is visible after secure login.",
    bioAge: "Age",
    bioGender: "Gender",
    fitnessLevel: "Level",
    score: "Score",
    loginCount: "Logins",
    completedSets: "Sets",
    currentGesture: "Current gesture",
    cameraFps: "Camera FPS",
    warmupTitle: "Warm-up",
    warmupCopy: "Keep your hands visible and follow the gesture feedback.",
    gestureTitle: "Gesture practice",
    gestureCopy: "Try open hand, fist, thumbs up, peace and pointing.",
    sessionTitle: "Session",
    sessionCopy: "Training logic can be expanded here next.",
    exerciseAiTitle: "Exercise AI",
    exerciseAiCopy: "Current exercise recognition with local learning.",
    exerciseLabel: "Exercise",
    exerciseSource: "Source",
    exerciseReps: "Reps",
    exerciseSamples: "Samples",
    workoutTarget: "Target",
    workoutState: "Set",
    targetMode: "Target mode",
    customTargetLabel: "Custom repetition target",
    levelTargetPlaceholder: "Level target",
    defaultExerciseGuidance: "Choose an exercise, keep your full body visible, then start a set.",
    invalidTargetMessage: "Target must be a whole number from 1 to 100.",
    moveStartGuidance: "Show your full body and move into the exercise start position.",
    wrongExerciseGuidance: "That movement does not match the selected exercise. Return to the selected exercise start position.",
    noRepCountedMessage: "No repetition counted yet.",
    restGuidance: "Set complete. Rest briefly or choose the next exercise.",
    curlUpGuidance: "Keep the elbow near your body and curl one hand toward the shoulder.",
    curlDownGuidance: "Extend the elbow before the next curl.",
    jumpUpGuidance: "Jump clearly upward from the baseline so the camera can count it.",
    jumpDownGuidance: "Land and stand still before the next Jumping Jack.",
    armRaiseUpGuidance: "Raise both hands above shoulder height together.",
    armRaiseDownGuidance: "Lower both hands below shoulder height before the next rep.",
    squatUpGuidance: "Bend your knees into a controlled squat.",
    squatDownGuidance: "Stand tall again before the next squat.",
    sideRaiseUpGuidance: "Raise both arms sideways to shoulder height.",
    sideRaiseDownGuidance: "Lower both arms before the next side raise.",
    genericExerciseGuidance: "Keep your full body visible and follow the exercise rule.",
    trainingTitle: "Training",
    startSet: "Start set",
    savePose: "Save pose",
    trainModel: "Train model",
    languageSelect: "Language",
    cameraAlt: "Live camera with sports tracking overlay",
    workoutProgressLabel: "Workout progress",
    exerciseSelectLabel: "Exercise",
    exerciseExampleAlt: "exercise example",
    unknown: "unknown",
    noneValue: "none",
    idle: "idle",
    running: "running",
    completed: "completed",
    up: "up",
    down: "down",
    rules: "rules",
    model: "model",
    level: "level",
    custom: "custom",
    openHand: "open hand",
    fist: "fist",
    thumbsUp: "thumbs up",
    peace: "peace",
    pointing: "pointing",
    handCurl: "Hand Curling",
    jumpExercise: "Jump",
    armRaises: "Arm raises",
    squatExercise: "Squat",
    sideArmRaises: "Side arm raises",
    handCurlRule: "Start with the elbow extended. Curl one hand toward the shoulder, then extend the elbow again before the next rep.",
    jumpRule: "Stand still between jumps. A rep counts when both ankles move clearly upward from the baseline.",
    armRaisesRule: "Start with both arms down. Raise both hands above shoulder height, then lower again.",
    squatRule: "Stand upright. Bend your knees into a squat, then stand tall again before the next rep.",
    sideArmRaisesRule: "Start with arms down. Raise both arms out to shoulder height, then lower again.",
    backendDown: "Backend is not running on http://127.0.0.1:8000",
    selectExerciseMessage: "Select an exercise and start a set.",
    noFaceVisibleMessage: "No face is visible. Look into the camera and try again.",
    noRegisteredFaceMessage: "No registered face recognized yet.",
    signInBeforeWorkoutMessage: "Sign in before starting a workout.",
    signInBeforeProgressMessage: "Sign in before saving progress.",
    chooseExerciseMessage: "Choose hand curling, jump, arm raises, squat or side arm raises.",
    progressSavedMessage: "Progress saved.",
    signedOutMessage: "Signed out.",
    welcomeBackPrefix: "Welcome back",
    registeredSuffix: "has been registered. Select the recognized face to sign in.",
    recognizedPrefix: "Recognized",
    notPrefix: "not",
    trainedPrefix: "Trained on",
    trainedSuffix: "exercise samples.",
    setStartedPrefix: "Set started",
    waitingForPrefix: "Waiting for",
    repsSuffix: "reps.",
    setCompletePrefix: "Set complete.",
    scoreAndLevelUpSuffix: "score and level up.",
    logout: "Log out",
    waiting: "Waiting for camera...",
    enterName: "Please enter your name.",
    enterAge: "Please enter a valid age.",
    noProfiles: "none",
    yes: "yes",
    no: "no",
    faces: "Faces",
    gestures: "Gestures",
    profiles: "Profiles",
    faceIdReady: "Face login ready",
    noRecognizedFace: "No recognized face yet",
    detectedUser: "Detected",
    loginReadyHint: "Camera is ready. Keep your face centered and continue.",
    loginWaitingHint: "Waiting for the camera. Check camera permission if this takes too long.",
  },
  de: {
    appTitle: "SportsAI Coach",
    appSubtitle: "KI-gestuetztes Sporttraining mit sicherem Gesichtslogin und Bewegungserkennung.",
    signedOut: "Abgemeldet",
    signedIn: "Angemeldet",
    signIn: "Einloggen",
    register: "Registrieren",
    signInTitle: "Mit Gesichtserkennung einloggen",
    signInCopy: "Schau in die Kamera. Wenn mehrere Personen erkannt werden, waehle aus, wer sich einloggen soll.",
    recognizedFaceLabel: "Erkanntes Gesicht",
    signInButton: "Einloggen",
    registerTitle: "Profil erstellen",
    registerCopy: "Gib deine Profildaten ein und halte dein Gesicht sichtbar.",
    nameLabel: "Name",
    ageLabel: "Alter",
    genderLabel: "Geschlecht",
    genderFemale: "Weiblich",
    genderMale: "Maennlich",
    genderDiverse: "Divers",
    genderPrivate: "Keine Angabe",
    registerButton: "Profil registrieren",
    statusTitle: "Status",
    trainingCopy: "Dieser Trainingsbereich ist nach dem sicheren Login sichtbar.",
    bioAge: "Alter",
    bioGender: "Geschlecht",
    fitnessLevel: "Stufe",
    score: "Punkte",
    loginCount: "Logins",
    completedSets: "Saetze",
    currentGesture: "Aktuelle Geste",
    cameraFps: "Kamera-FPS",
    warmupTitle: "Aufwaermen",
    warmupCopy: "Halte deine Haende sichtbar und folge dem Gesten-Feedback.",
    gestureTitle: "Gestenuebung",
    gestureCopy: "Probiere offene Hand, Faust, Daumen hoch, Friedenszeichen und Zeigen.",
    sessionTitle: "Einheit",
    sessionCopy: "Die Trainingslogik kann hier weiter ausgebaut werden.",
    exerciseAiTitle: "Uebungs-KI",
    exerciseAiCopy: "Aktuelle Uebungserkennung mit lokalem Mitlernen.",
    exerciseLabel: "Uebung",
    exerciseSource: "Quelle",
    exerciseReps: "Wdh.",
    exerciseSamples: "Beispiele",
    workoutTarget: "Ziel",
    workoutState: "Satz",
    targetMode: "Zielmodus",
    customTargetLabel: "Eigenes Wiederholungsziel",
    levelTargetPlaceholder: "Stufenziel",
    defaultExerciseGuidance: "Waehle eine Uebung, halte den ganzen Koerper sichtbar und starte dann einen Satz.",
    invalidTargetMessage: "Das Ziel muss eine ganze Zahl von 1 bis 100 sein.",
    moveStartGuidance: "Zeige deinen ganzen Koerper und gehe in die Startposition der Uebung.",
    wrongExerciseGuidance: "Diese Bewegung passt nicht zur ausgewaehlten Uebung. Geh zur Startposition der ausgewaehlten Uebung zurueck.",
    noRepCountedMessage: "Noch keine Wiederholung gezaehlt.",
    restGuidance: "Satz abgeschlossen. Ruh dich kurz aus oder waehle die naechste Uebung.",
    curlUpGuidance: "Halte den Ellenbogen nah am Koerper und beuge eine Hand zur Schulter.",
    curlDownGuidance: "Strecke den Ellenbogen vor dem naechsten Curl.",
    jumpUpGuidance: "Springe klar von der Basislinie nach oben, damit die Kamera zaehlen kann.",
    jumpDownGuidance: "Lande und stehe kurz ruhig vor dem naechsten Sprung.",
    armRaiseUpGuidance: "Hebe beide Haende zusammen ueber Schulterhoehe.",
    armRaiseDownGuidance: "Senke beide Haende unter Schulterhoehe vor der naechsten Wiederholung.",
    squatUpGuidance: "Beuge die Knie in eine kontrollierte Kniebeuge.",
    squatDownGuidance: "Richte dich vor der naechsten Kniebeuge wieder ganz auf.",
    sideRaiseUpGuidance: "Hebe beide Arme seitlich bis auf Schulterhoehe.",
    sideRaiseDownGuidance: "Senke beide Arme vor dem naechsten seitlichen Armheben.",
    genericExerciseGuidance: "Halte deinen ganzen Koerper sichtbar und folge der Uebungsregel.",
    trainingTitle: "Training",
    startSet: "Satz starten",
    savePose: "Position speichern",
    trainModel: "Modell trainieren",
    languageSelect: "Sprache",
    cameraAlt: "Live-Kamera mit Sporttracking-Overlay",
    workoutProgressLabel: "Trainingsfortschritt",
    exerciseSelectLabel: "Uebung",
    exerciseExampleAlt: "Uebungsbeispiel",
    unknown: "unbekannt",
    noneValue: "keine",
    idle: "bereit",
    running: "laeuft",
    completed: "abgeschlossen",
    up: "oben",
    down: "unten",
    rules: "Regeln",
    model: "Modell",
    level: "Stufe",
    custom: "eigenes Ziel",
    openHand: "offene Hand",
    fist: "Faust",
    thumbsUp: "Daumen hoch",
    peace: "Friedenszeichen",
    pointing: "Zeigen",
    handCurl: "Hand Curling",
    jumpExercise: "Sprung",
    armRaises: "Armheben",
    squatExercise: "Kniebeuge",
    sideArmRaises: "Seitliches Armheben",
    handCurlRule: "Starte mit gestrecktem Ellenbogen. Beuge eine Hand zur Schulter und strecke den Ellenbogen vor der naechsten Wiederholung wieder.",
    jumpRule: "Stehe zwischen den Spruengen ruhig. Eine Wiederholung zaehlt, wenn beide Knoechel klar von der Basislinie nach oben gehen.",
    armRaisesRule: "Starte mit beiden Armen unten. Hebe beide Haende ueber Schulterhoehe und senke sie wieder.",
    squatRule: "Stehe aufrecht. Beuge die Knie in eine Kniebeuge und richte dich vor der naechsten Wiederholung wieder auf.",
    sideArmRaisesRule: "Starte mit den Armen unten. Hebe beide Arme seitlich bis auf Schulterhoehe und senke sie wieder.",
    backendDown: "Backend laeuft nicht auf http://127.0.0.1:8000",
    selectExerciseMessage: "Waehle eine Uebung und starte einen Satz.",
    noFaceVisibleMessage: "Kein Gesicht sichtbar. Schau in die Kamera und versuche es erneut.",
    noRegisteredFaceMessage: "Noch kein registriertes Gesicht erkannt.",
    signInBeforeWorkoutMessage: "Logge dich ein, bevor du ein Training startest.",
    signInBeforeProgressMessage: "Logge dich ein, bevor du Fortschritt speicherst.",
    chooseExerciseMessage: "Waehle Hand Curling, Sprung, Armheben, Kniebeuge oder seitliches Armheben.",
    progressSavedMessage: "Fortschritt gespeichert.",
    signedOutMessage: "Abgemeldet.",
    welcomeBackPrefix: "Willkommen zurueck",
    registeredSuffix: "wurde registriert. Waehle das erkannte Gesicht aus, um dich einzuloggen.",
    recognizedPrefix: "Erkannt wurde",
    notPrefix: "nicht",
    trainedPrefix: "Trainiert mit",
    trainedSuffix: "Uebungs-Samples.",
    setStartedPrefix: "Satz gestartet",
    waitingForPrefix: "Warte auf",
    repsSuffix: "Wiederholungen.",
    setCompletePrefix: "Satz abgeschlossen.",
    scoreAndLevelUpSuffix: "Punkte und Stufenaufstieg.",
    logout: "Ausloggen",
    waiting: "Warte auf Kamera...",
    enterName: "Bitte gib deinen Namen ein.",
    enterAge: "Bitte gib ein gueltiges Alter ein.",
    noProfiles: "keine",
    yes: "ja",
    no: "nein",
    faces: "Gesichter",
    gestures: "Gesten",
    profiles: "Profile",
    faceIdReady: "Gesichtslogin bereit",
    noRecognizedFace: "Noch kein Gesicht erkannt",
    detectedUser: "Erkannt",
    loginReadyHint: "Kamera ist bereit. Halte dein Gesicht mittig und fahre fort.",
    loginWaitingHint: "Warte auf die Kamera. Pruefe die Kameraberechtigung, wenn es zu lange dauert.",
  },
  pt: {
    appTitle: "SportsAI Coach",
    appSubtitle: "Treino desportivo com IA, login facial seguro e acompanhamento de movimentos.",
    signedOut: "Sessao terminada",
    signedIn: "Sessao iniciada",
    signIn: "Entrar",
    register: "Registar",
    signInTitle: "Entrar com reconhecimento facial",
    signInCopy: "Olha para a camara. Se mais de uma pessoa for reconhecida, escolhe quem deve entrar.",
    recognizedFaceLabel: "Rosto reconhecido",
    signInButton: "Entrar",
    registerTitle: "Criar perfil",
    registerCopy: "Preenche os dados e mantem o rosto visivel.",
    nameLabel: "Nome",
    ageLabel: "Idade",
    genderLabel: "Genero",
    genderFemale: "Feminino",
    genderMale: "Masculino",
    genderDiverse: "Diverso",
    genderPrivate: "Prefiro nao dizer",
    registerButton: "Registar perfil",
    statusTitle: "Estado",
    trainingCopy: "Esta area de treino aparece depois do login seguro.",
    bioAge: "Idade",
    bioGender: "Genero",
    fitnessLevel: "Nivel",
    score: "Pontuacao",
    loginCount: "Logins",
    currentGesture: "Gesto atual",
    cameraFps: "FPS da camara",
    warmupTitle: "Aquecimento",
    warmupCopy: "Mantem as maos visiveis e segue o feedback dos gestos.",
    gestureTitle: "Pratica de gestos",
    gestureCopy: "Experimenta mao aberta, punho, polegar, paz e apontar.",
    sessionTitle: "Sessao",
    sessionCopy: "A logica de treino pode ser expandida aqui.",
    completedSets: "Series",
    exerciseAiTitle: "IA de exercicio",
    exerciseAiCopy: "Reconhecimento atual do exercicio com aprendizagem local.",
    exerciseLabel: "Exercicio",
    exerciseSource: "Origem",
    exerciseReps: "Reps",
    exerciseSamples: "Amostras",
    workoutTarget: "Meta",
    workoutState: "Serie",
    targetMode: "Modo da meta",
    customTargetLabel: "Meta personalizada de repeticoes",
    levelTargetPlaceholder: "Meta do nivel",
    defaultExerciseGuidance: "Escolhe um exercicio, mantem o corpo todo visivel e inicia uma serie.",
    invalidTargetMessage: "A meta tem de ser um numero inteiro de 1 a 100.",
    moveStartGuidance: "Mostra o corpo todo e entra na posicao inicial do exercicio.",
    wrongExerciseGuidance: "Esse movimento nao corresponde ao exercicio escolhido. Volta a posicao inicial do exercicio escolhido.",
    noRepCountedMessage: "Nenhuma repeticao contada ainda.",
    restGuidance: "Serie concluida. Descansa um pouco ou escolhe o proximo exercicio.",
    curlUpGuidance: "Mantem o cotovelo perto do corpo e leva uma mao em direcao ao ombro.",
    curlDownGuidance: "Estende o cotovelo antes do proximo curl.",
    jumpUpGuidance: "Salta claramente acima da linha de base para a camara contar.",
    jumpDownGuidance: "Aterra e fica parado antes do proximo salto.",
    armRaiseUpGuidance: "Levanta as duas maos acima dos ombros ao mesmo tempo.",
    armRaiseDownGuidance: "Baixa as duas maos abaixo dos ombros antes da proxima repeticao.",
    squatUpGuidance: "Dobra os joelhos num agachamento controlado.",
    squatDownGuidance: "Fica novamente em pe antes do proximo agachamento.",
    sideRaiseUpGuidance: "Levanta os dois bracos de lado ate a altura dos ombros.",
    sideRaiseDownGuidance: "Baixa os dois bracos antes da proxima elevacao lateral.",
    genericExerciseGuidance: "Mantem o corpo todo visivel e segue a regra do exercicio.",
    trainingTitle: "Treino",
    startSet: "Iniciar serie",
    savePose: "Guardar pose",
    trainModel: "Treinar modelo",
    languageSelect: "Idioma",
    cameraAlt: "Camara ao vivo com sobreposicao de treino desportivo",
    workoutProgressLabel: "Progresso do treino",
    exerciseSelectLabel: "Exercicio",
    exerciseExampleAlt: "exemplo do exercicio",
    unknown: "desconhecido",
    noneValue: "nenhum",
    idle: "pronto",
    running: "em curso",
    completed: "concluido",
    up: "em cima",
    down: "em baixo",
    rules: "regras",
    model: "modelo",
    level: "nivel",
    custom: "personalizado",
    openHand: "mao aberta",
    fist: "punho",
    thumbsUp: "polegar para cima",
    peace: "paz",
    pointing: "apontar",
    handCurl: "Curl de mao",
    jumpExercise: "Salto",
    armRaises: "Elevacao de bracos",
    squatExercise: "Agachamento",
    sideArmRaises: "Elevacao lateral de bracos",
    handCurlRule: "Comeca com o cotovelo estendido. Leva uma mao ao ombro e volta a estender antes da proxima repeticao.",
    jumpRule: "Fica parado entre saltos. Uma repeticao conta quando os tornozelos sobem claramente da linha de base.",
    armRaisesRule: "Comeca com os bracos em baixo. Levanta as duas maos acima dos ombros e baixa novamente.",
    squatRule: "Fica em pe. Dobra os joelhos num agachamento e volta a ficar direito antes da proxima repeticao.",
    sideArmRaisesRule: "Comeca com os bracos em baixo. Levanta os dois bracos de lado ate aos ombros e baixa novamente.",
    backendDown: "O backend nao esta a correr em http://127.0.0.1:8000",
    selectExerciseMessage: "Escolhe um exercicio e inicia uma serie.",
    noFaceVisibleMessage: "Nenhum rosto visivel. Olha para a camara e tenta novamente.",
    noRegisteredFaceMessage: "Nenhum rosto registado reconhecido ainda.",
    signInBeforeWorkoutMessage: "Entra antes de iniciar um treino.",
    signInBeforeProgressMessage: "Entra antes de guardar o progresso.",
    chooseExerciseMessage: "Escolhe curl de mao, salto, elevacao de bracos, agachamento ou elevacao lateral.",
    progressSavedMessage: "Progresso guardado.",
    signedOutMessage: "Sessao terminada.",
    welcomeBackPrefix: "Bem-vindo de volta",
    registeredSuffix: "foi registado. Escolhe o rosto reconhecido para entrar.",
    recognizedPrefix: "Reconhecido",
    notPrefix: "nao",
    trainedPrefix: "Treinado com",
    trainedSuffix: "amostras de exercicio.",
    setStartedPrefix: "Serie iniciada",
    waitingForPrefix: "A espera de",
    repsSuffix: "repeticoes.",
    setCompletePrefix: "Serie concluida.",
    scoreAndLevelUpSuffix: "pontos e subida de nivel.",
    logout: "Sair",
    waiting: "A espera da camara...",
    enterName: "Introduz o teu nome.",
    enterAge: "Introduz uma idade valida.",
    noProfiles: "nenhum",
    yes: "sim",
    no: "nao",
    faces: "Rostos",
    gestures: "Gestos",
    profiles: "Perfis",
    faceIdReady: "Login facial pronto",
    noRecognizedFace: "Nenhum rosto reconhecido ainda",
    detectedUser: "Reconhecido",
    loginReadyHint: "A camara esta pronta. Mantem o rosto centrado e continua.",
    loginWaitingHint: "A espera da camara. Verifica a permissao da camara se demorar muito.",
  },
  sr: {
    appTitle: "SportsAI Coach",
    appSubtitle: "Sportski trening uz AI, bezbednu prijavu licem i pracenje pokreta.",
    signedOut: "Odjavljen",
    signedIn: "Prijavljen",
    signIn: "Prijava",
    register: "Registracija",
    signInTitle: "Prijava prepoznavanjem lica",
    signInCopy: "Pogledaj u kameru. Ako je prepoznato vise osoba, izaberi ko se prijavljuje.",
    recognizedFaceLabel: "Prepoznato lice",
    signInButton: "Prijavi se",
    registerTitle: "Napravi profil",
    registerCopy: "Unesi podatke i drzi lice vidljivo.",
    nameLabel: "Ime",
    ageLabel: "Godine",
    genderLabel: "Pol",
    genderFemale: "Zenski",
    genderMale: "Muski",
    genderDiverse: "Razlicito",
    genderPrivate: "Ne zelim da kazem",
    registerButton: "Registruj profil",
    statusTitle: "Status",
    trainingCopy: "Ovaj trening deo je vidljiv posle bezbedne prijave.",
    bioAge: "Godine",
    bioGender: "Pol",
    fitnessLevel: "Nivo",
    score: "Poeni",
    loginCount: "Prijave",
    currentGesture: "Trenutni gest",
    cameraFps: "FPS kamere",
    warmupTitle: "Zagrevanje",
    warmupCopy: "Drzi ruke vidljive i prati povratne informacije.",
    gestureTitle: "Vezba gestova",
    gestureCopy: "Probaj otvorenu saku, pesnicu, palac gore, mir i pokazivanje.",
    sessionTitle: "Sesija",
    sessionCopy: "Logika treninga moze ovde dalje da se prosiri.",
    completedSets: "Serije",
    exerciseAiTitle: "AI za vezbe",
    exerciseAiCopy: "Trenutno prepoznavanje vezbe sa lokalnim ucenjem.",
    exerciseLabel: "Vezba",
    exerciseSource: "Izvor",
    exerciseReps: "Ponavljanja",
    exerciseSamples: "Uzorci",
    workoutTarget: "Cilj",
    workoutState: "Serija",
    targetMode: "Rezim cilja",
    customTargetLabel: "Prilagodjeni cilj ponavljanja",
    levelTargetPlaceholder: "Cilj nivoa",
    defaultExerciseGuidance: "Izaberi vezbu, drzi celo telo vidljivo i pokreni seriju.",
    invalidTargetMessage: "Cilj mora biti ceo broj od 1 do 100.",
    moveStartGuidance: "Prikazi celo telo i zauzmi pocetni polozaj vezbe.",
    wrongExerciseGuidance: "Taj pokret ne odgovara izabranoj vezbi. Vrati se u pocetni polozaj izabrane vezbe.",
    noRepCountedMessage: "Jos nije izbrojano nijedno ponavljanje.",
    restGuidance: "Serija je zavrsena. Odmori kratko ili izaberi sledecu vezbu.",
    curlUpGuidance: "Drzi lakat blizu tela i savij jednu ruku ka ramenu.",
    curlDownGuidance: "Ispruzi lakat pre sledeceg savijanja.",
    jumpUpGuidance: "Skoci jasno iznad osnovne linije da kamera moze da broji.",
    jumpDownGuidance: "Doskoči i stani mirno pre sledeceg skoka.",
    armRaiseUpGuidance: "Podigni obe sake iznad visine ramena zajedno.",
    armRaiseDownGuidance: "Spusti obe sake ispod ramena pre sledeceg ponavljanja.",
    squatUpGuidance: "Savij kolena u kontrolisan cucanj.",
    squatDownGuidance: "Uspravi se pre sledeceg cucnja.",
    sideRaiseUpGuidance: "Podigni obe ruke u stranu do visine ramena.",
    sideRaiseDownGuidance: "Spusti obe ruke pre sledeceg bocnog podizanja.",
    genericExerciseGuidance: "Drzi celo telo vidljivo i prati pravilo vezbe.",
    trainingTitle: "Trening",
    startSet: "Pokreni seriju",
    savePose: "Sacuvaj pozu",
    trainModel: "Treniraj model",
    languageSelect: "Jezik",
    cameraAlt: "Kamera uzivo sa prikazom pracenja sporta",
    workoutProgressLabel: "Napredak treninga",
    exerciseSelectLabel: "Vezba",
    exerciseExampleAlt: "primer vezbe",
    unknown: "nepoznato",
    noneValue: "nema",
    idle: "spremno",
    running: "u toku",
    completed: "zavrseno",
    up: "gore",
    down: "dole",
    rules: "pravila",
    model: "model",
    level: "nivo",
    custom: "prilagodjeno",
    openHand: "otvorena saka",
    fist: "pesnica",
    thumbsUp: "palac gore",
    peace: "mir",
    pointing: "pokazivanje",
    handCurl: "Savijanje ruke",
    jumpExercise: "Skok",
    armRaises: "Podizanje ruku",
    squatExercise: "Cucanj",
    sideArmRaises: "Bocno podizanje ruku",
    handCurlRule: "Pocni sa ispruzenim laktom. Savij jednu ruku ka ramenu, pa ispruzi lakat pre sledeceg ponavljanja.",
    jumpRule: "Stani mirno izmedju skokova. Ponavljanje se broji kada se oba clanka jasno podignu iznad osnovne linije.",
    armRaisesRule: "Pocni sa rukama dole. Podigni obe sake iznad ramena, pa ih spusti.",
    squatRule: "Stoj uspravno. Savij kolena u cucanj, pa se uspravi pre sledeceg ponavljanja.",
    sideArmRaisesRule: "Pocni sa rukama dole. Podigni obe ruke u stranu do visine ramena, pa ih spusti.",
    backendDown: "Backend ne radi na http://127.0.0.1:8000",
    selectExerciseMessage: "Izaberi vezbu i pokreni seriju.",
    noFaceVisibleMessage: "Lice nije vidljivo. Pogledaj u kameru i pokusaj ponovo.",
    noRegisteredFaceMessage: "Jos nema prepoznatog registrovanog lica.",
    signInBeforeWorkoutMessage: "Prijavi se pre pokretanja treninga.",
    signInBeforeProgressMessage: "Prijavi se pre cuvanja napretka.",
    chooseExerciseMessage: "Izaberi savijanje ruke, skok, podizanje ruku, cucanj ili bocno podizanje ruku.",
    progressSavedMessage: "Napredak je sacuvan.",
    signedOutMessage: "Odjavljen.",
    welcomeBackPrefix: "Dobrodosao nazad",
    registeredSuffix: "je registrovan. Izaberi prepoznato lice za prijavu.",
    recognizedPrefix: "Prepoznato je",
    notPrefix: "ne",
    trainedPrefix: "Trenirano sa",
    trainedSuffix: "uzoraka vezbi.",
    setStartedPrefix: "Serija pokrenuta",
    waitingForPrefix: "Ceka se",
    repsSuffix: "ponavljanja.",
    setCompletePrefix: "Serija zavrsena.",
    scoreAndLevelUpSuffix: "poena i prelazak na visi nivo.",
    logout: "Odjavi se",
    waiting: "Ceka se kamera...",
    enterName: "Unesi ime.",
    enterAge: "Unesi validne godine.",
    noProfiles: "nema",
    yes: "da",
    no: "ne",
    faces: "Lica",
    gestures: "Gestovi",
    profiles: "Profili",
    faceIdReady: "Prijava licem spremna",
    noRecognizedFace: "Jos nema prepoznatog lica",
    detectedUser: "Prepoznato",
    loginReadyHint: "Kamera je spremna. Drzi lice na sredini i nastavi.",
    loginWaitingHint: "Ceka se kamera. Proveri dozvolu za kameru ako traje predugo.",
  },
  zh: {
    appTitle: "SportsAI Coach",
    appSubtitle: "? AI ??????????????????????",
    signedOut: "未登录",
    signedIn: "已登录",
    signIn: "登录",
    register: "注册",
    signInTitle: "????????",
    signInCopy: "???????????????????????",
    recognizedFaceLabel: "识别到的人脸",
    signInButton: "登录",
    registerTitle: "创建资料",
    registerCopy: "输入个人资料，并保持脸部在画面中。",
    nameLabel: "姓名",
    ageLabel: "年龄",
    genderLabel: "性别",
    genderFemale: "女性",
    genderMale: "男性",
    genderDiverse: "多元",
    genderPrivate: "不愿透露",
    registerButton: "注册资料",
    statusTitle: "状态",
    trainingCopy: "?????????????",
    bioAge: "年龄",
    bioGender: "性别",
    fitnessLevel: "等级",
    score: "分数",
    loginCount: "登录次数",
    currentGesture: "当前手势",
    cameraFps: "摄像头 FPS",
    warmupTitle: "热身",
    warmupCopy: "保持双手可见，并跟随手势反馈。",
    gestureTitle: "手势练习",
    gestureCopy: "尝试张开手、握拳、点赞、剪刀手和指向。",
    sessionTitle: "训练",
    sessionCopy: "训练逻辑可以在这里继续扩展。",
    completedSets: "??",
    exerciseAiTitle: "?? AI",
    exerciseAiCopy: "???????????????",
    exerciseLabel: "??",
    exerciseSource: "??",
    exerciseReps: "??",
    exerciseSamples: "??",
    workoutTarget: "??",
    workoutState: "?",
    targetMode: "????",
    customTargetLabel: "???????",
    levelTargetPlaceholder: "????",
    defaultExerciseGuidance: "?????????????????????",
    invalidTargetMessage: "????? 1 ? 100 ??????",
    moveStartGuidance: "??????????????",
    wrongExerciseGuidance: "??????????????????????????",
    noRepCountedMessage: "?????????",
    restGuidance: "??????????????????",
    curlUpGuidance: "???????????????????",
    curlDownGuidance: "????????????",
    jumpUpGuidance: "?????????????????",
    jumpDownGuidance: "???????????????",
    armRaiseUpGuidance: "??????????",
    armRaiseDownGuidance: "????????????????",
    squatUpGuidance: "??????????",
    squatDownGuidance: "???????????",
    sideRaiseUpGuidance: "????????????",
    sideRaiseDownGuidance: "????????????",
    genericExerciseGuidance: "??????????????",
    trainingTitle: "??",
    startSet: "????",
    savePose: "????",
    trainModel: "????",
    languageSelect: "??",
    cameraAlt: "??????????????",
    workoutProgressLabel: "????",
    exerciseSelectLabel: "??",
    exerciseExampleAlt: "????",
    unknown: "??",
    noneValue: "?",
    idle: "??",
    running: "???",
    completed: "???",
    up: "?",
    down: "?",
    rules: "??",
    model: "??",
    level: "??",
    custom: "???",
    openHand: "???",
    fist: "??",
    thumbsUp: "??",
    peace: "????",
    pointing: "??",
    handCurl: "????",
    jumpExercise: "??",
    armRaises: "??",
    squatExercise: "??",
    sideArmRaises: "???",
    handCurlRule: "????????????????????????????????",
    jumpRule: "???????????????????????????",
    armRaisesRule: "??????????????????????",
    squatRule: "??????????????????????",
    sideArmRaisesRule: "???????????????????????",
    backendDown: "???? http://127.0.0.1:8000 ??",
    selectExerciseMessage: "????????????",
    noFaceVisibleMessage: "????????????????",
    noRegisteredFaceMessage: "????????????",
    signInBeforeWorkoutMessage: "??????????",
    signInBeforeProgressMessage: "??????????",
    chooseExerciseMessage: "?????????????????????",
    progressSavedMessage: "??????",
    signedOutMessage: "??????",
    welcomeBackPrefix: "????",
    registeredSuffix: "????????????????",
    recognizedPrefix: "???",
    notPrefix: "??",
    trainedPrefix: "???",
    trainedSuffix: "????????",
    setStartedPrefix: "?????",
    waitingForPrefix: "??",
    repsSuffix: "??",
    setCompletePrefix: "?????",
    scoreAndLevelUpSuffix: "?????",
    logout: "退出登录",
    waiting: "正在等待摄像头...",
    enterName: "请输入姓名。",
    enterAge: "请输入有效年龄。",
    noProfiles: "无",
    yes: "是",
    no: "否",
    faces: "人脸",
    gestures: "手势",
    profiles: "资料",
    faceIdReady: "???????",
    noRecognizedFace: "尚未识别到人脸",
    detectedUser: "???",
    loginReadyHint: "??????????????????????",
    loginWaitingHint: "????????????????????????",
  },
  fr: {
    appTitle: "SportsAI Coach",
    appSubtitle: "Entrainement sportif avec IA, connexion faciale securisee et suivi des mouvements.",
    signedOut: "Déconnecté",
    signedIn: "Connecté",
    signIn: "Connexion",
    register: "Inscription",
    signInTitle: "Connexion par reconnaissance faciale",
    signInCopy: "Regardez la camera. Si plusieurs personnes sont reconnues, choisissez qui doit se connecter.",
    recognizedFaceLabel: "Visage reconnu",
    signInButton: "Se connecter",
    registerTitle: "Créer un profil",
    registerCopy: "Saisissez vos informations et gardez votre visage visible.",
    nameLabel: "Nom",
    ageLabel: "Âge",
    genderLabel: "Genre",
    genderFemale: "Femme",
    genderMale: "Homme",
    genderDiverse: "Divers",
    genderPrivate: "Préfère ne pas répondre",
    registerButton: "Inscrire le profil",
    statusTitle: "Statut",
    trainingCopy: "Cette zone d'entrainement est visible apres la connexion securisee.",
    bioAge: "Âge",
    bioGender: "Genre",
    fitnessLevel: "Niveau",
    score: "Score",
    loginCount: "Connexions",
    currentGesture: "Geste actuel",
    cameraFps: "FPS caméra",
    warmupTitle: "Échauffement",
    warmupCopy: "Gardez vos mains visibles et suivez le retour sur les gestes.",
    gestureTitle: "Pratique des gestes",
    gestureCopy: "Essayez main ouverte, poing, pouce levé, signe de paix et pointage.",
    sessionTitle: "Session",
    sessionCopy: "La logique d'entraînement peut être étendue ici.",
    completedSets: "Series",
    exerciseAiTitle: "IA d'exercice",
    exerciseAiCopy: "Reconnaissance actuelle de l'exercice avec apprentissage local.",
    exerciseLabel: "Exercice",
    exerciseSource: "Source",
    exerciseReps: "Reps",
    exerciseSamples: "Echantillons",
    workoutTarget: "Objectif",
    workoutState: "Serie",
    targetMode: "Mode d'objectif",
    customTargetLabel: "Objectif personnalise de repetitions",
    levelTargetPlaceholder: "Objectif du niveau",
    defaultExerciseGuidance: "Choisissez un exercice, gardez tout le corps visible, puis demarrez une serie.",
    invalidTargetMessage: "L'objectif doit etre un nombre entier de 1 a 100.",
    moveStartGuidance: "Montrez tout votre corps et prenez la position de depart.",
    wrongExerciseGuidance: "Ce mouvement ne correspond pas a l'exercice choisi. Revenez a la position de depart de l'exercice choisi.",
    noRepCountedMessage: "Aucune repetition comptee pour le moment.",
    restGuidance: "Serie terminee. Reposez-vous un instant ou choisissez l'exercice suivant.",
    curlUpGuidance: "Gardez le coude pres du corps et amenez une main vers l'epaule.",
    curlDownGuidance: "Tendez le coude avant le curl suivant.",
    jumpUpGuidance: "Sautez clairement au-dessus de la ligne de base pour que la camera compte.",
    jumpDownGuidance: "Atterrissez et restez immobile avant le prochain saut.",
    armRaiseUpGuidance: "Levez les deux mains ensemble au-dessus des epaules.",
    armRaiseDownGuidance: "Baissez les deux mains sous les epaules avant la repetition suivante.",
    squatUpGuidance: "Pliez les genoux dans un squat controle.",
    squatDownGuidance: "Redressez-vous avant le squat suivant.",
    sideRaiseUpGuidance: "Levez les deux bras sur les cotes jusqu'a hauteur des epaules.",
    sideRaiseDownGuidance: "Baissez les deux bras avant la prochaine elevation laterale.",
    genericExerciseGuidance: "Gardez tout votre corps visible et suivez la regle de l'exercice.",
    trainingTitle: "Entrainement",
    startSet: "Demarrer la serie",
    savePose: "Enregistrer la pose",
    trainModel: "Entrainer le modele",
    languageSelect: "Langue",
    cameraAlt: "Camera en direct avec superposition de suivi sportif",
    workoutProgressLabel: "Progression de l'entrainement",
    exerciseSelectLabel: "Exercice",
    exerciseExampleAlt: "exemple d'exercice",
    unknown: "inconnu",
    noneValue: "aucun",
    idle: "pret",
    running: "en cours",
    completed: "termine",
    up: "haut",
    down: "bas",
    rules: "regles",
    model: "modele",
    level: "niveau",
    custom: "personnalise",
    openHand: "main ouverte",
    fist: "poing",
    thumbsUp: "pouce leve",
    peace: "paix",
    pointing: "pointage",
    handCurl: "Curl de main",
    jumpExercise: "Saut",
    armRaises: "Levees de bras",
    squatExercise: "Squat",
    sideArmRaises: "Levees laterales des bras",
    handCurlRule: "Commencez avec le coude tendu. Amenez une main vers l'epaule, puis retendez le coude avant la repetition suivante.",
    jumpRule: "Restez immobile entre les sauts. Une repetition compte quand les deux chevilles montent clairement depuis la ligne de base.",
    armRaisesRule: "Commencez bras baisses. Levez les deux mains au-dessus des epaules, puis baissez-les.",
    squatRule: "Tenez-vous droit. Pliez les genoux en squat, puis redressez-vous avant la repetition suivante.",
    sideArmRaisesRule: "Commencez bras baisses. Levez les deux bras sur les cotes jusqu'aux epaules, puis baissez-les.",
    backendDown: "Le backend ne fonctionne pas sur http://127.0.0.1:8000",
    selectExerciseMessage: "Choisissez un exercice et demarrez une serie.",
    noFaceVisibleMessage: "Aucun visage visible. Regardez la camera et reessayez.",
    noRegisteredFaceMessage: "Aucun visage enregistre reconnu pour le moment.",
    signInBeforeWorkoutMessage: "Connectez-vous avant de demarrer un entrainement.",
    signInBeforeProgressMessage: "Connectez-vous avant d'enregistrer la progression.",
    chooseExerciseMessage: "Choisissez curl de main, saut, levees de bras, squat ou levees laterales.",
    progressSavedMessage: "Progression enregistree.",
    signedOutMessage: "Deconnecte.",
    welcomeBackPrefix: "Bon retour",
    registeredSuffix: "a ete enregistre. Choisissez le visage reconnu pour vous connecter.",
    recognizedPrefix: "Reconnu",
    notPrefix: "pas",
    trainedPrefix: "Entraine avec",
    trainedSuffix: "echantillons d'exercice.",
    setStartedPrefix: "Serie demarree",
    waitingForPrefix: "En attente de",
    repsSuffix: "repetitions.",
    setCompletePrefix: "Serie terminee.",
    scoreAndLevelUpSuffix: "points et montee de niveau.",
    logout: "Se déconnecter",
    waiting: "En attente de la caméra...",
    enterName: "Veuillez saisir votre nom.",
    enterAge: "Veuillez saisir un âge valide.",
    noProfiles: "aucun",
    yes: "oui",
    no: "non",
    faces: "Visages",
    gestures: "Gestes",
    profiles: "Profils",
    faceIdReady: "Connexion faciale prete",
    noRecognizedFace: "Aucun visage reconnu pour le moment",
    detectedUser: "Reconnu",
    loginReadyHint: "La camera est prete. Gardez votre visage centre et continuez.",
    loginWaitingHint: "En attente de la camera. Verifiez les autorisations si cela dure trop longtemps.",
  },
  ta: {
    appTitle: "SportsAI Coach",
    appSubtitle: "AI ????????? ?????????? ???????, ??????????? ??? ????????? ??????? ????? ???????????.",
    signedOut: "வெளியேறியது",
    signedIn: "உள்நுழைந்தது",
    signIn: "உள்நுழை",
    register: "பதிவு",
    signInTitle: "??? ???????? ????? ???????",
    signInCopy: "??????? ???????? ?????????. ?????? ??????? ???????? ???????????? ???????? ????????; ???? ????????? ???? ???????? ???????? ???????? ?????? ?????????.",
    recognizedFaceLabel: "அடையாளம் கண்ட முகம்",
    signInButton: "உள்நுழை",
    registerTitle: "சுயவிவரம் உருவாக்கு",
    registerCopy: "உங்கள் விவரங்களை உள்ளிட்டு முகத்தை தெளிவாகக் காட்டுங்கள்.",
    nameLabel: "பெயர்",
    ageLabel: "வயது",
    genderLabel: "பாலினம்",
    genderFemale: "பெண்",
    genderMale: "ஆண்",
    genderDiverse: "பல்வேறு",
    genderPrivate: "சொல்ல விரும்பவில்லை",
    registerButton: "சுயவிவரம் பதிவு செய்",
    statusTitle: "நிலை",
    trainingCopy: "??????????? ??????????????? ????? ???? ??????? ????? ????????.",
    bioAge: "வயது",
    bioGender: "பாலினம்",
    fitnessLevel: "நிலை",
    score: "மதிப்பெண்",
    loginCount: "உள்நுழைவுகள்",
    currentGesture: "தற்போதைய சைகை",
    cameraFps: "கேமரா FPS",
    warmupTitle: "தயாரிப்பு",
    warmupCopy: "கைகளை தெளிவாகக் காட்டி சைகை கருத்தை பின்பற்றுங்கள்.",
    gestureTitle: "சைகை பயிற்சி",
    gestureCopy: "திறந்த கை, முட்டி, தம்ப்ஸ் அப், பீஸ் மற்றும் சுட்டுதல் முயற்சிக்கவும்.",
    sessionTitle: "அமர்வு",
    sessionCopy: "பயிற்சி செயல்முறையை இங்கே மேலும் விரிவாக்கலாம்.",
    completedSets: "???????",
    exerciseAiTitle: "??????????? AI",
    exerciseAiCopy: "??????? ????????? ???????? ??????????? ????????.",
    exerciseLabel: "???????????",
    exerciseSource: "?????",
    exerciseReps: "????",
    exerciseSamples: "?????????",
    workoutTarget: "??????",
    workoutState: "????",
    targetMode: "?????? ????",
    customTargetLabel: "????????? ???? ??????",
    levelTargetPlaceholder: "???? ??????",
    defaultExerciseGuidance: "??? ????????????? ?????? ??????, ???? ???? ??????, ?????? ??????????.",
    invalidTargetMessage: "?????? 1 ????? 100 ??? ???? ?????? ?????? ????????.",
    moveStartGuidance: "???? ???? ?????? ??????????? ?????? ???????? ?????????.",
    wrongExerciseGuidance: "???? ????? ????????????? ??????????????? ?????????????. ????????????? ??????????????? ?????? ???????? ???????????.",
    noRepCountedMessage: "??????? ???? ???????? ??????????????.",
    restGuidance: "???? ?????????. ?????? ????? ?????????? ?????? ?????? ????????????? ?????? ?????????.",
    curlUpGuidance: "??????? ???????? ??????? ?????? ??? ???? ???????? ?????? ?????????.",
    curlDownGuidance: "?????? curl ???? ????????? ?????????.",
    jumpUpGuidance: "????? ???? ??????? ???? ???????????.",
    jumpDownGuidance: "?????? ???????????? ???? ??????? ?????? ???????? ?????????.",
    armRaiseUpGuidance: "??? ????????? ?????? ???????? ???? ???????????.",
    armRaiseDownGuidance: "?????? ???????? ???? ??? ????????? ???????? ???? ?????????.",
    squatUpGuidance: "????????? ?????? ???????????????? squat ?????????.",
    squatDownGuidance: "?????? squat ???? ????? ?????????.",
    sideRaiseUpGuidance: "??? ????????? ??????? ???? ????? ??? ???????????.",
    sideRaiseDownGuidance: "?????? side raise ???? ??? ????????? ?????????.",
    genericExerciseGuidance: "???? ???? ?????? ??????????? ?????? ????????????.",
    trainingTitle: "???????",
    startSet: "???? ???????",
    savePose: "?????? ????",
    trainModel: "???????? ??????? ????",
    languageSelect: "????",
    cameraAlt: "?????????? ??????????? ??????????? ????? ?????",
    workoutProgressLabel: "??????? ???????????",
    exerciseSelectLabel: "???????????",
    exerciseExampleAlt: "??????????? ???????",
    unknown: "????????",
    noneValue: "?????",
    idle: "?????",
    running: "?????????",
    completed: "?????????",
    up: "????",
    down: "????",
    rules: "???????",
    model: "??????",
    level: "????",
    custom: "?????????",
    openHand: "?????? ??",
    fist: "????????",
    thumbsUp: "?? ????? ????",
    peace: "????? ????",
    pointing: "?????????",
    handCurl: "?? curl",
    jumpExercise: "????????",
    armRaises: "?? ?????????",
    squatExercise: "squat",
    sideArmRaises: "???? ?? ?????????",
    handCurlRule: "??????? ??????? ???????? ???????. ??? ???? ???????? ?????? ??????, ?????? ???????? ???? ????????? ???????? ?????????.",
    jumpRule: "??????????????? ??????? ???????? ?????????. ?????? ?????????????? ??????? ???? ???????? ??? ???? ???????????.",
    armRaisesRule: "????? ???? ?????? ???????. ??? ????????? ???????? ???? ???????? ???????? ?????????.",
    squatRule: "????? ?????????. ????????? ?????? squat ??????, ?????? ???????? ???? ???????? ????? ?????????.",
    sideArmRaisesRule: "????? ???? ?????? ???????. ??? ????????? ??????? ???? ????? ??? ???????? ???????? ?????????.",
    backendDown: "Backend http://127.0.0.1:8000 ??? ???????????",
    selectExerciseMessage: "??? ????????????? ?????? ?????? ?????? ??????????.",
    noFaceVisibleMessage: "????? ???????????. ??????? ?????? ???????? ??????????????.",
    noRegisteredFaceMessage: "????? ??????????? ????? ??????? ???????? ?????????????.",
    signInBeforeWorkoutMessage: "????????? ?????? ???? ????????????.",
    signInBeforeProgressMessage: "????????????? ??????? ???? ????????????.",
    chooseExerciseMessage: "?? curl, ????????, ?? ?????????, squat ?????? ???? ?? ????????? ?????? ?????????.",
    progressSavedMessage: "??????????? ???????????????.",
    signedOutMessage: "???????????.",
    welcomeBackPrefix: "???????? ????????????",
    registeredSuffix: "????? ?????????????. ???????? ???????? ????????? ??????? ?????? ?????????.",
    recognizedPrefix: "???????? ???????????",
    notPrefix: "?????",
    trainedPrefix: "??????? ?????????????",
    trainedSuffix: "??????????? ????????????.",
    setStartedPrefix: "???? ??????????",
    waitingForPrefix: "???????????????",
    repsSuffix: "???????.",
    setCompletePrefix: "???? ?????????.",
    scoreAndLevelUpSuffix: "????????? ??????? ???? ??????.",
    logout: "வெளியேறு",
    waiting: "கேமராவுக்காக காத்திருக்கிறது...",
    enterName: "பெயரை உள்ளிடுங்கள்.",
    enterAge: "சரியான வயதை உள்ளிடுங்கள்.",
    noProfiles: "எதுவும் இல்லை",
    yes: "ஆம்",
    no: "இல்லை",
    faces: "முகங்கள்",
    gestures: "சைகைகள்",
    profiles: "சுயவிவரங்கள்",
    faceIdReady: "??? ????????? ?????? ??????",
    noRecognizedFace: "இன்னும் முகம் அடையாளம் காணப்படவில்லை",
    detectedUser: "???????? ???????????",
    loginReadyHint: "????? ?????? ??????. ??????? ??????? ?????? ????????.",
    loginWaitingHint: "???????????? ???????????????. ??? ????? ????? ????????? ????? ???????? ??????????????.",
  },
  ki: {
    appTitle: "SportsAI Coach",
    appSubtitle: "Guthomithia sports na AI, kuingira na uso kuri na uiguano, na kurora micemanio.",
    signedOut: "Ũrathii nja",
    signedIn: "Ũrathii thĩinĩ",
    signIn: "Ingĩra",
    register: "Andĩkithia",
    signInTitle: "Ingira na kumenywo kwa uso",
    signInCopy: "Tega camera. Angikorwo andu aingi mamenyekete, thuura uria ukwingira.",
    recognizedFaceLabel: "Ũthiũ ũmenyetwo",
    signInButton: "Ingĩra",
    registerTitle: "Thondeka profile",
    registerCopy: "Andĩka maũndũ maku na ũtige ũthiũ waku wonagwo.",
    nameLabel: "Rĩĩtwa",
    ageLabel: "Mĩaka",
    genderLabel: "Mũthemba",
    genderFemale: "Mũtumia",
    genderMale: "Mũndũrũme",
    genderDiverse: "Mĩthemba mĩingĩ",
    genderPrivate: "Ndirenda kwaria",
    registerButton: "Andĩkithia profile",
    statusTitle: "Hali",
    trainingCopy: "Handu ha guthomithia honagwo thuutha wa kuingira kuri na uiguano.",
    bioAge: "Mĩaka",
    bioGender: "Mũthemba",
    fitnessLevel: "Level",
    score: "Score",
    loginCount: "Kũingĩra",
    currentGesture: "Kĩonereria gĩa rĩu",
    cameraFps: "Camera FPS",
    warmupTitle: "Kwĩhaarĩria",
    warmupCopy: "Tiga moko maku monagwo na ũthikĩrĩrie maũndũ ma kĩonereria.",
    gestureTitle: "Kũmenyerera cionereria",
    gestureCopy: "Gereria guoko gũthambũrũka, ngumi, kĩara gĩa igũrũ, thayu na kũratha.",
    sessionTitle: "Kĩũngano",
    sessionCopy: "Mũtaratara wa kũthomithia no wongererwo haha.",
    completedSets: "Seti",
    exerciseAiTitle: "AI ya mathomo",
    exerciseAiCopy: "Kumenya mathomo kwa riu na guthoma kwa kompiuta.",
    exerciseLabel: "Ithomo",
    exerciseSource: "Kuma",
    exerciseReps: "Mahinda",
    exerciseSamples: "Mihiano",
    workoutTarget: "Kiriko",
    workoutState: "Seti",
    targetMode: "Mitugo ya kiriko",
    customTargetLabel: "Kiriko gia mahinda",
    levelTargetPlaceholder: "Kiriko gia level",
    defaultExerciseGuidance: "Thuura ithomo, onania mwiri wothe, na uambie seti.",
    invalidTargetMessage: "Kiriko nigikwiye kuba namba 1 nginya 100.",
    moveStartGuidance: "Onania mwiri wothe na uthiie handu ha kuambiria ithomo.",
    wrongExerciseGuidance: "Mucemanio uyu ti wa ithomo riria wathuurire. Coka handu ha kuambiria ithomo riria wathuurire.",
    noRepCountedMessage: "Guti ihinda ritaritwo riu.",
    restGuidance: "Seti niyathira. Huruka hanini kana thuura ithomo ringi.",
    curlUpGuidance: "Tiga kiwiko hakuhi na mwiri na uhinyie guoko nginya githuri.",
    curlDownGuidance: "Tamburukia kiwiko mbere ya curl ingi.",
    jumpUpGuidance: "Ruka wega iguru niguo camera ihote gutara.",
    jumpDownGuidance: "Tura thi na wime mbere ya kuruka ringi.",
    armRaiseUpGuidance: "Ambatia moko meri iguru ria mabega hamwe.",
    armRaiseDownGuidance: "Ikia moko meri thi ya mabega mbere ya ihinda ringi.",
    squatUpGuidance: "Hinya maguru na uthondeke squat njega.",
    squatDownGuidance: "Ima wega mbere ya squat ingi.",
    sideRaiseUpGuidance: "Ambatia moko meri mwena nginya uigane na mabega.",
    sideRaiseDownGuidance: "Ikia moko meri mbere ya side raise ingi.",
    genericExerciseGuidance: "Onania mwiri wothe na uhinge watho wa ithomo.",
    trainingTitle: "Guthomithia",
    startSet: "Ambia seti",
    savePose: "Hifadhi pose",
    trainModel: "Thomithia model",
    languageSelect: "Lugha",
    cameraAlt: "Camera ya riu na kurora sports",
    workoutProgressLabel: "Mbere ya guthomithia",
    exerciseSelectLabel: "Ithomo",
    exerciseExampleAlt: "muhiano wa ithomo",
    unknown: "ndimenya",
    noneValue: "guti",
    idle: "tayari",
    running: "irathii",
    completed: "niyathira",
    up: "iguru",
    down: "thi",
    rules: "mawatho",
    model: "model",
    level: "level",
    custom: "ya mundu",
    openHand: "guoko guhinguruke",
    fist: "ngumi",
    thumbsUp: "kiara iguru",
    peace: "thayu",
    pointing: "kuratha",
    handCurl: "Hand Curling",
    jumpExercise: "Kuruka",
    armRaises: "Kwambatia moko",
    squatExercise: "Squat",
    sideArmRaises: "Kwambatia moko mwena",
    handCurlRule: "Ambia na kiwiko gitamburukite. Hinyia guoko githuri, na utamburukie kiwiko mbere ya ihinda ringi.",
    jumpRule: "Ima gatagati ka kuruka. Ihinda ritariwa riria maguru meri mamabatuka iguru.",
    armRaisesRule: "Ambia moko mari thi. Ambatia moko meri iguru ria mabega, na ucoke uikie thi.",
    squatRule: "Ima wega. Hinya maguru ukorwo squat, na ucoke wime mbere ya ihinda ringi.",
    sideArmRaisesRule: "Ambia moko mari thi. Ambatia moko meri mwena nginya mabega, na ucoke uikie thi.",
    backendDown: "Backend ndirathii kuri http://127.0.0.1:8000",
    selectExerciseMessage: "Thuura ithomo na uambie seti.",
    noFaceVisibleMessage: "Guti uso uonekana. Tega camera na ugerie ringi.",
    noRegisteredFaceMessage: "Guti uso wandikithitio umenyekete riu.",
    signInBeforeWorkoutMessage: "Ingira mbere ya kuambia guthomithia.",
    signInBeforeProgressMessage: "Ingira mbere ya kuhifadhi mbere.",
    chooseExerciseMessage: "Thuura Hand Curling, kuruka, kwambatia moko, squat kana kwambatia moko mwena.",
    progressSavedMessage: "Mbere ihifadhiitwo.",
    signedOutMessage: "Uthiitwo nja.",
    welcomeBackPrefix: "Wamukire ringi",
    registeredSuffix: "niyandikithitio. Thuura uso umenyekete niguo uingire.",
    recognizedPrefix: "Imenyekete",
    notPrefix: "ti",
    trainedPrefix: "Ithomithitio na",
    trainedSuffix: "mihiano ya ithomo.",
    setStartedPrefix: "Seti yambiiririe",
    waitingForPrefix: "Kwetera",
    repsSuffix: "mahinda.",
    setCompletePrefix: "Seti niyathira.",
    scoreAndLevelUpSuffix: "score na level iguru.",
    logout: "Thii nja",
    waiting: "Kũeterera camera...",
    enterName: "Andĩka rĩĩtwa rĩaku.",
    enterAge: "Andĩka mĩaka ĩrĩa yagĩrĩire.",
    noProfiles: "gũtirĩ",
    yes: "ĩĩ",
    no: "aca",
    faces: "Thiũ",
    gestures: "Cionereria",
    profiles: "Profile",
    faceIdReady: "Kuingira na uso ni tayari",
    noRecognizedFace: "Gũtirĩ ũthiũ ũmenyetwo rĩu",
    detectedUser: "Imenyekete",
    loginReadyHint: "Camera ni tayari. Ika uso gatagati na uendelee.",
    loginWaitingHint: "Kwetera camera. Rora ruhusa rwa camera kana ikiria mahinda maingi.",
  },
} satisfies Record<Language, Record<string, string>>;

const languageLabels: Record<Language, string> = {
  en: "English",
  de: "Deutsch",
  pt: "Português",
  sr: "Srpski",
  zh: "简体中文",
  fr: "Français",
  ta: "தமிழ்",
  ki: "Gĩkũyũ",
};

const genderOptions = ["female", "male", "diverse", "prefer-not-to-say"] as const;
const exerciseOptions = ["hand_curl", "jump", "arm_raises", "squat", "side_arm_raises"] as const;
const exerciseExamples: Record<(typeof exerciseOptions)[number], string> = {
  hand_curl: "/exercises/hand_curl.png",
  jump: "/exercises/jump.png",
  arm_raises: "/exercises/arm_raises.png",
  squat: "/exercises/squat.png",
  side_arm_raises: "/exercises/side_arm_raises.png",
};
const exerciseNameKeys: Record<(typeof exerciseOptions)[number], string> = {
  hand_curl: "handCurl",
  jump: "jumpExercise",
  arm_raises: "armRaises",
  squat: "squatExercise",
  side_arm_raises: "sideArmRaises",
};
const exerciseRuleKeys: Record<(typeof exerciseOptions)[number], string> = {
  hand_curl: "handCurlRule",
  jump: "jumpRule",
  arm_raises: "armRaisesRule",
  squat: "squatRule",
  side_arm_raises: "sideArmRaisesRule",
};

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [tab, setTab] = useState<"sign-in" | "register">("sign-in");
  const [message, setMessage] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<(typeof genderOptions)[number]>("female");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [exerciseLabel, setExerciseLabel] = useState<(typeof exerciseOptions)[number]>("hand_curl");
  const [customTarget, setCustomTarget] = useState("");

  const t = useMemo(() => translations[language], [language]);
  const text = (key: string, fallback: string) => (t as Record<string, string>)[key] ?? fallback;
  const translateExerciseName = (label: string) => {
    const exerciseAliases: Record<string, (typeof exerciseOptions)[number]> = {
      hand_curling: "hand_curl",
      hand_curl: "hand_curl",
      weight_lift: "hand_curl",
      weight_lifting: "hand_curl",
      jumping_jacks: "jump",
      jump: "jump",
      arm_raises: "arm_raises",
      squat: "squat",
      side_arm_raises: "side_arm_raises",
    };
    const lookup = label.replaceAll(" ", "_").replaceAll("-", "_").toLowerCase();
    const normalized = (exerciseAliases[lookup] ?? lookup) as (typeof exerciseOptions)[number];
    if (normalized in exerciseNameKeys) {
      return text(exerciseNameKeys[normalized], label.replace("_", " "));
    }
    return translateStatusValue(label);
  };
  const translateStatusValue = (value: string) => {
    const normalized = value.replaceAll(" ", "_").toLowerCase();
    const keyByValue: Record<string, string> = {
      unknown: "unknown",
      none: "noneValue",
      idle: "idle",
      running: "running",
      completed: "completed",
      up: "up",
      down: "down",
      rules: "rules",
      model: "model",
      level: "level",
      custom: "custom",
      open_hand: "openHand",
      fist: "fist",
      thumbs_up: "thumbsUp",
      peace: "peace",
      pointing: "pointing",
    };
    return keyByValue[normalized] ? text(keyByValue[normalized], value) : value;
  };
  const translateMessage = (value: string) => {
    if (!value) return "";

    if (value === "Backend is not running on http://127.0.0.1:8000") {
      return text("backendDown", value);
    }
    if (value === "Select an exercise and start a set.") {
      return text("selectExerciseMessage", value);
    }
    if (value === "No face is visible. Look into the camera and try again.") {
      return text("noFaceVisibleMessage", value);
    }
    if (value === "No registered face recognized yet.") {
      return text("noRegisteredFaceMessage", value);
    }
    if (value === "Sign in before starting a workout.") {
      return text("signInBeforeWorkoutMessage", value);
    }
    if (value === "Sign in before saving progress.") {
      return text("signInBeforeProgressMessage", value);
    }
    if (
      value === "Choose weight_lift, jump or arm_raises."
      || value === "Choose weight_lift, jump, arm_raises, squat or side_arm_raises."
      || value === "Choose hand_curl, jump, arm_raises, squat or side_arm_raises."
    ) {
      return text("chooseExerciseMessage", value);
    }
    if (value === "Progress saved.") {
      return text("progressSavedMessage", value);
    }
    if (value === "Signed out.") {
      return text("signedOutMessage", value);
    }
    if (value === "No repetition counted yet.") {
      return text("noRepCountedMessage", value);
    }
    const guidanceKeys: Record<string, string> = {
      "Show your full body and move into the exercise start position.": "moveStartGuidance",
      "That movement does not match the selected exercise. Return to the selected exercise start position.": "wrongExerciseGuidance",
      "Set complete. Rest briefly or choose the next exercise.": "restGuidance",
      "Keep the elbow near your body and curl one hand toward the shoulder.": "curlUpGuidance",
      "Extend the elbow before the next curl.": "curlDownGuidance",
      "Jump clearly upward from the baseline so the camera can count it.": "jumpUpGuidance",
      "Land and stand still before the next Jumping Jack.": "jumpDownGuidance",
      "Raise both hands above shoulder height together.": "armRaiseUpGuidance",
      "Lower both hands below shoulder height before the next rep.": "armRaiseDownGuidance",
      "Bend your knees into a controlled squat.": "squatUpGuidance",
      "Stand tall again before the next squat.": "squatDownGuidance",
      "Raise both arms sideways to shoulder height.": "sideRaiseUpGuidance",
      "Lower both arms before the next side raise.": "sideRaiseDownGuidance",
      "Keep your full body visible and follow the exercise rule.": "genericExerciseGuidance",
    };
    if (guidanceKeys[value]) {
      return text(guidanceKeys[value], value);
    }

    let match = value.match(/^Welcome back, (.+)\.$/);
    if (match) {
      return `${text("welcomeBackPrefix", "Welcome back")}, ${match[1]}.`;
    }

    match = value.match(/^(.+) has been registered\. Select the recognized face to sign in\.$/);
    if (match) {
      return `${match[1]} ${text("registeredSuffix", "has been registered. Select the recognized face to sign in.")}`;
    }

    match = value.match(/^Recognized (.+), not (.+)\.$/);
    if (match) {
      return `${text("recognizedPrefix", "Recognized")} ${match[1]}, ${text("notPrefix", "not")} ${match[2]}.`;
    }

    match = value.match(/^Trained on (\d+) exercise samples\.$/);
    if (match) {
      return `${text("trainedPrefix", "Trained on")} ${match[1]} ${text("trainedSuffix", "exercise samples.")}`;
    }

    match = value.match(/^Set started: (.+)\.$/);
    if (match) {
      return `${text("setStartedPrefix", "Set started")}: ${translateExerciseName(match[1].replaceAll(" ", "_"))}.`;
    }

    match = value.match(/^Waiting for (.+)\.$/);
    if (match) {
      return `${text("waitingForPrefix", "Waiting for")} ${translateExerciseName(match[1].replaceAll(" ", "_"))}.`;
    }

    match = value.match(/^(\d+)\/(\d+) reps\.$/);
    if (match) {
      return `${match[1]}/${match[2]} ${text("repsSuffix", "reps.")}`;
    }

    match = value.match(/^Set complete\. \+(\d+) score and level up\.$/);
    if (match) {
      return `${text("setCompletePrefix", "Set complete.")} +${match[1]} ${text("scoreAndLevelUpSuffix", "score and level up.")}`;
    }

    return value;
  };
  const activeProfile = status?.activeProfile;
  const exercise = status?.exercise;
  const workout = status?.workout;
  const activeWorkoutExercise = workout?.exercise as (typeof exerciseOptions)[number] | undefined;
  const selectedExercise = exerciseLabel as (typeof exerciseOptions)[number];
  const previewExercise =
    workout && workout.state === "running" && activeWorkoutExercise && activeWorkoutExercise in exerciseExamples
      ? activeWorkoutExercise
      : selectedExercise;
  const exampleImage =
    previewExercise in exerciseExamples ? exerciseExamples[previewExercise] : null;
  const activeExerciseRule =
    previewExercise in exerciseRuleKeys
      ? text(exerciseRuleKeys[previewExercise], "")
      : "";
  const workoutProgress =
    workout && workout.targetReps > 0
      ? Math.min(100, Math.round((workout.currentReps / workout.targetReps) * 100))
      : 0;
  const gestureText = status?.gestures.length
    ? status.gestures.map((entry) => translateStatusValue(entry.label)).join(", ")
    : text("unknown", "unknown");
  const profileText = status?.profiles.length
    ? status.profiles.map((entry) => entry.name).join(", ")
    : t.noProfiles;
  const registrationSampleText = `${status?.registrationSamplesReady ?? 0}/${status?.minRegistrationSamples ?? 3}`;

  useEffect(() => {
    const stored = localStorage.getItem("siavi-language") as Language | null;
    if (stored && stored in translations) {
      setLanguage(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("siavi-language", language);
  }, [language]);

  useEffect(() => {
    let alive = true;

    async function loadStatus() {
      try {
        const response = await fetch("/api/status", { cache: "no-store" });
        const payload = (await response.json()) as StatusResponse;
        if (!alive) return;
        setStatus(payload);
        setMessage((current) => current || payload.error || t.waiting);
        if (!selectedCandidate && payload.signInCandidates[0]) {
          setSelectedCandidate(payload.signInCandidates[0].name);
        }
      } catch {
        if (alive) {
          setMessage(text("backendDown", "Backend is not running on http://127.0.0.1:8000"));
        }
      }
    }

    loadStatus();
    const interval = window.setInterval(loadStatus, 1000);
    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [selectedCandidate, t.waiting]);

  async function registerFace() {
    const parsedAge = Number(age);
    if (!name.trim()) {
      setMessage(t.enterName);
      return;
    }
    if (!Number.isFinite(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      setMessage(t.enterAge);
      return;
    }

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        age: parsedAge,
        gender,
      }),
    });
    const result = (await response.json()) as { message: string };
    setMessage(result.message);
  }

  async function signIn() {
    const candidateName = selectedCandidate || candidates[0]?.name || "";
    if (!candidateName) {
      setMessage(t.noRecognizedFace);
      return;
    }

    const response = await fetch("/api/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: candidateName }),
    });
    const result = (await response.json()) as { message: string };
    setMessage(result.message);
  }

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    setProfileOpen(false);
    setMessage(t.signedOut);
  }

  async function saveExerciseSample(label = exerciseLabel) {
    const response = await fetch("/api/exercise/sample", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    });
    const result = (await response.json()) as { message: string };
    setMessage(result.message);
  }

  async function trainExerciseModel() {
    const response = await fetch("/api/exercise/train", { method: "POST" });
    const result = (await response.json()) as { message: string };
    setMessage(result.message);
  }

  async function startWorkout() {
    const parsedTarget = customTarget.trim() ? Number(customTarget) : undefined;
    if (parsedTarget !== undefined && (!Number.isInteger(parsedTarget) || parsedTarget < 1 || parsedTarget > 100)) {
      setMessage(text("invalidTargetMessage", "Target must be a whole number from 1 to 100."));
      return;
    }

    const response = await fetch("/api/workout/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercise: exerciseLabel, targetReps: parsedTarget }),
    });
    const result = (await response.json()) as { message: string };
    setMessage(result.message);
  }

  const isAuthenticated = Boolean(status?.authenticated);
  const candidates = status?.signInCandidates ?? [];

  return (
    <main>
      <header>
        <div>
          <h1>{t.appTitle}</h1>
          <p>{t.appSubtitle}</p>
        </div>

        <div className="topActions">
          <select
            aria-label={text("languageSelect", "Language")}
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
          >
            {(Object.keys(languageLabels) as Language[]).map((code) => (
              <option key={code} value={code}>
                {languageLabels[code]}
              </option>
            ))}
          </select>

          {!isAuthenticated ? (
            <div className="statusPill warn">{t.signedOut}</div>
          ) : (
            <div className="profileMenu">
              <button
                className="profileButton"
                type="button"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((open) => !open)}
              >
                <span>{activeProfile?.name ?? status?.authenticatedName ?? "-"}</span>
                <small>
                  {t.fitnessLevel} {activeProfile?.level ?? 1}
                </small>
              </button>

              {profileOpen ? (
                <div className="profilePopover">
                  <ProfileRow label={t.bioAge} value={activeProfile?.age ?? "-"} />
                  <ProfileRow label={t.bioGender} value={activeProfile?.gender ?? "-"} />
                  <ProfileRow label={t.score} value={activeProfile?.score ?? 0} />
                  <ProfileRow label={t.loginCount} value={activeProfile?.loginCount ?? 0} />
                  <ProfileRow
                    label={text("completedSets", "Sets")}
                    value={activeProfile?.completedSets ?? 0}
                  />
                </div>
              ) : null}
            </div>
          )}
        </div>
      </header>

      <section className={isAuthenticated ? "layout authenticatedLayout" : "layout"}>
        <div className="cameraPanel">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/video.mjpg" alt={text("cameraAlt", "Live camera with sports tracking overlay")} />
        </div>

        {isAuthenticated ? (
          <aside className="sidePanel exerciseSidePanel">
            <div className="exercisePanel">
              <div>
                <h3>{text("exerciseAiTitle", "Exercise AI")}</h3>
                <p>{text("exerciseAiCopy", "Current exercise recognition with local learning.")}</p>
              </div>
              <div className="exerciseTrainer">
                <select
                  aria-label={text("exerciseSelectLabel", "Exercise")}
                  value={exerciseLabel}
                  onChange={(event) => setExerciseLabel(event.target.value as typeof exerciseLabel)}
                >
                  {exerciseOptions.map((option) => (
                    <option key={option} value={option}>
                      {translateExerciseName(option)}
                    </option>
                  ))}
                </select>
                <input
                  aria-label={text("customTargetLabel", "Custom repetition target")}
                  min={1}
                  max={100}
                  placeholder={text("levelTargetPlaceholder", "Level target")}
                  type="number"
                  value={customTarget}
                  onChange={(event) => setCustomTarget(event.target.value)}
                />
                <button type="button" onClick={startWorkout}>
                  {text("startSet", "Start set")}
                </button>
              </div>
              <div className="metrics">
                <Metric
                  label={text("exerciseLabel", "Exercise")}
                  value={exercise?.label ? translateExerciseName(exercise.label) : text("unknown", "unknown")}
                />
                <Metric
                  label={text("exerciseSource", "Source")}
                  value={exercise?.source ? translateStatusValue(exercise.source) : text("noneValue", "none")}
                />
                <Metric label={text("exerciseReps", "Reps")} value={exercise?.repetitions ?? 0} />
                <Metric
                  label={text("workoutTarget", "Target")}
                  value={`${workout?.currentReps ?? 0}/${workout?.targetReps ?? 5}`}
                />
                <Metric
                  label={text("workoutState", "Set")}
                  value={workout?.state ? translateStatusValue(workout.state) : text("idle", "idle")}
                />
                <Metric
                  label={text("targetMode", "Target mode")}
                  value={translateStatusValue(workout?.targetSource ?? "level")}
                />
                <Metric label={t.fitnessLevel} value={activeProfile?.level ?? 1} />
                <Metric
                  label={text("completedSets", "Sets")}
                  value={activeProfile?.completedSets ?? 0}
                />
                <Metric label={text("exerciseSamples", "Samples")} value={status?.exerciseSampleCount ?? 0} />
              </div>
              <div className="workoutProgress" aria-label={text("workoutProgressLabel", "Workout progress")}>
                <div style={{ width: `${workoutProgress}%` }} />
              </div>
              <div className={workout?.completed ? "message success" : "message"}>
                {translateMessage(workout?.message ?? text("waiting", "Waiting for camera..."))}
              </div>
              <div className="exerciseGuidance">
                {translateMessage(
                  workout?.guidance
                    ?? text("defaultExerciseGuidance", "Choose an exercise, keep your full body visible, then start a set.")
                )}
              </div>
              {exampleImage ? (
                <div className="exerciseExample">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={exampleImage}
                    alt={`${translateExerciseName(previewExercise)} ${text("exerciseExampleAlt", "exercise example")}`}
                  />
                </div>
              ) : null}
              {exampleImage ? <div className="exerciseRule">{activeExerciseRule}</div> : null}
            </div>
          </aside>
        ) : null}

        {!isAuthenticated ? (
          <aside className="sidePanel">
            <div className="tabs">
              <button
                className={tab === "sign-in" ? "active" : ""}
                type="button"
                onClick={() => setTab("sign-in")}
              >
                {t.signIn}
              </button>
              <button
                className={tab === "register" ? "active" : ""}
                type="button"
                onClick={() => setTab("register")}
              >
                {t.register}
              </button>
            </div>

            {tab === "sign-in" ? (
              <section className="form">
                <div>
                  <h2>{t.signInTitle}</h2>
                  <p>{t.signInCopy}</p>
                </div>
                {candidates.length > 1 ? (
                  <label>
                    {t.recognizedFaceLabel}
                    <select
                      value={selectedCandidate}
                      onChange={(event) => setSelectedCandidate(event.target.value)}
                    >
                      {candidates.map((candidate) => (
                        <option key={candidate.name} value={candidate.name}>
                          {candidate.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : candidates.length === 1 ? (
                  <div className="loginHint">
                    {text("detectedUser", "Detected")}: {candidates[0].name}
                  </div>
                ) : (
                  <div className="loginHint">{t.noRecognizedFace}</div>
                )}
                <button type="button" disabled={!candidates.length} onClick={signIn}>
                  {t.signInButton}
                </button>
              </section>
            ) : (
              <section className="form">
                <div>
                  <h2>{t.registerTitle}</h2>
                  <p>{t.registerCopy}</p>
                </div>
                <label>
                  {t.nameLabel}
                  <input
                    autoComplete="name"
                    value={name}
                    placeholder={t.nameLabel}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>
                <label>
                  {t.ageLabel}
                  <input
                    min={1}
                    max={120}
                    type="number"
                    value={age}
                    placeholder={t.ageLabel}
                    onChange={(event) => setAge(event.target.value)}
                  />
                </label>
                <label>
                  {t.genderLabel}
                  <select
                    value={gender}
                    onChange={(event) => setGender(event.target.value as typeof gender)}
                  >
                    <option value="female">{t.genderFemale}</option>
                    <option value="male">{t.genderMale}</option>
                    <option value="diverse">{t.genderDiverse}</option>
                    <option value="prefer-not-to-say">{t.genderPrivate}</option>
                  </select>
                </label>
                <button type="button" onClick={registerFace}>
                  {t.registerButton}
                </button>
                <div className="sampleHint">
                  {text("registrationSamples", "Face samples")}: {registrationSampleText}
                </div>
              </section>
            )}

            <div className="message">{translateMessage(message || t.waiting)}</div>
            <div className="loginHint">
              {status?.recognitionReady
                ? text("loginReadyHint", "Camera is ready. Keep your face centered and continue.")
                : text("loginWaitingHint", "Waiting for the camera. Check camera permission if this takes too long.")}
            </div>
          </aside>
        ) : null}
      </section>

      {isAuthenticated ? (
        <section className="trainingShell">
          <div className="trainingPanel">
            <div>
              <h2>{text("trainingTitle", "Training")}</h2>
              <p>{t.trainingCopy}</p>
            </div>

            <div className="metrics">
              <Metric label={t.fitnessLevel} value={activeProfile?.level ?? 1} />
              <Metric label={t.score} value={activeProfile?.score ?? 0} />
              <Metric
                label={text("completedSets", "Sets")}
                value={activeProfile?.completedSets ?? 0}
              />
              <Metric label={t.currentGesture} value={gestureText} />
              <Metric label={t.cameraFps} value={status?.fps ?? 0} />
            </div>

            <div className="trainingGrid">
              <TrainingCard title={t.warmupTitle} copy={t.warmupCopy} />
              <TrainingCard title={t.gestureTitle} copy={t.gestureCopy} />
              <TrainingCard title={t.sessionTitle} copy={t.sessionCopy} />
            </div>

            <button className="secondary" type="button" onClick={logout}>
              {t.logout}
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function ProfileRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="profileRow">
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric">
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  );
}

function TrainingCard({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="trainingCard">
      <h3>{title}</h3>
      <p>{copy}</p>
    </div>
  );
}
