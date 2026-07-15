import { prisma } from "./db";
import type { Locale } from "@/i18n/config";

export type DemoView = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  prompt: string;
  tags: string[];
  thumbnail: string;
  liveUrl: string;
  source: string;
  sourceName: string;
  sourceUrl: string;
  license: string;
  isPremium: boolean;
  priceCents: number;
  authorName: string | null;
};

type DemoRow = Awaited<ReturnType<typeof prisma.demo.findMany>>[number] & {
  author?: { name: string | null } | null;
};

export function localize(demo: DemoRow, locale: Locale): DemoView {
  const pick = (en: string, zh: string) => (locale === "zh" ? zh || en : en || zh);
  return {
    id: demo.id,
    slug: demo.slug,
    title: pick(demo.titleEn, demo.titleZh),
    summary: pick(demo.summaryEn, demo.summaryZh),
    prompt: pick(demo.promptEn, demo.promptZh),
    tags: demo.tags ? demo.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    thumbnail: demo.thumbnail,
    liveUrl: demo.liveUrl,
    source: demo.source,
    sourceName: demo.sourceName,
    sourceUrl: demo.sourceUrl,
    license: demo.license,
    isPremium: demo.isPremium,
    priceCents: demo.priceCents,
    authorName: demo.author?.name ?? null,
  };
}

export async function listDemos(locale: Locale): Promise<DemoView[]> {
  const rows = await prisma.demo.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });
  return rows.map((r) => localize(r, locale));
}

export async function getDemo(slug: string, locale: Locale): Promise<DemoView | null> {
  const row = await prisma.demo.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  });
  if (!row || row.status !== "published") return null;
  return localize(row, locale);
}

export async function isUnlocked(userId: string | null, demoId: string): Promise<boolean> {
  if (!userId) return false;
  const found = await prisma.unlock.findUnique({
    where: { userId_demoId: { userId, demoId } },
  });
  return !!found;
}
