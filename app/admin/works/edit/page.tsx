import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { readContent } from "@/lib/store";
import WorkForm from "@/components/admin/WorkForm";

export default async function EditWorkPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string; slug?: string }>;
}) {
  await requireAuth();
  const { section, slug } = await searchParams;
  const data = await readContent();
  const sec = data.sections.find((s) => s.key === section);
  if (!sec) notFound();
  const project = slug ? sec.projects.find((p) => p.slug === slug) : undefined;
  return <WorkForm sectionKey={sec.key} sectionLabel={sec.label} project={project} />;
}
