# PRD — Personal Website

Versi 2.1 (MVP) · Status: Draft untuk review · Stack: Next.js (App Router) di Vercel + Neon Postgres (Prisma) + Cloudinary + Resend

> **Perubahan dari v1.0:** Stack berpindah dari Laravel + Filament ke Next.js + Vercel. Alasan: pemilik tidak memiliki hosting/VPS dan tidak dapat memperoleh kartu kredit (usia < 21 tahun) maupun kartu debit untuk verifikasi penyedia free tier berbasis VM (Oracle/GCP). Seluruh stack **bebas kartu dan berbiaya Rp0**. Panel admin dibangun custom (Filament dibatalkan).
>
> **Perubahan v2.0 → v2.1:** Database berpindah dari MongoDB Atlas (Mongoose) ke Neon Postgres (Prisma) — pemilik sudah memiliki akun Neon. Detail di `docs/adr/0001-stack-nextjs-vercel.md`.

## 1. Overview

Website personal untuk memperkenalkan pemilik: siapa dia, pengalaman, project, dan skill, lalu mengarahkan pengunjung ke GitHub, LinkedIn, atau form kontak. Seluruh isi diubah lewat panel admin custom tanpa menyentuh kode. Single-admin, publik (situs dan repo), dwibahasa ID/EN.

## 2. Problem Statement

- Konten yang tertanam di kode membuat setiap perubahan teks atau project butuh coding dan deploy ulang.
- Belum ada satu tempat resmi yang merangkum profil, project, dan cara menghubungi untuk HR dan klien.
- Calon pemberi kerja dan klien datang dari konteks lokal maupun internasional, jadi butuh dua bahasa.
- Tanpa SEO yang baik, web tidak ditemukan saat nama pemilik dicari.
- Pemilik tidak punya infrastruktur (VPS/hosting berbayar) dan tidak bisa memakai free tier berbasis VM karena verifikasi kartu. Solusi harus jalan tanpa kartu dan tanpa biaya.

## 3. Goals & Success Metrics

| Goal | Metric | Target |
| --- | --- | --- |
| Branding profesional | Web siap dipasang di LinkedIn dan CV | Live di domain sendiri dalam 5 minggu |
| Konten mandiri | Waktu dari simpan di admin sampai tampil di publik | Kurang dari 1 menit, tanpa deploy |
| Mudah dihubungi | Form kontak berfungsi end-to-end | Pesan tersimpan di admin dan email notifikasi terkirim; spam terfilter |
| Mudah ditemukan | SEO teknis lengkap | Lighthouse SEO ≥ 95; sitemap, hreflang, OG valid |
| Cepat | Performa halaman publik | Lighthouse Performance ≥ 90 (desktop); LCP < 2,5 detik |
| Aman | Akses admin terlindungi | Tidak ada akses admin tanpa password dan kode email (diverifikasi test) |
| Biaya | Total biaya operasional | Rp0 — seluruh layanan memakai free tier tanpa kartu |
| Kualitas portfolio | Feature test untuk flow kritis | Auth admin, kontak, draft/publish, i18n ter-cover |

## 4. Target Users

1. Pemilik (admin): mengelola seluruh konten.
2. HR / recruiter: scan cepat 1–2 menit untuk tahu siapa dia, pengalaman, project, dan cara menghubungi.
3. Klien potensial: ingin menilai kemampuan dan menghubungi.
4. Pengunjung umum dan sesama developer.

Prinsip: pengunjung harus paham siapa pemilik dan cara menghubunginya dalam kurang dari 30 detik, tanpa instruksi.

## 5. Scope MVP

1. Situs publik (halaman utama berseksi + detail project)
2. Dwibahasa ID/EN dengan toggle
3. Dark/light mode
4. Panel admin custom: konten dan pengaturan umum
5. Auth admin: password + kode email
6. Draft/publish, preview, dan urutan konten
7. Upload media dan CV
8. Form kontak + inbox admin + notifikasi email
9. SEO teknis

