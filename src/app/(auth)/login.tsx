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
import { supabase } from "@/lib/supabase";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { AlertTriangle, CheckCircle } from "lucide-react-native";
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
      router.replace("/(tabs)");
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
                className="w-24 h-24"
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

      <AlertDialog
        isOpen={infoDialog.visible}
        onClose={() => setInfoDialog((p) => ({ ...p, visible: false }))}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent className="p-6 rounded-3xl bg-white items-center">
          {infoDialog.isSuccess ? (
            <CheckCircle size={40} color="#22c55e" />
          ) : (
            <AlertTriangle size={40} color="#F75555" />
          )}
          <AlertDialogHeader>
            <Heading>{infoDialog.title}</Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text className="text-center text-black-200 font-rubik">
              {infoDialog.message}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              onPress={() => setInfoDialog((p) => ({ ...p, visible: false }))}
              className="bg-primary-300 w-full"
            >
              <ButtonText>OK</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
}
