import Anthropic from "@anthropic-ai/sdk";

export type Locale = "en" | "zh";

export interface Translator {
  translate(text: string, to: Locale): Promise<string>;
}

/** Default: leaves text unchanged (crawler puts EN in both slots). */
class NoopTranslator implements Translator {
  async translate(text: string): Promise<string> {
    return text;
  }
}

/** Translate via Claude. Cheap + high quality for short gallery copy. */
class AnthropicTranslator implements Translator {
  private client: Anthropic;
  private model: string;
  constructor(apiKey: string, model: string) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }
  async translate(text: string, to: Locale): Promise<string> {
    if (!text.trim()) return text;
    const target = to === "zh" ? "Simplified Chinese (简体中文)" : "English";
    const res = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      system:
        `You translate copy for a web motion-effects / WebGL demo gallery into ${target}. ` +
        "Keep technical terms (WebGL, shader, scroll, three.js, canvas, marquee…), product and brand names, " +
        "and the original tone. Return ONLY the translation — no quotes, no explanation.",
      messages: [{ role: "user", content: text }],
    });
    const block = res.content.find((b) => b.type === "text");
    return block && block.type === "text" ? block.text.trim() : text;
  }
}

/** Translate via DeepL (translation-specific API, no model versioning). */
class DeepLTranslator implements Translator {
  constructor(private key: string) {}
  async translate(text: string, to: Locale): Promise<string> {
    if (!text.trim()) return text;
    const host = this.key.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";
    const res = await fetch(`https://${host}/v2/translate`, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${this.key}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ text, target_lang: to === "zh" ? "ZH" : "EN-US" }),
    });
    if (!res.ok) throw new Error(`DeepL ${res.status}`);
    const data = (await res.json()) as { translations?: { text: string }[] };
    return data.translations?.[0]?.text ?? text;
  }
}

export function getTranslator(): Translator {
  const provider = (process.env.TRANSLATE_PROVIDER ?? "none").toLowerCase();
  if (provider === "anthropic") {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key) return new NoopTranslator();
    // Bulk translation of short strings — Haiku is the pragmatic default; bump
    // TRANSLATE_MODEL to a stronger model if you want.
    return new AnthropicTranslator(key, process.env.TRANSLATE_MODEL ?? "claude-haiku-4-5");
  }
  if (provider === "deepl") {
    const key = process.env.DEEPL_API_KEY;
    if (!key) return new NoopTranslator();
    return new DeepLTranslator(key);
  }
  return new NoopTranslator();
}

/** Translate, falling back to the input on any error (never blocks a crawl). */
export async function safeTranslate(t: Translator, text: string, to: Locale): Promise<string> {
  try {
    return await t.translate(text, to);
  } catch {
    return text;
  }
}

type BilingualFields = {
  titleEn: string;
  titleZh: string;
  summaryEn: string;
  summaryZh: string;
  promptEn: string;
  promptZh: string;
};

/**
 * Fill missing zh fields from their en counterparts. A zh field is "missing"
 * when it is empty or byte-identical to en (what the crawler leaves behind).
 * Pure over the translator, so it is unit-testable with a mock. Returns only
 * the fields that changed.
 */
export async function fillMissingZh(
  demo: BilingualFields,
  t: Translator
): Promise<Partial<BilingualFields>> {
  const untranslated = (en: string, zh: string) =>
    en.trim().length > 0 && (zh.trim().length === 0 || zh.trim() === en.trim());

  const updates: Partial<BilingualFields> = {};
  if (untranslated(demo.titleEn, demo.titleZh)) updates.titleZh = await safeTranslate(t, demo.titleEn, "zh");
  if (untranslated(demo.summaryEn, demo.summaryZh)) updates.summaryZh = await safeTranslate(t, demo.summaryEn, "zh");
  if (untranslated(demo.promptEn, demo.promptZh)) updates.promptZh = await safeTranslate(t, demo.promptEn, "zh");
  return updates;
}
