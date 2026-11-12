"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import {
  useSpeechRecognition,
  useTextToSpeech,
  compareTranscriptToTarget,
} from "@/components/AudioSpeech";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  ChevronRight,
  ArrowRight,
  Plus,
  X,
} from "lucide-react";

interface ShadowingExercise {
  id: string;
  category: string;
  targetSentence: string;
  translation: string;
  phoneticTips: string;
  connectedSpeechNote: string;
}

const SHADOWING_PRACTICE_SET: ShadowingExercise[] = [
  {
    id: "s1",
    category: "Connected Speech",
    targetSentence: "I didn't quite catch that, would you mind repeating it a bit slower?",
    translation: "Saya tadi tidak begitu menangkap perkataannya, boleh tolong ulangi sedikit lebih pelan?",
    phoneticTips: "Hubungkan 'didn't' dan 'quite' tanpa jeda. 'Catch that' diucapkan menyambung /kætʃ ðæt/.",
    connectedSpeechNote: "Latih tanpa menghentikan nafas di tengah frasa 'would you mind'.",
  },
  {
    id: "s2",
    category: "Polite Question Intonation",
    targetSentence: "Could you tell me where the international student office is located?",
    translation: "Bisakah Anda memberi tahu saya di mana lokasi kantor mahasiswa internasional?",
    phoneticTips: "Gunakan intonasi meninggi halus pada 'office' dan turun mantap pada 'located'.",
    connectedSpeechNote: "'Could you' sering tereduksi menjadi /kʊdʒuː/ dalam percakapan santai.",
  },
  {
    id: "s3",
    category: "Survival Abroad",
    targetSentence: "I am here to attend a student exchange program for one semester.",
    translation: "Saya di sini untuk mengikuti program pertukaran mahasiswa selama satu semester.",
    phoneticTips: "Beri penekanan utama pada kata kunci: 'attend', 'exchange program', dan 'one semester'.",
    connectedSpeechNote: "Ucapkan dengan ritme tenang saat menjawab petugas imigrasi bandara.",
  },
  {
    id: "s4",
    category: "Everyday Ordering",
    targetSentence: "Can I get an iced americano to go with oat milk, please?",
    translation: "Bisa saya pesan es americano bawa pulang dengan susu oat?",
    phoneticTips: "'Can I get' diucapkan cepat /kænaɪ ɡɛt/, 'to go' ditekan dengan jelas.",
    connectedSpeechNote: "Hindari jeda panjang antara 'americano' dan 'to go'.",
  },
  {
    id: "s5",
    category: "Academic Consultation",
    targetSentence: "I was hoping to get your constructive feedback on my research methodology.",
    translation: "Saya berharap bisa mendapatkan masukan membangun Anda mengenai metodologi riset saya.",
    phoneticTips: "Penekanan suku kata: con-STRUC-tive, me-tho-DO-lo-gy.",
    connectedSpeechNote: "'Hoping to get' mengalir lancar /hoʊpɪŋ tə ɡɛt/.",
  },
  {
    id: "s6",
    category: "Resolving Issues",
    targetSentence: "I apologize if that came out wrong, what I really meant was quite different.",
    translation: "Saya minta maaf jika terdengar salah, apa yang sebenarnya saya maksudkan agak berbeda.",
    phoneticTips: "'Came out wrong' menghubungkan bunyi /t/ ke /w/: /keɪm aʊt rɒŋ/.",
    connectedSpeechNote: "Intonasi tulus dan nada suara tenang untuk meredakan kesalahpahaman.",
  },
];

