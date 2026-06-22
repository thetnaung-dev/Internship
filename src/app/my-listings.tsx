import { supabase } from "@/lib/supabase";
import { router, useFocusEffect } from "expo-router";
import { ChevronLeft, Edit3, Trash2 } from "lucide-react-native";
import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Listing {
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

export default function MyListingsScreen() {
  const { t, i18n } = useTranslation();
  const isBurmese = i18n.language === "mm" || i18n.language?.startsWith("my");
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchListings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setListings(data || []);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { fetchListings(); }, []));

  const handleDelete = (id: string) => {
    Alert.alert(
      t("profile.deleteTitle") || "Delete Listing",
      t("profile.deleteConfirm") || "Are you sure you want to delete this listing?",
      [
        { text: t("profile.cancel") || "Cancel", style: "cancel" },
        {
          text: t("profile.delete") || "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(id);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              Alert.alert("Error", "You must be logged in.");
              setDeleting(null);
              return;
            }
            const { error } = await supabase
              .from("properties")
              .delete()
              .eq("id", id)
              .eq("user_id", user.id);
            if (error) {
              Alert.alert(
                t("profile.error") || "Error",
                error.message || (t("profile.deleteFailed") || "Failed to delete listing. Please try again."),
              );
            } else {
              setListings((prev) => prev.filter((l) => l.id !== id));
            }
            setDeleting(null);
          },
        },
      ],
    );
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
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
          <ChevronLeft size={24} color="#22c55e" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-rubik-bold text-black-300 text-center mr-10">
          {t("profile.myListings") || "My Listings"}
        </Text>
      </View>

      {listings.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-black-100 text-lg font-rubik-bold">{t("profile.noListings") || "No listings yet"}</Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/create_post")}
            className="mt-4 bg-primary-300 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-rubik-bold">{t("profile.createListing") || "Create Listing"}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          renderItem={({ item }) => {
            const title = isBurmese && item.title_mm ? item.title_mm : item.title_en;
            const price = item.currency_unit === "lakhs" ? `${item.price} Lakhs` : `$${item.price}`;
            const image = item.images?.[0];
            return (
              <View className="bg-white rounded-2xl overflow-hidden border border-primary-200">
                <TouchableOpacity onPress={() => router.push(`/detail?id=${item.id}` as any)}>
                  {image && <Image source={{ uri: image }} className="w-full h-36" resizeMode="cover" />}
                  <View className="p-4">
                    <Text className="text-black-300 font-rubik-bold" numberOfLines={1}>{title}</Text>
                    <Text className="text-primary-300 font-rubik-bold text-lg">{price}</Text>
                    <Text className="text-black-100 text-xs font-rubik">Ad #{item.ad_number}</Text>
                  </View>
                </TouchableOpacity>
                <View className="flex-row border-t border-primary-200">
                  <TouchableOpacity
                    onPress={() => router.push(`/detail?id=${item.id}` as any)}
                    className="flex-1 flex-row items-center justify-center py-3 gap-2"
                  >
                    <Edit3 size={16} color="#666876" />
                    <Text className="text-black-200 font-rubik-semibold text-sm">{t("profile.view") || "View"}</Text>
                  </TouchableOpacity>
                  <View className="w-px bg-primary-200" />
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="flex-1 flex-row items-center justify-center py-3 gap-2"
                  >
                    {deleting === item.id ? (
                      <ActivityIndicator size="small" color="#F75555" />
                    ) : (
                      <>
                        <Trash2 size={16} color="#F75555" />
                        <Text className="text-red-500 font-rubik-semibold text-sm">{t("profile.delete") || "Delete"}</Text>
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
