import { Pill } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import type { EnglishMedicine } from "../types/medicine";

type Props = {
  medicine: EnglishMedicine;
  onPress: () => void;
};

export default function EnglishMedicineCard({ medicine, onPress }: Props) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-gray-50 rounded-3xl p-5 mb-4 border border-gray-100"
    >
      <View className="flex-row items-center mb-4">
        <View className="bg-blue-100 p-3 rounded-2xl w-16 h-16 items-center justify-center">
          <Pill size={28} color="#2563eb" />
        </View>

        <View className="ml-4 flex-1">
          <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
            {medicine.name}
          </Text>
          <Text className="text-sm text-gray-400 mt-0.5" numberOfLines={1}>
            {medicine.generic_name}
          </Text>
          <View className="bg-blue-100 self-start px-3 py-0.5 rounded-full mt-1">
            <Text className="text-blue-700 text-xs font-semibold">
              {t("medicineEnglishTag")}
            </Text>
          </View>
        </View>
      </View>

      <View className="bg-white rounded-2xl p-4 mb-2">
        <Text className="text-xs text-gray-400 mb-1">
          {t("medicineBenefits")}
        </Text>
        <Text className="text-sm text-gray-700" numberOfLines={2}>
          {medicine.benefits}
        </Text>
      </View>

      <View className="bg-white rounded-2xl p-4">
        <Text className="text-xs text-gray-400 mb-1">
          {t("medicineDosage")}
        </Text>
        <Text className="text-sm text-gray-700" numberOfLines={2}>
          {medicine.dosage}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
