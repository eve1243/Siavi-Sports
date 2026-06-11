"use client";

import { useEffect, useMemo, useState } from "react";

type Language = "en" | "de" | "pt" | "sr" | "zh" | "fr" | "ta" | "ki";

type Profile = {
  name: string;
  age: number | null;
  gender: string | null;
  fitnessLevel: FitnessLevel | null;
  level: number;
  score: number;
  loginCount: number;
  completedSets: number;
};

type FitnessLevel = "beginner" | "active" | "fit" | "athlete";

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
  setsRequiredForLevel: number;
  setsCompletedInLevel: number;
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
  nextRegistrationPose: string;
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
    initialFitnessLabel: "Current fitness",
    fitnessBeginner: "Beginner",
    fitnessActive: "Active",
    fitnessFit: "Fit",
    fitnessAthlete: "Athlete",
    registerButton: "Register profile",
    statusTitle: "Status",
    trainingCopy: "This training area is visible after secure login.",
    bioAge: "Age",
    bioGender: "Gender",
    fitnessLevel: "Level",
    score: "Score",
    loginCount: "Logins",
    completedSets: "Sets",
    levelProgress: "Next level",
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
    trainingPlansTitle: "Training plans",
    trainingPlansCopy: "Three ready-made plans are selected for your fitness level and adjusted by age group.",
    ageGroupLabel: "Age group",
    planStart: "Start plan",
    nextPlanStep: "Next exercise",
    planStepLabel: "Step",
    planCompleted: "Plan completed.",
    youngAgeGroup: "Under 18",
    adultAgeGroup: "18-49",
    matureAgeGroup: "50+",
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
    levelUpPrefix: "Level up! Level",
    levelUnlockedSuffix: "unlocked.",
    scoreSuffix: "score.",
    setsTowardLevelSuffix: "sets toward next level.",
    completeMoreSetsPrefix: "Complete",
    moreSetsLevelSuffix: "more set(s) to reach the next level.",
    newChallengePrefix: "New challenge:",
    setWithRepsConnector: "set(s) with",
    repsEachSuffix: "reps each.",
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
    registrationSamples: "Face samples",
    captureFaceSample: "Capture sample",
    clearFaceSamples: "Reset samples",
    faceSampleInstruction: "Capture three angles of the same face: front, slight left, slight right.",
    nextFacePose: "Next angle",
    facePoseFront: "front",
    facePoseLeft: "slight left",
    facePoseRight: "slight right",
    samplesRequiredMessage: "Capture 3 face samples before registering.",
    samplesReadyMessage: "All face samples are ready. You can register the profile now.",
    faceSamplesClearedMessage: "Face samples cleared.",
    moveCloserFaceMessage: "Move closer to the camera before saving this face sample.",
    oneFaceRegistrationMessage: "Only one face should be visible during registration.",
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
    initialFitnessLabel: "Aktuelle Fitness",
    fitnessBeginner: "Anfaenger",
    fitnessActive: "Aktiv",
    fitnessFit: "Fit",
    fitnessAthlete: "Athletisch",
    registerButton: "Profil registrieren",
    statusTitle: "Status",
    trainingCopy: "Dieser Trainingsbereich ist nach dem sicheren Login sichtbar.",
    bioAge: "Alter",
    bioGender: "Geschlecht",
    fitnessLevel: "Stufe",
    score: "Punkte",
    loginCount: "Logins",
    completedSets: "Saetze",
    levelProgress: "Naechste Stufe",
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
    trainingPlansTitle: "Trainingsplaene",
    trainingPlansCopy: "Drei fertige Plaene werden nach Fitnesslevel ausgewaehlt und nach Altersgruppe angepasst.",
    ageGroupLabel: "Altersgruppe",
    planStart: "Plan starten",
    nextPlanStep: "Naechste Uebung",
    planStepLabel: "Schritt",
    planCompleted: "Plan abgeschlossen.",
    youngAgeGroup: "Unter 18",
    adultAgeGroup: "18-49",
    matureAgeGroup: "50+",
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
    levelUpPrefix: "Stufenaufstieg! Stufe",
    levelUnlockedSuffix: "freigeschaltet.",
    scoreSuffix: "Punkte.",
    setsTowardLevelSuffix: "Saetze bis zur naechsten Stufe.",
    completeMoreSetsPrefix: "Schaffe",
    moreSetsLevelSuffix: "weitere Saetze bis zur naechsten Stufe.",
    newChallengePrefix: "Neue Challenge:",
    setWithRepsConnector: "Saetze mit",
    repsEachSuffix: "Wiederholungen.",
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
    registrationSamples: "Gesichtsaufnahmen",
    captureFaceSample: "Aufnahme speichern",
    clearFaceSamples: "Aufnahmen neu starten",
    faceSampleInstruction: "Speichere drei Winkel vom gleichen Gesicht: vorne, leicht links, leicht rechts.",
    nextFacePose: "Naechster Winkel",
    facePoseFront: "vorne",
    facePoseLeft: "leicht links",
    facePoseRight: "leicht rechts",
    samplesRequiredMessage: "Speichere 3 Gesichtsaufnahmen, bevor du registrierst.",
    samplesReadyMessage: "Alle Gesichtsaufnahmen sind bereit. Du kannst das Profil registrieren.",
    faceSamplesClearedMessage: "Gesichtsaufnahmen geloescht.",
    moveCloserFaceMessage: "Geh naeher zur Kamera, bevor du diese Gesichtsaufnahme speicherst.",
    oneFaceRegistrationMessage: "Bei der Registrierung darf nur ein Gesicht sichtbar sein.",
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
    initialFitnessLabel: "Condicao fisica atual",
    fitnessBeginner: "Iniciante",
    fitnessActive: "Ativo",
    fitnessFit: "Em forma",
    fitnessAthlete: "Atleta",
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
    levelProgress: "Proximo nivel",
    exerciseAiTitle: "IA de exercicio",
    exerciseAiCopy: "Reconhecimento atual do exercicio com aprendizagem local.",
    trainingPlansTitle: "Planos de treino",
    trainingPlansCopy: "Tres planos prontos sao escolhidos pelo teu nivel e ajustados por idade.",
    ageGroupLabel: "Grupo etario",
    planStart: "Iniciar plano",
    nextPlanStep: "Proximo exercicio",
    planStepLabel: "Passo",
    planCompleted: "Plano concluido.",
    youngAgeGroup: "Menos de 18",
    adultAgeGroup: "18-49",
    matureAgeGroup: "50+",
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
    levelUpPrefix: "Subida de nivel! Nivel",
    levelUnlockedSuffix: "desbloqueado.",
    scoreSuffix: "pontos.",
    setsTowardLevelSuffix: "series ate ao proximo nivel.",
    completeMoreSetsPrefix: "Completa",
    moreSetsLevelSuffix: "mais series para chegar ao proximo nivel.",
    newChallengePrefix: "Novo desafio:",
    setWithRepsConnector: "serie(s) com",
    repsEachSuffix: "repeticoes cada.",
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
    registrationSamples: "Amostras do rosto",
    captureFaceSample: "Capturar amostra",
    clearFaceSamples: "Reiniciar amostras",
    faceSampleInstruction: "Captura tres angulos do mesmo rosto: frente, esquerda leve, direita leve.",
    nextFacePose: "Proximo angulo",
    facePoseFront: "frente",
    facePoseLeft: "esquerda leve",
    facePoseRight: "direita leve",
    samplesRequiredMessage: "Captura 3 amostras do rosto antes de registar.",
    samplesReadyMessage: "Todas as amostras estao prontas. Podes registar o perfil.",
    faceSamplesClearedMessage: "Amostras do rosto limpas.",
    moveCloserFaceMessage: "Aproxima-te da camara antes de guardar esta amostra.",
    oneFaceRegistrationMessage: "So um rosto deve estar visivel durante o registo.",
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
    initialFitnessLabel: "Trenutna forma",
    fitnessBeginner: "Pocetnik",
    fitnessActive: "Aktivan",
    fitnessFit: "Spreman",
    fitnessAthlete: "Atleta",
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
    levelProgress: "Sledeci nivo",
    exerciseAiTitle: "AI za vezbe",
    exerciseAiCopy: "Trenutno prepoznavanje vezbe sa lokalnim ucenjem.",
    trainingPlansTitle: "Planovi treninga",
    trainingPlansCopy: "Tri gotova plana biraju se po tvojoj formi i prilagodjavaju godinama.",
    ageGroupLabel: "Starosna grupa",
    planStart: "Pokreni plan",
    nextPlanStep: "Sledeca vezba",
    planStepLabel: "Korak",
    planCompleted: "Plan zavrsen.",
    youngAgeGroup: "Ispod 18",
    adultAgeGroup: "18-49",
    matureAgeGroup: "50+",
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
    levelUpPrefix: "Nivo gore! Nivo",
    levelUnlockedSuffix: "otkljucan.",
    scoreSuffix: "poena.",
    setsTowardLevelSuffix: "serije do sledeceg nivoa.",
    completeMoreSetsPrefix: "Zavrsi",
    moreSetsLevelSuffix: "jos serija do sledeceg nivoa.",
    newChallengePrefix: "Novi izazov:",
    setWithRepsConnector: "serija sa",
    repsEachSuffix: "ponavljanja svaka.",
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
    registrationSamples: "Uzorci lica",
    captureFaceSample: "Sacuvaj uzorak",
    clearFaceSamples: "Resetuj uzorke",
    faceSampleInstruction: "Sacuvaj tri ugla istog lica: napred, blago levo, blago desno.",
    nextFacePose: "Sledeci ugao",
    facePoseFront: "napred",
    facePoseLeft: "blago levo",
    facePoseRight: "blago desno",
    samplesRequiredMessage: "Sacuvaj 3 uzorka lica pre registracije.",
    samplesReadyMessage: "Svi uzorci lica su spremni. Mozes registrovati profil.",
    faceSamplesClearedMessage: "Uzorci lica su obrisani.",
    moveCloserFaceMessage: "Pridji kameri pre cuvanja ovog uzorka.",
    oneFaceRegistrationMessage: "Samo jedno lice treba da bude vidljivo tokom registracije.",
  },
  zh: {
    appTitle: "SportsAI Coach",
    appSubtitle: "人工智能支持的运动训练，具有安全的面部登录和运动跟踪。",
    signedOut: "已退出",
    signedIn: "已登录",
    signIn: "登入",
    register: "登记",
    signInTitle: "人脸识别登录",
    signInCopy: "看着相机。如果识别了多个人，请选择应由谁登录。",
    recognizedFaceLabel: "认出的面孔",
    signInButton: "登入",
    registerTitle: "创建个人资料",
    registerCopy: "输入您的个人资料详细信息并保持您的脸部可见。",
    nameLabel: "姓名",
    ageLabel: "年龄",
    genderLabel: "性别",
    genderFemale: "女性",
    genderMale: "男性",
    genderDiverse: "各种各样的",
    genderPrivate: "宁愿不说",
    initialFitnessLabel: "目前的健身状况",
    fitnessBeginner: "初学者",
    fitnessActive: "积极的",
    fitnessFit: "合身",
    fitnessAthlete: "运动员",
    registerButton: "注册个人资料",
    statusTitle: "地位",
    trainingCopy: "安全登录后该培训区域可见。",
    bioAge: "年龄",
    bioGender: "性别",
    fitnessLevel: "等级",
    score: "分数",
    loginCount: "登录",
    currentGesture: "当前手势",
    cameraFps: "相机帧率",
    warmupTitle: "热身",
    warmupCopy: "保持双手可见并遵循手势反馈。",
    gestureTitle: "手势练习",
    gestureCopy: "尝试张开手、握拳、竖起大拇指、平静和指点。",
    sessionTitle: "会议",
    sessionCopy: "接下来可以在这里扩展训练逻辑。",
    completedSets: "套",
    levelProgress: "下一个级别",
    exerciseAiTitle: "锻炼人工智能",
    exerciseAiCopy: "当前的练习识别与本地学习。",
    trainingPlansTitle: "培训计划",
    trainingPlansCopy: "根据您的健身水平选择三个现成的计划，并按年龄段进行调整。",
    ageGroupLabel: "年龄组",
    planStart: "启动计划",
    nextPlanStep: "下一个练习",
    planStepLabel: "步",
    planCompleted: "计划完成。",
    youngAgeGroup: "18岁以下",
    adultAgeGroup: "18-49",
    matureAgeGroup: "50+",
    exerciseLabel: "锻炼",
    exerciseSource: "来源",
    exerciseReps: "代表",
    exerciseSamples: "样品",
    workoutTarget: "目标",
    workoutState: "放",
    targetMode: "目标模式",
    customTargetLabel: "自定义重复目标",
    levelTargetPlaceholder: "水平目标",
    defaultExerciseGuidance: "选择一项练习，保持全身可见，然后开始一组。",
    invalidTargetMessage: "目标必须是 1 到 100 之间的整数。",
    moveStartGuidance: "显示您的全身并进入锻炼开始位置。",
    wrongExerciseGuidance: "该动作与所选练习不匹配。返回到选定的锻炼开始位置。",
    noRepCountedMessage: "尚未计算重复次数。",
    restGuidance: "设置完成。短暂休息或选择下一个练习。",
    curlUpGuidance: "保持肘部靠近身体，并将一只手向肩膀弯曲。",
    curlDownGuidance: "在下一次弯举之前伸展肘部。",
    jumpUpGuidance: "从基线明显向上跳跃，以便相机可以计数。",
    jumpDownGuidance: "在下一个杰克跳跃前着陆并保持静止。",
    armRaiseUpGuidance: "双手一起举至肩高以上。",
    armRaiseDownGuidance: "在进行下一次动作之前，将双手放低至肩高以下。",
    squatUpGuidance: "弯曲膝盖，进行有控制的下蹲。",
    squatDownGuidance: "在下一次深蹲之前再次站直。",
    sideRaiseUpGuidance: "将双臂侧向举至肩高。",
    sideRaiseDownGuidance: "在下一侧举起之前放下双臂。",
    genericExerciseGuidance: "保持全身可见并遵守锻炼规则。",
    trainingTitle: "训练",
    startSet: "开始设置",
    savePose: "保存姿势",
    trainModel: "火车模型",
    languageSelect: "语言",
    cameraAlt: "带有运动追踪覆盖的实时摄像头",
    workoutProgressLabel: "锻炼进度",
    exerciseSelectLabel: "锻炼",
    exerciseExampleAlt: "练习例子",
    unknown: "未知",
    noneValue: "没有任何",
    idle: "闲置的",
    running: "跑步",
    completed: "完全的",
    up: "向上",
    down: "向下",
    rules: "规则",
    model: "模型",
    level: "等级",
    custom: "风俗",
    openHand: "张开手",
    fist: "拳头",
    thumbsUp: "竖起大拇指",
    peace: "和平",
    pointing: "指点",
    handCurl: "手冰壶",
    jumpExercise: "跳",
    armRaises: "手臂举起",
    squatExercise: "蹲",
    sideArmRaises: "侧臂举起",
    handCurlRule: "从肘部伸展开始。将一只手向肩膀弯曲，然后在下一次动作之前再次伸展肘部。",
    jumpRule: "在跳跃之间保持静止。当两个脚踝都从基线明显向上移动时，一次就算作一次。",
    armRaisesRule: "从双臂向下开始。将双手举至肩高以上，然后再次放下。",
    squatRule: "挺立。弯曲膝盖进行下蹲，然后在下一次动作之前再次站直。",
    sideArmRaisesRule: "从双臂向下开始。将双臂举至肩部高度，然后再次放下。",
    backendDown: "后端未在 http://127.0.0.1:8000 上运行",
    selectExerciseMessage: "选择一个练习并开始一组。",
    noFaceVisibleMessage: "看不到脸。看着相机并重试。",
    noRegisteredFaceMessage: "尚未识别注册的脸部。",
    signInBeforeWorkoutMessage: "开始锻炼前先登录。",
    signInBeforeProgressMessage: "保存进度之前先登录。",
    chooseExerciseMessage: "选择手弯举、跳跃、举臂、深蹲或侧举臂。",
    progressSavedMessage: "进度已保存。",
    signedOutMessage: "已退出。",
    welcomeBackPrefix: "欢迎回来",
    registeredSuffix: "已被注册。选择已识别的面孔进行登录。",
    recognizedPrefix: "认可",
    notPrefix: "不是",
    trainedPrefix: "受训于",
    trainedSuffix: "练习样本。",
    setStartedPrefix: "设置开始",
    waitingForPrefix: "等待",
    repsSuffix: "代表。",
    setCompletePrefix: "设置完成。",
    scoreAndLevelUpSuffix: "得分并升级。",
    levelUpPrefix: "升级！等级",
    levelUnlockedSuffix: "解锁。",
    scoreSuffix: "分数。",
    setsTowardLevelSuffix: "迈向新的水平。",
    completeMoreSetsPrefix: "完全的",
    moreSetsLevelSuffix: "更多组以达到下一个级别。",
    newChallengePrefix: "新挑战：",
    setWithRepsConnector: "设置为",
    repsEachSuffix: "每个代表。",
    logout: "退出",
    waiting: "等待相机...",
    enterName: "请输入您的姓名。",
    enterAge: "请输入有效的年龄。",
    noProfiles: "没有任何",
    yes: "是的",
    no: "不",
    faces: "面孔",
    gestures: "手势",
    profiles: "型材",
    faceIdReady: "人脸登录准备就绪",
    noRecognizedFace: "尚未识别出面孔",
    detectedUser: "检测到",
    loginReadyHint: "相机准备好了。保持脸部居中并继续。",
    loginWaitingHint: "等待相机。如果这花费的时间太长，请检查相机权限。",
    registrationSamples: "人脸样本",
    captureFaceSample: "采集样本",
    clearFaceSamples: "重置样本",
    faceSampleInstruction: "捕捉同一张脸的三个角度：正面、微左、微右。",
    nextFacePose: "下一个角度",
    facePoseFront: "正面",
    facePoseLeft: "稍微向左",
    facePoseRight: "稍微偏右",
    samplesRequiredMessage: "注册前采集 3 个面部样本。",
    samplesReadyMessage: "所有面部样本均已准备就绪。您现在可以注册个人资料。",
    faceSamplesClearedMessage: "面部样本已清除。",
    moveCloserFaceMessage: "在保存此面部样本之前，靠近相机。",
    oneFaceRegistrationMessage: "注册期间只能看到一张脸。",
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
    initialFitnessLabel: "Forme actuelle",
    fitnessBeginner: "Debutant",
    fitnessActive: "Actif",
    fitnessFit: "En forme",
    fitnessAthlete: "Athlete",
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
    levelProgress: "Niveau suivant",
    exerciseAiTitle: "IA d'exercice",
    exerciseAiCopy: "Reconnaissance actuelle de l'exercice avec apprentissage local.",
    trainingPlansTitle: "Plans d'entrainement",
    trainingPlansCopy: "Trois plans prets sont choisis selon votre niveau et ajustes par age.",
    ageGroupLabel: "Groupe d'age",
    planStart: "Demarrer le plan",
    nextPlanStep: "Exercice suivant",
    planStepLabel: "Etape",
    planCompleted: "Plan termine.",
    youngAgeGroup: "Moins de 18",
    adultAgeGroup: "18-49",
    matureAgeGroup: "50+",
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
    levelUpPrefix: "Niveau gagne ! Niveau",
    levelUnlockedSuffix: "debloque.",
    scoreSuffix: "points.",
    setsTowardLevelSuffix: "series avant le niveau suivant.",
    completeMoreSetsPrefix: "Terminez",
    moreSetsLevelSuffix: "series de plus pour atteindre le niveau suivant.",
    newChallengePrefix: "Nouveau defi :",
    setWithRepsConnector: "serie(s) avec",
    repsEachSuffix: "repetitions chacune.",
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
    registrationSamples: "Echantillons du visage",
    captureFaceSample: "Capturer",
    clearFaceSamples: "Reinitialiser",
    faceSampleInstruction: "Capturez trois angles du meme visage : face, legerement gauche, legerement droite.",
    nextFacePose: "Angle suivant",
    facePoseFront: "face",
    facePoseLeft: "legerement gauche",
    facePoseRight: "legerement droite",
    samplesRequiredMessage: "Capturez 3 echantillons du visage avant l'inscription.",
    samplesReadyMessage: "Tous les echantillons sont prets. Vous pouvez inscrire le profil.",
    faceSamplesClearedMessage: "Echantillons du visage effaces.",
    moveCloserFaceMessage: "Rapprochez-vous de la camera avant de capturer cet echantillon.",
    oneFaceRegistrationMessage: "Un seul visage doit etre visible pendant l'inscription.",
  },
  ta: {
    appTitle: "SportsAI Coach",
    appSubtitle: "பாதுகாப்பான முக உள்நுழைவு மற்றும் மோஷன் டிராக்கிங்குடன் AI-ஆதரவு விளையாட்டுப் பயிற்சி.",
    signedOut: "வெளியேறினார்",
    signedIn: "உள்நுழைந்துள்ளீர்கள்",
    signIn: "உள்நுழைக",
    register: "பதிவு செய்யுங்கள்",
    signInTitle: "முகம் அறிதல் மூலம் உள்நுழையவும்",
    signInCopy: "கேமராவில் பாருங்கள். ஒன்றுக்கும் மேற்பட்ட நபர்கள் அங்கீகரிக்கப்பட்டிருந்தால், யார் உள்நுழைய வேண்டும் என்பதைத் தேர்வுசெய்யவும்.",
    recognizedFaceLabel: "அடையாளம் தெரிந்த முகம்",
    signInButton: "உள்நுழைக",
    registerTitle: "சுயவிவரத்தை உருவாக்கவும்",
    registerCopy: "உங்கள் சுயவிவர விவரங்களை உள்ளிட்டு உங்கள் முகம் தெரியும்படி வைக்கவும்.",
    nameLabel: "பெயர்",
    ageLabel: "வயது",
    genderLabel: "பாலினம்",
    genderFemale: "பெண்",
    genderMale: "ஆண்",
    genderDiverse: "பலதரப்பட்ட",
    genderPrivate: "சொல்லாமல் இருக்க விருப்பம்",
    initialFitnessLabel: "தற்போதைய உடற்பயிற்சி",
    fitnessBeginner: "ஆரம்பநிலை",
    fitnessActive: "செயலில்",
    fitnessFit: "பொருத்தம்",
    fitnessAthlete: "தடகள வீரர்",
    registerButton: "பதிவு சுயவிவரம்",
    statusTitle: "நிலை",
    trainingCopy: "பாதுகாப்பான உள்நுழைவுக்குப் பிறகு இந்தப் பயிற்சிப் பகுதி தெரியும்.",
    bioAge: "வயது",
    bioGender: "பாலினம்",
    fitnessLevel: "நிலை",
    score: "மதிப்பெண்",
    loginCount: "உள்நுழைவுகள்",
    currentGesture: "தற்போதைய சைகை",
    cameraFps: "கேமரா FPS",
    warmupTitle: "வார்ம்-அப்",
    warmupCopy: "உங்கள் கைகளைத் தெரியும்படி வைத்து, சைகை கருத்தைப் பின்பற்றவும்.",
    gestureTitle: "சைகை பயிற்சி",
    gestureCopy: "திறந்த கை, முஷ்டி, கட்டைவிரல், அமைதி மற்றும் சுட்டிக்காட்டி முயற்சிக்கவும்.",
    sessionTitle: "அமர்வு",
    sessionCopy: "பயிற்சி தர்க்கத்தை அடுத்து இங்கு விரிவாக்கலாம்.",
    completedSets: "அமைக்கிறது",
    levelProgress: "அடுத்த நிலை",
    exerciseAiTitle: "உடற்பயிற்சி AI",
    exerciseAiCopy: "உள்ளூர் கற்றலுடன் தற்போதைய உடற்பயிற்சி அங்கீகாரம்.",
    trainingPlansTitle: "பயிற்சி திட்டங்கள்",
    trainingPlansCopy: "மூன்று ஆயத்த திட்டங்கள் உங்கள் உடற்தகுதி நிலைக்குத் தேர்ந்தெடுக்கப்பட்டு வயதுக்கு ஏற்ப சரிசெய்யப்படுகின்றன.",
    ageGroupLabel: "வயது பிரிவு",
    planStart: "திட்டத்தைத் தொடங்கவும்",
    nextPlanStep: "அடுத்த உடற்பயிற்சி",
    planStepLabel: "படி",
    planCompleted: "திட்டம் முடிந்தது.",
    youngAgeGroup: "18 வயதிற்குட்பட்டவர்கள்",
    adultAgeGroup: "18-49",
    matureAgeGroup: "50+",
    exerciseLabel: "உடற்பயிற்சி",
    exerciseSource: "ஆதாரம்",
    exerciseReps: "பிரதிநிதிகள்",
    exerciseSamples: "மாதிரிகள்",
    workoutTarget: "இலக்கு",
    workoutState: "அமைக்கவும்",
    targetMode: "இலக்கு முறை",
    customTargetLabel: "தனிப்பயன் மீண்டும் மீண்டும் இலக்கு",
    levelTargetPlaceholder: "நிலை இலக்கு",
    defaultExerciseGuidance: "ஒரு உடற்பயிற்சியைத் தேர்ந்தெடுங்கள், உங்கள் முழு உடலையும் தெரியும்படி வைத்துக் கொள்ளுங்கள், பின்னர் ஒரு தொகுப்பைத் தொடங்கவும்.",
    invalidTargetMessage: "இலக்கு 1 முதல் 100 வரையிலான முழு எண்ணாக இருக்க வேண்டும்.",
    moveStartGuidance: "உங்கள் முழு உடலையும் காட்டி, உடற்பயிற்சியின் தொடக்க நிலைக்குச் செல்லவும்.",
    wrongExerciseGuidance: "அந்த இயக்கம் தேர்ந்தெடுக்கப்பட்ட உடற்பயிற்சியுடன் பொருந்தவில்லை. தேர்ந்தெடுக்கப்பட்ட உடற்பயிற்சி தொடக்க நிலைக்குத் திரும்புக.",
    noRepCountedMessage: "மீண்டும் மீண்டும் எண்ணப்படவில்லை.",
    restGuidance: "செட் முடிந்தது. சிறிது நேரம் ஓய்வெடுங்கள் அல்லது அடுத்த பயிற்சியைத் தேர்ந்தெடுக்கவும்.",
    curlUpGuidance: "முழங்கையை உங்கள் உடலின் அருகில் வைத்து, ஒரு கையை தோள்பட்டை நோக்கி வளைக்கவும்.",
    curlDownGuidance: "அடுத்த சுருட்டைக்கு முன் முழங்கையை நீட்டவும்.",
    jumpUpGuidance: "பேஸ்லைனில் இருந்து தெளிவாக மேல்நோக்கிச் செல்லவும், அதனால் கேமரா அதை எண்ணும்.",
    jumpDownGuidance: "தரையிறங்கி, அடுத்த ஜம்பிங் ஜாக் முன் அசையாமல் நிற்கவும்.",
    armRaiseUpGuidance: "தோள்பட்டை உயரத்திற்கு மேல் இரு கைகளையும் ஒன்றாக உயர்த்தவும்.",
    armRaiseDownGuidance: "அடுத்த பிரதிநிதிக்கு முன் இரு கைகளையும் தோள்பட்டை உயரத்திற்கு கீழே இறக்கவும்.",
    squatUpGuidance: "கட்டுப்படுத்தப்பட்ட குந்துக்குள் உங்கள் முழங்கால்களை வளைக்கவும்.",
    squatDownGuidance: "அடுத்த குந்துக்கு முன் மீண்டும் உயரமாக நிற்கவும்.",
    sideRaiseUpGuidance: "தோள்பட்டை உயரத்திற்கு இரு கைகளையும் பக்கவாட்டில் உயர்த்தவும்.",
    sideRaiseDownGuidance: "அடுத்த பக்கத்தை உயர்த்துவதற்கு முன் இரு கைகளையும் கீழே இறக்கவும்.",
    genericExerciseGuidance: "உங்கள் முழு உடலையும் பார்க்க வைத்து உடற்பயிற்சி விதியை பின்பற்றவும்.",
    trainingTitle: "பயிற்சி",
    startSet: "தொடங்கவும்",
    savePose: "போஸை சேமிக்கவும்",
    trainModel: "ரயில் மாதிரி",
    languageSelect: "மொழி",
    cameraAlt: "ஸ்போர்ட்ஸ் டிராக்கிங் மேலடுக்கு கொண்ட நேரடி கேமரா",
    workoutProgressLabel: "உடற்பயிற்சி முன்னேற்றம்",
    exerciseSelectLabel: "உடற்பயிற்சி",
    exerciseExampleAlt: "உடற்பயிற்சி உதாரணம்",
    unknown: "தெரியவில்லை",
    noneValue: "எதுவும் இல்லை",
    idle: "சும்மா",
    running: "ஓடுகிறது",
    completed: "நிறைவு",
    up: "வரை",
    down: "கீழே",
    rules: "விதிகள்",
    model: "மாதிரி",
    level: "நிலை",
    custom: "வழக்கம்",
    openHand: "திறந்த கை",
    fist: "முஷ்டி",
    thumbsUp: "கட்டைவிரல் மேலே",
    peace: "அமைதி",
    pointing: "சுட்டி",
    handCurl: "கை கர்லிங்",
    jumpExercise: "தாவி",
    armRaises: "கை உயர்த்துகிறது",
    squatExercise: "குந்து",
    sideArmRaises: "பக்க கையை உயர்த்துகிறது",
    handCurlRule: "நீட்டிக்கப்பட்ட முழங்கையுடன் தொடங்குங்கள். தோள்பட்டை நோக்கி ஒரு கையை சுருட்டி, அடுத்த பிரதிநிதிக்கு முன் மீண்டும் முழங்கையை நீட்டவும்.",
    jumpRule: "தாவல்களுக்கு இடையில் அசையாமல் நிற்கவும். இரண்டு கணுக்கால்களும் அடித்தளத்திலிருந்து மேல்நோக்கி தெளிவாக நகரும்போது ஒரு பிரதிநிதி கணக்கிடப்படுகிறது.",
    armRaisesRule: "இரண்டு கைகளையும் கீழே வைத்து தொடங்குங்கள். தோள்பட்டை உயரத்திற்கு மேல் இரு கைகளையும் உயர்த்தி, மீண்டும் கீழே இறக்கவும்.",
    squatRule: "நிமிர்ந்து நில்லுங்கள். உங்கள் முழங்கால்களை ஒரு குந்துவாக வளைத்து, அடுத்த பிரதிநிதிக்கு முன் மீண்டும் உயரமாக நிற்கவும்.",
    sideArmRaisesRule: "கைகளை கீழே கொண்டு தொடங்குங்கள். இரு கைகளையும் தோள்பட்டை உயரத்திற்கு உயர்த்தி, மீண்டும் கீழே இறக்கவும்.",
    backendDown: "பின்தளம் http://127.0.0.1:8000 இல் இயங்கவில்லை",
    selectExerciseMessage: "ஒரு உடற்பயிற்சியைத் தேர்ந்தெடுத்து ஒரு தொகுப்பைத் தொடங்கவும்.",
    noFaceVisibleMessage: "முகம் தெரியவில்லை. கேமராவைப் பார்த்து மீண்டும் முயலவும்.",
    noRegisteredFaceMessage: "பதிவு செய்யப்பட்ட முகம் இன்னும் அடையாளம் காணப்படவில்லை.",
    signInBeforeWorkoutMessage: "உடற்பயிற்சியைத் தொடங்கும் முன் உள்நுழையவும்.",
    signInBeforeProgressMessage: "முன்னேற்றத்தைச் சேமிப்பதற்கு முன் உள்நுழையவும்.",
    chooseExerciseMessage: "கை கர்லிங், ஜம்ப், ஆர்ம் ரைஸ், குந்து அல்லது சைட் ஆர்ம் ரைஸ் ஆகியவற்றைத் தேர்ந்தெடுக்கவும்.",
    progressSavedMessage: "முன்னேற்றம் சேமிக்கப்பட்டது.",
    signedOutMessage: "வெளியேறினார்.",
    welcomeBackPrefix: "மீண்டும் வரவேற்கிறோம்",
    registeredSuffix: "பதிவு செய்யப்பட்டுள்ளது. உள்நுழைய அங்கீகரிக்கப்பட்ட முகத்தைத் தேர்ந்தெடுக்கவும்.",
    recognizedPrefix: "அங்கீகரிக்கப்பட்டது",
    notPrefix: "இல்லை",
    trainedPrefix: "மீது பயிற்சி பெற்றார்",
    trainedSuffix: "உடற்பயிற்சி மாதிரிகள்.",
    setStartedPrefix: "தொடங்கப்பட்டது",
    waitingForPrefix: "காத்திருக்கிறது",
    repsSuffix: "பிரதிநிதிகள்.",
    setCompletePrefix: "செட் முடிந்தது.",
    scoreAndLevelUpSuffix: "மதிப்பெண் மற்றும் நிலை.",
    levelUpPrefix: "நிலை! நிலை",
    levelUnlockedSuffix: "திறக்கப்பட்டது.",
    scoreSuffix: "மதிப்பெண்.",
    setsTowardLevelSuffix: "அடுத்த கட்டத்தை நோக்கி அமைகிறது.",
    completeMoreSetsPrefix: "நிறைவு",
    moreSetsLevelSuffix: "அடுத்த நிலையை அடைய அதிக தொகுப்பு(கள்).",
    newChallengePrefix: "புதிய சவால்:",
    setWithRepsConnector: "உடன் தொகுப்பு(கள்).",
    repsEachSuffix: "ஒவ்வொரு பிரதிநிதிகள்.",
    logout: "வெளியேறு",
    waiting: "கேமராவுக்காகக் காத்திருக்கிறது...",
    enterName: "தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்.",
    enterAge: "சரியான வயதை உள்ளிடவும்.",
    noProfiles: "எதுவும் இல்லை",
    yes: "ஆம்",
    no: "இல்லை",
    faces: "முகங்கள்",
    gestures: "சைகைகள்",
    profiles: "சுயவிவரங்கள்",
    faceIdReady: "முக உள்நுழைவு தயார்",
    noRecognizedFace: "இன்னும் அடையாளம் தெரியாத முகம்",
    detectedUser: "கண்டறியப்பட்டது",
    loginReadyHint: "கேமரா தயாராக உள்ளது. உங்கள் முகத்தை மையமாக வைத்து தொடரவும்.",
    loginWaitingHint: "கேமராவுக்காக காத்திருக்கிறேன். இதற்கு அதிக நேரம் எடுத்தால் கேமரா அனுமதியைச் சரிபார்க்கவும்.",
    registrationSamples: "முக மாதிரிகள்",
    captureFaceSample: "மாதிரியைப் பிடிக்கவும்",
    clearFaceSamples: "மாதிரிகளை மீட்டமைக்கவும்",
    faceSampleInstruction: "ஒரே முகத்தின் மூன்று கோணங்களைப் பிடிக்கவும்: முன், சற்று இடது, சிறிது வலது.",
    nextFacePose: "அடுத்த கோணம்",
    facePoseFront: "முன்",
    facePoseLeft: "சிறிது இடது",
    facePoseRight: "சிறிது வலது",
    samplesRequiredMessage: "பதிவு செய்வதற்கு முன் 3 முக மாதிரிகளைப் பிடிக்கவும்.",
    samplesReadyMessage: "அனைத்து முக மாதிரிகளும் தயாராக உள்ளன. நீங்கள் இப்போது சுயவிவரத்தை பதிவு செய்யலாம்.",
    faceSamplesClearedMessage: "முக மாதிரிகள் அழிக்கப்பட்டன.",
    moveCloserFaceMessage: "இந்த முக மாதிரியைச் சேமிப்பதற்கு முன் கேமராவிற்கு அருகில் செல்லவும்.",
    oneFaceRegistrationMessage: "பதிவின் போது ஒரு முகம் மட்டுமே தெரியும்.",
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
    initialFitnessLabel: "Fitness ya riu",
    fitnessBeginner: "Mwendi wa mbere",
    fitnessActive: "Murathii",
    fitnessFit: "Fit",
    fitnessAthlete: "Athlete",
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
    levelProgress: "Level ingi",
    exerciseAiTitle: "AI ya mathomo",
    exerciseAiCopy: "Kumenya mathomo kwa riu na guthoma kwa kompiuta.",
    trainingPlansTitle: "Mipango ya guthomithia",
    trainingPlansCopy: "Mipango itatu ithuurwo kuringana na fitness na miaka.",
    ageGroupLabel: "Ikundi ria miaka",
    planStart: "Ambia mpango",
    nextPlanStep: "Ithomo ringi",
    planStepLabel: "Hatua",
    planCompleted: "Mpango niwathira.",
    youngAgeGroup: "Thi ya 18",
    adultAgeGroup: "18-49",
    matureAgeGroup: "50+",
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
    levelUpPrefix: "Level iguru! Level",
    levelUnlockedSuffix: "niyakinguka.",
    scoreSuffix: "score.",
    setsTowardLevelSuffix: "seti nginya level ingi.",
    completeMoreSetsPrefix: "Hinga",
    moreSetsLevelSuffix: "seti ingi nginya level ingi.",
    newChallengePrefix: "Challenge njeru:",
    setWithRepsConnector: "seti na",
    repsEachSuffix: "mahinda o seti.",
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
    registrationSamples: "Mihiano ya uso",
    captureFaceSample: "Hifadhi muhiano",
    clearFaceSamples: "Ambia ringi",
    faceSampleInstruction: "Hifadhi uso umwe mara ithatu: mbere, mwena wa umotho, mwena wa urio.",
    nextFacePose: "Mwena ucio ukurikira",
    facePoseFront: "mbere",
    facePoseLeft: "umotho hanini",
    facePoseRight: "urio hanini",
    samplesRequiredMessage: "Hifadhi mihiano 3 ya uso mbere ya kwandikithia.",
    samplesReadyMessage: "Mihiano yothe ya uso ni tayari. No wandikithie profile.",
    faceSamplesClearedMessage: "Mihiano ya uso ithirwo.",
    moveCloserFaceMessage: "Thi hakuhi na camera mbere ya kuhifadhi muhiano uyu.",
    oneFaceRegistrationMessage: "Uso umwe wiki niwo ugomba kuonekana hingo ya kwandikithia.",
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
const fitnessLevelOptions = ["beginner", "active", "fit", "athlete"] as const;
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

type TrainingPlan = {
  id: string;
  fitnessLevel: FitnessLevel;
  title: string;
  steps: Array<{
    exercise: (typeof exerciseOptions)[number];
    reps: number;
  }>;
};

const trainingPlans: Record<FitnessLevel, TrainingPlan[]> = {
  beginner: [
    { id: "beginner-foundation", fitnessLevel: "beginner", title: "Foundation", steps: [{ exercise: "hand_curl", reps: 5 }, { exercise: "squat", reps: 5 }, { exercise: "arm_raises", reps: 5 }] },
    { id: "beginner-mobility", fitnessLevel: "beginner", title: "Mobility", steps: [{ exercise: "arm_raises", reps: 5 }, { exercise: "side_arm_raises", reps: 5 }, { exercise: "hand_curl", reps: 5 }] },
    { id: "beginner-energy", fitnessLevel: "beginner", title: "Energy", steps: [{ exercise: "jump", reps: 5 }, { exercise: "hand_curl", reps: 5 }, { exercise: "squat", reps: 5 }] },
  ],
  active: [
    { id: "active-balance", fitnessLevel: "active", title: "Balance", steps: [{ exercise: "hand_curl", reps: 8 }, { exercise: "jump", reps: 8 }, { exercise: "squat", reps: 8 }] },
    { id: "active-upper", fitnessLevel: "active", title: "Upper Body", steps: [{ exercise: "arm_raises", reps: 8 }, { exercise: "side_arm_raises", reps: 8 }, { exercise: "hand_curl", reps: 8 }] },
    { id: "active-cardio", fitnessLevel: "active", title: "Cardio Mix", steps: [{ exercise: "jump", reps: 10 }, { exercise: "squat", reps: 8 }, { exercise: "arm_raises", reps: 8 }] },
  ],
  fit: [
    { id: "fit-strength", fitnessLevel: "fit", title: "Strength", steps: [{ exercise: "squat", reps: 12 }, { exercise: "hand_curl", reps: 12 }, { exercise: "side_arm_raises", reps: 12 }] },
    { id: "fit-endurance", fitnessLevel: "fit", title: "Endurance", steps: [{ exercise: "jump", reps: 14 }, { exercise: "arm_raises", reps: 12 }, { exercise: "squat", reps: 12 }] },
    { id: "fit-control", fitnessLevel: "fit", title: "Control", steps: [{ exercise: "side_arm_raises", reps: 12 }, { exercise: "hand_curl", reps: 12 }, { exercise: "arm_raises", reps: 12 }] },
  ],
  athlete: [
    { id: "athlete-power", fitnessLevel: "athlete", title: "Power", steps: [{ exercise: "jump", reps: 18 }, { exercise: "squat", reps: 16 }, { exercise: "hand_curl", reps: 16 }] },
    { id: "athlete-volume", fitnessLevel: "athlete", title: "Volume", steps: [{ exercise: "arm_raises", reps: 16 }, { exercise: "side_arm_raises", reps: 16 }, { exercise: "squat", reps: 16 }] },
    { id: "athlete-full", fitnessLevel: "athlete", title: "Full Body", steps: [{ exercise: "jump", reps: 18 }, { exercise: "hand_curl", reps: 16 }, { exercise: "side_arm_raises", reps: 16 }] },
  ],
};

export default function Home() {
  const [language, setLanguage] = useState<Language>("en");
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [tab, setTab] = useState<"sign-in" | "register">("sign-in");
  const [message, setMessage] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<(typeof genderOptions)[number]>("female");
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>("beginner");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [exerciseLabel, setExerciseLabel] = useState<(typeof exerciseOptions)[number]>("hand_curl");
  const [customTarget, setCustomTarget] = useState("");
  const [activePlanId, setActivePlanId] = useState("");
  const [expandedPlanId, setExpandedPlanId] = useState("");
  const [activePlanStep, setActivePlanStep] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState("#edf3fa");
  const [buttonColor, setButtonColor] = useState("#1769e0");
  const [textColor, setTextColor] = useState("#18202f");

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
  const translateFitnessLevel = (value: string | null | undefined) => {
    const keys: Record<string, string> = {
      beginner: "fitnessBeginner",
      active: "fitnessActive",
      fit: "fitnessFit",
      athlete: "fitnessAthlete",
    };
    const normalized = value || "beginner";
    return text(keys[normalized] ?? "fitnessBeginner", normalized);
  };
  const translateFacePose = (value: string | null | undefined) => {
    const keys: Record<string, string> = {
      front: "facePoseFront",
      left: "facePoseLeft",
      right: "facePoseRight",
    };
    const normalized = value || "front";
    return text(keys[normalized] ?? "facePoseFront", normalized);
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
    if (value === "Only one face should be visible during registration.") {
      return text("oneFaceRegistrationMessage", value);
    }
    if (value === "Move closer to the camera before saving this face sample.") {
      return text("moveCloserFaceMessage", value);
    }
    if (value === "All face samples are ready. You can register the profile now.") {
      return text("samplesReadyMessage", value);
    }
    if (value === "Face samples cleared.") {
      return text("faceSamplesClearedMessage", value);
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

    match = value.match(/^(.+) has been registered with (\d+) face samples\. Select the recognized face to sign in\.$/);
    if (match) {
      return `${match[1]} ${text("registeredSuffix", "has been registered. Select the recognized face to sign in.")}`;
    }

    match = value.match(/^Face sample (\d+)\/3 saved from (.+)\. Next: turn (.+)\.$/);
    if (match) {
      return `${text("registrationSamples", "Face samples")} ${match[1]}/3: ${translateFacePose(match[2])}. ${text("nextFacePose", "Next angle")}: ${translateFacePose(match[3])}.`;
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

    match = value.match(/^Level up! Level (\d+) unlocked\. \+(\d+) score\.$/);
    if (match) {
      return `${text("levelUpPrefix", "Level up! Level")} ${match[1]} ${text("levelUnlockedSuffix", "unlocked.")} +${match[2]} ${text("scoreSuffix", "score.")}`;
    }

    match = value.match(/^Set complete\. (\d+)\/(\d+) sets toward next level\. \+(\d+) score\.$/);
    if (match) {
      return `${text("setCompletePrefix", "Set complete.")} ${match[1]}/${match[2]} ${text("setsTowardLevelSuffix", "sets toward next level.")} +${match[3]} ${text("scoreSuffix", "score.")}`;
    }

    match = value.match(/^Complete (\d+) more set\(s\) to reach the next level\.$/);
    if (match) {
      return `${text("completeMoreSetsPrefix", "Complete")} ${match[1]} ${text("moreSetsLevelSuffix", "more set(s) to reach the next level.")}`;
    }

    match = value.match(/^New challenge: (\d+) set\(s\) with (\d+) reps each\.$/);
    if (match) {
      return `${text("newChallengePrefix", "New challenge:")} ${match[1]} ${text("setWithRepsConnector", "set(s) with")} ${match[2]} ${text("repsEachSuffix", "reps each.")}`;
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
  const profileFitnessLevel = activeProfile?.fitnessLevel ?? "beginner";
  const profilePlans = trainingPlans[profileFitnessLevel] ?? trainingPlans.beginner;
  const activePlan = profilePlans.find((plan) => plan.id === activePlanId) ?? null;
  const ageGroup = (() => {
    const value = activeProfile?.age ?? 25;
    if (value < 18) return "youngAgeGroup";
    if (value >= 50) return "matureAgeGroup";
    return "adultAgeGroup";
  })();
  const ageRepAdjustment = ageGroup === "youngAgeGroup" ? -1 : ageGroup === "matureAgeGroup" ? -2 : 0;
  const adjustedPlanReps = (reps: number) => Math.max(3, reps + ageRepAdjustment);
  const startTrainingPlan = async (plan: TrainingPlan, stepIndex = 0) => {
    const step = plan.steps[stepIndex];
    if (!step) {
      setMessage(text("planCompleted", "Plan completed."));
      return;
    }
    setActivePlanId(plan.id);
    setExpandedPlanId(plan.id);
    setActivePlanStep(stepIndex);
    setExerciseLabel(step.exercise);
    setCustomTarget("");
    await startWorkout(step.exercise, adjustedPlanReps(step.reps));
  };
  const startNextPlanStep = async () => {
    if (!activePlan) return;
    await startTrainingPlan(activePlan, activePlanStep + 1);
  };
  const gestureText = status?.gestures.length
    ? status.gestures.map((entry) => translateStatusValue(entry.label)).join(", ")
    : text("unknown", "unknown");
  const profileText = status?.profiles.length
    ? status.profiles.map((entry) => entry.name).join(", ")
    : t.noProfiles;
  const registrationSamplesReady = Math.min(
    status?.registrationSamplesReady ?? 0,
    status?.minRegistrationSamples ?? 3,
  );
  const registrationSampleText = `${registrationSamplesReady}/${status?.minRegistrationSamples ?? 3}`;

  useEffect(() => {
    const stored = localStorage.getItem("siavi-language") as Language | null;
    if (stored && stored in translations) {
      setLanguage(stored);
    }
    setBackgroundColor(localStorage.getItem("siavi-bg-color") || "#edf3fa");
    setButtonColor(localStorage.getItem("siavi-button-color") || "#1769e0");
    setTextColor(localStorage.getItem("siavi-text-color") || "#18202f");
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem("siavi-language", language);
  }, [language]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--ui-bg", backgroundColor);
    root.style.setProperty("--ui-primary", buttonColor);
    root.style.setProperty("--ui-primary-soft", `${buttonColor}18`);
    root.style.setProperty("--ui-text", textColor);
    root.style.setProperty("--ui-muted", `${textColor}b3`);
    localStorage.setItem("siavi-bg-color", backgroundColor);
    localStorage.setItem("siavi-button-color", buttonColor);
    localStorage.setItem("siavi-text-color", textColor);
  }, [backgroundColor, buttonColor, textColor]);

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
    if (registrationSamplesReady < (status?.minRegistrationSamples ?? 3)) {
      setMessage(text("samplesRequiredMessage", "Capture 3 face samples before registering."));
      return;
    }

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        age: parsedAge,
        gender,
        fitnessLevel,
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

  async function startWorkout(
    exerciseOverride = exerciseLabel,
    targetOverride?: number,
  ) {
    const parsedTarget = targetOverride ?? (customTarget.trim() ? Number(customTarget) : undefined);
    if (parsedTarget !== undefined && (!Number.isInteger(parsedTarget) || parsedTarget < 1 || parsedTarget > 100)) {
      setMessage(text("invalidTargetMessage", "Target must be a whole number from 1 to 100."));
      return;
    }

    const response = await fetch("/api/workout/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercise: exerciseOverride, targetReps: parsedTarget }),
    });
    const result = (await response.json()) as { message: string };
    setMessage(result.message);
  }

  async function captureRegistrationSample() {
    const response = await fetch("/api/register/sample", { method: "POST" });
    const result = (await response.json()) as { message: string };
    setMessage(result.message);
  }

  async function clearRegistrationSamples() {
    const response = await fetch("/api/register/samples/clear", { method: "POST" });
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
            <div className="profileTools">
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
                    <ProfileRow
                      label={text("initialFitnessLabel", "Current fitness")}
                      value={translateFitnessLevel(activeProfile?.fitnessLevel)}
                    />
                    <ProfileRow label={t.score} value={activeProfile?.score ?? 0} />
                    <ProfileRow label={t.loginCount} value={activeProfile?.loginCount ?? 0} />
                    <ProfileRow
                      label={text("completedSets", "Sets")}
                      value={activeProfile?.completedSets ?? 0}
                    />
                  </div>
                ) : null}
              </div>
              <div className="paletteControl" aria-label={text("colorPalette", "Color palette")}>
                <label title="Background">
                  <span>BG</span>
                  <input
                    aria-label="Background color"
                    className="colorPicker"
                    type="color"
                    value={backgroundColor}
                    onChange={(event) => setBackgroundColor(event.target.value)}
                  />
                </label>
                <label title="Buttons">
                  <span>Button</span>
                  <input
                    aria-label="Button color"
                    className="colorPicker"
                    type="color"
                    value={buttonColor}
                    onChange={(event) => setButtonColor(event.target.value)}
                  />
                </label>
                <label title="Text">
                  <span>Text</span>
                  <input
                    aria-label="Text color"
                    className="colorPicker"
                    type="color"
                    value={textColor}
                    onChange={(event) => setTextColor(event.target.value)}
                  />
                </label>
              </div>
              <div className="rulesMenu">
                <button
                  className="rulesButton"
                  type="button"
                  aria-expanded={rulesOpen}
                  onClick={() => setRulesOpen((open) => !open)}
                >
                  {text("rules", "rules")}
                </button>
                {rulesOpen ? (
                  <div className="rulesPopover">
                    {exerciseOptions.map((option) => (
                      <div key={option}>
                        <strong>{translateExerciseName(option)}</strong>
                        <span>{text(exerciseRuleKeys[option], "")}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </header>

      {isAuthenticated ? (
        <section className="sessionBar">
          <div className="sessionIdentity">
            <span className="statusDot" aria-hidden="true" />
            <div>
              <strong>{activeProfile?.name ?? status?.authenticatedName ?? t.signedIn}</strong>
              <span>
                {text("initialFitnessLabel", "Current fitness")}: {translateFitnessLevel(profileFitnessLevel)}
              </span>
            </div>
          </div>
          <div className="sessionStats">
            <Metric label={t.fitnessLevel} value={activeProfile?.level ?? 1} />
            <Metric label={t.score} value={activeProfile?.score ?? 0} />
            <Metric
              label={text("completedSets", "Sets")}
              value={activeProfile?.completedSets ?? 0}
            />
          </div>
          <button className="secondary" type="button" onClick={logout}>
            {t.logout}
          </button>
        </section>
      ) : null}

      <section className={isAuthenticated ? "layout authenticatedLayout" : "layout"}>
        <div className="cameraColumn">
          <div className="cameraPanel">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/video.mjpg" alt={text("cameraAlt", "Live camera with sports tracking overlay")} />
            {!isAuthenticated ? (
              <div className={status?.recognitionReady ? "cameraBadge ready" : "cameraBadge"}>
                {status?.recognitionReady
                  ? text("loginReadyHint", "Camera is ready. Keep your face centered and continue.")
                  : text("loginWaitingHint", "Waiting for the camera. Check camera permission if this takes too long.")}
              </div>
            ) : null}
          </div>
          {isAuthenticated && exampleImage ? (
            <div className="exercisePreview">
              <div className="exerciseExample">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={exampleImage}
                  alt={`${translateExerciseName(previewExercise)} ${text("exerciseExampleAlt", "exercise example")}`}
                />
              </div>
              <div className="exerciseLiveStatus">
                <div className="metrics compactMetrics">
                  <Metric
                    label={text("exerciseLabel", "Exercise")}
                    value={translateExerciseName(previewExercise)}
                  />
                  <Metric
                    label={text("workoutTarget", "Target")}
                    value={`${workout?.currentReps ?? 0}/${workout?.targetReps ?? 5}`}
                  />
                  <Metric label={t.fitnessLevel} value={activeProfile?.level ?? 1} />
                  <Metric
                    label={text("levelProgress", "Next level")}
                    value={`${workout?.setsCompletedInLevel ?? 0}/${workout?.setsRequiredForLevel ?? 1}`}
                  />
                  <Metric
                    label={text("completedSets", "Sets")}
                    value={activeProfile?.completedSets ?? 0}
                  />
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
                {activeExerciseRule ? <div className="exerciseRule">{activeExerciseRule}</div> : null}
              </div>
            </div>
          ) : null}
        </div>

        {isAuthenticated ? (
          <aside className="sidePanel exerciseSidePanel">
            <div className="exercisePanel">
              <div>
                <h3>{text("trainingTitle", "Training")}</h3>
                <p>{text("defaultExerciseGuidance", "Choose an exercise, keep your full body visible, then start a set.")}</p>
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
                <button type="button" onClick={() => startWorkout()}>
                  {text("startSet", "Start set")}
                </button>
              </div>
              <div className="planSection">
                <div>
                  <h4>{text("trainingPlansTitle", "Training plans")}</h4>
                  <p>
                    {text("trainingPlansCopy", "Three ready-made plans are selected for your fitness level and adjusted by age group.")}
                  </p>
                  <small>
                    {text("initialFitnessLabel", "Current fitness")}: {translateFitnessLevel(profileFitnessLevel)}
                    {" - "}
                    {text("ageGroupLabel", "Age group")}: {text(ageGroup, "18-49")}
                  </small>
                </div>
                <div className="planGrid">
                  {profilePlans.map((plan) => {
                    const isExpanded = expandedPlanId === plan.id;
                    return (
                      <div className={plan.id === activePlanId ? "planCard active" : "planCard"} key={plan.id}>
                        <button
                          className="planToggle"
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() => setExpandedPlanId(isExpanded ? "" : plan.id)}
                        >
                          <strong>{plan.title}</strong>
                          <span>{isExpanded ? "-" : "+"}</span>
                        </button>
                        {isExpanded ? (
                          <div className="planDetails">
                            <span>
                              {plan.steps
                                .map((step) => `${translateExerciseName(step.exercise)} ${adjustedPlanReps(step.reps)}`)
                                .join(" - ")}
                            </span>
                            <button type="button" onClick={() => startTrainingPlan(plan)}>
                              {text("planStart", "Start plan")}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                {activePlan && workout?.completed ? (
                  <button
                    className="nextPlanButton"
                    type="button"
                    onClick={startNextPlanStep}
                    disabled={activePlanStep >= activePlan.steps.length - 1}
                  >
                    {activePlanStep >= activePlan.steps.length - 1
                      ? text("planCompleted", "Plan completed.")
                      : `${text("nextPlanStep", "Next exercise")} (${text("planStepLabel", "Step")} ${activePlanStep + 2}/${activePlan.steps.length})`}
                  </button>
                ) : null}
              </div>
            </div>
          </aside>
        ) : null}

        {!isAuthenticated ? (
          <aside className="sidePanel authPanel">
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
                <label>
                  {text("initialFitnessLabel", "Current fitness")}
                  <select
                    value={fitnessLevel}
                    onChange={(event) => setFitnessLevel(event.target.value as FitnessLevel)}
                  >
                    {fitnessLevelOptions.map((option) => (
                      <option key={option} value={option}>
                        {translateFitnessLevel(option)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="sampleCapture">
                  <div>
                    <strong>
                      {text("registrationSamples", "Face samples")}: {registrationSampleText}
                    </strong>
                    <span>{text("faceSampleInstruction", "Capture three angles of the same face: front, slight left, slight right.")}</span>
                    <small>
                      {text("nextFacePose", "Next angle")}: {translateFacePose(status?.nextRegistrationPose)}
                    </small>
                  </div>
                  <div className="sampleActions">
                    <button
                      type="button"
                      onClick={captureRegistrationSample}
                      disabled={registrationSamplesReady >= (status?.minRegistrationSamples ?? 3)}
                    >
                      {text("captureFaceSample", "Capture sample")}
                    </button>
                    <button type="button" onClick={clearRegistrationSamples}>
                      {text("clearFaceSamples", "Reset samples")}
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={registerFace}
                  disabled={registrationSamplesReady < (status?.minRegistrationSamples ?? 3)}
                >
                  {t.registerButton}
                </button>
              </section>
            )}

            <div className="message">{translateMessage(message || t.waiting)}</div>
          </aside>
        ) : null}
      </section>

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

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric">
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  );
}
