import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, MapPin } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PropertyDetailScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="absolute top-12 left-4 z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white/90"
        >
          <ChevronLeft size={24} color="#334155" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" }}
          className="w-full h-72"
        />
        <View className="px-6 pt-6">
          <Text className="text-2xl font-bold text-slate-900">Property Detail</Text>
          <View className="flex-row items-center mt-2">
            <MapPin size={16} color="#94a3b8" />
            <Text className="text-slate-400 ml-1">Yangon, Myanmar</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
