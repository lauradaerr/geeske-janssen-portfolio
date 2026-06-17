/* Bild- und Theme-Helfer — rein, client-sicher (keine Node/Blob-Importe). */

/** Relativen Archiv-Pfad in eine Web-URL übersetzen. Absolute URLs (Blob) bleiben unverändert. */
export function imgSrc(p: string): string {
  if (!p) return "";
  if (/^https?:\/\//.test(p) || p.startsWith("/")) return p;
  return `/works/${p}`;
}

/* Farb-Theme-Klasse je Bereich (siehe globals.css) */
export function themeClass(key: string): string {
  return `theme-${key}`;
}
