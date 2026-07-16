import { Button, ButtonText } from "@/components/features/ui/button/button";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Search, Trash2 } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import { useThemeStore } from "@/store/useThemeStore";

export default function SavedSearchesScreen() {
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const isDark = resolvedTheme === "dark";
  const [searches, setSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      fetchSearches();
    }, [])
  );

  const fetchSearches = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/(auth)/login");
      return;
    }
    const { data } = await supabase
      .from("saved_searches")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSearches(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("saved_searches").delete().eq("id", id);
    if (error) {
      console.error("Delete error:", error);
    } else {
      setSearches((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      t("savedSearches.delete") || "Delete",
      t("savedSearches.deleted") || "Delete this search?",
      [
        { text: t("savedSearches.cancel") || "Cancel", style: "cancel" },
        { text: t("savedSearches.delete") || "Delete", style: "destructive", onPress: () => handleDelete(id) },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-primary-100 dark:bg-gray-800 justify-center items-center">
        <ActivityIndicator size="large" className="text-primary-300" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-100 dark:bg-gray-800">
      <StatusBar style={isDark ? "light" : "dark"} />
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-rubik-extrabold text-black-300 dark:text-gray-100">
          {t("savedSearches.title")}
        </Text>
      </View>
      {searches.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Search size={48} color="#bbf7d0" />
          <Text className="text-black-100 dark:text-gray-400 font-rubik mt-4 text-center">
            {t("savedSearches.empty")}
          </Text>
        </View>
      ) : (
        <FlashList
          data={searches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-primary-200 dark:border-gray-800 flex-row items-center">
              <TouchableOpacity
                className="flex-1"
                onPress={() => {
                  const params = item.search_params || {};
                  router.push({
                    pathname: "/search",
                    params: {
                      dealType: params.dealType || "sale",
                      stateRegion: params.stateRegion || "",
                      township: params.township || "",
                      propertyType: params.propertyType || "",
                      floor: params.floor || "",
                      minPrice: params.minPrice || "",
                      maxPrice: params.maxPrice || "",
                      rooms: params.rooms || "",
                      sqft: params.sqft || "",
                      autoSearch: "true",
                    },
                  });
                }}
              >
                <Text className="text-black-300 dark:text-gray-100 font-rubik-bold text-base">
                  {item.name}
                </Text>
                {item.search_params?.dealType && (
                  <Text className="text-black-100 dark:text-gray-400 font-rubik text-sm mt-1">
                    {item.search_params.dealType === "buy" ? t("filter.buy") : t("filter.rent")}
                    {item.search_params.propertyType ? ` · ${item.search_params.propertyType}` : ""}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDelete(item.id)} className="p-2">
                <Trash2 size={18} color="#F75555" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}
