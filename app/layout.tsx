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

const boot = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('gj-theme')||(window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');d.dataset.theme=t;d.dataset.lang=localStorage.getItem('gj-lang')||'de';}catch(e){}})();`;

// Entfernt veraltete Service-Worker/Caches (z. B. von der Vorgänger-Seite), die sonst
// dauerhaft alte Versionen ausliefern.
const killSW = `(function(){try{if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister()})}).catch(function(){})}if(self.caches&&caches.keys){caches.keys().then(function(ks){ks.forEach(function(k){caches.delete(k)})}).catch(function(){})}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning className={`${bric.variable} ${inter.variable} ${mono.variable}`}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <script dangerouslySetInnerHTML={{ __html: killSW }} />
        {children}
      </body>
    </html>
  );
}
