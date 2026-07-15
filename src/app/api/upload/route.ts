import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { slugify } from "@/lib/slug";

const schema = z.object({
  titleEn: z.string().min(1).max(120),
  titleZh: z.string().min(1).max(120),
  summaryEn: z.string().max(400).optional().default(""),
  summaryZh: z.string().max(400).optional().default(""),
  liveUrl: z.string().url().optional().or(z.literal("")).default(""),
  thumbnail: z.string().url().optional().or(z.literal("")).default(""),
  tags: z.string().max(200).optional().default(""),
  promptEn: z.string().max(4000).optional().default(""),
  promptZh: z.string().max(4000).optional().default(""),
  isPremium: z.union([z.literal("on"), z.boolean(), z.string()]).optional(),
  priceCents: z.union([z.string(), z.number()]).optional(),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
  }
  const d = parsed.data;
  const isPremium = d.isPremium === "on" || d.isPremium === true || d.isPremium === "true";
  const priceCents = isPremium ? Math.max(50, Number(d.priceCents) || 500) : 0;

  // Ensure a unique slug.
  const baseSlug = slugify(d.titleEn);
  let slug = baseSlug;
  for (let i = 2; await prisma.demo.findUnique({ where: { slug } }); i++) {
    slug = `${baseSlug}-${i}`;
  }

  const demo = await prisma.demo.create({
    data: {
      slug,
      titleEn: d.titleEn,
      titleZh: d.titleZh,
      summaryEn: d.summaryEn,
      summaryZh: d.summaryZh,
      liveUrl: d.liveUrl,
      thumbnail: d.thumbnail,
      tags: d.tags,
      promptEn: d.promptEn,
      promptZh: d.promptZh,
      isPremium,
      priceCents,
      source: "creator",
      status: "published",
      authorId: user.id,
    },
  });

  return NextResponse.json({ ok: true, slug: demo.slug });
}
