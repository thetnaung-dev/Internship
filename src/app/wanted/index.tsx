import { supabase } from "@/lib/supabase";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, Plus } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlashList } from "@shopify/flash-list";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useThemeStore } from "@/store/useThemeStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function WantedListingsScreen() {
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const isDark = resolvedTheme === "dark";
  const { t, i18n } = useTranslation();
  const isBurmese = i18n.language === "mm" || i18n.language?.startsWith("my");

  const [buyListings, setBuyListings] = useState<any[]>([]);
  const [rentListings, setRentListings] = useState<any[]>([]);
  const [buyLoading, setBuyLoading] = useState(true);
  const [rentLoading, setRentLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"buy" | "rent">("buy");

  const translateX = useRef(new Animated.Value(0)).current;
  const tabRef = useRef(activeTab);
  tabRef.current = activeTab;

  const fetchBuy = async (isPull = false) => {
    try {
      if (isPull) setRefreshing(true); else setBuyLoading(true);
      const { data } = await supabase
        .from("wanted_listings")
        .select("*, profiles(full_name), states_regions(name_en, name_mm), townships(name_en, name_mm)")
        .eq("status", "active")
        .eq("deal_type", "buy")
        .order("created_at", { ascending: false });
      setBuyListings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      if (isPull) setRefreshing(false); else setBuyLoading(false);
    }
  };

  const fetchRent = async (isPull = false) => {
    try {
      if (isPull) setRefreshing(true); else setRentLoading(true);
      const { data } = await supabase
        .from("wanted_listings")
        .select("*, profiles(full_name), states_regions(name_en, name_mm), townships(name_en, name_mm)")
        .eq("status", "active")
        .eq("deal_type", "rent")
        .order("created_at", { ascending: false });
      setRentListings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      if (isPull) setRefreshing(false); else setRentLoading(false);
    }
  };

  const goToTab = (tab: "buy" | "rent") => {
    setActiveTab(tab);
    Animated.spring(translateX, {
      toValue: tab === "buy" ? 0 : -SCREEN_WIDTH,
      useNativeDriver: true,
      bounciness: 8,
    }).start();
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchBuy();
      fetchRent();
      translateX.setValue(0);
    }, []),
  );

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.2,
      onPanResponderMove: (_, g) => {
        const offset = tabRef.current === "buy" ? g.dx : -SCREEN_WIDTH + g.dx;
        translateX.setValue(offset);
      },
      onPanResponderRelease: (_, g) => {
        const current = tabRef.current;
        const pageX = current === "buy" ? g.dx : -SCREEN_WIDTH + g.dx;
        const shouldSnapBuy = pageX > -SWIPE_THRESHOLD;
        const target = shouldSnapBuy ? "buy" : "rent";
        goToTab(target);
      },
    }),
  ).current;

  const filters = [
    { id: "buy" as const, label: isBurmese ? "အိမ်ဝယ်လိုသူများ" : "People looking to buy a house" },
    { id: "rent" as const, label: isBurmese ? "အိမ်ငှားလိုသူများ" : "People looking to rent a house" },
  ];

  const getTypeLabel = (item: any) => {
    const type = item.deal_type === "buy" ? "Buy" : "Rent";
    const prop = item.property_type
      ? ` - ${item.property_type.charAt(0).toUpperCase() + item.property_type.slice(1)}`
      : "";
    return `${type}${prop}`;
  };

  const getLocation = (item: any) => {
    const region = item.states_regions
      ? isBurmese
        ? item.states_regions.name_mm
        : item.states_regions.name_en
      : null;
    const township = item.townships
      ? isBurmese
        ? item.townships.name_mm
        : item.townships.name_en
      : null;
    if (township && region) return `${township}, ${region}`;
    if (region) return region;
    return null;
  };

  const renderItem = (item: any) => (
    <TouchableOpacity
      onPress={() => router.push(`/wanted/${item.id}` as any)}
      className="mx-5 mt-3 p-4 bg-primary-100 dark:bg-gray-800 rounded-2xl"
    >
      <View className="flex-row items-center gap-2 mb-1">
        <View className="bg-primary-300 px-2.5 py-0.5 rounded-full">
          <Text className="text-white text-xs font-rubik-medium">
            {getTypeLabel(item)}
          </Text>
        </View>
      </View>
        <Text className="text-base font-rubik-medium text-black-300 dark:text-gray-100 mb-1">
        {item.title}
      </Text>
      {item.description && (
        <Text className="text-sm font-rubik text-black-100 dark:text-gray-400 mb-1" numberOfLines={2}>
          {item.description}
        </Text>
      )}
      {(item.budget_min || item.budget_max) && (
        <Text className="text-base font-rubik-bold text-primary-300">
          {item.budget_min && item.budget_max
            ? `${isBurmese ? "သိန်း" : ""} ${item.budget_min} - ${item.budget_max}${isBurmese ? "" : " Lakh"}`
            : item.budget_min
              ? `${isBurmese ? `သိန်း ${item.budget_min}` : `${item.budget_min} Lakh+`}`
              : `${isBurmese ? `သိန်း ${item.budget_max}` : `Up to ${item.budget_max} Lakh`}`}
        </Text>
      )}
      {getLocation(item) && (
        <Text className="text-xs font-rubik text-black-100 dark:text-gray-400 mt-1">
          {getLocation(item)}
        </Text>
      )}
        <Text className="text-xs font-rubik text-black-100 dark:text-gray-400 mt-1">
        {item.profiles?.full_name || "Unknown"}
      </Text>
    </TouchableOpacity>
  );

  const listProps = (data: any[], loading: boolean) => ({
    data,
    renderItem: ({ item }: any) => renderItem(item),
    keyExtractor: (item: any) => item.id,
    contentContainerClassName: "pb-10",
    showsVerticalScrollIndicator: false,
    refreshControl: (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={() => { fetchBuy(true); fetchRent(true); }}
        colors={["#22c55e"]}
        tintColor="#22c55e"
      />
    ),
    ListEmptyComponent: loading ? (
      <ActivityIndicator size="large" className="text-primary-300 mt-10" />
    ) : (
      <View className="items-center py-12">
        <Text className="text-black-100 dark:text-gray-400 font-rubik-medium text-base">
          {isBurmese ? "ကြော်ငြာများမရှိသေးပါ" : "No wanted listings yet"}
        </Text>
      </View>
    ),
  }  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-black">
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="px-5 pt-2 pb-3 border-b border-primary-100 dark:border-gray-800">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-primary-100 dark:bg-gray-800">
            <ChevronLeft size={24} color="#22c55e" />
          </TouchableOpacity>
           <Text className="text-lg font-rubik-bold text-black-300 dark:text-gray-100">
            {isBurmese ? "ဝယ်/ငှားလိုသော ကြော်ငြာများ" : "Wanted Listings"}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/wanted/create")}
            className="bg-primary-300 px-4 py-2 rounded-full flex-row items-center gap-1"
          >
            <Plus size={16} color="white" />
            <Text className="text-white font-rubik-medium text-sm">
              {isBurmese ? "အသစ်" : "New"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row mt-4 border-b border-primary-100 dark:border-gray-800">
          {filters.map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => goToTab(f.id)}
              className="flex-1 items-center pb-2"
            >
              <Text
                className={`text-sm font-rubik-medium text-center ${activeTab === f.id ? "text-primary-300" : "text-black-100 dark:text-gray-400"}`}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
          <Animated.View
            className="absolute bottom-0 w-1/2 h-0.5 bg-primary-300 rounded-full"
            style={{
              transform: [{
                translateX: translateX.interpolate({
                  inputRange: [-SCREEN_WIDTH, 0],
                  outputRange: [SCREEN_WIDTH / 2, 0],
                  extrapolate: "clamp",
                }),
              }],
            }}
          />
        </View>
      </View>

      <View className="flex-1" {...panResponder.panHandlers}>
        <Animated.View
          className="flex-row"
          style={{
            width: SCREEN_WIDTH * 2,
            flex: 1,
            transform: [{ translateX }],
          }}
        >
          <View style={{ width: SCREEN_WIDTH }}>
            <FlashList {...listProps(buyListings, buyLoading)} />
          </View>
          <View style={{ width: SCREEN_WIDTH }}>
            <FlashList {...listProps(rentListings, rentLoading)} />
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
