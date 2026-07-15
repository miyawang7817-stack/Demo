"use client";

import { useState } from "react";
import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";

export default function PromptBlock({ prompt, locale }: { prompt: string; locale: Locale }) {
  const t = getDict(locale);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard may be unavailable; ignore */
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-white/70">{t.demo.promptTitle}</span>
        <button onClick={copy} className="btn btn-primary px-3 py-1 text-sm">
          {copied ? t.demo.copied : t.demo.copyPrompt}
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-white/80">
        {prompt}
      </pre>
      <p className="mt-2 text-xs text-white/40">{t.demo.promptHint}</p>
    </div>
  );
}
