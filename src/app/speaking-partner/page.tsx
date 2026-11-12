"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Header } from "@/components/Header";
import {
  useSpeechRecognition,
  useTextToSpeech,
  SpeakButton,
} from "@/components/AudioSpeech";
import {
  BotMessageSquare,
  Mic,
  MicOff,
  Send,
  Sparkles,
  RefreshCw,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookPlus,
  ArrowRight,
  X,
  Volume2,
} from "lucide-react";

interface Message {
  id?: string;
  sender: "USER" | "AI" | "SYSTEM";
  content: string;
  createdAt?: string;
}

interface FeedbackData {
  summary: string;
  strengths: string[];
  grammarCorrections: { original: string; correction: string; explanation: string }[];
  naturalAlternatives: { original: string; natural: string; context: string }[];
  vocabularyLearned: { phrase: string; meaning: string; example: string }[];
  improvementPriorities: string[];
  recommendedNextPractice: string;
  fluencyRating: number;
}

const CONVERSATION_MODES = [
  { id: "FREE", name: "Free Conversation", desc: "Bicara bebas santai mengenai topik apapun" },
  { id: "GUIDED", name: "Guided Discussion", desc: "AI memandu alur percakapan dengan topik terarah" },
  { id: "ROLEPLAY", name: "Real-Life Role-play", desc: "Simulasi imigrasi, kafe, resepsionis, dosen" },
  { id: "QA", name: "Question & Answer", desc: "Latihan menjawab pertanyaan spontan tanpa jeda" },
  { id: "EXPLAIN", name: "Explain Something", desc: "Jelaskan proyek kuliah, riset, atau ide Anda" },
  { id: "CHALLENGE", name: "Spontaneous Challenge", desc: "Latih reaksi bicara cepat dalam 5 detik" },
  { id: "INTERVIEW", name: "Interview Practice", desc: "Simulasi wawancara beasiswa / visa" },
  { id: "ACADEMIC", name: "Academic Discussion", desc: "Diskusi proyek dan presentasi jurnal" },
];

function SpeakingPartnerContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "Getting Settled In Abroad";

  const [mode, setMode] = useState("FREE");
  const [topic, setTopic] = useState(initialTopic);
  const [partnerRole, setPartnerRole] = useState("Helpful English Speaking Partner");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [savedVocabIds, setSavedVocabIds] = useState<{ [key: string]: boolean }>({});
  const [isGeminiReady, setIsGeminiReady] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { speak } = useTextToSpeech();

  // Speech Recognition Hook
  const {
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    isSupported: isSttSupported,
    permissionError,
  } = useSpeechRecognition({
    onFinalTranscript: (text) => {
      setInputText((prev) => (prev ? `${prev} ${text}` : text));
    },
  });

  // Keep input text synced with speech transcript
  useEffect(() => {
    if (transcript && isListening) {
      setInputText(transcript);
    }
  }, [transcript, isListening]);

  // Session timer ticker
  useEffect(() => {
    let interval: any = null;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send turn to backend
  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || isSending) return;

    if (isListening) {
      stopListening();
    }

    setIsSending(true);
    setInputText("");
    setTranscript("");
    setIsTimerActive(true);

    // Optimistically add user message
    const userMsg: Message = { sender: "USER", content, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: content,
          mode,
          topic,
          partnerRole,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.conversationId) setConversationId(data.conversationId);
        if (data.isConfigured !== undefined) setIsGeminiReady(data.isConfigured);

        if (data.message) {
          const aiMsg: Message = {
            sender: "AI",
            content: data.message.content,
            createdAt: data.message.createdAt,
          };
          setMessages((prev) => [...prev, aiMsg]);
          // Automatically speak AI reply
          speak(data.message.content);
        }
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  // Start new conversation turn
  const handleStartConversation = async () => {
    setMessages([]);
    setConversationId(null);
    setTimerSeconds(0);
    setIsTimerActive(true);
    setIsSending(true);

    try {
      const res = await fetch("/api/speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          topic,
          partnerRole,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConversationId(data.conversationId);
        if (data.isConfigured !== undefined) setIsGeminiReady(data.isConfigured);
        if (data.message) {
          setMessages([{ sender: "AI", content: data.message.content }]);
          speak(data.message.content);
        }
      }
    } catch (e) {
      console.error("Start conversation error:", e);
    } finally {
      setIsSending(false);
    }
  };

  // End conversation & Request AI Feedback
  const handleEndSession = async () => {
    if (!conversationId) return;
    setIsTimerActive(false);
    setIsEvaluating(true);

    try {
      const res = await fetch("/api/speaking/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });

      if (res.ok) {
        const fbData = await res.json();
        setFeedback(fbData);
      }
    } catch (e) {
      console.error("Feedback request error:", e);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Quick save vocabulary from feedback
  const handleSaveVocab = async (item: { phrase: string; meaning: string; example: string }, key: string) => {
    try {
      const res = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phrase: item.phrase,
          translation: item.meaning,
          exampleSentence: item.example,
          topic: mode,
        }),
      });
      if (res.ok) {
        setSavedVocabIds((prev) => ({ ...prev, [key]: true }));
      }
    } catch (e) {
      console.error("Save vocabulary error:", e);
    }
  };

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="AI Speaking Partner"
        subtitle="Partner percakapan Bahasa Inggris interaktif dengan respon cerdas bertenaga Google Gemini."
      />

      {/* Warning banner if Gemini is not yet configured */}
      {!isGeminiReady && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Google Gemini API Key Belum Dikonfigurasi</p>
            <p>
              Untuk mengaktifkan percakapan langsung dengan model AI Gemini, silakan isi{" "}
              <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono">GEMINI_API_KEY</code> pada file{" "}
              <code className="bg-amber-500/20 px-1 py-0.5 rounded font-mono">.env</code> Anda.
            </p>
          </div>
        </div>
      )}

      {/* Permission Error Banner */}
      {permissionError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>{permissionError}</span>
          </div>
          <span className="text-[11px] underline cursor-pointer" onClick={() => startListening()}>
            Coba lagi
          </span>
        </div>
      )}

      {/* Session Controls & Mode Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Mode Selector */}
        <div className="lg:col-span-3 rounded-2xl bg-card border border-border p-4 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Mode Latihan:</span>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="text-xs font-semibold bg-muted border border-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {CONVERSATION_MODES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">Topik:</span>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Contoh: Airport Check-in"
                className="text-xs bg-muted border border-border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary w-48 sm:w-64"
              />
            </div>

            <button
              onClick={handleStartConversation}
              disabled={isSending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSending ? "animate-spin" : ""}`} />
              <span>Mulai Sesi Baru</span>
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground italic">
            {CONVERSATION_MODES.find((m) => m.id === mode)?.desc}
          </p>
        </div>

        {/* Timer & Session State */}
        <div className="rounded-2xl bg-card border border-border p-4 shadow-sm flex items-center justify-between lg:flex-col lg:justify-center lg:space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Clock className="w-4 h-4 text-primary" />
            <span>Durasi Sesi</span>
          </div>
          <span className="text-2xl font-extrabold text-foreground font-mono">
            {formatTimer(timerSeconds)}
          </span>
          {messages.length > 0 && (
            <button
              onClick={handleEndSession}
              disabled={isEvaluating}
              className="px-3 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isEvaluating ? "Menganalisis..." : "Akhiri Sesi & Evaluasi"}
            </button>
          )}
        </div>
      </div>

      {/* Main Conversation Workspace */}
      <div className="rounded-2xl bg-card border border-border shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-muted/20">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                <BotMessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-foreground">Siap berlatih berbicara?</h3>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Pilih topik di atas lalu klik <strong>"Mulai Sesi Baru"</strong> atau langsung rekam suara Anda dengan mikrofon di bawah.
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isAi = msg.sender === "AI";
              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${isAi ? "justify-start" : "justify-end"}`}
                >
                  {isAi && (
                    <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      AI
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      isAi
                        ? "bg-card border border-border text-foreground shadow-sm"
                        : "bg-primary text-white shadow-sm font-medium"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {isAi && (
                      <div className="mt-2 flex items-center justify-between border-t border-border/50 pt-1.5 text-[10px] text-muted-foreground">
                        <span>FluentAbroad Tutor</span>
                        <SpeakButton text={msg.content} size="sm" />
                      </div>
                    )}
                  </div>

                  {!isAi && (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      You
                    </div>
                  )}
                </div>
              );
            })
          )}
          {isSending && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground italic pl-11">
              <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>AI Speaking Tutor sedang memikirkan respon...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Microphone & Text Fallback */}
        <div className="p-4 border-t border-border bg-card flex items-center gap-3">
          {/* Large Microphone Button */}
          <button
            type="button"
            onClick={() => (isListening ? stopListening() : startListening())}
            className={`p-3 rounded-full transition-all focus:outline-none shadow-md ${
              isListening
                ? "bg-rose-500 text-white animate-voice-ripple"
                : "bg-primary text-white hover:bg-primary/90"
            }`}
            title={isListening ? "Klik untuk selesai bicara" : "Klik mikrofon untuk bicara"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Fallback Text Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                isListening
                  ? "Mendengarkan ucapan suara Anda..."
                  : "Ketik kalimat balasan Anda atau gunakan mikrofon..."
              }
              className="w-full text-xs bg-muted/50 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
            />
            {isListening && (
              <span className="absolute right-3 top-3 text-[10px] text-rose-500 font-bold uppercase animate-pulse">
                Recording...
              </span>
            )}
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isSending}
            className="p-3 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-40 transition-all focus:outline-none shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* End Session Feedback Modal */}
      {feedback && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-foreground text-base">Evaluasi Percakapan AI</h3>
              </div>
              <button
                onClick={() => setFeedback(null)}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Summary & Rating */}
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-primary">Ringkasan Sesi</span>
                  <span className="font-extrabold text-sm text-primary">
                    Fluency: {feedback.fluencyRating}/100
                  </span>
                </div>
                <p className="text-foreground leading-relaxed">{feedback.summary}</p>
              </div>

              {/* Strengths */}
              {feedback.strengths && feedback.strengths.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                    💪 Kelebihan Komunikasi Anda:
                  </h4>
                  <ul className="space-y-1">
                    {feedback.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Grammar Corrections */}
              {feedback.grammarCorrections && feedback.grammarCorrections.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                    🔍 Koreksi Tata Bahasa:
                  </h4>
                  <div className="space-y-2">
                    {feedback.grammarCorrections.map((gc, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                        <p className="line-through text-rose-500">"{gc.original}"</p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400">
                          → "{gc.correction}"
                        </p>
                        <p className="text-muted-foreground text-[11px] italic">{gc.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Natural Alternatives */}
              {feedback.naturalAlternatives && feedback.naturalAlternatives.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                    ✨ Ungkapan Lebih Natural (Native Phrasing):
                  </h4>
                  <div className="space-y-2">
                    {feedback.naturalAlternatives.map((na, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                        <p className="text-muted-foreground">Biasa: "{na.original}"</p>
                        <p className="font-bold text-primary">Lebih Natural: "{na.natural}"</p>
                        <p className="text-muted-foreground text-[11px]">{na.context}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vocabulary Learned & Save to SRS */}
              {feedback.vocabularyLearned && feedback.vocabularyLearned.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                    📚 Simpan Kosa Kata Baru ke Vocabulary Trainer:
                  </h4>
                  <div className="space-y-2">
                    {feedback.vocabularyLearned.map((v, idx) => {
                      const key = `vocab-${idx}`;
                      const isSaved = savedVocabIds[key];
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-card border border-border flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-foreground">{v.phrase}</p>
                            <p className="text-emerald-600 dark:text-emerald-400 text-[11px]">{v.meaning}</p>
                          </div>
                          <button
                            onClick={() => handleSaveVocab(v, key)}
                            disabled={isSaved}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                              isSaved
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-primary/10 text-primary hover:bg-primary/20"
                            }`}
                          >
                            {isSaved ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Tersimpan</span>
                              </>
                            ) : (
                              <>
                                <BookPlus className="w-3.5 h-3.5" />
                                <span>Simpan</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end">
              <button
                onClick={() => setFeedback(null)}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SpeakingPartnerPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 pb-12">
          <Header title="AI Speaking Partner" />
          <div className="p-12 text-center text-xs text-muted-foreground">
            Menyiapkan sesi percakapan AI...
          </div>
        </div>
      }
    >
      <SpeakingPartnerContent />
    </Suspense>
  );
}
