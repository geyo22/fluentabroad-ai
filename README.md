# FluentAbroad AI — Your Personal English Speaking Companion

**FluentAbroad AI** adalah aplikasi web pembelajaran Bahasa Inggris personal bertenaga AI yang dirancang khusus bagi mahasiswa Indonesia yang sedang mempersiapkan diri untuk studi dan hidup mandiri di luar negeri pada **Januari 2027**.

Fokus utama aplikasi ini **BUKAN** sekadar ujian formal seperti IELTS atau TOEFL, melainkan membangun kemampuan komunikasi nyata sehari-hari:
1. Memahami percakapan lisan penutur asli tanpa bergantung pada subtitle.
2. Berbicara secara spontan tanpa menerjemahkan setiap kata di kepala terlebih dahulu.
3. Bertanya secara luwes, sopan, dan percaya diri dalam berbagai situasi sosial.
4. Menjelaskan latar belakang, pengalaman, kendala, opini, dan proyek kuliah.
5. Berpartisipasi aktif dalam dialog dua arah.
6. Menghadapi 15 skenario kritis saat bepergian dan menetap di luar negeri.
7. Memperbaiki pelafalan, kelancaran, kosa kata, dan kepercayaan diri secara konsisten.

---

## 🚀 Fitur Utama

- **Dashboard Belajar Terintegrasi:**
  - Countdown waktu nyata menuju keberangkatan Januari 2027 (berkelanjutan setelahnya).
  - Alokasi target harian 90 menit (Listening 20m, Shadowing 25m, Speaking 30m, Vocabulary 15m).
  - Kartu statistik progres nyata dari basis data (Streak, total waktu, modul selesai, kosa kata SRS).
- **Kurikulum 7 Minggu Siap Abroad:**
  - *Week 1:* Basic Survival English & Memperkenalkan Diri
  - *Week 2:* Navigasi Bandara, Imigrasi & Transportasi Umum
  - *Week 3:* Kehidupan Sehari-hari, Pesan Makan & Belanja
  - *Week 4:* Menjelaskan Pengalaman, Pendapat & Proyek Kuliah
  - *Week 5:* Kecepatan Natural, Connected Speech & Respons Spontan
  - *Week 6:* Penyelesaian Masalah, Komplain Sopan & Interaksi Sosial
  - *Week 7:* Simulasi Penuh Hari Pertama di Luar Negeri
- **AI Speaking Partner (Core Engine):**
  - 8 mode percakapan: *Free Conversation, Guided Discussion, Real-Life Role-play, Question & Answer, Explain Something, Spontaneous Challenge, Interview Practice, Academic Discussion*.
  - Terintegrasi langsung dengan SDK resmi **Google Gemini** (`gemini-1.5-flash`).
  - Evaluasi mendalam di akhir sesi: ringkasan komunikasi, koreksi tata bahasa, alternatif ungkapan penutur asli (*native phrasing*), dan kosa kata baru.
- **Listening Lab:**
  - 20+ dialog praktis terkurasi lintas skenario (Bandara, Restoran, Arah Jalan, Akademik, Layanan Publik, Sosial).
  - Kontrol kecepatan audio (0.75x, 1.0x, 1.25x), toggle naskah transkrip dengan catatan terjemahan Indonesia, dan kuis pemahaman dengan validasi jawaban otomatis.
- **Shadowing & Pronunciation Practice:**
  - Kalimat target autentik dengan audio referensi penutur asli.
  - Perekaman suara melalui mikrofon browser (Web Speech API).
  - Perbandingan pencocokan transkrip kata-per-kata (*word-recognition similarity*) tanpa klaim palsu atas analisis akustik fonem.
- **Vocabulary Trainer (Spaced Repetition System - SM-2):**
  - Algoritma SuperMemo-2 (SM-2) deterministik yang menghitung interval hari berikutnya berdasarkan rating ingatan (*Again, Hard, Good, Easy*).
  - Mode Flashcard dan penambahan kosa kata langsung dari percakapan AI Speaking Partner.
- **15 Real-Life Abroad Simulation Scenarios:**
  - *Airport Check-in, Immigration Interview, Finding Your Gate, Buying a Train Ticket, Asking for Directions, Ordering Food, Checking Into Accommodation, Introducing Yourself to Classmates, Asking a Lecturer, Meeting New Friends, Explaining a University Project, Reporting Lost Luggage, Asking for Help, Visiting a Pharmacy, Handling Misunderstandings*.
  - Evaluasi kriteria berbasis rubrik (ketercapaian objektif, kejelasan, kesesuaian kosa kata).
- **Daily Challenges:**
  - Latihan cepat 10 menit setiap hari untuk membangun refleks bicara di bawah 5 detik.
- **Progress & Learning Analytics:**
  - Visualisasi grafik Recharts (menit belajar 7 hari terakhir, radar distribusi keahlian, status retensi kosa kata level 0-5).
  - Laporan sintesis mingguan yang disusun oleh AI dari catatan database riil.
- **Learning Journal:**
  - Catatan refleksi pembelajaran, frasa baru yang ditemukan, kendala yang dihadapi, dan peringkat kepercayaan diri (1-5 bintang).
