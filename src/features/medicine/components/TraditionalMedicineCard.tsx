import { useLanguageStore } from "@/store/useLanguageStore";
import { Leaf } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Image, Text, TouchableOpacity, View } from "react-native";
import type { TraditionalMedicine } from "../types/medicine";

type Props = {
  medicine: TraditionalMedicine;
  onPress: () => void;
};

export default function TraditionalMedicineCard({ medicine, onPress }: Props) {
  const { t } = useTranslation();
  const { locale } = useLanguageStore();
  const isMy = locale === "my";

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-gray-50 rounded-3xl p-5 mb-4 border border-gray-100"
    >
      {/* Header */}
      <View className="flex-row items-center mb-4">
        {medicine.image_url ? (
          <Image
            source={{ uri: medicine.image_url }}
            className="w-16 h-16 rounded-2xl"
            resizeMode="cover"
          />
        ) : (
          <View className="bg-green-100 p-3 rounded-2xl w-16 h-16 items-center justify-center">
            <Leaf size={28} color="#16a34a" />
          </View>
        )}

        <View className="ml-4 flex-1">
          <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
            {isMy ? medicine.name_my : medicine.name_en}
          </Text>
          <Text className="text-sm text-gray-400 mt-0.5" numberOfLines={1}>
            {isMy ? medicine.name_en : medicine.name_my}
          </Text>
          {/* category badge */}
          <View className="bg-green-100 self-start px-3 py-0.5 rounded-full mt-1">
            <Text className="text-green-700 text-xs font-semibold">
              {t("medicineTraditionalTag")}
            </Text>
          </View>
        </View>
      </View>

      {/* Benefits */}
      <View className="bg-white rounded-2xl p-4 mb-2">
        <Text className="text-xs text-gray-400 mb-1">
          {t("medicineBenefits")}
        </Text>
        <Text className="text-sm text-gray-700" numberOfLines={2}>
          {isMy ? medicine.benefits_my : medicine.benefits_en}
        </Text>
      </View>

      {/* Dosage */}
      <View className="bg-white rounded-2xl p-4">
        <Text className="text-xs text-gray-400 mb-1">
          {t("medicineDosage")}
        </Text>
        <Text className="text-sm text-gray-700" numberOfLines={2}>
          {isMy ? medicine.usage_my : medicine.usage_en}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
