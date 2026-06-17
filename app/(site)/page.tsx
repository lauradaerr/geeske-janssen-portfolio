import MediumBand from "@/components/MediumBand";
import Bi from "@/components/Bi";
import { getMeta, getSections, sectionStrip } from "@/lib/content";
import { splitLang, sectionLabelEn } from "@/lib/i18n";

const DOT: Record<string, string> = {
  video: "var(--c-video)",
  fotografie: "var(--c-fotografie)",
  installation: "var(--c-installation)",
  performance: "var(--c-performance)",
};

export default async function Home() {
  const meta = await getMeta();
  const sections = await getSections();
  const strips = await Promise.all(sections.map((s) => sectionStrip(s.key, 4)));
  const tagline = splitLang(meta.tagline || "Video · Fotografie · Installation · Performance");
  const nameLines = meta.artist.split(" ");

  return (
    <div>
      <header className="hero pad">
        <h1 className="hero__name">
          {nameLines.map((w, i) => (
            <span key={i}>{w}</span>
          ))}
        </h1>
        <p className="hero__sub"><Bi de={tagline.de} en={tagline.en} /></p>
        <div className="media-row">
          {sections.map((s) => (
            <span className="item" key={s.key}>
              <span className="dot" style={{ background: DOT[s.key] }} />
              <Bi de={s.label} en={sectionLabelEn(s.key, s.label)} />
            </span>
          ))}
        </div>
      </header>

      <section>
        {sections.map((s, i) => (
          <MediumBand key={s.key} section={s} thumbs={strips[i]} />
        ))}
      </section>
    </div>
  );
}
