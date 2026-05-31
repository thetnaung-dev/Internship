import CreatePostForm from "@/components/features/form/createpostform";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Building2,
  ChevronLeft,
  DollarSign,
  Home,
  Key,
  ShoppingCart,
} from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ✅ GLUESTACK ALERT DIALOG */
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

export default function CreatePostScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { t } = useTranslation();

  /* ✅ dialog state */
  const [loginDialog, setLoginDialog] = useState(false);

  const categoryTitles: Record<string, string> = {
    sale: t("createPost.saleTitle"),
    rent: t("createPost.rentTitle"),
    hostel: t("createPost.hostelTitle"),
    want_to_buy: t("createPost.wantToBuyTitle"),
    want_to_rent: t("createPost.wantToRentTitle"),
  };

  // ── AUTH CHECK ─────────────────────────────
  const handleCategorySelect = async (category: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setLoginDialog(true); // ✅ show dialog instead of Alert.alert
        return;
      }

      setSelectedCategory(category);
    } catch (error) {
      console.error("Auth check error:", error);
      setSelectedCategory(category);
    }
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  if (selectedCategory) {
    return (
      <CreatePostForm
        dealType={selectedCategory}
        dealTitle={categoryTitles[selectedCategory]}
        onBack={handleBack}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="dark" />

      {/* HEADER (UNCHANGED UI) */}
      <View className="bg-amber-500 px-4 py-4 flex-row items-center shadow-sm">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-50"
        >
          <ChevronLeft size={28} color="#334155" />
        </TouchableOpacity>

        <Text className="text-slate-800 text-lg font-bold ml-2 flex-1 text-center mr-10">
          {t("createPost.selectCategory")}
        </Text>
      </View>

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap justify-between">
          <CategoryCard
            title={t("createPost.sale")}
            icon={<Home size={28} color="#f59e0b" />}
            onPress={() => handleCategorySelect("sale")}
          />

          <CategoryCard
            title={t("createPost.rent")}
            icon={<Key size={28} color="#f59e0b" />}
            onPress={() => handleCategorySelect("rent")}
          />

          <CategoryCard
            title={t("createPost.hostel")}
            icon={<Building2 size={28} color="#f59e0b" />}
            onPress={() => handleCategorySelect("hostel")}
          />

          <CategoryCard
            title={t("createPost.wantToBuy")}
            icon={<ShoppingCart size={28} color="#f59e0b" />}
            onPress={() => handleCategorySelect("want_to_buy")}
          />

          <CategoryCard
            title={t("createPost.wantToRent")}
            icon={<DollarSign size={28} color="#f59e0b" />}
            onPress={() => handleCategorySelect("want_to_rent")}
          />
        </View>
      </ScrollView>

      {/* ✅ GLUESTACK LOGIN REQUIRED DIALOG */}
      <AlertDialog isOpen={loginDialog} onClose={() => setLoginDialog(false)}>
        <AlertDialogBackdrop />

        <AlertDialogContent className="p-6 rounded-3xl bg-white items-center">
          <AlertDialogHeader>
            <Heading className="text-slate-800 font-bold text-lg">
              {t("createPost.loginRequiredTitle")}
            </Heading>
          </AlertDialogHeader>

          <AlertDialogBody>
            <Text className="text-center text-slate-500">
              {t("createPost.loginRequiredMessage")}
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter className="w-full">
            <View className="flex-row gap-3 w-full">
              <Button
                className="flex-1 bg-slate-200"
                onPress={() => setLoginDialog(false)}
              >
                <ButtonText className="text-slate-700">
                  {t("createPost.cancel")}
                </ButtonText>
              </Button>

              <Button
                className="flex-1 bg-amber-500"
                onPress={() => {
                  setLoginDialog(false);
                  router.push("/(auth)/login");
                }}
              >
                <ButtonText className="text-white">
                  {t("createPost.login")}
                </ButtonText>
              </Button>
            </View>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SafeAreaView>
  );
}

/* CATEGORY CARD (UNCHANGED UI) */
function CategoryCard({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-[48%] bg-white p-6 rounded-2xl items-center border border-slate-100 shadow-sm mb-4"
    >
      <View className="w-14 h-14 bg-amber-50 rounded-full items-center justify-center mb-3">
        {icon}
      </View>

      <Text className="text-center font-bold text-slate-700">{title}</Text>
    </TouchableOpacity>
  );
}
