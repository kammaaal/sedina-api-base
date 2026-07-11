# Rencana Refactor & Pengembangan API (NestJS)

Dokumen ini merinci rencana refaktor dari legacy code (PHP) ke dalam framework NestJS dengan menerapkan arsitektur *Vertical Slicing* (berbasis fitur) dan standar *MVC* modern.

## Fase 1: Persiapan (Selesai)
- [x] Memindahkan semua legacy code (`.php`) ke dalam folder `v1/` untuk referensi.
- [x] Inisialisasi project `sedina-api-base` menggunakan NestJS.
- [x] Setup database (MySQL) dan Prisma ORM.

## Standar Arsitektur & Best Practices

Setiap fitur (Vertical Slice) harus mengadopsi standar berikut:

1. **Struktur Direktori (Vertical Slicing):**
   Setiap fitur memiliki foldernya sendiri (misal `src/agenda/`), yang di dalamnya memuat:
   - `[feature].module.ts` (Deklarasi module)
   - `[feature].controller.ts` (Routing dan definisi endpoints)
   - `[feature].service.ts` (Business logic)
   - `[feature].repository.ts` (Akses ke database menggunakan Prisma) *Opsional, namun sangat disarankan untuk abstraksi*
   - `dto/` (Folder berisi Data Transfer Objects untuk Request Body/Query/Params validation)
   - `entities/` atau `types/` (Jika diperlukan)

2. **Validasi (Validation):**
   - Menggunakan `class-validator` dan `class-transformer` pada setiap DTO.
   - Pengecekan input secara ketat (whitelist, forbid non-whitelisted) melalui global ValidationPipe.

3. **Error Handling:**
   - Menggunakan standar HTTP Exceptions bawaan NestJS (`BadRequestException`, `NotFoundException`, `UnauthorizedException`, dll).
   - *Global Exception Filter* untuk menyeragamkan response error API (opsional namun direkomendasikan).

4. **Keamanan & RBAC (Role-Based Access Control):**
   - Authentication menggunakan JWT (JSON Web Tokens).
   - Pengamanan password menggunakan Bcrypt.
   - Implementasi `RolesGuard` dan decorator `@Roles()` untuk membatasi akses berdasarkan role (`superadmin`, `Sekretariat Dewan (Setwan)`, `Anggota Dewan (Anggota)`).
   - Endpoint harus dilindungi oleh `JwtAuthGuard` secara default, kecuali endpoint publik (misal: login).

5. **Caching:**
   - Menerapkan **Redis Cache** untuk endpoint dengan load tinggi atau data yang jarang berubah (misal: Master Anggota, list agenda publik, list berita).

---

## Rencana Refactor per Fitur (Vertical Slicing)

### 1. Auth (Autentikasi & Sesi)
*File Legacy: `login.php`, `check_session.php`, `get_session.php`*
- [x] **DTO:** `LoginDto`.
- [x] **Controller:** Endpoint `/auth/login`, `/auth/session`.
- [x] **Service:** Validasi kredensial (bcrypt compare), generate JWT, kembalikan user profile dalam payload JWT.
- [x] **Security:** Rate limiting pada endpoint login menggunakan `@nestjs/throttler`.

### 2. Users / Anggota
*File Legacy: `get_profile (1).php`, `update_password.php`, `get_anggota (1).php`, `get_master_anggota.php`, `tambah_anggota.php`*
- [x] **DTO:** `CreateAnggotaDto`, `UpdatePasswordDto`.
- [x] **Controller:** `/users/profile`, `/users/password`, `/users/anggota`, `/users/master-anggota`.
- [x] **Service & Repository:** CRUD logic untuk data anggota. Hash password baru menggunakan bcrypt.
- [x] **RBAC:** Hanya `superadmin` / `setwan` yang dapat menambah anggota (`tambah_anggota`). `Anggota` hanya dapat melihat profil dan update password miliknya sendiri.
- [x] **Cache (Redis):** Cache endpoint `/users/master-anggota`.

### 3. Agenda
*File Legacy: `get_agenda (1).php`, `get_agenda_user.php`, `get_agenda_bersamaan.php`, `get_detail_agenda.php`, `get_target_agenda.php`, `tambah_agenda.php`*
- [x] **DTO:** `CreateAgendaDto`, `AgendaFilterDto`.
- [x] **Controller:** `/agenda`, `/agenda/:id`, `/agenda/user`, dll.
- [x] **Service & Repository:** Logic untuk mengambil agenda personal, agenda bersamaan, dan target agenda.
- [x] **RBAC:** Penambahan agenda dibatasi untuk role tertentu (misal: `setwan`).
- [x] **Cache (Redis):** Cache endpoint list agenda umum.

### 4. Attendance (Clock-in)
*File Legacy: `clockin.php`, `cek_clockin.php`, `get_riwayat_kehadiran.php`*
- [x] **DTO:** `ClockInDto`.
- [x] **Controller:** `/attendance/clockin`, `/attendance/status`, `/attendance/history`.
- [x] **Service & Repository:** Pencatatan lokasi (lat/long) dan validasi waktu clock-in, memastikan user belum clock-in di hari/sesi yang sama.

### 5. News
*File Legacy: `get_berita.php`, `get_berita_admin.php`, `tambah_berita.php`, `update_dilihat.php`*
- [x] **DTO:** `CreateNewsDto`, `UpdateNewsDto`.
- [x] **Controller:** `/news`, `/news/admin`, `/news`, `/news/:id`, `/news/:id/view`.
- [x] **Service & Repository:** News management logic including tags (many-to-many) and view count increment.
- [x] **RBAC:** Only `superadmin` / `setwan` can access `POST /news`, `PATCH /news/:id`, `DELETE /news/:id`, and `GET /news/admin`. Normal users/members can only view published news via `GET /news`.
- [x] **Cache (Redis):** Cache endpoint `/news` for public/members.

### 6. Messages (Pesan)
*File Legacy: `get_pesan (1).php`, `tambah_pesan.php`*
- [x] **DTO:** `CreateMessageDto`.
- [x] **Controller:** `/messages`.
- [x] **Service & Repository:** Business logic implemented in `messages.service.ts` for sending and receiving messages.
- [x] **Security & RBAC:** Role-based logic added:
  - `Anggota Dewan (Anggota)` can only send 1-to-1 direct messages.
  - `Sekretariat Dewan (Setwan)` and `superadmin` can send direct messages or broadcast to all (`all`), specific commissions (`komisi`), fractions (`fraksi`), etc.
- [x] **Prisma Schema Update:** Refactored the old `Pesan` table to `Message` (mapped to `messages`) to support polymorphic targeting (`target_type`, `target_id`).

### 7. Todo (Tugas)
*File Legacy: `get_todo.php`, `tambah_todo.php`, `update_todo.php`, `update_todo_status.php`, `hapus_todo.php`*
- [ ] **DTO:** `CreateTodoDto`, `UpdateTodoDto`, `UpdateTodoStatusDto`.
- [ ] **Controller:** `/todo`, `/todo/:id`, `/todo/:id/status`.
- [ ] **Service & Repository:** CRUD lengkap untuk Todo list pribadi per user. Pastikan filter berdasarkan `userId` dari JWT.

### 8. Catatan (Notes)
*File Legacy: `get_catatan.php`, `save_catatan.php`*
- [ ] **DTO:** `SaveCatatanDto`.
- [ ] **Controller:** `/catatan`.
- [ ] **Service & Repository:** Logic untuk upsert (update or insert) catatan pribadi berdasarkan user yang login.
