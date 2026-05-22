import { LocateFixed } from "lucide-react-native";

import { Pressable } from "react-native";

type Props = {
  onPress: () => void;
};

export default function CurrentLocationButton({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="absolute bottom-5 right-5 h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg"
    >
      <LocateFixed color="#fff" size={24} />
    </Pressable>
  );
}
