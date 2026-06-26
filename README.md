# sedina-api-base

Proyek ini merupakan base API (ditulis dalam bahasa PHP) untuk aplikasi Sedina. Tujuan utama ke depannya adalah melakukan mapping semua API yang ada di dalam proyek ini dan melakukan **refactor ke NestJS (TypeScript)**.

## Mapping API per Modul / Fitur

Berikut adalah daftar API yang saat ini tersedia dan dikelompokkan berdasarkan modul/fitur untuk mempermudah proses refactoring nantinya:

### 1. Auth & Session
- `login.php` - Proses login pengguna
- `check_session.php` - Memeriksa status sesi pengguna
- `get_session.php` - Mengambil data sesi pengguna saat ini
- `update_password.php` - Mengubah kata sandi pengguna

### 2. Kehadiran (Presensi)
- `clockin.php` - Proses mencatat waktu masuk (clock-in)
- `cek_clockin.php` - Memeriksa status clock-in hari ini
- `get_riwayat_kehadiran.php` - Mengambil data riwayat kehadiran

### 3. Agenda
- `get_agenda (1).php` - Mengambil daftar agenda
- `get_agenda_bersamaan.php` - Mengambil data agenda yang memiliki waktu bersamaan
- `get_agenda_user.php` - Mengambil agenda untuk pengguna tertentu
- `get_detail_agenda.php` - Mengambil detail dari suatu agenda
- `get_target_agenda.php` - Mengambil target peserta agenda
- `tambah_agenda.php` - Menambahkan agenda baru

### 4. Todo (Tugas)
- `get_todo.php` - Mengambil daftar tugas (todo)
- `tambah_todo.php` - Menambahkan tugas baru
- `update_todo.php` - Memperbarui data tugas
- `update_todo_status.php` - Memperbarui status selesai/belum dari suatu tugas
- `hapus_todo.php` - Menghapus tugas

### 5. Anggota & Profil
- `get_anggota (1).php` - Mengambil daftar anggota
- `get_master_anggota.php` - Mengambil master data anggota
- `tambah_anggota.php` - Menambahkan anggota baru
- `get_profile (1).php` - Mengambil profil anggota

### 6. Berita
- `get_berita.php` - Mengambil daftar berita
- `get_berita_admin.php` - Mengambil daftar berita untuk admin
- `tambah_berita.php` - Menambahkan berita baru

### 7. Pesan & Notifikasi
- `get_pesan (1).php` - Mengambil daftar pesan
- `tambah_pesan.php` - Mengirim atau menambahkan pesan baru
- `update_dilihat.php` - Memperbarui status pesan/notifikasi menjadi telah dilihat

### 8. Catatan
- `get_catatan.php` - Mengambil catatan
- `save_catatan.php` - Menyimpan catatan baru atau memperbarui catatan

### 9. Core & Konfigurasi
- `koneksi.php` - File konfigurasi koneksi ke database

---
*Catatan: File dengan angka di dalam kurung seperti `(1)` mungkin merupakan duplikasi atau penamaan file sementara dan perlu diidentifikasi lebih lanjut saat proses pemindahan ke NestJS.*
