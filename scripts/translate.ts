/**
 * Backfill translations: find demos whose Chinese fields are missing (empty, or
 * identical to English — what the crawler leaves), translate them, and update.
 * Idempotent — re-running only touches still-missing fields.
 *
 * Configure a provider in .env:
 *   TRANSLATE_PROVIDER=anthropic  ANTHROPIC_API_KEY=sk-...   (optionally TRANSLATE_MODEL)
 *   TRANSLATE_PROVIDER=deepl      DEEPL_API_KEY=...
 * With no provider set it is a safe no-op.
 *
 * Usage: npm run translate            # translate EN → ZH for all demos
 */
import { PrismaClient } from "@prisma/client";
import { getTranslator, fillMissingZh } from "../src/lib/translate";

async function main() {
  const provider = process.env.TRANSLATE_PROVIDER ?? "none";
  if (provider === "none") {
    console.log("TRANSLATE_PROVIDER is 'none' — nothing to do. Set it to 'anthropic' or 'deepl' in .env.");
    return;
  }
  const translator = getTranslator();
  const prisma = new PrismaClient();
  const demos = await prisma.demo.findMany();
  let changed = 0;

  for (const demo of demos) {
    const updates = await fillMissingZh(demo, translator);
    if (Object.keys(updates).length > 0) {
      await prisma.demo.update({ where: { id: demo.id }, data: updates });
      changed++;
      console.log(`  ✓ ${demo.slug}: ${Object.keys(updates).join(", ")}`);
    }
  }

  await prisma.$disconnect();
  console.log(`Translated ${changed}/${demos.length} demos (provider=${provider}).`);
}

if (process.argv[1] && process.argv[1].endsWith("translate.ts")) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
