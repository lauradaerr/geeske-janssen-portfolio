import { cache } from "react";
import { readContent } from "@/lib/store";
import type { Content, Project, Section, WorkRef } from "@/lib/types";

/* Typen + client-sichere Helfer weiterreichen, damit bestehende Server-Importe weiter funktionieren. */
export type { Content, Project, Section, WorkRef, PressText, CvEntry } from "@/lib/types";
export { imgSrc, themeClass } from "@/lib/img";

/* Inhalte werden zur Laufzeit aus dem Store gelesen (Blob online, Datei lokal).
 * cache() dedupliziert die Lesung pro Request. */
const getContent = cache(async (): Promise<Content> => readContent());

export async function getMeta() {
  return (await getContent()).meta;
}
export async function getSections(): Promise<Section[]> {
  return (await getContent()).sections;
}
export async function getSection(key: string): Promise<Section | undefined> {
  return (await getContent()).sections.find((s) => s.key === key);
}
export async function sectionKeys(): Promise<string[]> {
  return (await getContent()).sections.map((s) => s.key);
}

export async function getPressTexts() {
  const c = await getContent();
  return Array.isArray(c.pressTexts) ? c.pressTexts : [];
}
export async function getCvEntries() {
  const c = await getContent();
  return Array.isArray(c.cvEntries) ? c.cvEntries : [];
}

function withCover(p: Project, section: Section): WorkRef {
  const cover = p.images[0] ?? section.additional[0] ?? "";
  return { ...p, section: section.key, sectionLabel: section.label, cover };
}

export async function getAllWorks(): Promise<WorkRef[]> {
  const c = await getContent();
  return c.sections.flatMap((s) => s.projects.map((p) => withCover(p, s)));
}
export async function getSectionWorks(key: string): Promise<WorkRef[]> {
  const s = await getSection(key);
  return s ? s.projects.map((p) => withCover(p, s)) : [];
}
export async function getWork(section: string, slug: string): Promise<WorkRef | undefined> {
  const s = await getSection(section);
  if (!s) return undefined;
  const p = s.projects.find((x) => x.slug === slug);
  return p ? withCover(p, s) : undefined;
}
export async function getAdjacent(section: string, slug: string) {
  const works = await getSectionWorks(section);
  const i = works.findIndex((w) => w.slug === slug);
  return {
    prev: i > 0 ? works[i - 1] : undefined,
    next: i >= 0 && i < works.length - 1 ? works[i + 1] : undefined,
  };
}
export async function getText(kind: "about" | "cv" | "contact" | "impressum" | "datenschutz") {
  const c = await getContent();
  return ((c as Record<string, unknown>)[kind] as string) ?? "";
}

/** E-Mail aus dem Kontakttext ziehen (für den Footer). */
export async function getEmail(): Promise<string | null> {
  const c = await getContent();
  const m = (c.contact || "").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0].toLowerCase() : null;
}

/* Bildstreifen für die Startseiten-Bänder: Cover aller Projekte + zusätzliche. */
export async function sectionStrip(key: string, limit = 14): Promise<string[]> {
  const s = await getSection(key);
  if (!s) return [];
  const covers = s.projects.map((p) => p.images[0]).filter(Boolean) as string[];
  const out = [...covers, ...s.additional];
  return out.slice(0, limit);
}
