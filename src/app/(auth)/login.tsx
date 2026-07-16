import { handleAuthCallbackUrl, resetAuthCallbackLock } from "@/lib/handleAuthCallback";
import { registerForPushNotifications, savePushToken } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const signInWithGoogle = async () => {
  const redirectUrl = Linking.createURL("auth/callback");

  resetAuthCallbackLock();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error("Failed to get OAuth URL. Is Google provider enabled in Supabase?");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
  await WebBrowser.maybeCompleteAuthSession();

  if (result.type === "success") {
    await handleAuthCallbackUrl(result.url);
  }
};

export default function LoginScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [infoDialog, setInfoDialog] = useState({
    visible: false,
    title: "",
    message: "",
    isSuccess: false,
  });

  useEffect(() => {
    if (params.logout === "success") {
      setInfoDialog({
        visible: true,
        title: "Logged Out",
        message: "You have been logged out successfully.",
        isSuccess: true,
      });
    }
  }, [params.logout]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        router.replace("/(tabs)");
        return true;
      };
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress,
      );
      return () => subscription.remove();
    }, []),
  );

  const openInfo = (
    title: string,
    message: string,
    isSuccess: boolean = false,
  ) => {
    setInfoDialog({ visible: true, title, message, isSuccess });
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      openInfo(t("login.errorTitle"), t("login.enterEmailPassword"), false);
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        openInfo(t("login.loginFailed"), error.message, false);
        return;
      }

      const token = await registerForPushNotifications();
      if (token) await savePushToken(token);

      router.replace("/(tabs)");
    } catch (err: any) {
      openInfo(t("login.errorTitle"), err.message, false);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();

      const token = await registerForPushNotifications();
      if (token) await savePushToken(token);
    } catch (err: any) {
      openInfo(t("login.errorTitle"), err.message, false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-100">
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6 py-10">
            <View className="items-center mb-10">
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/1040/1040230.png",
                }}
                className="w-24 h-24 mb-4"
                resizeMode="contain"
              />
              <Text className="text-3xl font-rubik-bold text-black-300 mt-5">
                {t("login.title")}
              </Text>
              <Text className="text-black-100 font-rubik mt-2 text-center">
                {t("login.subtitle")}
              </Text>
            </View>

            <View>
              <Text className="text-black-200 font-rubik-medium mb-2">
                {t("login.email")}
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t("login.emailPlaceholder")}
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-white border border-primary-200 rounded-2xl px-4 py-4 text-black-300 font-rubik"
              />
              <Text className="text-black-200 font-rubik-medium mb-2 mt-5">
                {t("login.password")}
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="oneTimeCode"
                autoComplete="off"
                placeholder={t("login.passwordPlaceholder")}
                className="bg-white border border-primary-200 rounded-2xl px-4 py-4 text-black-300 font-rubik"
              />

              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                className="bg-primary-300 rounded-2xl py-4 items-center mt-8"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-rubik-bold text-base">
                    {t("login.signIn")}
                  </Text>
                )}
              </TouchableOpacity>

              <View className="flex-row items-center my-6">
                <View className="flex-1 h-px bg-primary-200" />
                <Text className="mx-4 text-black-100 text-sm font-rubik">or</Text>
                <View className="flex-1 h-px bg-primary-200" />
              </View>

              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={loading}
                className="flex-row items-center justify-center bg-white border border-primary-200 rounded-2xl py-4 active:opacity-80"
              >
                <Image
                  source={{
                    uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
                  }}
                  className="w-6 h-6 mr-3"
                  resizeMode="contain"
                />
                <Text className="text-black-300 font-rubik-semibold text-base">
                  {t("login.googleButton")}
                </Text>
              </TouchableOpacity>

              <View className="flex-row justify-center mt-6">
                <Text className="text-black-100 font-rubik">{t("login.noAccount")} </Text>
                <TouchableOpacity onPress={() => router.push("/register")}>
                  <Text className="text-primary-300 font-rubik-bold">{t("login.register")}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
