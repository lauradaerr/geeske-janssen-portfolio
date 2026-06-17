import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({ breaks: true, gfm: true });

export function renderMarkdown(src: string): string {
  if (!src) return "";
  const raw = marked.parse(src, { async: false }) as string;
  return sanitizeHtml(raw, {
    allowedTags: ["p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote", "a", "hr"],
    allowedAttributes: { a: ["href", "title", "target", "rel"] },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
      h1: sanitizeHtml.simpleTransform("h2", {}),
    },
  });
}
