import { Pressable, Text } from "react-native";

type Props = {
  title: string;
  active?: boolean;
  onPress?: () => void;
};

export default function FilterChip({ title, active, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-5 py-3 rounded-full mr-3 ${
        active ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <Text
        className={`font-semibold ${active ? "text-white" : "text-gray-700"}`}
      >
        {title}
      </Text>
    </Pressable>
  );
}
