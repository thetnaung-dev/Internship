import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import {
  ChevronLeft,
  FileText,
  ImageIcon,
  Paperclip,
  Send,
  Video,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_FILE_SIZE = 300 * 1024 * 1024;

interface MessageAttachment {
  url: string;
  type: string;
  name: string;
  size: number;
}

interface Message {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
  attachment?: MessageAttachment | null;
}

interface ChatRoomScreenProps {
  channelId: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "file";
}

export default function ChatRoomScreen({ channelId }: ChatRoomScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [otherName, setOtherName] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<{
    uri: string;
    name: string;
    type: string;
    size: number;
  } | null>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user || !channelId) return;

        setUserId(user.id);

        const { data: conv, error: convErr } = await supabase
          .from("conversations")
          .select("*, seller:profiles!conversations_seller_id_fkey(full_name), buyer:profiles!conversations_buyer_id_fkey(full_name)")
          .eq("id", channelId)
          .single();

        if (convErr) throw convErr;

        await supabase
          .from("conversations")
          .update({ unread: false })
          .eq("id", channelId);

        const otherId = conv.buyer_id === user.id ? conv.seller_id : conv.buyer_id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", otherId)
          .single();

        setOtherName(profile?.full_name || "Unknown");

        const { data: msgs, error: msgErr } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", channelId)
          .order("created_at", { ascending: true });

        if (msgErr) throw msgErr;
        if (mounted) setMessages(msgs || []);
      } catch (err) {
        console.error("Error loading chat:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, [channelId]);

  useEffect(() => {
    if (!channelId) return;

    const channel = supabase
      .channel(`messages:${channelId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${channelId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  const pickImage = async () => {
    setShowPicker(false);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
        Alert.alert("File too large", "Maximum file size is 300 MB.");
        return;
      }
      setPendingAttachment({
        uri: asset.uri,
        name: asset.fileName || `file.${asset.uri.split(".").pop() || "jpg"}`,
        type: asset.mimeType || "image/jpeg",
        size: asset.fileSize || 0,
      });
    }
  };

  const pickDocument = async () => {
    setShowPicker(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.size && asset.size > MAX_FILE_SIZE) {
          Alert.alert("File too large", "Maximum file size is 300 MB.");
          return;
        }
        setPendingAttachment({
          uri: asset.uri,
          name: asset.name,
          type: asset.mimeType || "application/octet-stream",
          size: asset.size || 0,
        });
      }
    } catch (err) {
      console.error("Error picking document:", err);
    }
  };

  const openPicker = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Photo Library", "Camera", "Document"],
          cancelButtonIndex: 0,
        },
        (index) => {
          if (index === 1) pickImage();
          else if (index === 2) takePhoto();
          else if (index === 3) pickDocument();
        },
      );
    } else {
      setShowPicker(true);
    }
  };

  const takePhoto = async () => {
    setShowPicker(false);
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
        Alert.alert("File too large", "Maximum file size is 300 MB.");
        return;
      }
      setPendingAttachment({
        uri: asset.uri,
        name: asset.fileName || `photo.${asset.uri.split(".").pop() || "jpg"}`,
        type: asset.mimeType || "image/jpeg",
        size: asset.fileSize || 0,
      });
    }
  };

  const removeAttachment = () => setPendingAttachment(null);

  const uploadAttachment = async (): Promise<MessageAttachment> => {
    if (!pendingAttachment || !userId) throw new Error("No attachment");

    const ext = pendingAttachment.uri.split(".").pop()?.toLowerCase() || "bin";
    const timestamp = Date.now();
    const fileName = `${userId}_${timestamp}.${ext}`;
    const filePath = `${channelId}/${fileName}`;

    const file = new FileSystem.File(pendingAttachment.uri);
    const arrayBuffer = await file.arrayBuffer();

    const { data, error } = await supabase.storage
      .from("chat-media")
      .upload(filePath, arrayBuffer, {
        upsert: false,
        contentType: pendingAttachment.type,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("chat-media")
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      type: pendingAttachment.type,
      name: pendingAttachment.name,
      size: pendingAttachment.size,
    };
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if ((!text && !pendingAttachment) || !userId || sending) return;

    setSending(true);
    const textToSend = text;
    const attachmentToSend = pendingAttachment;
    setInput("");
    setPendingAttachment(null);

    try {
      let attachmentData: MessageAttachment | null = null;
      if (attachmentToSend) {
        attachmentData = await uploadAttachment();
      }

      const { error } = await supabase.from("messages").insert({
        conversation_id: channelId,
        sender_id: userId,
        text: textToSend || "",
        attachment: attachmentData,
      });
      if (error) throw error;
    } catch (err) {
      console.error("Error sending message:", err);
      Alert.alert("Error", "Failed to send message. Please try again.");
      setInput(textToSend);
    } finally {
      setSending(false);
    }
  }, [input, userId, channelId, sending, pendingAttachment]);

  const renderAttachment = (att: MessageAttachment) => {
    const iconType = getFileIcon(att.type);

    if (iconType === "image") {
      return (
        <Image
          source={{ uri: att.url }}
          style={styles.attachmentImage}
          resizeMode="cover"
        />
      );
    }

    if (iconType === "video") {
      return (
        <View style={styles.attachmentVideo}>
          <Image
            source={{ uri: att.url }}
            style={styles.attachmentImage}
            resizeMode="cover"
          />
          <View style={styles.videoOverlay}>
            <Video size={32} color="#fff" />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.attachmentFile}>
        <FileText size={28} color="#64748b" />
        <Text style={styles.attachmentFileName} numberOfLines={1}>
          {att.name}
        </Text>
        <Text style={styles.attachmentFileSize}>{formatFileSize(att.size)}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerLeft}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {otherName}
          </Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        style={styles.flex}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
        renderItem={({ item }) => {
          const isMine = item.sender_id === userId;
          return (
            <View
              style={[
                styles.messageBubble,
                isMine ? styles.myMessage : styles.theirMessage,
              ]}
            >
              {item.attachment && renderAttachment(item.attachment)}
              {item.text ? (
                <Text
                  style={[
                    styles.messageText,
                    isMine ? styles.myMessageText : styles.theirMessageText,
                    item.attachment ? { marginTop: 6 } : undefined,
                  ]}
                >
                  {item.text}
                </Text>
              ) : null}
              <Text
                style={[
                  styles.messageTime,
                  isMine ? styles.myMessageTime : styles.theirMessageTime,
                ]}
              >
                {new Date(item.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          );
        }}
      />

      {pendingAttachment && (
        <View style={styles.attachmentPreview}>
          <Image
            source={{ uri: pendingAttachment.uri }}
            style={styles.attachmentPreviewImage}
            resizeMode="cover"
          />
          <View style={styles.attachmentPreviewInfo}>
            <Text style={styles.attachmentPreviewName} numberOfLines={1}>
              {pendingAttachment.name}
            </Text>
            <Text style={styles.attachmentPreviewSize}>
              {formatFileSize(pendingAttachment.size)}
            </Text>
          </View>
          <TouchableOpacity onPress={removeAttachment} style={styles.removeButton}>
            <X size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      )}

      <View
        style={[
          styles.inputBar,
          {
            paddingBottom: Math.max(insets.bottom, 8),
            marginBottom: keyboardHeight === 0 ? 0 : keyboardHeight + 12,
          },
        ]}
      >
        <TouchableOpacity onPress={openPicker} style={styles.attachButton}>
          <Paperclip size={22} color="#64748b" />
        </TouchableOpacity>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor="#94a3b8"
          style={styles.input}
          multiline
          maxLength={2000}
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={(!input.trim() && !pendingAttachment) || sending}
          style={[
            styles.sendButton,
            (!input.trim() && !pendingAttachment) && styles.sendButtonDisabled,
          ]}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Send size={20} color={(!input.trim() && !pendingAttachment) ? "#cbd5e1" : "#fff"} />
          )}
        </TouchableOpacity>
      </View>

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Attach File</Text>
            <TouchableOpacity style={styles.modalOption} onPress={pickImage}>
              <ImageIcon size={22} color="#f59e0b" />
              <Text style={styles.modalOptionText}>Photo Library</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={takePhoto}>
              <Camera size={22} color="#f59e0b" />
              <Text style={styles.modalOptionText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={pickDocument}>
              <FileText size={22} color="#f59e0b" />
              <Text style={styles.modalOptionText}>Document</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, { borderBottomWidth: 0 }]}
              onPress={() => setShowPicker(false)}
            >
              <Text style={[styles.modalOptionText, { color: "#94a3b8" }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function Camera({ size, color }: { size: number; color: string }) {
  return <Text style={{ fontSize: size, color }}>📷</Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  headerLeft: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  messageList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageBubble: {
    maxWidth: "78%",
    marginVertical: 3,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#f59e0b",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e8f0",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#fff",
  },
  theirMessageText: {
    color: "#0f172a",
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  myMessageTime: {
    color: "rgba(255,255,255,0.7)",
  },
  theirMessageTime: {
    color: "#94a3b8",
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    alignSelf: "center",
  },
  attachmentVideo: {
    position: "relative",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 12,
  },
  attachmentFile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  attachmentFileName: {
    flex: 1,
    fontSize: 13,
    color: "#0f172a",
    fontWeight: "600",
  },
  attachmentFileSize: {
    fontSize: 11,
    color: "#94a3b8",
  },
  attachmentPreview: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 4,
    padding: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
  },
  attachmentPreviewImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  attachmentPreviewInfo: {
    flex: 1,
    marginLeft: 10,
  },
  attachmentPreviewName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  attachmentPreviewSize: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  attachButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: "#0f172a",
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#f1f5f9",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 16,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f1f5f9",
    gap: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "500",
  },
});
