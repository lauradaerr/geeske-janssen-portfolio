import Link from "next/link";
import Bi from "@/components/Bi";
import { imgSrc, themeClass } from "@/lib/img";
import type { Section } from "@/lib/types";
import { sectionLabelEn } from "@/lib/i18n";

export default function MediumBand({ section, thumbs }: { section: Section; thumbs: string[] }) {
  const n = String(section.projects.length).padStart(2, "0");
  return (
    <Link href={`/${section.key}`} className={`band ${themeClass(section.key)}`} aria-label={section.label}>
      <div className="band__text">
        <span className="band__title"><Bi de={section.label} en={sectionLabelEn(section.key, section.label)} /></span>
        <span className="band__sub">
          <span><Bi de={`${n} Arbeiten`} en={`${n} works`} /></span>
          <span className="cta"><Bi de="Ansehen →" en="View →" /></span>
        </span>
      </div>
      {thumbs.length > 0 && (
        <div className="band__thumbs" aria-hidden="true">
          {thumbs.map((src, i) => (
            <span className="thumb" key={src + i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgSrc(src)} alt="" loading="lazy" />
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
