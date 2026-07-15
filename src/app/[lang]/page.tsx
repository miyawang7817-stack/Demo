import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { listDemos } from "@/lib/demos";
import DemoCard from "@/components/DemoCard";

export const dynamic = "force-dynamic";

export default async function Home({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const locale = params.lang;
  const t = getDict(locale);
  const demos = await listDemos(locale);

  return (
    <div>
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1533] to-[#0f0f18] px-6 py-16 sm:px-12">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          {t.home.heroTitle}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/60">{t.home.heroSub}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/${locale}#gallery`} className="btn btn-primary">
            {t.home.browse}
          </Link>
          <Link href={`/${locale}/upload`} className="btn btn-ghost">
            {t.home.share}
          </Link>
        </div>
      </section>

      <section id="gallery" className="mt-12">
        <h2 className="mb-5 text-xl font-semibold">{t.home.all}</h2>
        {demos.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-panel p-8 text-center text-white/40">
            {t.home.empty}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {demos.map((demo) => (
              <DemoCard key={demo.id} demo={demo} locale={locale} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
