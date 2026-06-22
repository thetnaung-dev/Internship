import { router } from "expo-router";
import { Check, ChevronLeft } from "lucide-react-native";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguageStore } from "@/store/useLanguageStore";

export default function LanguageSettingsScreen() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const languages = [
    { code: "en", label: "English" },
    { code: "mm", label: "မြန်မာ" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-primary-100">
      <View className="px-4 py-4 flex-row items-center bg-white border-b border-primary-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-primary-100"
        >
          <ChevronLeft size={24} color="#666876" />
        </TouchableOpacity>
        <Text className="text-lg font-rubik-bold text-black-300 ml-4">Language</Text>
      </View>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl overflow-hidden border border-primary-200 mt-6">
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => setLanguage(lang.code as "en" | "mm")}
              className="flex-row items-center justify-between px-5 py-4 border-b border-primary-200 active:bg-primary-100"
            >
              <Text className="text-black-200 font-rubik-semibold">{lang.label}</Text>
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
