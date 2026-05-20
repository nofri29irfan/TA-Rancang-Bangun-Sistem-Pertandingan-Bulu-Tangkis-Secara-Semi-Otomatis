# 🏸 Sistem Penilaian Bulu Tangkis

Platform digital untuk pencatatan skor pertandingan bulu tangkis secara real-time. Mendukung manajemen turnamen, pencatatan skor langsung, dan ekspor hasil pertandingan.


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
| **Real-time Score** | Pencatatan skor pertandingan secara live | Wasit |
| **Tunggal & Ganda** | Dukungan pertandingan tunggal dan ganda | Penyelenggara |
| **Score Board Config** | Kustomisasi tampilan skor (logo, warna, info turnamen) | Penyelenggara |
| **Manajemen Wasit** | Registrasi & monitoring wasit | Penyelenggara |
| **Export Hasil** | Export ke PDF & Excel | Penyelenggara |
| **Riwayat Lengkap** | Histori pertandingan dengan detail skor per set | Wasit |

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
git clone <repository-url>
cd BULKIS
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

# Jalankan migration
psql -U postgres -d bulkis_db -f database/migration.sql
```

> **Catatan:** Mock auth sudah digantikan dengan JWT. Anda harus mendaftar (register) akun baru terlebih dahulu karena saat ini belum ada seed data default.

---

## 📁 Struktur Folder

```
BULKIS/
├── database/
│   └── migration.sql          # PostgreSQL schema migration
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── common/            # Komponen reusable (Button, Input, Badge, dll)
│   │   ├── layout/            # Layout (Sidebar, Header, DashboardLayout)
│   │   └── scoreboard/        # Komponen tampilan skor
│   ├── contexts/
│   │   └── AuthContext.jsx    # Context untuk autentikasi
│   ├── data/
│   │   └── mockData.js        # Data dummy untuk development
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

Database menggunakan **PostgreSQL** dengan 8 tabel utama:

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

File migration: [`database/migration.sql`](database/migration.sql)

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

Penyelenggara bertanggung jawab mengelola turnamen, data pertandingan, dan wasit.

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
- Melihat daftar wasit yang sudah terdaftar

##### 📝 Input Data Pertandingan
- Memilih tipe pertandingan: **Tunggal** atau **Ganda**
- Mengisi detail: tanggal, waktu, venue, wasit yang ditugaskan
- Memilih pemain untuk Tim A dan Tim B
- Untuk pertandingan ganda, setiap tim bisa memiliki 2 pemain

##### 🎨 Pengaturan Tampilan (Scoreboard Config)
- Mengatur informasi turnamen yang tampil di layar skor
- Upload logo penyelenggara
- Memilih warna tema (warna utama & warna sistem)
- **Live preview** tampilan scoreboard di bagian bawah halaman

##### 📋 Hasil Pertandingan
- Melihat semua hasil pertandingan
- Filter berdasarkan kategori (tunggal/ganda) dan status
- Melihat detail skor per set

##### 🖨 Cetak Hasil
- Melihat pertandingan yang sudah selesai
- Export ke **PDF** atau **Excel** untuk dokumentasi

---

### 🟠 Wasit (Umpire)

Wasit bertanggung jawab memimpin pertandingan dan mencatat skor secara real-time.

#### Cara Login

1. Buka **http://localhost:5173/login**
2. Pilih tab **🟠 Wasit**
3. Masukkan email/username akun wasit yang sudah diregistrasi
4. Masukkan password
5. Klik **MASUK**

#### Fitur yang Tersedia

##### 🎯 Pilih Pertandingan
- Melihat daftar pertandingan yang tersedia dalam bentuk kartu
- Filter berdasarkan tanggal, kategori, dan status
- Setiap kartu menampilkan: tanggal, waktu, venue, nama pemain/tim
- Klik **Mulai Pertandingan** untuk masuk ke halaman scoring

##### 📊 Live Scoring (Pencatatan Skor)

Halaman ini menggunakan tampilan **dark theme** untuk fokus penuh saat pertandingan berlangsung.

**Fitur scoring:**
- **+ Poin / - Poin** — Tambah atau kurangi poin untuk setiap tim
- **Set 1, 2, 3** — Tab navigasi antar set. Skor per set tersimpan
- **Tukar Sisi Lapangan** — Menukar posisi tampilan Tim A dan Tim B
- **Batalkan Poin Terakhir** — Undo aksi poin terakhir
- **Akhiri Set** — Menyelesaikan set saat ini dan pindah ke set berikutnya
- **Akhiri Pertandingan** — Menyelesaikan seluruh pertandingan

**Alur pencatatan skor:**
1. Klik **Mulai Pertandingan** dari halaman Pilih Pertandingan
2. Catat poin dengan tombol **+ Poin** untuk tim yang mendapat poin
3. Jika salah, gunakan **- Poin** atau **Batalkan Poin Terakhir**
4. Saat satu set selesai (biasanya 21 poin), klik **Akhiri Set**
5. Lanjutkan ke set berikutnya
6. Setelah semua set selesai, klik **Akhiri Pertandingan**

##### 📜 Riwayat Pertandingan
- Melihat daftar pertandingan yang sudah selesai
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
| 8 | `/organizer/results` | Hasil Pertandingan | 🔵 Penyelenggara |
| 9 | `/organizer/print` | Cetak Hasil | 🔵 Penyelenggara |
| 10 | `/umpire` | Pilih Pertandingan | 🟠 Wasit |
| 11 | `/umpire/history` | Riwayat Pertandingan | 🟠 Wasit |
| 12 | `/umpire/match/:id/score` | Live Scoring | 🟠 Wasit |

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

### Mock Data

Data dummy dapat diubah di [`src/data/mockData.js`](src/data/mockData.js) untuk menambah pemain, pertandingan, atau turnamen baru.

---

## 🔮 Pengembangan Selanjutnya

| Prioritas | Fitur | Teknologi |
|-----------|-------|-----------|
| 🔴 Tinggi | Real-time scoring | Socket.IO (Integrasi frontend) |
| 🟡 Sedang | Upload logo | Multer + cloud storage |
| 🟡 Sedang | Export PDF/Excel | jsPDF + SheetJS (sudah terinstall) |
| 🟢 Rendah | Manajemen pemain (CRUD) | Halaman baru |
| 🟢 Rendah | Notifikasi real-time | Socket.IO events |

> **✅ Selesai di Phase 2:** Backend API (Node.js + Express), Koneksi database (PostgreSQL + pg), dan Autentikasi (JWT + bcrypt).

---

## 📝 Lisensi

Proyek ini dibuat untuk keperluan Tugas Akhir.

---

> **Dibuat dengan** ❤️ menggunakan React + Vite
