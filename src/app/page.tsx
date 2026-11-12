"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import {
  Calendar,
  Flame,
  Clock,
  BookOpenCheck,
  BotMessageSquare,
  Headphones,
  Mic2,
  ChevronRight,
  CheckCircle2,
  Circle,
  ArrowRight,
  Compass,
} from "lucide-react";

interface DashboardData {
  userName: string;
  currentLevel: string;
  targetLevel: string;
  todayMinutes: number;
  dailyGoalMinutes: number;
  totalStudyTimeMinutes: number;
  streakDays: number;
  completedLessons: number;
  vocabMastered: number;
  conversationsCount: number;
  weeklyProgress: number;
  daysRemaining: number;
  preferences?: {
    listeningMinutes: number;
    shadowingMinutes: number;
    speakingMinutes: number;
    vocabMinutes: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>({
    userName: "Rian Pratama",
    currentLevel: "B1",
    targetLevel: "B2",
    todayMinutes: 65,
    dailyGoalMinutes: 90,
    totalStudyTimeMinutes: 180,
    streakDays: 4,
    completedLessons: 6,
    vocabMastered: 12,
    conversationsCount: 5,
    weeklyProgress: 72,
    daysRemaining: 414,
    preferences: {
      listeningMinutes: 20,
      shadowingMinutes: 25,
      speakingMinutes: 30,
      vocabMinutes: 15,
    },
  });

  const [objectives, setObjectives] = useState([
    { id: 1, text: "Dengarkan 1 percakapan di Listening Lab", completed: true, link: "/listening-lab" },
    { id: 2, text: "Latih 5 frasa di Vocabulary Trainer", completed: true, link: "/vocabulary" },
    { id: 3, text: "Selesaikan 1 sesi percakapan dengan AI Speaking Partner", completed: false, link: "/speaking-partner" },
    { id: 4, text: "Lakukan 1 latihan Shadowing pelafalan kalimat", completed: false, link: "/shadowing" },
  ]);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData) setData((prev) => ({ ...prev, ...resData }));
      })
      .catch((err) => console.error("Error loading dashboard stats:", err));
  }, []);

  const toggleObjective = (id: number) => {
    setObjectives((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, completed: !obj.completed } : obj))
    );
  };

  const plan = data.preferences || {
    listeningMinutes: 20,
    shadowingMinutes: 25,
    speakingMinutes: 30,
    vocabMinutes: 15,
  };

  const progressPercentage = Math.min(
    100,
    Math.round((data.todayMinutes / (data.dailyGoalMinutes || 90)) * 100)
  );

  return (
    <div className="space-y-8 pb-16 max-w-5xl">
      <Header
        title="Dashboard"
        subtitle="Rencana belajar harian dan persiapan studi ke luar negeri."
      />

      {/* Apple Keynote Style Hero Card */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-apple hover:shadow-apple-hover transition-all space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-primary">
              Persiapan Studi Luar Negeri 2027
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">
              Selamat datang kembali, {data.userName}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
              Fokus pada komunikasi spontan, pemahaman penutur asli tanpa teks, dan reflek bertanya dengan percaya diri.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/learning-path"
              className="px-5 py-2.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98]"
            >
              Mulai Pelajaran
            </Link>
            <Link
              href="/speaking-partner"
              className="px-5 py-2.5 rounded-full bg-muted/80 hover:bg-muted text-xs font-semibold text-foreground border border-border/60 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Latihan Bicara AI
            </Link>
          </div>
        </div>
      </div>

      {/* Apple Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-apple hover:shadow-apple-hover transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Sisa Waktu</span>
            <div className="w-7 h-7 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-semibold text-foreground tracking-tight">
            {data.daysRemaining}
            <span className="text-xs text-muted-foreground ml-1.5 font-normal">hari</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Target Januari 2027</p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-apple hover:shadow-apple-hover transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Streak Konsistensi</span>
            <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-semibold text-foreground tracking-tight">
            {data.streakDays}
            <span className="text-xs text-muted-foreground ml-1.5 font-normal">hari</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Latihan berturut-turut</p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-apple hover:shadow-apple-hover transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Waktu Belajar</span>
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-semibold text-foreground tracking-tight">
            {Math.round(data.totalStudyTimeMinutes / 60)}
            <span className="text-xs text-muted-foreground ml-1.5 font-normal">jam</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{data.todayMinutes} menit hari ini</p>
        </div>

        <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-apple hover:shadow-apple-hover transition-all">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Kosa Kata SRS</span>
            <div className="w-7 h-7 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BookOpenCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-semibold text-foreground tracking-tight">
            {data.vocabMastered}
            <span className="text-xs text-muted-foreground ml-1.5 font-normal">frasa</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Memori jangka panjang</p>
        </div>
      </div>

      {/* Main Grid: Daily Plan & Objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Plan Breakdown */}
        <div className="lg:col-span-2 rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-apple space-y-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground tracking-tight">
                Komposisi Target: {data.dailyGoalMinutes} Menit
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Listening, pelafalan, speaking, dan kosa kata.</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-foreground">{progressPercentage}% selesai</span>
              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden mt-1.5">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <Link
              href="/listening-lab"
              className="p-4 rounded-2xl bg-muted/40 hover:bg-muted/80 border border-border/50 hover:border-border transition-all flex items-start gap-3.5 group"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground truncate">Listening Lab</h4>
                  <span className="text-[11px] font-semibold text-muted-foreground">{plan.listeningMinutes} mnt</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">Pemahaman audio tanpa subtitle</p>
              </div>
            </Link>

            <Link
              href="/shadowing"
              className="p-4 rounded-2xl bg-muted/40 hover:bg-muted/80 border border-border/50 hover:border-border transition-all flex items-start gap-3.5 group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Mic2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground truncate">Shadowing Practice</h4>
                  <span className="text-[11px] font-semibold text-muted-foreground">{plan.shadowingMinutes} mnt</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">Ritme intonasi dan artikulasi</p>
              </div>
            </Link>

            <Link
              href="/speaking-partner"
              className="p-4 rounded-2xl bg-muted/40 hover:bg-muted/80 border border-border/50 hover:border-border transition-all flex items-start gap-3.5 group"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <BotMessageSquare className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground truncate">AI Speaking Partner</h4>
                  <span className="text-[11px] font-semibold text-muted-foreground">{plan.speakingMinutes} mnt</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">Dialog dua arah & feedback</p>
              </div>
            </Link>

            <Link
              href="/vocabulary"
              className="p-4 rounded-2xl bg-muted/40 hover:bg-muted/80 border border-border/50 hover:border-border transition-all flex items-start gap-3.5 group"
            >
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <BookOpenCheck className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground truncate">Vocabulary SRS</h4>
                  <span className="text-[11px] font-semibold text-muted-foreground">{plan.vocabMinutes} mnt</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">Flashcard algoritma SM-2</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Daily Objectives */}
        <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-apple space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-base font-semibold text-foreground tracking-tight">Target Hari Ini</h3>
              <span className="text-xs font-semibold text-muted-foreground bg-muted/80 px-2.5 py-0.5 rounded-full">
                {objectives.filter((o) => o.completed).length}/{objectives.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {objectives.map((obj) => (
                <div
                  key={obj.id}
                  onClick={() => toggleObjective(obj.id)}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <button type="button" className="mt-0.5 text-muted-foreground">
                    {obj.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1 leading-tight">
                    <p
                      className={`text-xs ${
                        obj.completed ? "line-through text-muted-foreground" : "text-foreground font-medium"
                      }`}
                    >
                      {obj.text}
                    </p>
                    <Link
                      href={obj.link}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] text-primary hover:underline flex items-center gap-0.5 mt-1 font-medium"
                    >
                      Buka latihan <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border/60">
            <Link
              href="/challenges"
              className="flex items-center justify-between p-3 rounded-full bg-muted/80 text-xs font-semibold text-foreground hover:bg-muted transition-all"
            >
              <span>Tantangan Spontan (10 mnt)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Apple Style Scenario Banner */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-7 shadow-apple flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary">
            <Compass className="w-4 h-4" />
            <span>Simulasi Real-Life Abroad</span>
          </div>
          <h3 className="text-base font-semibold text-foreground">15 Skenario Interaktif Saat di Luar Negeri</h3>
          <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
            Mulai dari imigrasi bandara, pesan makan di kafe, konsultasi dosen kampus, hingga menangani kesalahpahaman.
          </p>
        </div>
        <Link
          href="/scenarios"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs whitespace-nowrap self-start sm:self-auto hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Buka 15 Skenario</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
