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

/**
 * Send messages to Gemini speaking tutor and receive next turn
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

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash for low latency and high quality conversational responses
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: buildSystemPrompt(context),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 250,
      },
    });

    const formattedHistory = history.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // The last message is the current user message
    const lastUserMessage = formattedHistory[formattedHistory.length - 1];
    const pastTurns = formattedHistory.slice(0, -1);

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
    console.error("Gemini API Error in getTutorReply:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return {
      text: `Sorry, I encountered an issue connecting to Gemini: ${errorMessage}. Please check your internet connection or API quota.`,
      isConfigured: true,
    };
  }
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
      model: "gemini-1.5-flash",
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
      model: "gemini-1.5-flash",
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
