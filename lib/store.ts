import fs from "node:fs";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type { Content, Project } from "@/lib/types";
import seed from "@/content/portfolio-content.json";

/* ------------------------------------------------------------------ *
 * Speicher-Schicht.
 *  - Online (Vercel): GitHub-Repo als Quelle. Lesen über die GitHub-API
 *    (zwischengespeichert), Schreiben per Commit. Bild-Uploads werden ins
 *    Repo committet und über die raw-URL ausgeliefert. Kostenlos, kein Limit.
 *    Aktiv, sobald GITHUB_TOKEN + GITHUB_REPO gesetzt sind.
 *  - Lokal (Entwicklung): Dateisystem (content/… und public/works/…).
 * Das gebündelte content/portfolio-content.json dient als Fallback.
 * ------------------------------------------------------------------ */

const CONTENT_PATH = path.join(process.cwd(), "content", "portfolio-content.json");
const WORKS_DIR = path.join(process.cwd(), "public", "works");
const CONTENT_FILE = "content/portfolio-content.json";
const SEED = seed as unknown as Content;

const GH_TOKEN = process.env.GITHUB_TOKEN;
const GH_REPO = process.env.GITHUB_REPO; // "owner/repo"
const GH_BRANCH = process.env.GITHUB_BRANCH || "main";
function useGitHub(): boolean {
  return !!(GH_TOKEN && GH_REPO);
}
const GH_HEADERS = { Authorization: `token ${GH_TOKEN}`, Accept: "application/vnd.github+json" };

async function ghSha(filePath: string): Promise<string | undefined> {
  const r = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${filePath}?ref=${GH_BRANCH}`, {
    headers: GH_HEADERS,
    cache: "no-store",
  });
  if (r.ok) return (await r.json()).sha as string;
  return undefined;
}

async function ghPut(filePath: string, base64: string, message: string) {
  const sha = await ghSha(filePath);
  const r = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${filePath}`, {
    method: "PUT",
    headers: { ...GH_HEADERS, "Content-Type": "application/json" },
    body: JSON.stringify({ message, content: base64, sha, branch: GH_BRANCH }),
  });
  if (!r.ok) throw new Error("GitHub PUT fehlgeschlagen: " + r.status + " " + (await r.text()).slice(0, 200));
}

/* Inhalt aus GitHub lesen — in unstable_cache gekapselt (wenig API-Aufrufe),
 * wird bei jeder Admin-Speicherung via revalidateTag("content") aufgefrischt. */
const readGitHubCached = unstable_cache(
  async (): Promise<Content> => {
    const r = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${CONTENT_FILE}?ref=${GH_BRANCH}`, {
      headers: GH_HEADERS,
      cache: "no-store",
    });
    if (r.ok) {
      const j = await r.json();
      if (j.content) return JSON.parse(Buffer.from(j.content, "base64").toString("utf8")) as Content;
    }
    return SEED;
  },
  ["gh-content"],
  { revalidate: 120, tags: ["content"] }
);

export async function readContent(): Promise<Content> {
  if (useGitHub()) {
    try {
      return await readGitHubCached();
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
  if (useGitHub()) {
    await ghPut(CONTENT_FILE, Buffer.from(json, "utf8").toString("base64"), "Inhalte aktualisiert (Admin)");
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

/** Speichert ein hochgeladenes Bild und gibt den Pfad/URL zurück (GitHub-raw online, relativer Pfad lokal). */
export async function saveImage(sectionKey: string, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = slugify(file.name.replace(/\.[^.]+$/, "")).slice(0, 24);
  const name = `${Date.now()}_${base}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  if (useGitHub()) {
    const rel = `public/works/uploads/${sectionKey}/${name}`;
    await ghPut(rel, buf.toString("base64"), "Bild hochgeladen (Admin)");
    return `https://raw.githubusercontent.com/${GH_REPO}/${GH_BRANCH}/${rel}`;
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
