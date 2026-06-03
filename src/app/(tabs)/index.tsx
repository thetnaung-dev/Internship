import { supabase } from "@/lib/supabase";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MapPin, Search, Star } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  BackHandler,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// 💡 Details Component ကို ၎င်းတည်ရှိရာ လမ်းကြောင်းအတိုင်း မှန်ကန်စွာ Import ခေါ်ယူခြင်း
import Details from "../../components/features/property/details";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const isBurmese = i18n.language === "mm" || i18n.language?.startsWith("my");

  // ── STATES ──────────────────────────────────────────────────────
  const [properties, setProperties] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  // 💡 Component အဖြစ် ပြသရန် ရွေးချယ်လိုက်သော Property ID state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null,
  );

  const fetchActiveListings = async (category: string) => {
    try {
      setIsLoading(true);
      let query = supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (category === "for rent") {
        query = query.eq("deal_type", "rent");
      } else if (category === "for sale") {
        query = query.eq("deal_type", "sale");
      } else if (category !== "all") {
        query = query.eq("property_type", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      // အကယ်၍ Details Component ပွင့်နေရင် hardware back ကို အရင်ပိတ်ဖို့
      const onHardwareBackPress = () => {
        if (selectedPropertyId) {
          setSelectedPropertyId(null); // Details ကို အရင်ပိတ်မယ်
          return true;
        }
        return true; // Onboarding ပြန်မသွားအောင် တားဆီးရန်
      };

      fetchActiveListings(activeCategory);

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onHardwareBackPress,
      );
      return () => subscription.remove();
    }, [activeCategory, selectedPropertyId]),
  );

  const categories = [
    { id: "all", label: t("categories.all") },
    { id: "for rent", label: t("categories.for rent") },
    { id: "for sale", label: t("categories.for sale") },
    { id: "apartment", label: t("categories.apartment") },
    { id: "condo", label: t("categories.condo") },
    { id: "hostel", label: t("categories.hostel") },
  ];

  // ── 💡 IF SELECTED PROPERTY ID EXIST, SHOW DETAILS COMPONENT DIRECTLY ──
  if (selectedPropertyId) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <Details
          propertyId={selectedPropertyId}
          onBack={() => setSelectedPropertyId(null)} // ပြန်ပိတ်ပေးမည့် function
        />
      </SafeAreaView>
    );
  }

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

        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.push("/search")}
            className="w-11 h-11 bg-white items-center justify-center rounded-full border border-slate-200 active:opacity-75 shadow-sm shadow-slate-100"
          >
            <Search size={20} color="#0f172a" />
          </TouchableOpacity>

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
                  className={`mr-3 px-5 py-3 rounded-full ${isActive ? "bg-slate-900" : "bg-white border border-slate-100"}`}
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

          {isLoading && (
            <View className="py-10 items-center justify-center">
              <ActivityIndicator size="small" color="#10b981" />
            </View>
          )}

          {!isLoading && properties.length === 0 && (
            <View className="py-12 items-center bg-white rounded-3xl border border-slate-100 p-6">
              <Text className="text-slate-400 font-medium text-sm text-center">
                {isBurmese
                  ? "မရှိသေးပါ သို့မဟုတ် တင်ထားသော ကြော်ငြာမတွေ့ပါ။"
                  : "No active advertisements found."}
              </Text>
            </View>
          )}

          {!isLoading &&
            properties.map((item) => {
              const displayImage =
                item.images && item.images.length > 0
                  ? item.images[0]
                  : DEFAULT_IMAGE;
              const displayTitle =
                isBurmese && item.title_mm
                  ? item.title_mm
                  : item.title_en || item.title_mm;
              const displayPrice =
                item.currency_unit === "lakhs"
                  ? `${item.price} ${isBurmese ? "သိန်း" : "Lakhs"}`
                  : `$${item.price}`;

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() =>
                    router.push({
                      pathname: "./detail",
                      params: { id: item.id },
                    })
                  }
                  className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md shadow-slate-100 mb-6 active:opacity-95"
                >
                  <View className="relative h-56 w-full">
                    <Image
                      source={{ uri: displayImage }}
                      className="w-full h-full"
                    />
                    <View className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full">
                      <Text className="text-white text-xs font-bold uppercase tracking-wider">
                        {t(item.property_type || "premium")}
                      </Text>
                    </View>
                    <View className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl flex-row items-center gap-1">
                      <Star size={14} color="#f59e0b" fill="#f59e0b" />
                      <Text className="text-slate-900 text-xs font-bold">
                        {item.rating || "5.0"}
                      </Text>
                    </View>
                  </View>

                  <View className="p-5">
                    <View className="flex-row justify-between items-start mb-2">
                      <Text
                        className="text-lg font-bold text-slate-900 flex-1 mr-2"
                        numberOfLines={1}
                      >
                        {displayTitle}
                      </Text>
                      <Text className="text-lg font-black text-emerald-600">
                        {displayPrice}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <MapPin size={14} color="#94a3b8" />
                      <Text
                        className="text-slate-400 text-sm font-medium ml-1"
                        numberOfLines={1}
                      >
                        {item.search_value || "Yangon, Myanmar"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
