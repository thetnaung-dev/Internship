import { router } from "expo-router";
import { ChevronRight, Globe, Lock, Bell, User, Shield } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const { t } = useTranslation();

  const rows = [
    { icon: <User size={20} color="#64748b" />, label: "Account", route: "/settings/account" },
    { icon: <Globe size={20} color="#64748b" />, label: "Language", route: "/settings/language" },
    { icon: <Bell size={20} color="#64748b" />, label: "Notifications", route: "/settings/notifications" },
    { icon: <Lock size={20} color="#64748b" />, label: "Privacy", route: "/settings/privacy" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 py-4 border-b border-slate-100 bg-white">
        <Text className="text-xl font-bold text-slate-800 text-center">Settings</Text>
      </View>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl overflow-hidden border border-slate-100 mt-6">
          {rows.map((row, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(row.route as any)}
              className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100 active:bg-slate-50"
            >
              <View className="flex-row items-center">
                <View className="w-9 h-9 bg-slate-50 rounded-xl items-center justify-center mr-3">
                  {row.icon}
                </View>
                <Text className="text-slate-700 font-semibold">{row.label}</Text>
              </View>
              <ChevronRight size={18} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
