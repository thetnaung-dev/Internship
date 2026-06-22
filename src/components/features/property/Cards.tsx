import { Heart, Star } from "lucide-react-native";
import { Image, Text, TouchableOpacity, View } from "react-native";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

interface Props {
  item: any;
  onPress?: () => void;
}

export const FeaturedCard = ({ item, onPress }: Props) => {
  const displayImage = item.images?.[0] || item.image || DEFAULT_IMAGE;
  const displayTitle = item.title_en || item.title_mm || item.name || "";
  const displayLocation = item.search_value || item.address || "";
  const displayPrice =
    item.currency_unit === "lakhs"
      ? `${item.price} Lakhs`
      : `$${item.price}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex flex-col items-start w-60 h-80 relative"
    >
      <Image source={{ uri: displayImage }} className="size-full rounded-2xl" />

      <View className="size-full rounded-2xl absolute bottom-0 bg-black/30" />

      <View className="flex flex-row items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-5 right-5">
        <Star size={14} color="#22c55e" fill="#22c55e" />
        <Text className="text-xs font-rubik-bold text-primary-300 ml-1">
          {item.rating || "5.0"}
        </Text>
      </View>

      <View className="flex flex-col items-start absolute bottom-5 inset-x-5">
        <Text
          className="text-xl font-rubik-extrabold text-white"
          numberOfLines={1}
        >
          {displayTitle}
        </Text>
        <Text className="text-base font-rubik text-white" numberOfLines={1}>
          {displayLocation}
        </Text>

        <View className="flex flex-row items-center justify-between w-full mt-1">
          <Text className="text-xl font-rubik-extrabold text-white">
            {displayPrice}
          </Text>
          <Heart size={20} color="white" />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const Card = ({ item, onPress }: Props) => {
  const displayImage = item.images?.[0] || item.image || DEFAULT_IMAGE;
  const displayTitle = item.title_en || item.title_mm || item.name || "";
  const displayLocation = item.search_value || item.address || "";
  const displayPrice =
    item.currency_unit === "lakhs"
      ? `${item.price} Lakhs`
      : `$${item.price}`;

  return (
    <TouchableOpacity
      className="flex-1 w-full mt-4 px-3 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70 relative"
      onPress={onPress}
    >
      <View className="flex flex-row items-center absolute px-2 top-5 right-5 bg-white/90 p-1 rounded-full z-50">
        <Star size={10} color="#22c55e" fill="#22c55e" />
        <Text className="text-xs font-rubik-bold text-primary-300 ml-0.5">
          {item.rating || "5.0"}
        </Text>
      </View>

      <Image source={{ uri: displayImage }} className="w-full h-40 rounded-lg" />

      <View className="flex flex-col mt-2">
        <Text className="text-base font-rubik-bold text-black-300">
          {displayTitle}
        </Text>
        <Text className="text-xs font-rubik text-black-100">
          {displayLocation}
        </Text>

        <View className="flex flex-row items-center justify-between mt-2">
          <Text className="text-base font-rubik-bold text-primary-300">
            {displayPrice}
          </Text>
          <Heart size={18} color="#191D31" />
        </View>
      </View>
    </TouchableOpacity>
  );
};
