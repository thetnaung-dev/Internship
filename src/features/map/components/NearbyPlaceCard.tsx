import { Clock3, MapPin } from "lucide-react-native";

import { Pressable, Text, View } from "react-native";

type Props = {
  name: string;
  distance: string;
  type: string;
  onPress?: () => void;
};

export default function NearbyPlaceCard({
  name,
  distance,
  type,
  onPress,
}: Props) {
  return (
    <Pressable onPress={onPress} className="bg-gray-100 rounded-3xl p-5 mb-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-900">{name}</Text>

        <View className="bg-blue-100 px-3 py-1 rounded-full">
          <Text className="text-blue-700 text-xs font-semibold">{type}</Text>
        </View>
      </View>

      <View className="flex-row items-center mt-4">
        <MapPin size={16} color="#64748b" />

        <Text className="ml-2 text-gray-500">{distance}</Text>
      </View>

      <View className="flex-row items-center mt-2">
        <Clock3 size={16} color="#64748b" />

        <Text className="ml-2 text-gray-500">Open Now</Text>
      </View>
    </Pressable>
  );
}
