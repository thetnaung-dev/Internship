import { Text, View } from "react-native";

type Props = {
  title: string;
  subtitle?: string;
};

export default function SectionTitle({ title, subtitle }: Props) {
  return (
    <View className="mb-4">
      <Text className="text-xl font-bold">{title}</Text>

      {subtitle && <Text className="text-gray-500 mt-1">{subtitle}</Text>}
    </View>
  );
}
