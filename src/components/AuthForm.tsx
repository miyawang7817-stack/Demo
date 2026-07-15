"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";

export default function AuthForm({ locale }: { locale: Locale }) {
  const t = getDict(locale);
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/signin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "sign in failed");
      const next = params.get("next") || `/${locale}/account`;
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "sign in failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="max-w-sm space-y-4">
      <div>
        <label className="label">{t.account.emailLabel}</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="label">{t.account.nameLabel}</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
      </div>
      <button type="submit" disabled={loading} className="btn btn-primary disabled:opacity-60">
        {loading ? "…" : t.account.signInCta}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
