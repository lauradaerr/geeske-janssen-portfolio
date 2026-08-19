/* Bild-Aufbereitung im Browser (nur Client).
 *
 * Warum: Vercel begrenzt den Request-Body von Server-Funktionen auf 4,5 MB —
 * unabhaengig von `serverActions.bodySizeLimit`. Ein Kamerafoto (5-15 MB) wird
 * darum schon von der Plattform mit 413 abgewiesen, bevor unser Code laeuft.
 * Deshalb verkleinern wir vor dem Upload auf Webgroesse. Nebeneffekt: das Repo
 * bleibt klein und die Seite schnell.
 */

/** Obergrenze pro Upload-Request (Sicherheitsabstand zum 4,5-MB-Limit von Vercel). */
export const MAX_UPLOAD_BYTES = 4_000_000;

const MAX_EDGE = 2000;   // laengste Kante in px — reicht fuer Vollbild-Darstellung
const QUALITY = 0.82;    // JPEG-Qualitaet
const KEEP_AS_IS = 900_000; // kleine Dateien unveraendert durchlassen

type Decoded = { image: CanvasImageSource; width: number; height: number; release: () => void };

/** Bild dekodieren — bevorzugt createImageBitmap (respektiert EXIF-Drehung),
 *  sonst ueber ein <img>-Element (Browser wendet EXIF selbst an). */
async function decode(file: File): Promise<Decoded | null> {
  if (typeof createImageBitmap === "function") {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
      return { image: bmp, width: bmp.width, height: bmp.height, release: () => bmp.close() };
    } catch {
      // weiter zum <img>-Fallback
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode failed"));
      el.src = url;
    });
    return {
      image: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch {
    URL.revokeObjectURL(url);
    return null;
  }
}

/** Verkleinert ein Bild auf Webgroesse. Gibt im Zweifel die Originaldatei zurueck. */
export async function prepareImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  // GIF (Animation) und SVG (Vektor) nicht neu kodieren.
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  const src = await decode(file);
  if (!src) return file; // Format kann der Browser nicht dekodieren (z. B. HEIC)

  const scale = Math.min(1, MAX_EDGE / Math.max(src.width, src.height));
  if (scale === 1 && file.size <= KEEP_AS_IS) {
    src.release();
    return file;
  }

  const w = Math.max(1, Math.round(src.width * scale));
  const h = Math.max(1, Math.round(src.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) { src.release(); return file; }
  ctx.drawImage(src.image, 0, 0, w, h);
  src.release();

  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", QUALITY));
  if (!blob) return file;
  // Original nur behalten, wenn es kleiner UND selbst schon klein genug ist.
  if (blob.size >= file.size && file.size <= KEEP_AS_IS) return file;

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}

/** Menschenlesbare Groesse fuer Meldungen. */
export function humanSize(bytes: number): string {
  return bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.round(bytes / 1000)} KB`;
}
