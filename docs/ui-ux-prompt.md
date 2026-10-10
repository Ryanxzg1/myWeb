# UX Pilot Playbook — Personal Website

Kumpulan prompt siap copy untuk men-generate UI/UX situs ini di **UX Pilot** (text-to-UI).

**Aturan utama: 1 prompt = 1 artboard/screen.** Jangan gabungkan beberapa layar dalam satu prompt.

Konteks yang sudah diselaraskan: PRD v2.1 (bagian 5, 6.1, 6.2, 11) dan token tema aktual di `app/globals.css`.

---

## Urutan Pengerjaan

| # | Artboard | Prompt |
| --- | --- | --- |
| 0 | Design direction (opsional) | Prompt 0 |
| 1 | Home (semua section) | Prompt 1 |
| 2 | Project detail | Prompt 2 |
| 3 | 404 | Prompt 3 |
| 4 | Admin login | Prompt 4 |
| 5 | Admin OTP | Prompt 5 |
| 6 | Admin dashboard | Prompt 6 |
| 7 | Admin inbox | Prompt 7 |

Setelah 1–7 selesai, baru jalankan pass kedua: **mobile 390px** untuk semua layar, lalu **dark mode** untuk Home, project card, dan contact form.

Layar 1–3 (publik) paling penting — itu yang dinilai HR/klien. Layar 4–7 admin cukup fungsional; PRD menyatakan keunikan UI hanya di sisi publik.

---

## Style Anchor (tempel di akhir prompt jika gaya mulai melenceng)

```
Style anchor: editorial-technical, warm off-white #FAF8F5 background, near-black #1A1A1A text, single orange #E8590C accent, oversized bold headlines, monospace metadata labels, asymmetric 12-column grid, hairline 1px dividers, sharp corners, generous whitespace, no gradients, no shadows, no rounded pills.
```

---

## Prompt 0 — Design Direction (opsional, hanya jika ada kolom style/context)

```
Editorial-technical personal portfolio website. Warm off-white background #FAF8F5, near-black text #1A1A1A, one single orange accent #E8590C. Dark version: near-black background #0A0A0A, light grey text #D4D4D4, brighter orange #FF7A1A. Typography: oversized bold sans-serif headlines with very tight leading, small monospace uppercase labels for metadata such as years, tech stack and section numbers. Asymmetric 12-column grid, lots of whitespace, 1px hairline dividers, sharp corners (0 to 6px radius), almost no shadows. Calm, confident, editorial magazine feel. No gradients, no glassmorphism, no purple, no 3D blobs, no emoji icons, no rounded pill cards.
```

---

## Prompt 1 — Home Page (desktop 1440px)

```
Personal portfolio homepage, desktop 1440px, editorial-technical style, warm off-white background #FAF8F5 with near-black text #1A1A1A and a single orange accent #E8590C.

Sticky top header with a hairline bottom border: bold wordmark on the left, navigation links "About, Experience, Projects, Skills, Contact", a small "ID | EN" language toggle, and a sun/moon dark-mode toggle on the right.

Hero section: oversized bold headline aligned left taking about 60% of the width, one line of sub-headline below it in grey, then a row of buttons — outlined "GitHub" and "LinkedIn", outlined "Download CV", and one solid orange "Contact me" button. Generous empty space, no hero illustration, no image.

Section "01 — About" with a small monospace label: two columns, square portrait photo on the left with sharp corners, rich text bio on the right.

Section "02 — Experience": vertical list with hairline separators. Each row has a monospace period on the left like "2022 — Present", company name and role in the middle, one short impact line on the right, and a small orange "Current" marker for the active job.

Section "03 — Projects": bento grid with one large featured project card and two smaller cards. Each card has a cover image with sharp corners, project title, one-line summary, monospace tech stack chips like "Next.js" and "PostgreSQL", and small "Demo" and "Repo" text links.

Section "04 — Skills": bento grid of grouped skills with monospace group labels "Backend", "Frontend", "Infra", "AI".

Section "05 — Contact": two columns. Left is a short invitation sentence plus email and social links. Right is a form with name, email, optional subject, message textarea, a captcha placeholder box, and a solid orange submit button.

Footer with hairline top border: social links, an external blog link, and copyright text in small monospace.
```

