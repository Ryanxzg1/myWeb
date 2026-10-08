# PRD — Personal Website

Versi 1.0 (MVP) · Status: Draft untuk review · Stack: Laravel + Filament (admin) + Blade/Tailwind (publik)

## 1. Overview

Website personal untuk memperkenalkan pemilik: siapa dia, pengalaman, project, dan skill, lalu mengarahkan pengunjung ke GitHub, LinkedIn, atau form kontak. Seluruh isi diubah lewat panel admin tanpa menyentuh kode. Single-admin, publik (situs dan repo), dwibahasa ID/EN.

## 2. Problem Statement

- Konten yang tertanam di kode membuat setiap perubahan teks atau project butuh coding dan deploy ulang.
- Belum ada satu tempat resmi yang merangkum profil, project, dan cara menghubungi untuk HR dan klien.
- Calon pemberi kerja dan klien datang dari konteks lokal maupun internasional, jadi butuh dua bahasa.
- Tanpa SEO yang baik, web tidak ditemukan saat nama pemilik dicari.

## 3. Goals & Success Metrics

| Goal | Metric | Target |
| --- | --- | --- |
| Branding profesional | Web siap dipasang di LinkedIn dan CV | Live di domain sendiri dalam 4 minggu |
| Konten mandiri | Waktu dari simpan di admin sampai tampil di publik | Kurang dari 1 menit, tanpa deploy |
| Mudah dihubungi | Form kontak berfungsi end-to-end | Pesan tersimpan di admin dan email notifikasi terkirim; spam terfilter |
| Mudah ditemukan | SEO teknis lengkap | Lighthouse SEO ≥ 95; sitemap, hreflang, OG valid |
| Cepat | Performa halaman publik | Lighthouse Performance ≥ 90 (desktop); LCP < 2,5 detik |
| Aman | Akses admin terlindungi | Tidak ada akses admin tanpa password dan kode email (diverifikasi test) |
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
4. Panel admin: konten dan pengaturan umum
5. Auth admin: password + kode email
6. Draft/publish, preview, dan urutan drag-and-drop
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

### 6.2 Bahasa & Tema

- FR-I18N-1 Dua bahasa: ID (default) di /, EN di /en.
- FR-I18N-2 Toggle di header pindah ke halaman yang sama pada bahasa lain; pilihan diingat (cookie).
- FR-I18N-3 Semua teks yang diedit di admin punya versi ID dan EN. Jika EN kosong, fallback ke ID dan admin diberi penanda.
- FR-I18N-4 Atribut html lang dan hreflang sesuai bahasa.
- FR-THEME-1 Dark/light toggle; default mengikuti prefers-color-scheme; pilihan diingat; tanpa flash saat load.

### 6.3 Panel Admin

- FR-ADM-1 Panel di path yang bisa dikonfigurasi (default /admin), hanya untuk satu akun.
- FR-ADM-2 Tidak ada route register. Akun admin dibuat lewat seeder atau artisan command.
- FR-ADM-3 Kelola Profil: nama, headline, sub-headline, bio About (rich text), foto profil.
- FR-ADM-4 CRUD Pengalaman: perusahaan, posisi, periode, lokasi, deskripsi; mendukung status saat ini (tanpa tanggal akhir).
- FR-ADM-5 CRUD Project: judul, slug, ringkasan, deskripsi, tech stack, link demo, link repo, cover, galeri, featured.
- FR-ADM-6 CRUD Skill dengan grup (mis. Backend, Frontend, Infra, AI).
- FR-ADM-7 Pengaturan umum: nama situs, tagline, link GitHub/LinkedIn, email publik, URL blog eksternal, CV per bahasa, gambar OG default, meta title/description default per bahasa, toggle analytics.
- FR-ADM-8 Status draft/published pada Project dan Pengalaman, plus preview draft khusus admin.
- FR-ADM-9 Urutan Project, Pengalaman, dan Skill diatur dengan drag-and-drop.
- FR-ADM-10 Perubahan yang dipublikasikan langsung tampil di publik (cache di-invalidate otomatis).
- FR-ADM-11 Konfirmasi sebelum menghapus.

### 6.4 Auth Admin

- FR-AUTH-1 Login dengan email dan password.
- FR-AUTH-2 Setelah password benar, sistem mengirim kode sekali pakai ke email admin; login selesai setelah kode valid.
- FR-AUTH-3 Kode berlaku singkat (config, default 10 menit), sekali pakai, disimpan dalam bentuk hash, dan percobaan dibatasi.
- FR-AUTH-4 Rate limit pada login dan verifikasi kode; lockout sementara setelah gagal berulang.
- FR-AUTH-5 Reset password via email tanpa membocorkan apakah email terdaftar.
- FR-AUTH-6 Session idle timeout dan logout aman.
- FR-AUTH-7 Jalur pemulihan jika email gagal atau terkunci: artisan command lewat akses server.

