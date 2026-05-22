import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type Props = {
  title: string;
  description: string;
  icon?: ReactNode;
  onPress?: () => void;
};

export default function FeatureCard({
  title,
  description,
  icon,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-4 rounded-3xl bg-white p-5 shadow-sm"
    >
      <View className="flex-row items-center">
        {icon && <View className="mr-4">{icon}</View>}

        <View className="flex-1">
          <Text className="text-lg font-bold">{title}</Text>

          <Text className="mt-1 text-gray-500">{description}</Text>
        </View>
      </View>
    </Pressable>
  );
}
