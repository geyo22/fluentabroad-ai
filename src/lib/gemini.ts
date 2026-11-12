import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ChatMessage {
  role: "user" | "model" | "system";
  content: string;
}

export interface ConversationContext {
  mode: string;
  topic: string;
  partnerRole?: string;
  currentLevel: string;
  targetLevel: string;
  explanationLanguage: string;
  dailyGoalMinutes?: number;
}

export interface ConversationFeedback {
  summary: string;
  strengths: string[];
  grammarCorrections: {
    original: string;
    correction: string;
    explanation: string;
  }[];
  naturalAlternatives: {
    original: string;
    natural: string;
    context: string;
  }[];
  vocabularyLearned: {
    phrase: string;
    meaning: string;
    example: string;
  }[];
  improvementPriorities: string[];
  recommendedNextPractice: string;
  fluencyRating: number; // 1-100
}

export function getGeminiApiKey(): string | null {
  return process.env.GEMINI_API_KEY || null;
}

export function isGeminiConfigured(): boolean {
  const key = getGeminiApiKey();
  return Boolean(key && key.trim().length > 0 && !key.startsWith("YOUR_"));
}

/**
 * Base AI tutor system prompt as defined in the master prompt specifications
 */
export function buildSystemPrompt(context: ConversationContext): string {
  const langExplanation =
    context.explanationLanguage === "id"
      ? "Use Indonesian (Bahasa Indonesia) when providing tips, explanations, or grammar corrections. Keep the dialogue itself in natural English."
      : "Use English for all explanations and dialogue.";

  return `You are FluentAbroad AI, a personal English speaking tutor for an Indonesian university student preparing to travel and live abroad in January 2027.

Your objective is to help the learner understand spoken English, communicate naturally, ask questions, explain ideas, and respond spontaneously without translating every sentence mentally in their head.

Learner Profile:
- Current Level: ${context.currentLevel} (target: ${context.targetLevel})
- Mode: ${context.mode}
- Topic: ${context.topic}
${context.partnerRole ? `- Your Assigned Role: ${context.partnerRole}` : "- Role: Supportive English Speaking Tutor"}
- Language Rule: ${langExplanation}

Core Behavioral Guidelines:
1. Adapt your vocabulary, sentence complexity, and conversational speed to the learner's level (${context.currentLevel}).
2. Prioritize practical communication over perfect grammar.
3. Maintain natural, interactive, and meaningful two-way conversations.
4. Ask ONE main question at a time.
5. Use relevant follow-up questions based on what the learner actually shared.
6. Do NOT overwhelm the learner with corrections during the dialogue. Keep the conversation flowing.
7. When the learner struggles or gives a very short answer, simplify the question or provide a friendly hint.
8. Encourage the learner to express complete thoughts.
9. Avoid repetitive or excessive praise (e.g., don't say "Great job!" in every message).
10. During role-play, stay 100% in character (${context.partnerRole || "native conversational partner"}).
11. Keep responses concise (2 to 4 sentences usually), allowing the learner ample opportunity to speak.
12. Never fabricate the learner's performance history. Rely only on available conversation evidence.`;
}

const CANDIDATE_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-latest",
  "gemini-3.8-flash",
];

/**
 * Send messages to Gemini speaking tutor and receive next turn with automatic model fallback
 */
