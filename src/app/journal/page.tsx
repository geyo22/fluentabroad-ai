"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import {
  BookMarked,
  Plus,
  Search,
  Star,
  Trash2,
  Calendar,
  Sparkles,
  X,
  CheckCircle2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  difficulties?: string | null;
  newPhrases?: string | null;
  confidenceRating: number;
  createdAt: string;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [difficulties, setDifficulties] = useState("");
  const [newPhrases, setNewPhrases] = useState("");
  const [confidenceRating, setConfidenceRating] = useState(3);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = () => {
    setLoading(true);
    fetch("/api/journal")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setEntries(data))
      .catch((e) => console.error("Error loading journal:", e))
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          difficulties,
          newPhrases,
          confidenceRating,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        setTitle("");
        setContent("");
        setDifficulties("");
        setNewPhrases("");
        setConfidenceRating(3);
        fetchEntries();
      }
    } catch (err) {
      console.error("Failed to save entry:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus catatan jurnal ini?")) return;
    try {
      const res = await fetch(`/api/journal?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  const filteredEntries = entries.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.content.toLowerCase().includes(q) ||
      (e.newPhrases && e.newPhrases.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      <Header
        title="Learning Journal"
        subtitle="Dokumentasikan ungkapan baru, refleksi kendala berbicara, dan pertumbuhan kepercayaan diri Anda."
      />

      {/* Control Bar: Search & New Entry - Apple Style */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-3xl bg-card border border-border/80 shadow-apple">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari catatan, frasa baru, atau refleksi..."
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-full bg-muted/50 border border-border/80 focus:outline-none focus:border-primary text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Tulis Catatan Jurnal</span>
        </button>
      </div>

      {/* Entries List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">Memuat catatan jurnal...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground bg-card rounded-3xl border border-border/80 shadow-apple">
            Belum ada catatan jurnal yang cocok. Tuliskan refleksi belajar pertama Anda!
          </div>
        ) : (
          filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-6 sm:p-7 rounded-3xl bg-card border border-border/80 shadow-apple hover:shadow-apple-hover transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3.5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-semibold text-foreground tracking-tight">{entry.title}</h3>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < entry.confidenceRating ? "fill-amber-500" : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(entry.createdAt)}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(entry.id)}
                  className="p-2 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Hapus catatan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>

              {(entry.difficulties || entry.newPhrases) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  {entry.newPhrases && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
                      <span className="font-bold block text-[11px]">Frasa Baru yang Dipelajari:</span>
                      <span className="mt-0.5 block">{entry.newPhrases}</span>
                    </div>
                  )}

                  {entry.difficulties && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300">
                      <span className="font-bold block text-[11px]">Kendala yang Dirasakan:</span>
                      <span className="mt-0.5 block">{entry.difficulties}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm">Catatan Refleksi Belajar</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Judul Catatan *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Refleksi Latihan Percakapan Imigrasi"
                  className="w-full p-2.5 rounded-xl bg-muted/50 border border-border focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Catatan & Pengalaman Hari Ini *</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan pengalaman latihan Anda, apa yang terasa mengalir dan apa yang masih ragu..."
                  className="w-full p-2.5 rounded-xl bg-muted/50 border border-border focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Frasa / Idiom Baru yang Tertangkap</label>
                <input
                  type="text"
                  value={newPhrases}
                  onChange={(e) => setNewPhrases(e.target.value)}
                  placeholder="Contoh: off the top of my head, hit a roadblock"
                  className="w-full p-2.5 rounded-xl bg-muted/50 border border-border focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Tingkat Kepercayaan Diri Berbicara (1-5)</label>
                <div className="flex items-center gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setConfidenceRating(lvl)}
                      className={`p-2 rounded-lg border flex items-center gap-1 font-bold ${
                        confidenceRating === lvl
                          ? "bg-amber-500 text-white border-amber-600 shadow"
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${confidenceRating >= lvl ? "fill-current" : ""}`} />
                      <span>{lvl}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 shadow disabled:opacity-50"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

