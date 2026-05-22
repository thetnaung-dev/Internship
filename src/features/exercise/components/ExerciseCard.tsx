import { Dumbbell, Timer } from "lucide-react-native";

import { Text, View } from "react-native";

type Props = {
  title: string;
  duration: string;
  level: string;
};

export default function ExerciseCard({ title, duration, level }: Props) {
  return (
    <View className="bg-gray-100 rounded-3xl p-5 mb-4">
      <View className="flex-row items-center justify-between">
        <View className="bg-blue-100 p-3 rounded-2xl">
          <Dumbbell size={24} color="#2563eb" />
        </View>

        <View className="bg-white px-3 py-1 rounded-full">
          <Text className="text-sm font-semibold text-blue-700">{level}</Text>
        </View>
      </View>

      <Text className="text-xl font-bold text-gray-900 mt-5">{title}</Text>

      <View className="flex-row items-center mt-3">
        <Timer size={18} color="#64748b" />

        <Text className="ml-2 text-gray-500">{duration}</Text>
      </View>
    </View>
  );
}