export async function getTutorReply(
  history: ChatMessage[],
  context: ConversationContext
): Promise<{ text: string; isConfigured: boolean }> {
  const apiKey = getGeminiApiKey();
  if (!isGeminiConfigured() || !apiKey) {
    return {
      text: "⚠️ Google Gemini API key is not configured yet. Please add your GEMINI_API_KEY in the `.env` file or Settings page to activate real-time AI speaking conversations with Gemini.",
      isConfigured: false,
    };
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const formattedHistory = history.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  const lastUserMessage = formattedHistory[formattedHistory.length - 1];
  const pastTurns = formattedHistory.slice(0, -1);
  let lastErrorMsg = "";

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: buildSystemPrompt(context),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250,
        },
      });

      const chat = model.startChat({
        history: pastTurns,
      });

      const result = await chat.sendMessage(lastUserMessage.parts[0].text);
      const responseText = result.response.text();

      return {
        text: responseText,
        isConfigured: true,
      };
    } catch (error: unknown) {
      lastErrorMsg = error instanceof Error ? error.message : "Error connecting to model";
      console.warn(`Model ${modelName} encountered: ${lastErrorMsg}, trying next candidate...`);
    }
  }

  return {
    text: `Sorry, I encountered an issue connecting to Gemini: ${lastErrorMsg}. Please try again in a few moments.`,
    isConfigured: true,
  };
}

/**
 * Generate comprehensive post-session feedback
 */
export async function generateSessionFeedback(
  transcript: { sender: string; content: string }[],
  context: ConversationContext
): Promise<ConversationFeedback> {
  const apiKey = getGeminiApiKey();

  if (!isGeminiConfigured() || !apiKey) {
    // Meaningful local baseline feedback if API key is not yet set
    return {
      summary: "Percakapan selesai. Konfigurasikan GEMINI_API_KEY untuk evaluasi mendalam berbasis AI.",
      strengths: ["Berhasil menyampaikan ide utama", "Menjaga alur percakapan"],
      grammarCorrections: [],
      naturalAlternatives: [],
      vocabularyLearned: [],
      improvementPriorities: ["Latih spontanitas berbicara dalam 5 detik"],
      recommendedNextPractice: "Coba mode Real-Life Scenario untuk menguji kemampuan kontekstual.",
      fluencyRating: 75,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const conversationText = transcript
      .map((t) => `${t.sender === "USER" ? "Learner" : "Tutor"}: ${t.content}`)
      .join("\n");

    const prompt = `Analyze this spoken English conversation between an Indonesian learner (${context.currentLevel} level) and an AI tutor.
Topic: ${context.topic}
Mode: ${context.mode}
Language for explanations: ${context.explanationLanguage === "id" ? "Bahasa Indonesia" : "English"}

Conversation Transcript:
${conversationText}

Provide an objective assessment in JSON strictly matching this schema:
{
  "summary": "2-3 sentences summarizing performance and communication effectiveness",
  "strengths": ["string", "string"],
  "grammarCorrections": [
    {
      "original": "learner's exact sentence with mistake",
      "correction": "corrected natural sentence",
      "explanation": "brief reason in ${context.explanationLanguage === "id" ? "Indonesian" : "English"}"
    }
  ],
  "naturalAlternatives": [
    {
      "original": "grammatically okay but stiff phrasing",
      "natural": "more native/casual way to say it",
      "context": "when to use this"
    }
  ],
  "vocabularyLearned": [
    {
      "phrase": "useful word or idiom used or recommended",
      "meaning": "translation or meaning",
      "example": "example sentence"
    }
  ],
  "improvementPriorities": ["1-2 actionable focus areas for tomorrow"],
  "recommendedNextPractice": "concrete next activity",
  "fluencyRating": 78
}`;

    const result = await model.generateContent(prompt);
    const jsonStr = result.response.text();
    return JSON.parse(jsonStr) as ConversationFeedback;
  } catch (error) {
    console.error("Failed to generate feedback with Gemini:", error);
    return {
      summary: "Sesi percakapan tercatat. Analisis mendalam AI gagal dimuat karena masalah jaringan.",
      strengths: ["Menyelesaikan sesi percakapan dengan baik"],
      grammarCorrections: [],
      naturalAlternatives: [],
      vocabularyLearned: [],
      improvementPriorities: ["Lanjutkan latihan harian"],
      recommendedNextPractice: "Lanjutkan ke pelajaran berikutnya di Learning Path.",
      fluencyRating: 70,
    };
  }
}

/**
 * Evaluate Real-Life Abroad Scenario attempt
 */
export async function evaluateScenarioAttemptAI(
  scenarioTitle: string,
  scenarioObjective: string,
  userRole: string,
  aiRole: string,
  transcript: { sender: string; content: string }[]
): Promise<{
  objectiveMet: boolean;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}> {
  const apiKey = getGeminiApiKey();
  if (!isGeminiConfigured() || !apiKey) {
    return {
      objectiveMet: true,
      score: 80,
      feedback: "Simulasi skenario selesai. Konfigurasikan API Key untuk rubrik evaluasi AI otomatis.",
      strengths: ["Menyelesaikan komunikasi skenario"],
      improvements: ["Gunakan frasa yang lebih spesifik"],
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    const conversationText = transcript
      .map((t) => `${t.sender === "USER" ? userRole : aiRole}: ${t.content}`)
      .join("\n");

    const prompt = `Evaluate this real-life scenario abroad simulation:
Scenario: ${scenarioTitle}
Target Objective: ${scenarioObjective}
User Role: ${userRole}
AI Character: ${aiRole}

Transcript:
${conversationText}

Rubric criteria:
1. Task completion (did the learner achieve the real-world objective?)
2. Response relevance and clarity
3. Appropriate practical vocabulary
4. Ability to handle follow-up questions and clarification

Return JSON matching:
{
  "objectiveMet": boolean,
  "score": number (0-100),
  "feedback": "constructive 2-sentence summary in Indonesian",
  "strengths": ["string", "string"],
  "improvements": ["string", "string"]
}`;

    const res = await model.generateContent(prompt);
    return JSON.parse(res.response.text());
  } catch (e) {
    console.error("Scenario evaluation error:", e);
    return {
      objectiveMet: true,
      score: 75,
      feedback: "Simulasi berhasil diselesaikan. Pertahankan konsistensi latihan Anda.",
      strengths: ["Merespons dalam bahasa Inggris"],
      improvements: ["Perbanyak variasi kosa kata kontekstual"],
    };
  }
}

/**
 * Robust JSON generation helper with multi-model fallback chain
 */
export async function generateJSONWithModelFallback<T>(
  prompt: string,
  fallbackData: T,
  temperature = 0.4
): Promise<T> {
  const apiKey = getGeminiApiKey();
  if (!isGeminiConfigured() || !apiKey) {
    return fallbackData;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature,
        },
      });

      const res = await model.generateContent(prompt);
      const text = res.response.text();
      return JSON.parse(text) as T;
    } catch (e) {
      console.warn(`JSON generation on model ${modelName} failed, trying next...`, e);
    }
  }

  return fallbackData;
}

