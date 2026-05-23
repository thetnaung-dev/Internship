import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Image,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import EnglishMedicineCard from "../components/EnglishMedicineCard";
import TraditionalMedicineCard from "../components/TraditionalMedicineCard";
import { useMedicine } from "../hooks/useMedicine";
import type { EnglishMedicine, TraditionalMedicine } from "../types/medicine";

const FILTERS = [
  { key: "all", labelKey: "medicineFilterAll" },
  { key: "traditional", labelKey: "medicineFilterTraditional" },
  { key: "english", labelKey: "medicineFilterEnglish" },
] as const;

const COMMON_SYMPTOMS = [
  { id: "fever", labelEn: "Fever", labelMy: "ဖျားခြင်း", keyword: "fever" },
  {
    id: "cough",
    labelEn: "Cough",
    labelMy: "ချောင်းဆိုးခြင်း",
    keyword: "cough",
  },
  {
    id: "headache",
    labelEn: "Headache",
    labelMy: "ခေါင်းကိုက်ခြင်း",
    keyword: "headache",
  },
  {
    id: "stomach",
    labelEn: "Stomach Ache",
    labelMy: "ဗိုက်နာခြင်း",
    keyword: "stomach",
  },
  {
    id: "allergy",
    labelEn: "Allergy",
    labelMy: "အလက်ဂျီ ဖြစ်ခြင်း",
    keyword: "allergy",
  },
];

