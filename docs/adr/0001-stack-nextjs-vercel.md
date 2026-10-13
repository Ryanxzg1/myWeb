# ADR-0001: Stack Next.js + Vercel (Bebas Kartu) untuk Personal Website

**Status:** Accepted
**Tanggal:** 2026-10-10
**Revisi:** 2026-10-10 — database diubah dari MongoDB Atlas (Mongoose) ke Neon Postgres (Prisma)
**Revisi:** 2026-10-12 — deteksi locale otomatis diaktifkan (Opsi A) + penyesuaian token aksen tema terang untuk kontras AA (lihat bagian 6)
**Penggagas:** Pemilik proyek

## 1. Konteks dan Masalah

Proyek personal website sebelumnya direncanakan memakai Laravel + Filament (lihat PRD v1.0). Rencana itu mengasumsikan hosting berupa VPS/hosting berbayar atau free tier berbasis VM.

Kenyataan yang membatalkan asumsi tersebut:

- Pemilik tidak memiliki hosting/VPS berbayar dan menargetkan biaya operasional **Rp0 mutlak**.
- Pemilik belum berusia 21 tahun, sehingga tidak dapat menerbitkan kartu kredit di bank Indonesia.
- Free tier berbasis VM (Oracle Cloud Always Free, Google Cloud Free) menolak registrasi karena verifikasi kartu. Kartu debit Mastercard BCA pemilik pun ditolak.
- Konsekuensinya: Laravel + Filament + queue worker + storage disk tidak dapat dijalankan tanpa infrastruktur yang butuh kartu.

Batasan keras: **tanpa kartu kredit/debit, tanpa VPS, tanpa biaya, tanpa syarat usia.**

## 2. Keputusan

Mengganti stack menjadi:

| Layer | Pilihan | Biaya & kartu |
| --- | --- | --- |
| Framework | Next.js (App Router) | — |
| Hosting | Vercel Hobby | Gratis, tanpa kartu |
| Database | Neon Postgres | Gratis, tanpa kartu (akun sudah dimiliki) |
| ORM | Prisma | — |
| Media | Cloudinary | Gratis, tanpa kartu |
| Email | Resend | Gratis, tanpa kartu |
| i18n | next-intl | — |
| Cache | ISR + `revalidateTag` | — |
| Testing | Vitest + Playwright | — |

Panel admin dibangun custom di dalam Next.js (Filament dibatalkan bersama Laravel). Email dikirim sinkron di dalam request handler — tidak ada background worker/queue. Rincian requirement dipindahkan ke PRD v2.0.

## 3. Opsi Alternatif yang Dipertimbangkan

| Opsi | Kelebihan | Kekurangan |
| --- | --- | --- |
| **Next.js + Vercel (dipilih)** | Bebas kartu & usia; SSR/SSG native (SEO kuat); ISR menggantikan cache manual; satu framework untuk publik + API + admin | Admin harus dibangun custom; tanpa worker; sebagian bergantung pada kebijakan free tier terkelola |
| Laravel + Filament di shared hosting | Admin turnkey (hemat ~1–1,5 minggu); kartu tidak dibutuhkan (bayar transfer/QRIS) | Tidak Rp0 (Rp30–60k/bln); worker/cron terbatas; melanggar target biaya mutlak pemilik |
| Laravel + Filament di VPS free tier (Oracle/GCP) | Rp0; VPS penuh; admin turnkey | Registrasi butuh kartu — ditolak untuk kasus ini; akun free tier bisa disuspend |
| MERN klasik (Express + React terpisah) di Vercel | Familiar; Mongo + Node | Express harus dibungkus serverless function; tanpa worker; melawan model platform Vercel |
| Next.js + headless CMS | Admin siap pakai | Menambah layer & potensi biaya; berlebihan untuk satu admin |

## 4. Konsekuensi (Trade-offs)

