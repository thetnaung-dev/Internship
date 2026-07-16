import { useTranslation } from "react-i18next";
import { Eye, Heart, Share2, GitCompare } from "lucide-react-native";
import { Image, Share, Text, TouchableOpacity, View } from "react-native";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

interface Props {
  item: any;
  onPress?: () => void;
  onSave?: () => void;
  onCompare?: () => void;
  isSaved?: boolean;
  compareSelected?: boolean;
}

export const Card = ({ item, onPress, onSave, onCompare, isSaved, compareSelected }: Props) => {
  const { t } = useTranslation();
  const displayImage = item.images?.[0] || item.image || DEFAULT_IMAGE;
  const displayPrice =
    item.currency_unit === "lakhs"
      ? `${item.price} Lakhs`
      : `$${item.price}`;
  const regionName = item.states_regions
    ? item.states_regions.name_mm || item.states_regions.name_en
    : "";
  const townshipName = item.townships
    ? item.townships.name_mm || item.townships.name_en
    : "";

  const handleShare = async () => {
    await Share.share({
      message: `https://warm-bublanina-7b1ea2.netlify.app/property/${item.id}`,
    });
  };

  return (
    <TouchableOpacity
      className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-primary-200 dark:border-gray-800 mb-4 mx-5"
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View>
        <Image
          source={{ uri: displayImage }}
          className="w-full h-44"
          resizeMode="cover"
        />
        {item.is_sold && (
          <View className="absolute top-3 left-3 bg-red-500 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-rubik-extrabold">
              {t("badge.soldOut")}{item.sold_at ? ` ${new Date(item.sold_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}
            </Text>
          </View>
        )}
      </View>

      <View className="px-4 pt-3 pb-2 gap-1">
        <Text className="text-black-100 dark:text-gray-400 text-xs font-rubik" numberOfLines={1}>
          {regionName} | {townshipName}
        </Text>
        <View className="flex-row items-center gap-2">
          <View className="bg-primary-100 dark:bg-gray-800 px-2.5 py-0.5 rounded-full">
            <Text className="text-primary-300 text-xs font-rubik-semibold capitalize">
              {item.property_type || "Property"}
            </Text>
          </View>
        </View>
        <Text className="text-primary-300 text-lg font-rubik-extrabold mt-1">
          {displayPrice}
        </Text>
      </View>

      <View className="flex-row items-center justify-between px-4 py-2.5 border-t border-primary-100 dark:border-gray-800">
        <View className="flex-row items-center gap-1.5">
          <Eye size={16} color="#8C8E98" />
          <Text className="text-black-100 dark:text-gray-400 text-xs font-rubik-medium">
            {item.views ?? 0}
          </Text>
        </View>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={onSave}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Heart
              size={18}
              color={isSaved ? "#F75555" : "#8C8E98"}
              fill={isSaved ? "#F75555" : "transparent"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Share2 size={18} color="#8C8E98" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onCompare}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <GitCompare size={18} color={compareSelected ? "#22c55e" : "#8C8E98"} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

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
        <Eye size={14} color="#22c55e" />
        <Text className="text-xs font-rubik-bold text-primary-300 ml-1">
          {item.views ?? 0}
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
