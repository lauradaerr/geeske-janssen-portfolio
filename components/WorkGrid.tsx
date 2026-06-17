"use client";
import Link from "next/link";
import { useState } from "react";
import { imgSrc } from "@/lib/img";
import type { WorkRef } from "@/lib/types";
import { splitLang } from "@/lib/i18n";
import Bi from "@/components/Bi";

export default function WorkGrid({ works }: { works: WorkRef[] }) {
  const [hover, setHover] = useState<{ de: string; en: string; x: number; y: number } | null>(null);

  return (
    <div
      className="works"
      onMouseMove={(e) => setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))}
    >
      {works.map((w) => {
        const t = splitLang(w.title);
        return (
          <Link
            key={w.slug}
            href={`/${w.section}/${w.slug}`}
            className={`work-card${w.cover ? "" : " work-card--text"}`}
            onMouseEnter={(e) => setHover({ de: t.de, en: t.en, x: e.clientX, y: e.clientY })}
            onMouseLeave={() => setHover(null)}
          >
            <span className="work-card__img">
              {w.cover ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={imgSrc(w.cover)} alt={t.de} loading="lazy" />
              ) : (
                <span className="work-card__ph"><Bi de={t.de} en={t.en} /></span>
              )}
            </span>
            <span className="work-card__cap"><Bi de={t.de} en={t.en} /></span>
          </Link>
        );
      })}

      {hover && (
        <span className="work-cursor" style={{ left: hover.x, top: hover.y }} aria-hidden="true">
          <Bi de={hover.de} en={hover.en} />
        </span>
      )}
    </div>
  );
}
