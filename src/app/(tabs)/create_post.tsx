import CreatePostForm from "@/components/features/form/createpostform";
import {
  Building2,
  DollarSign,
  Home,
  Key,
  ShoppingCart,
} from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const categoryTitles: Record<string, string> = {
  sale: "အရောင်းကြော်ငြာ",
  rent: "အငှားကြော်ငြာ",
  hostel: "အဆောင်ကြော်ငြာ",
  want_to_buy: "ဝယ်လိုသည့်ကြော်ငြာ",
  want_to_rent: "ငှားရမ်းလိုသည့်ကြော်ငြာ",
};

export default function CreatePostScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  // Show CreatePostForm
  if (selectedCategory) {
    return (
      <CreatePostForm
        dealType={selectedCategory}
        dealTitle={categoryTitles[selectedCategory]}
        onBack={handleBack}
      />
    );
  }

  // Show Category Selection Screen
  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-center mb-6">
          ကြော်ငြာအမျိုးအစားရွေးချယ်ပါ
        </Text>

        <View className="flex-row flex-wrap justify-between">
          <CategoryCard
            title="ရောင်းရန်ရှိသည်"
            icon={<Home size={28} color="#f59e0b" />}
            onPress={() => handleCategorySelect("sale")}
          />

          <CategoryCard
            title="ငှားရန်ရှိသည်"
            icon={<Key size={28} color="#f59e0b" />}
            onPress={() => handleCategorySelect("rent")}
          />

          <CategoryCard
            title="အဆောင်(ငှားရန်)"
            icon={<Building2 size={28} color="#f59e0b" />}
            onPress={() => handleCategorySelect("hostel")}
          />

          <CategoryCard
            title="ဝယ်ချင်ပါသည်"
            icon={<ShoppingCart size={28} color="#f59e0b" />}
            onPress={() => handleCategorySelect("want_to_buy")}
          />

          <CategoryCard
            title="ငှားချင်ပါသည်"
            icon={<DollarSign size={28} color="#f59e0b" />}
            onPress={() => handleCategorySelect("want_to_rent")}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryCard({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-[48%] bg-white p-6 rounded-2xl items-center border border-slate-100 shadow-sm mb-4"
    >
      <View className="w-14 h-14 bg-amber-50 rounded-full items-center justify-center mb-3">
        {icon}
      </View>

      <Text className="text-center font-bold text-slate-700">{title}</Text>
    </TouchableOpacity>
  );
}
