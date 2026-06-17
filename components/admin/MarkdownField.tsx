"use client";
import { useRef, useState } from "react";

export default function MarkdownField({
  name,
  label,
  defaultValue = "",
  minHeight = 160,
}: {
  name: string;
  label?: string;
  defaultValue?: string;
  minHeight?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue);

  function surround(before: string, after = before) {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart, e = el.selectionEnd;
    const sel = value.slice(s, e) || "Text";
    const next = value.slice(0, s) + before + sel + after + value.slice(e);
    setValue(next);
    requestAnimationFrame(() => { el.focus(); el.selectionStart = s + before.length; el.selectionEnd = s + before.length + sel.length; });
  }
  function linePrefix(prefix: string) {
    const el = ref.current;
    if (!el) return;
    const s = el.selectionStart;
    const lineStart = value.lastIndexOf("\n", s - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    setValue(next);
    requestAnimationFrame(() => { el.focus(); el.selectionStart = el.selectionEnd = s + prefix.length; });
  }

  return (
    <div className="adm__field">
      {label && <label>{label}</label>}
      <div className="md-toolbar">
        <button type="button" className="btn btn--sm" onClick={() => linePrefix("## ")} title="Überschrift">H</button>
        <button type="button" className="btn btn--sm" onClick={() => linePrefix("### ")} title="Unterüberschrift">h</button>
        <button type="button" className="btn btn--sm" onClick={() => surround("**")} title="Fett"><strong>B</strong></button>
        <button type="button" className="btn btn--sm" onClick={() => surround("*")} title="Kursiv"><em>i</em></button>
        <button type="button" className="btn btn--sm" onClick={() => linePrefix("- ")} title="Liste">• Liste</button>
        <button type="button" className="btn btn--sm" onClick={() => surround("[", "](https://)")} title="Link">Link</button>
      </div>
      <textarea ref={ref} name={name} value={value} onChange={(e) => setValue(e.target.value)} style={{ minHeight }} />
      <span className="adm__hint">Markdown: <code>## Überschrift</code>, <code>**fett**</code>, <code>*kursiv*</code>, <code>- Liste</code></span>
    </div>
  );
}
