"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  Clock,
  Award,
  BookOpenCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export default function AnalyticsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData) setData(resData);
      })
      .catch((e) => console.error("Error loading analytics:", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <Header title="Progress & Learning Analytics" />
        <div className="p-12 text-center text-xs text-muted-foreground">
          Menghitung analitik belajar dan menyusun laporan AI...
        </div>
      </div>
    );
  }

  const {
    totalMinutes = 0,
    completedLessonsCount = 0,
    totalLessonsCount = 35,
    passedScenariosCount = 0,
    weeklyChartData = [],
    skillDistribution = [],
    vocabBreakdown = [],
    weeklyReport = {},
    recentSessions = [],
  } = data || {};

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="Progress & Learning Analytics"
        subtitle="Analisis objektif berbasis riwayat pembelajaran nyata, durasi aktivitas, dan laporan evaluasi AI."
      />

      {/* KPI Overview Grid - Apple Style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-card border border-border/80 p-6 shadow-apple hover:shadow-apple-hover transition-all">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Total Waktu Belajar</span>
            <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-semibold text-foreground tracking-tight">{totalMinutes}</span>
            <span className="text-xs text-muted-foreground ml-1.5 font-normal">menit</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            ~{Math.round(totalMinutes / 60)} jam total latihan
          </p>
        </div>

        <div className="rounded-3xl bg-card border border-border/80 p-6 shadow-apple hover:shadow-apple-hover transition-all">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Modul Kurikulum</span>
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-semibold text-foreground tracking-tight">
              {completedLessonsCount}/{totalLessonsCount}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            {Math.round((completedLessonsCount / (totalLessonsCount || 1)) * 100)}% Terselesaikan
          </p>
        </div>

        <div className="rounded-3xl bg-card border border-border/80 p-6 shadow-apple hover:shadow-apple-hover transition-all">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Skenario Lolos</span>
            <div className="w-7 h-7 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-semibold text-foreground tracking-tight">{passedScenariosCount}</span>
            <span className="text-xs text-muted-foreground ml-1.5 font-normal">dari 15</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Simulasi situasi nyata</p>
        </div>

        <div className="rounded-3xl bg-card border border-border/80 p-6 shadow-apple hover:shadow-apple-hover transition-all">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Level Kemampuan</span>
            <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-semibold text-foreground tracking-tight">B1 → B2</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Target keberangkatan 2027</p>
        </div>
      </div>

      {/* AI Weekly Progress Report Banner */}
      <div className="rounded-3xl bg-card border border-border/80 p-7 shadow-apple space-y-5">
        <div className="flex items-center gap-2 border-b border-border/60 pb-4">
          <Award className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-foreground text-sm tracking-tight">
            Laporan Sintesis Mingguan AI
          </h3>
          <span className="text-[10px] text-muted-foreground font-medium ml-auto bg-muted/80 px-2.5 py-0.5 rounded-full">
            Berdasarkan Riwayat Pembelajaran
          </span>
        </div>

        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed selectable-text">
          {weeklyReport.accomplishments ||
            "Pencapaian minggu ini menunjukkan konsistensi yang baik dalam latihan terstruktur."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Kemajuan yang Terlihat:
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground selectable-text">
              {weeklyReport.strengths?.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-foreground/40 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Fokus Perbaikan Mendatang:
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground selectable-text">
              {weeklyReport.recurringDifficulties?.map((d: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {weeklyReport.recommendedFocus && (
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-xs text-foreground/80 font-medium flex items-start gap-2.5">
            <span className="font-semibold text-foreground shrink-0">Rekomendasi Aksi:</span>
            <span className="selectable-text">{weeklyReport.recommendedFocus}</span>
          </div>
        )}
      </div>

      {/* Visual Charts Grid: 7-Day Activity & Skill Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Bar Chart */}
        <div className="rounded-3xl bg-card border border-border/80 p-7 shadow-apple space-y-5">
          <div>
            <h3 className="font-semibold text-foreground text-sm tracking-tight">
              Aktivitas Belajar 7 Hari Terakhir (Menit)
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Rincian menit belajar harian berdasarkan jenis latihan.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "1rem",
                    fontSize: "11px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="speaking" name="Speaking" fill="#0071e3" radius={[6, 6, 0, 0]} />
                <Bar dataKey="listening" name="Listening" fill="#34c759" radius={[6, 6, 0, 0]} />
                <Bar dataKey="vocab" name="Vocabulary" fill="#ff9500" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Time Distribution */}
        <div className="rounded-3xl bg-card border border-border/80 p-7 shadow-apple space-y-5">
          <div>
            <h3 className="font-semibold text-foreground text-sm tracking-tight">Distribusi Waktu Menurut Skill</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Alokasi total menit belajar yang telah diinvestasikan.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={skillDistribution}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "1rem",
                    fontSize: "11px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar dataKey="minutes" name="Menit" fill="#af52de" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Vocabulary Mastery Levels Bar */}
      <div className="rounded-3xl bg-card border border-border/80 p-7 shadow-apple space-y-5">
        <div>
          <h3 className="font-semibold text-foreground text-sm tracking-tight">
            Status Retensi Kosa Kata (SRS Mastery Levels 0-5)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Level 0-2 (Memori Jangka Pendek) • Level 3-5 (Memori Jangka Panjang).
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {vocabBreakdown.map((vb: any, i: number) => (
            <div key={i} className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-center space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground">{vb.level}</span>
              <p className="text-2xl font-semibold text-foreground">{vb.count}</p>
              <span className="text-[10px] text-muted-foreground">Frasa</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

