import { supabase } from "@/lib/supabase";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Search } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Card } from "../../components/features/property/Cards";

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const isBurmese = i18n.language === "mm" || i18n.language?.startsWith("my");

  const [properties, setProperties] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  const fetchProperties = async (category: string) => {
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

      const { data } = await query;
      setProperties(data || []);
    } catch (err) {
      console.error("Error fetching properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", user.id)
            .single();
          setUser(data);
        }
      };
      getUser();
      fetchProperties(activeCategory);
    }, [activeCategory]),
  );

  const categories = [
    { id: "all", label: t("categories.all") },
    { id: "for rent", label: t("categories.for rent") },
    { id: "for sale", label: t("categories.for sale") },
    { id: "apartment", label: t("categories.apartment") },
    { id: "condo", label: t("categories.condo") },
    { id: "hostel", label: t("categories.hostel") },
  ];

  const handleCardPress = (id: string) => router.push(`/property/${id}`);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return isBurmese ? "မင်္ဂလာနံနက်ခင်းပါ" : "Good Morning";
    if (hour < 18) return isBurmese ? "မင်္ဂလာနေ့လယ်ခင်းပါ" : "Good Afternoon";
    return isBurmese ? "မင်္ဂလာညနေခင်းပါ" : "Good Evening";
  };

  return (
    <SafeAreaView className="h-full bg-white">
      <StatusBar style="dark" />

      <View className="bg-white border-b border-primary-100">
        <View className="px-5 pt-2 pb-3">
          <View className="flex flex-row items-center justify-between">
            <View className="flex flex-row">
              <Image
                source={{ uri: user?.avatar_url || "https://ui-avatars.com/api/?name=User" }}
                className="size-12 rounded-full"
              />
              <View className="flex flex-col items-start ml-2 justify-center">
                <Text className="text-xs font-rubik text-black-100">
                  {getGreeting()}
                </Text>
                <Text className="text-base font-rubik-medium text-black-300">
                  {user?.full_name || (isBurmese ? "ဧည့်သည်" : "Guest")}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push("/search")}>
              <Search size={24} color="#191D31" />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-2 mt-5"
          >
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setActiveCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-full ${isActive ? "bg-primary-300" : "bg-primary-100"}`}
                >
                  <Text
                    className={`text-sm font-rubik-medium ${isActive ? "text-white" : "text-black-200"}`}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      <FlatList
        data={properties}
        numColumns={2}
        renderItem={({ item }) => (
          <Card item={item} onPress={() => handleCardPress(item.id)} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerClassName="pb-32 pt-5"
        columnWrapperClassName="flex gap-5 px-5"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" className="text-primary-300 mt-5" />
          ) : (
            <View className="items-center py-12">
              <Text className="text-black-100 font-rubik-medium text-base">
                {isBurmese ? "ကြော်ငြာများမရှိသေးပါ" : "No properties found"}
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}
