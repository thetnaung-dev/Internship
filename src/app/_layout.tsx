import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../../global.css";

import i18n from "@/lib/i18n";
import { useLanguageStore } from "@/store/useLanguageStore";
import { handleAuthCallbackUrl } from "@/lib/handleAuthCallback";

export default function RootLayout() {
  const language = useLanguageStore((s) => s.language);
  const loadLanguage = useLanguageStore((s) => s.loadLanguage);
  const handled = useRef(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  useEffect(() => {
    if (i18n && typeof i18n.changeLanguage === "function") {
      i18n.changeLanguage(language || "mm");
    }
  }, [language]);

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url && url.includes("auth/callback") && !handled.current) {
        handled.current = true;
        handleAuthCallbackUrl(url);
      }
    });

    const subscription = Linking.addEventListener("url", (event) => {
      if (event.url.includes("auth/callback") && !handled.current) {
        handled.current = true;
        handleAuthCallbackUrl(event.url);
      }
    });

    return () => subscription.remove();
  }, []);

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
