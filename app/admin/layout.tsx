import "./admin.css";
import AdminNav from "@/components/admin/AdminNav";
import { isAuthed } from "@/lib/auth";

export const metadata = { title: "CMS — Geeske Janßen" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthed();
  if (!authed) return <>{children}</>;
  return (
    <div className="adm">
      <AdminNav />
      <div className="adm__main">{children}</div>
    </div>
  );
}
