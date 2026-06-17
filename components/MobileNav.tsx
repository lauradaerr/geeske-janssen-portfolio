"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { key: "video", label: "Video", letter: "V" },
  { key: "fotografie", label: "Fotografie", letter: "F" },
  { key: "installation", label: "Installation", letter: "I" },
  { key: "performance", label: "Performance", letter: "P" },
];

export default function MobileNav() {
  const path = usePathname();
  return (
    <nav className="mnav" aria-label="Bereiche">
      {ITEMS.map((it) => (
        <Link key={it.key} href={`/${it.key}`} data-c={it.key} data-active={path.startsWith(`/${it.key}`)} aria-label={it.label}>
          {it.letter}
        </Link>
      ))}
    </nav>
  );
}
