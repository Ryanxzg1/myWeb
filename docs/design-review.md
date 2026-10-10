# Design Review — Artboard UX Pilot

Hasil QC terhadap 7 artboard di `docs/generated-uiux/`.

**Status keseluruhan: Diketahui, belum diperbaiki.** Pemilik memutuskan artboard dibiarkan apa adanya; perbaikan diterapkan saat implementasi UI (Fase 6), bukan dengan regenerate desain.

**Cara pakai dokumen ini:** saat membangun komponen di Fase 6, perlakukan setiap temuan di bawah sebagai instruksi. Artboard = acuan tata letak; dokumen ini = koreksi yang menang jika bertentangan.

---

## Daftar Artboard

| File | Isi | Wordmark di desain |
| --- | --- | --- |
| `01-home.png` | Home lengkap (Header, Hero, 01 About, 02 Experience, 03 Projects, 04 Skills, 05 Contact, Footer) | `Portfolio` |
| `02-project-detail.png` | Detail project "Enterprise FinTech Dashboard" | `Portfoliowise` |
| `03-404.png` | Halaman 404 | `Errorpage` |
| `04-admin-login.png` | Admin login (email + password, catatan 2FA) | `Adminport` |
| `05-admin-otp.png` | Admin OTP "STEP 2 OF 2" | `Vericode` |
| `06-admin-dashboard.png` | Tabel Projects (drag handle, status, order, pagination) | `Portfoliodash` |
| `07-admin-inbox.png` | Inbox pesan (unread dot, mark as read, delete) | `Inboxly` |

---

## 🔴 CRITICAL — wajib dibereskan saat implementasi

### [UI-01] Tujuh Artboard, Tujuh Wordmark Berbeda
- **Bukti:** `Portfolio`, `Portfoliowise`, `Errorpage`, `Adminport`, `Vericode`, `Portfoliodash`, `Inboxly`.
- **Masalah:** Melanggar PRD FR-ADM-7 (nama situs berasal dari `site_settings.site_name`).
- **Instruksi implementasi:** Render satu wordmark dari `site_settings.site_name` di semua header. Jangan hardcode.

### [UI-02] Tipografi Tidak Konsisten — Sans vs Serif
- **Bukti:** Home = sans grotesk. Project detail & 404 = serif Didone. Admin = sans.
- **Masalah:** PRD bagian 11 menetapkan satu display + satu monospace.
- **Instruksi implementasi:** Pilih satu arah lalu terapkan konsisten.
  - **Rekomendasi:** serif Didone untuk display, sans untuk body, monospace untuk metadata (paling kuat untuk karakter editorial-technical).
  - Alternatif: sans untuk display (artboard 02 & 03 dianggap menyimpang).

### [UI-03] Toggle Bahasa & Tema Hanya Ada di Home
- **Bukti:** Header Home punya `EN | ID` + ikon tema. Project detail dan 404 tidak punya.
- **Masalah:** Melanggar FR-I18N-2 dan AC #4.
- **Instruksi implementasi:** Header semua halaman publik wajib memuat toggle ID/EN dan toggle tema, dan toggle bahasa harus memindah ke halaman yang sama di bahasa lain.

---

## 🟡 WARNING

### [UI-04] Navigasi Berbeda Antar Halaman
- **Bukti:** Home `About · Experience · Projects · Skills · Contact`; Project detail & 404 `Work · About · Contact`.
- **Instruksi:** Satu set nav untuk semua halaman publik.

### [UI-05] Aturan Warna CTA Tidak Konsisten
- **Bukti:** "Contact me" oranye; "VIEW LIVE DEMO" hitam solid; "New project" oranye; "BACK TO HOME" oranye.
- **Instruksi:** CTA primer selalu oranye (`--accent`), CTA sekunder selalu outlined. Tidak ada CTA primer hitam.

### [UI-06] Dark Mode Belum Digenerate
- **Masalah:** FR-THEME-1 dan AC #5.
- **Instruksi:** Token dark sudah tersedia di `app/globals.css` (`#0A0A0A` / `#D4D4D4` / `#FF7A1A`). Terapkan tanpa flash saat load.

### [UI-07] Varian Mobile 360px Belum Digenerate
- **Masalah:** FR-PUB-7 dan AC #8.
- **Instruksi:** Pastikan tanpa horizontal scroll sampai 360px.

---

## 🟢 OFI

### [UI-08] Label `reCAPTCHA` di Form Kontak
- **Bukti:** Placeholder form Home bertuliskan `reCAPTCHA`.
- **Instruksi:** Ganti ke Cloudflare Turnstile (FR-CON-2).

### [UI-09] Layar CRUD Admin Lain Belum Ada
- **Bukti:** Baru tabel Projects. Profile, Experience, Skills, Settings belum.
- **Instruksi:** Reuse pola tabel dari `06-admin-dashboard.png` (drag handle, status badge, order).

### [UI-10] Field `ROLES` di Project Detail Tidak Ada di Data Model
- **Bukti:** Sidebar project detail menampilkan `ROLES: Lead Product Designer / Frontend Engineer / User Researcher`.
- **Masalah:** Tabel `projects` (PRD bagian 8) tidak punya field roles.
- **Instruksi:** Hapus dari UI, ATAU tambahkan field ke `schema.prisma`. Menambah field butuh persetujuan karena mengubah skema data.

### [UI-11] Copy Masih Placeholder
- **Bukti:** `hello@portfolio.dev`, `@portfolio_dev`, "San Francisco", foto orang.
- **Instruksi:** Ganti dengan data asli dari `site_settings` dan `profiles` sebelum go-live.

---

## Yang Sudah Sesuai PRD

- Home lengkap 6 section — FR-PUB-1
- Hero punya CTA GitHub, LinkedIn, Download CV, dan Contact — FR-PUB-2
- Kartu project punya cover, judul, ringkasan, tech stack, link demo/repo — FR-PUB-3
- Halaman 404 bergaya situs, bukan default framework — FR-PUB-6
- Tabel admin punya drag handle, status badge, kolom order — FR-ADM-5, FR-ADM-9
- Inbox punya indikator unread, mark as read, delete — FR-CON-3
- Label section memakai monospace (`01 — ABOUT`) — sesuai arah desain PRD bagian 11
- Grid asimetris, hairline divider, whitespace lega — sesuai arah desain PRD bagian 11

---

## Ringkasan

| Kategori | Jumlah |
| --- | --- |
| CRITICAL | 3 |
| WARNING | 4 |
| OFI | 4 |

Semua temuan berstatus **belum diperbaiki** dan menjadi checklist saat Fase 6.
