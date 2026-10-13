import "../globals.css";
import type { Metadata } from "next";
import { RootShell } from "@/components/shell/root-shell";

// Panel admin tidak boleh diindeks mesin pencari.
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Root layout kedua, di luar segmen `[locale]`.
 *
 * Karena `app/layout.tsx` dihapus, layout ini berdiri sendiri sebagai root
 * layout — panel admin tidak ikut routing locale dan URL-nya tetap `/admin`.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <RootShell lang="id">
      <div className="flex flex-1 flex-col">{children}</div>
    </RootShell>
  );
}
