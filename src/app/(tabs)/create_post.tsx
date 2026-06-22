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
  const [loginDialog, setLoginDialog] = useState(false);

  const categoryTitles: Record<string, string> = {
    sale: t("createPost.saleTitle"),
    rent: t("createPost.rentTitle"),
    hostel: t("createPost.hostelTitle"),
    want_to_buy: t("createPost.wantToBuyTitle"),
    want_to_rent: t("createPost.wantToRentTitle"),
  };

  const handleCategorySelect = async (category: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoginDialog(true);
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
    <SafeAreaView className="flex-1 bg-primary-100">
      <StatusBar style="dark" />
      <View className="bg-white px-4 py-4 flex-row items-center border-b border-primary-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-primary-100"
        >
          <ChevronLeft size={28} color="#22c55e" />
        </TouchableOpacity>
        <Text className="text-black-300 text-lg font-rubik-bold ml-2 flex-1 text-center mr-10">
          {t("createPost.selectCategory")}
        </Text>
      </View>

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap justify-between">
          <CategoryCard
            title={t("createPost.sale")}
            icon={<Home size={28} color="#22c55e" />}
            onPress={() => handleCategorySelect("sale")}
          />
          <CategoryCard
            title={t("createPost.rent")}
            icon={<Key size={28} color="#22c55e" />}
            onPress={() => handleCategorySelect("rent")}
          />
          <CategoryCard
            title={t("createPost.hostel")}
            icon={<Building2 size={28} color="#22c55e" />}
            onPress={() => handleCategorySelect("hostel")}
          />
          <CategoryCard
            title={t("createPost.wantToBuy")}
            icon={<ShoppingCart size={28} color="#22c55e" />}
            onPress={() => handleCategorySelect("want_to_buy")}
          />
          <CategoryCard
            title={t("createPost.wantToRent")}
            icon={<DollarSign size={28} color="#22c55e" />}
            onPress={() => handleCategorySelect("want_to_rent")}
          />
        </View>
      </ScrollView>

      <AlertDialog isOpen={loginDialog} onClose={() => setLoginDialog(false)}>
        <AlertDialogBackdrop />
        <AlertDialogContent className="p-6 rounded-3xl bg-white items-center">
          <AlertDialogHeader>
            <Heading className="text-black-300 font-rubik-bold text-lg">
              {t("createPost.loginRequiredTitle")}
            </Heading>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text className="text-center text-black-200 font-rubik">
              {t("createPost.loginRequiredMessage")}
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter className="w-full">
            <View className="flex-row gap-3 w-full">
              <Button
                className="flex-1 bg-primary-200"
                onPress={() => setLoginDialog(false)}
              >
                <ButtonText className="text-black-300">
                  {t("createPost.cancel")}
                </ButtonText>
              </Button>
              <Button
                className="flex-1 bg-primary-300"
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
      className="w-[48%] bg-white p-6 rounded-2xl items-center border border-primary-200 mb-4"
    >
      <View className="w-14 h-14 bg-primary-100 rounded-full items-center justify-center mb-3">
        {icon}
      </View>
      <Text className="text-center font-rubik-bold text-black-200">{title}</Text>
    </TouchableOpacity>
  );
}
