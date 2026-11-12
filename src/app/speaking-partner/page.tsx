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
  RefreshCw,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookPlus,
  X,
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
  { id: "FREE", name: "Free Conversation", desc: "Bicara bebas mengenai topik apa saja" },
  { id: "GUIDED", name: "Guided Discussion", desc: "Topik terstruktur yang dipandu oleh AI" },
  { id: "ROLEPLAY", name: "Real-Life Role-play", desc: "Simulasi imigrasi, kafe, asrama, kampus" },
  { id: "QA", name: "Question & Answer", desc: "Latihan menjawab pertanyaan tanpa jeda lama" },
  { id: "EXPLAIN", name: "Explain Something", desc: "Jelaskan proyek kuliah, riset, atau ide Anda" },
  { id: "CHALLENGE", name: "Spontaneous Challenge", desc: "Pertanyaan kejutan untuk reaksi cepat di bawah 5 detik" },
  { id: "INTERVIEW", name: "Interview Practice", desc: "Simulasi wawancara beasiswa atau visa pelajar" },
  { id: "ACADEMIC", name: "Academic Discussion", desc: "Diskusi proyek dan presentasi jurnal" },
];

function SpeakingPartnerContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "Getting Settled In Abroad";

  const [mode, setMode] = useState("FREE");
  const [topic, setTopic] = useState(initialTopic);
  const [partnerRole, setPartnerRole] = useState("English Conversation Tutor");
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

  const {
    isListening,
    transcript,
    setTranscript,
    startListening,
    stopListening,
    permissionError,
  } = useSpeechRecognition({
    onFinalTranscript: (text) => {
      setInputText((prev) => (prev ? `${prev} ${text}` : text));
    },
  });

  useEffect(() => {
    if (transcript && isListening) {
      setInputText(transcript);
    }
  }, [transcript, isListening]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || isSending) return;

    if (isListening) stopListening();

    setIsSending(true);
    setInputText("");
    setTranscript("");
    setIsTimerActive(true);

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
          speak(data.message.content);
        }
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

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
    <div className="space-y-6 pb-16 max-w-4xl">
      <Header
        title="AI Speaking Partner"
        subtitle="Latihan percakapan dua arah dengan model Google Gemini."
      />

      {permissionError && (
        <div className="p-3 rounded-lg bg-muted text-xs text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>{permissionError}</span>
          </div>
          <span className="text-[11px] underline cursor-pointer" onClick={() => startListening()}>
            Coba lagi
          </span>
        </div>
      )}

      {/* Apple Style Mode & Topic Bar */}
      <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-apple space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-muted-foreground">Mode:</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="bg-muted/80 border border-border/80 rounded-full px-3 py-1.5 focus:outline-none text-foreground font-semibold"
            >
              {CONVERSATION_MODES.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
            <span className="font-semibold text-muted-foreground">Topik:</span>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topik percakapan..."
              className="w-full bg-muted/80 border border-border/80 rounded-full px-3.5 py-1.5 focus:outline-none text-foreground"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground bg-muted/80 px-3 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimer(timerSeconds)}</span>
            </div>

            <button
              onClick={handleStartConversation}
              disabled={isSending}
              className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSending ? "animate-spin" : ""}`} />
              <span>Sesi Baru</span>
            </button>

            {messages.length > 0 && (
              <button
                onClick={handleEndSession}
                disabled={isEvaluating}
                className="px-4 py-1.5 rounded-full border border-border hover:bg-muted text-xs font-semibold text-foreground transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isEvaluating ? "Menilai..." : "Evaluasi"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="rounded-3xl border border-border/80 bg-card flex flex-col h-[540px] shadow-apple overflow-hidden">
        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-background/40">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <BotMessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Siap memulai percakapan</h3>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Pilih topik di atas lalu tekan <strong>"Sesi Baru"</strong> atau langsung tekan tombol mikrofon di bawah untuk berbicara.
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
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      AI
                    </div>
                  )}

                  <div
                    className={`max-w-[78%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isAi
                        ? "bg-card border border-border/80 text-foreground rounded-bl-sm"
                        : "bg-primary text-white font-medium rounded-br-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap selectable-text">{msg.content}</p>
                    {isAi && (
                      <div className="mt-2 pt-1.5 border-t border-border/40 flex justify-end">
                        <SpeakButton text={msg.content} size="sm" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {isSending && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground italic pl-10">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>Menyiapkan respon alami...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Apple Style Floating Input Bar */}
        <div className="p-4 border-t border-border/80 bg-card flex items-center gap-3">
          <button
            type="button"
            onClick={() => (isListening ? stopListening() : startListening())}
            className={`p-3 rounded-full transition-all focus:outline-none shadow-xs ${
              isListening ? "bg-rose-500 text-white animate-pulse" : "bg-primary text-white hover:bg-primary/90"
            }`}
            title={isListening ? "Selesai merekam" : "Gunakan mikrofon"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

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
            placeholder={isListening ? "Mendengarkan ucapan Anda..." : "Ketik pesan atau gunakan mikrofon..."}
            className="flex-1 text-xs sm:text-sm bg-muted/60 border border-border/80 rounded-full px-4 py-2.5 focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
          />

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isSending}
            className="p-3 rounded-full bg-primary text-white hover:bg-primary/90 disabled:opacity-40 transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Post-Session Evaluation Modal */}
      {feedback && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-border/80 flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">Evaluasi Percakapan AI</h3>
              <button
                onClick={() => setFeedback(null)}
                className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-muted/50 border border-border/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-sm">Ringkasan Sesi</span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary">
                    Skor: {feedback.fluencyRating}/100
                  </span>
                </div>
                <p className="text-muted-foreground leading-relaxed selectable-text">{feedback.summary}</p>
              </div>

              {/* Strengths */}
              {feedback.strengths && feedback.strengths.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-semibold text-foreground text-[11px] uppercase tracking-wider text-muted-foreground">
                    Kelebihan Komunikasi:
                  </h4>
                  <ul className="space-y-1">
                    {feedback.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-muted-foreground selectable-text">
                        <CheckCircle2 className="w-3.5 h-3.5 text-foreground shrink-0" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Grammar Corrections */}
              {feedback.grammarCorrections && feedback.grammarCorrections.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
                    Koreksi Tata Bahasa:
                  </h4>
                  <div className="space-y-2">
                    {feedback.grammarCorrections.map((gc, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-border/80 space-y-1">
                        <p className="line-through text-muted-foreground selectable-text">"{gc.original}"</p>
                        <p className="font-medium text-foreground selectable-text">→ "{gc.correction}"</p>
                        <p className="text-muted-foreground text-[11px] selectable-text">{gc.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Natural Alternatives */}
              {feedback.naturalAlternatives && feedback.naturalAlternatives.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
                    Alternatif Lebih Natural:
                  </h4>
                  <div className="space-y-2">
                    {feedback.naturalAlternatives.map((na, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-border/80 space-y-1">
                        <p className="text-muted-foreground selectable-text">Biasa: "{na.original}"</p>
                        <p className="font-medium text-foreground selectable-text">Native: "{na.natural}"</p>
                        <p className="text-muted-foreground text-[11px] selectable-text">{na.context}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vocabulary to save */}
              {feedback.vocabularyLearned && feedback.vocabularyLearned.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">
                    Simpan Kosa Kata ke Vocabulary Trainer:
                  </h4>
                  <div className="space-y-2">
                    {feedback.vocabularyLearned.map((v, idx) => {
                      const key = `vocab-${idx}`;
                      const isSaved = savedVocabIds[key];
                      return (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg border border-border/80 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-foreground selectable-text">{v.phrase}</p>
                            <p className="text-muted-foreground text-[11px] selectable-text">{v.meaning}</p>
                          </div>
                          <button
                            onClick={() => handleSaveVocab(v, key)}
                            disabled={isSaved}
                            className="px-2.5 py-1 rounded text-xs font-medium border border-border hover:bg-muted transition-colors disabled:opacity-50"
                          >
                            {isSaved ? "Tersimpan" : "Simpan"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-border/80 flex justify-end">
              <button
                onClick={() => setFeedback(null)}
                className="px-4 py-2 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90"
              >
                Tutup
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
            Menyiapkan sesi percakapan...
          </div>
        </div>
      }
    >
      <SpeakingPartnerContent />
    </Suspense>
  );
}