Catatan: blog tidak termasuk; menu blog mengarah ke web eksternal.

## 6. Functional Requirements

### 6.1 Situs Publik

- FR-PUB-1 Halaman utama berisi section: Hero, About, Pengalaman, Project, Skill, Kontak. Footer berisi link sosial.
- FR-PUB-2 Hero: nama, headline, sub-headline, CTA ke GitHub dan LinkedIn, tombol download CV, dan tombol Hubungi.
- FR-PUB-3 Project tampil sebagai kartu (cover, judul, ringkasan, tech stack, link demo/repo). Halaman detail /projects/{slug} berisi deskripsi lengkap dan galeri.
- FR-PUB-4 Hanya konten berstatus published yang tampil. Draft diakses publik mengembalikan 404.
- FR-PUB-5 Link blog menuju URL eksternal dari pengaturan umum, dibuka di tab baru.
- FR-PUB-6 Halaman 404 dan error mengikuti gaya situs.
- FR-PUB-7 Desktop-first, responsive sampai lebar 360px tanpa horizontal scroll.
- FR-PUB-8 Semua halaman publik dirender di server (SSR/SSG) sehingga konten tidak bergantung pada JavaScript.

### 6.2 Bahasa & Tema

- FR-I18N-1 Dua bahasa: ID (default) di /, EN di /en.
- FR-I18N-2 Toggle di header pindah ke halaman yang sama pada bahasa lain; pilihan diingat (cookie).
- FR-I18N-3 Semua teks yang diedit di admin punya versi ID dan EN. Jika EN kosong, fallback ke ID dan admin diberi penanda.
- FR-I18N-4 Atribut html lang dan hreflang sesuai bahasa.
- FR-THEME-1 Dark/light toggle; default mengikuti prefers-color-scheme; pilihan diingat; tanpa flash saat load.

### 6.3 Panel Admin (custom)

- FR-ADM-1 Panel di path yang bisa dikonfigurasi (default /admin), hanya untuk satu akun.
- FR-ADM-2 Tidak ada route register. Akun admin dibuat lewat seed script.
- FR-ADM-3 Kelola Profil: nama, headline, sub-headline, bio About (rich text), foto profil.
- FR-ADM-4 CRUD Pengalaman: perusahaan, posisi, periode, lokasi, deskripsi; mendukung status saat ini (tanpa tanggal akhir).
- FR-ADM-5 CRUD Project: judul, slug, ringkasan, deskripsi, tech stack, link demo, link repo, cover, galeri, featured.
- FR-ADM-6 CRUD Skill dengan grup (mis. Backend, Frontend, Infra, AI).
- FR-ADM-7 Pengaturan umum: nama situs, tagline, link GitHub/LinkedIn, email publik, URL blog eksternal, CV per bahasa, gambar OG default, meta title/description default per bahasa, toggle analytics.
- FR-ADM-8 Status draft/published pada Project dan Pengalaman, plus preview draft khusus admin.
- FR-ADM-9 Urutan Project, Pengalaman, dan Skill diatur dari admin (input urutan; drag-and-drop sebagai peningkatan).
- FR-ADM-10 Perubahan yang dipublikasikan langsung tampil di publik (ISR di-invalidate otomatis via `revalidateTag`).
- FR-ADM-11 Konfirmasi sebelum menghapus.
- FR-ADM-12 Rich text disanitasi di server sebelum disimpan (whitelist HTML).

### 6.4 Auth Admin

- FR-AUTH-1 Login dengan email dan password.
- FR-AUTH-2 Setelah password benar, sistem mengirim kode sekali pakai ke email admin; login selesai setelah kode valid.
- FR-AUTH-3 Kode berlaku singkat (config, default 10 menit), sekali pakai, disimpan dalam bentuk hash, dan percobaan dibatasi. Kode kedaluwarsa dibersihkan (filter `expires_at` saat verifikasi + penghapusan berkala saat login atau Vercel Cron).
- FR-AUTH-4 Rate limit pada login dan verifikasi kode; lockout sementara setelah gagal berulang.
- FR-AUTH-5 Reset password via email tanpa membocorkan apakah email terdaftar.
- FR-AUTH-6 Session idle timeout dan logout aman (cookie httpOnly, secure).
- FR-AUTH-7 Jalur pemulihan jika email gagal atau terkunci: seed script / maintenance command yang dijalankan lokal dengan akses environment.

