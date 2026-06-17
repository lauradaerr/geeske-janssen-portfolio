import { loginAction } from "@/app/admin/actions";
import { isAuthed } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (await isAuthed()) redirect("/admin");
  const { e } = await searchParams;
  return (
    <div className="adm" style={{ display: "block" }}>
      <div className="adm__login">
        <form className="box adm__form" action={loginAction}>
          <div className="adm__brand">Geeske Janßen<small>CMS — Anmeldung</small></div>
          <div className="adm__field">
            <label htmlFor="pw">Passwort</label>
            <input id="pw" name="password" type="password" autoFocus required />
          </div>
          {e && <p className="adm__err">Falsches Passwort.</p>}
          <button className="btn btn--primary" type="submit">Anmelden</button>
          <p className="adm__hint">Passwort über <code>ADMIN_PASSWORD</code> setzen (Standard: <code>geeske</code>).</p>
        </form>
      </div>
    </div>
  );
}
