import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationSettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-black">
      <View className="px-4 py-4 flex-row items-center bg-white dark:bg-gray-900 border-b border-slate-100 dark:border-gray-800">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-primary-100 dark:bg-gray-800"
        >
          <ChevronLeft size={24} color="#22c55e" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-slate-800 dark:text-gray-100 ml-4">Notifications</Text>
      </View>
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-gray-800 mt-6">
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-gray-800">
            <View>
              <Text className="text-slate-700 dark:text-gray-200 font-semibold">Push Notifications</Text>
              <Text className="text-slate-400 dark:text-gray-400 text-xs mt-0.5">Receive alerts on your device</Text>
            </View>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ false: "#d1d5db", true: "#22c55e" }} thumbColor="#fff" />
          </View>
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-gray-800">
            <View>
              <Text className="text-slate-700 dark:text-gray-200 font-semibold">Email Notifications</Text>
              <Text className="text-slate-400 dark:text-gray-400 text-xs mt-0.5">Receive updates via email</Text>
            </View>
            <Switch value={emailEnabled} onValueChange={setEmailEnabled} trackColor={{ false: "#d1d5db", true: "#22c55e" }} thumbColor="#fff" />
          </View>
          <View className="flex-row items-center justify-between px-5 py-4">
            <View>
              <Text className="text-slate-700 dark:text-gray-200 font-semibold">SMS Notifications</Text>
              <Text className="text-slate-400 dark:text-gray-400 text-xs mt-0.5">Receive alerts via SMS</Text>
            </View>
            <Switch value={smsEnabled} onValueChange={setSmsEnabled} trackColor={{ false: "#d1d5db", true: "#22c55e" }} thumbColor="#fff" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