export interface GeneratedListeningExercise {
  title: string;
  category: string;
  difficulty: string;
  audioDurationSec: number;
  dialogue: { speaker: string; text: string; idTranslation?: string }[];
  questions: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  tips: string;
}

/**
 * Generate a brand new, unlimited realistic listening exercise with questions
 */
export async function generateAIListeningExercise(params: {
  category?: string;
  difficulty?: string;
  customTopic?: string;
}): Promise<GeneratedListeningExercise> {
  const category = params.category || "SOCIAL";
  const difficulty = params.difficulty || "B1";
  const topicDescription = params.customTopic || `everyday real-life situation in ${category}`;

  const prompt = `Generate a realistic English dialogue and 3 comprehension questions for an Indonesian university student preparing to study and live abroad.
Category: ${category}
CEFR Difficulty Level: ${difficulty}
Specific Topic or Scenario: ${topicDescription}

Requirements:
1. "title": Engaging title in English (e.g. "Opening an Australian Bank Account").
2. "category": Must be one of ["AIRPORT", "RESTAURANT", "DIRECTIONS", "ACADEMIC", "SERVICES", "SOCIAL"].
3. "difficulty": Must be one of ["A1", "A2", "B1", "B2"].
4. "audioDurationSec": Number (approx 40-70 seconds).
5. "dialogue": An array of 4 to 6 dialogue turns. Each turn: { "speaker": "Alex", "text": "natural conversational English", "idTranslation": "Terjemahan bahasa Indonesia" }.
6. "questions": Exactly 3 questions testing understanding of details, intentions, or vocabulary. Each question must have:
   - "id": "q1", "q2", "q3"
   - "question": Question in English
   - "options": Exactly 4 plausible choices in English
   - "correctIndex": Integer (0, 1, 2, or 3) indicating the correct option
   - "explanation": Helpful explanation in Bahasa Indonesia why this option is correct.
7. "tips": A pedagogical tip in Bahasa Indonesia about connected speech, tone, or cultural nuances in this situation.

Return JSON matching this exact structure:
{
  "title": "string",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "audioDurationSec": 50,
  "dialogue": [
    { "speaker": "string", "text": "string", "idTranslation": "string" }
  ],
  "questions": [
    {
      "id": "q1",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "explanation": "string"
    }
  ],
  "tips": "string"
}`;

  const fallback: GeneratedListeningExercise = {
    title: `Everyday Conversation: ${category}`,
    category,
    difficulty,
    audioDurationSec: 45,
    dialogue: [
      { speaker: "Local Resident", text: "Hi there! Welcome to the city, are you looking for the student center?", idTranslation: "Halo! Selamat datang di kota ini, apakah kamu mencari pusat mahasiswa?" },
      { speaker: "Student", text: "Yes, exactly! Could you tell me if it's within walking distance from here?", idTranslation: "Ya, tepat sekali! Bisakah Anda memberi tahu apakah jaraknya bisa ditempuh jalan kaki dari sini?" },
      { speaker: "Local Resident", text: "It's just two blocks down Main Street, right across from the library. You can't miss it.", idTranslation: "Hanya dua blok di Main Street, persis di seberang perpustakaan. Kamu tidak akan kelewatan." },
      { speaker: "Student", text: "That's super helpful, thank you so much for your time!", idTranslation: "Itu sangat membantu, terima kasih banyak atas waktunya!" }
    ],
    questions: [
      {
        id: "q1",
        question: "Where is the student center located?",
        options: ["Across from the library", "Inside the airport terminal", "Three miles away", "Behind the train station"],
        correctIndex: 0,
        explanation: "Penutur lokal menyebutkan bahwa lokasi pusat mahasiswa berada persis di seberang perpustakaan (right across from the library)."
      },
      {
        id: "q2",
        question: "How far is the student center from their current location?",
        options: ["A 30-minute bus ride", "Just two blocks down Main Street", "At the edge of the city", "Only accessible by taxi"],
        correctIndex: 1,
        explanation: "Penutur lokal menyatakan 'It's just two blocks down Main Street'."
      },
      {
        id: "q3",
        question: "What does 'You can't miss it' mean in this context?",
        options: ["You will definitely get lost", "The building is very easy to spot and find", "You need a special ticket to enter", "It is closed today"],
        correctIndex: 1,
        explanation: "Ungkapan idiomatis 'You can't miss it' berarti tempat tersebut sangat mudah ditemukan dan terlihat jelas."
      }
    ],
    tips: "Perhatikan reduksi 'two blocks down' yang diucapkan cepat dan menyatu tanpa jeda kaku."
  };

  return generateJSONWithModelFallback<GeneratedListeningExercise>(prompt, fallback, 0.4);
}

