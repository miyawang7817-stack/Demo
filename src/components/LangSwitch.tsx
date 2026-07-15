"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";

export default function LangSwitch({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const other: Locale = locale === "en" ? "zh" : "en";
  // Swap the leading /en or /zh segment, keep the rest of the path.
  const target = pathname.replace(/^\/(en|zh)/, `/${other}`);
  return (
    <Link
      href={target || `/${other}`}
      className="rounded-md border border-white/15 px-2.5 py-1 text-sm text-white/80 hover:bg-white/5"
    >
      {other === "zh" ? "中文" : "EN"}
    </Link>
  );
}
