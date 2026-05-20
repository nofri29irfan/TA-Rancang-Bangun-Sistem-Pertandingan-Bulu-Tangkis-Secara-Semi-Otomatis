# Pengetahuan Proyek: BUL-KIS (Bulu Tangkis)

Ini adalah dokumen yang berisi rangkuman seluruh pengetahuan dan status pengembangan terkini dari proyek **BUL-KIS**, sebuah sistem pencatatan skor dan manajemen pertandingan bulu tangkis secara *real-time*.

## 1. Ikhtisar Proyek
- **Tujuan**: Platform digital untuk pencatatan skor bulu tangkis *real-time*, mendukung manajemen turnamen, registrasi wasit, dan ekspor hasil pertandingan.
- **Sistem Peran (Dual Role)**: 
  - **Penyelenggara (Organizer)**: Mengelola turnamen, mendaftarkan wasit, mengonfigurasi *scoreboard*, dan mencetak hasil.
  - **Wasit (Umpire)**: Melakukan *live scoring* pada pertandingan yang sedang berlangsung.
- **Tech Stack**:
  - **Frontend**: React 18, Vite, React Router v6, Vanilla CSS (Custom Properties), Lucide React.
  - **Backend**: Node.js, Express.js.
  - **Database**: PostgreSQL dengan `pg`.
  - **Autentikasi**: JWT (JSON Web Token) dan `bcrypt` untuk enkripsi password.

## 2. Struktur Database
Terdapat 8 tabel utama di PostgreSQL:
1. `users` - Data autentikasi inti untuk pengguna.
2. `organizers` - Detail spesifik penyelenggara.
3. `umpires` - Detail spesifik wasit (termasuk lisensi dan pengalaman).
4. `players` - Data pemain bulu tangkis.
5. `tournaments` - Data turnamen atau kejuaraan.
6. `matches` - Detail pertandingan (Tunggal/Ganda, jadwal, status).
7. `match_players` - Relasi pemain di dalam pertandingan (Tim A atau Tim B).
8. `match_scores` - Pencatatan skor per set untuk setiap pertandingan.

## 3. Status Pengembangan Saat Ini

### A. Frontend
- Desain UI dan *routing* dasar sebagian besar sudah ada (di folder `src/`).
- Integrasi API dengan *backend* sedang/masih perlu disempurnakan (sebelumnya menggunakan *mock data*).

### B. Backend (Node.js + Express)
- **Sudah Selesai**:
  - Koneksi database PostgreSQL (`db.js`).
  - Autentikasi: Login & Register dengan JWT (`routes/auth.js`).
  - API Dashboard: Rangkuman statistik untuk penyelenggara (`routes/dashboard.js`).
  - API Wasit: Manajemen (CRUD) data wasit oleh penyelenggara (`routes/umpires.js`).

- **Belum Selesai (Pending)**:
  - **Manajemen Pemain (`players`)**: API untuk menambah, mengedit, dan menghapus data pemain.
  - **Manajemen Turnamen (`tournaments`)**: API untuk membuat dan mengelola turnamen.
  - **Manajemen Pertandingan (`matches` & `match_players`)**: API untuk membuat jadwal, memasukkan pemain ke dalam tim, dan mendapatkan daftar pertandingan untuk wasit.
  - **Pencatatan Skor (`match_scores`)**: API untuk *live scoring* (poin, set, riwayat skor).
  - **Konfigurasi Tampilan / *Scoreboard***: Menyimpan preferensi UI *scoreboard* untuk tiap penyelenggara/turnamen.

## 4. Langkah Selanjutnya (Next Steps)

Berdasarkan kesepakatan, prioritas kita saat ini adalah **Mengerjakan Backend hingga 100% Selesai**. Integrasi *frontend* akan menyusul setelah *backend* benar-benar rampung.

Berikut adalah urutan *Next Steps* yang akan kita lakukan:

### Tahap 1: API Pemain & Turnamen (Players & Tournaments)
- Membuat `controllers/playerController.js` & `routes/players.js`.
- Membuat `controllers/tournamentController.js` & `routes/tournaments.js`.
- Mendukung operasi CRUD standar untuk kebutuhan data induk pertandingan.

### Tahap 2: API Pertandingan (Matches & Match Players)
- Membuat `controllers/matchController.js` & `routes/matches.js`.
- Endpoint untuk *create match* (menggabungkan pemain dari tabel `players` menjadi Tim A dan Tim B di `match_players`).
- Endpoint *list matches* (untuk dashboard Organizer dan pilihan pertandingan Umpire).

### Tahap 3: API Pencatatan Skor (Match Scores)
- Membuat endpoint untuk memperbarui skor per set.
- Membuat fungsionalitas untuk sinkronisasi poin (menambah/membatalkan poin).
- Persiapan arsitektur awal jika ke depan akan dipasang `Socket.IO` untuk *real-time scoreboard*.

### Tahap 4: Finalisasi Backend & Pengujian
- Integrasi ke `server/index.js`.
- Memastikan semua rute terproteksi *middleware* autentikasi yang tepat (`requireAuth`, cek *role* Organizer/Umpire).
- Melakukan pengetesan menggunakan Postman/cURL (pengujian integrasi API).

---
*Catatan ini akan menjadi panduan untuk prompt-prompt selanjutnya sampai keseluruhan fitur Backend rampung.*

Catatan Tambahan yang telah ipan kerjakan

1. Tahap 1: API Pemain & Turnamen (Data Dasar)
Di bagian ini, Ipan sudah ngehubungin data turnamen dari database ke tampilan dashboard. Ipan bisa ganti logo dan warna tema secara otomatis di layar wasit. Untuk file playerController.js yang sipan tidak bikin karena data pemain sudah ada langsung di matchController.js

2. Tahap 2: API Pertandingan (Mesin Utama)
Fungsi createMatch dan getMatches yang Ipan punya sudah lumayan bagus mas. Ipan sudah bisa bikin jadwal tanding, misahin pemain jadi Tim A dan Tim B, sampai nampilin daftar pertandingannya di tiga tempat berbeda sekaligus (Pilih Pertandingan, Riwayat Wasit, dan Dashboard Penyelenggara). Logika database-nya sudah klop banget di sini.

3. Tahap 3: API Pencatatan Skor (Fitur Inti)
Ini yang paling krusial buat aplikasi Ipan. Fungsi finishMatch sudah terbukti bisa nyimpan skor per set ke database. Ipan juga sudah tambahkan fitur durasi main otomatis yang tadi Ipan tes sendiri dan hasilnya muncul (misalnya "1 mnt"). Jadi, riwayat skor Ipan sekarang sudah lengkap sama durasi waktunya.

4. Tahap 4: Finalisasi & Keamanan
Semua rute di API Ipan sudah dikunci pakai verifyToken, jadi nggak sembarang orang bisa ngacak-ngacak data Ipan. Ipan juga sudah ngetes semuanya langsung dari browser (Frontend ke Backend), yang artinya koneksi aplikasi Ipan sudah relatif stabil. Tadi juga Ipan sudah sukses nge-push kode ke GitHub, jadi progres Ipan sudah aman tersimpan.

Kesimpulan:
Sekarang Ipan tinggal fokus ke fitur-fitur yang belum, seperti:


Nge-aktifin tombol Detail biar bisa lihat rincian skor tiap set lebih rapi.

Bikin fitur Cetak Hasil pertandingan buat di-print atau jadi PDF.