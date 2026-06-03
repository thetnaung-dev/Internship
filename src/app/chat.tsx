import ChatScreen from "@/components/features/chat/chat_screen";
import { useLocalSearchParams } from "expo-router";

export default function ChatPage() {
  const params = useLocalSearchParams();
  // Pass params to your existing screen component
  return <ChatScreen />;
}
