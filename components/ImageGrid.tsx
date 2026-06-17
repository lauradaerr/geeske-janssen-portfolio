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
  if (images.length === 0) return <>{lead}</>;

  const [first, ...rest] = images;
  return (
    <>
      {/* Großes Hero-Bild oben */}
      <figure className="work__hero">
        <button className="work__thumb" onClick={() => setOpen(0)} aria-label="Bild 1 öffnen">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgSrc(first)} alt={alt ? `${alt} — 1` : ""} />
        </button>
        {credits?.[0] && <figcaption className="work__caption">{credits[0]}</figcaption>}
      </figure>

      {/* Text / Video */}
      {lead}

      {/* Restliche Bilder */}
      {rest.length > 0 && (
        <div className="work__images">
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
    </>
  );
}
