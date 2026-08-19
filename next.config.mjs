/** @type {import('next').NextConfig} */
const nextConfig = {
  // Kein Dev-Indikator (das kleine Logo unten links). Nur lokal sichtbar.
  devIndicators: false,
  // Bilder NICHT in die Serverless-Funktionen bündeln (werden statisch ausgeliefert;
  // online läuft das Speichern über Vercel Blob). Sonst sprengt der Bundle das 300-MB-Limit.
  outputFileTracingExcludes: {
    "**": ["public/works/**"],
  },
  // Bilder liegen als statische Dateien unter /public/works und werden direkt
  // ausgeliefert. Wenn du spaeter auf next/image + Optimierung umstellst,
  // hier ggf. remotePatterns / formats konfigurieren.
  experimental: {
    // Bild-Uploads im CMS: der Next-Standard von 1 MB ist zu klein.
    // WICHTIG: Vercel begrenzt den Request-Body von Server-Funktionen auf
    // 4,5 MB - das laesst sich hier NICHT hochsetzen. Ein hoeherer Wert wirkt
    // nur lokal. Darum werden Bilder im Browser verkleinert (lib/resize.ts)
    // und einzeln hochgeladen (uploadImageAction).
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
