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
- [x] **DTO:** `CreateTodoDto`, `UpdateTodoDto`, `UpdateTodoStatusDto`.
- [x] **Controller:** `/todo`, `/todo/:id`, `/todo/:id/status`.
- [x] **Service & Repository:** Complete CRUD for personal Todo list per user. Ensure filter by `userId` from JWT. Refactored Indonesian fields to English in Database Schema, DTOs, and API JSON Keys (`title`, `task_detail`, `note`, `date`, `time`, `location`, `priority`, `attachment`, `status`). Added Multer for file upload handling.

### 8. Notes
*File Legacy: `get_catatan.php`, `save_catatan.php`*
- [x] **DTO:** `SaveNoteDto`.
- [x] **Controller:** `/notes/agenda/:agendaId` and `POST /notes`.
- [x] **Service & Repository:** Logic to upsert (update or insert) a personal note based on the logged-in user and fetch the current note. Renamed model to `AgendaNote` and table to `agenda_notes` in Prisma Schema.

## Fase 2: Pengembangan & Enhancement Lanjutan (Session Management & Audit Trail)

Berdasarkan kebutuhan sistem yang berkembang, berikut adalah rencana implementasi fitur-fitur baru dan peningkatan keamanan.

### 1. Peningkatan Keamanan: Migrasi Hashing Password ke Argon2
- [x] **Tujuan:** Beralih dari `bcrypt` ke algoritma `Argon2` yang lebih tahan terhadap serangan *brute-force* dan *GPU cracking*.
- [x] **Mekanisme Migrasi (*Hard Reset*):**
  - Karena instruksi *user*, sistem kini sepenuhnya mengadopsi `Argon2` dan seluruh ketergantungan pada `bcrypt` telah dihapus.
  - Pengguna dengan password lama yang di-hash dengan `bcrypt` perlu di-reset secara manual.
- [x] **Implementasi Lainnya:**
  - Semua alur pembuatan password baru (Registrasi, `tambah_anggota`, Ganti Password, Reset Password) langsung menggunakan `Argon2`.
  - Menginstal dependensi `argon2` dan menghapus `bcrypt`.
  - Modifikasi `auth.service.ts` dan service terkait lainnya.

### MANDATORY ARCHITECTURE STANDARDS
Sebelum menulis kode untuk fitur di bawah ini, wajib mematuhi standar berikut agar konsisten dengan modul lainnya:

1. **Folder structure per feature (Vertical Slice)**:
   ```
   src/<feature>/
     ├── <feature>.module.ts
     ├── <feature>.controller.ts
     ├── <feature>.service.ts
     ├── <feature>.repository.ts
     ├── dto/
     └── entities/ (or types/)
   ```
2. **Validation**: `class-validator` + `class-transformer` on every DTO. Follow the existing global `ValidationPipe` (`whitelist: true`, `forbidNonWhitelisted: true`).
3. **Error handling**: use NestJS's built-in HTTP Exceptions. Ensure error responses remain uniform.
4. **Security & RBAC**:
   - All new endpoints **must** be protected by `JwtAuthGuard` by default.
   - Use the existing `RolesGuard` + `@Roles()` decorator — applicable roles: `superadmin`, `Sekretariat Dewan (Setwan)`, `Anggota Dewan (Anggota)`.
5. **Caching**: use Redis only where relevant — for session management, Redis is used for *session revocation checks*.
6. **Field/API language**: normalize fields to English (Prisma schema fields, DTOs, JSON responses).
7. Add Swagger documentation if used in other modules.
8. Add unit tests (service) and basic e2e tests (controller) following existing patterns.

---

### 2. Manajemen Sesi Pengguna (User Session Management)
**Goal:** Give users transparency and control over their login history and connected devices, including the ability to remotely force-logout a device.

- [ ] **Prisma Schema (`UserSession`):**
  - Create model `UserSession` (combines login history + linked devices). Fields: `id`, `userId`, `sessionId` (unique), `ipAddress`, `userAgent`, `deviceName`, `location`, `status` (`SUCCESS`/`FAILED`), `isRevoked`, `loginAt`, `revokedAt`, `expiresAt`.
- [ ] **Auth Flow Modifications:**
  - On successful login (`auth.service.ts`): Generate unique `sessionId`, embed in JWT payload, save `UserSession` (`SUCCESS`), and store revocation status in Redis (`session:{sessionId}` -> revoked flag).
  - On failed login: Record attempt with `status: FAILED`.
- [ ] **New Endpoints:**
  - `GET /users/me/login-history`: Login history (success/failed) with pagination & filters.
  - `GET /users/me/devices`: List of active sessions.
  - `DELETE /users/me/devices/:sessionId`: Revoke specific session (force logout).
- [ ] **`JwtAuthGuard` Modifications:**
  - After JWT validation, extract `sessionId`, check Redis (`session:{sessionId}` revoked?). Fall back to DB query if not in Redis. Throw `UnauthorizedException` (401) if revoked or expired.

---

### 3. Audit Trail (Data Mutation Activity Log System)
**Goal:** Record all data mutations (CREATE/UPDATE/DELETE) across the system for audit and accountability.

- [ ] **Prisma Schema (`AuditTrail`):**
  - Create model `AuditTrail`. Fields: `id`, `userId`, `action` (`CREATE`/`UPDATE`/`DELETE`), `entity`, `entityId`, `oldValues` (JSON), `newValues` (JSON), `ipAddress`, `userAgent`, `createdAt`.
- [ ] **Implementation Mechanism:**
  - Use **Prisma Client Extension** (`$extends`) to intercept `create`, `update`, `delete` queries.
  - Flow: Fetch old data -> Execute query -> Capture new values -> Write to `AuditTrail` (asynchronously/non-blocking).
  - **Mandatory sanitization**: Remove/mask sensitive fields (e.g., `password`, `token`).
  - Use `AsyncLocalStorage` to access request context (`userId`, `ipAddress`, `userAgent`) inside the Prisma extension.
- [ ] **Scope:**
  - Apply globally, but focus heavily on `Auth`, `Users`, and Role/Permission modules.
- [ ] **New Endpoint:**
  - `GET /audit-logs`: List audit logs with filters (`entity`, `userId`, `action`, date range) + pagination. Strict RBAC: **Only** `superadmin` and `Sekretariat Dewan (Setwan)`.

---

### DELIVERABLES — CHECKLIST BEFORE CONSIDERING THIS DONE
- [ ] Prisma schema for `UserSession` and `AuditTrail` added + migration generated (`prisma migrate dev`).
- [ ] `sessions` module (or added to `users` module) with the 3 endpoints above, DTOs, guards, and RBAC.
- [ ] `JwtAuthGuard`/strategy validates `sessionId` against Redis and DB.
- [ ] `audit-trail` module with Prisma Client Extension hooking all mutations, sanitizing data, and `GET /audit-logs` endpoint with strict RBAC.
- [ ] All new API fields are in English.
- [ ] Swagger docs for all new endpoints (if applicable).
- [ ] Unit tests (service) + basic e2e tests for both features.
- [ ] Document assumptions made (e.g., session duration, audit log retention).
