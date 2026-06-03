import ChatList from "@/components/features/chat/chat_screen";
import { View } from "react-native";

export default function ChatTab() {
  return (
    <View className="flex-1 bg-white">
      <ChatList />
    </View>
  );
}
