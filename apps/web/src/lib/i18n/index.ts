import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dictionaries, type Lang, type UiKey } from "./dictionaries";

export type { Lang, UiKey };

/**
 * UI language is app-level (the adult's choice). Story/profile language is
 * per child profile and handled separately — that's why this isn't URL-based
 * locale routing: a parent browsing in Urdu can have a child reading in English.
 */
interface UiLangState {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
}

export const useUiLang = create<UiLangState>()(
  persist(
    (set, get) => ({
      lang: "en",
      setLang: (lang) => set({ lang }),
      toggle: () => set({ lang: get().lang === "en" ? "ur" : "en" }),
    }),
    { name: "zebra-ui-lang" },
  ),
);

export function t(lang: Lang, key: UiKey): string {
  return dictionaries[lang][key];
}

export function dirFor(lang: Lang): "ltr" | "rtl" {
  return lang === "ur" ? "rtl" : "ltr";
}

/** Tailwind font class for a language. */
export function fontFor(lang: Lang): string {
  return lang === "ur" ? "urdu" : "";
}
