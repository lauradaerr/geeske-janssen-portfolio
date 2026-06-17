import { renderMarkdown } from "@/lib/md";
import { splitLang } from "@/lib/i18n";

export default function Markdown({ source, className }: { source: string; className?: string }) {
  const { de, en } = splitLang(source);
  const cls = className ?? "md";
  const deHtml = renderMarkdown(de);
  const enHtml = renderMarkdown(en);
  if (!deHtml && !enHtml) return null;
  return (
    <>
      <div className={`${cls} lang-de`} dangerouslySetInnerHTML={{ __html: deHtml }} />
      <div className={`${cls} lang-en`} dangerouslySetInnerHTML={{ __html: enHtml }} />
    </>
  );
}
