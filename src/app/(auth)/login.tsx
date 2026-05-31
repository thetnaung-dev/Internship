import { supabase } from "@/lib/supabase";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  StatusBar,
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

import { AlertTriangle } from "lucide-react-native";

import { useTranslation } from "react-i18next";

export default function LoginScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errorDialog, setErrorDialog] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const [logoutDialog, setLogoutDialog] = useState(false);

  useEffect(() => {
    if (params.logout === "success") {
      setLogoutDialog(true);
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

  const openError = (title: string, message: string) => {
    setErrorDialog({
      visible: true,
      title,
      message,
    });
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      openError(t("login.errorTitle"), t("login.enterEmailPassword"));
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        openError(t("login.loginFailed"), error.message);
        return;
      }

      router.replace("/(tabs)");
    } catch (err: any) {
      openError(t("login.errorTitle"), err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />

      {/* CENTER SCREEN */}
      <View className="flex-1 justify-center px-6">
        <View>
          {/* HEADER */}
          <View className="items-center mb-10">
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/1040/1040230.png",
              }}
              className="w-24 h-24"
            />

            <Text className="text-3xl font-bold text-slate-900 mt-5">
              {t("login.title")}
            </Text>

            <Text className="text-slate-500 mt-2 text-center">
              {t("login.subtitle")}
            </Text>
          </View>

          {/* FORM */}
          <View>
            <Text className="text-slate-700 font-medium mb-2">
              {t("login.email")}
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t("login.emailPlaceholder")}
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-800"
            />

            <Text className="text-slate-700 font-medium mb-2 mt-5">
              {t("login.password")}
            </Text>

            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder={t("login.passwordPlaceholder")}
              className="bg-white border border-slate-200 rounded-2xl px-4 py-4 text-slate-800"
            />

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="bg-amber-500 rounded-2xl py-4 items-center mt-8"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-base">
                  {t("login.signIn")}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* FOOTER */}
          <View className="flex-row justify-center mt-10">
            <Text className="text-slate-500">{t("login.noAccount")}</Text>

            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text className="text-amber-500 font-bold ml-2">
                {t("login.register")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ERROR DIALOG */}
      <AlertDialog
        isOpen={errorDialog.visible}
        onClose={() => setErrorDialog((p) => ({ ...p, visible: false }))}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent className="p-6 rounded-3xl bg-white items-center">
          <AlertTriangle size={40} color="red" />

          <AlertDialogHeader>
            <Heading>{errorDialog.title}</Heading>
          </AlertDialogHeader>

          <AlertDialogBody>
            <Text className="text-center text-slate-500">
              {errorDialog.message}
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              onPress={() => setErrorDialog((p) => ({ ...p, visible: false }))}
              className="bg-amber-500 w-full"
            >
              <ButtonText>OK</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
}
