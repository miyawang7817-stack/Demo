import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/db";
import { localize } from "@/lib/demos";
import AuthForm from "@/components/AuthForm";

export const dynamic = "force-dynamic";

export default async function Account({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const locale = params.lang;
  const t = getDict(locale);
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold">{t.nav.signIn}</h1>
        <p className="mb-6 mt-2 text-sm text-white/50">
          {locale === "zh"
            ? "输入邮箱即可继续（演示用的轻量登录，生产环境可换成 NextAuth）。"
            : "Enter your email to continue (lightweight demo auth; swap for NextAuth in production)."}
        </p>
        <AuthForm locale={locale} />
      </div>
    );
  }

  const [unlocks, myDemos] = await Promise.all([
    prisma.unlock.findMany({
      where: { userId: user.id },
      include: { demo: { include: { author: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.demo.findMany({
      where: { authorId: user.id },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t.account.title}</h1>
        <form action="/api/signout" method="post">
          <button className="btn btn-ghost text-sm">{t.nav.signOut}</button>
        </form>
      </div>
      <p className="mt-1 text-white/50">
        {t.account.signedInAs} <span className="text-white/90">{user.name || user.email}</span>
      </p>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t.account.unlocked}</h2>
        {unlocks.length === 0 ? (
          <p className="text-white/40">{t.account.none}</p>
        ) : (
          <ul className="space-y-2">
            {unlocks.map((u) => {
              const d = localize(u.demo, locale);
              return (
                <li key={u.id}>
                  <Link href={`/${locale}/demo/${d.slug}`} className="text-accent2 hover:underline">
                    {d.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">{t.account.yourDemos}</h2>
        {myDemos.length === 0 ? (
          <p className="text-white/40">{t.account.none}</p>
        ) : (
          <ul className="space-y-2">
            {myDemos.map((row) => {
              const d = localize(row, locale);
              return (
                <li key={d.id} className="flex items-center gap-2">
                  <Link href={`/${locale}/demo/${d.slug}`} className="text-accent2 hover:underline">
                    {d.title}
                  </Link>
                  <span className="text-xs text-white/40">
                    · {d.isPremium ? t.card.premium : t.card.free}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
