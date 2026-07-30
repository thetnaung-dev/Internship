import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { router, Stack } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "../../global.css";

import i18n from "@/lib/i18n";
import {
  registerForPushNotifications,
  savePushToken,
  setupNotificationListeners,
} from "@/lib/notifications";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useThemeStore } from "@/store/useThemeStore";
import ThemeProvider from "@/components/ThemeProvider";
import { useNetworkListener } from "@/hooks/useNetworkListener";
import OfflineOverlay from "@/components/OfflineOverlay";

const linking = {
  prefixes: [Linking.createURL("/")],
  config: {
    screens: {
      "(auth)": {
        screens: {
          "reset-password": "reset-password",
        },
      },
    },
  },
};

export default function RootLayout() {
  useEffect(() => {
    useLanguageStore.getState().loadLanguage();
    useThemeStore.getState().loadTheme();
  }, []);

  useNetworkListener();

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const unsub = useLanguageStore.subscribe((state) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => i18n.changeLanguage(state.language), 0);
    });
    return () => { clearTimeout(timeout); unsub(); };
  }, []);

  useEffect(() => {
    const handleDeepLink = (url: string) => {
      const path = url.replace(/.*?:\/\//, "").replace(/^\/+/, "");

      if (path.startsWith("reset-password")) {
        router.push("/(auth)/reset-password");
        return;
      }

      const propertyMatch = path.match(/(?:^|\/)property\/([^?#]+)/);
      if (propertyMatch) {
        router.push(`/property/${propertyMatch[1]}`);
      }
    };

    const subscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) savePushToken(token);
    });

    const sub = setupNotificationListeners((data) => {
      if (data.screen === "chat" && data.conversationId) {
        router.push(`/chat/${data.conversationId}`);
      } else if (data.screen === "property" && data.propertyId) {
        router.push(`/property/${data.propertyId}`);
      }
    });

    return () => sub.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <ThemeProvider>
          <BottomSheetModalProvider>
            <Stack screenOptions={{ headerShown: false }} linking={linking}>
              <Stack.Screen name="index" />
              <Stack.Screen name="chat" />
            </Stack>
            <OfflineOverlay />
          </BottomSheetModalProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
