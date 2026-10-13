import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Wrapper navigation yang sadar-locale.
 *
 * Dipakai agar perpindahan bahasa tetap berada di halaman yang sama (FR-I18N-2)
 * tanpa perlu menyusun ulang prefix locale secara manual.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
