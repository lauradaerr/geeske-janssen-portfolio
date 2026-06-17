import { requireAuth } from "@/lib/auth";
import { readContent } from "@/lib/store";
import ExportBuilder, { type ExpWork } from "@/components/admin/ExportBuilder";

export default async function ExportPage() {
  await requireAuth();
  const data = await readContent();
  const works: ExpWork[] = data.sections.flatMap((s) =>
    s.projects.map((p) => ({
      id: `${s.key}/${p.slug}`,
      title: p.title,
      sectionLabel: s.label,
      text: p.text,
      images: p.images,
    }))
  );
  return (
    <>
      <h1>Portfolio-Export</h1>
      <p className="adm__lead">Bewerbungsmappe zusammenstellen: Anschreiben, Motivation, Zeitplan, Budget, Lebenslauf und ausgewählte Arbeiten — als PDF speichern (Drucken → „Als PDF sichern").</p>
      <ExportBuilder works={works} cv={data.cv} artist={data.meta.artist} />
    </>
  );
}
