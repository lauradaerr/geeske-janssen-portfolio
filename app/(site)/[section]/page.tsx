import { notFound } from "next/navigation";
import WorkGrid from "@/components/WorkGrid";
import Bi from "@/components/Bi";
import { getSection, getSectionWorks, sectionKeys, themeClass } from "@/lib/content";
import { sectionLabelEn } from "@/lib/i18n";

export async function generateStaticParams() {
  return (await sectionKeys()).map((section) => ({ section }));
}

export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const sec = await getSection(section);
  if (!sec) notFound();
  const works = await getSectionWorks(section);
  const n = String(works.length).padStart(2, "0");

  return (
    <div className={`themed ${themeClass(section)}`}>
      <div className="pad">
        <header className="sec-head">
          <h1 className="sec-head__title"><Bi de={sec.label} en={sectionLabelEn(sec.key, sec.label)} /></h1>
          <span className="sec-head__count"><Bi de={`${n} Arbeiten`} en={`${n} works`} /></span>
        </header>
        <WorkGrid works={works} />
      </div>
    </div>
  );
}
