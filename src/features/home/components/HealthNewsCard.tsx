// src/features/home/components/HealthNewsCard.tsx
import { useLanguageStore } from "@/store/useLanguageStore";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image, Linking, Text, TouchableOpacity, View } from "react-native";

interface HealthNewsCardProps {
  title: string;
  description: string;
  color: string;
  sourceName: string;
  imageUrl: string;
  publishedAt: string;
  url: string;
}

export default function HealthNewsCard({
  title,
  description,
  color,
  sourceName,
  imageUrl,
  publishedAt,
  url,
}: HealthNewsCardProps) {
  const { t } = useTranslation();
  const locale = useLanguageStore((state) => state.locale);

  const handlePress = async () => {
    if (url) {
      await Linking.openURL(url);
    }
  };

  // Format date based on current locale
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString(
        locale === "my" ? "my-MM" : "en-US",
        { year: "numeric", month: "short", day: "numeric" },
      )
    : null;

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`p-5 rounded-3xl mb-4 ${color} border border-black/5 flex-row items-center justify-between`}
    >
      <View className="flex-1 pr-3">
        {/* Source Meta Header */}
        <View className="flex-row items-center mb-2 gap-x-2">
          <Text className="text-xs font-bold text-blue-600 tracking-wider uppercase">
            {sourceName}
          </Text>
          {formattedDate ? (
            <Text className="text-xs text-gray-400">• {formattedDate}</Text>
          ) : null}
        </View>
        <Text
          className="text-md font-bold text-gray-900 mb-1"
          numberOfLines={3}
        >
          {title}
        </Text>
        <Text className="text-sm text-gray-500 line-clamp-2" numberOfLines={2}>
          {description}
        </Text>
      </View>

      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="w-20 h-20 rounded-2xl bg-gray-200"
          resizeMode="cover"
        />
      ) : null}
    </TouchableOpacity>
  );
}
