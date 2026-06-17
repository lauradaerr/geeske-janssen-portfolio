/* Zweisprachigkeit ohne Schema-Verdopplung:
 * In einem beliebigen Textfeld kann nach einer Markierungszeile "===EN===" die
 * englische Fassung folgen. splitLang() trennt sie; fehlt sie, gilt DE für beide. */
export function splitLang(s: string): { de: string; en: string } {
  if (!s) return { de: "", en: "" };
  const parts = s.split(/\n?\s*===\s*EN\s*===\s*\n?/i);
  if (parts.length < 2) return { de: s.trim(), en: s.trim() };
  return { de: parts[0].trim(), en: parts.slice(1).join("\n").trim() };
}

/* Englische Bereichsnamen (Anzeige) */
export const SECTION_EN: Record<string, string> = {
  video: "Video",
  fotografie: "Photography",
  installation: "Installation",
  performance: "Performance",
};
export function sectionLabelEn(key: string, fallback: string): string {
  return SECTION_EN[key] || fallback;
}
