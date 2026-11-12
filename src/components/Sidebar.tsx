"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "./SidebarContext";
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
  Menu,
  X,
  Sun,
  Moon,
  PanelLeftClose,
} from "lucide-react";

export const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Learning Path", href: "/learning-path", icon: Compass },
  { name: "AI Speaking Partner", href: "/speaking-partner", icon: BotMessageSquare },
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
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen, toggleMobile } = useSidebar();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    if (typeof document !== "undefined") {
      const isDark = document.documentElement.classList.toggle("dark");
      setIsDarkMode(isDark);
    }
  };

  const targetDate = new Date("2027-01-01T00:00:00Z");
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-5 py-3.5 bg-card border-b border-border sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-xs tracking-tight">
            FA
          </div>
          <span className="font-semibold text-foreground text-sm tracking-tight">FluentAbroad AI</span>
        </Link>
        <button
          onClick={toggleMobile}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Collapsible Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-card/95 backdrop-blur-2xl border-r border-border flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-xs ${
          mobileOpen
            ? "translate-x-0"
            : collapsed
            ? "-translate-x-full"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="px-5 py-5 border-b border-border/80">
            <div className="flex items-center justify-between">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-xs">
                  FA
                </div>
                <div className="leading-tight">
                  <span className="font-bold text-foreground text-sm tracking-tight">FluentAbroad</span>
                  <span className="block text-[11px] text-muted-foreground">Study Abroad 2027</span>
                </div>
              </Link>

              {/* Desktop Collapse Button */}
              <button
                onClick={toggleCollapsed}
                className="hidden lg:flex p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Tutup Sidebar (Ctrl+B)"
                aria-label="Tutup Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title="Tutup Menu"
                aria-label="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3.5 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Target: Jan 2027</span>
              <span className="font-medium text-foreground bg-muted/80 px-2.5 py-0.5 rounded-full">
                {daysRemaining} hari lagi
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-white font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer User Profile & Theme Toggle */}
        <div className="p-4 border-t border-border/80 bg-card/50">
          <div className="flex items-center justify-between px-1">
            <div className="truncate">
              <p className="text-xs font-semibold text-foreground truncate">Rian Pratama</p>
              <p className="text-[10px] text-muted-foreground">Level B1 • Univ Prep</p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Ganti Tema"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
