import fs from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";
import { put, list, del } from "@vercel/blob";
import type { Content, Project } from "@/lib/types";
import seed from "@/content/portfolio-content.json";

/* ------------------------------------------------------------------ *
 * Speicher-Schicht.
 *  - Online (Vercel): liegt in Vercel Blob — Inhalte als JSON, Bilder als Dateien.
 *    Aktiv, sobald BLOB_READ_WRITE_TOKEN gesetzt ist.
 *  - Lokal (Entwicklung): liegt im Dateisystem (content/… und public/works/…).
 * Das gebündelte content/portfolio-content.json dient als Startbestand/Fallback.
 * ------------------------------------------------------------------ */

const CONTENT_PATH = path.join(process.cwd(), "content", "portfolio-content.json");
const WORKS_DIR = path.join(process.cwd(), "public", "works");
const CONTENT_PREFIX = "data/portfolio-content";
const SEED = seed as unknown as Content;

function useBlob(): boolean {
  return !!(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

/* Liest die neueste Inhaltsdatei aus dem Blob. In unstable_cache gekapselt, damit NICHT
 * bei jedem Seitenaufruf der Blob abgefragt wird (spart Verbrauch). Wird bei jeder
 * Admin-Speicherung über revalidateTag("content") sofort aufgefrischt. */
const readBlobCached = unstable_cache(
  async (): Promise<Content> => {
    const { blobs } = await list({ prefix: CONTENT_PREFIX });
    if (blobs.length) {
      blobs.sort((a, b) => +new Date(b.uploadedAt) - +new Date(a.uploadedAt));
      const res = await fetch(blobs[0].url, { cache: "no-store" });
      if (res.ok) return (await res.json()) as Content;
    }
    return SEED;
  },
  ["portfolio-content"],
  { revalidate: 600, tags: ["content"] }
);

export async function readContent(): Promise<Content> {
  if (useBlob()) {
    try {
      return await readBlobCached();
    } catch {
      return SEED;
    }
  }
  try {
    return JSON.parse(fs.readFileSync(CONTENT_PATH, "utf8")) as Content;
  } catch {
    return SEED;
  }
}

export async function writeContent(data: Content): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  if (useBlob()) {
    // Vorher vorhandene Versionen merken, neue mit Zufalls-Suffix schreiben (eigene URL → kein
    // „immutable"-Cache-Problem), danach die alten löschen.
    const { blobs } = await list({ prefix: CONTENT_PREFIX });
    const res = await put(`${CONTENT_PREFIX}.json`, json, {
      access: "public",
      addRandomSuffix: true,
      contentType: "application/json",
    });
    await Promise.all(blobs.filter((b) => b.url !== res.url).map((b) => del(b.url).catch(() => {})));
    return;
  }
  fs.writeFileSync(CONTENT_PATH, json, "utf8");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[äàâ]/g, "a").replace(/[öô]/g, "o").replace(/[üû]/g, "u").replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "arbeit";
}

/** Speichert ein hochgeladenes Bild und gibt den Pfad/URL zurück (Blob-URL online, relativer Pfad lokal). */
export async function saveImage(sectionKey: string, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = slugify(file.name.replace(/\.[^.]+$/, "")).slice(0, 24);
  const name = `${Date.now()}_${base}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  if (useBlob()) {
    const blob = await put(`works/uploads/${sectionKey}/${name}`, buf, {
      access: "public",
      contentType: file.type || undefined,
    });
    return blob.url; // absolute URL — imgSrc lässt sie unverändert
  }

  const dir = path.join(WORKS_DIR, "uploads", sectionKey);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, name), buf);
  return `uploads/${sectionKey}/${name}`;
}

export function upsertProject(data: Content, sectionKey: string, origSlug: string | null, project: Project): Content {
  const sec = data.sections.find((s) => s.key === sectionKey);
  if (!sec) return data;
  if (origSlug) {
    const i = sec.projects.findIndex((p) => p.slug === origSlug);
    if (i >= 0) sec.projects[i] = project;
    else sec.projects.push(project);
  } else {
    sec.projects.push(project);
  }
  return data;
}

export function deleteProject(data: Content, sectionKey: string, slug: string): Content {
  const sec = data.sections.find((s) => s.key === sectionKey);
  if (sec) sec.projects = sec.projects.filter((p) => p.slug !== slug);
  return data;
}

export function moveProject(data: Content, sectionKey: string, slug: string, dir: -1 | 1): Content {
  const sec = data.sections.find((s) => s.key === sectionKey);
  if (!sec) return data;
  const i = sec.projects.findIndex((p) => p.slug === slug);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= sec.projects.length) return data;
  [sec.projects[i], sec.projects[j]] = [sec.projects[j], sec.projects[i]];
  return data;
}

export { slugify };
