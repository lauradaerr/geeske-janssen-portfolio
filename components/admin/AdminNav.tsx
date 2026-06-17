"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";

const LINKS = [
  { href: "/admin", label: "Übersicht", exact: true },
  { href: "/admin/works", label: "Werke" },
  { href: "/admin/pages", label: "Seiten" },
  { href: "/admin/export", label: "Portfolio-Export" },
];

export default function AdminNav() {
  const path = usePathname();
  const active = (l: { href: string; exact?: boolean }) =>
    l.exact ? path === l.href : path === l.href || path.startsWith(l.href + "/");
  return (
    <nav className="adm__side">
      <div className="adm__brand">Geeske Janßen<small>CMS</small></div>
      <div className="adm__nav">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} data-active={active(l)}>{l.label}</Link>
        ))}
      </div>
      <div className="adm__spacer" />
      <Link href="/" className="ghost" target="_blank">→ Website ansehen</Link>
      <form action={logoutAction}><button className="adm__logout" type="submit" style={{ width: "100%" }}>Abmelden</button></form>
    </nav>
  );
}
