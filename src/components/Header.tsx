"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Clock, BotMessageSquare, PanelLeftOpen } from "lucide-react";
import { useSidebar } from "./SidebarContext";

interface UserStats {
  currentLevel: string;
  targetLevel: string;
  todayMinutes: number;
  dailyGoalMinutes: number;
  streakDays: number;
}

export function Header({ title, subtitle }: { title?: string; subtitle?: string }) {
  let collapsed = false;
  let toggleCollapsed = () => {};
  try {
    const sidebar = useSidebar();
    collapsed = sidebar.collapsed;
    toggleCollapsed = sidebar.toggleCollapsed;
  } catch {
    // fallback if rendered outside provider
  }

  const [stats, setStats] = useState<UserStats>({
    currentLevel: "B1",
    targetLevel: "B2",
    todayMinutes: 65,
    dailyGoalMinutes: 90,
    streakDays: 4,
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setStats((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {});
  }, []);

  const progressPercent = Math.min(
    100,
    Math.round((stats.todayMinutes / (stats.dailyGoalMinutes || 90)) * 100)
  );

  return (
    <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        {collapsed && (
          <button
            onClick={toggleCollapsed}
            className="hidden lg:flex p-2 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-xs"
            title="Buka Sidebar (Ctrl+B)"
            aria-label="Buka Sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}
        <div className="min-w-0">
          {title && <h1 className="text-xl font-semibold text-foreground tracking-tight truncate">{title}</h1>}
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Streak Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/80 text-foreground text-xs font-medium">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{stats.streakDays} hari streak</span>
        </div>

        {/* Daily Time Widget */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-muted/80 text-xs font-medium text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {stats.todayMinutes}/{stats.dailyGoalMinutes} mnt
          </span>
          <div className="w-12 h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Level Badge */}
        <div className="px-2.5 py-1 rounded-full bg-muted/80 text-foreground text-xs font-semibold">
          {stats.currentLevel} → {stats.targetLevel}
        </div>

        {/* Quick Speak Button */}
        <Link
          href="/speaking-partner"
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98]"
        >
          <BotMessageSquare className="w-3.5 h-3.5" />
          <span>Bicara AI</span>
        </Link>
      </div>
    </header>
  );
}
