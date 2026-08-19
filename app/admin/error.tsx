"use client";

/* Fehlergrenze fuer den CMS-Bereich.
 * Ohne diese Datei zeigt Next bei einem Serverfehler nur die nackte Meldung
 * "a client-side exception has occurred" — hier stattdessen etwas Brauchbares. */
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="adm__main">
      <h1>Da ist etwas schiefgegangen</h1>
      <p className="adm__lead">
        Die Aktion konnte nicht abgeschlossen werden. Deine Eingaben im Formular sind
        dadurch nicht gespeichert.
      </p>
      <div className="adm__err" role="alert">
        {error.message || "Unbekannter Fehler."}
        {error.digest && <div>Kennung: {error.digest}</div>}
      </div>
      <p className="adm__actions">
        <button className="btn btn--primary" type="button" onClick={() => reset()}>Nochmal versuchen</button>
        <a className="btn" href="/admin/works">Zurück zu den Werken</a>
      </p>
    </div>
  );
}
