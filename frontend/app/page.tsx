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
  state: string;
  message: string;
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
  profiles: Profile[];
  signInCandidates: SignInCandidate[];
  workout: Workout;
};

const translations = {
  en: {
    appTitle: "FaceID Training",
    appSubtitle: "Local face login with a protected training area.",
    signedOut: "Signed out",
    signedIn: "Signed in",
    signIn: "Sign in",
    register: "Register",
    signInTitle: "Sign in with FaceID",
    signInCopy: "Look into the camera, choose a recognized face, then sign in.",
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
    trainingCopy: "This area is visible only after FaceID login.",
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
    startSet: "Start set",
    savePose: "Save pose",
    trainModel: "Train model",
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
    faceIdReady: "FaceID ready",
    noRecognizedFace: "No recognized face yet",
  },
  de: {
    appTitle: "FaceID Training",
    appSubtitle: "Lokaler Face-Login mit geschuetztem Trainingsbereich.",
    signedOut: "Abgemeldet",
    signedIn: "Angemeldet",
    signIn: "Einloggen",
    register: "Registrieren",
    signInTitle: "Mit FaceID einloggen",
    signInCopy: "Schau in die Kamera, waehle das erkannte Gesicht aus und logge dich ein.",
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
    trainingCopy: "Dieser Bereich ist erst nach dem FaceID-Login sichtbar.",
    bioAge: "Alter",
    bioGender: "Geschlecht",
    fitnessLevel: "Level",
    score: "Score",
    loginCount: "Logins",
    completedSets: "Sets",
    currentGesture: "Aktuelle Geste",
    cameraFps: "Kamera-FPS",
    warmupTitle: "Aufwaermen",
    warmupCopy: "Halte deine Haende sichtbar und folge dem Gesten-Feedback.",
    gestureTitle: "Gestenuebung",
    gestureCopy: "Probiere offene Hand, Faust, Daumen hoch, Peace und Zeigen.",
    sessionTitle: "Session",
    sessionCopy: "Die Trainingslogik kann hier erweitert werden.",
    exerciseAiTitle: "Uebungs-KI",
    exerciseAiCopy: "Aktuelle Uebungserkennung mit lokalem Mitlernen.",
    exerciseLabel: "Uebung",
    exerciseSource: "Quelle",
    exerciseReps: "Wdh.",
    exerciseSamples: "Samples",
    workoutTarget: "Ziel",
    workoutState: "Set",
    startSet: "Set starten",
    savePose: "Pose speichern",
    trainModel: "Modell trainieren",
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
    faceIdReady: "FaceID bereit",
    noRecognizedFace: "Noch kein Gesicht erkannt",
  },
  pt: {
    appTitle: "Treino com FaceID",
    appSubtitle: "Login facial local com uma area de treino protegida.",
    signedOut: "Sessao terminada",
    signedIn: "Sessao iniciada",
    signIn: "Entrar",
    register: "Registar",
    signInTitle: "Entrar com FaceID",
    signInCopy: "Olha para a camara, escolhe um rosto reconhecido e entra.",
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
    trainingCopy: "Esta area so aparece depois do login FaceID.",
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
    faceIdReady: "FaceID pronto",
    noRecognizedFace: "Nenhum rosto reconhecido ainda",
  },
  sr: {
    appTitle: "FaceID trening",
    appSubtitle: "Lokalna prijava licem sa zasticenim trening delom.",
    signedOut: "Odjavljen",
    signedIn: "Prijavljen",
    signIn: "Prijava",
    register: "Registracija",
    signInTitle: "Prijava preko FaceID",
    signInCopy: "Pogledaj u kameru, izaberi prepoznato lice i prijavi se.",
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
    trainingCopy: "Ovaj deo je vidljiv samo posle FaceID prijave.",
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
    faceIdReady: "FaceID spreman",
    noRecognizedFace: "Jos nema prepoznatog lica",
  },
  zh: {
    appTitle: "FaceID 训练",
    appSubtitle: "本地人脸登录和受保护的训练区域。",
    signedOut: "未登录",
    signedIn: "已登录",
    signIn: "登录",
    register: "注册",
    signInTitle: "使用 FaceID 登录",
    signInCopy: "看向摄像头，选择识别到的人脸，然后登录。",
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
    trainingCopy: "此区域只在 FaceID 登录后显示。",
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
    faceIdReady: "FaceID 已就绪",
    noRecognizedFace: "尚未识别到人脸",
  },
  fr: {
    appTitle: "Entraînement FaceID",
    appSubtitle: "Connexion faciale locale avec une zone d'entraînement protégée.",
    signedOut: "Déconnecté",
    signedIn: "Connecté",
    signIn: "Connexion",
    register: "Inscription",
    signInTitle: "Se connecter avec FaceID",
    signInCopy: "Regardez la caméra, choisissez le visage reconnu, puis connectez-vous.",
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
    trainingCopy: "Cette zone est visible uniquement après la connexion FaceID.",
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
    faceIdReady: "FaceID prêt",
    noRecognizedFace: "Aucun visage reconnu pour le moment",
  },
  ta: {
    appTitle: "FaceID பயிற்சி",
    appSubtitle: "பாதுகாக்கப்பட்ட பயிற்சி பகுதிக்கான உள்ளூர் முக உள்நுழைவு.",
    signedOut: "வெளியேறியது",
    signedIn: "உள்நுழைந்தது",
    signIn: "உள்நுழை",
    register: "பதிவு",
    signInTitle: "FaceID மூலம் உள்நுழை",
    signInCopy: "கேமராவை நோக்கிப் பாருங்கள், அடையாளம் கண்ட முகத்தைத் தேர்வு செய்து உள்நுழையுங்கள்.",
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
    trainingCopy: "FaceID உள்நுழைவுக்குப் பிறகு மட்டுமே இந்த பகுதி தெரியும்.",
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
    faceIdReady: "FaceID தயாராக உள்ளது",
    noRecognizedFace: "இன்னும் முகம் அடையாளம் காணப்படவில்லை",
  },
  ki: {
    appTitle: "Gũthomithia FaceID",
    appSubtitle: "Kũingĩra na ũthiũ thĩinĩ wa kombiuta na handũ ha kũthomithia harĩa hahithĩtwo.",
    signedOut: "Ũrathii nja",
    signedIn: "Ũrathii thĩinĩ",
    signIn: "Ingĩra",
    register: "Andĩkithia",
    signInTitle: "Ingĩra na FaceID",
    signInCopy: "Tega camera, thuura ũthiũ ũmenyetwo, nake ũingĩre.",
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
    trainingCopy: "Handũ haha honagwo thuutha wa kũingĩra na FaceID.",
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
    faceIdReady: "FaceID nĩĩhaarĩirie",
    noRecognizedFace: "Gũtirĩ ũthiũ ũmenyetwo rĩu",
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
const exerciseOptions = ["weight_lift", "jump", "arm_raises"] as const;
const exerciseExamples: Record<(typeof exerciseOptions)[number], string> = {
  weight_lift: "/exercises/weight_lift.png",
  jump: "/exercises/jump.png",
  arm_raises: "/exercises/arm_raises.png",
};
const exerciseRules: Record<(typeof exerciseOptions)[number], string> = {
  weight_lift: "Start with arms down. Curl at least one arm up, then lower again before the next rep.",
  jump: "Stand still between jumps. A rep counts when both ankles move clearly upward from the baseline.",
  arm_raises: "Start with both arms down. Raise both hands above shoulder height, then lower again.",
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
  const [exerciseLabel, setExerciseLabel] = useState<(typeof exerciseOptions)[number]>("weight_lift");

  const t = useMemo(() => translations[language], [language]);
  const text = (key: string, fallback: string) => (t as Record<string, string>)[key] ?? fallback;
  const activeProfile = status?.activeProfile;
  const exercise = status?.exercise;
  const workout = status?.workout;
  const activeWorkoutExercise = workout?.exercise as (typeof exerciseOptions)[number] | undefined;
  const exampleImage =
    workout && workout.state !== "idle" && activeWorkoutExercise && activeWorkoutExercise in exerciseExamples
      ? exerciseExamples[activeWorkoutExercise]
      : null;
  const activeExerciseRule =
    activeWorkoutExercise && activeWorkoutExercise in exerciseRules
      ? exerciseRules[activeWorkoutExercise]
      : "";
  const workoutProgress =
    workout && workout.targetReps > 0
      ? Math.min(100, Math.round((workout.currentReps / workout.targetReps) * 100))
      : 0;
  const gestureText = status?.gestures.length
    ? status.gestures.map((entry) => entry.label).join(", ")
    : "unknown";
  const profileText = status?.profiles.length
    ? status.profiles.map((entry) => entry.name).join(", ")
    : t.noProfiles;

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
          setMessage("Backend is not running on http://127.0.0.1:8000");
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
    if (!selectedCandidate) {
      setMessage(t.noRecognizedFace);
      return;
    }

    const response = await fetch("/api/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: selectedCandidate }),
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
    const response = await fetch("/api/workout/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exercise: exerciseLabel }),
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
            aria-label="Language"
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

      <section className="layout">
        <div className="cameraPanel">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/video.mjpg" alt="Live camera with FaceID overlay" />
        </div>

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
                <label>
                  {t.recognizedFaceLabel}
                  <select
                    value={selectedCandidate}
                    onChange={(event) => setSelectedCandidate(event.target.value)}
                  >
                    {candidates.length ? (
                      candidates.map((candidate) => (
                        <option key={candidate.name} value={candidate.name}>
                          {candidate.name}
                        </option>
                      ))
                    ) : (
                      <option value="">{t.noRecognizedFace}</option>
                    )}
                  </select>
                </label>
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
              </section>
            )}

            <div className="message">{message || t.waiting}</div>
            <div>
              <h3>{t.statusTitle}</h3>
              <div className="list">
                <StatusRow label={t.faceIdReady} value={status?.recognitionReady ? t.yes : t.no} />
                <StatusRow label={t.faces} value={status?.faceCount ?? 0} />
                <StatusRow label={t.gestures} value={gestureText} />
                <StatusRow label={t.profiles} value={profileText} />
              </div>
            </div>
          </aside>
        ) : null}
      </section>

      {isAuthenticated ? (
        <section className="trainingShell">
          <div className="trainingPanel">
            <div>
              <h2>Training</h2>
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

            <div className="exercisePanel">
              <div>
                <h3>{text("exerciseAiTitle", "Exercise AI")}</h3>
                <p>{text("exerciseAiCopy", "Current exercise recognition with local learning.")}</p>
              </div>
              <div className="metrics">
                <Metric label={text("exerciseLabel", "Exercise")} value={exercise?.label ?? "unknown"} />
                <Metric label={text("exerciseSource", "Source")} value={exercise?.source ?? "none"} />
                <Metric label={text("exerciseReps", "Reps")} value={exercise?.repetitions ?? 0} />
                <Metric
                  label={text("workoutTarget", "Target")}
                  value={`${workout?.currentReps ?? 0}/${workout?.targetReps ?? 5}`}
                />
                <Metric label={text("workoutState", "Set")} value={workout?.state ?? "idle"} />
                <Metric label={text("exerciseSamples", "Samples")} value={status?.exerciseSampleCount ?? 0} />
              </div>
              <div className="workoutProgress" aria-label="Workout progress">
                <div style={{ width: `${workoutProgress}%` }} />
              </div>
              <div className={workout?.completed ? "message success" : "message"}>
                {workout?.message ?? text("waiting", "Waiting for camera...")}
              </div>
              {exampleImage ? (
                <div className="exerciseExample">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={exampleImage}
                    alt={`${workout?.exercise.replace("_", " ")} example`}
                  />
                </div>
              ) : null}
              {exampleImage ? <div className="exerciseRule">{activeExerciseRule}</div> : null}
              <div className="exerciseTrainer">
                <select
                  aria-label="Exercise label"
                  value={exerciseLabel}
                  onChange={(event) => setExerciseLabel(event.target.value as typeof exerciseLabel)}
                >
                  {exerciseOptions.map((option) => (
                    <option key={option} value={option}>
                      {option.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={startWorkout}>
                  {text("startSet", "Start set")}
                </button>
                <button type="button" onClick={() => saveExerciseSample()}>
                  {text("savePose", "Save pose")}
                </button>
                <button className="secondary" type="button" onClick={trainExerciseModel}>
                  {text("trainModel", "Train model")}
                </button>
              </div>
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
