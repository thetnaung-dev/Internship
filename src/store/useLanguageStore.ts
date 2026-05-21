// src/store/useLanguageStore.ts
import { i18n } from "@/services/localization";
import { create } from "zustand";

interface LanguageState {
  locale: string;
  setLocale: (locale: string) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  locale: i18n.language || "en",
  setLocale: async (locale) => {
    await i18n.changeLanguage(locale);
    set({ locale });
  },
  toggleLanguage: async () => {
    const currentLocale = get().locale;
    const nextLocale = currentLocale === "en" ? "my" : "en";
    try {
      await i18n.changeLanguage(nextLocale);
      set({ locale: nextLocale });
    } catch (err) {
      console.error("Failed to change language in i18next:", err);
    }
  },
}));
