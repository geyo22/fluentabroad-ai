"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Clock, BotMessageSquare, Sparkles } from "lucide-react";

interface UserStats {
  currentLevel: string;
  targetLevel: string;
  todayMinutes: number;
  dailyGoalMinutes: number;
  streakDays: number;
}

export function Header({ title, subtitle }: { title?: string; subtitle?: string }) {
  const [stats, setStats] = useState<UserStats>({
    currentLevel: "B1",
    targetLevel: "B2",
    todayMinutes: 65,
    dailyGoalMinutes: 90,
    streakDays: 4,
  });

  useEffect(() => {
    // Fetch live user stats from API
    fetch("/api/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setStats((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {
        // Fallback to initial defaults if offline
      });
  }, []);

  const progressPercent = Math.min(
    100,
    Math.round((stats.todayMinutes / (stats.dailyGoalMinutes || 90)) * 100)
  );

  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
      <div>
        {title && <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>}
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Streak Counter */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold"
          title={`${stats.streakDays} hari latihan berturut-turut!`}
        >
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-bounce" />
          <span>{stats.streakDays} Hari Streak</span>
        </div>

        {/* Daily Time Widget */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/80 border border-border text-xs font-medium text-foreground"
          title={`Waktu belajar hari ini: ${stats.todayMinutes} dari target ${stats.dailyGoalMinutes} menit`}
        >
          <Clock className="w-3.5 h-3.5 text-primary" />
          <span>
            {stats.todayMinutes}/{stats.dailyGoalMinutes} mnt
          </span>
          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden ml-1">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Level Badge */}
        <div className="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
          {stats.currentLevel} → {stats.targetLevel}
        </div>

        {/* Quick Speak Button */}
        <Link
          href="/speaking-partner"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold shadow-sm transition-all hover:shadow"
        >
          <BotMessageSquare className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Bicara dengan AI</span>
          <Sparkles className="w-3 h-3 text-amber-300" />
        </Link>
      </div>
    </header>
  );
}
