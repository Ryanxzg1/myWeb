# CONTEX.md — Entry Point

> Titik masuk untuk sesi kerja ini. Baca file ini dulu, lalu ikuti tautan ke dokumen detail.
> Jangan menduplikasi isi dokumen detail di sini — file ini hanya peta dan status.

---

## 1. Apa Proyek Ini

Website personal (portofolio) dwibahasa ID/EN untuk memperkenalkan pemilik: profil, pengalaman, project, skill, dan cara menghubungi. Seluruh konten dikelola lewat panel admin custom tanpa menyentuh kode. Single-admin, repo publik, biaya operasional Rp0 (seluruh layanan free tier tanpa kartu).

---

## 2. Peta Dokumentasi

| Dokumen | Isi | Kapan dibaca |
| --- | --- | --- |
| [`PRD.md`](./PRD.md) | Sumber kebenaran produk: requirement, data model, NFR, acceptance criteria, timeline | Sebelum mengerjakan fitur apa pun |
| [`docs/adr/0001-stack-nextjs-vercel.md`](./docs/adr/0001-stack-nextjs-vercel.md) | Keputusan arsitektur: kenapa Next.js + Vercel + Neon + Cloudinary + Resend | Saat mempertanyakan pilihan stack |
| [`docs/ui-ux-prompt.md`](./docs/ui-ux-prompt.md) | Playbook prompt UX Pilot + urutan pakai + checklist evaluasi | Saat generate/refine desain |
| [`docs/design-review.md`](./docs/design-review.md) | Temuan QC desain terhadap 7 artboard + status perbaikan | Saat mulai implementasi UI |
| [`docs/qe-remediation.md`](./docs/qe-remediation.md) | Temuan QE Fase 4 + akar masalah + perbaikan + lesson learned | Sebelum mengubah route handler / rate limit |
| `docs/generated-uiux/*.png` | 7 artboard hasil UX Pilot (01-home … 07-admin-inbox) | Saat implementasi komponen |
| `AGENTS.md` | Blok aturan Next.js — **dikelola ulang oleh `next dev`**, jangan diedit manual | — |

Dokumen yang belum ada (buat saat dibutuhkan): `docs/deployment.md`, `docs/api-contracts.md`.

---

## 3. Stack Aktif

| Layer | Pilihan | Versi terpasang |
| --- | --- | --- |
| Framework | Next.js (App Router) | 16.4.0 |
| UI runtime | React | 19.3.0 |
| Styling | Tailwind CSS v4 (loader `@tailwindcss/turbopack`) | 4.x |
| Database | Neon Postgres | — |
| ORM | Prisma + `@prisma/adapter-pg` | 7.10.0 |
| Media | Cloudinary | 2.x |
| Email | Resend | 6.x |
| Anti-spam | Cloudflare Turnstile | — |
| i18n | next-intl | 4.14.9 |
| Tema | next-themes | 0.4.6 |
| Validasi | zod | 4.x |
| Rich text | Tiptap | 3.x |
| Reorder | dnd-kit | 6.x / 10.x |
| Sanitasi HTML | isomorphic-dompurify | 3.x |
| Test | Vitest | 4.x |
| Hosting | Vercel Hobby | — |

Alasan pemilihan ada di ADR-0001.

---

## 4. Status Saat Ini

| Fase | Isi | Status |
| --- | --- | --- |
| Fase 1 | Scaffold Next.js + wiring Prisma/Vercel/Cloudinary/Resend + token tema | ✅ selesai |
| Fase 2 | Skema Prisma (9 tabel) + SQL migrasi + seed | ✅ selesai |
| Fase 3 | Service logic: auth/OTP, session, email, kontak, rate limit, sanitasi | ✅ selesai |
| Fase 4 | API Route Handlers (`/api/auth/*`, `/api/contact`) + remediasi 8 temuan QE | ✅ selesai |
| Fase 5 | i18n routing `[locale]` + `next-themes` (no-flash) + guard admin di `proxy.ts` | ✅ selesai |
| Fase 5b | Remediasi temuan QC Fase 5 yang tervalidasi (cache, guard, kontras, regression guard) | ✅ selesai |
| Fase 6 | Implementasi UI publik & admin sesuai artboard | ⬜ belum |

**Database belum terhubung.** `DATABASE_URL` di `.env.local` masih placeholder, jadi `prisma migrate` dan `seed` belum pernah dijalankan.

**Halaman masih placeholder.** Fase 5 hanya memasang fondasi routing/tema. Isi halaman publik dan panel admin dibangun di Fase 6.

---

## 5. Verifikasi Terakhir

