"use client";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { imgSrc } from "@/lib/img";
import type { WorkRef } from "@/lib/types";
import { splitLang } from "@/lib/i18n";
import Bi from "@/components/Bi";

const MOBILE_Q = "(max-width: 760px)";

export default function WorkGrid({ works }: { works: WorkRef[] }) {
  const [hover, setHover] = useState<{ de: string; en: string; x: number; y: number } | null>(null);
  const [cols, setCols] = useState(3); // SSR-Default Desktop; auf Mobil nach Mount korrigiert
  const [measured, setMeasured] = useState(false);
  // Verteilung der Werk-Slugs auf Spalten (gleich, wie die Höhen berechnet wurden)
  const [colSlugs, setColSlugs] = useState<string[][]>(() => roundRobin(works, 3));
  // berechnete Höhe (px) pro Karten-Slug
  const [heights, setHeights] = useState<Record<string, number>>({});

  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  // Responsive Spaltenzahl: 1 auf Mobil, 3 auf Desktop
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_Q);
    const apply = () => setCols(mq.matches ? 1 : 3);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Greedy-Verteilung anhand der gemessenen Bildhöhen + Angleichen aller Spalten
  // auf die höchste → bündiger unterer Abschluss. Render nutzt EXAKT diese Verteilung.
  const layout = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    // Mobil: keine Angleichung, volle Bilder in Originalreihenfolge
    if (cols < 2) {
      setColSlugs([works.map((w) => w.slug)]);
      setHeights({});
      setMeasured(false);
      return;
    }

    const colW = root.clientWidth / cols;
    if (colW <= 0) return;

    // natürliche Höhe je Karte bei Spaltenbreite
    const nat = works.map((w) => {
      const el = cardRefs.current[w.slug];
      const img = el?.querySelector("img") as HTMLImageElement | null;
      let h: number;
      if (img && img.naturalWidth > 0) {
        h = colW * (img.naturalHeight / img.naturalWidth);
      } else {
        const ph = el?.querySelector(".work-card__ph") as HTMLElement | null;
        h = ph?.offsetHeight || colW * 0.75;
      }
      return { slug: w.slug, h };
    });

    // Greedy: jede Karte der aktuell kürzesten Spalte zuordnen
    const sum = new Array(cols).fill(0);
    const items: { slug: string; h: number }[][] = Array.from({ length: cols }, () => []);
    for (const item of nat) {
      let min = 0;
      for (let c = 1; c < cols; c++) if (sum[c] < sum[min]) min = c;
      items[min].push(item);
      sum[min] += item.h;
    }

    // Zielhöhe = höchste Spalte; jede Spalte mit Faktor hochskalieren
    const target = Math.max(...sum);
    const nextH: Record<string, number> = {};
    for (let c = 0; c < cols; c++) {
      const f = sum[c] > 0 ? target / sum[c] : 1;
      for (const item of items[c]) nextH[item.slug] = Math.round(item.h * f);
    }
    setColSlugs(items.map((col) => col.map((i) => i.slug)));
    setHeights(nextH);
    setMeasured(true);
  }, [cols, works]);

  useLayoutEffect(() => { layout(); }, [layout]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => { clearTimeout(t); t = setTimeout(layout, 120); };
    window.addEventListener("resize", onResize);
    return () => { clearTimeout(t); window.removeEventListener("resize", onResize); };
  }, [layout]);

  const bySlug = new Map(works.map((w) => [w.slug, w]));

  const renderCard = (slug: string) => {
    const w = bySlug.get(slug);
    if (!w) return null;
    const t = splitLang(w.title);
    const h = heights[w.slug];
    return (
      <Link
        key={w.slug}
        ref={(el) => { cardRefs.current[w.slug] = el; }}
        href={`/${w.section}/${w.slug}`}
        className={`work-card${w.cover ? "" : " work-card--text"}`}
        onMouseEnter={(e) => setHover({ de: t.de, en: t.en, x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setHover(null)}
      >
        <span className="work-card__img" style={h ? { height: h } : undefined}>
          {w.cover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={imgSrc(w.cover)} alt={t.de} loading="eager" onLoad={layout} />
          ) : (
            <span className="work-card__ph"><Bi de={t.de} en={t.en} /></span>
          )}
        </span>
        <span className="work-card__cap"><Bi de={t.de} en={t.en} /></span>
      </Link>
    );
  };

  return (
    <div
      ref={rootRef}
      className={`works${measured ? " works--measured" : ""}`}
      onMouseMove={(e) => setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : h))}
    >
      {colSlugs.map((col, c) => (
        <div className="works__col" key={c}>
          {col.map(renderCard)}
        </div>
      ))}

      {hover && (
        <span className="work-cursor" style={{ left: hover.x, top: hover.y }} aria-hidden="true">
          <Bi de={hover.de} en={hover.en} />
        </span>
      )}
    </div>
  );
}

function roundRobin(works: WorkRef[], cols: number): string[][] {
  const out: string[][] = Array.from({ length: cols }, () => []);
  works.forEach((w, i) => out[i % cols].push(w.slug));
  return out;
}
