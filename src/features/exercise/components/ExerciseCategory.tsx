import { Pressable, Text } from "react-native";

type Props = {
  title: string;
  active?: boolean;
};

export default function ExerciseCategory({ title, active }: Props) {
  return (
    <Pressable
      className={`px-5 py-3 rounded-full mr-3 ${
        active ? "bg-blue-600" : "bg-gray-100"
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
