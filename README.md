# Toko Sembako — Internal

Aplikasi web ringan untuk **cek harga** (publik, tanpa login) dan **admin** (barang, kategori, riwayat harga/stok). Stack: Next.js (App Router), TypeScript, Tailwind, Prisma + PostgreSQL.

## Struktur folder

| Path | Isi |
|------|-----|
| `src/app/` | Route App Router (`/`, `/admin/*`, API publik) |
| `src/components/admin/` | UI admin (nav, dialog stok, hapus) |
| `src/components/ui/` | Komponen UI kecil (input, badge) |
| `src/features/price-check/` | Halaman cek harga (publik) |
| `src/lib/` | Auth, Prisma, format, validasi Zod, skema API |
| `prisma/` | Schema, migrasi, seed |

## Prasyarat

- Node.js 20+
- npm

## Setup (production-ready lokal / VPS kecil)

1. **Install**

```bash
npm install
```

2. **Environment**

```bash
cp .env.example .env
```

Isi wajib di `.env`:

| Variabel | Keterangan |
|----------|------------|
| `DATABASE_URL` | URL PostgreSQL, contoh: `postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require` |
| `AUTH_SECRET` | String acak panjang (untuk tanda tangan JWT sesi admin) |
| `ADMIN_EMAIL` | Email login admin |
| `ADMIN_PASSWORD_HASH` | Hash bcrypt dalam **base64** (aman di .env). Generate: `node scripts/verify-admin-password.js --generate <password>` |
| `ADMIN_SESSION_DAYS` | Lama sesi (hari), default `7` |

Generate contoh:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node scripts/verify-admin-password.js --generate admin123
```

**Password admin:** Hash disimpan dalam base64 agar aman di `.env` (tanpa masalah karakter `$`).

- Cek password: `npm run verify-password -- <password-kamu>`
- Generate hash base64 untuk `.env`: `node scripts/verify-admin-password.js --generate <password-baru>`

3. **Database**

```bash
npx prisma db push
npm run prisma:seed
```

Untuk development dengan migrasi baru:

```bash
npm run prisma:migrate
npm run prisma:seed
```

4. **Build & jalankan**

```bash
npm run build
npm start
```

Development:

```bash
npm run dev
```

## Aturan bisnis (ringkas)

- **Publik `/`**: hanya menampilkan barang **aktif** (`isActive`). Harga yang ditampilkan = **harga jual**. Tidak ada harga beli di API publik.
- **Admin**: dilindungi cookie JWT + layout `requireAdminSession`. Logout `/admin/logout` dapat diakses tanpa sesi valid (untuk membersihkan cookie).
- **Harga**: setiap perubahan harga jual mencatat **PriceHistory**.
- **Stok** (status Tersedia / Menipis / Habis): perubahan dari form barang atau **ubah stok cepat** mencatat **StockHistory** dengan **jenis perubahan** (wajib di dialog cepat).
- **Kategori**: hapus kategori tidak menghapus barang; `categoryId` barang jadi kosong.

## URL penting

| URL | Keterangan |
|-----|------------|
| `/` | Cek harga |
| `/admin/login` | Login admin |
| `/admin` | Dashboard |
| `/admin/products` | Daftar & ubah stok cepat |
| `/admin/categories` | Kategori |
| `/admin/price-history` | Riwayat harga |
| `/admin/stock-history` | Riwayat stok |

## Deploy ke Vercel

1. Buat database PostgreSQL. Paling praktis pakai **Vercel Postgres**, **Neon**, atau **Supabase**.
2. Import repository project ini ke Vercel.
3. Tambahkan environment variables di Vercel:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require
AUTH_SECRET=isi-rahasia-panjang-acak
ADMIN_EMAIL=admin@domainkamu.com
ADMIN_PASSWORD_HASH=<hash-base64>
ADMIN_SESSION_DAYS=7
```

4. Saat deploy, Vercel akan menjalankan `npm install`, `npx prisma db push`, lalu `npm run build`.
5. Setelah deployment pertama berhasil, isi data awal ke database production dengan:

```bash
npm run prisma:seed
```

Kalau kamu ingin seed dari lokal ke database Vercel, pastikan `.env` lokal berisi `DATABASE_URL` production yang sama lalu jalankan:

```bash
npm run prisma:seed
```

Catatan: SQLite tidak direkomendasikan di Vercel untuk data yang berubah karena filesystem function tidak persisten.

## Keamanan (penggunaan internal)

- Ganti password default setelah deploy.
- Jangan commit `.env`.
- Gunakan PostgreSQL managed dan backup berkala.
- Untuk akses dari internet, gunakan HTTPS dan batasi jaringan (VPN / IP allowlist) bila perlu.

## Skrip npm

| Skrip | Fungsi |
|-------|--------|
| `npm run dev` | Server pengembangan |
| `npm run build` | Build produksi |
| `npm start` | Jalankan hasil build |
| `npm run lint` | ESLint |
| `npm run prisma:migrate` | Migrasi development |
| `npm run prisma:deploy` | Sinkron schema production (`prisma db push`) |
| `npm run prisma:seed` | Isi data awal |
| `npm run prisma:generate` | Generate client Prisma |

## Lisensi

Penggunaan internal proyek Anda.
