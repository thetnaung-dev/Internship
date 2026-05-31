import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MapPin, Search, Star } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BackHandler,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PROPERTIES = [
  {
    id: "1",
    title: "The Glass Pavilion",
    location: "Bahan Township, Yangon",
    price: "$4,500/mo",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    tagKey: "premium",
  },
  {
    id: "2",
    title: "Modernist Oasis Vibe",
    location: "Yankin Township, Yangon",
    price: "$3,200/mo",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    tagKey: "trending",
  },
];

export default function HomeScreen() {
  // ✅ i18n object ကိုပါ destruct လုပ်ပြီး ယူထားပါတယ်
  const { t, i18n } = useTranslation();

  // ✅ useFocusEffect ကို HomeScreen component အတွင်း၌ စနစ်တကျ ရေးသားထားပါတယ်
  useFocusEffect(
    React.useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => true, // Onboarding သို့ ပြန်သွားခြင်းကို တားဆီးရန်
      );

      return () => subscription.remove();
    }, []),
  );

  const categories = [
    { id: "all", label: t("categories.all") },
    { id: "for rent", label: t("categories.for rent") },
    { id: "for sale", label: t("categories.for sale") },
    { id: "apartment", label: t("categories.apartment") },
    { id: "condo", label: t("categories.condo") },
    { id: "hostel", label: t("categories.hostel") },
  ];

  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="dark" />

      {/* HEADER SECTION */}
      <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-slate-400 text-xs uppercase tracking-widest font-bold">
            {t("location")}
          </Text>
          <View className="flex-row items-center mt-1">
            <MapPin size={16} color="#10b981" />
            <Text className="text-slate-900 font-bold text-lg ml-1">
              Yangon, MM
            </Text>
          </View>
        </View>

        {/* RIGHT SIDE HEADER ACTIONS */}
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.push("/search")}
            className="w-11 h-11 bg-white items-center justify-center rounded-full border border-slate-200 active:opacity-75 shadow-sm shadow-slate-100"
          >
            <Search size={20} color="#0f172a" />
          </TouchableOpacity>

          {/* ✅ Language Switcher Button (EN ⇄ MM ကို ချက်ချင်းပြောင်းပေးမည့် ခလုတ်) */}
          <TouchableOpacity
            onPress={() => {
              const nextLng = i18n.language === "en" ? "mm" : "en";
              i18n.changeLanguage(nextLng);
            }}
            className="w-11 h-11 bg-emerald-600 items-center justify-center rounded-full border border-emerald-500 active:opacity-80 shadow-sm shadow-emerald-100"
          >
            <Text className="text-white font-black text-xs uppercase tracking-wider">
              {i18n.language === "en" ? "MM" : "EN"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="mt-4">
        {/* HERO TITLE */}
        <View className="px-6 mb-5">
          <Text className="text-3xl font-black text-slate-900 tracking-tight leading-none">
            {t("findYourPerfect")}
          </Text>
          <Text className="text-3xl font-black text-emerald-600 tracking-tight mt-1">
            {t("dreamSpace")}
          </Text>
        </View>

        {/* HORIZONTAL CATEGORY PILLS */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setActiveCategory(cat.id)}
                  className={`mr-3 px-5 py-3 rounded-full ${
                    isActive
                      ? "bg-slate-900"
                      : "bg-white border border-slate-100"
                  }`}
                >
                  <Text
                    className={`font-semibold text-sm ${isActive ? "text-white" : "text-slate-500"}`}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* PROPERTY LISTINGS */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-slate-900">
              {t("featuredProperties")}
            </Text>
            <TouchableOpacity>
              <Text className="text-emerald-600 font-bold text-sm">
                {t("seeAll")}
              </Text>
            </TouchableOpacity>
          </View>

          {PROPERTIES.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md shadow-slate-100 mb-6 active:opacity-95"
            >
              <View className="relative h-56 w-full">
                <Image source={{ uri: item.image }} className="w-full h-full" />

                {/* Localized Badges */}
                <View className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <Text className="text-white text-xs font-bold uppercase tracking-wider">
                    {t(item.tagKey)}
                  </Text>
                </View>

                <View className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl flex-row items-center gap-1">
                  <Star size={14} color="#f59e0b" fill="#f59e0b" />
                  <Text className="text-slate-900 text-xs font-bold">
                    {item.rating}
                  </Text>
                </View>
              </View>

              <View className="p-5">
                <View className="flex-row justify-between items-start mb-2">
                  <Text
                    className="text-lg font-bold text-slate-900 flex-1 mr-2"
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text className="text-lg font-black text-emerald-600">
                    {item.price}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <MapPin size={14} color="#94a3b8" />
                  <Text
                    className="text-slate-400 text-sm font-medium ml-1"
                    numberOfLines={1}
                  >
                    {item.location}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
