/**
 * MotionHub crawler.
 *
 * Two modes:
 *   (default) metadata-only — fetch a listing page, extract each demo's
 *             title / thumbnail / link, and store it in the DB with the
 *             ORIGINAL SOURCE attributed and linked back. Clean & defensible.
 *
 *   --full    additionally download the linked demo's page HTML into
 *             public/embeds/<slug>/index.html so it lives "in the repo".
 *             Opt-in and per-run. Re-hosting third-party work you don't own
 *             and monetizing it may infringe copyright / violate ToS — you
 *             decide, per demo, what you have the right to do.
 *
 * Usage:
 *   npm run crawl -- --source codrops
 *   npm run crawl -- --source motionsites --full
 *   npm run crawl -- --file ./fixture.html --base https://tympanus.net --source codrops
 *
 * The parser (parseCards) is pure and unit-tested in scripts/crawl.test.ts.
 */
import { load } from "cheerio";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/slug";

export type Card = {
  title: string;
  href: string;
  thumbnail: string;
};

const SOURCES: Record<string, { url: string; name: string; license: string }> = {
  codrops: {
    url: "https://tympanus.net/codrops/hub/",
    name: "Codrops",
    license: "© original author on Codrops. Attributed; link points to the original.",
  },
  motionsites: {
    url: "https://motionsites.ai/",
    name: "motionsites.ai",
    license: "© original author. Attributed; link points to the original.",
  },
};

/** Extract demo cards from a listing page. Generic enough for card-grid layouts. */
export function parseCards(html: string, base: string): Card[] {
  const $ = load(html);
  const seen = new Set<string>();
  const cards: Card[] = [];

  // Strategy: every anchor that wraps (or is near) an <img> is a candidate card.
  $("a").each((_, el) => {
    const $a = $(el);
    const rawHref = $a.attr("href");
    if (!rawHref) return;

    let href: string;
    try {
      href = new URL(rawHref, base).toString();
    } catch {
      return;
    }
    // Skip nav / anchor / mailto links and self-references.
    if (!/^https?:/.test(href)) return;
    if (href.split("#")[0] === base.replace(/\/$/, "") || href.endsWith("/hub/")) return;

    const $img = $a.find("img").first();
    if ($img.length === 0) return;

    const thumbnail = pickImage($img, base);
    const title =
      ($a.attr("title") ||
        $img.attr("alt") ||
        $a.find("h1,h2,h3,h4,.title").first().text() ||
        $a.text() ||
        "")
        .replace(/\s+/g, " ")
        .trim();

    if (!title || !thumbnail) return;
    const key = href.split("?")[0];
    if (seen.has(key)) return;
    seen.add(key);
    cards.push({ title: title.slice(0, 120), href, thumbnail });
  });

  return cards;
}

function pickImage($img: ReturnType<ReturnType<typeof load>>, base: string): string {
  // Prefer lazy-load attributes, then srcset's first URL, then src.
  const raw =
    $img.attr("data-src") ||
    $img.attr("data-lazy-src") ||
    firstFromSrcset($img.attr("srcset") || $img.attr("data-srcset")) ||
    $img.attr("src") ||
    "";
  if (!raw) return "";
  try {
    return new URL(raw, base).toString();
  } catch {
    return "";
  }
}

function firstFromSrcset(srcset?: string): string {
  if (!srcset) return "";
  return srcset.split(",")[0]?.trim().split(/\s+/)[0] || "";
}

async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0 (compatible; MotionHubBot/0.1; +metadata-only)" },
  });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status}`);
  return res.text();
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

async function main() {
  const sourceKey = arg("source") || "codrops";
  const source = SOURCES[sourceKey];
  if (!source) {
    console.error(`Unknown --source "${sourceKey}". Options: ${Object.keys(SOURCES).join(", ")}`);
    process.exit(1);
  }
  const fileArg = arg("file");
  const base = arg("base") || source.url;
  const full = flag("full");
  const limit = Number(arg("limit") || 40);

  const html = fileArg
    ? await (await import("node:fs/promises")).readFile(fileArg, "utf8")
    : await fetchHtml(source.url);

  const cards = parseCards(html, base).slice(0, limit);
  console.log(`Parsed ${cards.length} cards from ${fileArg || source.url}`);

  const prisma = new PrismaClient();
  let created = 0;
  for (const card of cards) {
    const slug = await uniqueSlug(prisma, slugify(`${sourceKey}-${card.title}`));

    let liveUrl = card.href;
    if (full) {
      // Opt-in re-host: save the linked page HTML into the repo.
      try {
        const page = await fetchHtml(card.href);
        const dir = join(process.cwd(), "public", "embeds", slug);
        await mkdir(dir, { recursive: true });
        await writeFile(join(dir, "index.html"), page, "utf8");
        liveUrl = `/embeds/${slug}/index.html`;
        console.log(`  ↳ re-hosted ${card.href} → ${liveUrl}`);
      } catch (e) {
        console.warn(`  ! could not re-host ${card.href}: ${(e as Error).message}`);
      }
    }

    await prisma.demo.upsert({
      where: { slug },
      update: { thumbnail: card.thumbnail, liveUrl, sourceUrl: card.href },
      create: {
        slug,
        titleEn: card.title,
        titleZh: card.title, // translate later; crawler leaves EN in both slots
        summaryEn: "",
        summaryZh: "",
        thumbnail: card.thumbnail,
        liveUrl,
        source: sourceKey,
        sourceName: source.name,
        sourceUrl: card.href,
        license: source.license,
        isPremium: false, // attributed third-party demos default to free
        status: "published",
      },
    });
    created++;
  }
  await prisma.$disconnect();
  console.log(`Upserted ${created} demos (source=${sourceKey}, full=${full}).`);
}

async function uniqueSlug(prisma: PrismaClient, base: string): Promise<string> {
  let slug = base;
  for (let i = 2; await prisma.demo.findUnique({ where: { slug } }); i++) slug = `${base}-${i}`;
  return slug;
}

// Only run main() when executed directly, not when imported by the test.
if (process.argv[1] && process.argv[1].endsWith("crawl.ts")) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
