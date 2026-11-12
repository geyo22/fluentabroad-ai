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
          {/* Main Challenge Card */}
          <div className="rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" /> Tantangan Hari Ini
                </span>
                <span className="text-xs text-muted-foreground font-semibold">
                  Skill: {challenge.targetSkill}
                </span>
              </div>
              <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded text-foreground">
                Target: {challenge.targetMinutes} Menit
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-foreground">{challenge.title}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {challenge.description}
              </p>
            </div>

            {challenge.prompt && (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
                <p className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  Pertanyaan Panduan / Prompt:
                </p>
                <p className="text-xs font-semibold text-foreground italic">
                  "{challenge.prompt}"
                </p>
              </div>
            )}

            {/* Submission Area */}
            {isCompleted ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Tantangan Hari Ini Berhasil Diselesaikan!</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Respon Anda: "{proofText}"
                </p>
                <p className="text-[11px] text-emerald-600 font-medium">
                  Streak belajar Anda bertambah +1 hari. Pertahankan ritme ini!
                </p>
              </div>
            ) : (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground">Rekam Suara atau Tulis Respon:</span>
                  <button
                    type="button"
                    onClick={() => (isListening ? stopListening() : startListening())}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow ${
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
                  className="w-full text-xs p-3.5 rounded-xl bg-muted/40 border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />

                <button
                  onClick={handleSubmitChallenge}
                  disabled={!proofText.trim() || submitting}
                  className="w-full py-3 rounded-xl bg-primary text-white text-xs font-bold shadow hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
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
