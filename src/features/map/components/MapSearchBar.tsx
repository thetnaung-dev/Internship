import { Search } from "lucide-react-native";

import { TextInput, View } from "react-native";

type Props = {
  value: string;
  onChange: (text: string) => void;
};

export default function MapSearchBar({ value, onChange }: Props) {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-1">
      <Search size={20} color="#64748b" />

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search hospitals or pharmacies..."
        placeholderTextColor="#94a3b8"
        className="flex-1 ml-2 text-base"
      />
    </View>
  );
}
