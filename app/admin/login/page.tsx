/**
 * Placeholder Fase 5.
 *
 * Satu-satunya halaman admin yang boleh diakses tanpa sesi — `proxy.ts`
 * mengecualikannya dari guard. Form login dua langkah (password + OTP)
 * dibangun pada Fase 6.
 *
 * CATATAN FASE 6: halaman ini akan menerima parameter `?next=` dari proxy.
 * Nilai itu WAJIB divalidasi sebagai path internal sebelum dipakai untuk
 * redirect balik, kalau tidak akan menjadi celah open redirect.
 */
export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 flex-col justify-center gap-4 px-6 py-24 sm:px-16">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        Admin
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Masuk</h1>
      <p className="max-w-xl text-base leading-7 text-foreground/70">
        Placeholder Fase 5. Form login dua langkah dibangun pada Fase 6.
      </p>
    </main>
  );
}
