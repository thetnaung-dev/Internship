import { router } from "expo-router";
import { ChevronLeft, Send } from "lucide-react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContactAgentScreen() {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-4 py-4 flex-row items-center bg-white border-b border-slate-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-slate-100"
        >
          <ChevronLeft size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800 ml-4">Contact Agent</Text>
      </View>
      <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
        <Text className="text-slate-600 font-semibold mb-2 mt-6">Your Message</Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Write your message..."
          multiline
          numberOfLines={6}
          className="bg-white border border-slate-200 rounded-xl px-4 py-4 text-slate-800"
          style={{ minHeight: 120, textAlignVertical: "top" }}
        />
        <TouchableOpacity className="bg-amber-500 py-4 rounded-xl items-center flex-row justify-center mt-6">
          <Send size={20} color="#fff" />
          <Text className="text-white font-bold ml-2">Send Message</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
