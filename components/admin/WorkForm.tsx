"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { saveWorkAction, uploadImageAction } from "@/app/admin/actions";
import MarkdownField from "@/components/admin/MarkdownField";
import { splitLang } from "@/lib/i18n";
import { prepareImage, humanSize, MAX_UPLOAD_BYTES } from "@/lib/resize";

const EN_MARK = /===\s*EN\s*===/i;
/** Trennt einen gespeicherten DE/EN-Wert in zwei Felder; EN bleibt leer, wenn kein Marker da ist. */
function deEn(raw: string): { de: string; en: string } {
  const p = splitLang(raw || "");
  return { de: p.de, en: EN_MARK.test(raw || "") ? p.en : "" };
}

type Size = "s" | "m" | "l";
type Project = { slug: string; title: string; description?: string; text: string; images: string[]; videoUrl?: string; imageCredits?: Record<string, string>; imageSizes?: Record<string, Size> };
const toSrc = (p: string) => (/^https?:\/\//.test(p) || p.startsWith("/") ? p : `/works/${p}`);
const SIZES: { v: Size; label: string }[] = [{ v: "s", label: "Drittel" }, { v: "m", label: "Halb" }, { v: "l", label: "Voll" }];

export default function WorkForm({
  sectionKey,
  sectionLabel,
  project,
}: {
  sectionKey: string;
  sectionLabel: string;
  project?: Project;
}) {
  const [images, setImages] = useState<string[]>(project?.images || []);
  const [credits, setCredits] = useState<Record<string, string>>(project?.imageCredits || {});
  const [sizes, setSizes] = useState<Record<string, Size>>(project?.imageSizes || {});
  const [busy, setBusy] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const isNew = !project;
  const title = deEn(project?.title || "");
  const text = deEn(project?.text || "");
  const description = project?.description || "";

  const move = (i: number, d: -1 | 1) =>
    setImages((a) => { const j = i + d; if (j < 0 || j >= a.length) return a; const n = a.slice(); [n[i], n[j]] = [n[j], n[i]]; return n; });
  const remove = (i: number) => setImages((a) => a.filter((_, j) => j !== i));
  const setCredit = (src: string, v: string) => setCredits((c) => ({ ...c, [src]: v }));
  const setSize = (src: string, v: Size) => setSizes((s) => ({ ...s, [src]: v }));

  /* Bilder einzeln hochladen — im Browser auf Webgroesse verkleinert.
   * Ein Request pro Bild, damit das 4,5-MB-Body-Limit von Vercel nie greift. */
  async function handleFiles(list: FileList | null) {
    const files = Array.from(list || []);
    if (!files.length) return;
    setErrors([]);
    const problems: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const original = files[i];
      setBusy(`Bild ${i + 1} von ${files.length} wird vorbereitet …`);
      let file = original;
      try {
        file = await prepareImage(original);
      } catch {
        // Verkleinern fehlgeschlagen — Original versuchen (Groessenpruefung unten greift)
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        problems.push(`${original.name}: zu gross (${humanSize(file.size)}) — bitte vorher verkleinern oder als JPEG speichern.`);
        continue;
      }
      setBusy(`Bild ${i + 1} von ${files.length} wird hochgeladen … (${humanSize(file.size)})`);
      const fd = new FormData();
      fd.set("section", sectionKey);
      fd.set("file", file);
      try {
        const res = await uploadImageAction(fd);
        if (res.ok) {
          setImages((a) => (a.includes(res.path) ? a : [...a, res.path]));
        } else {
          problems.push(`${original.name}: ${res.error}`);
        }
      } catch (err) {
        problems.push(`${original.name}: ${err instanceof Error ? err.message : "Upload fehlgeschlagen."}`);
      }
    }
    setBusy(null);
    setErrors(problems);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <>
      <p className="adm__hint"><Link href="/admin/works">← Werke</Link></p>
      <h1>{isNew ? "Neue Arbeit" : "Arbeit bearbeiten"}</h1>
      <p className="adm__lead">Bereich: <strong>{sectionLabel}</strong></p>

      <form className="adm__form" action={saveWorkAction}>
        <input type="hidden" name="section" value={sectionKey} />
        <input type="hidden" name="origSlug" value={project?.slug || ""} />
        <input type="hidden" name="existing" value={JSON.stringify(images)} />
        <input type="hidden" name="credits" value={JSON.stringify(credits)} />
        <input type="hidden" name="sizes" value={JSON.stringify(sizes)} />

        <div className="adm__field">
          <label htmlFor="title">Titel (Deutsch)</label>
          <input id="title" name="title" type="text" defaultValue={title.de} required />
        </div>

        <div className="adm__field">
          <label htmlFor="titleEn">Title (English)</label>
          <input id="titleEn" name="titleEn" type="text" defaultValue={title.en} placeholder="optional — leer = nutzt den deutschen Titel" />
        </div>

        <div className="adm__field">
          <label htmlFor="slug">Kürzel (URL)</label>
          <input id="slug" name="slug" type="text" defaultValue={project?.slug || ""} placeholder="wird aus dem Titel erzeugt, wenn leer" />
        </div>

        <MarkdownField name="description" label="Werkbeschreibung (Technik, Maße, Jahr …) — erscheint direkt unter dem ersten Bild" defaultValue={description} minHeight={90} />

        <div className="adm__field">
          <label htmlFor="videoUrl">Video-Link (optional, Vimeo/YouTube) — Button erscheint nach der Werkbeschreibung</label>
          <input id="videoUrl" name="videoUrl" type="url" defaultValue={project?.videoUrl || ""} placeholder="https://vimeo.com/…" />
        </div>

        <MarkdownField name="text" label="Fließtext (Deutsch)" defaultValue={text.de} />
        <MarkdownField name="textEn" label="Fließtext (English)" defaultValue={text.en} />

        <div className="adm__field">
          <label>Bilder — Reihenfolge ↑/↓, entfernen ×, Größe (Drittel/Halb/Voll), Urheber:in</label>
          {images.length === 0 ? (
            <span className="adm__hint">Noch keine Bilder.</span>
          ) : (
            <div className="adm__imgs">
              {images.map((src, i) => (
                <div className="adm__img" key={src + i}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={toSrc(src)} alt="" />
                  <div className="adm__img-acts">
                    <button type="button" className="btn btn--sm btn--ghost" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                    <button type="button" className="btn btn--sm btn--ghost" onClick={() => move(i, 1)} disabled={i === images.length - 1}>↓</button>
                    <button type="button" className="btn btn--sm btn--danger" onClick={() => remove(i)}>×</button>
                  </div>
                  <div className="adm__sizes">
                    {SIZES.map((s) => (
                      <button
                        key={s.v}
                        type="button"
                        className={`btn btn--sm${(sizes[src] || "m") === s.v ? " btn--primary" : ""}`}
                        onClick={() => setSize(src, s.v)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="adm__credit"
                    placeholder="© Fotograf:in / Urheber"
                    value={credits[src] || ""}
                    onChange={(e) => setCredit(src, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="adm__field">
          <label htmlFor="files">Bilder hinzufügen (mehrere möglich)</label>
          {/* Kein name= — die Dateien laufen NICHT durchs Formular, sondern werden
              sofort einzeln hochgeladen (Vercel erlaubt nur 4,5 MB pro Request). */}
          <input
            id="files"
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            disabled={!!busy}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <span className="adm__hint">
            Werden beim Auswählen hochgeladen und ans Ende angehängt (automatisch auf Webgröße
            verkleinert). Größe &amp; Urheber danach einstellbar.
          </span>
          {busy && <span className="adm__hint" role="status">{busy}</span>}
          {errors.length > 0 && (
            <div className="adm__err" role="alert">
              {errors.map((m, i) => <div key={i}>{m}</div>)}
            </div>
          )}
        </div>

        <div className="adm__actions">
          <button className="btn btn--primary" type="submit" disabled={!!busy}>
            {busy ? "Bitte warten …" : "Speichern"}
          </button>
          <Link className="btn" href="/admin/works">Abbrechen</Link>
        </div>
      </form>
    </>
  );
}
