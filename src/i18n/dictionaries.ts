import en from "./en.json";
import zh from "./zh.json";
import type { Locale } from "./config";

const dicts = { en, zh } as const;
export type Dict = typeof en;

export function getDict(locale: Locale): Dict {
  return dicts[locale];
}
