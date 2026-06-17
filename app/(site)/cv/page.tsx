import Markdown from "@/components/Markdown";
import Bi from "@/components/Bi";
import { getText, getCvEntries } from "@/lib/content";
import { splitLang } from "@/lib/i18n";

export const metadata = { title: "CV — Geeske Janßen" };

export default async function CvPage() {
  const entries = await getCvEntries();
  const fallback = entries.length > 0 ? "" : await getText("cv");
  return (
    <div className="pad ueber">
      <article className="prose prose--wide">
        <h1>CV</h1>
        {entries.length > 0 ? (
          <div className="cv">
            {entries.map((e, i) => {
              // Überschrift: Datum leer + Text beginnt mit '#'
              if (/^\s*#/.test(e.text || "")) {
                return <h2 className="cv__head" key={i}>{e.text.replace(/^\s*#+\s*/, "")}</h2>;
              }
              const txt = splitLang(e.text);
              return (
                <div className="cv__row" key={i}>
                  <span className="cv__date">{e.date}</span>
                  <div className="cv__text">
                    <span className="lang-de"><Markdown source={txt.de} className="md" /></span>
                    <span className="lang-en"><Markdown source={txt.en} className="md" /></span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Markdown source={fallback} className="md" />
        )}
      </article>
    </div>
  );
}
