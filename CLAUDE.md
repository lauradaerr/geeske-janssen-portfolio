# Build-Briefing — Portfolio Geeske Janßen (Neuaufbau)

> Dieses Dokument ist für **Claude Code in VS Code** geschrieben. Lege es als `CLAUDE.md` in den Projekt-Root. Claude Code liest es automatisch als Kontext. Du kannst die Phasen-Prompts am Ende einzeln einfügen.

---

## 0. Worum geht es

Neubau der Künstler-Website von **Geeske Janßen** (bildende Kunst: Video, Fotografie, Installation, Performance). Das alte Adobe-Portfolio läuft aus. Material liegt bereits gesichert vor (siehe Abschnitt 6).

**Ziele**
- Modernes, künstlerisch-redaktionelles Design, das **spannend zu erkunden** ist (Interaktion, Bewegung), aber ruhig und professionell bleibt — die Arbeiten stehen im Vordergrund.
- Klare Struktur, die die Bereiche **Video / Fotografie / Installation / Performance** stark herausstellt.
- **Admin-Bereich** im Hintergrund: Werke verwalten, neue Positionen anlegen, Inhalte pflegen.
- **Portfolio-/Bewerbungs-Export als PDF**: frei eingebbares Anschreiben, Motivation, Zeitplan, Budget, Lebenslauf — plus die ausgewählten künstlerischen Arbeiten.

---

## 1. Tech-Stack (Empfehlung)

| Schicht | Wahl | Warum |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | Läuft sauber auf Vercel; SSR/SSG; ein Repo für Front + Admin + API. |
| Styling | **Tailwind CSS v4** + CSS-Variablen (Design-Tokens) | Schnell, konsistent, gut mit Claude Code. |
| Animation | **Framer Motion** (`motion`) | Seitenübergänge, Scroll-Reveals, Hover-Previews. |
| Admin / CMS | **Payload CMS 3** (läuft *im* Next-App, Route `/admin`) | Echter, hübscher Admin-Backend ohne zweites System; Collections, Media-Uploads, Rollen. |
| Datenbank | **Postgres** (Neon oder Vercel Postgres) | Von Payload unterstützt; serverless-tauglich. |
| Medien | **Vercel Blob** (oder S3) | Bild-/Video-Uploads aus dem Admin. |
| PDF-Export | **@react-pdf/renderer** | PDF serverseitig aus React-Komponenten rendern (kein Headless-Chrome nötig). |
| Deploy | **Vercel** | Vorhanden; Domain via Strato-DNS verbinden (Abschnitt 7). |

**Alternative, falls Payload + DB zu viel ist:** Headless-CMS **Sanity** (gehostetes Studio) — weniger Infrastruktur, aber zweites System. Oder für den Start **rein dateibasiert** (Inhalte als JSON/MDX im Repo, Pflege über Git) und Admin später nachrüsten. Empfehlung bleibt Payload, weil „Admin im Hintergrund + neue Positionen anlegen + PDF-Export" damit am saubersten in einem Repo lebt.

---

## 2. Designkonzept (aus deinen Referenzen abgeleitet)

Referenzen: world2.uk, simondenny.net, f451.studio/atelier-pierre-pierre, sowie Moriz Oberberger, 5pm.fr, RCA Design Interactions, Leonardo Devito, The Power Plant.

**Gemeinsamer Nenner:** Swiss/editorial-modern — große, selbstbewusste Typografie, strenges Raster, viel Weißraum, monospace „Meta"-Labels (Jahr, Medium, Maße), volle Bildflächen, ruhige aber präzise Interaktion. Archiv-Charakter mit **Filtern** (Bereich/Jahr/Technik, siehe Devito) und **Hover-Vorschau** in Listen (Denny/F451).

### Design-Tokens (`app/globals.css`)
```css
:root{
  /* Farbe — ruhige Basis, ein kräftiger Akzent */
  --ink:        #0B0B0A;   /* Text/Linien */
  --paper:      #F6F5F1;   /* warmes Off-White */
  --paper-2:    #ECEAE3;   /* Sektionsflächen */
  --accent:     #2E2BFF;   /* ein einziger Akzent (Links/Hover) — anpassbar */
  --muted:      #8A877E;   /* Meta-Text */
  /* Typo-Skala (fluid) */
  --step--1: clamp(.8rem,.78rem + .1vw,.9rem);
  --step-0:  clamp(1rem,.95rem + .25vw,1.15rem);
  --step-2:  clamp(1.6rem,1.3rem + 1.5vw,2.6rem);
  --step-4:  clamp(2.8rem,2rem + 4vw,5.5rem);
  --step-6:  clamp(4rem,2.5rem + 8vw,9rem);  /* Display */
}
@media (prefers-color-scheme: dark){
  :root{ --ink:#F3F1EA; --paper:#0B0B0A; --paper-2:#161513; --muted:#8A877E; }
}
```

