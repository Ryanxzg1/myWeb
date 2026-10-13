/**
 * Placeholder Fase 5.
 *
 * Halaman ini hanya ada untuk membuktikan guard di `proxy.ts` bekerja:
 * tanpa cookie sesi valid, request ke sini dialihkan ke `/admin/login`.
 * Dashboard sebenarnya dibangun pada Fase 6.
 */
export default function AdminDashboardPage() {
  return (
    <main className="flex flex-1 flex-col justify-center gap-4 px-6 py-24 sm:px-16">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">
        Admin
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
      <p className="max-w-xl text-base leading-7 text-foreground/70">
        Placeholder Fase 5. Panel admin dibangun pada Fase 6.
      </p>
    </main>
  );
}