### 6.5 Media

- FR-MED-1 Upload gambar (jpg, png, webp) dan PDF (CV); validasi MIME type dan ukuran maksimum (di config).
- FR-MED-2 Gambar dioptimasi otomatis: konversi WebP, beberapa ukuran responsif, lazy loading kecuali di atas fold.
- FR-MED-3 Alt text per gambar (per bahasa).
- FR-MED-4 Nama file di-randomize dan disimpan di layanan eksternal (Cloudinary) yang tidak mengeksekusi kode.

### 6.6 Kontak

- FR-CON-1 Form: nama, email, pesan (subjek opsional); validasi server-side.
- FR-CON-2 Proteksi spam berlapis: Cloudflare Turnstile, rate limit per IP (hash), dan honeypot.
- FR-CON-3 Pesan tersimpan di database dan tampil di inbox admin (belum dibaca/sudah dibaca, hapus).
- FR-CON-4 Email notifikasi ke admin untuk setiap pesan baru. Pengiriman email dilakukan secara sinkron di dalam request handler; kegagalan email tidak menggagalkan penyimpanan pesan dan di-log dengan konteks.
- FR-CON-5 Pesan sukses/gagal jelas; input tidak hilang saat validasi gagal.
- FR-CON-6 Isi pesan selalu di-escape di admin dan email (tidak ada HTML mentah).

### 6.7 SEO & Analytics

- FR-SEO-1 Title, meta description, canonical per halaman per bahasa; default dari pengaturan, bisa di-override per project.
- FR-SEO-2 Open Graph dan Twitter Card dengan gambar OG default.
- FR-SEO-3 sitemap.xml (termasuk varian bahasa) dan robots.txt; area admin tidak terindeks.
- FR-SEO-4 hreflang antara ID dan EN.
- FR-SEO-5 JSON-LD tipe Person pada halaman utama.
- FR-SEO-6 Semua halaman publik dirender di server; konten tidak bergantung pada JavaScript.
- FR-SEO-7 Analytics memakai Cloudflare Web Analytics (tanpa cookie), bisa dimatikan dari pengaturan.

## 7. User Flow

A. HR/klien: link LinkedIn → halaman utama → scan Hero, About, Project → klik GitHub/LinkedIn atau Hubungi → isi form kontak → pesan terkirim.

B. Ganti bahasa: toggle EN → halaman yang sama dalam bahasa Inggris.

C. Admin ubah konten: login → kode email → dashboard → edit project → simpan draft → preview → publish → tampil di publik.

D. Admin baca pesan: email notifikasi → inbox admin → tandai dibaca.

E. Ganti CV: Pengaturan → upload CV baru → tombol download di publik otomatis mengarah ke file baru.

## 8. Data Model (konseptual)

Database: **PostgreSQL (Neon)**. Skema didefinisikan di `schema.prisma` dan diterapkan lewat `prisma migrate`. Field teks yang diterjemahkan disimpan sebagai kolom **`jsonb`** bertipe `{ id, en }`, ditandai (t). Enum status draft/published memakai `enum` Postgres.

