import { NextResponse } from "next/server";
import { z } from "zod";
import { signInWithEmail } from "@/lib/session";

const schema = z.object({
  email: z.string().email(),
  name: z.string().max(80).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const user = await signInWithEmail(parsed.data.email, parsed.data.name);
  return NextResponse.json({ ok: true, id: user.id });
}
