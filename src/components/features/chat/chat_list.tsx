import { supabase } from "@/lib/supabase";
import { router, useFocusEffect } from "expo-router";
import {
  Archive,
  BellOff,
  MessageCircle,
  Pin,
  Trash2,
  MailOpen,
} from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button, ButtonText } from "@/components/features/ui/button/button";
import { Heading } from "@/components/features/ui/heading/heading";

interface MessageSummary {
  text: string;
  created_at: string;
}

interface Conversation {
  id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  muted: boolean;
  archived: boolean;
  pinned: boolean;
  unread: boolean;
  messages?: MessageSummary[];
  other_user?: { full_name: string; avatar_url?: string | null };
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}

const ActionButton = ({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.actionButton, { backgroundColor: color }]}
    onPress={onPress}
  >
    {icon}
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

export function ChatList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, []),
  );

  const loadConversations = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        setUserId(null);
        return;
      }
      setUserId(user.id);

      const { data, error } = await supabase
        .from("conversations")
        .select(
          `id, buyer_id, seller_id, created_at, updated_at,
          muted, archived, pinned, unread,
          messages:messages!messages_conversation_id_fkey(text, created_at)`,
        )
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const enriched = await enrichConversations(data || [], user.id);
      setConversations(enriched);
    } catch (err) {
      console.error("Error loading conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const enrichConversations = async (
    convos: any[],
    uid: string,
  ): Promise<Conversation[]> => {
    return Promise.all(
      convos.map(async (c) => {
        const otherId = c.buyer_id === uid ? c.seller_id : c.buyer_id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", otherId)
          .single();
        return { ...c, other_user: profile || { full_name: "Unknown" } };
      }),
    );
  };

  const updateField = async (id: string, field: string, value: boolean) => {
    await supabase.from("conversations").update({ [field]: value }).eq("id", id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  };

  const closeSwipeable = (id: string) => {
    swipeableRefs.current.get(id)?.close();
  };

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>,
    item: Conversation,
  ) => {
    const iconColor = "#fff";
    return (
      <View style={styles.actionsContainer}>
        <ActionButton
          icon={<BellOff size={20} color={iconColor} />}
          label={item.muted ? "Unmute" : "Mute"}
          color="#f59e0b"
          onPress={() => {
            closeSwipeable(item.id);
            updateField(item.id, "muted", !item.muted);
          }}
        />
        <ActionButton
          icon={<Trash2 size={20} color={iconColor} />}
          label="Delete"
          color="#ef4444"
          onPress={() => {
            closeSwipeable(item.id);
            setDeleteTarget(item);
          }}
        />
        <ActionButton
          icon={<Archive size={20} color={iconColor} />}
          label={item.archived ? "Unarchive" : "Archive"}
          color="#64748b"
          onPress={() => {
            closeSwipeable(item.id);
            updateField(item.id, "archived", !item.archived);
          }}
        />
      </View>
    );
  };

  const renderLeftActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    _dragX: Animated.AnimatedInterpolation<number>,
    item: Conversation,
  ) => {
    const iconColor = "#fff";
    return (
      <View style={[styles.actionsContainer, { flexDirection: "row-reverse" }]}>
        <ActionButton
          icon={<MailOpen size={20} color={iconColor} />}
          label={item.unread ? "Read" : "Unread"}
          color="#3b82f6"
          onPress={() => {
            closeSwipeable(item.id);
            updateField(item.id, "unread", !item.unread);
          }}
        />
        <ActionButton
          icon={<Pin size={20} color={iconColor} />}
          label={item.pinned ? "Unpin" : "Pin"}
          color="#8b5cf6"
          onPress={() => {
            closeSwipeable(item.id);
            updateField(item.id, "pinned", !item.pinned);
          }}
        />
      </View>
    );
  };

  if (!userId) {
    return (
      <View style={styles.centerContainer}>
        <MessageCircle size={48} color="#cbd5e1" />
        <Text style={styles.emptyText}>Sign in to see your conversations.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={conversations.length === 0 ? styles.emptyList : undefined}
        ListEmptyComponent={
          <View style={styles.centerContainer}>
            <MessageCircle size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No conversations yet.</Text>
            <Text style={styles.emptySubtext}>
              Tap "Chat" on a property to start one.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const lastMsg = Array.isArray(item.messages)
            ? item.messages[item.messages.length - 1]
            : undefined;
          return (
            <Swipeable
              ref={(ref) => {
                if (ref) swipeableRefs.current.set(item.id, ref);
              }}
              renderRightActions={(p, d) => renderRightActions(p, d, item)}
              renderLeftActions={(p, d) => renderLeftActions(p, d, item)}
              overshootRight={false}
              overshootLeft={false}
            >
              <TouchableOpacity
                style={[
                  styles.conversationItem,
                  item.unread && styles.unreadItem,
                ]}
                onPress={() => router.push(`/chat/${item.id}` as any)}
              >
                <View style={styles.avatar}>
                  {item.other_user?.avatar_url ? (
                    <Image
                      source={{ uri: item.other_user.avatar_url }}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.avatarTextWrapper}>
                      <Text style={styles.avatarText}>
                        {(item.other_user?.full_name || "U").charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.conversationContent}>
                  <View style={styles.conversationTop}>
                    <Text
                      style={[
                        styles.otherName,
                        item.unread && styles.unreadText,
                      ]}
                      numberOfLines={1}
                    >
                      {item.other_user?.full_name || "Unknown"}
                    </Text>
                    <Text style={styles.timeText}>
                      {formatTime(lastMsg ? lastMsg.created_at : item.created_at)}
                    </Text>
                  </View>
                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {lastMsg?.text || "No messages yet"}
                  </Text>
                </View>
              </TouchableOpacity>
            </Swipeable>
          );
        }}
      />

      <AlertDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        useRNModal={true}
      >
        <AlertDialog.Backdrop />
        <AlertDialog.Content className="p-6 rounded-3xl bg-white w-5/6 items-center shadow-xl">
          <AlertDialog.Header>
            <Heading>Delete Conversation</Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <Text className="text-center text-slate-500">
              Are you sure you want to delete this conversation?
            </Text>
          </AlertDialog.Body>
          <AlertDialog.Footer className="w-full flex-row gap-2">
            <Button
              onPress={() => setDeleteTarget(null)}
              className="flex-1 mr-2"
            >
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              onPress={async () => {
                if (!deleteTarget) return;
                await supabase
                  .from("conversations")
                  .delete()
                  .eq("id", deleteTarget.id);
                setDeleteTarget(null);
                loadConversations();
              }}
              className="bg-red-500 flex-1"
            >
              <ButtonText>Delete</ButtonText>
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: "#fff" },
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  emptyList: { flexGrow: 1 },
  emptyText: {
    color: "#94a3b8",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  emptySubtext: {
    color: "#cbd5e1",
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  conversationItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f1f5f9",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  unreadItem: {
    backgroundColor: "#f0f9ff",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: 48,
    height: 48,
  },
  avatarTextWrapper: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  conversationContent: {
    flex: 1,
    justifyContent: "center",
  },
  conversationTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  otherName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    fontWeight: "800",
  },
  timeText: {
    fontSize: 11,
    color: "#94a3b8",
  },
  lastMessage: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  actionButton: {
    width: 72,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 4,
  },
  actionLabel: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
});
