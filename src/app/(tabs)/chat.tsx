import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChatList } from "../../components/features/chat/chat_list";

export default function TabChatScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ChatList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});
