export type Locale = "id" | "en";

/** Field teks yang diterjemahkan (PRD bagian 8). */
export type Localized = { id: string; en: string };

export const LOCALES: Locale[] = ["id", "en"];
export const DEFAULT_LOCALE: Locale = "id";
