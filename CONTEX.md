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
| i18n | next-intl | 4.x |
| Tema | next-themes | 0.4.x |
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
| Fase 4 | API Route Handlers (`/api/auth/*`, `/api/contact`) | ✅ selesai |
| Fase 5 | i18n routing (`[locale]`) + wiring `next-themes` | ⬜ belum |
| Fase 6 | Implementasi UI publik & admin sesuai artboard | ⬜ belum |

**Database belum terhubung.** `DATABASE_URL` di `.env.local` masih placeholder, jadi `prisma migrate` dan `seed` belum pernah dijalankan.

---

## 5. Verifikasi Terakhir

- `npm test` → 9 suite, 44 test lulus
- `npm run typecheck` → 0 error
- `npm run build` → sukses

Jalankan ketiganya sebelum menandai pekerjaan selesai.

---

## 6. Struktur Kode

```
app/
  [locale]/                 # publik (belum diisi)
  admin/                    # panel admin (belum diisi)
  api/
    auth/login/route.ts     # POST login step 1 (kredensial + kirim OTP)
    auth/verify/route.ts    # POST login step 2 (verifikasi OTP + cookie session)
    auth/logout/route.ts    # POST logout (clear cookie session)
    contact/route.ts        # POST pesan kontak (Turnstile + honeypot + rate limit)
  globals.css               # token tema
lib/
  db.ts                     # Prisma client singleton + adapter pg
  types.ts                  # Locale, Localized
  auth/password.ts          # hash/verify scrypt (stdlib)
  auth/temp-token.ts        # temporary HMAC token Step 1 -> Step 2 + maskEmail
  auth/session.ts           # signed session token HMAC-SHA256
  auth/service.ts           # kredensial, OTP, rate limit login
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
- Middleware bernama **`proxy.ts`**, bukan `middleware.ts`.
- Route props bertipe: `PageProps<'/route'>` dan `LayoutProps<'/'>`.
- Tailwind v4 memakai token CSS-first (`@theme`) di `app/globals.css`; tidak ada `tailwind.config.js`.

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

`DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `RESEND_API_KEY`, `MAIL_FROM`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`.

Catatan dev: jika `RESEND_API_KEY` kosong, kode OTP dicetak ke terminal, bukan dikirim email.

---

## 10. Langkah Berikutnya

1. **Fase 5** — Routing `[locale]` (next-intl) + wiring `next-themes` (no-flash) + proxy auth middleware.
2. **Fase 6** — Implementasi UI publik & admin mengikuti `docs/generated-uiux/`, dengan temuan di `docs/design-review.md` sebagai catatan yang belum diperbaiki.
3. Isi kredensial asli (Neon, Cloudinary, Resend, Turnstile) lalu `db:migrate` + `db:seed`.
