// src/features/home/components/HomeHeader.tsx
import { useLanguageStore } from "@/store/useLanguageStore";
import React from "react";
import { Text, View } from "react-native";
import LanguageToggle from "./LanguageToggle";

export default function HomeHeader() {
  // Binding the store listener directly to the header ensures
  // your greeting phrase updates instantly when the toggle is tapped.
  const locale = useLanguageStore((state) => state.locale);

  return (
    <View className="flex-row justify-between items-center w-full">
      <View>
        <Text className="text-gray-400 font-medium text-sm">
          {locale === "en" ? "Good Morning" : "မင်္ဂလာနံနက်ခင်းပါ"}
        </Text>
        <Text className="text-3xl font-bold text-gray-900 mt-0.5">
          Medicare
        </Text>
      </View>

      {/* Replace your old red placeholder with your clean switcher component */}
      <LanguageToggle />
    </View>
  );
}
