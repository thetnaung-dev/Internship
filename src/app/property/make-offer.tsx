import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MakeOfferScreen() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 py-4 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-white border border-slate-100"
        >
          <ChevronLeft size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800 ml-4">Make an Offer</Text>
      </View>
      <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
        <Text className="text-slate-600 font-semibold mb-2 mt-6">Your Offer</Text>
        <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3">
          <Text className="text-slate-500 font-bold text-lg">$</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            keyboardType="numeric"
            className="flex-1 ml-2 text-lg font-bold text-slate-800"
          />
        </View>
        <TouchableOpacity className="bg-amber-500 py-4 rounded-xl items-center mt-8">
          <Text className="text-white font-bold">Submit Offer</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
