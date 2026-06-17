import Markdown from "@/components/Markdown";
import Bi from "@/components/Bi";
import { getText, getPressTexts } from "@/lib/content";
import { splitLang } from "@/lib/i18n";

export const metadata = { title: "Über die Arbeiten — Geeske Janßen" };

export default async function UeberPage() {
  const intro = await getText("about");
  const press = await getPressTexts();
  return (
    <div className="pad ueber">
      <article className="prose">
        <h1><Bi de="Über die Arbeiten" en="About the works" /></h1>
        {intro ? <Markdown source={intro} className="md" /> : <p>—</p>}
      </article>

      {press.length > 0 && (
        <div className="acc">
          {press.map((p, i) => {
            const t = splitLang(p.title);
            return (
              <details className="acc__item" key={i}>
                <summary className="acc__sum">
                  <span><Bi de={t.de} en={t.en} /></span>
                  <span className="acc__more"><Bi de="Weiterlesen" en="Read more" /></span>
                </summary>
                <div className="acc__body"><Markdown source={p.body} className="md" /></div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
