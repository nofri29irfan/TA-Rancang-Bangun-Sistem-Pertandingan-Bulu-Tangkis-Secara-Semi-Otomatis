# 🏸 Rancang Bangun Sistem Penilaian Pertandingan Bulu Tangkis Secara Semi Otomatis

Platform digital untuk pencatatan skor pertandingan bulu tangkis secara real-time. Mendukung manajemen turnamen, pencatatan skor langsung, integrasi *Computer Vision* dengan Jetson Nano, serta ekspor hasil pertandingan.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Prasyarat](#-prasyarat)
- [Cara Menjalankan di Local](#-cara-menjalankan-di-local)
- [Struktur Folder](#-struktur-folder)
- [Database](#-database)
- [Panduan Pengguna](#-panduan-pengguna)
  - [Akun Demo](#akun-demo)
  - [Penyelenggara (Organizer)](#-penyelenggara-organizer)
  - [Wasit (Umpire)](#-wasit-umpire)
- [Halaman Aplikasi](#-halaman-aplikasi)
- [Kustomisasi](#-kustomisasi)
- [Pengembangan Selanjutnya](#-pengembangan-selanjutnya)

---

## ✨ Fitur Utama

| Fitur | Deskripsi | Pengguna |
|-------|-----------|----------|
| **Dual Role System** | Login terpisah untuk Penyelenggara & Wasit | Semua |
| **Real-time Score & VAR** | Pencatatan skor live dan fitur VAR Kamera (In/Out) | Wasit |
| **Edge Computing Integration** | Terhubung ke Jetson Nano untuk kalibrasi 4 titik | Wasit |
| **Tunggal & Ganda** | Dukungan pertandingan tunggal dan ganda | Penyelenggara |
| **Score Board Config** | Kustomisasi tampilan skor (logo, warna, info turnamen) | Penyelenggara |
| **Manajemen & Penugasan Wasit** | Registrasi dan penugasan wasit ke pertandingan melalui menu hasil | Penyelenggara |
| **Export Hasil** | Export ke PDF & Excel | Penyelenggara |

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Routing | React Router v6 |
| Styling | Vanilla CSS (CSS Custom Properties) |
| Icons | Lucide React |
| Font | Inter (Google Fonts) |
| Database | PostgreSQL + pg |
| Auth | JWT + bcrypt |
| Export | jsPDF + SheetJS (xlsx) |

---

## 📦 Prasyarat

Pastikan perangkat kamu sudah terinstall:

- **Node.js** versi 18 atau lebih baru — [Download](https://nodejs.org/)
- **npm** (biasanya sudah terinstall bersama Node.js)
- **PostgreSQL** (wajib, untuk menjalankan database) — [Download](https://www.postgresql.org/download/)

Untuk mengecek versi:

```bash
node -v    # contoh output: v18.17.0
npm -v     # contoh output: 9.6.7
```

---

## 🚀 Cara Menjalankan di Local

### 1. Clone atau Download Repository

```bash
git clone [https://github.com/nofri29irfan/TA-Rancang-Bangun-Sistem-Pertandingan-Bulu-Tangkis-Secara-Semi-Otomatis.git](https://github.com/nofri29irfan/TA-Rancang-Bangun-Sistem-Pertandingan-Bulu-Tangkis-Secara-Semi-Otomatis.git)
cd TA-Rancang-Bangun-Sistem-Pertandingan-Bulu-Tangkis-Secara-Semi-Otomatis
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Jalankan Development Server & Backend

Buka dua terminal terpisah untuk menjalankan frontend dan backend:

**Terminal 1 (Backend):**
```bash
npm run server
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

Aplikasi frontend akan berjalan di: **http://localhost:5173/**
Server backend akan berjalan di port **3000**.

### 4. Build untuk Production (Opsional)

```bash
npm run build
```

Hasil build akan tersimpan di folder `dist/`.

### 5. Setup Database

Sistem autentikasi saat ini terhubung langsung ke database PostgreSQL, sehingga Anda wajib menjalankan database lokal:

```bash
# Buat database baru
psql -U postgres -c "CREATE DATABASE bulkis_db;"

# Jalankan file SQL
psql -U postgres -d bulkis_db -f bulkis.sql
```

> **Catatan:** Mock auth sudah digantikan dengan JWT. Anda harus mendaftar (register) akun baru terlebih dahulu karena saat ini belum ada seed data default.

---

## 📁 Struktur Folder

```text
BULKIS/
├── bulkis.sql                 # File dump/schema database PostgreSQL
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── common/            # Komponen reusable (Button, Input, Badge, dll)
│   │   ├── layout/            # Layout (Sidebar, Header, DashboardLayout)
│   │   └── scoreboard/        # Komponen tampilan skor
│   ├── contexts/
│   │   └── AuthContext.jsx    # Context untuk autentikasi
│   ├── pages/
│   │   ├── auth/              # Halaman Login & Register
│   │   ├── organizer/         # Halaman dashboard Penyelenggara
│   │   ├── public/            # Landing page
│   │   └── umpire/            # Halaman dashboard Wasit
│   ├── styles/
│   │   ├── variables.css      # Design tokens (warna, typography, spacing)
│   │   └── global.css         # Global styles & reset
│   ├── App.jsx                # Root component & routing
│   └── main.jsx               # Entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## 💾 Database

Database menggunakan **PostgreSQL** dengan 9 tabel utama:

| Tabel | Deskripsi |
|-------|-----------|
| `users` | Data pengguna (penyelenggara & wasit) |
| `organizers` | Detail tambahan penyelenggara |
| `umpires` | Detail tambahan wasit |
| `players` | Data pemain bulu tangkis |
| `tournaments` | Data turnamen/kejuaraan |
| `matches` | Data pertandingan |
| `match_players` | Relasi pemain dengan pertandingan (tim A/B) |
| `match_scores` | Skor per set dalam pertandingan |
| `var_records` | Data rekam/catatan terkait sistem (VAR/Review) |

File database: `bulkis.sql`

---

## 👤 Panduan Pengguna

### Registrasi Akun

Karena sistem login sudah terhubung dengan database PostgreSQL dan menggunakan enkripsi `bcrypt`, **mock data akun demo sudah tidak berlaku**.

**Langkah pertama:**
1. Buka **http://localhost:5173/register**
2. Daftarkan akun baru dengan peran **Penyelenggara** atau **Wasit**.
3. Gunakan akun yang baru didaftarkan tersebut untuk login.

---

### 🔵 Penyelenggara (Organizer)

Penyelenggara bertanggung jawab mengelola turnamen, data pertandingan, registrasi, dan penugasan wasit.

#### Cara Login

1. Buka **http://localhost:5173/login**
2. Pilih tab **🔵 Penyelenggara**
3. Masukkan email/username akun penyelenggara yang sudah diregistrasi
4. Masukkan password
5. Klik **MASUK**

#### Fitur yang Tersedia

##### 📊 Dashboard Utama
- Melihat statistik ringkasan: total pertandingan, total pemain, wasit terdaftar, pertandingan hari ini
- Melihat daftar pertandingan terbaru dalam bentuk tabel

##### 👨‍⚖️ Daftarkan Wasit
- Mengisi form pendaftaran wasit baru (nama, email, no. lisensi, pengalaman)
- Melihat daftar wasit yang sudah terdaftar di dalam sistem

##### 📝 Input Data Pertandingan
- Memilih tipe pertandingan: **Tunggal** atau **Ganda**
- Mengisi detail jadwal: tanggal, waktu, dan venue pertandingan
- Memilih pemain untuk Tim A dan Tim B (untuk pertandingan ganda, setiap tim memiliki 2 pemain)

##### 🎨 Pengaturan Tampilan (Scoreboard Config)
- Mengatur informasi turnamen yang tampil di layar skor
- Upload logo penyelenggara
- Memilih warna tema (warna utama & warna sistem)
- **Live preview** tampilan scoreboard di bagian bawah halaman

##### 📋 Hasil Pertandingan & Penugasan Wasit
- **Menugaskan Wasit**: Memilih dan menugaskan wasit dari daftar yang terregistrasi untuk memimpin jalannya pertandingan tertentu
- Melihat semua daftar hasil pertandingan
- Filter berdasarkan kategori (tunggal/ganda) dan status pertandingan
- Melihat detail skor per set secara komprehensif

##### 🖨 Cetak Hasil
- Melihat pertandingan yang sudah selesai
- Export ke **PDF** atau **Excel** untuk dokumentasi kejuaraan

---

### 🟠 Wasit (Umpire)

Wasit bertanggung jawab memimpin pertandingan, melakukan kalibrasi alat penangkap gambar, dan mengonfirmasi skor real-time berdasarkan asisten video.

#### Cara Login

1. Buka **http://localhost:5173/login**
2. Pilih tab **🟠 Wasit**
3. Masukkan email/username akun wasit yang sudah diregistrasi
4. Masukkan password
5. Klik **MASUK**

#### Fitur yang Tersedia

##### 🎯 Pilih Pertandingan & Kalibrasi
- Melihat daftar pertandingan yang ditugaskan kepada wasit dalam bentuk kartu informasi
- **Integrasi Jetson & Input 4 Titik**: Dashboard wasit telah terhubung langsung dengan perangkat NVIDIA Jetson Nano. Sebelum memulai pertandingan, wasit memasukkan 4 titik koordinat area sudut lapangan sebagai langkah kalibrasi sistem deteksi berbasis *Computer Vision*.
- Mengklik **Mulai Pertandingan** untuk beralih ke halaman penilaian setelah kalibrasi berhasil.

##### 📊 Live Scoring & VAR Kamera

Halaman ini menggunakan tampilan **dark theme** untuk fokus penuh saat pertandingan berlangsung.

**Fitur Scoring & Sistem Deteksi:**
- **+ Poin / - Poin** — Tambah atau kurangi poin untuk setiap tim
- **Set 1, 2, 3** — Tab navigasi antar set. Skor per set tersimpan
- **Tukar Sisi Lapangan** — Menukar posisi tampilan Tim A dan Tim B (sistem diatur untuk melakukan pergantian sisi lapangan jika poinnya sudah mencapai 21)
- **VAR Kamera (Video Assistant Referee)** — Fitur tayangan ulang yang mengambil *feed* tangkapan dari kamera untuk meninjau kejadian di lapangan
- **Analisis In/Out (11 Frame)** — Sistem deteksi otomatis memproduksi **11 frame** beruntun tepat saat *shuttlecock* menyentuh lantai. Hasil tangkapan frame divisualisasikan langsung pada dashboard wasit guna memvalidasi keputusan *In* (masuk) atau *Out* (keluar) secara presisi.
- **Batalkan Poin Terakhir** — Undo aksi poin terakhir
- **Akhiri Set** — Menyelesaikan set saat ini dan pindah ke set berikutnya
- **Akhiri Pertandingan** — Menyelesaikan seluruh pertandingan

##### 📜 Riwayat Pertandingan
- Melihat daftar pertandingan yang sudah selesai dipimpin oleh wasit tersebut
- Informasi: nama pemain, kategori, tanggal, durasi, skor, status

---

## 📄 Halaman Aplikasi

| No | Route | Halaman | Akses |
|----|-------|---------|-------|
| 1 | `/` | Landing Page | Publik |
| 2 | `/login` | Halaman Login | Publik |
| 3 | `/register` | Halaman Registrasi | Publik |
| 4 | `/organizer` | Dashboard Penyelenggara | 🔵 Penyelenggara |
| 5 | `/organizer/umpires` | Daftarkan Wasit | 🔵 Penyelenggara |
| 6 | `/organizer/matches/new` | Input Pertandingan | 🔵 Penyelenggara |
| 7 | `/organizer/scoreboard` | Pengaturan Tampilan Skor | 🔵 Penyelenggara |
| 8 | `/organizer/results` | Hasil Pertandingan & Penugasan | 🔵 Penyelenggara |
| 9 | `/organizer/print` | Cetak Hasil | 🔵 Penyelenggara |
| 10 | `/umpire` | Pilih Pertandingan & Kalibrasi | 🟠 Wasit |
| 11 | `/umpire/history` | Riwayat Pertandingan | 🟠 Wasit |
| 12 | `/umpire/match/:id/score` | Live Scoring & VAR | 🟠 Wasit |

> **Catatan:** Halaman Penyelenggara dan Wasit dilindungi oleh autentikasi. Jika belum login, pengguna akan diarahkan ke halaman login.

---

## 🎨 Kustomisasi

### Warna Tema

Warna aplikasi dapat diubah di file [`src/styles/variables.css`](src/styles/variables.css):

```css
:root {
  /* Warna utama Penyelenggara */
  --color-deep-blue: #001F3F;
  --color-sky-blue: #4A90E2;

  /* Warna utama Wasit */
  --color-referee-orange: #FF8C00;
}
```

---

## 🔮 Pengembangan Selanjutnya

| Prioritas | Fitur | Teknologi |
|-----------|-------|-----------|
| 🔴 Tinggi | Real-time scoring | Socket.IO (Integrasi frontend) |
| 🟡 Sedang | Upload logo | Multer + cloud storage |
| 🟡 Sedang | Export PDF/Excel | jsPDF + SheetJS (sudah terinstall) |
| 🟢 Rendah | Manajemen pemain (CRUD) | Halaman baru |
| 🟢 Rendah | Notifikasi real-time | Socket.IO events |

> **✅ Selesai di Phase 2:** Backend API (Node.js + Express), Koneksi database (PostgreSQL + pg), Integrasi Jetson Nano, dan Autentikasi (JWT + bcrypt).

---

## 👨‍💻 Penulis

**Nofri Irfandi** Program Studi Teknik Elektro, Telkom University  

---
*Proyek ini diajukan untuk memenuhi salah satu syarat kelulusan Tugas Akhir.*

> **Dibuat dengan** ❤️ menggunakan React + Vite
