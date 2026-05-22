import { useState } from "react";

import { ScrollView, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import MedicineCard from "../components/MedicineCard";
import MedicineSearchBar from "../components/MedicineSearchBar";

export default function MedicineScreen() {
  const [search, setSearch] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 120,
        }}
      >
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-gray-900">Medicines</Text>

          <Text className="text-gray-500 mt-2">
            Search healthcare medicines and dosage information
          </Text>
        </View>

        {/* Search */}
        <View className="mb-8">
          <MedicineSearchBar value={search} onChange={setSearch} />
        </View>

        {/* Medicines */}
        <MedicineCard
          name="Paracetamol"
          description="Pain reliever and fever reducer"
          dosage="500mg every 6 hours"
        />

        <MedicineCard
          name="Amoxicillin"
          description="Antibiotic medicine"
          dosage="250mg three times daily"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
