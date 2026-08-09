import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useThemeStore } from "@/shared/store/useThemeStore";
import { ChatList } from "@/features/chat/chat_list";

export default function TabChatScreen() {
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const isDark = resolvedTheme === "dark";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#111827" : "#fff" }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ChatList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
