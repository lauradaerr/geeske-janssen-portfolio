import { requireAuth } from "@/lib/auth";
import { readContent } from "@/lib/store";
import { savePagesAction } from "@/app/admin/actions";
import MarkdownField from "@/components/admin/MarkdownField";
import RepeaterField from "@/components/admin/RepeaterField";

export default async function PagesEditor() {
  await requireAuth();
  const data = await readContent();
  const press = Array.isArray(data.pressTexts) ? data.pressTexts : [];
  const cv = Array.isArray(data.cvEntries) ? data.cvEntries : [];
  return (
    <>
      <h1>Seiten & Texte</h1>
      <p className="adm__lead">Name, Untertitel, „Über die Arbeiten", Pressetexte (aufklappbar), Lebenslauf und Kontakt.</p>

      <form className="adm__form" action={savePagesAction} style={{ maxWidth: 760 }}>
        <div className="adm__field">
          <label htmlFor="artist">Name</label>
          <input id="artist" name="artist" type="text" defaultValue={data.meta.artist} />
        </div>
        <div className="adm__field">
          <label htmlFor="tagline">Untertitel (Startseite)</label>
          <input id="tagline" name="tagline" type="text" defaultValue={data.meta.tagline || ""} />
        </div>

        <MarkdownField name="about" label="Über die Arbeiten (Einleitung)" defaultValue={data.about || ""} minHeight={160} />

        <RepeaterField
          name="pressTexts"
          label={'Pressetexte (erscheinen als „Weiterlesen"-Aufklapper)'}
          fields={[{ name: "title", placeholder: "Titel des Pressetexts" }, { name: "body", placeholder: "Text (Markdown möglich)", type: "textarea" }]}
          defaultValue={press as unknown as Record<string, string>[]}
          addLabel="+ Pressetext"
        />

        <RepeaterField
          name="cvEntries"
          label={"Lebenslauf (Datum · Eintrag) — Überschrift/Kategorie: Datum leer lassen und Text mit „## “ beginnen (z. B. „## Bildung“)"}
          fields={[{ name: "date", placeholder: "2024 (leer = Überschrift)" }, { name: "text", placeholder: "Eintrag — oder „## Kategorie“ für eine Überschrift", type: "textarea" }]}
          defaultValue={cv as unknown as Record<string, string>[]}
          addLabel="+ CV-Eintrag"
        />

        <div className="adm__field">
          <label htmlFor="contact">Kontakt</label>
          <textarea id="contact" name="contact" defaultValue={data.contact} />
        </div>

        <MarkdownField name="impressum" label="Impressum (Footer)" defaultValue={data.impressum || ""} minHeight={140} />
        <MarkdownField name="datenschutz" label="Datenschutz (Footer)" defaultValue={data.datenschutz || ""} minHeight={140} />

        <div className="adm__actions">
          <button className="btn btn--primary" type="submit">Speichern</button>
        </div>
      </form>
    </>
  );
}
