import { Search } from "lucide-react-native";

import { TextInput, View } from "react-native";

type Props = {
  value: string;
  onChange: (text: string) => void;
};

export default function MedicineSearchBar({ value, onChange }: Props) {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-4">
      <Search size={20} color="#64748b" />

      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search medicines..."
        placeholderTextColor="#94a3b8"
        className="flex-1 ml-3 text-base"
      />
    </View>
  );
}
