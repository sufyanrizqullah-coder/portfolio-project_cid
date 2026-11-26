# 🗂️ Portfolio Project Manager

Website portofolio modern dengan dark mode, animasi Framer Motion, dashboard admin lengkap, dan database SQLite.

---

## 🚀 Cara Menjalankan (Pertama Kali)

### 1. Pastikan sudah ada file `.env`
File `.env` sudah otomatis dibuat. Pastikan isinya:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="portfolio-secret-key-change-in-production-min-32-chars"
ADMIN_INITIAL_EMAIL="AdminCid@gmail.com"
ADMIN_INITIAL_PASSWORD="OnlyCidzzz"
NEXT_PUBLIC_APP_NAME="Portfolio Projects"
```

### 2. Install dependensi (sudah selesai jika clone fresh)
```bash
npm install
```

### 3. Setup database (sudah selesai jika mengikuti panduan ini)
```bash
npm run db:migrate
```
Perintah ini akan:
- Membuat file database `prisma/dev.db`
- Membuat semua tabel
- Otomatis menjalankan seed (buat akun admin + kategori default)

### 4. Jalankan development server
```bash
npm run dev
```

Buka browser: **http://localhost:3000**

---

## 🔐 Login Admin Pertama

| Field    | Value                  |
|----------|------------------------|
| Email    | `AdminCid@gmail.com`   |
| Password | `OnlyCidzzz`           |
| URL      | `/admin/login`         |

> ⚠️ **Wajib ganti password** setelah login pertama via menu **Settings**.

---

## 📁 Struktur Folder

```
portfolio-project/
├── app/
│   ├── page.tsx                  ← Halaman publik (dashboard proyek)
│   ├── layout.tsx
│   ├── globals.css
│   ├── admin/
│   │   ├── login/page.tsx        ← Login admin
│   │   ├── layout.tsx            ← Layout admin (sidebar)
│   │   ├── dashboard/page.tsx    ← Overview statistik
│   │   ├── projects/page.tsx     ← Kelola proyek
│   │   ├── categories/page.tsx   ← Kelola kategori
│   │   ├── files/page.tsx        ← Kelola file upload
│   │   ├── logs/page.tsx         ← Activity logs
│   │   └── settings/page.tsx     ← Pengaturan & ganti password
│   └── api/
│       ├── auth/                 ← login, logout, me, change-password
│       ├── portfolios/           ← CRUD proyek
│       ├── categories/           ← CRUD kategori
│       ├── upload/               ← Upload file
│       ├── files/                ← Kelola file
│       ├── activity-logs/        ← Riwayat aktivitas
│       ├── stats/                ← Statistik dashboard
│       └── settings/             ← Pengaturan website
├── components/
│   ├── admin/                    ← Komponen halaman admin
│   └── public/                   ← Komponen halaman publik
├── lib/
│   ├── prisma.ts                 ← Koneksi database
│   ├── auth.ts                   ← JWT authentication
│   ├── utils.ts                  ← Helper functions
│   └── activity.ts               ← Activity logger
├── hooks/
│   ├── useAuth.ts
│   └── useDebounce.ts
├── prisma/
│   ├── schema.prisma             ← Skema database
│   └── seed.ts                   ← Data awal (admin + kategori)
├── public/uploads/               ← File yang diupload
├── proxy.ts                      ← Proteksi route admin
├── .env                          ← Konfigurasi (jangan di-commit)
└── .env.example                  ← Contoh konfigurasi
```

---

## 🛠️ Scripts yang Tersedia

| Script | Fungsi |
|--------|--------|
| `npm run dev` | Jalankan development server |
| `npm run build` | Build production |
| `npm run start` | Jalankan production server |
| `npm run db:migrate` | Buat/update tabel database |
| `npm run db:seed` | Isi data awal ulang |
| `npm run db:studio` | Buka Prisma Studio (GUI database) |

---

## ✨ Fitur

### Halaman Publik (`/`)
- Gallery proyek dengan grid responsif (1/2/3/4 kolom)
- Search realtime dengan debounce
- Filter by kategori, tahun, urutan
- Modal detail proyek dengan galeri gambar
- Animasi staggered dengan Framer Motion
- Skeleton loading
- Pagination

### Panel Admin (`/admin/`)
- **Dashboard** — Statistik animasi + proyek & log terbaru
- **Projects** — CRUD lengkap dengan upload thumbnail & file
- **Categories** — Kelola kategori proyek
- **Files** — Manajemen semua file upload
- **Logs** — Riwayat aktivitas admin
- **Settings** — Nama website + ganti password

### Keamanan
- Password di-hash dengan bcrypt (cost 12)
- JWT token dalam HttpOnly cookie
- Proteksi route via `proxy.ts`
- Rate limiting login (10x per 15 menit)
- Validasi tipe & ukuran file upload
- Proyek draft/archived tidak tampil ke publik

---

## 🗄️ Database (SQLite)

Tabel: `users`, `portfolios`, `categories`, `portfolio_files`, `activity_logs`, `site_settings`

Untuk melihat isi database secara visual:
```bash
npm run db:studio
```

---

## 📝 Catatan Penting

- File upload tersimpan di `public/uploads/` — **jangan di-commit** ke git
- Tambahkan `public/uploads/` dan `prisma/dev.db` ke `.gitignore` untuk produksi
- Ganti `JWT_SECRET` dengan string acak panjang di production
- Gunakan PostgreSQL untuk production (ganti `provider = "sqlite"` di schema.prisma)
