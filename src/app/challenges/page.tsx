"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useSpeechRecognition } from "@/components/AudioSpeech";
import {
  Award,
  Flame,
  CheckCircle2,
  Calendar,
  Clock,
  Mic,
  MicOff,
  Send,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface ChallengeData {
  id: string;
  date: string;
  title: string;
  description: string;
  targetSkill: string;
  targetMinutes: number;
  difficulty: string;
  prompt?: string;
}

export default function ChallengesPage() {
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [proofText, setProofText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    permissionError,
  } = useSpeechRecognition({
    onFinalTranscript: (text) => {
      setProofText((prev) => (prev ? `${prev} ${text}` : text));
    },
  });

  useEffect(() => {
    if (transcript && isListening) {
      setProofText(transcript);
    }
  }, [transcript, isListening]);

  useEffect(() => {
    fetchChallenge();
  }, []);

  const fetchChallenge = () => {
    setLoading(true);
    fetch("/api/challenges")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setChallenge(data.challenge);
          setIsCompleted(data.isCompleted);
          if (data.completion?.proofText) {
            setProofText(data.completion.proofText);
          }
        }
      })
      .catch((e) => console.error("Error fetching challenge:", e))
      .finally(() => setLoading(false));
  };

  const handleSubmitChallenge = async () => {
    if (!challenge || !proofText.trim() || submitting) return;

    if (isListening) stopListening();
    setSubmitting(true);

    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId: challenge.id,
          proofText: proofText.trim(),
        }),
      });

      if (res.ok) {
        setIsCompleted(true);
      }
    } catch (e) {
      console.error("Challenge submit error:", e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="Tantangan Harian (Daily Challenge)"
        subtitle="Bangun reflek komunikasi tanpa jeda dengan tantangan singkat berdurasi 10 menit setiap hari."
      />

      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">Memuat tantangan hari ini...</div>
      ) : challenge ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Main Challenge Card - Apple Style */}
          <div className="rounded-3xl bg-card border border-border/80 p-6 sm:p-8 shadow-apple space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 fill-current" /> Tantangan Hari Ini
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  Skill: {challenge.targetSkill}
                </span>
              </div>
              <span className="text-xs font-semibold bg-muted/80 px-3 py-1 rounded-full text-foreground">
                Target: {challenge.targetMinutes} Menit
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight">{challenge.title}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {challenge.description}
              </p>
            </div>

            {challenge.prompt && (
              <div className="p-5 rounded-2xl bg-muted/40 border border-border/60 space-y-1.5">
                <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                  Pertanyaan Panduan / Prompt:
                </p>
                <p className="text-xs sm:text-sm font-medium text-foreground italic selectable-text">
                  "{challenge.prompt}"
                </p>
              </div>
            )}

            {/* Submission Area */}
            {isCompleted ? (
              <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Tantangan Hari Ini Berhasil Diselesaikan!</span>
                </div>
                <p className="text-xs text-muted-foreground selectable-text">
                  Respon Anda: "{proofText}"
                </p>
                <p className="text-[11px] text-emerald-600 font-medium">
                  Streak belajar Anda bertambah +1 hari. Pertahankan ritme ini!
                </p>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Rekam Suara atau Tulis Respon:</span>
                  <button
                    type="button"
                    onClick={() => (isListening ? stopListening() : startListening())}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      isListening ? "bg-rose-500 animate-pulse" : "bg-primary hover:bg-primary/90"
                    }`}
                  >
                    {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                    <span>{isListening ? "Hentikan Rekam" : "Bicara dengan Mic"}</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder="Gunakan mikrofon di atas untuk berbicara, atau ketik transkrip jawaban latihan Anda di sini..."
                  className="w-full text-xs sm:text-sm p-4 rounded-2xl bg-muted/40 border border-border/80 focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />

                <button
                  onClick={handleSubmitChallenge}
                  disabled={!proofText.trim() || submitting}
                  className="w-full py-3.5 rounded-full bg-primary text-white text-xs font-semibold shadow-xs hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim dan Catat Selesai Hari Ini</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

