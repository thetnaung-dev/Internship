import { router } from "expo-router";
import { Check, ChevronLeft } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LanguageSettingsScreen() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  const languages = [
    { code: "en", label: "English" },
    { code: "mm", label: "မြန်မာ" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 py-4 flex-row items-center bg-white border-b border-slate-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-100"
        >
          <ChevronLeft size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800 ml-4">Language</Text>
      </View>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl overflow-hidden border border-slate-100 mt-6">
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => i18n.changeLanguage(lang.code)}
              className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100 active:bg-slate-50"
            >
              <Text className="text-slate-700 font-semibold">{lang.label}</Text>
              {currentLang === lang.code && (
                <Check size={20} color="#f59e0b" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