### Schriften
- **Display/UI:** „Geist" (Vercel, kostenlos) **oder** „Inter Tight" — dicht, modern, neutral-präzise.
- **Akzent (optional):** eine charaktervolle Serif für Titel, z. B. „Fraunces" oder „Instrument Serif" — sparsam einsetzen.
- **Mono (Meta-Labels):** „Geist Mono" / „JetBrains Mono" — für Jahr, Medium, Maße, Dateinamen (wie `DSCF2108.JPG` bei Oberberger).
- Lade Fonts über `next/font` (kein Layout-Shift).

### Layout & Interaktion
- **Persistente, schlanke Navigation** (fix, oben oder links): `Werk` → Video · Fotografie · Installation · Performance — daneben `Über` · `CV` · `Kontakt`. Aktueller Bereich hervorgehoben.
- **Startseite:** großer typografischer Auftritt (Name/Claim) + eine **explorierbare Index-Liste** aller Bereiche mit Hover-Vorschaubild (Cursor-follow). Optional kuratiertes „Featured"-Raster.
- **Bereichsseiten:** Voll-Bild-Header + filter-/sortierbares Raster bzw. Liste der Projekte (Filter: Jahr, Medium).
- **Werkdetail:** großzügige Galerie (Lightbox/Scroll), Titel + Meta (Jahr/Medium/Maße), Beschreibungstext, `← vorheriges / nächstes →`. Bei Video: eingebetteter Player (Vimeo/YT) statt Standbild.
- **Bewegung:** weiche Seitenübergänge (Framer Motion `AnimatePresence`), Scroll-Reveal der Bilder, dezente magnetische/Cursor-Akzente. Sparsam — nie verspielt auf Kosten der Arbeiten. `prefers-reduced-motion` respektieren.

### Signatur-Komponente: Hover-Preview-Index
```tsx
// components/IndexList.tsx  (Skizze — Liste mit Cursor-folgender Bildvorschau)
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function IndexList({ items }:{ items:{slug:string; title:string; section:string; year?:string; cover:string; href:string}[] }){
  const [hover,setHover]=useState<string|null>(null);
  const active=items.find(i=>i.slug===hover);
  return (
    <div onMouseMove={/* Mausposition für Vorschau tracken */ ()=>{}} className="relative">
      <ul className="divide-y divide-[var(--ink)]/15">
        {items.map(i=>(
          <li key={i.slug} onMouseEnter={()=>setHover(i.slug)} onMouseLeave={()=>setHover(null)}>
            <a href={i.href} className="group grid grid-cols-12 items-baseline py-4">
              <span className="col-span-7 text-[var(--step-2)] leading-none">{i.title}</span>
              <span className="col-span-3 font-mono text-[var(--step--1)] text-[var(--muted)]">{i.section}</span>
              <span className="col-span-2 font-mono text-[var(--step--1)] text-[var(--muted)] text-right">{i.year}</span>
            </a>
          </li>
        ))}
      </ul>
      <AnimatePresence>
        {active && (
          <motion.img src={active.cover} alt="" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="pointer-events-none fixed z-50 w-[28vw] max-w-[420px] object-cover" /* Position an Maus koppeln */ />
        )}
      </AnimatePresence>
    </div>
  );
}
```

---

## 3. Seitenstruktur / Routen

```
/                       Start: Auftritt + explorierbarer Index
/video                  Bereich Video
/fotografie             Bereich Fotografie
/installation           Bereich Installation
/performance            Bereich Performance
/[section]/[slug]       Werkdetail (z. B. /fotografie/private-parts)
/ueber                  Über die Arbeiten (Statement)
/cv                     Lebenslauf
/kontakt                Kontakt / Impressum
/admin                  Payload Admin (geschützt)
/admin/export           Bewerbungs-/Portfolio-PDF erstellen
/api/export/pdf         Server-Route, liefert das PDF
```

---

## 4. Datenmodell (Payload Collections & Globals)

