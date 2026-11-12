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

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="Listening Lab"
        subtitle="Latih pemahaman pendengaran terhadap dialog penutur asli tanpa bergantung pada subtitle."
      />

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-bold text-muted-foreground mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Kategori:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-muted-foreground mr-1">Level:</span>
          {DIFFICULTIES.map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2 py-0.5 rounded font-semibold transition-all ${
                selectedDifficulty === diff
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout: Sidebar of Dialogues + Interactive Exercise Player */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Exercise Library List */}
        <div className="rounded-2xl bg-card border border-border p-4 shadow-sm space-y-2 max-h-[620px] overflow-y-auto">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
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
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    isActive
                      ? "bg-primary/10 border-primary/30 shadow-sm"
                      : "bg-card hover:bg-muted/50 border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded text-primary">
                      {ex.category} • {ex.difficulty}
                    </span>
                    {ex.bestScore !== null && ex.bestScore !== undefined && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        Skor: {ex.bestScore}%
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-foreground mt-1.5 line-clamp-1">{ex.title}</h4>
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
              <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold bg-primary/15 text-primary px-2 py-0.5 rounded-md">
                        {activeExercise.category}
                      </span>
                      <span className="text-xs font-bold bg-muted px-2 py-0.5 rounded-md text-foreground">
                        Level {activeExercise.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mt-1">{activeExercise.title}</h3>
                  </div>

                  {/* Playback Speed Controls */}
                  <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl text-xs font-bold">
                    <span className="text-muted-foreground text-[10px] px-1.5">Speed:</span>
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
                        className={`px-2 py-1 rounded-lg transition-all ${
                          playbackSpeed === spd
                            ? "bg-primary text-white shadow-sm"
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
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow transition-all ${
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ulangi dari Awal</span>
                  </button>

                  <button
                    onClick={() => setShowTranscript(!showTranscript)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border hover:bg-muted/50 text-foreground text-xs font-semibold transition-all ml-auto"
                  >
                    {showTranscript ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showTranscript ? "Sembunyikan Naskah" : "Tampilkan Naskah (Transcript)"}</span>
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
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                    💡 <strong>Tips Pendengaran:</strong> {activeExercise.tips}
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
    </div>
  );
}
