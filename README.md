# Geeske Janßen — Portfolio (Frontend)

Modernes, galerie-artiges Portfolio in **Next.js (App Router) + TypeScript + Framer Motion**.
Monochromer Rahmen, die Arbeiten sind die einzige Farbe. Display-Schrift *Syne*, Meta in *Space Mono*.
Signatur: invertierender, filterbarer **Index** mit cursor-folgender Bildvorschau.

Der Admin-Bereich (Werke verwalten, neue Positionen, PDF-Export) kommt in einer späteren Phase —
siehe `CLAUDE.md` Phase 3 & 4. Dieses Paket ist das fertige **Frontend/Design**.

## Starten

```bash
npm install
npm run dev
# http://localhost:3000
```

Es läuft sofort mit **Beispieldaten** und Platzhalterbildern.

## Mit echten Inhalten füllen (2 Schritte)

Beides liegt schon in deinem Downloads-Ordner `Geeske_Janssen_Portfolio/`.

**1) Inhalte** — ersetze die Beispieldatei durch deine echte JSON:

```powershell
copy "$env:USERPROFILE\Downloads\Geeske_Janssen_Portfolio\portfolio-content.json" ".\content\portfolio-content.json"
```

**2) Bilder** — kopiere die Bildordner nach `public/works/` (Texte/JSON/Screenshots ausgenommen):

```powershell
robocopy "$env:USERPROFILE\Downloads\Geeske_Janssen_Portfolio" ".\public\works" /E /XD _Screenshots /XF *.txt *.json
```

(Mac/Linux: `cp ~/Downloads/Geeske_Janssen_Portfolio/portfolio-content.json content/` und
`cp -R ~/Downloads/Geeske_Janssen_Portfolio/0*_*/ public/works/`.)

Danach `npm run dev` neu starten. Fertig — alle Bereiche, Projekte, Texte und Bilder erscheinen.

### Wie die Bilder zugeordnet werden
Die Pfade in `portfolio-content.json` sind **relativ** (z. B. `01_Fotografie/private_parts/01.jpg`).
Der Loader (`lib/content.ts`, Funktion `imgSrc`) macht daraus die Web-URL `/works/01_Fotografie/private_parts/01.jpg`.
Deshalb müssen die Bildordner exakt so unter `public/works/` liegen.

## Struktur

```
app/
  layout.tsx           Rahmen, Schriften, Navigation, Footer
  page.tsx             Start: Hero + filterbarer Index aller Arbeiten
  [section]/page.tsx   Bereich (Video/Fotografie/Installation/Performance)
  [section]/[slug]/    Werkdetail (Galerie, Meta, vor/zurück)
  ueber|cv|kontakt/    Textseiten
  template.tsx         Seitenübergang
  globals.css          Designsystem (Tokens + Komponenten)
components/
  Nav.tsx  WorkIndex.tsx  Gallery.tsx  Reveal.tsx
lib/content.ts         Laden/Typen, Bildpfad-Auflösung
content/portfolio-content.json   Inhalte (← hierhin deine echte Datei)
public/works/          Bilder (← hierhin deine Bildordner)
```

## Anpassen
- **Akzent/Farbe:** `app/globals.css`, `:root`-Tokens. Aktuell bewusst farblos — die Werke tragen die Farbe.
- **Schriften:** `app/layout.tsx` (next/font). Display `Syne`, Body `Inter Tight`, Mono `Space Mono`.
- **Video-Arbeiten:** Feld `videoUrl` (Vimeo/YouTube) pro Projekt in der JSON → wird als Player eingebettet.
- **Sprache DE/EN:** vorbereitbar, bewusst noch nicht eingebaut (erst nach dem Kern).

## Nächste Schritte
Siehe `CLAUDE.md`: Phase 3 (Payload-Admin) und Phase 4 (Bewerbungs-PDF). Lege `CLAUDE.md` mit ins Repo,
dann kann Claude Code daran weiterbauen.

## Admin / CMS (`/admin`)

Eigenes kleines CMS zum Verwalten der Inhalte.

- Aufrufen: `http://localhost:3000/admin`
- Login-Passwort: über `ADMIN_PASSWORD` (Standard `geeske`). Kopiere `.env.local.example` zu `.env.local` und setze ein eigenes Passwort + `ADMIN_SECRET`.
- Funktionen: Werke je Bereich anlegen/bearbeiten/löschen, Reihenfolge ändern, Bilder hochladen; Texte (Über/CV/Kontakt) pflegen; Portfolio-/Bewerbungs-Export (Anschreiben, Motivation, Zeitplan, Budget, CV + ausgewählte Arbeiten → „Als PDF speichern" über den Druckdialog).

Speicherung: Änderungen werden in `content/portfolio-content.json` geschrieben, hochgeladene Bilder unter `public/works/uploads/`. Im lokalen `npm run dev` erscheinen sie sofort. Für die **veröffentlichte** Seite danach neu deployen. Soll die Live-Seite direkt editierbar sein, später eine Datenbank anbinden (der Speicher ist in `lib/store.ts` gekapselt und austauschbar).
