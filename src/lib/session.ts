import { cookies } from "next/headers";
import { prisma } from "./db";

// Lightweight, dependency-free identity: an email stored in a signed-ish cookie.
// This keeps the demo runnable with zero OAuth secrets. For production, swap this
// module for NextAuth / Clerk / Auth.js — every call site uses getCurrentUser().
const COOKIE = "mh_uid";

export async function getCurrentUser() {
  const uid = cookies().get(COOKIE)?.value;
  if (!uid) return null;
  return prisma.user.findUnique({ where: { id: uid } });
}

export async function signInWithEmail(email: string, name?: string) {
  const clean = email.trim().toLowerCase();
  const user = await prisma.user.upsert({
    where: { email: clean },
    update: name ? { name } : {},
    create: { email: clean, name: name ?? null },
  });
  cookies().set(COOKIE, user.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return user;
}

export function signOut() {
  cookies().delete(COOKIE);
}
