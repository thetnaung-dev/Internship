import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VirtualTourScreen() {
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
      <View className="flex-1 items-center justify-center">
        <Text className="text-white/50 text-lg">Virtual Tour</Text>
        <Text className="text-white/30 mt-2">Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
