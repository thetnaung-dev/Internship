import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useRef, useState } from "react";
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

export default function OtpScreen() {
  const { t } = useTranslation();
  const { email: emailParam } = useLocalSearchParams<{ email: string }>();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputsRef = useRef<(TextInput | null)[]>([]);

  const handleVerify = async () => {
    const token = otp.join("");
    if (token.length !== 6) return;
    setLoading(true);
    setError("");

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: emailParam || "",
      token,
      type: "signup",
    });

    setLoading(false);
    if (verifyError) {
      setError(verifyError.message);
    } else {
      router.replace("/(tabs)");
    }
  };

  const handleResend = async () => {
    if (!emailParam) return;
    setLoading(true);
    await supabase.auth.resend({
      type: "signup",
      email: emailParam,
    });
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-100">
      <View className="px-4 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white border border-primary-200"
        >
          <ChevronLeft size={24} color="#22c55e" />
        </TouchableOpacity>
      </View>
      <ScrollView
        className="flex-1 px-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-10 mb-8">
          <Text className="text-3xl font-rubik-extrabold text-black-300">
            Verify OTP
          </Text>
          <Text className="text-black-100 font-rubik mt-2 text-sm">
            Enter the 6-digit code sent to your email.
          </Text>
        </View>

        <View className="flex-row justify-between mb-8">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputsRef.current[index] = ref; }}
              value={digit}
              onChangeText={(val) => {
                const newOtp = [...otp];
                newOtp[index] = val;
                setOtp(newOtp);
                if (val && index < 5) {
                  inputsRef.current[index + 1]?.focus();
                }
              }}
              keyboardType="number-pad"
              maxLength={1}
              className="w-12 h-14 bg-white border border-primary-200 rounded-xl text-center text-xl font-rubik-bold text-black-300"
            />
          ))}
        </View>

        {error ? (
          <Text className="text-red-500 text-sm text-center mb-4 font-rubik">{error}</Text>
        ) : null}

        <TouchableOpacity
          onPress={handleVerify}
          disabled={loading || otp.join("").length !== 6}
          className="bg-primary-300 py-4 rounded-xl items-center"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-rubik-bold">Verify</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleResend}
          disabled={loading}
          className="items-center mt-6"
        >
          <Text className="text-primary-300 font-rubik-bold">Resend Code</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
