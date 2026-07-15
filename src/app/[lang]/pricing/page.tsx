import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";

export default function Pricing({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const t = getDict(params.lang);

  const cols = [
    { title: t.pricing.freeTitle, list: t.pricing.freeList, accent: false },
    { title: t.pricing.premiumTitle, list: t.pricing.premiumList, accent: true },
    { title: t.pricing.creatorTitle, list: t.pricing.creatorList, accent: false },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold">{t.pricing.title}</h1>
      <p className="mt-2 text-white/60">{t.pricing.sub}</p>
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        {cols.map((c) => (
          <div
            key={c.title}
            className={`rounded-2xl border p-6 ${
              c.accent ? "border-accent/50 bg-accent/10" : "border-white/10 bg-panel"
            }`}
          >
            <h2 className="text-lg font-semibold">{c.title}</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {c.list.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-accent2">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
