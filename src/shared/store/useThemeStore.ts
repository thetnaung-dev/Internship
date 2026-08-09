import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

type Theme = "light" | "dark" | "system";

type ThemeStore = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => Promise<void>;
  loadTheme: () => Promise<void>;
  setResolvedTheme: (theme: "light" | "dark") => void;
};

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "system",
  resolvedTheme: "light",

  setTheme: async (theme) => {
    await AsyncStorage.setItem("theme", theme);
    set({ theme });
  },

  loadTheme: async () => {
    const saved = await AsyncStorage.getItem("theme");
    if (saved === "light" || saved === "dark" || saved === "system") {
      set({ theme: saved });
    }
  },

  setResolvedTheme: (resolvedTheme) => {
    set({ resolvedTheme });
  },
}));
