import { supabase } from "@/lib/supabase";
import { useThemeStore } from "@/store/useThemeStore";
import { router } from "expo-router";
import { ChevronLeft, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountSettingsScreen() {
  const { t } = useTranslation();
  const isDark = useThemeStore((s) => s.resolvedTheme) === "dark";
  const [profile, setProfile] = useState<any>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data || user);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-black">
      <View className="px-4 py-4 flex-row items-center bg-white dark:bg-gray-900 border-b border-slate-100 dark:border-gray-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-primary-100 dark:bg-gray-800"
        >
          <ChevronLeft size={24} color="#22c55e" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800 dark:text-gray-100 ml-4">Account</Text>
      </View>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color="#22c55e" className="mt-20" />
        ) : (
          <View className="items-center mt-10">
            <View className="w-20 h-20 bg-primary-100 dark:bg-gray-800 rounded-full items-center justify-center overflow-hidden">
              {profile?.avatar_url && !avatarError ? (
                <Image source={{ uri: profile.avatar_url }} className="w-full h-full" resizeMode="cover" onError={() => setAvatarError(true)} />
              ) : (
                <User size={40} color="#22c55e" />
              )}
            </View>
            <Text className="text-lg font-bold text-slate-800 dark:text-gray-100 mt-4">
              {profile?.full_name || (profile?.email?.split("@")[0] || "User")}
            </Text>
            <Text className="text-slate-400 dark:text-gray-400">{profile?.email || ""}</Text>
            <Text className="text-slate-400 dark:text-gray-500 text-sm mt-1">{profile?.phone || ""}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