export interface GeneratedShadowingExercise {
  category: string;
  targetSentence: string;
  translation: string;
  phoneticTips: string;
  connectedSpeechNote: string;
}

/**
 * Generate a new authentic shadowing sentence with phonetic tips
 */
export async function generateAIShadowingSentence(params: {
  category?: string;
  customTopic?: string;
}): Promise<GeneratedShadowingExercise> {
  const category = params.category || "Conversational Spontaneity";
  const prompt = `Generate a single, natural, and expressive English sentence for shadowing and pronunciation training.
Target audience: Indonesian university student preparing to live abroad.
Topic/Situation: ${params.customTopic || category}

Requirements:
- "category": Short category name (e.g. "Airport Navigation", "Polite Questions", "Academic Consultation")
- "targetSentence": 12 to 20 words natural spoken English sentence containing natural connected speech (e.g. linking, elision, weak forms).
- "translation": Natural Bahasa Indonesia translation.
- "phoneticTips": Specific Indonesian guide on word stress, intonation contours, and troublesome vowels/consonants.
- "connectedSpeechNote": Specific Indonesian explanation of how words link together in this sentence (e.g. /t/ linking to vowel, reduction of 'to' to /tə/).

Return JSON:
{
  "category": "string",
  "targetSentence": "string",
  "translation": "string",
  "phoneticTips": "string",
  "connectedSpeechNote": "string"
}`;

  const fallback: GeneratedShadowingExercise = {
    category,
    targetSentence: "Could you please point me in the right direction for the international student advisory desk?",
    translation: "Bisakah Anda menunjukkan arah yang tepat menuju meja konsultasi mahasiswa internasional?",
    phoneticTips: "Beri penekanan utama pada 'point me', 'right direction', dan 'advisory desk'. Intonasi meninggi sopan pada akhir kalimat.",
    connectedSpeechNote: "'Point me in' mengalir menyambung /pɔɪnt miː ɪn/ tanpa menghentikan nafas antar kata."
  };

  return generateJSONWithModelFallback<GeneratedShadowingExercise>(prompt, fallback, 0.4);
}