- **users** (1 admin): id, email (unique), password_hash, name, created_at, updated_at.
- **login_codes**: id, user_id (FK, on delete cascade), code_hash, expires_at, attempts, used_at. Index pada expires_at; baris kedaluwarsa dibersihkan saat verifikasi/login.
- **site_settings** (satu baris): id, site_name, tagline (t), github_url, linkedin_url, public_email, blog_url, cv_id_path, cv_en_path, og_image, default_meta_title (t), default_meta_description (t), analytics_enabled.
- **profiles** (satu baris): id, name, headline (t), subheadline (t), about (t), avatar.
- **experiences**: id, company, role (t), description (t), location, started_at, ended_at (nullable), current, status (enum), published_at, sort_order. Index: (status, sort_order).
- **projects**: id, slug (unique), title (t), summary (t), description (t), tech_stack (text[]), demo_url, repo_url, cover, gallery (jsonb), is_featured, status (enum), published_at, sort_order, meta override (jsonb, nullable). Index: (status, sort_order).
- **skills**: id, name, group, sort_order.
- **contact_messages**: id, name, email, subject (nullable), message, read_at (nullable), created_at. IP tidak disimpan mentah (hanya hash untuk rate limit, jika disimpan).
- **media**: id, public_id (Cloudinary), url, width, height, alt (t).

## 9. Non-Functional Requirements

### Security

- Admin hanya bisa diakses setelah password dan kode email valid; tidak ada route register.
- Validasi input dengan skema zod (setara Form Request); mass assignment tidak relevan (driver terstruktur).
- Rich text disanitasi di server (whitelist) sebelum disimpan; tidak ada render HTML mentah dari input pengunjung.
- Upload divalidasi MIME dan ukuran; file disimpan di layanan eksternal yang tidak mengeksekusi kode.
- Proteksi XSS/CSRF bawaan framework + sanitasi; security headers (CSP, HSTS, X-Frame-Options) dikonfigurasi lewat config Vercel/Next.
- Secret hanya lewat environment variable (Vercel Project Settings). Repo publik: ada .env.example, tidak ada secret, upload, atau dump database di git.
- Rate limit: login, verifikasi kode, reset password, form kontak.

### Performance

- Lighthouse desktop: Performance ≥ 90, SEO ≥ 95, Accessibility ≥ 90.
- Halaman publik memakai ISR/SSG dan di-invalidate saat konten berubah (`revalidateTag`); aset lewat CDN Vercel.
- Tidak ada N+1 query; font self-hosted dengan font-display swap; gambar responsif via Cloudinary.

### Accessibility

- Kontras minimal WCAG AA di kedua tema; navigasi keyboard penuh; focus state terlihat.
- Hormati prefers-reduced-motion; animasi tidak boleh menghalangi konten atau CTA.

### Reliability

- Kegagalan email tidak memblokir penyimpanan pesan atau login flow lain (kecuali kode login, yang ada jalur pemulihan).
- Backup data: ekspor database Neon berkala (mis. `pg_dump` manual/terjadwal); media tersimpan di Cloudinary.

### Maintainability

- Business logic di lib/service layer, bukan di komponen UI atau route handler langsung.
- Threshold dan batas (masa berlaku kode, ukuran upload, rate limit) di config/environment.
- Seed script konten demo (bukan data pribadi asli), README jelas.

## 10. Technical Constraints & Stack

| Layer | Pilihan | Alasan |
| --- | --- | --- |
| Framework | Next.js (App Router) | SSR/SSG native (SEO terbaik), API route menyatu, rumahnya Vercel |
| Hosting | Vercel Hobby | Gratis, tanpa kartu, CDN + SSL bawaan; situs personal non-komersial memenuhi syarat |
| Database | Neon Postgres (free tier) | Gratis, tanpa kartu, akun sudah dimiliki pemilik; Postgres matang |
| ORM | Prisma | Skema deklaratif + `migrate` + client type-safe memangkas kode CRUD admin |
| Admin | Custom (route /admin) | Filament dibatalkan bersama Laravel; admin dibangun dalam Next.js |
| Publik | React Server Components + Tailwind CSS | Server-render, bundle kecil, bebas desain unik |
| Animasi | CSS dan library animasi ringan seperlunya | Efek berbeda tanpa membebani performa |
| i18n | next-intl + routing segment `[locale]` | Konten per bahasa, URL terpisah untuk SEO |
| Media | Cloudinary | Konversi WebP dan ukuran responsif otomatis, penyimpanan eksternal |
| Cache | ISR + `revalidateTag` saat simpan | Halaman publik cepat, update instan |
| Email | Resend | Email transaksional gratis, API sederhana; dikirim sinkron (tanpa worker) |
| Anti-spam | Cloudflare Turnstile + honeypot + rate limit | Gratis, ringan |
| Edge | Vercel (CDN, SSL) + Cloudflare (DNS, Web Analytics) | SSL/CDN dari Vercel; Cloudflare untuk DNS dan analytics tanpa cookie |
| Testing | Vitest (unit) + Playwright (e2e) | Bukti kualitas untuk repo publik |