### Prompt 1b — Home versi padat (fallback jika prompt terpotong)

```
Portfolio homepage, desktop 1440px, editorial-technical. Warm off-white #FAF8F5, near-black #1A1A1A text, single orange #E8590C accent. Oversized bold left-aligned headline, monospace metadata labels, asymmetric 12-column grid, hairline 1px dividers, sharp corners, generous whitespace, no shadows, no gradients.

Header (sticky, hairline border): bold wordmark left; nav About / Experience / Projects / Skills / Contact; small "ID | EN" toggle; dark-mode toggle right.

Hero: huge headline ~60% width, grey sub-headline, button row — outlined GitHub, outlined LinkedIn, outlined Download CV, solid orange Contact me. No illustration.

01 About — monospace label; two columns: square portrait left, bio text right.
02 Experience — vertical list, hairline separators; each row: monospace period left ("2022 — Present"), company + role center, one impact line right, small orange "Current" marker.
03 Projects — bento: one large featured card + two smaller; cover image, title, one-line summary, monospace stack chips, small Demo / Repo links.
04 Skills — bento grid, monospace group labels: Backend, Frontend, Infra, AI.
05 Contact — two columns: invitation text + email/social left; form (name, email, subject, message, captcha box, solid orange submit) right.
Footer — hairline top border; social links, external blog link, small monospace copyright.
```

---

## Prompt 2 — Project Detail Page

```
Project detail page for a personal portfolio, desktop 1440px, editorial-technical style, warm off-white background #FAF8F5, near-black text #1A1A1A, single orange accent #E8590C.

Small monospace "Back to projects" link at the top. Then an oversized bold project title on the left and a metadata row on the right in monospace: year "2024" and tech stack "Next.js · PostgreSQL · Prisma". Below that, a wide full-width cover image with sharp corners and a 1px hairline border. Then a two-column layout: rich description text on the left, and a narrow right sidebar with "Demo" and "Repository" buttons plus a small stack list. At the bottom, a gallery grid of three or four images with sharp corners and consistent gutters. Lots of whitespace, no shadows, no gradients.
```

---

## Prompt 3 — 404 Page

```
404 error page for an editorial-technical portfolio website, desktop 1440px, warm off-white background #FAF8F5, near-black text #1A1A1A, single orange accent #E8590C. Centered composition: a very large bold "404" in oversized display type, a short line below it saying the page does not exist, and one solid orange button "Back to home". Minimal, typographic, generous whitespace, hairline rule above the button, no illustration, no emoji.
```

---

## Prompt 4 — Admin Login

```
Admin login screen for a personal portfolio website, desktop 1440px, clean and restrained, warm off-white background #FAF8F5, near-black text #1A1A1A, single orange accent #E8590C. Centered narrow card with sharp corners and a 1px hairline border, no shadow. Inside: small monospace label "ADMIN", bold heading "Sign in", then email field, password field, and a full-width solid orange "Continue" button. Below the button a small grey note that a verification code will be sent by email. Minimal, lots of whitespace, no illustration.
```

---

## Prompt 5 — Admin OTP Verification

```
Two-factor verification screen for an admin panel, desktop 1440px, warm off-white background #FAF8F5, near-black text #1A1A1A, orange accent #E8590C. Centered narrow card with sharp corners and a hairline border. Small monospace label "STEP 2 OF 2", bold heading "Enter the 6-digit code", a grey line showing the masked email address it was sent to, six large square code input boxes with hairline borders and monospace digits, a solid orange "Verify" button, and a small text link "Resend code" with a countdown. Clean and minimal.
```

---

## Prompt 6 — Admin Dashboard

```
Admin dashboard for a personal portfolio website, desktop 1440px, functional and restrained, warm off-white background #FAF8F5, near-black text #1A1A1A, orange accent #E8590C. Left sidebar with a hairline right border containing monospace navigation items: Profile, Experience, Projects, Skills, Settings, Inbox. Main area shows a "Projects" data table with hairline row separators, columns for drag handle, cover thumbnail, title, status badge, and order number. Status badges are small: grey outlined "Draft" and orange outlined "Published". Above the table a page title and a solid orange "New project" button. Rows are compact, sharp corners, no shadows, no rounded pills.
```

