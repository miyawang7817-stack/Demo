import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { getDemo, isUnlocked } from "@/lib/demos";
import { getCurrentUser } from "@/lib/session";
import PromptBlock from "@/components/PromptBlock";
import Paywall from "@/components/Paywall";

export const dynamic = "force-dynamic";

const SOURCE_LABEL: Record<string, string> = {
  codrops: "Codrops",
  motionsites: "motionsites.ai",
  creator: "Creator",
  original: "MotionHub",
};

export default async function DemoPage({
  params,
  searchParams,
}: {
  params: { lang: string; slug: string };
  searchParams: { unlocked?: string };
}) {
  if (!isLocale(params.lang)) notFound();
  const locale = params.lang;
  const t = getDict(locale);
  const demo = await getDemo(params.slug, locale);
  if (!demo) notFound();

  const user = await getCurrentUser();
  const unlocked =
    !demo.isPremium || searchParams.unlocked === "1" || (await isUnlocked(user?.id ?? null, demo.id));
  const currency = process.env.UNLOCK_CURRENCY || "usd";
  const isExternal = demo.source !== "original" && demo.source !== "creator";

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/${locale}`} className="text-sm text-white/50 hover:text-white">
        ← {t.nav.gallery}
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/40">
        {demo.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={demo.thumbnail} alt={demo.title} className="w-full object-cover" />
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{demo.title}</h1>
          {demo.summary && <p className="mt-1 text-white/60">{demo.summary}</p>}
        </div>
        {demo.liveUrl && (
          <a href={demo.liveUrl} target="_blank" rel="noreferrer" className="btn btn-ghost">
            {t.card.viewLive} ↗
          </a>
        )}
      </div>

      {demo.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {demo.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/50">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-8">
        {demo.prompt ? (
          unlocked ? (
            <PromptBlock prompt={demo.prompt} locale={locale} />
          ) : (
            <Paywall
              slug={demo.slug}
              locale={locale}
              priceCents={demo.priceCents}
              currency={currency}
              previewPrompt={demo.prompt.slice(0, 140) + " …"}
              signedIn={!!user}
            />
          )
        ) : (
          <p className="rounded-xl border border-white/10 bg-panel p-4 text-white/50">
            {isExternal ? t.demo.attribution : t.account.none}
          </p>
        )}
      </div>

      {(isExternal || demo.authorName) && (
        <div className="mt-6 rounded-xl border border-white/10 bg-panel p-4 text-sm text-white/60">
          {demo.authorName && (
            <p>
              {t.card.by} <span className="text-white/90">{demo.authorName}</span>
            </p>
          )}
          {isExternal && (
            <>
              <p className="mt-1">
                {t.card.source}:{" "}
                <span className="text-white/90">
                  {demo.sourceName || SOURCE_LABEL[demo.source] || demo.source}
                </span>
              </p>
              {demo.sourceUrl && (
                <a
                  href={demo.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-accent2 hover:underline"
                >
                  {t.demo.viewOriginal} ↗
                </a>
              )}
              {demo.license && <p className="mt-2 text-xs text-white/40">{demo.license}</p>}
              <p className="mt-2 text-xs text-white/40">{t.demo.attribution}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
