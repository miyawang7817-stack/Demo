import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import LangSwitch from "./LangSwitch";

export default function Header({
  locale,
  user,
}: {
  locale: Locale;
  user: { email: string; name: string | null } | null;
}) {
  const t = getDict(locale);
  const base = `/${locale}`;
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href={base} className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-block h-6 w-6 rounded-md bg-gradient-to-br from-accent to-accent2" />
          {t.brand}
        </Link>
        <nav className="ml-4 hidden items-center gap-4 text-sm text-white/70 sm:flex">
          <Link href={base} className="hover:text-white">
            {t.nav.gallery}
          </Link>
          <Link href={`${base}/upload`} className="hover:text-white">
            {t.nav.upload}
          </Link>
          <Link href={`${base}/pricing`} className="hover:text-white">
            {t.nav.pricing}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <LangSwitch locale={locale} />
          <Link
            href={`${base}/account`}
            className="rounded-md border border-white/15 px-2.5 py-1 text-sm text-white/80 hover:bg-white/5"
          >
            {user ? user.name || user.email : t.nav.signIn}
          </Link>
        </div>
      </div>
    </header>
  );
}
