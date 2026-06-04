import { supabase } from "@/lib/supabase";
import { RealtimePostgresInsertPayload } from "@supabase/supabase-js";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, Send } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const conversationId = params.conversationId as string;
  const receiverName = params.receiverName as string;

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    let channel: any;

    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!isMounted) return;
      setCurrentUser(user);
      if (!user) return;
      if (!conversationId) return;

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching:", error);
        return;
      }
      setMessages(data || []);
      channel = supabase.channel(`chat:${conversationId}`);
      channel
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload: RealtimePostgresInsertPayload<any>) => {
            setMessages((prev) => {
              if (prev.find((m) => m.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          },
        )
        .subscribe((status: string) => {
          console.log("Subscription status:", status);
        });
    }

    init();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [conversationId]);
  const sendMessage = async () => {
    // 1. Validation
    if (!text.trim() || !conversationId || !currentUser) return;

    const messageContent = text; // Save the text to a variable
    setText(""); // Clear input immediately for better UX

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_id: currentUser.id,
        content: messageContent,
      })
      .select()
      .single();

    if (error) {
      console.error("Insert Error:", error);
      setText(messageContent);
    } else if (data) {
      setMessages((prev) => [...prev, data]);
    }
  };
  const formatMessageTime = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }} edges={["top"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        className="flex-1 bg-slate-50"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View className="flex-row items-center p-2 border-b border-slate-100 bg-white">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <ChevronLeft color="#000" size={28} />
          </TouchableOpacity>
          <Text className="flex-1 text-center font-semibold text-slate-700 mr-8">
            Chatting with {receiverName || "User"}
          </Text>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              className={`p-3 m-2 rounded-lg max-w-[80%] ${
                item.sender_id === currentUser?.id
                  ? "bg-blue-600 self-end"
                  : "bg-slate-300 self-start"
              }`}
            >
              <Text
                className={
                  item.sender_id === currentUser?.id
                    ? "text-white"
                    : "text-slate-800"
                }
              >
                {item.content}
              </Text>

              <Text
                className={`text-[10px] mt-1 ${
                  item.sender_id === currentUser?.id
                    ? "text-blue-100"
                    : "text-slate-500"
                } ${item.sender_id === currentUser?.id ? "text-right" : "text-left"}`}
              >
                {formatMessageTime(item.created_at)}
              </Text>
            </View>
          )}
        />

        <View className="p-4 bg-white flex-row items-center border-t border-slate-200">
          <TextInput
            className="flex-1 bg-slate-100 p-3 rounded-full mr-2"
            placeholder="Type a message..."
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity
            onPress={sendMessage}
            className="bg-blue-600 p-3 rounded-full"
          >
            <Send color="white" size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
