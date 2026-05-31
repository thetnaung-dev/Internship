import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ✅ Import Paths များကို ပိုမိုရှင်းလင်းအောင် ပြင်ဆင်ထားပါတယ်
import AdsSearchForm from "@/components/features/search/searchadsscreen";
import PropertySearchForm from "@/components/features/search/searchpropertyscreen";

const SCREEN_PADDING = 24;
const TRACK_PADDING = 4;
const SEGMENT_WIDTH =
  (Dimensions.get("window").width - SCREEN_PADDING * 2 - TRACK_PADDING * 2) / 2;

export default function SearchScreen() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("properties");
  const slideValue = useRef(new Animated.Value(0)).current;

  const searchcategories = [
    { id: "properties", label: t("searchcategories.search properties") },
    { id: "ads", label: t("searchcategories.search by ads number") },
  ];

  const handleToggle = (id: string, index: number) => {
    setActiveCategory(id);
    Animated.timing(slideValue, {
      toValue: index * SEGMENT_WIDTH,
      duration: 230,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="dark" />
      <View className="bg-slate-950 px-4 py-4 flex-row items-center shadow-sm">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full"
        >
          <ChevronLeft size={28} color="#ffffff" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold ml-2 flex-1 text-center mr-10">
          {t("findyourDreamProperty", {
            defaultValue: "သင့်အိမ်မက်ကို ရှာဖွေပါ",
          })}
        </Text>
      </View>
      {/* FIXED SLIDING CONTROLLER HEADERS */}
      <View className="bg-white border-b border-slate-100 pt-2 shadow-sm shadow-slate-100">
        <View className="px-6 mb-4">
          <View className="flex-row w-full bg-slate-100 p-1 rounded-full relative">
            <Animated.View
              style={{
                width: SEGMENT_WIDTH,
                transform: [{ translateX: slideValue }],
              }}
              className="absolute top-1 bottom-1 left-1 bg-white rounded-full shadow-sm"
            />

            {searchcategories.map((cat, index) => {
              const isActive = activeCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => handleToggle(cat.id, index)}
                  activeOpacity={0.8}
                  className="flex-1 py-3 rounded-full items-center justify-center z-10"
                >
                  <Text
                    className={`font-bold text-sm text-center duration-150 ${
                      isActive ? "text-slate-900" : "text-slate-500"
                    }`}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* DYNAMIC FORM INJECTION CONTAINER */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        className="flex-1 mt-4"
      >
        <View className="px-6">
          {activeCategory === "properties" ? (
            <PropertySearchForm />
          ) : (
            <AdsSearchForm />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
