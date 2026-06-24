import { supabase } from "@/lib/supabase";
import { router } from "expo-router";

export async function handleAuthCallbackUrl(url: string) {
  if (!url.includes("auth/callback")) return false;

  // 1. PKCE flow — code is in query params, preserved by Android
  const queryStart = url.indexOf("?");
  if (queryStart !== -1) {
    const queryString = url.slice(queryStart + 1).split("#")[0];
    const queryParams = queryString.split("&").reduce<Record<string, string>>(
      (acc, pair) => {
        const [key, value] = pair.split("=");
        acc[key] = decodeURIComponent(value);
        return acc;
      },
      {},
    );

    if (queryParams.code) {
      const { error } = await supabase.auth.exchangeCodeForSession(
        queryParams.code,
      );
      if (!error) {
        router.replace("/(tabs)");
        return true;
      }
    }
  }

  // 2. Implicit flow fallback — fragment with access_token
  const fragment = url.split("#")[1];
  if (!fragment) return false;

  const params = fragment.split("&").reduce<Record<string, string>>(
    (acc, pair) => {
      const [key, value] = pair.split("=");
      acc[key] = decodeURIComponent(value);
      return acc;
    },
    {},
  );

  const { access_token, refresh_token } = params;

  if (!access_token) return false;

  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token: refresh_token || "",
  });

  if (error) return false;

  router.replace("/(tabs)");
  return true;
}
