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
    // Bild-Uploads im CMS koennen mehrere MB gross sein. Standard ist 1 MB,
    // was bei Fotos zum "client-side exception" fuehrt - daher anheben.
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
