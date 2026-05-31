import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";

import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

interface CreatePostFormProps {
  dealType: string;
  dealTitle: string;
  onBack: () => void;
}

export default function CreatePostForm({
  dealType,
  dealTitle,
  onBack,
}: CreatePostFormProps) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    Alert.alert("Success", `Category: ${dealType}\nTitle: ${title}`);

    // Add Supabase insert here
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-amber-500 px-4 py-4 flex-row items-center">
        <TouchableOpacity onPress={onBack}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>

        <Text className="text-white text-lg font-bold ml-3">{dealTitle}</Text>
      </View>

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        <View className="mb-4">
          <Text className="font-bold mb-2">ခေါင်းစဉ်</Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="ခေါင်းစဉ်"
            className="bg-white border border-slate-200 rounded-xl p-4"
          />
        </View>

        <View className="mb-4">
          <Text className="font-bold mb-2">စျေးနှုန်း</Text>

          <TextInput
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="1500"
            className="bg-white border border-slate-200 rounded-xl p-4"
          />
        </View>

        <View className="mb-4">
          <Text className="font-bold mb-2">တည်နေရာ</Text>

          <TextInput
            value={location}
            onChangeText={setLocation}
            placeholder="ရန်ကုန်"
            className="bg-white border border-slate-200 rounded-xl p-4"
          />
        </View>

        <View className="mb-4">
          <Text className="font-bold mb-2">ဖုန်းနံပါတ်</Text>

          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="09xxxxxxxxx"
            className="bg-white border border-slate-200 rounded-xl p-4"
          />
        </View>

        <View className="mb-6">
          <Text className="font-bold mb-2">အသေးစိတ်</Text>

          <TextInput
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            placeholder="အသေးစိတ်ရေးပါ"
            className="bg-white border border-slate-200 rounded-xl p-4 h-32"
          />
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-amber-500 rounded-xl p-4 items-center"
        >
          <Text className="text-white font-bold">ကြော်ငြာတင်မည်</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
