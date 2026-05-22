import { useLanguageStore } from "@/store/useLanguageStore";
import React from "react";
import { Text, View } from "react-native";

import LanguageToggle from "./LanguageToggle";

export default function HomeHeader() {
  const locale = useLanguageStore((state) => state.locale);

  const hour = new Date().getHours();

  const getGreeting = () => {
    if (locale === "en") {
      if (hour < 12) return "Good Morning";
      if (hour < 17) return "Good Afternoon";
      return "Good Evening";
    }

    // Myanmar
    if (hour < 12) return "မင်္ဂလာနံနက်ခင်းပါ";
    if (hour < 17) return "မင်္ဂလာနေ့လယ်ခင်းပါ";
    return "မင်္ဂလာညနေခင်းပါ";
  };

  return (
    <View className="flex-row justify-between items-center w-full">
      <View>
        <Text className="text-gray-400 font-medium text-sm">
          {getGreeting()}
        </Text>

        <Text className="text-3xl font-bold text-gray-900 mt-0.5">
          Medicare
        </Text>
      </View>

      <LanguageToggle />
    </View>
  );
}
