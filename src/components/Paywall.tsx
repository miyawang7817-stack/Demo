"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";

function formatPrice(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

export default function Paywall({
  slug,
  locale,
  priceCents,
  currency,
  previewPrompt,
  signedIn,
}: {
  slug: string;
  locale: Locale;
  priceCents: number;
  currency: string;
  previewPrompt: string;
  signedIn: boolean;
}) {
  const t = getDict(locale);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function unlock() {
    if (!signedIn) {
      router.push(`/${locale}/account?next=/${locale}/demo/${slug}`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, locale }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "checkout failed");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "checkout failed");
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-accent/30 bg-black/30 p-4">
      <div className="mb-3">
        <span className="text-sm font-medium text-white/70">{t.demo.promptTitle}</span>
      </div>
      <pre className="prompt-blur whitespace-pre-wrap break-words text-sm leading-relaxed text-white/80">
        {previewPrompt}
      </pre>
      <div className="mt-4 rounded-lg border border-white/10 bg-panel p-4">
        <h4 className="font-medium">{t.demo.unlockTitle}</h4>
        <p className="mt-1 text-sm text-white/50">{t.demo.unlockSub}</p>
        <button onClick={unlock} disabled={loading} className="btn btn-primary mt-3 disabled:opacity-60">
          {loading
            ? "…"
            : signedIn
              ? `${t.demo.unlockCta} ${formatPrice(priceCents, currency)}`
              : t.demo.signInToUnlock}
        </button>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
