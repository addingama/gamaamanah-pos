# Toko Sembako — Internal

Aplikasi web ringan untuk **cek harga** (publik, tanpa login) dan **admin** (barang, kategori, riwayat harga/stok). Stack: Next.js (App Router), TypeScript, Tailwind, Prisma + MySQL.

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
| `DATABASE_URL` | URL MySQL, contoh: `mysql://USER:PASSWORD@HOST:3306/DBNAME` |
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

## Deploy ke VPS

1. Siapkan MySQL di VPS atau server database terpisah yang bisa diakses dari aplikasi.
2. Tambahkan environment variables di server aplikasi:

```bash
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/DBNAME
AUTH_SECRET=isi-rahasia-panjang-acak
ADMIN_EMAIL=admin@domainkamu.com
ADMIN_PASSWORD_HASH=<hash-base64>
ADMIN_SESSION_DAYS=7
```

3. Install dependency, sinkronkan schema, lalu seed:

```bash
npm install
npx prisma db push
npm run prisma:seed
```

4. Build dan jalankan aplikasi:

```bash
npm run build
npm start
```

Kalau pakai reverse proxy seperti Nginx, arahkan domain ke port aplikasi Next.js yang kamu jalankan dengan process manager seperti `pm2` atau `systemd`.

## Keamanan (penggunaan internal)

- Ganti password default setelah deploy.
- Jangan commit `.env`.
- Gunakan MySQL yang dibackup berkala.
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
