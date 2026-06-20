import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
} from "@/components/features/ui/alertdialog/alertdialog";
import { Button, ButtonText } from "@/components/features/ui/button/button";
import { Heading } from "@/components/features/ui/heading/heading";
import { supabase } from "@/lib/supabase";
import { router, useFocusEffect } from "expo-router";
import {
  ChevronRight,
  LogOut,
  MapPin,
  Shield,
  User,
} from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [postCount, setPostCount] = useState(0);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, []),
  );

  const fetchProfile = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/(auth)/login");
      return;
    }
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, email, avatar_url")
      .eq("id", user.id)
      .single();
    const { count } = await supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    setProfile(profileData);
    setAvatarError(false);
    setPostCount(count || 0);
    setLoading(false);
  };

  // 🛠️ ပြင်ဆင်ထားသော Logout Function
  const handleLogout = async () => {
    try {
      // ၁။ Supabase အကောင့်မှ ထွက်ခြင်း
      await supabase.auth.signOut();


    } catch (error) {
      console.error("Error during complete logout:", error);
    } finally {
      // ၃။ UI Dialog ကို ပိတ်ပြီး Login ဝင်သည့် Page သို့ မောင်းထုတ်ခြင်း
      setShowLogoutDialog(false);
      router.replace({
        pathname: "/(auth)/login",
        params: { logout: "success" },
      });
    }
  };

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="bg-amber-500 pt-8 pb-14 px-6 items-center rounded-b-[40px]">
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center border-4 border-amber-300 overflow-hidden">
            {profile?.avatar_url && !avatarError ? (
              <Image
                source={{ uri: profile.avatar_url }}
                className="w-full h-full"
                resizeMode="cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <User size={50} color="#f59e0b" />
            )}
          </View>
          <Text className="text-white text-2xl font-extrabold mt-4">
            {profile?.full_name || t("profile.user")}
          </Text>
        </View>

        <View className="mx-6 -mt-10 bg-white rounded-2xl p-5 flex-row shadow-sm border border-slate-100">
          <View className="flex-1 items-center border-r border-slate-100">
            <Text className="text-2xl font-black text-slate-800">
              {postCount}
            </Text>
            <Text className="text-slate-400 text-xs mt-1">
              {t("profile.totalPosts")}
            </Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-black text-emerald-500">
              {t("profile.active")}
            </Text>
            <Text className="text-slate-400 text-xs mt-1">
              {t("profile.accountStatus")}
            </Text>
          </View>
        </View>

        <View className="mt-8 px-6">
          <Text className="text-slate-500 text-xs font-bold mb-3 uppercase">
            {t("profile.settings")}
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden border border-slate-100">
            <MenuRow
              icon={<User size={20} color="#64748b" />}
              title={t("profile.profileSettings")}
              onPress={() => router.push("/edit-profile")}
            />
            <MenuRow
              icon={<MapPin size={20} color="#64748b" />}
              title={t("profile.savedProperties")}
              onPress={() => router.push("/(tabs)")}
            />
            <MenuRow
              icon={<Shield size={20} color="#64748b" />}
              title={t("profile.security")}
              onPress={() => {}}
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowLogoutDialog(true)}
            className="mt-6 bg-red-50 border border-red-100 py-4 rounded-2xl flex-row justify-center items-center active:opacity-80"
          >
            <LogOut size={20} color="#ef4444" />
            <Text className="text-red-500 font-bold ml-2">
              {t("profile.logout")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AlertDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent className="p-6 rounded-3xl bg-white items-center">
          <AlertDialogHeader>
            <Heading>Logout</Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text className="text-center">
              Are you sure you want to log out?
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter className="w-full">
            <Button
              onPress={() => setShowLogoutDialog(false)}
              className="flex-1 mr-2"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button onPress={handleLogout} className="bg-red-500 flex-1">
              <ButtonText>Logout</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
}

function MenuRow({ icon, title, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100 active:bg-slate-50"
    >
      <View className="flex-row items-center">
        <View className="w-9 h-9 bg-slate-50 rounded-xl items-center justify-center mr-3">
          {icon}
        </View>
        <Text className="text-slate-700 font-semibold">{title}</Text>
      </View>
      <ChevronRight size={18} color="#cbd5e1" />
    </TouchableOpacity>
  );
}
