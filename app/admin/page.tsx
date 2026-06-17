import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { readContent } from "@/lib/store";

const DOT: Record<string, string> = {
  video: "#1B2BF0", fotografie: "#FFD400", installation: "#FF2020", performance: "#B388FF",
};

export default async function Dashboard() {
  await requireAuth();
  const data = await readContent();
  const total = data.sections.reduce((a, s) => a + s.projects.length, 0);
  return (
    <>
      <h1>Übersicht</h1>
      <p className="adm__lead">Verwalte Werke, Texte und den Portfolio-Export.</p>

      <div className="adm__banner">
        Änderungen (Texte &amp; Bilder) werden gespeichert und erscheinen direkt auf der Website — online in Vercel Blob, lokal in <code>content/portfolio-content.json</code>.
      </div>

      <div className="adm__cards">
        <div className="adm__card"><div className="n">{total}</div><div className="l">Arbeiten gesamt</div></div>
        {data.sections.map((s) => (
          <Link key={s.key} href={`/admin/works#${s.key}`} className="adm__card">
            <div className="n" style={{ color: DOT[s.key] }}>{s.projects.length}</div>
            <div className="l">{s.label}</div>
          </Link>
        ))}
      </div>

      <h2>Schnellzugriff</h2>
      <div className="adm__actions">
        <Link className="btn btn--primary" href="/admin/works">Werke verwalten</Link>
        <Link className="btn" href="/admin/pages">Texte (Über / CV / Kontakt)</Link>
        <Link className="btn" href="/admin/export">Portfolio-Export</Link>
      </div>
    </>
  );
}
