import { router } from "expo-router";
import { ChevronLeft, ChevronRight, Bell, User } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeStore } from "@/shared/store/useThemeStore";

export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const rows = [
    { icon: <User size={20} color="#64748b" />, label: t("settings.account"), route: "/settings/account" },
    { icon: <Bell size={20} color="#64748b" />, label: t("settings.notifications"), route: "/settings/notifications" },
  ];

  const themeOptions = [
    { key: "light", label: t("settings.light") },
    { key: "dark", label: t("settings.dark") },
    { key: "system", label: t("settings.system") },
  ] as const;

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-black">
      <View className="bg-white dark:bg-black px-4 py-4 flex-row items-center border-b border-primary-200 dark:border-gray-800">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-primary-100">
          <ChevronLeft size={24} color="#22c55e" />
        </TouchableOpacity>
        <Text className="text-black-300 dark:text-gray-100 text-lg font-rubik-bold ml-2 flex-1 text-center mr-10">{t("settings.title")}</Text>
      </View>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Theme */}
        <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-gray-800 mt-6">
          <View className="px-5 py-4 border-b border-slate-100 dark:border-gray-800">
            <Text className="text-slate-700 dark:text-gray-300 font-semibold">{t("settings.appearance")}</Text>
          </View>
          <View className="flex-row px-5 py-3 gap-2">
            {themeOptions.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setTheme(opt.key)}
                className={`flex-1 py-3 rounded-xl items-center ${
                  theme === opt.key
                    ? "bg-primary-300"
                    : "bg-slate-100 dark:bg-gray-800"
                }`}
              >
                <Text
                  className={`text-sm font-semibold ${
                    theme === opt.key
                      ? "text-white"
                      : "text-slate-600 dark:text-gray-300"
                  }`}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Menu items */}
        <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-gray-800 mt-6">
          {rows.map((row, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(row.route as any)}
              className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-gray-800 active:bg-slate-50 dark:active:bg-gray-700"
            >
              <View className="flex-row items-center">
                <View className="w-9 h-9 bg-slate-50 dark:bg-gray-800 rounded-xl items-center justify-center mr-3">
                  {row.icon}
                </View>
                <Text className="text-slate-700 dark:text-gray-200 font-semibold">{row.label}</Text>
              </View>
              <ChevronRight size={18} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