export default function ShadowingPage() {
  const [exercises, setExercises] = useState<ShadowingExercise[]>(SHADOWING_PRACTICE_SET);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spokenText, setSpokenText] = useState("");
  const [comparison, setComparison] = useState<{
    similarityScore: number;
    wordComparison: { word: string; matched: boolean }[];
    feedbackNotes: string;
  } | null>(null);

  // AI Generator state
  const [showGenModal, setShowGenModal] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const active = exercises[currentIndex];
  const { speak, stop, isPlaying } = useTextToSpeech();

  const handleGenerateShadowing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const res = await fetch("/api/shadowing/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customTopic: customTopic.trim() || "Everyday Conversation Abroad" }),
      });

      if (res.ok) {
        const newEx: ShadowingExercise = await res.json();
        setExercises((prev) => [...prev, newEx]);
        setCurrentIndex(exercises.length); // switch to the new one
        setShowGenModal(false);
        setCustomTopic("");
      }
    } catch (e) {
      console.error("Shadowing generation error:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    permissionError,
  } = useSpeechRecognition({
    onFinalTranscript: (text) => {
      setSpokenText(text);
      const res = compareTranscriptToTarget(text, active.targetSentence);
      setComparison(res);
    },
  });

  const handleNext = () => {
    stop();
    setSpokenText("");
    setComparison(null);
    setCurrentIndex((prev) => (prev + 1) % exercises.length);
  };

  const handlePrev = () => {
    stop();
    setSpokenText("");
    setComparison(null);
    setCurrentIndex((prev) => (prev - 1 + exercises.length) % exercises.length);
  };

  const handlePlayReference = () => {
    if (isPlaying) {
      stop();
    } else {
      speak(active.targetSentence, 0.9);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="Shadowing & Pronunciation Practice"
        subtitle="Latih pelafalan, irama intonasi, dan kelancaran berbicara dengan teknik shadowing terhadap kalimat autentik."
      />

      {/* Methodological Transparency Note */}
      <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground flex items-start gap-2.5">
        <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-foreground font-semibold">Prinsip Penilaian:</strong> Modul ini mengukur kesesuaian pengenalan kata (
          <em>word-recognition similarity</em>) melalui transkripsi suara browser, bukan skor akustik fonemik tiruan.
          Fokuskan latihan pada ritme, intonasi, dan kelancaran mengucapkan kalimat secara utuh.
        </p>
      </div>

      {permissionError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Main Shadowing Studio Card - Apple Design */}
      <div className="rounded-3xl bg-card border border-border/80 p-6 sm:p-8 shadow-apple space-y-7">
        {/* Header with Exercise Counter & Category */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
              {active.category}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              Latihan {currentIndex + 1} dari {exercises.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGenModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Kalimat Baru (AI)</span>
            </button>
            <button
              onClick={handlePrev}
              className="px-3.5 py-1.5 rounded-full border border-border hover:bg-muted text-xs font-medium transition-colors"
            >
              Sebelumnya
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98]"
            >
              Berikutnya →
            </button>
          </div>
        </div>

        {/* Step 1 & 2: Target English Sentence & Audio Playback */}
        <div className="p-7 sm:p-8 rounded-3xl bg-muted/30 border border-border/60 space-y-4 text-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Kalimat Target (Dengarkan & Tirukan)
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight leading-relaxed selectable-text">
            "{active.targetSentence}"
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium selectable-text">
            Arti: {active.translation}
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handlePlayReference}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-semibold text-white shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] ${isPlaying
                  ? "bg-amber-500 hover:bg-amber-600 animate-pulse"
                  : "bg-primary hover:bg-primary/90"
                }`}
            >
              {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlaying ? "Hentikan Audio Target" : "Dengarkan Audio Target (0.9x)"}</span>
            </button>
          </div>
        </div>

        {/* Linguistic Coaching Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1">
            <h4 className="text-xs font-semibold text-foreground">
              Artikulasi & Intonasi
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{active.phoneticTips}</p>
          </div>
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1">
            <h4 className="text-xs font-semibold text-foreground">
              Connected Speech Flow
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {active.connectedSpeechNote}
            </p>
          </div>
        </div>

        {/* Step 3: Record User Speech */}
        <div className="p-6 rounded-2xl border border-border bg-muted/20 space-y-4 text-center">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Langkah 2: Rekam Percobaan Ucapkan Anda
          </h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Tekan mikrofon di bawah, lalu ucapkan kalimat target secara lantang mengikuti tempo penutur asli.
          </p>

          <div className="flex flex-col items-center justify-center pt-2">
            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  setSpokenText("");
                  setComparison(null);
                  startListening();
                }
              }}
              className={`p-5 rounded-full shadow-lg transition-all focus:outline-none ${isListening
                  ? "bg-rose-500 text-white animate-voice-ripple scale-110"
                  : "bg-primary text-white hover:bg-primary/90"
                }`}
            >
              {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>
            <span className="text-xs font-semibold text-foreground mt-2">
              {isListening ? "Sedang mendengarkan... (Klik untuk selesai)" : "Klik untuk mulai rekam"}
            </span>
          </div>

          {/* Real-time transcript preview */}
          {transcript && (
            <div className="p-3 rounded-xl bg-card border border-border text-xs text-muted-foreground italic max-w-lg mx-auto">
              "{transcript}"
            </div>
          )}
        </div>

        {/* Step 4: Comparison Analysis & Feedback */}
        {comparison && (
          <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h4 className="text-sm font-bold text-foreground">Hasil Analisis Pengenalan Ucapan</h4>
                <p className="text-xs text-muted-foreground">
                  Perbandingan kata yang tertangkap oleh sistem speech recognition.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Akurasi Transkrip:</span>
                <span
                  className={`text-base font-extrabold px-3 py-1 rounded-full ${comparison.similarityScore >= 80
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : comparison.similarityScore >= 50
                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    }`}
                >
                  {comparison.similarityScore}%
                </span>
              </div>
            </div>

            {/* Word-by-word Match Chips */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Pencocokan Kata per Kata:
              </span>
              <div className="flex flex-wrap gap-2">
                {comparison.wordComparison.map((w, idx) => (
                  <span
                    key={idx}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${w.matched
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300 line-through"
                      }`}
                  >
                    {w.word}
                  </span>
                ))}
              </div>
            </div>

            {/* Qualitative Practice Notes */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs leading-relaxed">
              <strong>Saran Latihan:</strong> {comparison.feedbackNotes}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSpokenText("");
                  setComparison(null);
                  startListening();
                }}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Coba Ulangi Kalimat Ini</span>
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 flex items-center gap-1.5"
              >
                <span>Lanjut ke Kalimat Berikutnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Shadowing Sentence Generator Modal */}
      {showGenModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-3xl w-full max-w-lg shadow-2xl p-7 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-semibold text-foreground text-sm tracking-tight">
                  Buat Kalimat Shadowing Baru (AI)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Gemini AI akan membuat kalimat penutur asli beserta panduan artikulasi & connected speech.
                </p>
              </div>
              <button
                onClick={() => setShowGenModal(false)}
                className="p-1.5 rounded-full text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateShadowing} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Topik / Situasi Kalimat</label>
                <input
                  type="text"
                  required
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="Contoh: Menanyakan rute stasiun kereta, atau memesan makanan di kafe"
                  className="w-full p-3 rounded-full bg-muted/60 border border-border/80 focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="px-5 py-2.5 rounded-full border border-border hover:bg-muted font-medium text-foreground transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !customTopic.trim()}
                  className="px-6 py-2.5 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 shadow-xs transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isGenerating ? "Menyusun Kalimat..." : "Generate Kalimat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

