import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { getDict } from "@/i18n/dictionaries";
import type { DemoView } from "@/lib/demos";

const SOURCE_LABEL: Record<string, string> = {
  codrops: "Codrops",
  motionsites: "motionsites.ai",
  creator: "Creator",
  original: "MotionHub",
};

export default function DemoCard({ demo, locale }: { demo: DemoView; locale: Locale }) {
  const t = getDict(locale);
  return (
    <Link
      href={`/${locale}/demo/${demo.slug}`}
      className="card-hover group block overflow-hidden rounded-2xl border border-white/10 bg-panel"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-black/40">
        {demo.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={demo.thumbnail}
            alt={demo.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/20">no preview</div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            demo.isPremium ? "bg-accent text-white" : "bg-white/15 text-white"
          }`}
        >
          {demo.isPremium ? t.card.premium : t.card.free}
        </span>
        {demo.source !== "original" && demo.source !== "creator" && (
          <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs text-white/80">
            {SOURCE_LABEL[demo.source] ?? demo.source}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 font-medium">{demo.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/50">{demo.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {demo.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/50">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
