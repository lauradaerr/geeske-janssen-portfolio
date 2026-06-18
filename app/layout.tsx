import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter_Tight, Space_Mono } from "next/font/google";
import "./globals.css";

const bric = Bricolage_Grotesque({ subsets: ["latin"], weight: ["400", "700", "800"], variable: "--f-bric" });
const inter = Inter_Tight({ subsets: ["latin"], weight: ["400", "500"], variable: "--f-inter" });
const mono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--f-mono" });

export const metadata: Metadata = {
  title: "Geeske Janßen",
  description: "Video · Fotografie · Installation · Performance",
};

// Beim Laden immer Hellmodus; manuelles Umschalten gilt für die Sitzung. Sprache bleibt gemerkt.
const boot = `(function(){try{var d=document.documentElement;d.dataset.theme='light';d.dataset.lang=localStorage.getItem('gj-lang')||'de';}catch(e){}})();`;

// Entfernt veraltete Service-Worker/Caches (z. B. von der Vorgänger-Seite), die sonst
// dauerhaft alte Versionen ausliefern.
const killSW = `(function(){try{if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister()})}).catch(function(){})}if(self.caches&&caches.keys){caches.keys().then(function(ks){ks.forEach(function(k){caches.delete(k)})}).catch(function(){})}}catch(e){}})();`;

// Bilder gegen einfaches Speichern schützen: Rechtsklick & Ziehen auf <img> unterbinden.
const guard = `(function(){try{var img=function(e){return e.target&&e.target.tagName==='IMG'};document.addEventListener('contextmenu',function(e){if(img(e))e.preventDefault()},{capture:true});document.addEventListener('dragstart',function(e){if(img(e))e.preventDefault()},{capture:true});}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning className={`${bric.variable} ${inter.variable} ${mono.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <script dangerouslySetInnerHTML={{ __html: killSW }} />
        <script dangerouslySetInnerHTML={{ __html: guard }} />
        {children}
      </body>
    </html>
  );
}
