import type { Lang } from "@/lib/types";

export const defaultLang: Lang = "en";
export const languages: Lang[] = ["en", "it"];

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  it: () => import("./dictionaries/it.json").then((m) => m.default),
};

export async function getDictionary(lang: Lang) {
  return dictionaries[lang]();
}
