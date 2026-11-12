"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useSpeechRecognition,
  useTextToSpeech,
  SpeakButton,
} from "@/components/AudioSpeech";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Volume2,
  Mic,
  MicOff,
  Award,
  AlertCircle,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Goals, 2: Listening, 3: Speaking, 4: Vocab, 5: Communication, 6: Result

  // User responses
  const [name, setName] = useState("Rian Pratama");
  const [targetDate, setTargetDate] = useState("2027-01-01");
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(90);
  const [explanationLanguage, setExplanationLanguage] = useState("id");

  // Step 2 Listening Answer
  const [listeningAnswer, setListeningAnswer] = useState<number | null>(null);

  // Step 3 Speaking Transcript
  const [speakingTranscript, setSpeakingTranscript] = useState("");

  // Step 4 Vocabulary Answer
  const [vocabAnswer, setVocabAnswer] = useState<number | null>(null);

  // Step 5 Communication Answer
  const [commAnswer, setCommAnswer] = useState<number | null>(null);

  // Results
  const [estimatedLevel, setEstimatedLevel] = useState("B1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { speak } = useTextToSpeech();

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    permissionError,
  } = useSpeechRecognition({
    onFinalTranscript: (text) => {
      setSpeakingTranscript((prev) => (prev ? `${prev} ${text}` : text));
    },
  });

  const handleFinishAssessment = async () => {
    setIsSubmitting(true);

    // Compute scores
    const listeningScore = listeningAnswer === 1 ? 100 : 50;
    const vocabScore = vocabAnswer === 2 ? 100 : 50;
    const commScore = commAnswer === 0 ? 100 : 50;
    const speakingScore = speakingTranscript.split(/\s+/).length >= 8 ? 85 : 60;

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          targetDate,
          dailyGoalMinutes,
          explanationLanguage,
          listeningScore,
          speakingScore,
          vocabScore,
          communicationScore: commScore,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEstimatedLevel(data.estimatedLevel || "B1");
        setStep(6); // Show result screen
      }
    } catch (e) {
      console.error("Onboarding submission error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto w-full bg-card border border-border rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8 space-y-6">
        {/* Progress Dots */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm">
              FA
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">FluentAbroad AI</h1>
              <p className="text-[10px] text-muted-foreground">Placement & Baseline Onboarding</p>
            </div>
          </div>
          <span className="text-xs font-bold text-primary">Langkah {step} dari 6</span>
        </div>

        {/* STEP 1: GOALS & TIMELINE */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-foreground">
                Selamat Datang! Mari Atur Rencana Belajar Anda 🎓
              </h2>
              <p className="text-xs text-muted-foreground">
                Tentukan target keberangkatan ke luar negeri dan waktu harian yang ingin Anda investasikan.
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Nama Anda</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-muted/50 border border-border"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Bulan/Tahun Target Keberangkatan</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-muted/50 border border-border"
                />
                <span className="text-[11px] text-muted-foreground">
                  Default target: Januari 2027 (dapat disesuaikan kapan saja).
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Alokasi Waktu Belajar Harian (Menit)</label>
                <select
                  value={dailyGoalMinutes}
                  onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-muted/50 border border-border"
                >
                  <option value={45}>45 Menit (Intensitas Ringan)</option>
                  <option value={60}>60 Menit (Intensitas Sedang)</option>
                  <option value={90}>90 Menit (Direkomendasikan — Siap Percakapan Nyata)</option>
                  <option value={120}>120 Menit (Intensitas Tinggi)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Bahasa Umpan Balik & Penjelasan</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setExplanationLanguage("id")}
                    className={`p-3 rounded-xl border font-bold text-center transition-all ${
                      explanationLanguage === "id"
                        ? "bg-primary text-white border-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    Bahasa Indonesia
                  </button>
                  <button
                    type="button"
                    onClick={() => setExplanationLanguage("en")}
                    className={`p-3 rounded-xl border font-bold text-center transition-all ${
                      explanationLanguage === "en"
                        ? "bg-primary text-white border-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    English Only
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow flex items-center gap-1.5"
              >
                <span>Mulai Tes Penempatan Singkat</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: LISTENING ASSESSMENT */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <span className="text-xs font-bold text-primary">Tes Penempatan 1: Listening</span>
              <h2 className="text-lg font-bold text-foreground">Dengarkan Pengumuman Bandara</h2>
              <p className="text-xs text-muted-foreground">
                Dengarkan rekaman pendek ini dengan menekan tombol audio, lalu pilih jawaban yang tepat.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                <p className="font-bold text-foreground">Audio Dialog Penutur Asli</p>
                <p>Topik: Pengumuman Gate Keberangkatan Bandara</p>
              </div>
              <SpeakButton
                text="Attention passengers on flight QF-42 to Sydney. The departure gate has been moved from Gate A4 to Gate B18. Boarding will start in 20 minutes."
                size="md"
              />
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-foreground">
                Ke gate manakah penerbangan QF-42 dipindahkan?
              </p>
              {[
                "Gate A4",
                "Gate B18",
                "Gate B14",
                "Gate A18",
              ].map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setListeningAnswer(i)}
                  className={`w-full p-3 rounded-xl border text-left font-medium transition-all ${
                    listeningAnswer === i
                      ? "bg-primary text-white border-primary font-bold shadow-sm"
                      : "bg-card border-border hover:bg-muted/50 text-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-bold"
              >
                Kembali
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={listeningAnswer === null}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow disabled:opacity-40"
              >
                Lanjut ke Speaking →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SPEAKING ASSESSMENT */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <span className="text-xs font-bold text-primary">Tes Penempatan 2: Spoken Intro</span>
              <h2 className="text-lg font-bold text-foreground">Perkenalkan Diri Anda</h2>
              <p className="text-xs text-muted-foreground">
                Ucapkan 2 atau 3 kalimat dalam Bahasa Inggris: nama Anda, jurusan kuliah di Indonesia, dan alasan mengapa ingin ke luar negeri.
              </p>
            </div>

            {permissionError && (
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-700 text-xs">
                {permissionError} (Anda dapat mengetik langsung jika mikrofon tidak tersedia).
              </div>
            )}

            <div className="p-6 rounded-2xl bg-muted/30 border border-border text-center space-y-3">
              <button
                type="button"
                onClick={() => (isListening ? stopListening() : startListening())}
                className={`p-4 rounded-full shadow-lg transition-all ${
                  isListening
                    ? "bg-rose-500 text-white animate-voice-ripple"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <p className="text-xs font-semibold text-foreground">
                {isListening ? "Mendengarkan ucapan Anda... Klik untuk selesai" : "Tekan untuk berbicara"}
              </p>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-foreground">Transkrip Ucapan Anda (atau ketik):</label>
              <textarea
                rows={3}
                value={speakingTranscript}
                onChange={(e) => setSpeakingTranscript(e.target.value)}
                placeholder="Contoh: My name is Rian, I study Information Systems in Indonesia, and I want to study abroad to broaden my horizons."
                className="w-full p-3 rounded-xl bg-muted/40 border border-border focus:outline-none text-foreground"
              />
            </div>

            <div className="pt-2 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-bold"
              >
                Kembali
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!speakingTranscript.trim()}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow disabled:opacity-40"
              >
                Lanjut ke Kosa Kata →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: VOCABULARY ASSESSMENT */}
        {step === 4 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <span className="text-xs font-bold text-primary">Tes Penempatan 3: Vocabulary & Idioms</span>
              <h2 className="text-lg font-bold text-foreground">Pilih Frasa yang Paling Natural</h2>
              <p className="text-xs text-muted-foreground">
                Jika Anda ingin mengatakan bahwa Anda tidak begitu jelas mendengar perkataan lawan bicara, manakah ungkapan yang paling sopan dan natural?
              </p>
            </div>

            <div className="space-y-2 text-xs">
              {[
                "What did you speak?",
                "Repeat your voice again please.",
                "I didn't quite catch that, would you mind repeating?",
                "My ear didn't take your words.",
              ].map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setVocabAnswer(i)}
                  className={`w-full p-3.5 rounded-xl border text-left font-medium transition-all ${
                    vocabAnswer === i
                      ? "bg-primary text-white border-primary font-bold shadow-sm"
                      : "bg-card border-border hover:bg-muted/50 text-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-bold"
              >
                Kembali
              </button>
              <button
                onClick={() => setStep(5)}
                disabled={vocabAnswer === null}
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow disabled:opacity-40"
              >
                Lanjut ke Komunikasi Nyata →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: REAL-LIFE SITUATION ASSESSMENT */}
        {step === 5 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <span className="text-xs font-bold text-primary">Tes Penempatan 4: Real-Life Situation</span>
              <h2 className="text-lg font-bold text-foreground">Skenario Pemesanan Kafe</h2>
              <p className="text-xs text-muted-foreground">
                Anda berada di kafe Melbourne. Barista bertanya: <em>"Hey there, is that for here or takeaway?"</em> Bagaimana Anda merespon jika ingin minum di tempat?
              </p>
            </div>

            <div className="space-y-2 text-xs">
              {[
                "For here, please. Thank you!",
                "I eat inside this room.",
                "Takeaway please, I will sit.",
                "Yes, I want here or takeaway.",
              ].map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCommAnswer(i)}
                  className={`w-full p-3.5 rounded-xl border text-left font-medium transition-all ${
                    commAnswer === i
                      ? "bg-primary text-white border-primary font-bold shadow-sm"
                      : "bg-card border-border hover:bg-muted/50 text-foreground"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="pt-2 flex justify-between">
              <button
                onClick={() => setStep(4)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-bold"
              >
                Kembali
              </button>
              <button
                onClick={handleFinishAssessment}
                disabled={commAnswer === null || isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-all disabled:opacity-40"
              >
                {isSubmitting ? "Menghitung Hasil..." : "Selesaikan Tes & Lihat Hasil 🎉"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: RESULT & GENERATED CURRICULUM */}
        {step === 6 && (
          <div className="space-y-6 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Estimasi Penempatan Informal
              </span>
              <h2 className="text-3xl font-extrabold text-foreground">
                Level Anda: <span className="text-primary">{estimatedLevel}</span>
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                Hasil ini merupakan estimasi awal kesiapan percakapan untuk menyesuaikan kurikulum dan partner AI Anda, bukan sertifikasi resmi CEFR.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border text-left space-y-2 text-xs">
              <h4 className="font-bold text-foreground">Rencana Persiapan Pribadi:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Kurikulum 7 Minggu disesuaikan dengan titik awal {estimatedLevel}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Target Keberangkatan: {targetDate} ({dailyGoalMinutes} menit/hari)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>AI Tutor berbicara dalam Bahasa Inggris dengan penjelasan Bahasa Indonesia</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => router.push("/")}
              className="w-full py-3.5 rounded-xl bg-primary text-white text-xs font-bold shadow hover:bg-primary/90 transition-all"
            >
              Masuk ke Dashboard Pembelajaran →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