```ts
// Collection: works
{
  slug:'works',
  fields:[
    { name:'title', type:'text', required:true },
    { name:'slug', type:'text', unique:true, admin:{ position:'sidebar' } },
    { name:'section', type:'select', required:true,
      options:['fotografie','video','installation','performance'] },
    { name:'year', type:'text' },
    { name:'medium', type:'text' },          // z. B. „C-Print", „2-Kanal-Video"
    { name:'dimensions', type:'text' },
    { name:'description', type:'richText' },
    { name:'images', type:'array', fields:[{ name:'image', type:'upload', relationTo:'media' }] },
    { name:'videoUrl', type:'text' },         // Vimeo/YouTube für Video-Arbeiten
    { name:'featured', type:'checkbox' },
    { name:'order', type:'number', admin:{ position:'sidebar' } },
  ]
}
// Collection: media (Payload upload, Vercel Blob als Storage-Adapter)

// Globals:
// about    -> { statement: richText }                       (= „Über die Arbeiten")
// cv        -> { entries: array<{ year, title, kind }>  oder  body: richText }
// contact   -> { email, phone, address, links: array, imprint: richText }
// exportDefaults -> Standard-Textbausteine für Anschreiben/Motivation/Zeitplan/Budget
```

Die vorhandene `portfolio-content.json` (Abschnitt 6) wird per Seed-Skript in `works` + Globals importiert.

---

## 5. Portfolio-/Bewerbungs-PDF (Kernfeature)

Eigener Admin-Bereich `/admin/export`. Geeske kann pro Bewerbung eine **Mappe** zusammenstellen und als PDF exportieren.

**Eingabefelder (frei editierbar, mit Vorlagen):**
1. **Anschreiben** (Empfänger, Betreff, Fließtext)
2. **Motivation**
3. **Zeitplan / Timetable** (Tabelle: Phase · Zeitraum · Inhalt)
4. **Budget** (Tabelle: Posten · Betrag; Summe)
5. **Lebenslauf** (aus Global `cv`, überschreibbar)
6. **Künstlerisches Portfolio** — Auswahl der Werke (Mehrfachauswahl + Reihenfolge + pro Werk auswählbare Bilder)

**Render-Weg:** `@react-pdf/renderer` in einer Server-Route. Seitenfolge: Titelblatt → Anschreiben → Motivation → Zeitplan → Budget → Lebenslauf → Werke (je Werk: Titel/Jahr/Medium + Bild(er) + Beschreibung). Presets speichern (Collection `exportPresets`), damit verschiedene Bewerbungen schnell gehen.

```tsx
// app/api/export/pdf/route.ts  (Skizze)
import { renderToBuffer, Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
export async function POST(req: Request){
  const data = await req.json(); // { anschreiben, motivation, zeitplan[], budget[], cv, works[] }
  const buf = await renderToBuffer(<Mappe {...data} />);
  return new Response(buf, { headers:{ 'Content-Type':'application/pdf',
    'Content-Disposition':`attachment; filename="Portfolio_Geeske_Janssen.pdf"` }});
}
```
Designe das PDF im gleichen typografischen Geist wie die Website (gleiche Schriften, ruhiges Raster, Meta in Mono).

---

## 6. Vorhandenes Material (im Downloads-Ordner)

Ordner **`Geeske_Janssen_Portfolio/`** enthält:
- `00_TEXTE_geeskejanssen.txt` — alle Texte (Statement, CV, Kontakt, alle Projektbeschreibungen).
- `portfolio-content.json` — **strukturierte** Inhalte: `meta`, `about`, `cv`, `contact`, `sections[]` mit `projects[]` (`slug`, `title`, `text`, `images[]`) und `additional[]`. Die `images`-Pfade entsprechen exakt der Ordnerstruktur.
- `01_Fotografie/ … 04_Performance/` — **153 Originalbilder**, nach Bereich/Projekt sortiert (z. B. `01_Fotografie/private_parts/01.jpg`), plus `_uebersicht/` (nur auf Übersichtsseiten gezeigte Bilder).
- `_Screenshots/` — ganzseitige Screenshots der alten Seiten (Layout-Referenz).

**Integration:** Bilder nach `public/works/<bereich>/<projekt>/…` kopieren (Pfade in der JSON ggf. anpassen) **oder** im Seed über Payload-Media hochladen. `portfolio-content.json` ist die Quelle für das Seed-Skript.

