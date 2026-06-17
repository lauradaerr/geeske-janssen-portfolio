"use client";
import { useState } from "react";

type FieldDef = { name: string; placeholder?: string; type?: "text" | "textarea" };
type Row = Record<string, string>;

export default function RepeaterField({
  name,
  label,
  fields,
  defaultValue = [],
  addLabel = "+ Eintrag",
}: {
  name: string;
  label?: string;
  fields: FieldDef[];
  defaultValue?: Row[];
  addLabel?: string;
}) {
  const [rows, setRows] = useState<Row[]>(defaultValue.length ? defaultValue : []);

  const empty = (): Row => Object.fromEntries(fields.map((f) => [f.name, ""]));
  const update = (i: number, key: string, v: string) =>
    setRows((r) => r.map((row, j) => (j === i ? { ...row, [key]: v } : row)));
  const move = (i: number, d: -1 | 1) =>
    setRows((r) => { const j = i + d; if (j < 0 || j >= r.length) return r; const n = r.slice(); [n[i], n[j]] = [n[j], n[i]]; return n; });
  const remove = (i: number) => setRows((r) => r.filter((_, j) => j !== i));

  return (
    <div className="adm__field">
      {label && <label>{label}</label>}
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      <div className="rep">
        {rows.map((row, i) => (
          <div className="rep__row" key={i}>
            <div className="rep__fields">
              {fields.map((f) =>
                f.type === "textarea" ? (
                  <textarea key={f.name} placeholder={f.placeholder} value={row[f.name] || ""} onChange={(e) => update(i, f.name, e.target.value)} style={{ minHeight: 90 }} />
                ) : (
                  <input key={f.name} type="text" placeholder={f.placeholder} value={row[f.name] || ""} onChange={(e) => update(i, f.name, e.target.value)} />
                )
              )}
            </div>
            <div className="rep__acts">
              <button type="button" className="btn btn--sm btn--ghost" onClick={() => move(i, -1)} disabled={i === 0} aria-label="hoch">↑</button>
              <button type="button" className="btn btn--sm btn--ghost" onClick={() => move(i, 1)} disabled={i === rows.length - 1} aria-label="runter">↓</button>
              <button type="button" className="btn btn--sm btn--danger" onClick={() => remove(i)}>×</button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="btn btn--sm" onClick={() => setRows((r) => [...r, empty()])}>{addLabel}</button>
    </div>
  );
}
