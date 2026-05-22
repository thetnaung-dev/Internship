import { Pill } from "lucide-react-native";

import { Text, View } from "react-native";

type Props = {
  name: string;
  description: string;
  dosage: string;
};

export default function MedicineCard({ name, description, dosage }: Props) {
  return (
    <View className="bg-gray-100 rounded-3xl p-5 mb-4">
      <View className="flex-row items-center mb-4">
        <View className="bg-blue-100 p-3 rounded-2xl">
          <Pill size={22} color="#2563eb" />
        </View>

        <View className="ml-4 flex-1">
          <Text className="text-lg font-bold text-gray-900">{name}</Text>

          <Text className="text-gray-500 mt-1">{description}</Text>
        </View>
      </View>

      <View className="bg-white rounded-2xl p-4">
        <Text className="text-sm text-gray-500">Dosage</Text>

        <Text className="text-base font-semibold text-gray-900 mt-1">
          {dosage}
        </Text>
      </View>
    </View>
  );
}