- `npm test` → 13 suite, 72 test lulus
- `npm run typecheck` → 0 error
- `npm run build` → sukses
- Smoke test dev server (Fase 5):
  - `GET /` → 200, `<html lang="id">`, konten ID
  - `GET /` + `Accept-Language: en` → 307 → `/en`
  - `GET /en` → 200, `<html lang="en">`, konten EN
  - `GET /admin` tanpa cookie sesi → 307 → `/admin/login?next=%2Fadmin`
  - `GET /admin/login` → 200
  - `GET /apa-saja` → 404 (validasi locale runtime)
  - `GET /foo/bar` → 404 (`global-not-found`)
  - Inline script anti-flash next-themes ada di `<head>`
- Smoke test produksi (`next start`, remediasi Fase 5b):
  - `GET /` → 200, `Cache-Control: private, no-store` (sebelumnya `s-maxage=31536000`)
  - `GET /en` → 200, `Cache-Control: s-maxage=31536000` (tetap cacheable, deterministik per URL)
  - `GET /admin` → 307 ke login + `Cache-Control: private, no-store, max-age=0, must-revalidate`
  - `GET /admin/login` → 200 + `Cache-Control: private, no-store, max-age=0, must-revalidate`
  - `GET /admin/x.y` → 307 ke login (sebelumnya 404 karena proxy dilewati matcher)
  - hreflang di HTML kini absolut (`http://localhost:3000/`, `/en`) berkat `metadataBase`

Jalankan ketiganya sebelum menandai pekerjaan selesai.

---

## 6. Struktur Kode

```
app/
  [locale]/                 # ROOT LAYOUT publik (bukan app/layout.tsx)
    layout.tsx              # generateStaticParams, lang, hreflang, NextIntlClientProvider
    page.tsx                # placeholder Fase 5
    not-found.tsx           # 404 dalam konteks locale
  admin/                    # ROOT LAYOUT kedua, di luar locale
    layout.tsx              # shell admin (robots noindex)
    page.tsx                # placeholder Fase 5 (butuh sesi)
    login/page.tsx          # placeholder Fase 5 (dikecualikan dari guard)
  global-not-found.tsx      # 404 untuk URL tak cocok route mana pun
  api/
    auth/login/route.ts     # POST login step 1 (kredensial + kirim OTP)
    auth/verify/route.ts    # POST login step 2 (verifikasi OTP + cookie session)
    auth/logout/route.ts    # POST logout (clear cookie session)
    contact/route.ts        # POST pesan kontak (Turnstile + honeypot + rate limit)
  globals.css               # token tema (light/dark berbasis kelas `.dark`)
proxy.ts                    # i18n routing + guard admin (optimistic) + no-store untuk path tanpa prefix
vitest.setup.ts             # penjaga test: akses Prisma langsung gagal
vitest.setup.test.ts        # memverifikasi penjaga itu benar-benar aktif
i18n/
  routing.ts                # defineRouting + augmentasi Locale & Messages next-intl
  request.ts                # getRequestConfig via next/root-params + resolveMessages (diekspor untuk test)
  routing.test.ts           # konfigurasi + paritas katalog pesan ID/EN
  request.test.ts           # resolveMessages: locale valid / invalid / berbahaya
  navigation.ts             # Link/usePathname/useRouter sadar-locale
messages/
  id.json                   # pesan ID (placeholder Fase 5)
  en.json                   # pesan EN (placeholder Fase 5)
components/
  shell/root-shell.tsx      # <html>/<body>/font/ThemeProvider bersama 2 root layout
  theme/theme-provider.tsx  # next-themes, class-based, default system
  theme/theme-toggle.tsx    # siklus terang -> gelap -> sistem
  i18n/locale-switcher.tsx  # pindah bahasa di halaman yang sama
lib/
  db.ts                     # Prisma client singleton + adapter pg
  types.ts                  # Locale, Localized, LOCALES, DEFAULT_LOCALE
  auth/password.ts          # hash/verify scrypt (stdlib)
  auth/temp-token.ts        # temporary HMAC token Step 1 -> Step 2 + maskEmail
  auth/session.ts           # signed session token HMAC-SHA256
  auth/service.ts           # kredensial, OTP, rate limit login & verify
  auth/admin-path.ts        # sumber kebenaran path panel admin
  email/resend.ts           # OTP + notifikasi kontak (escape HTML)
  contact/service.ts        # validasi zod, Turnstile, honeypot, simpan, rate limit
  content/sanitizer.ts      # sanitasi rich text + revalidateTag
  security/rate-limit.ts    # sliding window + hash IP
  security/ip.ts            # ekstraksi IP klien terpusat (x-real-ip prioritas)
  generated/prisma/         # hasil `prisma generate` (gitignored)
prisma/
  schema.prisma             # 9 model
  migrations/0_init/        # SQL migrasi awal
  seed.ts                   # konten demo
docs/                       # dokumentasi (lihat peta di atas)
```

