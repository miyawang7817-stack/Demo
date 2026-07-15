import assert from "node:assert";
import { fillMissingZh, type Translator } from "../src/lib/translate";

// Mock translator: deterministic, records calls.
const calls: string[] = [];
const mock: Translator = {
  async translate(text, to) {
    calls.push(text);
    return `[${to}] ${text}`;
  },
};

async function run() {
  // Crawler output: zh == en (untranslated) + empty summary/prompt.
  const crawled = {
    titleEn: "Scroll Magic",
    titleZh: "Scroll Magic", // identical → treated as missing
    summaryEn: "A silky scroll effect.",
    summaryZh: "", // empty → missing
    promptEn: "",
    promptZh: "", // both empty → skip
  };
  const u1 = await fillMissingZh(crawled, mock);
  assert.strictEqual(u1.titleZh, "[zh] Scroll Magic", "title should translate when zh==en");
  assert.strictEqual(u1.summaryZh, "[zh] A silky scroll effect.", "empty summary should translate");
  assert.ok(!("promptZh" in u1), "empty EN prompt must not be translated (nothing to translate)");

  // Already fully translated: no calls, no updates.
  calls.length = 0;
  const done = {
    titleEn: "Aurora",
    titleZh: "极光",
    summaryEn: "Northern lights.",
    summaryZh: "北极光。",
    promptEn: "Make it glow",
    promptZh: "让它发光",
  };
  const u2 = await fillMissingZh(done, mock);
  assert.strictEqual(Object.keys(u2).length, 0, "fully-translated demo yields no updates");
  assert.strictEqual(calls.length, 0, "translator must not be called when nothing is missing");

  console.log("✓ fillMissingZh: translates zh==en and empty, skips empty-EN, no-ops when complete");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
