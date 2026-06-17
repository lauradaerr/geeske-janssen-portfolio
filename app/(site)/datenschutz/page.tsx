import Markdown from "@/components/Markdown";
import Bi from "@/components/Bi";
import { getText } from "@/lib/content";

export const metadata = { title: "Datenschutz — Geeske Janßen" };

export default async function DatenschutzPage() {
  const text = await getText("datenschutz");
  return (
    <div className="pad ueber">
      <article className="prose">
        <h1><Bi de="Datenschutz" en="Privacy" /></h1>
        {text ? <Markdown source={text} className="md" /> : <p><Bi de="Noch nicht hinterlegt." en="Not provided yet." /></p>}
      </article>
    </div>
  );
}
