import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../../global.css";

import i18n from "@/lib/i18n";
import { useLanguageStore } from "@/store/useLanguageStore";

export default function RootLayout() {
  const language = useLanguageStore((s) => s.language);
  const loadLanguage = useLanguageStore((s) => s.loadLanguage);

  useEffect(() => {
    loadLanguage();
  }, []);

  useEffect(() => {
    if (i18n && typeof i18n.changeLanguage === "function") {
      i18n.changeLanguage(language || "mm");
    }
  }, [language]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="chat" />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
