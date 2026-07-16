import { router } from "expo-router";
import { Calendar, ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScheduleVisitScreen() {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 py-4 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-primary-100"
        >
          <ChevronLeft size={24} color="#22c55e" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800 ml-4">Schedule a Visit</Text>
      </View>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="items-center mt-10">
          <Calendar size={64} color="#cbd5e1" />
          <Text className="text-slate-400 mt-4 text-center">
            Calendar integration coming soon
          </Text>
        </View>
        <TouchableOpacity className="bg-amber-500 py-4 rounded-xl items-center mt-8">
          <Text className="text-white font-bold">Confirm Visit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
