import { useColorScheme, View } from "react-native";
import { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const theme = useThemeStore((s) => s.theme);
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const setResolvedTheme = useThemeStore((s) => s.setResolvedTheme);

  useEffect(() => {
    const resolved = theme === "system" ? (systemScheme ?? "light") : theme;
    setResolvedTheme(resolved);
  }, [theme, systemScheme]);

  return (
    <View className={`flex-1 ${resolvedTheme === "dark" ? "dark" : ""}`}>
      {children}
    </View>
  );
}