---

## 7. Aturan Teknis Keras (jangan dilanggar)

Aturan ini spesifik untuk versi yang terpasang — berbeda dari Next.js/Prisma pada umumnya.

**Next.js 16:**
- `cacheComponents: true` dan `partialPrefetching: true` aktif. Model cache memakai direktif `use cache` / `cacheLife` / `cacheTag` — bukan cache `fetch` lama.
- `revalidateTag(tag, profile)` **wajib dua argumen** (mis. `revalidateTag(tag, "max")`). Satu argumen memicu deprecation warning.
- Middleware bernama **`proxy.ts`**, bukan `middleware.ts`. Runtime default-nya Node.js.
- Route props bertipe: `PageProps<'/route'>` dan `LayoutProps<'/'>`.
- `dynamicParams = false` **tidak kompatibel** dengan Cache Components. Validasi locale dilakukan runtime di `i18n/request.ts` lewat `notFound()`.
- `generateStaticParams` **wajib** di root layout `[locale]`, kalau tidak build gagal.
- `app/layout.tsx` **tidak boleh ada**. Root layout ada di `app/[locale]/layout.tsx` dan `app/admin/layout.tsx`; dua-duanya wajib mendefinisikan `<html>`/`<body>` (diekstrak ke `RootShell`).
- Tailwind v4 memakai token CSS-first (`@theme`) di `app/globals.css`; tidak ada `tailwind.config.js`.

**next-intl 4:**
- Locale dibaca lewat **`next/root-params`**, bukan `requestLocale` (deprecated) atau `setRequestLocale` (legacy).
- Plugin resmi `next-intl/plugin` **tidak dipakai**. Sebagai gantinya alias `next-intl/config` → `./i18n/request.ts` dipasang manual di `next.config.ts` (`turbopack.resolveAlias`). Lihat bagian 11.
- `next/root-params` belum didukung di Route Handler dan Server Action. Kalau butuh terjemahan di sana, oper `locale` eksplisit ke `getTranslations({ locale })`.

**next-themes 0.4:**
- Tema berbasis kelas `.dark` di `<html>`, bukan media query OS. Varian Tailwind `dark:` diarahkan ulang lewat `@custom-variant dark (&:where(.dark, .dark *))` di `app/globals.css`.
- `<html>` wajib punya `suppressHydrationWarning` (sudah ada di `RootShell`).

**Prisma 7:**
- **Driver adapter wajib.** Client harus diinisialisasi dengan `PrismaPg`, bukan tanpa adapter.
- Generator `prisma-client` dengan `output` eksplisit ke `lib/generated/prisma`.
- Konfigurasi ada di `prisma7.config.ts` (memuat `.env.local`), bukan di `package.json`.
- `prisma generate` harus dijalankan ulang setiap kali `schema.prisma` berubah.

