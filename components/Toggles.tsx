"use client";
import { useEffect, useState } from "react";

export default function Toggles() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lang, setLang] = useState<"de" | "en">("de");

  useEffect(() => {
    const d = document.documentElement;
    setTheme((d.dataset.theme as "light" | "dark") || "light");
    setLang((d.dataset.lang as "de" | "en") || "de");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("gj-theme", next); } catch {}
  };
  const toggleLang = () => {
    const next = lang === "de" ? "en" : "de";
    setLang(next);
    document.documentElement.dataset.lang = next;
    try { localStorage.setItem("gj-lang", next); } catch {}
  };

  return (
    <span className="toggles">
      <button className="toggle" onClick={toggleLang} aria-label="Sprache umschalten" title="DE / EN">
        <span className={lang === "de" ? "is-on" : ""}>DE</span>
        <span className="sep">/</span>
        <span className={lang === "en" ? "is-on" : ""}>EN</span>
      </button>
      <button className="toggle toggle--theme" onClick={toggleTheme} aria-label="Hell/Dunkel umschalten" title="Hell / Dunkel">
        {theme === "dark" ? "☀" : "☾"}
      </button>
    </span>
  );
}