### 6.5 Media

- FR-MED-1 Upload gambar (jpg, png, webp) dan PDF (CV); validasi MIME type dan ukuran maksimum (di config).
- FR-MED-2 Gambar dioptimasi otomatis: konversi WebP, beberapa ukuran responsif, lazy loading kecuali di atas fold.
- FR-MED-3 Alt text per gambar (per bahasa).
- FR-MED-4 Nama file di-randomize dan disimpan di lokasi yang tidak mengeksekusi kode.

### 6.6 Kontak

- FR-CON-1 Form: nama, email, pesan (subjek opsional); validasi server-side.
- FR-CON-2 Proteksi spam berlapis: Cloudflare Turnstile, rate limit per IP, dan honeypot.
- FR-CON-3 Pesan tersimpan di database dan tampil di inbox admin (belum dibaca/sudah dibaca, hapus).
- FR-CON-4 Email notifikasi ke admin untuk setiap pesan baru via queue. Kegagalan email tidak menggagalkan penyimpanan pesan dan di-log dengan konteks.
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

Field teks yang diterjemahkan disimpan sebagai JSON per bahasa (ID/EN), ditandai (t).

- users: id, name, email (unique), password, timestamps. Hanya satu akun admin.
- admin\_login\_codes: id, user\_id (FK, cascade), code\_hash, expires\_at, attempts, used\_at.
- site\_settings (satu baris): site\_name, tagline (t), social links, public\_email, blog\_url, cv\_id\_path, cv\_en\_path, og\_image, default\_meta\_title (t), default\_meta\_description (t), analytics\_enabled.
- profiles (satu baris): name, headline (t), subheadline (t), about (t), avatar.
- experiences: id, company, role (t), description (t), location, started\_at, ended\_at (nullable), status, sort\_order. Index: (status, sort\_order).
- projects: id, slug (unique), title (t), summary (t), description (t), tech\_stack (JSON), demo\_url, repo\_url, cover, is\_featured, status, published\_at, sort\_order, meta override (nullable). Index: (status, sort\_order).
- skills: id, name, group, sort\_order.
- contact\_messages: id, name, email, subject (nullable), message, read\_at (nullable), created\_at. IP tidak disimpan mentah.
- media: tabel bawaan library media (alt text per bahasa).

## 9. Non-Functional Requirements

### Security

- Admin hanya bisa diakses setelah password dan kode email valid; tidak ada route register.
- Validasi lewat Form Request; mass assignment dilindungi.
- Rich text disanitasi; tidak ada render HTML mentah dari input pengunjung.
- Upload divalidasi MIME dan ukuran; file tidak bisa dieksekusi.
- CSRF dan proteksi XSS bawaan framework; security headers (CSP, HSTS, X-Frame-Options) dikonfigurasi.
- Secret hanya lewat environment variable. Repo publik: ada .env.example, tidak ada secret, upload, atau dump database di git.
- Rate limit: login, verifikasi kode, reset password, form kontak.

### Performance

- Lighthouse desktop: Performance ≥ 90, SEO ≥ 95, Accessibility ≥ 90.
- Halaman publik di-cache dan di-invalidate saat konten berubah; aset lewat CDN Cloudflare.
- Tidak ada N+1 query; font self-hosted dengan font-display swap; gambar responsif.

### Accessibility

- Kontras minimal WCAG AA di kedua tema; navigasi keyboard penuh; focus state terlihat.
- Hormati prefers-reduced-motion; animasi tidak boleh menghalangi konten atau CTA.

### Reliability

- Kegagalan email tidak memblokir penyimpanan pesan atau login flow lain (kecuali kode login, yang ada jalur pemulihan).
- Backup database dan folder upload berkala.

### Maintainability

- Business logic di Service/Action class, bukan di controller atau resource admin.
- Threshold dan batas (masa berlaku kode, ukuran upload, rate limit) di config.
- Migration, seeder konten demo (bukan data pribadi asli), README jelas.

## 10. Technical Constraints & Stack

