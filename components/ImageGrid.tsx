"use client";
import { useState, type ReactNode } from "react";
import { imgSrc } from "@/lib/img";
import Lightbox from "@/components/Lightbox";

const SZ: Record<string, string> = { s: "work__fig--s", m: "work__fig--m", l: "work__fig--l" };

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
  if (images.length === 0) return <div className="work__grid work__grid--single"><div className="work__col-text">{lead}</div></div>;

  const [first, ...rest] = images;
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

      {/* Restliche Bilder (Desktop: rechte Spalte als Masonry) */}
      {rest.length > 0 && (
        <div className={`work__images${rest.length <= 1 ? " work__images--single" : ""}`}>
          {rest.map((src, i) => {
            const idx = i + 1;
            return (
              <figure className={`work__fig ${SZ[sizes?.[idx] || "m"]}`} key={src + idx}>
                <button className="work__thumb" onClick={() => setOpen(idx)} aria-label={`Bild ${idx + 1} öffnen`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgSrc(src)} alt={alt ? `${alt} — ${idx + 1}` : ""} loading="lazy" />
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
