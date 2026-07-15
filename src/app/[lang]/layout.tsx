import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import Header from "@/components/Header";

export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "zh" }];
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { lang: string };
}) {
  if (!isLocale(params.lang)) notFound();
  const locale = params.lang;
  const t = getDict(locale);
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen">
      <Header locale={locale} user={user} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      <footer className="mt-16 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-white/40">
          <p>{t.footer.note}</p>
          <p className="mt-2">© {t.brand} · {t.footer.built}</p>
        </div>
      </footer>
    </div>
  );
}
