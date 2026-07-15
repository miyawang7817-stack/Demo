"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";

export default function UploadForm({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const router = useRouter();
  const [premium, setPremium] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(null);
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "upload failed");
      setOk(t.upload.success);
      setTimeout(() => router.push(`/${locale}/demo/${data.slug}`), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "upload failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">{t.upload.fTitleEn}</label>
          <input name="titleEn" required className="input" />
        </div>
        <div>
          <label className="label">{t.upload.fTitleZh}</label>
          <input name="titleZh" required className="input" />
        </div>
        <div>
          <label className="label">{t.upload.fSummaryEn}</label>
          <input name="summaryEn" className="input" />
        </div>
        <div>
          <label className="label">{t.upload.fSummaryZh}</label>
          <input name="summaryZh" className="input" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">{t.upload.fLive}</label>
          <input name="liveUrl" type="url" className="input" placeholder="https://" />
        </div>
        <div>
          <label className="label">{t.upload.fThumb}</label>
          <input name="thumbnail" type="url" className="input" placeholder="https://" />
        </div>
      </div>

      <div>
        <label className="label">{t.upload.fTags}</label>
        <input name="tags" className="input" placeholder="webgl, scroll, three.js" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">{t.upload.fPromptEn}</label>
          <textarea name="promptEn" rows={5} className="input" />
        </div>
        <div>
          <label className="label">{t.upload.fPromptZh}</label>
          <textarea name="promptZh" rows={5} className="input" />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-panel p-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isPremium"
            checked={premium}
            onChange={(e) => setPremium(e.target.checked)}
          />
          <span>{t.upload.fPremium}</span>
        </label>
        {premium && (
          <div className="mt-3">
            <label className="label">{t.upload.fPrice}</label>
            <input name="priceCents" type="number" min={50} defaultValue={500} className="input max-w-40" />
          </div>
        )}
      </div>

      <p className="text-xs text-white/40">{t.upload.onlyOriginal}</p>

      <button type="submit" disabled={loading} className="btn btn-primary disabled:opacity-60">
        {loading ? "…" : t.upload.submit}
      </button>
      {ok && <p className="text-sm text-accent2">{ok}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
