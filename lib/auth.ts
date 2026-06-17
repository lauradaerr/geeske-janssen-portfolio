import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";

const COOKIE = "gj_session";
const PASSWORD = process.env.ADMIN_PASSWORD || "geeske";
const SECRET = process.env.ADMIN_SECRET || "gj-dev-secret-please-change";

function token(): string {
  return crypto.createHash("sha256").update(PASSWORD + "::" + SECRET).digest("hex");
}

export function checkPassword(pw: string): boolean {
  const a = Buffer.from(pw || "");
  const b = Buffer.from(PASSWORD);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function isAuthed(): Promise<boolean> {
  const c = await cookies();
  return c.get(COOKIE)?.value === token();
}

export async function setSession() {
  const c = await cookies();
  c.set(COOKIE, token(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const c = await cookies();
  c.delete(COOKIE);
}

export async function requireAuth() {
  if (!(await isAuthed())) redirect("/admin/login");
}