Alternatif yang dipertimbangkan:

- **Laravel + Filament di shared hosting** — tetap layak (Rp30–60k/bln, tanpa kartu), admin turnkey. Ditolak karena pemilik ingin biaya Rp0 mutlak.
- **Laravel + Filament di VPS free tier (Oracle/GCP)** — ditolak: registrasi butuh kartu kredit/debit yang tidak dimiliki (usia < 21 tahun; kartu debit ditolak).
- **MERN klasik (Express + React terpisah) di Vercel** — ditolak: Express harus dibungkus serverless function, tanpa worker, melawan platform. Next.js lebih tepat.
- **Next.js + headless CMS** — ditolak: menambah satu layer dan biaya; admin custom lebih sederhana untuk satu admin.

Kelemahan pilihan: admin dibangun sendiri (beban lebih besar, hilang penghematan Filament), dan tidak ada background worker (email dikirim sinkron). Keduanya diterima karena skala satu admin dan traffic rendah.

## 11. Arah Desain (usulan; UI final dibuat pemilik)

- Karakter: editorial-technical. Tipografi besar dan tegas, grid atau bento yang rapi, aksen font monospace untuk metadata (tahun, tech stack), satu warna aksen, whitespace lega.
- Pembeda dari mayoritas web personal: hindari template gradient ungu dan kartu glass generik; andalkan ritme tipografi, layout asimetris, dan micro-interaction halus pada hover dan scroll.
- Palet awal (boleh diganti): light off-white hangat dengan teks hampir hitam; dark mendekati hitam dengan teks abu terang; satu aksen oranye atau sejenis yang konsisten di kedua tema.
- Font: satu display (karakter kuat) dan satu monospace, keduanya berlisensi terbuka dan self-hosted.
- Prinsip: CTA kontak terlihat tanpa scroll, hierarki jelas untuk scan 30 detik, kontras AA.

## 12. Acceptance Criteria

1. Perubahan yang dipublikasikan di admin tampil di situs publik dalam waktu kurang dari 1 menit tanpa deploy.
2. Tanpa password dan kode email yang valid, admin tidak bisa diakses; kode kedaluwarsa, dipakai ulang, atau salah berulang ditolak (feature test).
3. Konten draft tidak bisa diakses publik, termasuk dengan menebak URL (feature test).
4. Toggle bahasa berfungsi, canonical dan hreflang benar, fallback ke ID berjalan.
5. Dark/light toggle berfungsi dan diingat, tanpa flash saat load.
6. Form kontak: input valid tersimpan dan email terkirim; input invalid menampilkan error; spam dan rate limit ditolak (feature test).
7. Upload menolak tipe file tidak valid dan ukuran berlebih.
8. Lighthouse desktop memenuhi target; tampilan mobile tanpa horizontal scroll.
9. sitemap.xml, robots.txt, dan Open Graph valid; area admin noindex.
10. Repo publik bersih dari secret; README lengkap; feature test lulus.
11. Seluruh layanan produksi (Vercel, Neon, Cloudinary, Resend) berjalan tanpa metode pembayaran/kartu.

## 13. Out of Scope (Fase 1)

- Blog (diarahkan ke web eksternal)
- Multi-admin dan role
- Riwayat revisi/versioning konten (kandidat fase 2)
- Page builder, atur ulang atau tampil/sembunyi section dari admin
- Komentar, newsletter, guestbook
- Dashboard analytics di dalam admin
- Login OAuth dan TOTP (kandidat fase 1.5)
- Pencarian, bahasa ketiga, OG image otomatis per halaman
- Mobile app dan push notification
- Background worker / queue (email dikirim sinkron; worker hanya jika volume naik)

