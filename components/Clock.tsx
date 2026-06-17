"use client";
import { useEffect, useState } from "react";

export default function Clock() {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const fmt = () =>
      new Intl.DateTimeFormat("de-DE", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());
    setNow(fmt());
    const id = setInterval(() => setNow(fmt()), 1000 * 30);
    return () => clearInterval(id);
  }, []);
  return <span className="mono" suppressHydrationWarning>{now || "—"}</span>;
}
