import { router } from "expo-router";
import { ChevronLeft, User } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountSettingsScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 py-4 flex-row items-center bg-white border-b border-slate-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-100"
        >
          <ChevronLeft size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800 ml-4">Account</Text>
      </View>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="items-center mt-10">
          <View className="w-20 h-20 bg-amber-100 rounded-full items-center justify-center">
            <User size={40} color="#f59e0b" />
          </View>
          <Text className="text-lg font-bold text-slate-800 mt-4">John Doe</Text>
          <Text className="text-slate-400">john@example.com</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
