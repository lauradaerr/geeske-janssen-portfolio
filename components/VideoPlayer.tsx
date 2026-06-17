"use client";
import { useEffect, useState } from "react";
import Bi from "@/components/Bi";

function toEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) { const id = u.searchParams.get("v"); return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null; }
    if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed${u.pathname}?autoplay=1`;
    if (u.hostname.includes("vimeo.com")) { const id = u.pathname.split("/").filter(Boolean)[0]; return id ? `https://player.vimeo.com/video/${id}?autoplay=1` : null; }
  } catch { return null; }
  return null;
}

export default function VideoPlayer({ url, title }: { url: string; poster?: string; title: string }) {
  const [open, setOpen] = useState(false);
  const embed = toEmbed(url);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  if (!embed) return null;

  return (
    <>
      <button className="vbtn" onClick={() => setOpen(true)}>
        <span className="vbtn__icon" aria-hidden="true">▶</span>
        <span><Bi de="Video ansehen" en="Watch video" /></span>
      </button>

      {open && (
        <div className="cinema" role="dialog" aria-modal="true" onClick={() => setOpen(false)}>
          <button className="cinema__close" aria-label="Schließen" onClick={() => setOpen(false)}>✕</button>
          <div className="cinema__frame" onClick={(e) => e.stopPropagation()}>
            <iframe src={embed} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
          </div>
        </div>
      )}
    </>
  );
}
