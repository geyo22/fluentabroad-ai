"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useTextToSpeech } from "@/components/AudioSpeech";
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Filter,
  Award,
  Plus,
  X,
  Sparkles,
} from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface DialogueTurn {
  speaker: string;
  text: string;
}

interface ListeningItem {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  audioDurationSec: number;
  dialogue: DialogueTurn[];
  questions: Question[];
  tips?: string;
  bestScore?: number | null;
}

const CATEGORIES = ["ALL", "AIRPORT", "RESTAURANT", "DIRECTIONS", "ACADEMIC", "SERVICES", "SOCIAL"];
const DIFFICULTIES = ["ALL", "A1", "A2", "B1", "B2"];

export default function ListeningLabPage() {
  const [exercises, setExercises] = useState<ListeningItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = useState("ALL");
  const [activeExercise, setActiveExercise] = useState<ListeningItem | null>(null);

  // Exercise Session States
  const [showTranscript, setShowTranscript] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // AI Generator States
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genCategory, setGenCategory] = useState("SOCIAL");
  const [genDifficulty, setGenDifficulty] = useState("B1");
  const [genTopic, setGenTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { speak, stop, isPlaying, playbackSpeed, setPlaybackSpeed } = useTextToSpeech();

  useEffect(() => {
    fetchExercises();
  }, [selectedCategory, selectedDifficulty]);

  const fetchExercises = () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (selectedCategory !== "ALL") query.set("category", selectedCategory);
    if (selectedDifficulty !== "ALL") query.set("difficulty", selectedDifficulty);

    fetch(`/api/listening?${query.toString()}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setExercises(data);
        if (data.length > 0 && !activeExercise) {
          setActiveExercise(data[0]);
        }
      })
      .catch((e) => console.error("Error fetching listening exercises:", e))
      .finally(() => setLoading(false));
  };

  const handleSelectExercise = (ex: ListeningItem) => {
    stop();
    setActiveExercise(ex);
    setShowTranscript(false);
    setUserAnswers({});
    setIsSubmitted(false);
    setQuizScore(null);
  };

  // Play dialogue sequentially
  const handlePlayAudio = () => {
    if (!activeExercise) return;
    if (isPlaying) {
      stop();
      return;
    }
    const fullDialogueText = activeExercise.dialogue
      .map((d) => `${d.speaker} says: ${d.text}`)
      .join(". ");
    speak(fullDialogueText, playbackSpeed);
  };

  const handleSelectOption = (qId: string, optIndex: number) => {
    if (isSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeExercise || isSubmitted) return;

    try {
      const res = await fetch("/api/listening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: activeExercise.id,
          answers: userAnswers,
          timeSpentSec: activeExercise.audioDurationSec + 30,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setQuizScore(data.score);
        setIsSubmitted(true);
        // Update bestScore in local list
        setExercises((prev) =>
          prev.map((ex) => (ex.id === activeExercise.id ? { ...ex, bestScore: data.score } : ex))
        );
      }
    } catch (e) {
      console.error("Quiz submission error:", e);
    }
  };

  const handleGenerateExercise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const res = await fetch("/api/listening/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: genCategory,
          difficulty: genDifficulty,
          customTopic: genTopic.trim(),
        }),
      });

      if (res.ok) {
        const newEx: ListeningItem = await res.json();
        setExercises((prev) => [newEx, ...prev]);
        handleSelectExercise(newEx);
        setShowGenerateModal(false);
        setGenTopic("");
      }
    } catch (e) {
      console.error("Failed to generate exercise:", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="Listening Lab"
        subtitle="Latih pemahaman pendengaran terhadap dialog penutur asli tanpa bergantung pada subtitle."
      />

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-card border border-border shadow-apple">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-muted-foreground mr-1 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Kategori:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-white shadow-xs"
                  : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-muted-foreground mr-1">Level:</span>
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1 rounded-full font-semibold transition-all ${
                  selectedDifficulty === diff
                    ? "bg-primary text-white shadow-xs"
                    : "bg-muted/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowGenerateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Soal Baru (AI)</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Sidebar of Dialogues + Interactive Exercise Player */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Exercise Library List */}
        <div className="rounded-3xl bg-card border border-border/80 p-5 shadow-apple space-y-2.5 max-h-[640px] overflow-y-auto">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
            Pustaka Dialog ({exercises.length})
          </h3>
          {loading ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Memuat dialog...</div>
          ) : (
            exercises.map((ex) => {
              const isActive = activeExercise?.id === ex.id;
              return (
                <div
                  key={ex.id}
                  onClick={() => handleSelectExercise(ex)}
                  className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                    isActive
                      ? "bg-primary/10 border-primary/30 shadow-xs"
                      : "bg-muted/30 hover:bg-muted/70 border-border/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-muted/80 px-2 py-0.5 rounded-full text-primary">
                      {ex.category} • {ex.difficulty}
                    </span>
                    {ex.bestScore !== null && ex.bestScore !== undefined && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        Skor: {ex.bestScore}%
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-foreground mt-2 line-clamp-1">{ex.title}</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    ~{ex.audioDurationSec} detik • {ex.questions.length} pertanyaan
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Active Audio Player & Comprehension Questions */}
        <div className="lg:col-span-2 space-y-6">
          {activeExercise ? (
            <>
              {/* Player Card */}
              <div className="rounded-3xl bg-card border border-border/80 p-7 shadow-apple space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-primary/15 text-primary px-3 py-1 rounded-full">
                        {activeExercise.category}
                      </span>
                      <span className="text-xs font-bold bg-muted/80 px-3 py-1 rounded-full text-foreground">
                        Level {activeExercise.difficulty}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground tracking-tight mt-2">{activeExercise.title}</h3>
                  </div>

                  {/* Playback Speed Controls */}
                  <div className="flex items-center gap-1.5 bg-muted/70 p-1.5 rounded-full text-xs font-bold">
                    <span className="text-muted-foreground text-[10px] px-2">Speed:</span>
                    {[0.75, 1.0, 1.25].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => {
                          setPlaybackSpeed(spd);
                          if (isPlaying) {
                            stop();
                            speak(
                              activeExercise.dialogue
                                .map((d) => `${d.speaker} says: ${d.text}`)
                                .join(". "),
                              spd
                            );
                          }
                        }}
                        className={`px-2.5 py-1 rounded-full transition-all ${
                          playbackSpeed === spd
                            ? "bg-primary text-white shadow-xs"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audio Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handlePlayAudio}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-xs text-white shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] ${
                      isPlaying
                        ? "bg-amber-500 hover:bg-amber-600 animate-pulse"
                        : "bg-primary hover:bg-primary/90"
                    }`}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    <span>{isPlaying ? "Jeda Audio" : "Putar Dialog Audio"}</span>
                  </button>

                  <button
                    onClick={() => {
                      stop();
                      handlePlayAudio();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-muted/80 hover:bg-muted text-foreground text-xs font-medium transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ulangi</span>
                  </button>

                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-full border border-border hover:bg-muted text-foreground text-xs font-medium transition-all ml-auto"
                  >
                    {showTranscript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showTranscript ? "Tutup Naskah" : "Tampilkan Naskah"}</span>
                  </button>
                </div>

                {/* Optional Transcript Box */}
                {showTranscript && (
                  <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2 text-xs animate-in fade-in">
                    <p className="font-bold text-muted-foreground text-[11px] uppercase tracking-wider">
                      English Dialogue Transcript:
                    </p>
                    <div className="space-y-2 divide-y divide-border/40">
                      {activeExercise.dialogue.map((turn, i) => (
                        <div key={i} className="pt-2 first:pt-0">
                          <span className="font-bold text-primary mr-1.5">{turn.speaker}:</span>
                          <span className="text-foreground leading-relaxed">{turn.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pedagogical Listening Tip */}
                {activeExercise.tips && (
                  <div className="p-3.5 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground flex items-start gap-2.5">
                    <span className="font-semibold text-foreground shrink-0">Catatan Pendengaran:</span>
                    <span>{activeExercise.tips}</span>
                  </div>
                )}
              </div>

              {/* Comprehension Quiz Section */}
              <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Pertanyaan Pemahaman</h4>
                    <p className="text-xs text-muted-foreground">
                      Uji seberapa akurat Anda menangkap rincian dari audio di atas.
                    </p>
                  </div>
                  {quizScore !== null && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <Award className="w-4 h-4" />
                      <span>Skor: {quizScore}%</span>
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  {activeExercise.questions.map((q, idx) => {
                    const selected = userAnswers[q.id];
                    return (
                      <div key={q.id} className="p-4 rounded-xl bg-muted/20 border border-border space-y-3">
                        <p className="text-xs font-bold text-foreground">
                          {idx + 1}. {q.question}
                        </p>

                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = selected === optIdx;
                            const isCorrectOpt = q.correctIndex === optIdx;

                            let optClasses =
                              "p-2.5 rounded-lg border text-xs font-medium text-left transition-all flex items-center justify-between ";

                            if (isSubmitted) {
                              if (isCorrectOpt) {
                                optClasses += "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold";
                              } else if (isChosen && !isCorrectOpt) {
                                optClasses += "bg-rose-500/10 border-rose-500 text-rose-700 dark:text-rose-300";
                              } else {
                                optClasses += "bg-card border-border text-muted-foreground opacity-60";
                              }
                            } else {
                              optClasses += isChosen
                                ? "bg-primary/10 border-primary text-primary font-bold shadow-sm"
                                : "bg-card border-border text-foreground hover:bg-muted/60";
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectOption(q.id, optIdx)}
                                className={optClasses}
                              >
                                <span>{opt}</span>
                                {isSubmitted && isCorrectOpt && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                )}
                                {isSubmitted && isChosen && !isCorrectOpt && (
                                  <XCircle className="w-4 h-4 text-rose-500" />
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation on submit */}
                        {isSubmitted && (
                          <div className="p-2.5 rounded-lg bg-card border border-border text-[11px] text-muted-foreground">
                            <strong>Penjelasan:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!isSubmitted ? (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(userAnswers).length === 0}
                    className="w-full py-3 rounded-xl bg-primary text-white text-xs font-bold shadow hover:bg-primary/90 transition-all disabled:opacity-40"
                  >
                    Kirim Jawaban & Cek Skor
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setUserAnswers({});
                      setQuizScore(null);
                    }}
                    className="w-full py-2.5 rounded-xl border border-border hover:bg-muted text-xs font-bold text-foreground transition-all"
                  >
                    Ulangi Latihan Pertanyaan
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-sm text-muted-foreground bg-card rounded-2xl border border-border">
              Pilih salah satu dialog di panel kiri untuk mulai berlatih.
            </div>
          )}
        </div>
      </div>

      {/* AI Dialog Generator Modal - Apple Sheet Style */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-3xl w-full max-w-lg shadow-2xl p-7 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="font-semibold text-foreground text-sm tracking-tight">
                  Buat Latihan Dialog & Soal Baru (AI)
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Gemini AI akan menyusun dialog penutur asli beserta 3 soal pemahaman.
                </p>
              </div>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="p-1.5 rounded-full text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGenerateExercise} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Kategori Situasi</label>
                <select
                  value={genCategory}
                  onChange={(e) => setGenCategory(e.target.value)}
                  className="w-full p-3 rounded-full bg-muted/60 border border-border/80 focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-medium"
                >
                  <option value="AIRPORT">Airport & Imigrasi</option>
                  <option value="RESTAURANT">Kafe & Pemesanan Makanan</option>
                  <option value="DIRECTIONS">Arah & Transportasi Umum</option>
                  <option value="ACADEMIC">Kampus & Diskusi Dosen</option>
                  <option value="SERVICES">Perbankan, SIM Card & Layanan</option>
                  <option value="SOCIAL">Pergaulan & Kehidupan Asrama</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Tingkat Kesulitan (CEFR)</label>
                <div className="grid grid-cols-4 gap-2">
                  {["A1", "A2", "B1", "B2"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setGenDifficulty(lvl)}
                      className={`py-2 rounded-full font-semibold border text-center transition-all ${
                        genDifficulty === lvl
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-muted/60 text-muted-foreground border-border/80 hover:bg-muted"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Topik / Skenario Spesifik (Opsional)</label>
                <input
                  type="text"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  placeholder="Contoh: Bertanya rute trem di Melbourne atau komplain makanan"
                  className="w-full p-3 rounded-full bg-muted/60 border border-border/80 focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-5 py-2.5 rounded-full border border-border hover:bg-muted font-medium text-foreground transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-2.5 rounded-full bg-primary text-white font-semibold hover:bg-primary/90 shadow-xs transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isGenerating ? "Menyusun Dialog AI..." : "Generate & Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

