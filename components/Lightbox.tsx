"use client";
import { useEffect, useCallback } from "react";
import { imgSrc } from "@/lib/img";

export default function Lightbox({
  images,
  index,
  setIndex,
  onClose,
  alt = "",
  credits,
}: {
  images: string[];
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
  alt?: string;
  credits?: (string | undefined)[];
}) {
  const prev = useCallback(() => setIndex((index - 1 + images.length) % images.length), [index, images.length, setIndex]);
  const next = useCallback(() => setIndex((index + 1) % images.length), [index, images.length, setIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [prev, next, onClose]);

  const credit = credits?.[index];

  return (
    <div className="lb" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="lb__bar">
        <span className="lb__counter mono">{images.length > 1 ? `${index + 1} / ${images.length}` : ""}</span>
        <button className="lb__x" aria-label="Schließen" onClick={onClose}>✕</button>
      </div>

      <div className="lb__stage" onClick={onClose}>
        {images.length > 1 && (
          <button className="lb__nav lb__nav--prev" aria-label="Vorheriges Bild" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="lb__img" src={imgSrc(images[index])} alt={alt} onClick={(e) => e.stopPropagation()} />
        {images.length > 1 && (
          <button className="lb__nav lb__nav--next" aria-label="Nächstes Bild" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
        )}
      </div>

      <div className="lb__cap mono">{credit || ""}</div>
    </div>
  );
}
