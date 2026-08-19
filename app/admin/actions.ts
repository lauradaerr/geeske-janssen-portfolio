"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { checkPassword, setSession, clearSession, requireAuth } from "@/lib/auth";
import { readContent, writeContent, saveImage, upsertProject, deleteProject, moveProject, slugify } from "@/lib/store";
import type { Project } from "@/lib/content";

export async function loginAction(formData: FormData) {
  const pw = String(formData.get("password") || "");
  if (checkPassword(pw)) {
    await setSession();
    redirect("/admin");
  }
  redirect("/admin/login?e=1");
}

export async function logoutAction() {
  await clearSession();
  redirect("/admin/login");
}

export type UploadResult = { ok: true; path: string } | { ok: false; error: string };

/** Laedt EIN Bild hoch und gibt dessen Pfad/URL zurueck.
 *  Absichtlich getrennt vom Formular-Speichern: auf Vercel darf ein Request-Body
 *  maximal 4,5 MB gross sein (Plattform-Limit, nicht durch bodySizeLimit aenderbar).
 *  Ein Request pro Bild bleibt sicher darunter — und ein fehlgeschlagenes Bild
 *  kostet nicht das ganze Formular. */
export async function uploadImageAction(formData: FormData): Promise<UploadResult> {
  await requireAuth();
  const section = String(formData.get("section") || "");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Keine Datei empfangen." };
  if (!file.type.startsWith("image/")) return { ok: false, error: "Das ist keine Bilddatei." };
  if (file.size > 4_400_000) return { ok: false, error: "Bild zu gross fuer den Upload (max. ca. 4 MB)." };
  try {
    const path = await saveImage(section, file);
    return { ok: true, path };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Upload fehlgeschlagen." };
  }
}

export async function saveWorkAction(formData: FormData) {
  await requireAuth();
  const section = String(formData.get("section") || "");
  const origSlug = String(formData.get("origSlug") || "") || null;
  const titleDe = String(formData.get("title") || "").trim() || "Ohne Titel";
  const titleEn = String(formData.get("titleEn") || "").trim();
  const textDe = String(formData.get("text") || "").trim();
  const textEn = String(formData.get("textEn") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const slug = (String(formData.get("slug") || "").trim() || slugify(titleDe));
  // DE und EN im selben Feld ablegen (Frontend trennt per splitLang am ===EN===-Marker)
  const title = titleEn ? `${titleDe}\n===EN===\n${titleEn}` : titleDe;
  const text = textEn ? `${textDe}\n===EN===\n${textEn}` : textDe;
  const videoUrl = String(formData.get("videoUrl") || "").trim();

  const existing = JSON.parse(String(formData.get("existing") || "[]")) as string[];
  let creditsRaw: Record<string, string> = {};
  try { creditsRaw = JSON.parse(String(formData.get("credits") || "{}")); } catch { creditsRaw = {}; }
  let sizesRaw: Record<string, string> = {};
  try { sizesRaw = JSON.parse(String(formData.get("sizes") || "{}")); } catch { sizesRaw = {}; }

  // Bilder wurden bereits einzeln via uploadImageAction hochgeladen und stehen
  // als Pfade in "existing" — hier fliessen keine Dateien mehr durch.
  const images = existing;
  const imageCredits: Record<string, string> = {};
  for (const p of images) { const c = (creditsRaw[p] || "").trim(); if (c) imageCredits[p] = c; }
  const imageSizes: Record<string, "s" | "m" | "l"> = {};
  for (const p of images) { const s = sizesRaw[p]; if (s === "s" || s === "l") imageSizes[p] = s; }

  const project: Project = { slug, title, text, images };
  if (description) project.description = description;
  if (videoUrl) project.videoUrl = videoUrl;
  if (Object.keys(imageCredits).length) project.imageCredits = imageCredits;
  if (Object.keys(imageSizes).length) project.imageSizes = imageSizes;

  const data = await readContent();
  upsertProject(data, section, origSlug, project);
  await writeContent(data);
  revalidatePath("/", "layout");
  revalidateTag("content");
  redirect("/admin/works");
}

export async function deleteWorkAction(formData: FormData) {
  await requireAuth();
  const section = String(formData.get("section") || "");
  const slug = String(formData.get("slug") || "");
  const data = await readContent();
  deleteProject(data, section, slug);
  await writeContent(data);
  revalidatePath("/", "layout");
  revalidateTag("content");
  redirect("/admin/works");
}

export async function moveWorkAction(formData: FormData) {
  await requireAuth();
  const section = String(formData.get("section") || "");
  const slug = String(formData.get("slug") || "");
  const dir = Number(formData.get("dir")) === 1 ? 1 : -1;
  const data = await readContent();
  moveProject(data, section, slug, dir as -1 | 1);
  await writeContent(data);
  revalidatePath("/", "layout");
  revalidateTag("content");
  redirect("/admin/works");
}

export async function savePagesAction(formData: FormData) {
  await requireAuth();
  const data = await readContent();
  data.meta.artist = String(formData.get("artist") || data.meta.artist).trim();
  data.meta.tagline = String(formData.get("tagline") || "").trim();
  data.about = String(formData.get("about") || "");
  data.contact = String(formData.get("contact") || "");
  data.impressum = String(formData.get("impressum") || "");
  data.datenschutz = String(formData.get("datenschutz") || "");
  try { data.pressTexts = JSON.parse(String(formData.get("pressTexts") || "[]")); } catch { data.pressTexts = []; }
  try { data.cvEntries = JSON.parse(String(formData.get("cvEntries") || "[]")); } catch { data.cvEntries = []; }
  await writeContent(data);
  revalidatePath("/", "layout");
  revalidateTag("content");
  redirect("/admin/pages");
}
