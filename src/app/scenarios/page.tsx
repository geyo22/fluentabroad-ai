"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import {
  useSpeechRecognition,
  useTextToSpeech,
  SpeakButton,
} from "@/components/AudioSpeech";
import {
  PlaneTakeoff,
  ShieldCheck,
  Navigation,
  Train,
  MapPin,
  Utensils,
  Key,
  Users,
  GraduationCap,
  Smile,
  Cpu,
  Briefcase,
  HelpCircle,
  HeartPulse,
  MessageSquareDiff,
  Award,
  CheckCircle2,
  XCircle,
  Sparkles,
  Play,
  X,
  Mic,
  MicOff,
  Send,
  RotateCcw,
} from "lucide-react";

interface Scenario {
  id: string;
  title: string;
  setting: string;
  objective: string;
  userRole: string;
  aiRole: string;
  initialPrompt: string;
  keyPhrases: string[];
  difficulty: string;
  lastAttempt?: {
    status: string;
    objectiveMet: boolean;
    score: number;
    evaluationJson?: string;
  } | null;
}

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);

  // Simulation Session States
  const [messages, setMessages] = useState<{ sender: "USER" | "AI"; content: string }[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const { speak } = useTextToSpeech();

  const {
    isListening,
    transcript,
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
    fetchScenarios();
  }, []);

  const fetchScenarios = () => {
    setLoading(true);
    fetch("/api/scenarios")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setScenarios(data))
      .catch((e) => console.error("Error loading scenarios:", e))
      .finally(() => setLoading(false));
  };

  const handleStartScenario = (sc: Scenario) => {
    setActiveScenario(sc);
    setEvaluation(null);
    setMessages([{ sender: "AI", content: sc.initialPrompt }]);
    setInputText("");
    speak(sc.initialPrompt);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isSending || !activeScenario) return;

    if (isListening) stopListening();

    const text = inputText.trim();
    setInputText("");
    setIsSending(true);

    const newMsgs = [...messages, { sender: "USER" as const, content: text }];
    setMessages(newMsgs);

    try {
      const res = await fetch("/api/speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "ROLEPLAY",
          topic: activeScenario.title,
          partnerRole: activeScenario.aiRole,
          message: text,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => [...prev, { sender: "AI", content: data.message.content }]);
          speak(data.message.content);
        }
      }
    } catch (e) {
      console.error("Scenario turn error:", e);
    } finally {
      setIsSending(false);
    }
  };

  const handleFinishAndEvaluate = async () => {
    if (!activeScenario || messages.length < 2) return;
    setIsEvaluating(true);

    try {
      const res = await fetch("/api/scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenarioId: activeScenario.id,
          transcript: messages,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEvaluation(data.evaluation);
        fetchScenarios(); // refresh attempt status
      }
    } catch (e) {
      console.error("Evaluation error:", e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="Real-Life Abroad Simulations"
        subtitle="15 skenario interaktif yang mensimulasikan situasi kritis saat bepergian dan menetap di luar negeri."
      />

      {/* Scenarios Grid - Apple Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-12 text-center text-xs text-muted-foreground">
            Memuat skenario simulasi...
          </div>
        ) : (
          scenarios.map((sc, idx) => {
            const hasPassed = sc.lastAttempt?.status === "PASSED";
            return (
              <div
                key={sc.id}
                className="p-6 rounded-3xl bg-card border border-border/80 shadow-apple hover:shadow-apple-hover transition-all space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary">Skenario #{idx + 1}</span>
                    <span className="bg-muted/80 text-muted-foreground px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                      Level {sc.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-foreground tracking-tight leading-snug">{sc.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{sc.objective}</p>

                  <div className="pt-2 border-t border-border/60 space-y-1 text-[11px] text-muted-foreground">
                    <p>
                      <span className="text-foreground font-semibold">Lokasi:</span> {sc.setting}
                    </p>
                    <p>
                      <span className="text-foreground font-semibold">Peran AI:</span> {sc.aiRole}
                    </p>
                  </div>

                  {/* Key Phrases */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sc.keyPhrases.slice(0, 3).map((kp, kIdx) => (
                      <span
                        key={kIdx}
                        className="text-[10px] bg-muted/80 text-muted-foreground px-2.5 py-0.5 rounded-full font-mono"
                      >
                        {kp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  {sc.lastAttempt ? (
                    <span
                      className={`text-xs font-semibold flex items-center gap-1.5 ${
                        hasPassed
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {hasPassed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Lolos ({sc.lastAttempt.score}%)
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" /> Coba Lagi
                        </>
                      )}
                    </span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground font-medium">Belum dicoba</span>
                  )}

                  <button
                    onClick={() => handleStartScenario(sc)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Mulai Simulasi</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Simulation Modal - Apple Sheet Style */}
      {activeScenario && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border/80 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-primary">Simulasi Skenario Abroad</span>
                <h3 className="text-base font-semibold text-foreground tracking-tight">{activeScenario.title}</h3>
              </div>
              <button
                onClick={() => setActiveScenario(null)}
                className="p-1.5 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Objective Banner */}
            <div className="px-6 py-3 bg-primary/10 border-b border-border text-xs flex items-center justify-between">
              <span className="text-foreground">
                <strong>Misi Anda:</strong> {activeScenario.objective}
              </span>
              <span className="font-bold text-primary shrink-0 ml-2">
                AI: {activeScenario.aiRole}
              </span>
            </div>

            {/* Messages Area */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3 bg-muted/20 min-h-[280px]">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === "USER" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                      m.sender === "USER"
                        ? "bg-primary text-white font-medium"
                        : "bg-card border border-border text-foreground shadow-sm"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                    {m.sender === "AI" && (
                      <div className="mt-1 flex justify-end">
                        <SpeakButton text={m.content} size="sm" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="text-xs text-muted-foreground italic flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span>{activeScenario.aiRole} sedang merespons...</span>
                </div>
              )}
            </div>

            {/* Evaluation Result View if generated */}
            {evaluation && (
              <div className="p-4 border-t border-border bg-card space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span
                    className={`font-semibold text-sm ${
                      evaluation.objectiveMet ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {evaluation.objectiveMet ? "Misi Berhasil Terpenuhi" : "Perlu Latihan Tambahan"}
                  </span>
                  <span className="font-bold text-sm text-foreground">
                    Skor: {evaluation.score}/100
                  </span>
                </div>
                <p className="text-muted-foreground selectable-text">{evaluation.feedback}</p>
              </div>
            )}

            {/* Input & Action Bar */}
            <div className="p-4 border-t border-border bg-card space-y-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => (isListening ? stopListening() : startListening())}
                  className={`p-2.5 rounded-full text-white shadow ${
                    isListening ? "bg-rose-500 animate-pulse" : "bg-primary hover:bg-primary/90"
                  }`}
                  title="Gunakan mikrofon suara"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={isListening ? "Mendengarkan ucapan Anda..." : "Bicaralah atau ketik respon..."}
                  className="flex-1 text-xs p-2.5 rounded-xl bg-muted/50 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isSending}
                  className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground">
                  Lakukan minimal 2 putaran dialog sebelum menyelesaikan.
                </span>
                <button
                  onClick={handleFinishAndEvaluate}
                  disabled={messages.length < 2 || isEvaluating}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-all disabled:opacity-50"
                >
                  {isEvaluating ? "Menilai Skenario..." : "Selesai & Evaluasi Target"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