- **Onboarding & Informal Placement Test:**
  - Multi-step assessment (Listening, Speaking, Vocabulary, Real-Life Situation) untuk mengestimasi level awal (A1, A2, B1, B2).

---

## 🛠️ Arsitektur & Teknologi

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Framer Motion.
- **Backend:** Next.js Server-Side API Routes, Zod validation.
- **AI Provider:** Google Gemini API (`@google/generative-ai`) dengan arsitektur modular di `src/lib/gemini.ts`.
- **Database:** Prisma ORM dengan SQLite (`prisma/dev.db`), mudah dimigrasikan ke PostgreSQL.
- **Audio Service:** Browser Web Speech API (`SpeechSynthesis` untuk TTS dan `webkitSpeechRecognition` / `SpeechRecognition` untuk STT) dengan fallback input teks penuh.
- **Testing:** Vitest automated test suite untuk algoritma SRS, kalkulasi streak, dan akurasi perbandingan teks.

---

## 📋 Persyaratan Sistem

- Node.js versi 18.18+ atau 20+ atau 22+ LTS.
- Peramban web modern yang mendukung Web Speech API (Google Chrome, Microsoft Edge, Safari, dll.).

---

## ⚙️ Panduan Instalasi & Menjalankan Aplikasi

### 1. Masuk ke Direktori Proyek
```bash
cd c:\Users\MyBook Hype\Downloads\ABROAD
```

### 2. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi berikut pada `.env`:
```env
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
> **Catatan:** Anda bisa mendapatkan Gemini API Key gratis melalui [Google AI Studio](https://aistudio.google.com/). Jika kunci belum diisi, aplikasi tetap dapat dijalankan dan akan menampilkan instruksi konfigurasi yang jelas.

### 3. Inisialisasi Basis Data & Seed Data
Jalankan sinkronisasi skema Prisma dan seeder otomatis:
```bash
npx prisma db push
node scripts/seed.mjs
```
Perintah ini akan membuat database SQLite `dev.db`, memuat profil pembelajar default, 7 minggu kurikulum (35 modul lengkap), 20 dialog listening praktis, kosa kata SRS awal, dan 15 skenario luar negeri.

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di: **http://localhost:3000**

### 5. Menjalankan Pengujian Otomatis (Unit & Integration Tests)
```bash
npm test
```

---

## 🔒 Keamanan & Pertimbangan Privasi

1. **Server-Side API Key Protection:**
   Kunci API Gemini hanya dibaca pada Next.js API Routes di sisi server dan tidak pernah terekspos ke klien browser.
2. **Audio Processing Privacy:**
   Transkripsi audio lokal diproses melalui antarmuka Web Speech API browser pengguna tanpa menyimpan rekaman suara mentah yang tidak perlu di server.
3. **Data Export & Ownership:**
   Pengguna dapat mengekspor seluruh rekam jejak pembelajarannya ke dalam format JSON kapan saja melalui menu **Settings**.

---

## 📖 Struktur Direktori

```
ABROAD/
├── prisma/
│   ├── schema.prisma           # Skema entitas Prisma SQLite
│   └── dev.db                  # Database lokal
├── scripts/
│   └── seed.mjs                # Seeder kurikulum 7 minggu, 20 dialog, skenario
├── src/
│   ├── app/
│   │   ├── api/                # Next.js API routes (stats, speaking, listening, vocab, scenarios, etc.)
│   │   ├── challenges/         # Halaman Daily Challenges
│   │   ├── journal/            # Halaman Learning Journal
│   │   ├── learning-path/      # Halaman Kurikulum 7 Minggu
│   │   ├── listening-lab/      # Halaman Listening Lab
│   │   ├── onboarding/         # Halaman Placement Test & Onboarding
│   │   ├── scenarios/          # Halaman 15 Real-Life Abroad Scenarios
│   │   ├── settings/           # Halaman Pengaturan & Ekspor Data
│   │   ├── shadowing/          # Halaman Shadowing & Pronunciation
│   │   ├── speaking-partner/   # Halaman AI Speaking Partner (Core)
│   │   ├── vocabulary/         # Halaman Vocabulary Trainer (SRS)
│   │   ├── globals.css         # Styling tema dan animasi ripple suara
│   │   ├── layout.tsx          # Root layout & navigasi samping
│   │   └── page.tsx            # Main Learning Dashboard
│   ├── components/
│   │   ├── AudioSpeech.tsx     # Hook Web Speech API (STT, TTS, diff matching)
│   │   ├── Header.tsx          # Top header widget statistik
│   │   └── Sidebar.tsx         # Responsive sidebar & tema
│   └── lib/
│       ├── gemini.ts           # Abstraksi Google Gemini SDK & tutor prompts
│       ├── prisma.ts           # Singleton Prisma Client
│       ├── srs.ts              # Algoritma SuperMemo-2 (SM-2)
│       └── utils.ts            # Helper formatting waktu & tanggal
└── tests/
    └── srs.test.ts             # Pengujian unit Vitest
```