---

## Prompt 7 — Admin Inbox

```
Contact inbox screen for a personal portfolio admin panel, desktop 1440px, warm off-white background #FAF8F5, near-black text #1A1A1A, orange accent #E8590C. Split layout: left column is a message list with hairline separators, each row showing sender name, subject, and a monospace date; unread rows have a small orange dot and slightly bolder text. Right column shows the selected message in full: sender name, email in monospace, date, then the message body in readable text, with "Mark as read" and "Delete" text buttons at the bottom. Sharp corners, hairline borders, no shadows.
```

---

## Pass Tambahan

### Mobile (jalankan untuk setiap layar)

```
Same screen at 390px mobile width: single column, nav collapses into a menu button, hero headline scales down, all sections stack vertically with generous spacing and no horizontal scroll.
```

### Dark Mode (Home, project card, contact form dulu)

```
Same screen in dark mode: background #0A0A0A, text #D4D4D4, accent #FF7A1A. Everything else identical.
```

---

## Checklist Evaluasi Hasil

Jangan lanjut ke artboard berikutnya sebelum Home dinilai.

| # | Yang dicek | Standar |
| --- | --- | --- |
| 1 | Pemakaian aksen oranye | Maksimal ~3 titik per layar (CTA, marker "Current", rule). Kalau bertebaran → regenerate |
| 2 | Sudut elemen | Sharp (0–6px). Muncul `rounded-2xl` atau pill button → refine |
| 3 | CTA kontak | Terlihat tanpa scroll di 1440px |
| 4 | Font monospace | Hanya di metadata (tahun, stack, label). Body text harus sans |
| 5 | Shadow & gradient | Nol. Ada glow/gradient ungu → regenerate |
| 6 | Hierarki tipografi | Headline hero jauh lebih besar dari judul section |
| 7 | Grid | Asimetris. Semua section jadi 3 kolom rata → refine |
| 8 | Kontras | Teks abu harus ≥4.5:1 di #FAF8F5 |
| 9 | Spacing | Section terasa lega, bukan padat |

**Aturan keputusan:** ≥7 lolos → refine. <7 lolos → regenerate.

---

## Tabel Refine (pakai ini, jangan regenerate)

| Masalah | Perintah refine |
| --- | --- |
| Semua section jadi 3 kolom rata | `Make the layout asymmetric. Vary the column widths between sections, don't repeat the same 3-column grid.` |
| Aksen oranye berlebihan | `Reduce the orange accent to only three places: the primary CTA, the "Current" marker, and the section rule. Everything else neutral.` |
| Hero terlalu kecil | `Make the hero headline about 2x larger and increase the space below it before the About section.` |
| Section terasa sempit | `Increase vertical spacing between sections and widen the side margins.` |
| Muncul shadow/rounded | `Remove all shadows. Reduce every corner radius to 4px or less.` |
| Header tidak sticky | `Make the header sticky with a 1px bottom hairline border and a subtle background.` |
| Refine per section | `Only adjust section 02 (Experience): add more vertical padding and align the monospace period column to a fixed 160px width.` |
| Prompt terpotong (section hilang) | Pakai Prompt 1b (versi padat) + tambahkan: `Prioritize these: oversized hero headline, single orange accent used sparingly, sharp corners (max 6px radius), no shadows, no gradients, hairline dividers only.` |

---

## Lampiran — Brief Teknis (untuk v0 / Lovable / Claude, bukan UX Pilot)

Tool yang menghasilkan kode butuh batasan teknis. Gunakan ringkasan ini:

```
Next.js 16 App Router (React Server Components) + Tailwind CSS v4 with CSS-first tokens (@theme). No UI component library. Fonts self-hosted: Geist Sans (display + body), Geist Mono (metadata only). Tokens — Light: --background #FAF8F5, --foreground #1A1A1A, --accent #E8590C. Dark: --background #0A0A0A, --foreground #D4D4D4, --accent #FF7A1A. One accent hue only. Radius 0–6px. Icons: inline stroke-based SVG, 1.5px stroke, 20–24px. Must work at 1024px, 768px, 360px with no horizontal scroll. WCAG AA in both themes, visible focus ring (2px accent, 2px offset), respects prefers-reduced-motion.
```
