import ChatScreen from "@/components/features/chat/chat_screen";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ChatPage() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const receiverName = params.receiverName as string;

  return <ChatScreen />;
}
