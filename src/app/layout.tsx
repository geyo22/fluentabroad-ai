import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/AppLayout";

export const metadata: Metadata = {
  title: "FluentAbroad AI — Your Personal English Speaking Companion",
  description:
    "Aplikasi web pembelajaran Bahasa Inggris personal bertenaga AI untuk persiapan kuliah dan hidup di luar negeri.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}

