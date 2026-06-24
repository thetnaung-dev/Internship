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
  Globe,
  Home,
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
      <View className="flex-1 justify-center items-center bg-primary-100">
        <ActivityIndicator size="large" className="text-primary-300" />
      </View>
    );

  return (
    <SafeAreaView className="flex-1 bg-primary-100">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="bg-primary-300 pt-8 pb-14 px-6 items-center rounded-b-[40px]">
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center border-4 border-primary-200 overflow-hidden">
            {profile?.avatar_url && !avatarError ? (
              <Image
                source={{ uri: profile.avatar_url }}
                className="w-full h-full"
                resizeMode="cover"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <User size={50} color="#ffffff" />
            )}
          </View>
          <Text className="text-white text-2xl font-rubik-extrabold mt-4">
            {profile?.full_name || t("profile.user")}
          </Text>
        </View>

        <View className="mx-6 -mt-10 bg-white rounded-2xl p-5 flex-row shadow-lg shadow-black-100/10 border border-primary-200">
          <View className="flex-1 items-center border-r border-primary-200">
            <Text className="text-2xl font-rubik-black text-black-300">
              {postCount}
            </Text>
            <Text className="text-black-100 text-xs font-rubik mt-1">
              {t("profile.totalPosts")}
            </Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-2xl font-rubik-extrabold text-primary-300">
              {t("profile.active")}
            </Text>
            <Text className="text-black-100 text-xs font-rubik mt-1">
              {t("profile.accountStatus")}
            </Text>
          </View>
        </View>

        <View className="mt-8 px-6">
          <Text className="text-black-100 text-xs font-rubik-bold mb-3 uppercase">
            {t("profile.settings")}
          </Text>
          <View className="bg-white rounded-2xl overflow-hidden border border-primary-200">
            <MenuRow
              icon={<User size={20} color="#666876" />}
              title={t("profile.profileSettings")}
              onPress={() => router.push("/edit-profile")}
            />
            <MenuRow
              icon={<Home size={20} color="#666876" />}
              title={t("profile.myListings") || "My Listings"}
              onPress={() => router.push("/my-listings")}
            />
            <MenuRow
              icon={<MapPin size={20} color="#666876" />}
              title={t("profile.savedProperties")}
              onPress={() => router.push("/saved-properties")}
            />
            <MenuRow
              icon={<Shield size={20} color="#666876" />}
              title={t("profile.security")}
              onPress={() => {}}
            />
            <MenuRow
              icon={<Globe size={20} color="#666876" />}
              title={t("profile.language") || "Language"}
              onPress={() => router.push("/settings/language")}
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowLogoutDialog(true)}
            className="mt-6 bg-red-50 border border-red-100 py-4 rounded-2xl flex-row justify-center items-center active:opacity-80"
          >
            <LogOut size={20} color="#F75555" />
            <Text className="text-red-500 font-rubik-bold ml-2">
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
      className="flex-row items-center justify-between px-5 py-4 border-b border-primary-200 active:bg-primary-100"
    >
      <View className="flex-row items-center">
        <View className="w-9 h-9 bg-primary-100 rounded-xl items-center justify-center mr-3">
          {icon}
        </View>
        <Text className="text-black-200 font-rubik-semibold">{title}</Text>
      </View>
      <ChevronRight size={18} color="#bbf7d0" />
    </TouchableOpacity>
  );
}