> Hinweis: Video-Arbeiten brauchen die eigentlichen Videos (Vimeo/YouTube-Links oder Dateien) — die liegen nicht in den Bildern. Felder `videoUrl` dafür vorgesehen.

---

## 7. Deploy: Vercel + Strato-Domain

1. Repo zu Vercel (vorhandenes Projekt weiterverwenden oder neu).
2. Env-Variablen: `DATABASE_URI` (Neon/Vercel Postgres), `PAYLOAD_SECRET`, `BLOB_READ_WRITE_TOKEN` (Vercel Blob).
3. Domain: bei **Strato** im DNS die Vercel-Ziele setzen — i. d. R. `A`-Record `@ → 76.76.21.21` und `CNAME` `www → cname.vercel-dns.com` (in Vercel unter *Domains* die exakt angezeigten Werte verwenden). Danach in Vercel die Domain hinzufügen und verifizieren.
4. `/admin` per Payload-Auth schützen (nur Geeske).

---

## 8. Build-Plan — Phasen-Prompts für Claude Code

Füge die Prompts nacheinander ein. Erst nach grünem Build zur nächsten Phase.

**Phase 0 — Setup**
> „Initialisiere ein Next.js 15 Projekt (App Router, TypeScript, Tailwind v4) mit Framer Motion. Richte die Design-Tokens aus `CLAUDE.md` Abschnitt 2 in `app/globals.css` ein, lade `Geist`, `Geist Mono` und `Fraunces` über `next/font`. Baue ein Basis-Layout mit persistenter, schlanker Navigation (Video, Fotografie, Installation, Performance, Über, CV, Kontakt) und respektiere `prefers-reduced-motion`. Noch keine Inhalte — nur Gerüst, Typo und Navigation."

**Phase 1 — Inhaltsschicht (ohne CMS)**
> „Lege `content/portfolio-content.json` ab (Datei liegt vor). Erzeuge daraus typsichere Loader (`lib/content.ts`) und statische Seiten: Startseite mit der Hover-Preview-Index-Liste (Skizze in CLAUDE.md §2), Bereichsseiten `/[section]`, Werkdetail `/[section]/[slug]` mit Galerie + Meta + prev/next, sowie `/ueber`, `/cv`, `/kontakt`. Bilder aus `public/works/…`. Designe konsequent im Stil aus §2."

**Phase 2 — Interaktion & Feinschliff**
> „Ergänze Seitenübergänge (AnimatePresence), Scroll-Reveal der Bilder, Cursor-folgende Vorschau im Index und Filter (Jahr/Medium) auf den Bereichsseiten. Achte auf Performance (next/image), A11y und Reduced-Motion."

**Phase 3 — Admin (Payload)**
> „Integriere Payload CMS 3 in dieselbe Next-App (Route `/admin`), Postgres-Adapter, Collections `works` und `media` sowie Globals `about`, `cv`, `contact` gemäß CLAUDE.md §4. Storage-Adapter Vercel Blob. Schreibe ein Seed-Skript, das `portfolio-content.json` in `works` und die Globals importiert. Stelle die Front-End-Loader auf Payload um."

**Phase 4 — Portfolio-/Bewerbungs-PDF**
> „Baue `/admin/export` und `app/api/export/pdf/route.ts` mit @react-pdf/renderer gemäß CLAUDE.md §5: Eingabe von Anschreiben, Motivation, Zeitplan (Tabelle), Budget (Tabelle), Lebenslauf, plus Werkauswahl mit Reihenfolge und Bildauswahl. PDF im Website-Designgeist. Presets als Collection `exportPresets` speichern."

**Phase 5 — Deploy**
> „Bereite das Deployment auf Vercel vor (Env-Variablen, Build-Settings), dokumentiere die Strato-DNS-Schritte aus CLAUDE.md §7 in einer `DEPLOY.md`."

---

## 9. Qualitäts-Leitplanken
- Die **Arbeiten** sind der Star — Design dient ihnen, drängt sich nie auf.
- Schnell (Bild-Optimierung, kein Layout-Shift), responsiv, barrierearm, `prefers-reduced-motion`.
- Konsistente Meta-Typografie (Mono) für Jahr/Medium/Maße.
- Ein einziger Akzentton — Farbe sparsam.
- Texte/Sprachen: Inhalte sind deutsch; Option für DE/EN-Umschaltung vormerken (wie bei Devito), aber erst nach dem Kern.
