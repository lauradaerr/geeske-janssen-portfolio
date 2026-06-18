/* Gemeinsame Typen — client- und serverseitig nutzbar (keine Node/Blob-Importe). */

export type Project = {
  slug: string;
  title: string;
  description?: string;
  text: string;
  images: string[];
  videoUrl?: string;
  imageCredits?: Record<string, string>;
  imageSizes?: Record<string, "s" | "m" | "l">;
};

export type Section = {
  key: string;
  label: string;
  projects: Project[];
  additional: string[];
  intro?: string;
};

export type PressText = { title: string; body: string };
export type CvEntry = { date: string; text: string };

export type Content = {
  meta: { artist: string; source?: string; archivedAt?: string; tagline?: string };
  about: string;
  cv: string;
  contact: string;
  impressum?: string;
  datenschutz?: string;
  pressTexts?: PressText[];
  cvEntries?: CvEntry[];
  sections: Section[];
};

export type WorkRef = Project & { section: string; sectionLabel: string; cover: string };
