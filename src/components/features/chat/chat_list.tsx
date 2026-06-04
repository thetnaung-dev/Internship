import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
} from "react-native";

export default function ChatList() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("conversations")
        .select(
          `
          id,
          participant_1,
          participant_2,
          properties (title_en),
          p1:profiles!conversations_participant_1_fkey (full_name, id),
          p2:profiles!conversations_participant_2_fkey (full_name, id),
          messages (content, created_at)
        `,
        )
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order("created_at", { foreignTable: "messages", ascending: false });

      if (error) {
        console.error("Supabase Error:", error);
      } else {
        setConversations(data || []);
      }
      setLoading(false);
    }

    fetchData();
  }, []);

  if (loading) return <ActivityIndicator className="flex-1" />;

  return (
    <FlatList
      data={conversations}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        // Helper to extract profile data if it returns as an array or object
        const getProfile = (data: any) =>
          Array.isArray(data) ? data[0] : data;

        const p1 = getProfile(item.p1);
        const p2 = getProfile(item.p2);

        // Determine who the "other" user is by comparing the participant IDs
        const otherUser = item.participant_1 === currentUser?.id ? p2 : p1;

        return (
          <TouchableOpacity
            className="p-4 border-b border-slate-100 bg-white"
            onPress={() =>
              router.push({
                pathname: "/chat",
                params: { conversationId: item.id },
              })
            }
          >
            <Text className="font-bold text-lg">
              {item.properties?.title_en || "Chat"}
            </Text>

            <Text className="text-blue-600 font-medium text-sm mt-1">
              Chatting with: {otherUser?.full_name || "Unknown"}
            </Text>

            <Text className="text-slate-500 text-sm mt-1" numberOfLines={1}>
              {item.messages?.[0]?.content || "No messages yet"}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}
