import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import { getCurrentUser } from "@/lib/session";
import UploadForm from "@/components/UploadForm";

export const dynamic = "force-dynamic";

export default async function Upload({ params }: { params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  const locale = params.lang;
  const t = getDict(locale);
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">{t.upload.title}</h1>
      <p className="mt-2 text-white/60">{t.upload.sub}</p>

      {!user ? (
        <div className="mt-8 rounded-xl border border-white/10 bg-panel p-6">
          <p className="text-white/70">{t.upload.needSignIn}</p>
          <Link href={`/${locale}/account?next=/${locale}/upload`} className="btn btn-primary mt-4">
            {t.nav.signIn}
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <UploadForm locale={locale} />
        </div>
      )}
    </div>
  );
}
