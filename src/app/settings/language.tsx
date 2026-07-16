import { useThemeStore } from "@/store/useThemeStore";
import { router } from "expo-router";
import { Check, ChevronLeft } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguageStore } from "@/store/useLanguageStore";

export default function LanguageSettingsScreen() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const isDark = useThemeStore((s) => s.resolvedTheme) === "dark";

  const languages = [
    { code: "en", label: "English" },
    { code: "mm", label: "မြန်မာ" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-primary-100 dark:bg-black">
      <View className="px-4 py-4 flex-row items-center bg-white dark:bg-gray-900 border-b border-primary-200 dark:border-gray-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-primary-100 dark:bg-gray-800"
        >
          <ChevronLeft size={24} color="#22c55e" />
        </TouchableOpacity>
        <Text className="text-lg font-rubik-bold text-black-300 dark:text-gray-100 ml-4">Language</Text>
      </View>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-primary-200 dark:border-gray-800 mt-6">
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => setLanguage(lang.code as "en" | "mm")}
              className="flex-row items-center justify-between px-5 py-4 border-b border-primary-200 dark:border-gray-800 active:bg-primary-100 dark:active:bg-gray-700"
            >
              <Text className="text-black-200 dark:text-gray-300 font-rubik-semibold">{lang.label}</Text>
              {language === lang.code && (
                <Check size={20} color="#22c55e" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
