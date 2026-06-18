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
  // berechnete Höhe (px) pro Karten-Slug; leer = noch nicht angeglichen
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

  // Greedy-Verteilung der Karten auf `cols` Spalten anhand der gemessenen Höhen,
  // dann jede Spalte auf die höchste hochskalieren → bündiger unterer Abschluss.
  const layout = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    // Mobil: keine Angleichung, volle Bilder in Originalreihenfolge
    if (cols < 2) {
      setHeights({});
      setMeasured(false);
      return;
    }

    const inner = root.clientWidth; // Breite inkl. rechtem Bleed (margin-right negativ)
    const colW = inner / cols;
    if (colW <= 0) return;

    // natürliche Höhe je Karte bei Spaltenbreite ermitteln
    const nat: { slug: string; h: number }[] = [];
    for (const w of works) {
      const el = cardRefs.current[w.slug];
      const img = el?.querySelector("img") as HTMLImageElement | null;
      let h: number;
      if (img && img.naturalWidth > 0) {
        h = colW * (img.naturalHeight / img.naturalWidth);
      } else {
        // Text-Platzhalter (kein Cover) oder noch nicht geladen
        const ph = el?.querySelector(".work-card__ph") as HTMLElement | null;
        h = ph?.offsetHeight || colW * 0.75;
      }
      nat.push({ slug: w.slug, h });
    }

    // Greedy: jede Karte der aktuell kürzesten Spalte zuordnen
    const colSum = new Array(cols).fill(0);
    const colItems: { slug: string; h: number }[][] = Array.from({ length: cols }, () => []);
    for (const item of nat) {
      let min = 0;
      for (let c = 1; c < cols; c++) if (colSum[c] < colSum[min]) min = c;
      colItems[min].push(item);
      colSum[min] += item.h;
    }

    // Zielhöhe = höchste Spalte; jede Spalte mit Faktor hochskalieren → alle gleich hoch
    const target = Math.max(...colSum);
    const next: Record<string, number> = {};
    for (let c = 0; c < cols; c++) {
      const sum = colSum[c];
      const f = sum > 0 ? target / sum : 1;
      for (const item of colItems[c]) next[item.slug] = Math.round(item.h * f);
    }
    setHeights(next);
    setMeasured(true);
  }, [cols, works]);

  // Nach Mount / Spaltenwechsel angleichen, sobald Bilder geladen sind
  useLayoutEffect(() => {
    layout();
  }, [layout]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(layout, 120);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, [layout]);

  // Karten round-robin auf Spalten verteilen (deterministisch → kein Hydration-Mismatch).
  // Reihenfolge je Spalte = Reihenfolge der Werke.
  const columns: WorkRef[][] = Array.from({ length: cols }, () => []);
  works.forEach((w, i) => columns[i % cols].push(w));

  const renderCard = (w: WorkRef) => {
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
      {columns.map((col, c) => (
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
