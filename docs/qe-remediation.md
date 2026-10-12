# QE Remediation Log — Fase 4 (API Route Handlers)

Hasil audit Quality Engineering terhadap Fase 4, analisis akar masalah, dan status perbaikannya.

**Status: seluruh temuan CRITICAL dan WARNING sudah diperbaiki.** Ditutup pada 2026-10-12.

---

## 🔴 CRITICAL

### [QE-01] Notifikasi Email Kontak Berjalan Asinkron (Floating Promise)
- **File:** `lib/contact/service.ts`
- **Akar masalah:** `sendContactNotification(...).catch(...)` dipanggil tanpa `await`. Di Vercel serverless, promise tanpa await berisiko di-terminate segera setelah `Response` dikembalikan, sehingga email notifikasi admin hilang tanpa jejak.
- **Pelanggaran:** PRD FR-CON-4 — *"Pengiriman email dilakukan secara sinkron di dalam request handler"*.
- **Perbaikan:** Diubah menjadi `await` di dalam blok `try/catch` terisolasi. Kegagalan email tetap tidak menggagalkan penyimpanan pesan; hanya di-log dengan konteks (`messageId`, `email`).

### [QE-02] Rate Limit Verify Berbagi Kuota dengan Login
- **File:** `app/api/auth/verify/route.ts`, `lib/auth/service.ts`
- **Akar masalah:** Endpoint `login` dan `verify` memakai key rate limit identik (`login:<hashIp>`, 5 req/15 menit). User yang salah ketik OTP beberapa kali akan di-block HTTP 429 sebelum sempat submit OTP yang benar, padahal kuota brute-force di database masih tersisa.
- **Perbaikan:** Ditambahkan `checkVerifyRateLimit` dengan key terpisah `verify:<hashIp>` (10 req/15 menit). Login tetap 5 req/15 menit.

---

## 🟡 WARNING

### [QE-03] Validasi OTP Mengizinkan Non-Digit
- **File:** `app/api/auth/verify/route.ts`
- **Akar masalah:** Schema Zod hanya `.length(6)`, bukan digit. Typo huruf ikut membakar kuota `MAX_OTP_ATTEMPTS` di database.
- **Perbaikan:** Regex `/^\d{6}$/` di batas request (HTTP 400). Ada regression test yang memastikan `verifyOtp` tidak dipanggil untuk input non-digit.

### [QE-04] Cleanup Kode Kedaluwarsa Tanpa Await
- **File:** `app/api/auth/verify/route.ts`
- **Akar masalah:** Sama seperti QE-01 — promise database tanpa `await` tidak dijamin selesai di serverless.
- **Perbaikan:** `await cleanupExpiredCodes()` di dalam `try/catch` sebelum response dikembalikan.

### [QE-05] Brittle String-Matching pada Penanganan Error Kontak
- **File:** `app/api/contact/route.ts`, `lib/contact/service.ts`
- **Akar masalah:** Status HTTP 429 ditentukan dari pencocokan substring `"terlalu banyak"`. Perubahan redaksi pesan error merusak pemetaan status.
- **Perbaikan:** Ditambahkan diskriminator `errorCode: "RATE_LIMITED" | "VALIDATION_ERROR" | "TURNSTILE_FAILED"` pada `SubmitContactResult`.

### [QE-06] Duplikasi Ekstraksi IP + Rentan Spoofing Header
- **File:** `lib/security/ip.ts` (baru), ketiga route handler
- **Akar masalah:** Fungsi `getClientIp` terduplikasi di 3 file dan memprioritaskan `x-forwarded-for` (dapat dikirim client) sehingga rate limiter bisa dipintas.
- **Perbaikan:** Helper terpusat `lib/security/ip.ts` dengan prioritas `x-real-ip` (ditetapkan edge network) lebih dulu.

---

## 🟢 OFI (Optional Follow-Up, sudah ditangani)

### [QE-07] `maskEmail` Berpotensi Output `undefined`
- **File:** `lib/auth/temp-token.ts`
- **Perbaikan:** Guard untuk local-part kosong → `***@domain.com`.

### [QE-08] Tidak Ada Header `Retry-After` pada HTTP 429
- **File:** ketiga route handler
- **Perbaikan:** Header `Retry-After` disematkan pada respons 429, dihitung dari `resetAt` rate limiter.

---

## Pelajaran yang Diambil (Lesson Learned)

1. **Floating promise adalah bug laten di serverless.** Setiap operasi I/O (email, DB cleanup) yang dipicu di dalam request handler harus `await`-ed, meski kegagalannya tidak fatal. Pola `.catch()` tanpa `await` DILARANG di proyek ini.
2. **Rate limit harus punya namespace per alur.** Login kredensial dan verifikasi OTP adalah dua alur berbeda; berbagi key pool menyebabkan blocking silang yang tidak sesuai aturan bisnis.
3. **Validasi input harus menolak di batas terluar.** Kesalahan format sepele tidak boleh sampai membakar state server (kuota percobaan DB).
4. **Jangan menentukan HTTP status dari string pesan error.** Gunakan machine-readable error code.
5. **Header IP dari client tidak tepercaya.** Prioritaskan header yang ditetapkan platform edge (`x-real-ip`).

---

## Bukti Verifikasi

```
npm test         → 9 suite, 44 test lulus
npm run typecheck → 0 error
npm run build     → sukses (4 route handler terdaftar sebagai Dynamic)
```
