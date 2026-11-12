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

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Total Waktu Belajar</span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-foreground">{totalMinutes}</span>
            <span className="text-xs text-muted-foreground ml-1.5">Menit Aktif</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            ~{Math.round(totalMinutes / 60)} jam total latihan
          </p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Modul Kurikulum</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-foreground">
              {completedLessonsCount}/{totalLessonsCount}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            {Math.round((completedLessonsCount / (totalLessonsCount || 1)) * 100)}% Terselesaikan
          </p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Skenario Lolos</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-foreground">{passedScenariosCount}</span>
            <span className="text-xs text-muted-foreground ml-1.5">dari 15 Misi</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Simulasi situasi nyata</p>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
            <span>Level Kemampuan</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-extrabold text-foreground">B1 → B2</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Target keberangkatan 2027</p>
        </div>
      </div>

      {/* AI Weekly Progress Report Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-card to-card border border-primary/20 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-foreground text-base">
            Laporan Sintesis Mingguan Bertenaga AI
          </h3>
          <span className="text-[10px] bg-primary/20 text-primary font-bold px-2 py-0.5 rounded-full ml-auto">
            Estimasi Berdasarkan Rekaman Nyata
          </span>
        </div>

        <p className="text-xs text-foreground leading-relaxed">
          {weeklyReport.accomplishments ||
            "Pencapaian minggu ini menunjukkan konsistensi yang baik dalam latihan terstruktur."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
            <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Kemajuan yang Terlihat (Strengths):
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {weeklyReport.strengths?.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-primary font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border space-y-2">
            <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" /> Fokus Perbaikan Mendatang:
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
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
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-xs text-primary font-medium">
            🎯 <strong>Saran Aksi Minggu Depan:</strong> {weeklyReport.recommendedFocus}
          </div>
        )}
      </div>

      {/* Visual Charts Grid: 7-Day Activity & Skill Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Bar Chart */}
        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-foreground text-sm">
              Aktivitas Belajar 7 Hari Terakhir (Menit)
            </h3>
            <p className="text-xs text-muted-foreground">
              Rincian menit belajar harian berdasarkan jenis latihan.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: "11px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="speaking" name="Speaking" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="listening" name="Listening" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="vocab" name="Vocabulary" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Time Distribution */}
        <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-foreground text-sm">Distribusi Waktu Menurut Skill</h3>
            <p className="text-xs text-muted-foreground">
              Alokasi total menit belajar yang telah diinvestasikan.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={skillDistribution}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.75rem",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="minutes" name="Menit" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Vocabulary Mastery Levels Bar */}
      <div className="rounded-2xl bg-card border border-border p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-foreground text-sm">
            Status Retensi Kosa Kata (SRS Mastery Levels 0-5)
          </h3>
          <p className="text-xs text-muted-foreground">
            Level 0-2 (Memori Jangka Pendek) • Level 3-5 (Memori Jangka Panjang).
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {vocabBreakdown.map((vb: any, i: number) => (
            <div key={i} className="p-3.5 rounded-xl bg-muted/40 border border-border text-center space-y-1">
              <span className="text-[11px] font-bold text-muted-foreground">{vb.level}</span>
              <p className="text-2xl font-extrabold text-foreground">{vb.count}</p>
              <span className="text-[10px] text-muted-foreground">Frasa</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