export default function MedicineScreen() {
  const { t, i18n } = useTranslation();
  const isMyanmar = i18n.language === "my";

  const {
    displayed,
    selectedSymptoms,
    setSelectedSymptoms,
    filter,
    setFilter,
    loading,
    error,
  } = useMedicine();

  const [selectedMedicine, setSelectedMedicine] = useState<
    EnglishMedicine | TraditionalMedicine | null
  >(null);

  const handleSymptomPress = (keyword: string) => {
    setSelectedSymptoms(
      (prev) =>
        prev.includes(keyword)
          ? prev.filter((item) => item !== keyword) // Remove if checked
          : [...prev, keyword], // Append if unchecked
    );
  };

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
        {/* Title Presentation Section */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900">
            {String(t("medicinesTitle"))}
          </Text>
          <Text className="text-gray-500 mt-2">
            {String(t("medicinesSubtitle"))}
          </Text>
        </View>

        {/* Symptoms Multi-Select Matrix */}
        <View className="mb-6">
          <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Select Symptoms (Combine multiple)
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((sym) => {
              const isActive = selectedSymptoms.includes(sym.keyword);

              return (
                <TouchableOpacity
                  key={sym.id}
                  onPress={() => handleSymptomPress(sym.keyword)}
                  className={`px-4 py-2.5 rounded-2xl border transition-all ${
                    isActive
                      ? "bg-blue-600 border-blue-600"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${isActive ? "text-white" : "text-gray-700"}`}
                  >
                    {isMyanmar ? sym.labelMy : sym.labelEn}{" "}
                    {isActive ? "✕" : "+"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dataset Type Category Segmented Selection Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-6"
        >
          <View className="flex-row gap-3">
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilter(f.key)}
                className={`px-5 py-2.5 rounded-full ${filter === f.key ? "bg-gray-900" : "bg-gray-100"}`}
              >
                <Text
                  className={`font-semibold text-sm ${filter === f.key ? "text-white" : "text-gray-600"}`}
                >
                  {String(t(f.labelKey))}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* System Loading and Status Blocks */}
        {loading && (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        )}

        {error && !loading && (
          <Text className="text-red-400 text-center py-10">
            {String(t("medicineError"))}
          </Text>
        )}

        {!loading && !error && displayed.length === 0 && (
          <Text className="text-gray-400 text-center py-10">
            {String(t("medicineEmpty"))}
          </Text>
        )}

        {/* Product Cards Rendering Deck */}
        {/* Find this section inside your MedicineScreen.tsx ScrollView container */}
        {!loading &&
          !error &&
          displayed.map((med) =>
            med.type === "english" ? (
              <EnglishMedicineCard
                key={`eng-${med.id}`}
                medicine={med}
                onPress={() => setSelectedMedicine(med)}
              />
            ) : (
              <TraditionalMedicineCard
                key={`trad-${med.id}`}
                medicine={med}
                onPress={() => setSelectedMedicine(med)}
              />
            ),
          )}
      </ScrollView>

      {/* Detail Slide Presentation Modal Overlay */}
      <Modal
        visible={selectedMedicine !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedMedicine(null)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-3xl h-[92%] p-6 shadow-2xl flex-col">
            <View className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
            {selectedMedicine && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 40 }}
              >
                {selectedMedicine.type === "english" ? (
                  <View>
                    {selectedMedicine.image_url ? (
                      <Image
                        source={{ uri: selectedMedicine.image_url }}
                        className="w-full h-56 rounded-2xl mb-5"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-48 bg-blue-50 rounded-2xl mb-5 justify-center items-center border border-blue-100">
                        <Text className="text-blue-500 font-semibold text-lg">
                          Western Medical Data
                        </Text>
                      </View>
                    )}
                    <Text className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedMedicine.name}
                    </Text>
                    <Text className="text-sm font-semibold text-blue-600 italic mb-6">
                      {selectedMedicine.generic_name}
                    </Text>
                    <Text className="text-base font-bold text-gray-800 mb-1.5">
                      Indications & Benefits
                    </Text>
                    <Text className="text-gray-600 leading-relaxed mb-5">
                      {selectedMedicine.benefits}
                    </Text>
                    <Text className="text-base font-bold text-gray-800 mb-1.5">
                      Dosage
                    </Text>
                    <Text className="text-gray-600 leading-relaxed mb-5">
                      {selectedMedicine.dosage}
                    </Text>
                    <Text className="text-base font-bold text-red-600 mb-1.5">
                      Warnings
                    </Text>
                    <Text className="text-red-700 bg-red-50 p-4 rounded-xl leading-relaxed">
                      {selectedMedicine.warnings}
                    </Text>
                  </View>
                ) : (
                  <View>
                    {selectedMedicine.image_url ? (
                      <Image
                        source={{ uri: selectedMedicine.image_url }}
                        className="w-full h-56 rounded-2xl mb-5"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-full h-56 bg-emerald-50 rounded-2xl mb-5 justify-center items-center border border-emerald-100">
                        <Text className="text-emerald-600 font-semibold text-lg">
                          Traditional Remedy
                        </Text>
                      </View>
                    )}
                    <Text className="text-2xl font-bold text-gray-900 mb-1">
                      {isMyanmar
                        ? selectedMedicine.name_my
                        : selectedMedicine.name_en}
                    </Text>
                    <Text className="text-sm font-medium text-emerald-600 mb-6">
                      {isMyanmar
                        ? selectedMedicine.category_my
                        : selectedMedicine.category_en}
                    </Text>
                    <Text className="text-base font-bold text-gray-800 mb-1.5">
                      Benefits
                    </Text>
                    <Text className="text-gray-600 leading-relaxed mb-5">
                      {isMyanmar
                        ? selectedMedicine.benefits_my
                        : selectedMedicine.benefits_en}
                    </Text>
                    <Text className="text-base font-bold text-gray-800 mb-1.5">
                      Usage Instructions
                    </Text>
                    <Text className="text-gray-600 leading-relaxed mb-5">
                      {isMyanmar
                        ? selectedMedicine.usage_my
                        : selectedMedicine.usage_en}
                    </Text>
                    <Text className="text-base font-bold text-gray-800 mb-1.5">
                      Ingredients
                    </Text>
                    <Text className="text-gray-600 leading-relaxed mb-5">
                      {isMyanmar
                        ? selectedMedicine.ingredients_my
                        : selectedMedicine.ingredients_en}
                    </Text>
                    <Text className="text-base font-bold text-amber-600 mb-1.5">
                      Warnings
                    </Text>
                    <Text className="text-amber-700 bg-amber-50 p-4 rounded-xl leading-relaxed">
                      {isMyanmar
                        ? selectedMedicine.warnings_my
                        : selectedMedicine.warnings_en}
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
            <View className="pt-2 bg-white">
              <TouchableOpacity
                onPress={() => setSelectedMedicine(null)}
                className="bg-gray-900 py-4 rounded-xl items-center shadow-md"
              >
                <Text className="text-white font-bold text-base">Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
