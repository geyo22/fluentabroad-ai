"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Compass,
  BotMessageSquare,
  Headphones,
  Mic2,
  BookOpenCheck,
  PlaneTakeoff,
  Award,
  BarChart3,
  BookMarked,
  Settings,
  Calendar,
  Menu,
  X,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";

export const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Learning Path", href: "/learning-path", icon: Compass },
  { name: "AI Speaking Partner", href: "/speaking-partner", icon: BotMessageSquare, highlight: true },
  { name: "Listening Lab", href: "/listening-lab", icon: Headphones },
  { name: "Shadowing & Pronunciation", href: "/shadowing", icon: Mic2 },
  { name: "Vocabulary Trainer", href: "/vocabulary", icon: BookOpenCheck },
  { name: "Real-Life Scenarios", href: "/scenarios", icon: PlaneTakeoff },
  { name: "Daily Challenges", href: "/challenges", icon: Award },
  { name: "Progress & Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Learning Journal", href: "/journal", icon: BookMarked },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark class on <html>
  const toggleTheme = () => {
    if (typeof document !== "undefined") {
      const isDark = document.documentElement.classList.toggle("dark");
      setIsDarkMode(isDark);
    }
  };

  // Calculate days remaining to Jan 2027
  const targetDate = new Date("2027-01-01T00:00:00Z");
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return (
    <>
      {/* Mobile Top Header with Hamburger Button */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-base shadow-sm">
            FA
          </div>
          <div>
            <span className="font-bold text-foreground text-sm tracking-tight">FluentAbroad AI</span>
            <span className="block text-[10px] text-muted-foreground">Study Abroad Companion</span>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Logo & Milestone Banner */}
          <div className="p-5 border-b border-border">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white font-extrabold text-base shadow-md group-hover:scale-105 transition-transform">
                FA
              </div>
              <div>
                <h1 className="font-bold text-foreground text-base tracking-tight leading-none">FluentAbroad AI</h1>
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Target: Jan 2027
                </p>
              </div>
            </Link>

            {/* Countdown Badge */}
            <div className="mt-3.5 bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-primary font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Menuju Keberangkatan</span>
              </div>
              <span className="font-bold bg-primary text-white text-[11px] px-2 py-0.5 rounded-md">
                {daysRemaining} Hari
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span className="flex items-center gap-0.5 text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-md font-semibold">
                      <Sparkles className="w-2.5 h-2.5" />
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile & Dark Mode Toggle */}
        <div className="p-4 border-t border-border bg-card/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs">
                RP
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-foreground truncate">Rian Pratama</p>
                <p className="text-[10px] text-muted-foreground">Level B1 • Univ Prep</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Toggle Dark Mode"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
