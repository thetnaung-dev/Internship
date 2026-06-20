import { router } from "expo-router";
import { ChevronLeft, Mail } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) return;
    setLoading(true);
    // Simulate send
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white border border-slate-100"
        >
          <ChevronLeft size={24} color="#334155" />
        </TouchableOpacity>
      </View>
      <ScrollView
        className="flex-1 px-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-4 mb-8">
          <Text className="text-3xl font-extrabold text-slate-800">
            Forgot Password
          </Text>
          <Text className="text-slate-500 mt-2 text-sm">
            Enter your email to receive a reset link.
          </Text>
        </View>

        {sent ? (
          <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 items-center">
            <Text className="text-emerald-700 font-bold text-lg text-center">
              Check your email
            </Text>
            <Text className="text-emerald-600 mt-2 text-center">
              We've sent a password reset link to {email}
            </Text>
          </View>
        ) : (
          <View>
            <Text className="text-slate-600 font-semibold mb-2 text-sm">
              Email
            </Text>
            <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
              <Mail size={20} color="#94a3b8" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                className="flex-1 ml-3"
              />
            </View>
            <TouchableOpacity
              onPress={handleSend}
              disabled={loading}
              className="bg-amber-500 py-4 rounded-xl items-center mt-8"
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold">Send Reset Link</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          className="items-center mt-6"
        >
          <Text className="text-amber-500 font-bold">
            Back to Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
