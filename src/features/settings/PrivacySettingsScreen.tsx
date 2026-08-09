import { router } from "expo-router";
import { ChevronLeft, Eye, Lock, Shield, UserX } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PrivacySettingsScreen() {
  const { t } = useTranslation();
  const [showOnline, setShowOnline] = useState(true);
  const [showPhone, setShowPhone] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);

  const items = [
    { icon: <Eye size={20} color="#22c55e" />, label: t("settings.showOnlineStatus"), value: showOnline, set: setShowOnline },
    { icon: <Shield size={20} color="#22c55e" />, label: t("settings.showPhoneNumber"), value: showPhone, set: setShowPhone },
    { icon: <UserX size={20} color="#22c55e" />, label: t("settings.privateProfile"), value: !profilePublic, set: (v: boolean) => setProfilePublic(!v) },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-black">
      <View className="px-4 py-4 flex-row items-center bg-white dark:bg-gray-900 border-b border-slate-100 dark:border-gray-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-primary-100 dark:bg-gray-800"
        >
          <ChevronLeft size={24} color="#22c55e" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800 dark:text-gray-100 ml-4">{t("settings.privacySecurity")}</Text>
      </View>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-gray-800 mt-6">
          <View className="px-5 py-3 border-b border-slate-100 dark:border-gray-800">
            <Text className="text-slate-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">{t("settings.privacyControls")}</Text>
          </View>
          {items.map((item, i) => (
            <View
              key={i}
              className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-gray-800 last:border-b-0"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-9 h-9 bg-primary-100 dark:bg-gray-800 rounded-xl items-center justify-center">
                  {item.icon}
                </View>
                <Text className="text-slate-700 dark:text-gray-200 font-semibold">{item.label}</Text>
              </View>
              <Switch value={item.value} onValueChange={item.set} trackColor={{ false: "#d1d5db", true: "#22c55e" }} thumbColor="#fff" />
            </View>
          ))}
        </View>

        <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-gray-800 mt-6">
          <View className="px-5 py-3 border-b border-slate-100 dark:border-gray-800">
            <Text className="text-slate-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">{t("settings.security")}</Text>
          </View>
          <TouchableOpacity className="flex-row items-center gap-3 px-5 py-4 active:bg-slate-50 dark:active:bg-gray-700">
            <View className="w-9 h-9 bg-primary-100 dark:bg-gray-800 rounded-xl items-center justify-center">
              <Lock size={20} color="#22c55e" />
            </View>
            <Text className="text-slate-700 dark:text-gray-200 font-semibold">{t("settings.changePassword")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
