import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── GLUESTACK ALERT DIALOG ──
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

// ✅ i18n
import { useTranslation } from "react-i18next";

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
    setErrorDialog({
      visible: true,
      title,
      message,
    });
  };

  const handleRegister = async () => {
    try {
      if (!name || !email || !password || !confirmPassword) {
        openError(t("register.errors.error"), t("register.errors.fillAll"));
        return;
      }

      if (password !== confirmPassword) {
        openError(
          t("register.errors.error"),
          t("register.errors.passwordMismatch"),
        );
        return;
      }

      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (error) {
        openError(t("register.errors.invalid"), error.message);
        return;
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

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* HEADER */}
      <View className="px-4 py-4 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm"
        >
          <ChevronLeft size={24} color="#334155" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* TITLE */}
        <View className="mt-4 mb-8">
          <Text className="text-3xl font-extrabold text-slate-800">
            {t("register.title")}
          </Text>
          <Text className="text-slate-500 mt-2 text-sm">
            {t("register.subtitle")}
          </Text>
        </View>

        {/* NAME */}
        <View className="mb-4">
          <Text className="text-slate-600 font-semibold mb-2 text-sm">
            {t("register.name")}
          </Text>
          <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
            <User size={20} color="#94a3b8" />
            <TextInput
              value={name}
              onChangeText={setName}
              className="flex-1 ml-3"
              placeholder={t("register.namePlaceholder")}
            />
          </View>
        </View>

        {/* EMAIL */}
        <View className="mb-4">
          <Text className="text-slate-600 font-semibold mb-2 text-sm">
            {t("register.email")}
          </Text>
          <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
            <Mail size={20} color="#94a3b8" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              className="flex-1 ml-3"
              placeholder={t("register.emailPlaceholder")}
            />
          </View>
        </View>

        {/* PASSWORD */}
        <View className="mb-4">
          <Text className="text-slate-600 font-semibold mb-2 text-sm">
            {t("register.password")}
          </Text>
          <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
            <Lock size={20} color="#94a3b8" />
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              className="flex-1 ml-3"
              placeholder={t("register.passwordPlaceholder")}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* CONFIRM PASSWORD */}
        <View className="mb-4">
          <Text className="text-slate-600 font-semibold mb-2 text-sm">
            {t("register.confirmPassword")}
          </Text>
          <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
            <Lock size={20} color="#94a3b8" />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              className="flex-1 ml-3"
              placeholder={t("register.passwordPlaceholder")}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* BUTTON */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          className="bg-amber-500 py-4 rounded-xl items-center mt-6"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold">{t("register.button")}</Text>
          )}
        </TouchableOpacity>

        {/* LOGIN LINK */}
        <View className="flex-row justify-center items-center mt-6 mb-12">
          <Text className="text-slate-500 text-sm">
            {t("register.haveAccount")}
          </Text>

          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text className="text-amber-500 font-bold text-sm ml-1">
              {t("register.login")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* SUCCESS DIALOG */}
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
            <Text className="text-center text-slate-500">
              {t("register.successMessage")}
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              className="bg-amber-500 w-full"
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

      {/* ERROR DIALOG */}
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
            <Text className="text-center text-slate-500">
              {errorDialog.message}
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              className="bg-amber-500 w-full"
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
