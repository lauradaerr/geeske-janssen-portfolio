import Link from "next/link";
import Nav from "@/components/Nav";
import MobileNav from "@/components/MobileNav";
import Bi from "@/components/Bi";
import { getMeta, getEmail } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const meta = await getMeta();
  const email = await getEmail();
  const year = new Date().getFullYear();
  return (
    <>
      <div className="site">
        <Nav artist={meta.artist} />
        <main>{children}</main>
        <footer className="foot">
          <span className="foot__name">{meta.artist}</span>
          <nav className="foot__links">
            <Link href="/impressum"><Bi de="Impressum" en="Imprint" /></Link>
            <Link href="/datenschutz"><Bi de="Datenschutz" en="Privacy" /></Link>
          </nav>
          {email && <a className="foot__mail" href={`mailto:${email}`}>{email}</a>}
          <span className="foot__copy">© {year}</span>
        </footer>
      </div>
      <MobileNav />
    </>
  );
}
