import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Phone, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Linking, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WantedDetailScreen() {
  const { t, i18n } = useTranslation();
  const isBurmese = i18n.language === "mm" || i18n.language?.startsWith("my");
  const { id } = useLocalSearchParams();

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("wanted_listings")
          .select(
            "*, profiles(full_name, phone), states_regions(name_en, name_mm), townships(name_en, name_mm)",
          )
          .eq("id", id)
          .single();
        setListing(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </SafeAreaView>
    );
  }

  if (!listing) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-black-100 font-rubik">
          {isBurmese ? "ကြော်ငြာမတွေ့ပါ" : "Listing not found"}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary-300 font-rubik-medium">
            {isBurmese ? "နောက်သို့ပြန်သွားရန်" : "Go back"}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const region = listing.states_regions
    ? isBurmese
      ? listing.states_regions.name_mm
      : listing.states_regions.name_en
    : null;
  const township = listing.townships
    ? isBurmese
      ? listing.townships.name_mm
      : listing.townships.name_en
    : null;

  const typeLabel =
    listing.deal_type === "buy"
      ? isBurmese
        ? "ဝယ်ယူလိုသည်"
        : "Want to Buy"
      : isBurmese
        ? "ငှားရမ်းလိုသည်"
        : "Want to Rent";

  const propertyTypeLabel = listing.property_type
    ? listing.property_type.charAt(0).toUpperCase() + listing.property_type.slice(1)
    : null;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-5 pt-2 pb-3 border-b border-primary-100 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-primary-100 mr-3">
          <ChevronLeft size={24} color="#22c55e" />
        </TouchableOpacity>
        <Text className="text-lg font-rubik-bold text-black-300 flex-1">
          {isBurmese ? "ကြော်ငြာအသေးစိတ်" : "Listing Details"}
        </Text>
      </View>

      <View className="flex-1 px-5 pt-5">
        <View className="flex-row items-center gap-2 mb-3">
          <View className="bg-primary-300 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-rubik-medium">
              {typeLabel}
            </Text>
          </View>
          {propertyTypeLabel && (
            <View className="bg-primary-100 px-3 py-1 rounded-full">
              <Text className="text-black-200 text-xs font-rubik-medium">
                {propertyTypeLabel}
              </Text>
            </View>
          )}
        </View>

        <Text className="text-xl font-rubik-bold text-black-300 mb-2">
          {listing.title}
        </Text>

        {listing.description && (
          <Text className="text-sm font-rubik text-black-100 mb-4 leading-5">
            {listing.description}
          </Text>
        )}

        <View className="bg-primary-100 rounded-2xl p-4 mb-4">
          {(listing.budget_min || listing.budget_max) && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-black-200 font-rubik-medium">
                {isBurmese ? "ဈေးနှုန်း" : "Price"}
              </Text>
              <Text className="text-lg font-rubik-bold text-primary-300">
                {listing.budget_min && listing.budget_max
                  ? `${listing.budget_min} - ${listing.budget_max} Lakh`
                  : listing.budget_min
                    ? `${listing.budget_min} Lakh+`
                    : `Up to ${listing.budget_max} Lakh`}
              </Text>
            </View>
          )}
          {township && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-black-200 font-rubik-medium">
                {isBurmese ? "မြို့နယ်" : "Township"}
              </Text>
              <Text className="text-black-300 font-rubik-medium">
                {township}
              </Text>
            </View>
          )}
          {region && (
            <View className="flex-row justify-between">
              <Text className="text-black-200 font-rubik-medium">
                {isBurmese ? "တိုင်းဒေသကြီး" : "Region"}
              </Text>
              <Text className="text-black-300 font-rubik-medium">
                {region}
              </Text>
            </View>
          )}
        </View>

        <View className="bg-primary-100 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center gap-3">
            <View className="size-10 rounded-full bg-primary-200 items-center justify-center">
              <User size={20} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-rubik-medium text-black-300">
                {listing.profiles?.full_name || "Unknown"}
              </Text>
              <Text className="text-xs font-rubik text-black-100">
                {isBurmese ? "ကြော်ငြာရှင်" : "Poster"}
              </Text>
            </View>
          </View>
        </View>

        {listing.contact_phone && (
          <TouchableOpacity
            onPress={() => Linking.openURL(`tel:${listing.contact_phone}`)}
            className="bg-primary-300 rounded-2xl py-4 flex-row items-center justify-center gap-2"
          >
            <Phone size={20} color="white" />
            <Text className="text-white font-rubik-bold text-base">
              {listing.contact_phone}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
