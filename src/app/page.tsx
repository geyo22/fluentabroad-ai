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
  Sparkles,
  ArrowRight,
  Compass,
  Play,
  RotateCcw,
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
    { id: 2, text: "Latih 5 frasa berguna di Vocabulary Trainer", completed: true, link: "/vocabulary" },
    { id: 3, text: "Selesaikan 1 sesi percakapan dengan AI Speaking Partner", completed: false, link: "/speaking-partner" },
    { id: 4, text: "Lakukan 1 latihan Shadowing pelafalan kalimat", completed: false, link: "/shadowing" },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData) {
          setData((prev) => ({ ...prev, ...resData }));
        }
      })
      .catch((err) => console.error("Error loading dashboard stats:", err))
      .finally(() => setLoading(false));
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
    <div className="space-y-6 pb-12">
      <Header
        title="Dashboard Belajar"
        subtitle="Pantau kemajuan, rencana harian, dan target persiapan studi ke luar negeri."
      />

      {/* Welcome & Motivational Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/95 via-indigo-600 to-primary p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Target Keberangkatan: Januari 2027</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Selamat pagi, {data.userName}! 🎓
          </h2>
          <p className="text-sm md:text-base text-white/90 leading-relaxed">
            Ingat: tujuan utama kita bukan sekadar ujian IELTS/TOEFL, melainkan membangun kemampuan berbicara
            yang spontan, berani bertanya, dan siap menghadapi kehidupan nyata di luar negeri.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/learning-path"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-primary px-4 py-2.5 text-xs md:text-sm font-bold shadow hover:bg-white/90 transition-all"
            >
              <Play className="w-4 h-4 fill-primary" />
              Mulai Pelajaran Hari Ini
            </Link>
            <Link
              href="/speaking-partner"
              className="inline-flex items-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md px-4 py-2.5 text-xs md:text-sm font-semibold transition-all"
            >
              <BotMessageSquare className="w-4 h-4" />
              Latihan Bicara AI
            </Link>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Countdown & Quick KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Departure Countdown */}
        <div className="col-span-2 sm:col-span-1 rounded-2xl bg-card border border-border p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Countdown 2027</span>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-foreground tracking-tight">
              {data.daysRemaining}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5 font-medium">Hari Tersisa</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {data.daysRemaining > 0
              ? "Menuju keberangkatan Jan 2027"
              : "Program belajar berkelanjutan (Ongoing Mastery)"}
          </p>
        </div>

        {/* Current Streak */}
        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Streak Belajar</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-foreground tracking-tight">
              {data.streakDays}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5 font-medium">Hari Beruntun</span>
          </div>
          <p className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Konsistensi terbentuk sangat baik! 🔥
          </p>
        </div>

        {/* Total Study Time */}
        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Total Belajar</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-foreground tracking-tight">
              {Math.round(data.totalStudyTimeMinutes / 60)}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5 font-medium">Jam Total</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {data.todayMinutes} menit diselesaikan hari ini
          </p>
        </div>

        {/* Vocabulary Mastered */}
        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Frasa Dikuasai</span>
            <BookOpenCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-foreground tracking-tight">
              {data.vocabMastered}
            </span>
            <span className="text-xs text-muted-foreground ml-1.5 font-medium">Frasa SRS</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Level memori jangka panjang</p>
        </div>
      </div>

      {/* Main Grid: Daily Plan Breakdown & Daily Objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Learning Plan (90 Minutes Target Breakdown) */}
        <div className="lg:col-span-2 rounded-2xl bg-card border border-border p-6 shadow-sm space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <h3 className="font-bold text-foreground text-base tracking-tight">
                Rencana Belajar Hari Ini ({data.dailyGoalMinutes} Menit)
              </h3>
              <p className="text-xs text-muted-foreground">
                Distribusi seimbang antara mendengarkan, pelafalan, dan berbicara interaktif.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-primary">{progressPercentage}% Selesai</span>
              <div className="w-28 h-2 bg-muted rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Listening */}
            <Link
              href="/listening-lab"
              className="p-4 rounded-xl border border-border hover:border-primary/40 bg-muted/30 hover:bg-muted/60 transition-all group flex items-start gap-3.5"
            >
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                <Headphones className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">Listening Comprehension</h4>
                  <span className="text-xs font-semibold text-muted-foreground">{plan.listeningMinutes} mnt</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Dialog bandara, kafe, transportasi, dan arah jalan tanpa subtitle.
                </p>
              </div>
            </Link>

            {/* Shadowing */}
            <Link
              href="/shadowing"
              className="p-4 rounded-xl border border-border hover:border-primary/40 bg-muted/30 hover:bg-muted/60 transition-all group flex items-start gap-3.5"
            >
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                <Mic2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">Shadowing & Intonation</h4>
                  <span className="text-xs font-semibold text-muted-foreground">{plan.shadowingMinutes} mnt</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Menirukan kecepatan dan irama penutur asli untuk melatih otot bicara.
                </p>
              </div>
            </Link>

            {/* Speaking Partner */}
            <Link
              href="/speaking-partner"
              className="p-4 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-all group flex items-start gap-3.5"
            >
              <div className="p-2.5 rounded-lg bg-primary/15 text-primary group-hover:scale-105 transition-transform">
                <BotMessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">AI Speaking Partner</h4>
                  <span className="text-xs font-semibold text-primary">{plan.speakingMinutes} mnt</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Percakapan dua arah, respon spontan, dan simulasi role-play.
                </p>
              </div>
            </Link>

            {/* Vocabulary Review */}
            <Link
              href="/vocabulary"
              className="p-4 rounded-xl border border-border hover:border-primary/40 bg-muted/30 hover:bg-muted/60 transition-all group flex items-start gap-3.5"
            >
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
                <BookOpenCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">Vocabulary & Spaced Review</h4>
                  <span className="text-xs font-semibold text-muted-foreground">{plan.vocabMinutes} mnt</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Frasa bermakna dan pola kalimat dengan jadwal retensi SM-2.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Daily Objectives Checklist */}
        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-base tracking-tight">Target Hari Ini</h3>
              <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground font-medium">
                {objectives.filter((o) => o.completed).length}/{objectives.length}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {objectives.map((obj) => (
                <div
                  key={obj.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => toggleObjective(obj.id)}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-muted-foreground group-hover:text-primary transition-colors"
                  >
                    {obj.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p
                      className={`text-xs font-medium leading-relaxed ${
                        obj.completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {obj.text}
                    </p>
                    <Link
                      href={obj.link}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1 mt-0.5"
                    >
                      Buka modul <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <Link
              href="/challenges"
              className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:from-amber-500/15 transition-all"
            >
              <span>Tantangan Harian: Spontaneous Sprint</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Access to Real-Life Scenarios Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
            <Compass className="w-4 h-4" />
            <span>Simulasi Real-Life Abroad</span>
          </div>
          <h3 className="text-base font-bold text-foreground">
            15 Skenario Nyata Kehidupan di Luar Negeri
          </h3>
          <p className="text-xs text-muted-foreground max-w-xl">
            Latih interaksi autentik: Imigrasi bandara, beli tiket kereta, pesan makan, konsultasi dosen, lapor barang hilang, hingga klarifikasi kesalahpahaman.
          </p>
        </div>
        <Link
          href="/scenarios"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow hover:bg-primary/90 transition-all whitespace-nowrap"
        >
          Lihat Semua 15 Skenario
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
