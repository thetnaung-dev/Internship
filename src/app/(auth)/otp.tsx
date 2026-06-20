import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OtpScreen() {
  const { t } = useTranslation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleVerify = () => {
    router.replace("/(tabs)");
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
        <View className="mt-10 mb-8">
          <Text className="text-3xl font-extrabold text-slate-800">
            Verify OTP
          </Text>
          <Text className="text-slate-500 mt-2 text-sm">
            Enter the 6-digit code sent to your email.
          </Text>
        </View>

        <View className="flex-row justify-between mb-8">
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              value={digit}
              onChangeText={(val) => {
                const newOtp = [...otp];
                newOtp[index] = val;
                setOtp(newOtp);
                if (val && index < 5) {
                  // Auto-focus next input
                }
              }}
              keyboardType="number-pad"
              maxLength={1}
              className="w-12 h-14 bg-white border border-slate-200 rounded-xl text-center text-xl font-bold text-slate-800"
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleVerify}
          className="bg-amber-500 py-4 rounded-xl items-center"
        >
          <Text className="text-white font-bold">Verify</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center mt-6">
          <Text className="text-amber-500 font-bold">Resend Code</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
