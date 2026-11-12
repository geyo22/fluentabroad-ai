"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { SpeakButton } from "@/components/AudioSpeech";
import {
  BookOpenCheck,
  Plus,
  RotateCw,
  Sparkles,
  CheckCircle2,
  Clock,
  Award,
  Filter,
  Eye,
  X,
  Volume2,
} from "lucide-react";

interface VocabularyItem {
  id: string;
  phrase: string;
  translation: string;
  exampleSentence: string;
  context?: string | null;
  topic: string;
  difficulty: string;
  masteryLevel: number;
  intervalDays: number;
  repetitions: number;
  nextReviewDate: string;
}

export default function VocabularyPage() {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [stats, setStats] = useState({ total: 0, due: 0, mastered: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("due"); // "due", "all", "mastered"
  const [reviewMode, setReviewMode] = useState(false);
  const [currentReviewIdx, setCurrentReviewIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form state
  const [newPhrase, setNewPhrase] = useState("");
  const [newTranslation, setNewTranslation] = useState("");
  const [newExample, setNewExample] = useState("");
  const [newContext, setNewContext] = useState("");
  const [newTopic, setNewTopic] = useState("General");
  const [newDifficulty, setNewDifficulty] = useState("Medium");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVocabulary();
  }, [filter]);

  const fetchVocabulary = () => {
    setLoading(true);
    fetch(`/api/vocabulary?filter=${filter}`)
      .then((res) => (res.ok ? res.json() : { items: [], stats: { total: 0, due: 0, mastered: 0 } }))
      .then((data) => {
        setItems(data.items || []);
        if (data.stats) setStats(data.stats);
      })
      .catch((e) => console.error("Error loading vocabulary:", e))
      .finally(() => setLoading(false));
  };

  const handleReviewRating = async (rating: number) => {
    if (items.length === 0) return;
    const currentItem = items[currentReviewIdx];

    try {
      const res = await fetch("/api/vocabulary", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentItem.id, rating }),
      });

      if (res.ok) {
        setIsFlipped(false);
        if (currentReviewIdx + 1 < items.length) {
          setCurrentReviewIdx((prev) => prev + 1);
        } else {
          // Finished session
          setReviewMode(false);
          setCurrentReviewIdx(0);
          fetchVocabulary();
        }
      }
    } catch (e) {
      console.error("Failed to submit SRS review:", e);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhrase || !newTranslation || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phrase: newPhrase,
          translation: newTranslation,
          exampleSentence: newExample,
          context: newContext,
          topic: newTopic,
          difficulty: newDifficulty,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setNewPhrase("");
        setNewTranslation("");
        setNewExample("");
        setNewContext("");
        fetchVocabulary();
      }
    } catch (err) {
      console.error("Error adding phrase:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCard = items[currentReviewIdx];

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="Vocabulary Trainer"
        subtitle="Sistem Spaced Repetition (SRS) berbasis algoritma SM-2 untuk retensi frasa bermakna jangka panjang."
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Jadwal Review Hari Ini</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{stats.due}</span>
            <span className="text-xs text-muted-foreground">Frasa Menunggu</span>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Dikuasai Penuh (Mastered)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {stats.mastered}
            </span>
            <span className="text-xs text-muted-foreground">Mastery Level 3-5</span>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Total Koleksi Frasa</span>
            <BookOpenCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-foreground">{stats.total}</span>
            <span className="text-xs text-muted-foreground">Frasa Percakapan</span>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-2">
          {["due", "all", "mastered"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setFilter(tab);
                setReviewMode(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab === "due"
                ? `Perlu Direview (${stats.due})`
                : tab === "mastered"
                ? "Dikuasai Penuh"
                : "Semua Frasa"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && !reviewMode && (
            <button
              onClick={() => {
                setReviewMode(true);
                setCurrentReviewIdx(0);
                setIsFlipped(false);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-all"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Mulai Sesi Review Flashcard</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Frasa Baru</span>
          </button>
        </div>
      </div>

      {/* SRS Flashcard Review Mode View */}
      {reviewMode && activeCard ? (
        <div className="rounded-2xl bg-card border border-border p-8 shadow-sm space-y-6 max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Kartu {currentReviewIdx + 1} dari {items.length}
            </span>
            <span className="font-bold text-primary">{activeCard.topic}</span>
            <button
              onClick={() => setReviewMode(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              Keluar Sesi
            </button>
          </div>

          {/* Flashcard Body */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[220px] rounded-2xl bg-muted/40 border border-border p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/60 transition-all space-y-4"
          >
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              {isFlipped ? "Arti & Contoh Kalimat" : "Klik Kartu Untuk Membalik"}
            </span>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-foreground">{activeCard.phrase}</h2>
              <div className="flex justify-center">
                <SpeakButton text={activeCard.phrase} size="sm" />
              </div>
            </div>

            {isFlipped && (
              <div className="pt-2 border-t border-border/60 w-full space-y-2 animate-in fade-in">
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {activeCard.translation}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  "{activeCard.exampleSentence}"
                </p>
                {activeCard.context && (
                  <p className="text-[11px] text-primary">Konteks: {activeCard.context}</p>
                )}
              </div>
            )}
          </div>

          {/* SRS Rating Action Buttons (SM-2) */}
          {isFlipped ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">
                Seberapa mudah Anda mengingat frasa ini?
              </p>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleReviewRating(1)}
                  className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-xs border border-rose-500/30 transition-all"
                >
                  Again (1 hr)
                </button>
                <button
                  onClick={() => handleReviewRating(2)}
                  className="p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 font-bold text-xs border border-amber-500/30 transition-all"
                >
                  Hard (2 hr)
                </button>
                <button
                  onClick={() => handleReviewRating(3)}
                  className="p-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 font-bold text-xs border border-blue-500/30 transition-all"
                >
                  Good (4 hr)
                </button>
                <button
                  onClick={() => handleReviewRating(4)}
                  className="p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 font-bold text-xs border border-emerald-500/30 transition-all"
                >
                  Easy (7 hr)
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsFlipped(true)}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold shadow hover:bg-primary/90 transition-all"
            >
              Tampilkan Jawaban
            </button>
          )}
        </div>
      ) : (
        /* Regular Vocabulary Grid List */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full p-12 text-center text-xs text-muted-foreground">
              Memuat koleksi kosa kata...
            </div>
          ) : items.length === 0 ? (
            <div className="col-span-full p-12 text-center text-xs text-muted-foreground bg-card rounded-2xl border border-border">
              Tidak ada frasa pada filter ini. Klik <strong>"Tambah Frasa Baru"</strong> atau ulas dari AI Speaking Partner.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-card border border-border shadow-sm hover:shadow transition-all space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {item.topic}
                    </span>
                    <span className="text-muted-foreground">
                      Level Retensi: {item.masteryLevel}/5
                    </span>
                  </div>

                  <div className="mt-2 flex items-start justify-between gap-2">
                    <h3 className="text-sm font-bold text-foreground leading-tight">{item.phrase}</h3>
                    <SpeakButton text={item.phrase} size="sm" />
                  </div>

                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                    {item.translation}
                  </p>

                  <p className="text-xs text-muted-foreground italic mt-1 line-clamp-2">
                    "{item.exampleSentence}"
                  </p>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Repetisi: {item.repetitions}x</span>
                  <span>Interval: {item.intervalDays} hari</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add New Phrase Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm">Tambah Frasa Baru ke Koleksi SRS</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Frasa / Idiom Bahasa Inggris *</label>
                <input
                  type="text"
                  required
                  value={newPhrase}
                  onChange={(e) => setNewPhrase(e.target.value)}
                  placeholder="Contoh: hit the books"
                  className="w-full p-2.5 rounded-xl bg-muted/50 border border-border focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Arti / Terjemahan Bahasa Indonesia *</label>
                <input
                  type="text"
                  required
                  value={newTranslation}
                  onChange={(e) => setNewTranslation(e.target.value)}
                  placeholder="Contoh: belajar giat / tekun"
                  className="w-full p-2.5 rounded-xl bg-muted/50 border border-border focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Contoh Kalimat Penggunaan</label>
                <input
                  type="text"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder="Contoh: I need to hit the books before the midterm exams."
                  className="w-full p-2.5 rounded-xl bg-muted/50 border border-border focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Topik</label>
                  <select
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-muted/50 border border-border focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="General">General</option>
                    <option value="Academic">Academic</option>
                    <option value="Airport">Airport</option>
                    <option value="Food">Food</option>
                    <option value="Social">Social</option>
                    <option value="Transit">Transit</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Tingkat Kesulitan</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-muted/50 border border-border focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted font-bold text-foreground"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow disabled:opacity-50"
                >
                  Simpan Frasa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
