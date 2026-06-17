import Link from "next/link";
import Bi from "@/components/Bi";

export default function NotFound() {
  return (
    <div className="pad shell section-pad">
      <article className="prose">
        <h1><Bi de="Nicht gefunden" en="Not found" /></h1>
        <p><Bi de="Diese Seite gibt es nicht." en="This page does not exist." /> <Link href="/"><Bi de="Zur Startseite" en="Back to home" /></Link>.</p>
      </article>
    </div>
  );
}