export interface GeneratedVocabItem {
  phrase: string;
  translation: string;
  exampleSentence: string;
  context: string;
  topic: string;
  difficulty: string;
}

/**
 * Generate a batch of high-yield conversational phrases for SRS flashcards
 */
export async function generateAIVocabularyBatch(params: {
  topic?: string;
  count?: number;
}): Promise<GeneratedVocabItem[]> {
  const topic = params.topic || "Abroad Survival & Campus Life";
  const count = params.count || 3;

  const prompt = `Generate exactly ${count} natural spoken English phrases, collocations, or practical idioms for an Indonesian student preparing for university life abroad.
Topic: ${topic}

Requirements for each item:
- "phrase": High-yield phrase (e.g. "touch base", "off the top of my head", "call it a day", "grab a bite").
- "translation": Meaningful Indonesian translation.
- "exampleSentence": Authentic conversational sentence demonstrating natural usage.
- "context": When and with whom to use this phrase (e.g. "Digunakan saat diskusi tugas kelompok dengan teman kuliah").
- "topic": "${topic}"
- "difficulty": "Easy", "Medium", or "Hard"

Return JSON array:
[
  {
    "phrase": "string",
    "translation": "string",
    "exampleSentence": "string",
    "context": "string",
    "topic": "string",
    "difficulty": "Medium"
  }
]`;

  const fallback: GeneratedVocabItem[] = [
    {
      phrase: "touch base with someone",
      translation: "menghubungi atau mengabari seseorang secara singkat",
      exampleSentence: "Let's touch base tomorrow morning before the lecture begins.",
      context: "Sangat umum digunakan saat berkoordinasi dengan teman kuliah atau rekan kerja.",
      topic,
      difficulty: "Medium"
    },
    {
      phrase: "get the hang of it",
      translation: "mulai terbiasa atau memahami cara kerja sesuatu",
      exampleSentence: "It was confusing at first, but I am slowly getting the hang of public transit here.",
      context: "Digunakan saat menceritakan proses adaptasi di lingkungan baru luar negeri.",
      topic,
      difficulty: "Easy"
    },
    {
      phrase: "bear with me for a moment",
      translation: "tolong bersabar sebentar / tunggu sejenak",
      exampleSentence: "Please bear with me for a moment while I pull up my enrollment documents.",
      context: "Ungkapan sopan saat mencari berkas di depan petugas imigrasi atau admin kampus.",
      topic,
      difficulty: "Medium"
    }
  ];

  return generateJSONWithModelFallback<GeneratedVocabItem[]>(prompt, fallback, 0.4);
}


