/* Rendert beide Sprachfassungen; per CSS (html[data-lang]) wird die aktive gezeigt.
 * So bleibt die Seite statisch und der Umschalter wirkt sofort. */
export default function Bi({ de, en }: { de: string; en?: string }) {
  return (
    <>
      <span className="lang-de">{de}</span>
      <span className="lang-en">{en ?? de}</span>
    </>
  );
}
