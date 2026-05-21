import { useLanguageStore } from "@/store/useLanguageStore";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function LanguageToggle() {
  const { locale, toggleLanguage } = useLanguageStore();

  return (
    <TouchableOpacity
      onPress={toggleLanguage}
      activeOpacity={0.7}
      className="flex-row items-center bg-gray-100 p-1 rounded-full border border-gray-200 shadow-sm"
    >
      {/* English Segment */}
      <View
        className={`px-3 py-1 rounded-full ${locale === "en" ? "bg-blue-600" : "bg-transparent"}`}
      >
        <Text
          className={`text-xs font-bold ${locale === "en" ? "text-white" : "text-gray-500"}`}
        >
          EN
        </Text>
      </View>

      {/* Myanmar Segment */}
      <View
        className={`px-3 py-1 rounded-full ${locale === "my" ? "bg-blue-600" : "bg-transparent"}`}
      >
        <Text
          className={`text-xs font-bold ${locale === "my" ? "text-white" : "text-gray-500"}`}
        >
          မြန်
        </Text>
      </View>
    </TouchableOpacity>
  );
}
