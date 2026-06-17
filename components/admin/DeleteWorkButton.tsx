"use client";
import { deleteWorkAction } from "@/app/admin/actions";

export default function DeleteWorkButton({ section, slug }: { section: string; slug: string }) {
  return (
    <form
      action={deleteWorkAction}
      onSubmit={(e) => {
        if (!confirm("Diese Arbeit wirklich löschen?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="section" value={section} />
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" className="btn btn--sm btn--danger">Löschen</button>
    </form>
  );
}
