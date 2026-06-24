import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function AuthCallback() {
  useEffect(() => {
    const handleUrl = async (url: string) => {
      const fragment = url.split("#")[1];
      if (fragment) {
        const params = fragment.split("&").reduce<Record<string, string>>(
          (acc, pair) => {
            const [key, value] = pair.split("=");
            acc[key] = decodeURIComponent(value);
            return acc;
          },
          {},
        );

        const { access_token, refresh_token } = params;

        if (access_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token: refresh_token || "",
          });

          if (!error) {
            router.replace("/(tabs)");
            return;
          }
        }
      }
      router.replace("/(auth)/login");
    };

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    const subscription = Linking.addEventListener("url", (event) => {
      handleUrl(event.url);
    });

    return () => subscription.remove();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-primary-100">
      <ActivityIndicator size="large" color="#22c55e" />
    </View>
  );
}
