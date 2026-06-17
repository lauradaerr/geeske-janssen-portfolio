"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Bi from "@/components/Bi";
import Toggles from "@/components/Toggles";
import { sectionLabelEn } from "@/lib/i18n";

const SECTIONS = [
  { key: "video", label: "Video" },
  { key: "fotografie", label: "Fotografie" },
  { key: "installation", label: "Installation" },
  { key: "performance", label: "Performance" },
];
const PAGES = [
  { href: "/ueber", de: "Über", en: "About" },
  { href: "/cv", de: "CV", en: "CV" },
  { href: "/kontakt", de: "Kontakt", en: "Contact" },
];

export default function Nav({ artist }: { artist: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <nav className="nav">
      <Link href="/" className="nav__brand" onClick={() => setOpen(false)}>{artist}</Link>

      <div className="nav__links">
        {SECTIONS.map((s) => (
          <Link key={s.key} href={`/${s.key}`} className="link" data-c={s.key} data-active={active(`/${s.key}`)}>
            <Bi de={s.label} en={sectionLabelEn(s.key, s.label)} />
          </Link>
        ))}
        {PAGES.map((p) => (
          <Link key={p.href} href={p.href} className="link" data-active={active(p.href)}>
            <Bi de={p.de} en={p.en} />
          </Link>
        ))}
      </div>

      <div className="nav__right">
        <Toggles />
        <button className="nav__toggle" aria-expanded={open} aria-label={open ? "Menü schließen" : "Menü öffnen"} onClick={() => setOpen((v) => !v)}>
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="nav__sheet">
          {SECTIONS.map((s) => (
            <Link key={s.key} href={`/${s.key}`} onClick={() => setOpen(false)}>
              <Bi de={s.label} en={sectionLabelEn(s.key, s.label)} />
            </Link>
          ))}
          {PAGES.map((p) => (
            <Link key={p.href} href={p.href} onClick={() => setOpen(false)}><Bi de={p.de} en={p.en} /></Link>
          ))}
          <div className="nav__sheet-tools"><Toggles /></div>
        </div>
      )}
    </nav>
  );
}
