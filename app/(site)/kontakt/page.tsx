import Bi from "@/components/Bi";
import { getText } from "@/lib/content";

export const metadata = { title: "Kontakt — Geeske Janßen" };

function linkify(text: string) {
  const parts = text.split(/(\s+)/);
  return parts.map((tok, i) => {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tok)) return <a key={i} href={`mailto:${tok.toLowerCase()}`}>{tok}</a>;
    if (/^https?:\/\//.test(tok)) return <a key={i} href={tok} target="_blank" rel="noreferrer">{tok}</a>;
    if (/^www\./.test(tok)) return <a key={i} href={`https://${tok}`} target="_blank" rel="noreferrer">{tok}</a>;
    return <span key={i}>{tok}</span>;
  });
}

export default async function KontaktPage() {
  const text = (await getText("contact")) || "—";
  return (
    <div className="pad ueber">
      <article className="prose">
        <h1><Bi de="Kontakt" en="Contact" /></h1>
        <p>{linkify(text)}</p>
      </article>
    </div>
  );
}