## 14. Timeline (estimasi kasar, 1 developer, 5 minggu)

| Minggu | Fokus |
| --- | --- |
| 1 | Scaffold Next.js + Vercel; setup Neon Postgres, Cloudinary, Resend; skema Prisma + migrasi + index; auth admin (password + kode email); seed script; desain UI (Figma) berjalan paralel |
| 2 | Admin custom: CRUD konten, media, translatable, draft/publish + preview, urutan, pengaturan umum |
| 3 | UI publik sesuai desain, routing bahasa + toggle, dark mode, SEO, form kontak + inbox + Turnstile |
| 4 | Test menyeluruh, performa, hardening, ISR/cache, konten asli (ID/EN) |
| 5 | Buffer: admin polish, README, deploy final, launch |

Desain UI harus siap paling lambat akhir minggu 2; ini dependensi terbesar timeline. Timeline naik dari 4 ke 5 minggu karena admin dibangun custom (menggantikan Filament).

## 15. Risks & Mitigation

| Risk | Dampak | Mitigasi |
| --- | --- | --- |
| Desain UI belum matang | Timeline molor | Mulai Figma minggu 1; siapkan tema sederhana sebagai fallback |
| Admin custom lebih lama dari Filament | Timeline molor | Prioritaskan CRUD inti; drag-drop dan polish sebagai peningkatan |
| Kode login lewat email: email admin diretas atau email gagal terkirim | Akses admin bocor atau terkunci | Aktifkan 2FA di akun email; Resend sebagai provider; jalur pemulihan seed/command; TOTP di fase 1.5 |
| Spam form kontak | Inbox penuh sampah | Turnstile, rate limit, honeypot |
| Secret bocor di repo publik | Kompromi akun | .env.example, secret scanning, tidak commit .env, dump DB, kredensial |
| Terjemahan EN tidak lengkap | Tampilan setengah-setengah | Fallback ke ID dan penanda di admin |
| Notifikasi email tidak sampai | Pesan terlewat | Inbox admin sebagai sumber utama; email hanya notifikasi |
| Kehilangan data | Konten hilang | Ekspor database Neon berkala (`pg_dump`); media di Cloudinary |
| Free tier berubah kebijakan/kuota | Layanan terganggu | Pantau kuota Neon/Cloudinary/Resend; siapkan jalur migrasi ke shared hosting berbayar murah |
| Scope creep | Timeline molor | Patuhi daftar Out of Scope |

## 16. Open Questions / Asumsi

1. Domain sudah terhubung Cloudflare (diasumsikan). SSL/CDN dari Vercel; Cloudflare untuk DNS dan Web Analytics.
2. Email provider: Resend diasumsikan; konfirmasi apakah domain pengirim bisa diverifikasi (SPF/DKIM) di Resend.
3. Analytics diasumsikan Cloudflare Web Analytics; bisa dimatikan dari pengaturan.
4. Struktur halaman diasumsikan satu halaman berseksi + halaman detail project.
5. Bahasa default ID; tidak ada deteksi otomatis berdasarkan browser.
6. Identitas visual belum ada; usulan di bagian 11 menunggu persetujuan.
7. Kode login via email sesuai permintaan; opsi TOTP (authenticator) di fase 1.5.
8. Konten awal (bio, project, terjemahan EN) disiapkan pemilik.
9. Kontak yang ditampilkan publik hanya link sosial dan form; nomor telepon dan alamat tidak ditampilkan.
10. Pesan kontak disimpan sampai dihapus manual; belum ada kebijakan retensi.
11. Riwayat revisi dikeluarkan dari MVP (lihat bagian 13).
12. Panel admin dibangun custom oleh pemilik; scope dan estetika admin tidak diikat ke PRD ini selain FR-ADM.
