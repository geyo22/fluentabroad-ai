"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import {
  Settings,
  User,
  Key,
  Globe,
  BotMessageSquare,
  Volume2,
  Download,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isGeminiReady, setIsGeminiReady] = useState(false);

  // Form states
  const [name, setName] = useState("Rian Pratama");
  const [currentLevel, setCurrentLevel] = useState("B1");
  const [targetLevel, setTargetLevel] = useState("B2");
  const [targetDate, setTargetDate] = useState("2027-01-01");
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(90);
  const [explanationLanguage, setExplanationLanguage] = useState("id");

  // Preferences
  const [listeningMinutes, setListeningMinutes] = useState(20);
  const [shadowingMinutes, setShadowingMinutes] = useState(25);
  const [speakingMinutes, setSpeakingMinutes] = useState(30);
  const [vocabMinutes, setVocabMinutes] = useState(15);
  const [aiDifficulty, setAiDifficulty] = useState("adaptive");
  const [aiResponseLength, setAiResponseLength] = useState("medium");
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setIsGeminiReady(data.isGeminiConfigured);
          if (data.user) {
            setName(data.user.name || "Rian Pratama");
            setCurrentLevel(data.user.currentLevel || "B1");
            setTargetLevel(data.user.targetLevel || "B2");
            setTargetDate(data.user.targetDate ? data.user.targetDate.split("T")[0] : "2027-01-01");
            setDailyGoalMinutes(data.user.dailyGoalMinutes || 90);
            setExplanationLanguage(data.user.explanationLanguage || "id");

            if (data.user.preferences) {
              const p = data.user.preferences;
              setListeningMinutes(p.listeningMinutes || 20);
              setShadowingMinutes(p.shadowingMinutes || 25);
              setSpeakingMinutes(p.speakingMinutes || 30);
              setVocabMinutes(p.vocabMinutes || 15);
              setAiDifficulty(p.aiDifficulty || "adaptive");
              setAiResponseLength(p.aiResponseLength || "medium");
              setVoiceSpeed(p.voiceSpeed || 1.0);
            }
          }
        }
      })
      .catch((e) => console.error("Error loading settings:", e))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          currentLevel,
          targetLevel,
          targetDate,
          dailyGoalMinutes,
          explanationLanguage,
          preferences: {
            listeningMinutes,
            shadowingMinutes,
            speakingMinutes,
            vocabMinutes,
            aiDifficulty,
            aiResponseLength,
            voiceSpeed,
          },
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) {
      console.error("Save settings error:", e);
    }
  };

  const handleExportJSON = async () => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "export" }),
      });
      if (res.ok) {
        const data = await res.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `fluentabroad-backup-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Export error:", e);
    }
  };

  const handleAction = async (action: string, confirmMsg: string) => {
    if (!confirm(confirmMsg)) return;
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        alert("Aksi berhasil dijalankan.");
      }
    } catch (e) {
      console.error("Action error:", e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="Pengaturan Aplikasi"
        subtitle="Kelola profil pembelajar, preferensi AI tutor, target waktu belajar, dan cadangan data."
      />

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Pengaturan Anda berhasil diperbarui!</span>
        </div>
      )}

      {/* Gemini AI Status Card - Apple Style */}
      <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-apple flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground tracking-tight">Koneksi Google Gemini API</h3>
          </div>
          <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
            Semua panggilan AI Speaking Partner dan evaluasi gramatikal diproses langsung melalui server-side Google Gemini SDK. Kunci API tidak pernah dikirim ke browser client.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isGeminiReady ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Terhubung Aktif</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Kunci Belum Diisi</span>
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Profile & Target Goals */}
        <div className="p-7 rounded-3xl bg-card border border-border/80 shadow-apple space-y-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span>Profil Pembelajar & Target Keberangkatan</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Nama Tampilan</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-full bg-muted/50 border border-border/80 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Tanggal Target Keberangkatan</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full p-3 rounded-full bg-muted/50 border border-border/80 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Level Kemampuan Saat Ini</label>
              <select
                value={currentLevel}
                onChange={(e) => setCurrentLevel(e.target.value)}
                className="w-full p-3 rounded-full bg-muted/50 border border-border/80 focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-medium"
              >
                <option value="A1">A1 (Beginner)</option>
                <option value="A2">A2 (Elementary)</option>
                <option value="B1">B1 (Intermediate)</option>
                <option value="B2">B2 (Upper-Intermediate)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Bahasa Penjelasan & Umpan Balik</label>
              <select
                value={explanationLanguage}
                onChange={(e) => setExplanationLanguage(e.target.value)}
                className="w-full p-3 rounded-full bg-muted/50 border border-border/80 focus:outline-none focus:ring-1 focus:ring-primary text-foreground font-medium"
              >
                <option value="id">Bahasa Indonesia</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Daily Time Breakdown Preferences */}
        <div className="p-7 rounded-3xl bg-card border border-border/80 shadow-apple space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-primary" />
              <span>Komposisi Rencana Belajar Harian (Menit)</span>
            </h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
              Total: {listeningMinutes + shadowingMinutes + speakingMinutes + vocabMinutes} Menit
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Listening (mnt)</label>
              <input
                type="number"
                min="5"
                max="60"
                value={listeningMinutes}
                onChange={(e) => setListeningMinutes(Number(e.target.value))}
                className="w-full p-3 rounded-full bg-muted/50 border border-border/80 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Shadowing (mnt)</label>
              <input
                type="number"
                min="5"
                max="60"
                value={shadowingMinutes}
                onChange={(e) => setShadowingMinutes(Number(e.target.value))}
                className="w-full p-3 rounded-full bg-muted/50 border border-border/80 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Speaking (mnt)</label>
              <input
                type="number"
                min="5"
                max="60"
                value={speakingMinutes}
                onChange={(e) => setSpeakingMinutes(Number(e.target.value))}
                className="w-full p-3 rounded-full bg-muted/50 border border-border/80 text-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Vocabulary (mnt)</label>
              <input
                type="number"
                min="5"
                max="60"
                value={vocabMinutes}
                onChange={(e) => setVocabMinutes(Number(e.target.value))}
                className="w-full p-3 rounded-full bg-muted/50 border border-border/80 text-foreground"
              />
            </div>
          </div>
        </div>

        {/* AI Tutor Behavior Settings */}
        <div className="p-7 rounded-3xl bg-card border border-border/80 shadow-apple space-y-5">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BotMessageSquare className="w-4 h-4 text-primary" />
            <span>Perilaku & Gaya Berbicara AI Tutor</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Tingkat Pendampingan AI</label>
              <select
                value={aiDifficulty}
                onChange={(e) => setAiDifficulty(e.target.value)}
                className="w-full p-3 rounded-full bg-muted/50 border border-border/80 focus:outline-none text-foreground font-medium"
              >
                <option value="adaptive">Adaptif (Menyesuaikan respon Anda)</option>
                <option value="supportive">Supportif (Sabar & kalimat sederhana)</option>
                <option value="challenging">Menantang (Kecepatan natural & kosa kata luas)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Panjang Kalimat Respon AI</label>
              <select
                value={aiResponseLength}
                onChange={(e) => setAiResponseLength(e.target.value)}
                className="w-full p-3 rounded-full bg-muted/50 border border-border/80 focus:outline-none text-foreground font-medium"
              >
                <option value="concise">Ringkas (1-2 kalimat, beri ruang bicara)</option>
                <option value="medium">Sedang (2-3 kalimat dengan pertanyaan lanjutan)</option>
                <option value="expressive">Ekspresif (Penjelasan mendalam)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-7 py-3 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Simpan Perubahan
          </button>
        </div>
      </form>

      {/* Data Management & Destructive Controls */}
      <div className="p-7 rounded-3xl bg-card border border-border/80 shadow-apple space-y-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Download className="w-4 h-4 text-primary" />
          <span>Cadangan & Manajemen Data Pembelajaran</span>
        </h3>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportJSON}
            className="px-5 py-2.5 rounded-full bg-muted/80 hover:bg-muted text-foreground text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-primary" />
            <span>Ekspor Semua Data (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleAction("reset_progress", "Apakah Anda yakin ingin mereset progres modul dan sesi belajar?")
            }
            className="px-5 py-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progres Belajar</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleAction("clear_conversations", "Hapus semua riwayat percakapan dengan AI Speaking Partner?")
            }
            className="px-5 py-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Riwayat Percakapan</span>
          </button>
        </div>
      </div>
    </div>
  );
}