**Umum:**
- `DATABASE_URL` wajib ada; `lib/db.ts` fail-fast jika kosong.
- Variabel yang dipakai di browser harus berprefix `NEXT_PUBLIC_` (contoh: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`).
- Semua input pengunjung yang masuk ke email HTML harus lewat `escapeHtml`.
- Rich text dari admin harus lewat `sanitizeRichText` sebelum disimpan.
- **Dilarang floating promise di route handler.** Semua I/O (email, DB cleanup) wajib `await`-ed di dalam `try/catch`, meski kegagalannya tidak fatal — serverless bisa terminate sebelum promise selesai.
- Ekstraksi IP klien wajib lewat `lib/security/ip.ts`, bukan baca header `x-forwarded-for` langsung.
- Rate limiter wajib punya namespace key per alur (mis. `login:` vs `verify:`), jangan berbagi pool.
- Status HTTP error ditentukan dari `errorCode` machine-readable, bukan dari pencocokan string pesan error.
- **Guard di `proxy.ts` hanya optimistic check.** Setiap Server Component dan Server Action di bawah `/admin` WAJIB memverifikasi sesi sendiri sebelum membaca atau menulis data. Jangan pernah mengandalkan proxy sebagai satu-satunya penjaga.
- Path panel admin diambil dari `lib/auth/admin-path.ts`, jangan menulis `/admin` literal di tempat lain.
- `ADMIN_PATH` divalidasi terhadap `^[a-z0-9][a-z0-9-]*$` saat boot. Nilai tidak valid menggagalkan start, bukan diam-diam jatuh ke default — salah jaga path jauh lebih berbahaya daripada gagal boot.
- Pengecualian halaman publik admin ditulis eksplisit di `lib/auth/admin-path.ts`. `isAdminLoginPath` adalah exact match; jangan pakai `startsWith` untuk membebaskan path dari guard.
- Parameter `?next=` wajib lewat `isSafeNextPath` sebelum dipakai redirect balik.
- `/admin/*` dipaksa `Cache-Control: private, no-store` lewat `next.config.ts`. Jangan hapus: halaman admin masih diprerender statis, dan tanpa aturan itu Next melayaninya dengan `s-maxage` publik.
- Header `Vary` yang disetel di `proxy.ts` **ditimpa** Next.js saat menyusun respons akhir (terverifikasi hilang di respons `/`). Untuk menandai respons yang bergantung pada header permintaan, pakai `Cache-Control`, bukan `Vary`.
- Katalog pesan ID adalah bentuk kanonik (`Messages` di `i18n/routing.ts`). Paritas key ID/EN dijaga test di `i18n/routing.test.ts` — tambah key di kedua file sekaligus.
- `metadataBase` diambil dari `NEXT_PUBLIC_SITE_URL`. Tanpa itu hreflang/canonical dikirim relatif dan tidak konsisten dengan header `Link`.
- `next/root-params` hanya punya nilai di dalam segmen `[locale]`. Route di luar segmen itu (termasuk seluruh `/admin/*`) akan menghasilkan `undefined` dan berakhir di `notFound()`. Untuk terjemahan admin, suplai `messages` eksplisit ke `NextIntlClientProvider`.
- Test dilarang menyentuh database sungguhan. `vitest.setup.ts` memasang Prisma yang langsung melempar; mock modul pemanggilnya kalau butuh menguji jalur data.
- Presedensi meta title/description: pengaturan admin (FR-ADM-7) menang; `messages.metadata.*` hanya fallback. Jangan biarkan `messages` menimpa nilai yang sudah diisi admin.

---

## 8. Perintah

```bash
npm run dev          # dev server
npm run build        # build produksi
npm run typecheck    # tsc --noEmit
npm test             # vitest run
npm run db:generate  # prisma generate
npm run db:migrate   # prisma migrate dev (butuh DATABASE_URL asli)
npm run db:deploy    # prisma migrate deploy (produksi)
npm run db:seed      # isi konten demo
npm run db:studio    # prisma studio
```

---

## 9. Environment Variables

Salin `.env.example` → `.env.local`. Semua rahasia lewat environment variable, tidak ada yang di-commit.

`DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PATH` (opsional), `NEXT_PUBLIC_SITE_URL` (domain publik untuk `metadataBase`; fallback lokal `http://localhost:3000`), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `RESEND_API_KEY`, `MAIL_FROM`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.

Catatan dev: jika `RESEND_API_KEY` kosong, kode OTP dicetak ke terminal, bukan dikirim email.

Catatan dev: jika `AUTH_SECRET` kosong atau kurang dari 32 karakter, `proxy.ts` menelan error-nya dan mengalihkan semua request `/admin` ke halaman login. Ini perilaku yang disengaja, bukan bug.

---

## 10. Langkah Berikutnya

1. **Fase 6** — Implementasi UI publik & admin mengikuti `docs/generated-uiux/`, dengan temuan di `docs/design-review.md` sebagai koreksi yang menang jika bertentangan.
2. Isi kredensial asli (Neon, Cloudinary, Resend, Turnstile) lalu `db:migrate` + `db:seed`.
3. Dokumentasi tertunda: `docs/deployment.md`, `docs/api-contracts.md`.

---

## 11. Kendala Environment yang Diketahui

**`@swc/core` gagal memuat native binding di mesin ini.**

```
SWC native addon: validate cache root /home/ryan/.cache:
cache root has a parent writable by another user without trusted sticky protection
```

Penyebab: `/home/ryan/.cache` bermode `drwxrwxr-x` (group-writable). SWC menolak mematerialisasi binding-nya di bawah direktori seperti itu.

Dampak: setiap tool yang memuat `@swc/core` akan gagal — termasuk `next-intl/plugin`, karena `@swc/core` adalah dependensi langsung next-intl.

Mitigasi yang sudah diterapkan: plugin next-intl tidak dipakai, alias `next-intl/config` dipasang manual di `next.config.ts`. Jalur build saat ini tidak menyentuh `@swc/core`.

Perbaikan tuntas (opsional, di luar repo):

```bash
chmod 755 /home/ryan/.cache
```

Kalau nanti memakai fitur message extraction next-intl (`experimental.extract` / `experimental.messages`), plugin resmi kembali diperlukan dan izin cache di atas harus dibereskan lebih dulu.
