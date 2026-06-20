import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function OnboardingScreen() {
  const { t } = useTranslation();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-white">
        <StatusBar style="light" />

        {/* Structural Hero Banner Section */}
        <View className="flex-[6] bg-slate-900 justify-end px-6 pb-16">
          <View className="bg-amber-500 self-start px-3 py-1 rounded-full mb-4">
            <Text className="text-xs font-bold text-slate-900 uppercase tracking-widest">
              Premium
            </Text>
          </View>

          <Text className="text-white text-4xl font-black tracking-tight mb-4">
            {t("findDreamHome")}
          </Text>

          <Text className="text-slate-300 text-base leading-6 font-medium">
            {t("onboardingSubtitle")}
          </Text>
        </View>

        {/* Bottom Functional Interaction Wrapper */}
        <View className="flex-[3] justify-center px-6 bg-slate-50">
          <TouchableOpacity
            // Fixed relative navigation path error to absolute format
            onPress={() => router.replace("/(tabs)")}
            className="w-full bg-slate-900 py-5 rounded-2xl active:opacity-90 shadow-lg"
          >
            <Text className="text-center text-white text-lg font-bold">
              {t("getStarted")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
