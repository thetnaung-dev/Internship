import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { ChevronLeft, Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/features/ui/alertdialog/alertdialog";

import { Button, ButtonText } from "@/components/features/ui/button/button";
import { Heading } from "@/components/features/ui/heading/heading";
import { useTranslation } from "react-i18next";

WebBrowser.maybeCompleteAuthSession();

const signInWithGoogle = async () => {
  const redirectUrl = Linking.createURL("auth/callback");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) throw error;
  if (!data?.url) throw new Error("Failed to get OAuth URL. Is Google provider enabled in Supabase?");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

  if (result.type === "success") {
    const fragment = result.url.split("#")[1];
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
        await supabase.auth.setSession({
          access_token,
          refresh_token: refresh_token || "",
        });
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace("/(tabs)");
          return;
        }
      }
    }
  }

  throw new Error("Google sign-in was cancelled or failed. Please try again.");
};

export default function RegisterScreen() {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorDialog, setErrorDialog] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const [successDialog, setSuccessDialog] = useState(false);

  const openError = (title: string, message: string) => {
    setErrorDialog({ visible: true, title, message });
  };

  const handleRegister = async () => {
    try {
      if (!name || !email || !password || !confirmPassword) {
        openError(t("register.errors.error"), t("register.errors.fillAll"));
        return;
      }

      if (password !== confirmPassword) {
        openError(t("register.errors.error"), t("register.errors.passwordMismatch"));
        return;
      }

      setLoading(true);

      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (error) {
        openError(t("register.errors.invalid"), error.message);
        return;
      }

      if (signUpData.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({
            id: signUpData.user.id,
            full_name: name,
            email: email,
          });

        if (profileError) {
          openError(t("register.errors.invalid"), profileError.message);
          return;
        }
      }

      setSuccessDialog(true);

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      openError(t("register.errors.error"), err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err: any) {
      openError(t("register.errors.error"), err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-100">
      <View className="px-4 py-4 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white border border-primary-200"
        >
          <ChevronLeft size={24} color="#22c55e" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mt-4 mb-8">
          <Text className="text-3xl font-rubik-extrabold text-black-300">
            {t("register.title")}
          </Text>
          <Text className="text-black-100 font-rubik mt-2 text-sm">
            {t("register.subtitle")}
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-black-200 font-rubik-semibold mb-2 text-sm">
            {t("register.name")}
          </Text>
          <View className="flex-row items-center bg-white border border-primary-200 rounded-xl px-4 py-3">
            <User size={20} color="#8C8E98" />
            <TextInput
              value={name}
              onChangeText={setName}
              className="flex-1 ml-3 font-rubik text-black-300"
              placeholder={t("register.namePlaceholder")}
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-black-200 font-rubik-semibold mb-2 text-sm">
            {t("register.email")}
          </Text>
          <View className="flex-row items-center bg-white border border-primary-200 rounded-xl px-4 py-3">
            <Mail size={20} color="#8C8E98" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              className="flex-1 ml-3 font-rubik text-black-300"
              placeholder={t("register.emailPlaceholder")}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-black-200 font-rubik-semibold mb-2 text-sm">
            {t("register.password")}
          </Text>
          <View className="flex-row items-center bg-white border border-primary-200 rounded-xl px-4 py-3">
            <Lock size={20} color="#8C8E98" />
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              className="flex-1 ml-3 font-rubik text-black-300"
              placeholder={t("register.passwordPlaceholder")}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} color="#666876" /> : <Eye size={20} color="#666876" />}
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-black-200 font-rubik-semibold mb-2 text-sm">
            {t("register.confirmPassword")}
          </Text>
          <View className="flex-row items-center bg-white border border-primary-200 rounded-xl px-4 py-3">
            <Lock size={20} color="#8C8E98" />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              className="flex-1 ml-3 font-rubik text-black-300"
              placeholder={t("register.passwordPlaceholder")}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff size={20} color="#666876" /> : <Eye size={20} color="#666876" />}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          className="bg-primary-300 py-4 rounded-xl items-center mt-6"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-rubik-bold">{t("register.button")}</Text>
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
          className="flex-row items-center justify-center bg-white border border-primary-200 rounded-xl py-4 active:opacity-80"
        >
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/2991/2991148.png",
            }}
            className="w-6 h-6 mr-3"
          />
          <Text className="text-black-300 font-rubik-semibold text-base">
            {t("register.googleButton")}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center items-center mt-6 mb-12">
          <Text className="text-black-100 text-sm font-rubik">
            {t("register.haveAccount")}
          </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text className="text-primary-300 font-rubik-bold text-sm ml-1">
              {t("register.login")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AlertDialog
        isOpen={successDialog}
        onClose={() => setSuccessDialog(false)}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent className="p-6 rounded-3xl bg-white items-center">
          <AlertDialogHeader>
            <Heading>{t("register.successTitle")}</Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text className="text-center text-black-200 font-rubik">
              {t("register.successMessage")}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              className="bg-primary-300 w-full"
              onPress={() => {
                setSuccessDialog(false);
                router.replace("/(auth)/login");
              }}
            >
              <ButtonText>OK</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        isOpen={errorDialog.visible}
        onClose={() => setErrorDialog((p) => ({ ...p, visible: false }))}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent className="p-6 rounded-3xl bg-white items-center">
          <AlertDialogHeader>
            <Heading>{errorDialog.title}</Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text className="text-center text-black-200 font-rubik">
              {errorDialog.message}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              className="bg-primary-300 w-full"
              onPress={() => setErrorDialog((p) => ({ ...p, visible: false }))}
            >
              <ButtonText>OK</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
}
