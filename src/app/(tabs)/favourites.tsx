import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { Heart, MessageCircle } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
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
  id: string;
  property_id: string;
  created_at: string;
  properties: {
    id: string;
    title_en: string;
    title_mm: string;
    price: number;
    currency_unit: string;
    deal_type: string;
    images: string[];
    ad_number: number;
  };
}

const Favourites = () => {
  const router = useRouter();
  const [saved, setSaved] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchFavourites = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    setUserId(user.id);
    const { data } = await supabase
      .from("saved_properties")
      .select("*, properties(id, title_en, title_mm, price, currency_unit, deal_type, images, ad_number)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setSaved(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  const handleRemove = async (propertyId: string) => {
    if (!userId) return;
    await supabase
      .from("saved_properties")
      .delete()
      .eq("user_id", userId)
      .eq("property_id", propertyId);
    setSaved((prev) => prev.filter((s) => s.property_id !== propertyId));
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" className="text-primary-300" />
      </SafeAreaView>
    );
  }

  if (!userId) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
        <Heart size={48} color="#8C8E98" />
        <Text className="text-black-200 text-lg font-rubik-bold mt-4">Login to save properties</Text>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          className="mt-4 bg-primary-300 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-rubik-bold">Log In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (saved.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
        <Heart size={48} color="#8C8E98" />
        <Text className="text-black-200 text-lg font-rubik-bold mt-4">No saved properties yet</Text>
        <Text className="text-black-100 text-sm font-rubik mt-1">Tap the heart on a property to save it</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-100">
      <View className="px-4 py-3 bg-white border-b border-primary-200">
        <Text className="text-lg font-rubik-bold text-black-300">Saved Properties</Text>
      </View>
      <FlatList
        data={saved}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        renderItem={({ item }) => {
          const title = item.properties.title_en || item.properties.title_mm;
          const price = item.properties.currency_unit === "lakhs"
            ? `${item.properties.price} Lakhs`
            : `$${item.properties.price}`;
          const image = item.properties.images?.[0];
          return (
            <TouchableOpacity
              onPress={() => router.push(`/detail?id=${item.properties.id}` as any)}
              className="bg-white rounded-2xl overflow-hidden border border-primary-200 flex-row"
            >
              {image ? (
                <Image source={{ uri: image }} className="w-24 h-24" resizeMode="cover" />
              ) : (
                <View className="w-24 h-24 bg-primary-200 items-center justify-center">
                  <Heart size={24} color="#8C8E98" />
                </View>
              )}
              <View className="flex-1 p-3 justify-center">
                <Text className="text-black-300 font-rubik-bold text-sm" numberOfLines={1}>{title}</Text>
                <Text className="text-primary-300 font-rubik-bold text-base mt-1">{price}</Text>
                <View className="flex-row items-center gap-3 mt-1">
                  <Text className="text-black-100 text-xs font-rubik uppercase">{item.properties.deal_type}</Text>
                  <TouchableOpacity onPress={() => handleRemove(item.property_id)}>
                    <Heart size={14} color="#F75555" fill="#F75555" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default Favourites;