### Keuntungan (Positif)
- Nol biaya dan nol ketergantungan kartu/usia — hambatan utama tereliminasi.
- SSR/SSG native memenuhi target SEO & performa (FR-SEO-6, Lighthouse ≥ 90/95) tanpa setup tambahan.
- ISR + `revalidateTag` membuat FR-ADM-10 (<1 menit publish) terpenuhi trivial dan menghapus kompleksitas cache manual.
- Vercel menyediakan CDN + SSL bawaan; Cloudflare tetap dipakai untuk DNS dan Web Analytics.
- Tanpa worker menyederhanakan arsitektur untuk skala satu admin/traffic rendah.

### Risiko dan Hutang Teknis (Negatif)
- **Admin custom**: kehilangan penghematan Filament (~1–1,5 minggu). Timeline naik 4 → 5 minggu. Hutang ini dibayar dengan membangun CRUD, media manager, reorder, dan inbox sendiri.
- **Tanpa background worker**: email dikirim sinkron; latency request naik sedikit. Jika volume pesan naik, perlu menambah queue (mis. Upstash QStash) — kandidat fase 2.
- **Ketergantungan free tier terkelola**: kuota Neon (0.5GB, autosuspend), Cloudinary (25 credits/bln), dan kebijakan Vercel Hobby (non-komersial) bisa berubah. Mitigasi: pantau kuota, siapkan migrasi ke shared hosting murah.
- **TTL hilang (Mongo → Postgres)**: Postgres tidak punya TTL index. Kode OTP kedaluwarsa dibersihkan via filter `expires_at` saat verifikasi plus penghapusan berkala (saat login atau Vercel Cron) — bukan otomatis seperti Mongo.
- **Vendor lock-in** ke Vercel/Neon lebih tinggi dibanding VPS mandiri. Diterima karena trade-off biaya.

## 5. Rencana Implementasi (Opsional)

1. Scaffold Next.js (App Router) + Tailwind; hubungkan repo ke Vercel (Hobby).
2. Buat project Neon Postgres; salin connection string (pooled) ke environment Vercel.
3. Daftar Cloudinary + Resend; verifikasi domain pengirim (SPF/DKIM) di Resend.
4. Definisikan skema Prisma + migrasi + index (cleanup kode kedaluwarsa via filter/Cron).
5. Bangun auth admin (password + OTP email) → CRUD konten → UI publik → SEO → kontak.
6. Deploy dan uji acceptance criteria PRD v2.0.

## 6. Keputusan Lanjutan (2026-10-12)

### 6.1 Deteksi locale otomatis — Opsi A (aktif)

`i18n/routing.ts` memakai `localeDetection: true`. Urutan penentuan locale: cookie `NEXT_LOCALE` → header `Accept-Language` → locale default (id).

- **Alternatif yang ditolak:** Opsi B (`localeDetection: false`, locale murni dari URL). Lebih sederhana untuk caching karena `/` menjadi deterministik, tapi kehilangan kenyamanan pengunjung berbahasa Inggris yang datang tanpa prefix.
- **Konsekuensi yang diterima:** path tanpa prefix locale isinya bergantung pada header permintaan, jadi tidak boleh masuk cache bersama. `proxy.ts` menandainya `Cache-Control: private, no-store`; path berprefix (`/en`, `/id`) tetap `s-maxage`.
- **Amendemen PRD:** asumsi #5 di PRD bagian 16 yang semula berbunyi "tidak ada deteksi otomatis berdasarkan browser" sudah diperbarui.

### 6.2 Token aksen tema terang

Aksen awal `#E8590C` hanya mencapai 3,38:1 di atas `#FAF8F5`, di bawah ambang WCAG AA (4,5:1) untuk teks normal — padahal label aksen dipakai pada 11-12px. Tema terang memakai `#C2410C` (4,89:1); tema gelap tidak berubah (`#FF7A1A` di atas `#0A0A0A` = 7,59:1). PRD bagian 11 sudah mencatat penyesuaian ini.

---

**Referensi:** `PRD.md` v2.0 (bagian 10 — Technical Constraints & Stack).
