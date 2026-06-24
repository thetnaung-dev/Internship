import { supabase } from "@/lib/supabase";
import { router, useFocusEffect } from "expo-router";
import { ChevronLeft, Heart } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SavedProperty {
  saved_id: string;
  id: string;
  title_en: string;
  title_mm: string;
  price: number;
  currency_unit: string;
  deal_type: string;
  images: string[];
  ad_number: number;
  created_at: string;
}

export default function SavedPropertiesScreen() {
  const { t, i18n } = useTranslation();
  const isBurmese = i18n.language === "mm" || i18n.language?.startsWith("my");
  const [properties, setProperties] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [unsaving, setUnsaving] = useState<string | null>(null);

  const fetchSaved = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      router.replace("/(auth)/login");
      return;
    }
    const { data } = await supabase
      .from("saved_properties")
      .select("id, property_id, created_at, properties(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    const mapped =
      data?.map((item: any) => ({
        saved_id: item.id,
        ...item.properties,
      })) || [];
    setProperties(mapped);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchSaved(); }, []));

  const handleUnsave = async (savedId: string) => {
    setUnsaving(savedId);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) { setUnsaving(null); return; }
    const { error } = await supabase
      .from("saved_properties")
      .delete()
      .eq("id", savedId)
      .eq("user_id", user.id);
    if (!error) {
      setProperties((prev) => prev.filter((p) => p.saved_id !== savedId));
    }
    setUnsaving(null);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-primary-100 items-center justify-center">
        <ActivityIndicator size="large" className="text-primary-300" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-100">
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-primary-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center"
        >
          <ChevronLeft size={24} color="#22c55e" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-rubik-bold text-black-300 text-center mr-10">
          {t("profile.savedProperties")}
        </Text>
      </View>

      {properties.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Heart size={48} color="#bbf7d0" />
          <Text className="text-black-100 text-lg font-rubik-bold mt-4">
            {t("profile.noSavedProperties") || "No saved properties yet"}
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            className="mt-4 bg-primary-300 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-rubik-bold">
              {t("profile.browseProperties") || "Browse Properties"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={properties}
          keyExtractor={(item) => item.saved_id}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          renderItem={({ item }) => {
            const title =
              isBurmese && item.title_mm ? item.title_mm : item.title_en;
            const price =
              item.currency_unit === "lakhs"
                ? `${item.price} Lakhs`
                : `$${item.price}`;
            const image = item.images?.[0];
            return (
              <View className="bg-white rounded-2xl overflow-hidden border border-primary-200">
                <TouchableOpacity
                  onPress={() =>
                    router.push(`/detail?id=${item.id}` as any)
                  }
                >
                  {image && (
                    <Image
                      source={{ uri: image }}
                      className="w-full h-36"
                      resizeMode="cover"
                    />
                  )}
                  <View className="p-4">
                    <Text
                      className="text-black-300 font-rubik-bold"
                      numberOfLines={1}
                    >
                      {title}
                    </Text>
                    <Text className="text-primary-300 font-rubik-bold text-lg">
                      {price}
                    </Text>
                    <Text className="text-black-100 text-xs font-rubik">
                      Ad #{item.ad_number}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View className="flex-row border-t border-primary-200">
                  <TouchableOpacity
                    onPress={() =>
                      router.push(`/detail?id=${item.id}` as any)
                    }
                    className="flex-1 flex-row items-center justify-center py-3 gap-2"
                  >
                    <Heart size={16} color="#22c55e" />
                    <Text className="text-primary-300 font-rubik-semibold text-sm">
                      {t("profile.view") || "View"}
                    </Text>
                  </TouchableOpacity>
                  <View className="w-px bg-primary-200" />
                  <TouchableOpacity
                    onPress={() => handleUnsave(item.saved_id)}
                    disabled={unsaving === item.saved_id}
                    className="flex-1 flex-row items-center justify-center py-3 gap-2"
                  >
                    {unsaving === item.saved_id ? (
                      <ActivityIndicator size="small" color="#F75555" />
                    ) : (
                      <>
                        <Heart
                          size={16}
                          color="#F75555"
                          fill="#F75555"
                        />
                        <Text className="text-red-500 font-rubik-semibold text-sm">
                          {t("profile.unsave") || "Unsave"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
