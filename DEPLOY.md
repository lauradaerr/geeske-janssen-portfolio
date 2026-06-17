# Deployment — geeske-janssen.vercel.app

Stack: Next.js 15 (App Router). Inhalte & Bilder werden online in **Vercel Blob** gespeichert,
lokal im Dateisystem (`content/portfolio-content.json`, `public/works/`).

## Speicher-Logik (lib/store.ts)
- `BLOB_READ_WRITE_TOKEN` gesetzt → Inhalte/Bilder in Vercel Blob (Online-Betrieb).
- nicht gesetzt → lokales Dateisystem (Entwicklung).
- `content/portfolio-content.json` ist der Startbestand/Fallback.

## Vercel — Umgebungsvariablen (Production)
- `ADMIN_PASSWORD` — Login fürs CMS unter `/admin`
- `ADMIN_SECRET` — lange Zufalls-Zeichenkette zum Signieren der Session
- `BLOB_READ_WRITE_TOKEN` — wird automatisch gesetzt, wenn der Blob-Store mit dem Projekt verbunden ist

## Deploy (CLI)
```
vercel link --yes --project geeske-janssen      # einmalig
vercel --prod                                     # Production-Deploy
```

## Strato-Domain verbinden (später)
1. In Vercel: Projekt → Settings → Domains → Domain hinzufügen (z. B. `geeskejanssen.de`).
2. Bei Strato im DNS die von Vercel angezeigten Werte setzen:
   - `A`-Record: `@ → 76.76.21.21`
   - `CNAME`: `www → cname.vercel-dns.com`
3. In Vercel die Domain verifizieren (kann bis zu einige Stunden DNS-Propagation dauern).
