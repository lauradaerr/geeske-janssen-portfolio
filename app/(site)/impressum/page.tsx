import Markdown from "@/components/Markdown";
import Bi from "@/components/Bi";
import { getText } from "@/lib/content";

export const metadata = { title: "Impressum — Geeske Janßen" };

export default async function ImpressumPage() {
  const text = await getText("impressum");
  return (
    <div className="pad ueber">
      <article className="prose">
        <h1><Bi de="Impressum" en="Imprint" /></h1>
        {text ? <Markdown source={text} className="md" /> : <p><Bi de="Noch nicht hinterlegt." en="Not provided yet." /></p>}
      </article>
    </div>
  );
}
