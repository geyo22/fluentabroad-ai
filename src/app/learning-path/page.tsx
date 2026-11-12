"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { SpeakButton } from "@/components/AudioSpeech";
import {
  CheckCircle2,
  Circle,
  Play,
  Lock,
  ChevronDown,
  ChevronUp,
  Volume2,
  BookOpen,
  MessageSquare,
  Sparkles,
  ArrowRight,
  X,
  Award,
} from "lucide-react";

interface LessonProgress {
  status: string;
  score?: number;
}

interface Lesson {
  id: string;
  dayNumber: number;
  title: string;
  objectives: string;
  sentencePatterns: string;
  vocabList: string;
  guidedSpeakingPrompts: string;
  dialogueScript?: string;
  progress?: LessonProgress[];
}

interface CurriculumWeek {
  id: string;
  weekNumber: number;
  title: string;
  theme: string;
  description: string;
  isUnlocked: boolean;
  lessons: Lesson[];
}

export default function LearningPathPage() {
  const [weeks, setWeeks] = useState<CurriculumWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWeeks, setExpandedWeeks] = useState<{ [key: number]: boolean }>({ 1: true, 2: true });
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lessonTab, setLessonTab] = useState<"content" | "speaking" | "dialogue">("content");
  const [completing, setCompleting] = useState(false);
  const [celebration, setCelebration] = useState(false);

  useEffect(() => {
    fetch("/api/learning-path")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setWeeks(data);
      })
      .catch((e) => console.error("Error loading curriculum:", e))
      .finally(() => setLoading(false));
  }, []);

  const toggleWeek = (weekNum: number) => {
    setExpandedWeeks((prev) => ({ ...prev, [weekNum]: !prev[weekNum] }));
  };

  const handleCompleteLesson = async () => {
    if (!activeLesson) return;
    setCompleting(true);
    try {
      const res = await fetch("/api/learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: activeLesson.id, timeSpentMinutes: 20, score: 100 }),
      });
      if (res.ok) {
        setCelebration(true);
        // Refresh weeks state
        const updatedWeeks = weeks.map((w) => ({
          ...w,
          lessons: w.lessons.map((l) =>
            l.id === activeLesson.id
              ? { ...l, progress: [{ status: "COMPLETED", score: 100 }] }
              : l
          ),
        }));
        setWeeks(updatedWeeks);
        setTimeout(() => {
          setCelebration(false);
          setActiveLesson(null);
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to complete lesson:", err);
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="Kurikulum 7 Minggu Siap Abroad"
        subtitle="Struktur pembelajaran komprehensif dari kemampuan bertahan hidup hingga simulasi penuh perkuliahan."
      />

      {loading ? (
        <div className="p-12 text-center text-muted-foreground text-sm">
          Memuat kurikulum pembelajaran...
        </div>
      ) : (
        <div className="space-y-4">
          {weeks.map((week) => {
            const isExpanded = expandedWeeks[week.weekNumber] ?? false;
            const completedCount = week.lessons.filter(
              (l) => l.progress && l.progress.some((p) => p.status === "COMPLETED")
            ).length;

            return (
              <div
                key={week.id}
                className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-apple transition-all"
              >
                {/* Week Header Banner */}
                <div
                  onClick={() => toggleWeek(week.weekNumber)}
                  className="p-6 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shadow-xs">
                      W{week.weekNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-base tracking-tight">{week.title}</h3>
                        <span className="text-[11px] bg-primary/10 text-primary px-3 py-0.5 rounded-full font-semibold">
                          {week.theme}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{week.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block text-right">
                      <span className="text-xs font-semibold text-foreground">
                        {completedCount}/{week.lessons.length} Selesai
                      </span>
                      <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${(completedCount / (week.lessons.length || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <button className="p-1.5 text-muted-foreground rounded-full hover:bg-muted">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Week Lessons List */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-border/60 divide-y divide-border/40">
                    {week.lessons.map((lesson) => {
                      const isCompleted =
                        lesson.progress && lesson.progress.some((p) => p.status === "COMPLETED");

                      return (
                        <div
                          key={lesson.id}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => setActiveLesson(lesson)}
                              className="mt-0.5 text-muted-foreground group-hover:text-primary transition-colors"
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground" />
                              )}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-primary">Day {lesson.dayNumber}</span>
                                <h4 className="text-sm font-semibold text-foreground">{lesson.title}</h4>
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {JSON.parse(lesson.objectives)[0] || "Latihan berbicara kontekstual"}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => setActiveLesson(lesson)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold self-start sm:self-auto transition-all"
                          >
                            <Play className="w-3.5 h-3.5 fill-primary" />
                            <span>{isCompleted ? "Ulas Kembali" : "Mulai Modul"}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Lesson Modal - Apple Sheet Style */}
      {activeLesson && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-3xl w-full max-w-3xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border/80 flex items-center justify-between bg-card">
              <div>
                <span className="text-xs font-semibold text-primary">Modul Pembelajaran</span>
                <h3 className="text-lg font-semibold text-foreground tracking-tight">{activeLesson.title}</h3>
              </div>
              <button
                onClick={() => setActiveLesson(null)}
                className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-border px-6 gap-6 text-xs font-semibold">
              <button
                onClick={() => setLessonTab("content")}
                className={`py-3 border-b-2 transition-colors ${
                  lessonTab === "content"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Pola Kalimat & Kosa Kata
              </button>
              <button
                onClick={() => setLessonTab("dialogue")}
                className={`py-3 border-b-2 transition-colors ${
                  lessonTab === "dialogue"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Naskah Dialog & Audio
              </button>
              <button
                onClick={() => setLessonTab("speaking")}
                className={`py-3 border-b-2 transition-colors ${
                  lessonTab === "speaking"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Latihan Bicara Terpandu
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {lessonTab === "content" && (
                <div className="space-y-6">
                  {/* Objectives */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-foreground tracking-tight">
                      Sasaran Kemampuan:
                    </h4>
                    <ul className="space-y-1.5">
                      {JSON.parse(activeLesson.objectives).map((obj: string, i: number) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-2 selectable-text">
                          <CheckCircle2 className="w-3.5 h-3.5 text-foreground shrink-0" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sentence Patterns */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-foreground tracking-tight">
                      Pola Kalimat Praktis:
                    </h4>
                    {JSON.parse(activeLesson.sentencePatterns).map((sp: any, i: number) => (
                      <div key={i} className="p-3.5 rounded-lg bg-muted/40 border border-border/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-foreground font-mono selectable-text">{sp.pattern}</p>
                          <SpeakButton text={sp.example} size="sm" />
                        </div>
                        <p className="text-xs text-foreground font-medium selectable-text">{sp.meaning}</p>
                        <p className="text-xs text-muted-foreground italic selectable-text">Contoh: "{sp.example}"</p>
                      </div>
                    ))}
                  </div>

                  {/* Useful Vocabulary */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold text-foreground tracking-tight">
                      Frasa Kunci:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {JSON.parse(activeLesson.vocabList).map((v: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-card border border-border/80 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-foreground selectable-text">{v.phrase}</span>
                            <SpeakButton text={v.phrase} size="sm" />
                          </div>
                          <p className="text-xs text-muted-foreground font-medium selectable-text">
                            {v.translation}
                          </p>
                          <p className="text-[11px] text-muted-foreground italic selectable-text">"{v.context}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {lessonTab === "dialogue" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-primary">Simulasi Dialog Autentik</h4>
                      <p className="text-xs text-muted-foreground">
                        Dengarkan dialog ini secara utuh, lalu coba tirukan intonasinya.
                      </p>
                    </div>
                    {activeLesson.dialogueScript && (
                      <SpeakButton text={activeLesson.dialogueScript} size="md" />
                    )}
                  </div>

                  <div className="p-5 rounded-2xl bg-muted/30 border border-border space-y-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                    {activeLesson.dialogueScript || "Naskah dialog tersedia dalam sesi AI Tutor."}
                  </div>
                </div>
              )}

              {lessonTab === "speaking" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                      Instruksi Latihan Bicara Spontan
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Bicaralah dengan lantang tanpa membaca catatan. Rekam suara Anda atau latih langsung dengan AI Speaking Partner.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {JSON.parse(activeLesson.guidedSpeakingPrompts).map((prompt: string, i: number) => (
                      <div key={i} className="p-4 rounded-xl bg-card border border-border flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-foreground leading-relaxed">{prompt}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/speaking-partner?topic=${encodeURIComponent(activeLesson.title)}`}
                      className="w-full inline-flex items-center justify-center gap-2 p-3 rounded-xl bg-primary text-white text-xs font-bold shadow hover:bg-primary/90 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Latih Materi Ini Bersama AI Speaking Partner
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Completion Button */}
            <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Waktu belajar tercatat otomatis</span>
              <button
                onClick={handleCompleteLesson}
                disabled={completing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-all disabled:opacity-50"
              >
                {celebration ? (
                  <>
                    <Award className="w-4 h-4 animate-bounce" />
                    <span>Hebat! Modul Selesai 🎉</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tandai Modul Selesai</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
