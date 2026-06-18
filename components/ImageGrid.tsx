"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { imgSrc } from "@/lib/img";
import Lightbox from "@/components/Lightbox";

const SZ: Record<string, string> = { s: "work__fig--s", m: "work__fig--m", l: "work__fig--l" };
const DESKTOP_Q = "(min-width: 761px)";
const MAX_RATIO = 1.45; // max. Höhe/Breite je Bild → sehr hohe Hochformate werden begrenzt (kein Riesenbild)

type Box = { left: number; top: number; width: number; height: number };

export default function ImageGrid({
  images,
  alt = "",
  credits,
  sizes,
  lead,
}: {
  images: string[];
  alt?: string;
  credits?: (string | undefined)[];
  sizes?: (string | undefined)[];
  lead?: ReactNode;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [boxes, setBoxes] = useState<Record<number, Box>>({});
  const [containerH, setContainerH] = useState(0);

  const restWrapRef = useRef<HTMLDivElement>(null);
  const imgRefs = useRef<Record<number, HTMLImageElement | null>>({});

  const rest = images.length > 1 ? images.slice(1) : [];

  // Desktop-Masonry: gleiche Sortierung wie Kategorieseiten (greedy auf kürzeste Spalte),
  // Spalten auf gleiche Höhe angleichen (object-fit cover) → unten bündig. Mobil: nichts tun.
  const layout = useCallback(() => {
    const wrap = restWrapRef.current;
    if (!wrap || rest.length === 0) return;

    const desktop = window.matchMedia(DESKTOP_Q).matches;
    if (!desktop) {
      setBoxes((b) => (Object.keys(b).length ? {} : b));
      setContainerH(0);
      return;
    }

    const cols = rest.length <= 1 ? 1 : 2;
    const colW = wrap.clientWidth / cols;
    if (colW <= 0) return;

    // natürliche (begrenzte) Höhe je Bild; abbrechen wenn noch nicht geladen
    const nat: number[] = [];
    for (let i = 0; i < rest.length; i++) {
      const img = imgRefs.current[i];
      if (!img || img.naturalWidth === 0) return; // wartet auf onLoad
      nat[i] = Math.min(colW * (img.naturalHeight / img.naturalWidth), colW * MAX_RATIO);
    }

    // greedy: jedes Bild der kürzesten Spalte zuordnen
    const sum = new Array(cols).fill(0);
    const colItems: number[][] = Array.from({ length: cols }, () => []);
    for (let i = 0; i < rest.length; i++) {
      let min = 0;
      for (let c = 1; c < cols; c++) if (sum[c] < sum[min]) min = c;
      colItems[min].push(i);
      sum[min] += nat[i];
    }

    // Zielhöhe = höchste Spalte; jede Spalte hochskalieren → bündig
    const target = Math.max(...sum);
    const next: Record<number, Box> = {};
    for (let c = 0; c < cols; c++) {
      const f = sum[c] > 0 ? target / sum[c] : 1;
      let y = 0;
      for (const i of colItems[c]) {
        const h = Math.round(nat[i] * f);
        next[i] = { left: Math.round(c * colW), top: Math.round(y), width: Math.round(colW), height: h };
        y += h;
      }
    }
    setBoxes(next);
    setContainerH(Math.round(target));
  }, [rest.length]);

  useLayoutEffect(() => { layout(); }, [layout]);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_Q);
    let t: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => { clearTimeout(t); t = setTimeout(layout, 120); };
    window.addEventListener("resize", onResize);
    mq.addEventListener("change", layout);
    return () => { clearTimeout(t); window.removeEventListener("resize", onResize); mq.removeEventListener("change", layout); };
  }, [layout]);

  if (images.length === 0) {
    return <div className="work__grid work__grid--single"><div className="work__col-text">{lead}</div></div>;
  }

  const first = images[0];
  const measured = Object.keys(boxes).length > 0;

  return (
    <div className={`work__grid${images.length <= 1 ? " work__grid--single" : ""}`}>
      {/* Großes Hero-Bild (Desktop: rechte Spalte oben; Mobil: zuerst) */}
      <figure className="work__hero">
        <button className="work__thumb" onClick={() => setOpen(0)} aria-label="Bild 1 öffnen">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgSrc(first)} alt={alt ? `${alt} — 1` : ""} />
        </button>
        {credits?.[0] && <figcaption className="work__caption">{credits[0]}</figcaption>}
      </figure>

      {/* Text / Video (Desktop: linke Spalte, sticky) */}
      <div className="work__col-text">{lead}</div>

      {/* Restliche Bilder (Desktop: rechte Spalte als angeglichenes Masonry) */}
      {rest.length > 0 && (
        <div
          ref={restWrapRef}
          className={`work__images${rest.length <= 1 ? " work__images--single" : ""}${measured ? " work__images--measured" : ""}`}
          style={measured ? { height: containerH } : undefined}
        >
          {rest.map((src, i) => {
            const idx = i + 1;
            const box = boxes[i];
            return (
              <figure
                className={`work__fig ${SZ[sizes?.[idx] || "m"]}`}
                key={src + idx}
                style={box ? { position: "absolute", left: box.left, top: box.top, width: box.width, height: box.height } : undefined}
              >
                <button className="work__thumb" onClick={() => setOpen(idx)} aria-label={`Bild ${idx + 1} öffnen`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={(el) => { imgRefs.current[i] = el; }}
                    src={imgSrc(src)}
                    alt={alt ? `${alt} — ${idx + 1}` : ""}
                    loading="eager"
                    onLoad={layout}
                  />
                </button>
                {credits?.[idx] && <figcaption className="work__caption">{credits[idx]}</figcaption>}
              </figure>
            );
          })}
        </div>
      )}

      {open !== null && (
        <Lightbox images={images} index={open} setIndex={setOpen} onClose={() => setOpen(null)} alt={alt} credits={credits} />
      )}
    </div>
  );
}
