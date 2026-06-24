import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";

import { handleAuthCallbackUrl } from "@/lib/handleAuthCallback";

export default function AuthCallback() {
  const timedOut = useRef(false);

  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleAuthCallbackUrl(url);
      }
    });

    const subscription = Linking.addEventListener("url", (event) => {
      handleAuthCallbackUrl(event.url);
    });

    const timeout = setTimeout(() => {
      timedOut.current = true;
      router.replace("/(auth)/login");
    }, 15000);

    return () => {
      clearTimeout(timeout);
      subscription.remove();
    };
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-primary-100">
      <ActivityIndicator size="large" color="#22c55e" />
    </View>
  );
}