| Layer | Pilihan | Alasan |
| --- | --- | --- |
| Backend | Laravel (versi stabil terbaru) | Stack utama pemilik; ekosistem lengkap |
| Admin | Filament | CRUD, upload, rich editor, dan reorder drag-and-drop sudah ada; menghemat sekitar 1–1,5 minggu dibanding admin custom. Dukungan 2FA kode-email perlu diverifikasi di dokumentasi resmi; jika tidak ada, dibuat custom |
| Publik | Blade + Tailwind CSS + Alpine.js | Server-render native (SEO terbaik), bundle kecil, bebas desain unik |
| Animasi | CSS dan library animasi ringan seperlunya | Efek berbeda tanpa membebani performa |
| i18n | spatie/laravel-translatable + routing prefix | Konten per bahasa di satu record |
| Media | spatie/laravel-medialibrary | Konversi WebP dan ukuran responsif otomatis |
| Cache | Response/page cache + invalidate saat simpan | Halaman publik cepat |
| Queue & Mail | Queue database + layanan email transaksional | Notifikasi kontak dan kode login |
| Anti-spam | Cloudflare Turnstile | Gratis, ringan, domain sudah di Cloudflare |
| Edge | Cloudflare (DNS, CDN, SSL, Web Analytics) | Domain sudah terhubung |
| Database | MySQL/PostgreSQL mengikuti hosting (SQLite masih memadai untuk skala ini) | Data kecil |
| Testing | Pest/PHPUnit feature test | Bukti kualitas untuk repo publik |

Alternatif yang dipertimbangkan:

- Next.js + headless CMS (mis. Payload): SEO dan performa bagus, tapi menambah satu layer CMS dan hosting Node; tidak sebanding untuk situs dengan satu admin dan target 1 bulan.
- Laravel + Inertia + React untuk publik: butuh setup SSR tambahan agar SEO setara Blade; berlebihan untuk situs konten.

Kelemahan pilihan: tampilan admin mengikuti gaya Filament (tidak unik), dan situs terikat ke ekosistem Laravel/Livewire. Keunikan UI hanya di sisi publik, jadi ini bukan masalah.

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

## 14. Timeline (estimasi kasar, 1 developer, 4 minggu)

| Minggu | Fokus |
| --- | --- |
| 1 | Setup project, Filament, auth admin + kode email, data model, migration, seeder; desain UI (Figma) berjalan paralel |
| 2 | CRUD konten, media, translatable, draft/publish + preview, drag-and-drop, pengaturan umum |
| 3 | UI publik sesuai desain, routing bahasa + toggle, dark mode, SEO, form kontak + inbox + Turnstile |
| 4 | Test menyeluruh, performa, hardening, deploy + Cloudflare, konten asli (ID/EN), README, launch |

Desain UI harus siap paling lambat akhir minggu 2; ini dependensi terbesar timeline.

## 15. Risks & Mitigation

| Risk | Dampak | Mitigasi |
| --- | --- | --- |
| Desain UI belum matang | Timeline molor | Mulai Figma minggu 1; siapkan tema sederhana sebagai fallback |
| Kode login lewat email: email admin diretas atau email gagal terkirim | Akses admin bocor atau terkunci | Aktifkan 2FA di akun email; layanan email transaksional; jalur pemulihan artisan; TOTP di fase 1.5 |
| Spam form kontak | Inbox penuh sampah | Turnstile, rate limit, honeypot |
| Secret bocor di repo publik | Kompromi akun | .env.example, secret scanning, tidak commit .env, upload, dump DB |
| Terjemahan EN tidak lengkap | Tampilan setengah-setengah | Fallback ke ID dan penanda di admin |
| Notifikasi email tidak sampai | Pesan terlewat | Inbox admin sebagai sumber utama; email hanya notifikasi |
| Kehilangan data | Konten hilang | Backup DB dan upload berkala |
| Scope creep | Timeline molor | Patuhi daftar Out of Scope |
| Upgrade major Filament | Admin rusak | Pin versi dan baca upgrade guide sebelum update |

## 16. Open Questions / Asumsi

1. Hosting belum ditentukan; diasumsikan mendukung PHP, cron (scheduler), dan queue worker.
2. Email provider belum ditentukan (memengaruhi kode login dan notifikasi).
3. Analytics diasumsikan Cloudflare Web Analytics; pertanyaan ini belum dijawab.
4. Struktur halaman diasumsikan satu halaman berseksi + halaman detail project; perlu konfirmasi.
5. Bahasa default ID; tidak ada deteksi otomatis berdasarkan browser.
6. Identitas visual belum ada; usulan di bagian 11 menunggu persetujuan.
7. Kode login via email sesuai permintaan; apakah ingin opsi TOTP (aplikasi authenticator) juga?
8. Konten awal (bio, project, terjemahan EN) disiapkan siapa dan kapan?
9. Kontak yang ditampilkan publik diasumsikan hanya link sosial dan form; nomor telepon dan alamat tidak ditampilkan.
10. Pesan kontak disimpan sampai dihapus manual; belum ada kebijakan retensi.
11. Riwayat revisi dikeluarkan dari MVP (lihat bagian 13); perlu persetujuan.