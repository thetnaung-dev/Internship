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
import { router } from "expo-router";
import {
  ChevronRight,
  Globe,
  Home,
  LogOut,
  MapPin,
  Settings,
  User,
} from "lucide-react-native";
import { useLanguageStore } from "@/store/useLanguageStore";
import React, { Component, useEffect, useState } from "react";
import {
  ActivityIndicator,
  DeviceEventEmitter,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

class NavBoundary extends Component<{ children: React.ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError(e: Error) {
    if (e.message?.includes("navigation context") || e.message?.includes("NavigationContainer")) {
      return { error: true };
    }
    throw e;
  }
  componentDidCatch() {
    setTimeout(() => this.setState({ error: false }), 32);
  }
  render() {
    if (this.state.error) return <View className="flex-1 bg-primary-100" />;
    return this.props.children;
  }
}

function ProfileContent() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const { t, i18n } = useTranslation();
  const isBurmese = i18n.language === "mm" || i18n.language?.startsWith("my");

  useEffect(() => {
    fetchProfile();
    const sub = DeviceEventEmitter.addListener("profileUpdated", fetchProfile);
    return () => sub.remove();
  }, []);

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
    setProfile(profileData);
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error during complete logout:", error);
    } finally {
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
    <SafeAreaView className="flex-1 bg-green-50 dark:bg-black">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="bg-primary-300 dark:bg-gray-900 pt-8 pb-14 px-6 items-center rounded-b-[40px]">
          <TouchableOpacity
            onPress={() => setShowLogoutDialog(true)}
            className="absolute top-4 right-6 w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <LogOut size={20} color="#ffffff" />
          </TouchableOpacity>
          <View className="w-24 h-24 bg-white dark:bg-gray-800 rounded-full items-center justify-center border-4 border-primary-200 dark:border-gray-700 overflow-hidden">
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

        <View className="mt-8 px-6">
          <Text className="text-black-100 dark:text-gray-400 text-xs font-rubik-bold mb-3 uppercase">
            {t("profile.settings")}
          </Text>
          <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-primary-200 dark:border-gray-800">
            <MenuRow
              icon={<Home size={20} color="#666876" />}
              title={t("profile.myListings")}
              onPress={() => router.push("/my-listings")}
            />
            <MenuRow
              icon={<MapPin size={20} color="#666876" />}
              title={t("profile.savedProperties")}
              onPress={() => router.push("/saved-properties")}
            />
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-primary-200 dark:border-gray-800">
              <View className="flex-row items-center">
                <View className="w-9 h-9 bg-primary-100 dark:bg-gray-800 rounded-xl items-center justify-center mr-3">
                  <Globe size={20} color="#666876" />
                </View>
                <Text className="text-black-200 dark:text-gray-300 font-rubik-semibold">
                  {t("profile.language")}
                </Text>
              </View>
              <View className="bg-primary-100 dark:bg-gray-800 rounded-full flex-row p-0.5">
                <TouchableOpacity
                  onPress={() => { useLanguageStore.getState().setLanguage("en"); }}
                  className={`px-3.5 py-1.5 rounded-full ${!isBurmese ? "bg-white dark:bg-gray-900 shadow-sm" : ""}`}
                >
                  <Text
                    className={`text-xs font-rubik-bold ${!isBurmese ? "text-primary-300" : "text-black-100 dark:text-gray-400"}`}
                  >
                    EN
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { useLanguageStore.getState().setLanguage("mm"); }}
                  className={`px-3.5 py-1.5 rounded-full ${isBurmese ? "bg-white dark:bg-gray-900 shadow-sm" : ""}`}
                >
                  <Text
                    className={`text-xs font-rubik-bold ${isBurmese ? "text-primary-300" : "text-black-100 dark:text-gray-400"}`}
                  >
                    MM
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <MenuRow
              icon={<Settings size={20} color="#666876" />}
              title={t("profile.settings")}
              onPress={() => router.push("/settings")}
            />
          </View>
        </View>
      </ScrollView>

      <AlertDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      >
        <AlertDialogBackdrop />
        <AlertDialogContent className="p-6 rounded-3xl bg-white dark:bg-gray-900 items-center">
          <AlertDialogHeader>
            <Heading className="text-black-300 dark:text-gray-100">{t("profile.logoutTitle")}</Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text className="text-center text-black-200 dark:text-gray-300">
              {t("profile.logoutConfirm")}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter className="w-full">
            <Button
              onPress={() => setShowLogoutDialog(false)}
              className="flex-1 mr-2"
            >
              <ButtonText>{t("profile.cancel")}</ButtonText>
            </Button>
            <Button onPress={handleLogout} className="bg-red-500 flex-1">
              <ButtonText>{t("profile.logout")}</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
}

export default function ProfileScreen() {
  return (
    <NavBoundary>
      <ProfileContent />
    </NavBoundary>
  );
}

function MenuRow({ icon, title, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between px-5 py-4 border-b border-primary-200 dark:border-gray-800 active:bg-primary-100 dark:active:bg-gray-700"
    >
      <View className="flex-row items-center">
        <View className="w-9 h-9 bg-primary-100 dark:bg-gray-800 rounded-xl items-center justify-center mr-3">
          {icon}
        </View>
        <Text className="text-black-200 dark:text-gray-300 font-rubik-semibold">{title}</Text>
      </View>
      <ChevronRight size={18} color="#bbf7d0" />
    </TouchableOpacity>
  );
}
