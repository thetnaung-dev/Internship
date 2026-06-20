import { router, useLocalSearchParams } from "expo-router";
import { ChevronLeft, Phone, Star } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AgentDetailScreen() {
  const { id } = useLocalSearchParams();
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 py-4 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white border border-slate-100"
        >
          <ChevronLeft size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800 ml-4">Agent Profile</Text>
      </View>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="items-center mt-6 mb-8">
          <View className="w-24 h-24 bg-amber-200 rounded-full items-center justify-center">
            <Text className="text-3xl font-bold text-amber-600">A</Text>
          </View>
          <Text className="text-2xl font-bold text-slate-800 mt-4">Agent Name</Text>
          <View className="flex-row items-center mt-1">
            <Star size={16} color="#f59e0b" fill="#f59e0b" />
            <Text className="text-slate-500 ml-1">5.0</Text>
          </View>
        </View>
        <TouchableOpacity className="bg-amber-500 py-4 rounded-xl items-center flex-row justify-center">
          <Phone size={20} color="#fff" />
          <Text className="text-white font-bold ml-2">Contact Agent</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
