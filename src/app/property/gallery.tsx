import { router } from "expo-router";
import { ChevronLeft, Image } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function GalleryScreen() {
  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="absolute top-12 left-4 z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
        >
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="items-center justify-center h-full">
          <Image size={48} color="#666" />
          <Text className="text-white/50 mt-4">Gallery coming soon</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
