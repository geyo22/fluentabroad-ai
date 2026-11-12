import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

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
        <div className="flex min-h-screen flex-col lg:flex-row">
          <Sidebar />
          <div className="flex-1 lg:pl-64 flex flex-col min-w-0 transition-all duration-200">
            <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
