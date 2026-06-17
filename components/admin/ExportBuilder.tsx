"use client";
import { useMemo, useState } from "react";

export type ExpWork = { id: string; title: string; sectionLabel: string; text: string; images: string[] };

const toSrc = (p: string) => (/^https?:\/\//.test(p) || p.startsWith("/") ? p : `/works/${p}`);

type Row = { a: string; b: string; c?: string };

export default function ExportBuilder({ works, cv, artist }: { works: ExpWork[]; cv: string; artist: string }) {
  const [empfaenger, setEmpfaenger] = useState("");
  const [betreff, setBetreff] = useState("");
  const [anschreiben, setAnschreiben] = useState("");
  const [motivation, setMotivation] = useState("");
  const [zeitplan, setZeitplan] = useState<Row[]>([{ a: "", b: "", c: "" }]);
  const [budget, setBudget] = useState<Row[]>([{ a: "", b: "" }]);
  const [includeCv, setIncludeCv] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const selWorks = useMemo(() => works.filter((w) => selected.has(w.id)), [works, selected]);
  const budgetSum = useMemo(
    () => budget.reduce((acc, r) => acc + (parseFloat(String(r.b).replace(/[^\d.,-]/g, "").replace(",", ".")) || 0), 0),
    [budget]
  );
  const eur = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);
  const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });

  const toggle = (id: string) =>
    setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const setRow = (rows: Row[], set: (r: Row[]) => void, i: number, key: keyof Row, v: string) => {
    const n = rows.slice(); n[i] = { ...n[i], [key]: v }; set(n);
  };

  return (
    <div className="exp">
      <div className="adm__form" style={{ maxWidth: "none" }}>
        <div className="adm__field">
          <label>Empfänger</label>
          <input type="text" value={empfaenger} onChange={(e) => setEmpfaenger(e.target.value)} placeholder="Institution / Person" />
        </div>
        <div className="adm__field">
          <label>Betreff</label>
          <input type="text" value={betreff} onChange={(e) => setBetreff(e.target.value)} placeholder="z. B. Bewerbung Atelierstipendium 2026" />
        </div>
        <div className="adm__field">
          <label>Anschreiben</label>
          <textarea value={anschreiben} onChange={(e) => setAnschreiben(e.target.value)} />
        </div>
        <div className="adm__field">
          <label>Motivation</label>
          <textarea value={motivation} onChange={(e) => setMotivation(e.target.value)} />
        </div>

        <div className="adm__field">
          <label>Zeitplan</label>
          <div className="exp__rows">
            {zeitplan.map((r, i) => (
              <div className="exp__row" key={i}>
                <input type="text" placeholder="Phase" value={r.a} onChange={(e) => setRow(zeitplan, setZeitplan, i, "a", e.target.value)} />
                <input type="text" placeholder="Zeitraum" value={r.b} onChange={(e) => setRow(zeitplan, setZeitplan, i, "b", e.target.value)} />
                <input type="text" placeholder="Inhalt" value={r.c} onChange={(e) => setRow(zeitplan, setZeitplan, i, "c", e.target.value)} />
              </div>
            ))}
          </div>
          <button type="button" className="btn btn--sm" onClick={() => setZeitplan([...zeitplan, { a: "", b: "", c: "" }])}>+ Zeile</button>
        </div>

        <div className="adm__field">
          <label>Budget</label>
          <div className="exp__rows">
            {budget.map((r, i) => (
              <div className="exp__row" key={i}>
                <input type="text" placeholder="Posten" value={r.a} onChange={(e) => setRow(budget, setBudget, i, "a", e.target.value)} />
                <input type="text" placeholder="Betrag (€)" value={r.b} onChange={(e) => setRow(budget, setBudget, i, "b", e.target.value)} />
              </div>
            ))}
          </div>
          <button type="button" className="btn btn--sm" onClick={() => setBudget([...budget, { a: "", b: "" }])}>+ Zeile</button>
          <span className="adm__hint">Summe: {eur(budgetSum)}</span>
        </div>

        <div className="adm__field">
          <label><input type="checkbox" checked={includeCv} onChange={(e) => setIncludeCv(e.target.checked)} /> Lebenslauf anhängen</label>
        </div>

        <div className="adm__field">
          <label>Arbeiten auswählen ({selWorks.length})</label>
          <div className="exp__pick">
            {works.map((w) => (
              <label key={w.id}>
                <input type="checkbox" checked={selected.has(w.id)} onChange={() => toggle(w.id)} />
                {w.title} <span className="adm__hint">· {w.sectionLabel}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="adm__actions">
          <button type="button" className="btn btn--primary" onClick={() => window.print()}>Als PDF speichern (Drucken)</button>
          <span className="adm__hint">Im Druckdialog „Als PDF sichern" wählen.</span>
        </div>
      </div>

      {/* Druck-/Vorschau-Dokument */}
      <div className="print-doc preview">
        <h1 className="pd__h1">{artist}</h1>
        <p className="pd__lead">Portfolio & Bewerbung — {today}</p>

        {(empfaenger || betreff || anschreiben) && (
          <div className="pd__sec">
            <h2>Anschreiben</h2>
            {empfaenger && <p><strong>{empfaenger}</strong></p>}
            {betreff && <p><strong>Betreff:</strong> {betreff}</p>}
            {anschreiben && <p>{anschreiben}</p>}
          </div>
        )}

        {motivation && (
          <div className="pd__sec"><h2>Motivation</h2><p>{motivation}</p></div>
        )}

        {zeitplan.some((r) => r.a || r.b || r.c) && (
          <div className="pd__sec">
            <h2>Zeitplan</h2>
            <table className="pd__table">
              <thead><tr><th>Phase</th><th>Zeitraum</th><th>Inhalt</th></tr></thead>
              <tbody>
                {zeitplan.filter((r) => r.a || r.b || r.c).map((r, i) => (
                  <tr key={i}><td>{r.a}</td><td>{r.b}</td><td>{r.c}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {budget.some((r) => r.a || r.b) && (
          <div className="pd__sec">
            <h2>Budget</h2>
            <table className="pd__table">
              <thead><tr><th>Posten</th><th style={{ textAlign: "right" }}>Betrag</th></tr></thead>
              <tbody>
                {budget.filter((r) => r.a || r.b).map((r, i) => (
                  <tr key={i}><td>{r.a}</td><td style={{ textAlign: "right" }}>{r.b}</td></tr>
                ))}
                <tr><td><strong>Summe</strong></td><td style={{ textAlign: "right" }}><strong>{eur(budgetSum)}</strong></td></tr>
              </tbody>
            </table>
          </div>
        )}

        {includeCv && cv && (
          <div className="pd__sec"><h2>Lebenslauf</h2><p>{cv}</p></div>
        )}

        {selWorks.length > 0 && (
          <div className="pd__sec">
            <h2>Arbeiten</h2>
            {selWorks.map((w) => (
              <div className="pd__work" key={w.id}>
                <h3>{w.title}</h3>
                <p className="m">{w.sectionLabel}</p>
                {w.text && <p>{w.text}</p>}
                {w.images.length > 0 && (
                  <div className="pd__imgs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {w.images.map((src, i) => <img key={i} src={toSrc(src)} alt="" />)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
