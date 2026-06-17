import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { readContent } from "@/lib/store";
import { imgSrc } from "@/lib/content";
import { moveWorkAction } from "@/app/admin/actions";
import DeleteWorkButton from "@/components/admin/DeleteWorkButton";

const DOT: Record<string, string> = {
  video: "#1B2BF0", fotografie: "#FFD400", installation: "#FF2020", performance: "#B388FF",
};

export default async function WorksPage() {
  await requireAuth();
  const data = await readContent();

  return (
    <>
      <h1>Werke</h1>
      <p className="adm__lead">Pro Bereich verwalten, neue Arbeiten anlegen, Reihenfolge ändern.</p>

      {data.sections.map((s) => (
        <section key={s.key} id={s.key}>
          <div className="adm__sec">
            <span className="adm__dot" style={{ background: DOT[s.key] }} />
            <h2>{s.label}</h2>
            <Link className="btn btn--sm" href={`/admin/works/edit?section=${s.key}`} style={{ marginLeft: "auto" }}>+ Neue Arbeit</Link>
          </div>

          {s.projects.length === 0 ? (
            <p className="adm__hint">Noch keine Arbeiten.</p>
          ) : (
            <div className="adm__list">
              {s.projects.map((p, i) => (
                <div className="adm__row" key={p.slug}>
                  {p.images[0]
                    /* eslint-disable-next-line @next/next/no-img-element */
                    ? <img className="thumb" src={imgSrc(p.images[0])} alt="" />
                    : <span className="thumb" />}
                  <span className="title">{p.title}</span>
                  <span className="meta">{p.images.length} Abb.</span>
                  <span className="acts">
                    <form action={moveWorkAction}>
                      <input type="hidden" name="section" value={s.key} />
                      <input type="hidden" name="slug" value={p.slug} />
                      <input type="hidden" name="dir" value="-1" />
                      <button className="btn btn--sm btn--ghost" disabled={i === 0} aria-label="nach oben">↑</button>
                    </form>
                    <form action={moveWorkAction}>
                      <input type="hidden" name="section" value={s.key} />
                      <input type="hidden" name="slug" value={p.slug} />
                      <input type="hidden" name="dir" value="1" />
                      <button className="btn btn--sm btn--ghost" disabled={i === s.projects.length - 1} aria-label="nach unten">↓</button>
                    </form>
                    <Link className="btn btn--sm" href={`/admin/works/edit?section=${s.key}&slug=${encodeURIComponent(p.slug)}`}>Bearbeiten</Link>
                    <DeleteWorkButton section={s.key} slug={p.slug} />
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </>
  );
}
