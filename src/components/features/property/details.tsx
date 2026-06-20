import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { VideoView, useVideoPlayer } from "expo-video";
import {
  Bed,
  ChevronLeft,
  Clock,
  Compass,
  Layers,
  MapPin,
  Maximize2,
  MessageCircle,
  Minimize2,
  Phone,
  ShowerHead,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

interface DetailsProps {
  propertyId: string;
  onBack: () => void;
}

const formatRelativeTime = (dateString: string, isBurmese: boolean) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return isBurmese ? "ခုနကတင်" : "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60)
    return isBurmese ? `${diffInMinutes} မိနစ်ခန့်က` : `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return isBurmese ? `${diffInHours} နာရီခန့်က` : `${diffInHours}h ago`;

  return date.toLocaleDateString(isBurmese ? "my-MM" : "en-US");
};

const isVideoFile = (url: string) => {
  if (!url) return false;
  const cleanUrl = url.split(/[?#]/)[0].toLowerCase();
  return (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".mov") ||
    cleanUrl.endsWith(".m4v") ||
    cleanUrl.endsWith(".3gp") ||
    cleanUrl.includes("video")
  );
};

export default function Details({ propertyId, onBack }: DetailsProps) {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const isBurmese = i18n.language === "mm" || i18n.language?.startsWith("my");
  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFullImage, setSelectedFullImage] = useState<string | null>(
    null,
  );
  const [isNavigatingChat, setIsNavigatingChat] = useState(false);

  const [isChatReady] = useState(true);

  useEffect(() => {
    async function fetchPropertyDetails() {
      if (!propertyId) return;
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("properties")
          .select(
            `
            *, 
            states_regions(name_en, name_mm), 
            townships(name_en, name_mm), 
            profiles(id, full_name)
          `,
          )
          .eq("id", propertyId)
          .single();

        if (error) throw error;
        setProperty(data);
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPropertyDetails();
  }, [propertyId]);

  const handleChatPress = async () => {
    try {
      setIsNavigatingChat(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert(
          isBurmese ? "အကောင့်ဝင်ရန်လိုအပ်သည်" : "Authentication Required",
          isBurmese
            ? "စာပို့ရန်အတွက် အရင်ဆုံးအကောင့်ဝင်ပေးပါ"
            : "Please log in to contact the seller.",
        );
        return;
      }

      if (user.id === property.user_id) {
        Alert.alert(
          isBurmese ? "သတိပေးချက်" : "Notice",
          isBurmese
            ? "သင့်ကိုယ်ပိုင်ကြော်ငြာကို စာပို့၍မရပါ"
            : "You cannot open a chat on your own property.",
        );
        return;
      }

      const { data: existing, error: findErr } = await supabase
        .from("conversations")
        .select("id")
        .eq("property_id", property.id)
        .eq("buyer_id", user.id)
        .eq("seller_id", property.user_id)
        .maybeSingle();

      if (findErr) throw findErr;

      let conversationId = existing?.id;

      if (!conversationId) {
        const { data: created, error: createErr } = await supabase
          .from("conversations")
          .insert({
            property_id: property.id,
            buyer_id: user.id,
            seller_id: property.user_id,
          })
          .select("id")
          .single();

        if (createErr) throw createErr;
        conversationId = created.id;

        const title = property.title_en || property.title_mm || "Property";
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          sender_id: user.id,
          text: `Hi! I'm interested in: ${title}`,
        });
      }

      router.push(`/chat/${conversationId}` as any);
    } catch (error: any) {
      console.error("Chat error:", error);
      Alert.alert(
        "Error",
        error?.message || "Could not start conversation.",
      );
    } finally {
      setIsNavigatingChat(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="small" color="#10b981" />
      </View>
    );
  }

  if (!property) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center p-6">
        <Text className="text-slate-500 font-bold text-center">
          {isBurmese
            ? "ကြော်ငြာအချက်အလက် ရှာမတွေ့ပါ။"
            : "Property details not found."}
        </Text>
        <TouchableOpacity
          onPress={onBack}
          className="mt-4 bg-slate-900 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold text-sm">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayTitle =
    isBurmese && property.title_mm
      ? property.title_mm
      : property.title_en || property.title_mm;
  const displayPrice =
    property.currency_unit === "lakhs"
      ? `${property.price} ${isBurmese ? "သိန်းကျပ်" : "Lakhs"}`
      : `$${property.price}`;
  const regionName = property.states_regions
    ? isBurmese && property.states_regions.name_mm
      ? property.states_regions.name_mm
      : property.states_regions.name_en
    : "";
  const townshipName = property.townships
    ? isBurmese && property.townships.name_mm
      ? property.townships.name_mm
      : property.townships.name_en
    : "";
  const displayLocation =
    townshipName && regionName
      ? `${townshipName}, ${regionName}`
      : "Yangon, Myanmar";

  let mediaDataset: string[] = [];
  if (property.video_url) mediaDataset.push(property.video_url);
  else if (property.video) mediaDataset.push(property.video);
  if (property.images && property.images.length > 0)
    mediaDataset = [...mediaDataset, ...property.images];
  if (mediaDataset.length === 0) mediaDataset = [DEFAULT_IMAGE];

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-slate-50"
      >
        <View className="relative h-80 w-full bg-slate-900">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
              );
              if (slide !== activeImageIndex) setActiveImageIndex(slide);
            }}
            scrollEventThrottle={16}
          >
            {mediaDataset.map((mediaUrl: string, idx: number) => {
              if (isVideoFile(mediaUrl)) {
                return (
                  <VideoItem
                    key={idx}
                    videoUrl={mediaUrl}
                    isActive={idx === activeImageIndex}
                  />
                );
              }
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.9}
                  onPress={() => {
                    setSelectedFullImage(mediaUrl);
                    setIsModalVisible(true);
                  }}
                >
                  <Image
                    source={{ uri: mediaUrl }}
                    style={{ width: SCREEN_WIDTH, height: 320 }}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            onPress={onBack}
            className="absolute top-4 left-4 w-10 h-10 items-center justify-center rounded-full bg-slate-900/40 backdrop-blur-md border border-white/20"
          >
            <ChevronLeft size={24} color="#ffffff" />
          </TouchableOpacity>

          <View className="absolute top-4 right-4 bg-emerald-600 px-3 py-1.5 rounded-full shadow-sm shadow-black/20">
            <Text className="text-white text-xs font-black uppercase tracking-wider">
              {t(
                property.deal_type === "rent"
                  ? "categories.for rent"
                  : "categories.for sale",
              )}
            </Text>
          </View>

          {mediaDataset.length > 1 && (
            <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-1.5">
              {mediaDataset.map((_: any, idx: number) => (
                <View
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${idx === activeImageIndex ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
                />
              ))}
            </View>
          )}
        </View>

        <View className="bg-white rounded-t-[32px] -mt-10 p-6 shadow-xl shadow-slate-200/50 min-h-[500px]">
          <View className="flex-row justify-between items-start mb-2">
            <View className="bg-amber-100 px-2.5 py-1 rounded-lg">
              <Text className="text-amber-700 text-xs font-bold uppercase">
                {t(property.property_type)}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-slate-400 font-mono text-xs">
                PROP-{10000 + (property.ad_number || 1)}
              </Text>
              <View className="flex-row items-center gap-1 mt-1">
                <Clock size={12} color="#94a3b8" />
                <Text className="text-slate-400 text-[10px]">
                  {formatRelativeTime(property.created_at, isBurmese)}
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-slate-900 text-2xl font-black tracking-tight mb-2 leading-tight">
            {displayTitle}
          </Text>
          <Text className="text-emerald-600 text-2xl font-black mb-4">
            {displayPrice}
          </Text>

          <View className="flex-row items-center border-b border-slate-100 pb-5 mb-5">
            <MapPin size={18} color="#64748b" />
            <Text
              className="text-slate-500 font-semibold text-sm ml-1.5 flex-1"
              numberOfLines={2}
            >
              {displayLocation}
            </Text>
          </View>

          <Text className="text-slate-800 font-bold text-base mb-3">
            {isBurmese ? "အချက်အလက်များ" : "Specifications"}
          </Text>
          <View className="flex-row flex-wrap gap-3 mb-6">
            <View style={styles.specBox}>
              <Bed size={20} color="#475569" />
              <Text style={styles.specVal}>
                {property.bedrooms || 0} {isBurmese ? "ခန်း" : "Beds"}
              </Text>
            </View>

            <View style={styles.specBox}>
              <ShowerHead size={20} color="#475569" />
              <Text style={styles.specVal}>
                {property.bathrooms || 0} {isBurmese ? "ခန်း" : "Baths"}
              </Text>
            </View>

            {property.area_value && (
              <View style={styles.specBox}>
                <Maximize2 size={18} color="#475569" />
                <Text style={styles.specVal}>
                  {property.area_value}{" "}
                  {property.area_unit === "sqft"
                    ? isBurmese
                      ? "စတုရန်းပေ"
                      : "Sqft"
                    : isBurmese
                      ? "ဧက"
                      : "Acre"}
                </Text>
              </View>
            )}

            {property.width && property.length && (
              <View style={styles.specBox}>
                <Compass size={18} color="#475569" />
                <Text style={styles.specVal}>
                  {property.width}ft x {property.length}ft
                </Text>
              </View>
            )}

            {property.floor && (
              <View style={styles.specBox}>
                <Layers size={18} color="#475569" />
                <Text style={styles.specVal} numberOfLines={1}>
                  {t(property.floor)}
                </Text>
              </View>
            )}
          </View>

          <Text className="text-slate-800 font-bold text-base mb-3">
            {isBurmese ? "ဆက်သွယ်ရန်" : "Contact Information"}
          </Text>
          <View className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 bg-slate-200 rounded-full items-center justify-center">
                <Phone size={18} color="#334155" />
              </View>
              <View>
                <Text className="text-slate-400 text-xs font-medium">
                  {isBurmese ? "ဖုန်းနံပါတ်" : "Phone Call Direct"}
                </Text>
                <Text className="text-slate-800 font-bold text-sm mt-0.5">
                  {property.search_value || property.phone}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER ACTIONS BAR */}
      <View className="px-6 py-4 bg-white border-t border-slate-100 flex-row items-center gap-4 shadow-2xl">
        <TouchableOpacity
          onPress={handleChatPress}
          disabled={isNavigatingChat}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isChatReady ? "#f1f5f9" : "#e2e8f0",
            paddingVertical: 16,
            borderRadius: 12,
            gap: 8,
            opacity: isNavigatingChat ? 0.6 : 1,
          }}
        >
          {isNavigatingChat ? (
            <ActivityIndicator size="small" color="#334155" />
          ) : (
            <>
              <MessageCircle
                size={18}
                color={isChatReady ? "#334155" : "#94a3b8"}
              />
              <Text
                style={{
                  color: isChatReady ? "#334155" : "#94a3b8",
                  fontWeight: "700",
                  fontSize: 16,
                }}
              >
                {isChatReady
                  ? isBurmese
                    ? "စာပို့ရန်"
                    : "Chat"
                  : isBurmese
                    ? "ချိတ်ဆက်နေဆဲ..."
                    : "Connecting..."}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            Linking.openURL(`tel:${property.search_value || property.phone}`)
          }
          className="flex-row items-center bg-emerald-600 px-6 py-4 rounded-xl gap-2 active:opacity-90 shadow-md shadow-emerald-100"
        >
          <Phone size={18} color="#fff" />
          <Text className="text-white font-bold text-base">
            {isBurmese ? "ဖုန်းခေါ်ဆိုရန်" : "Call Now"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* FULLIMAGE MODAL */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <StatusBar style="light" />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsModalVisible(false)}
          >
            <X size={26} color="#ffffff" />
          </TouchableOpacity>
          {selectedFullImage && (
            <Image
              source={{ uri: selectedFullImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

function VideoItem({
  videoUrl,
  isActive,
}: {
  videoUrl: string;
  isActive: boolean;
}) {
  const [isVideoFull, setIsVideoFull] = useState(false);
  const player = useVideoPlayer(videoUrl, (playerInstance) => {
    playerInstance.loop = true;
    playerInstance.muted = false;
  });

  useEffect(() => {
    if (!isActive && !isVideoFull) {
      player.pause();
    }
  }, [isActive, isVideoFull, player]);

  return (
    <View style={styles.videoWrapper}>
      <VideoView
        style={{ width: "100%", height: "100%" }}
        player={player}
        nativeControls={true}
        allowsFullscreen={false}
      />
      <TouchableOpacity
        onPress={() => setIsVideoFull(true)}
        activeOpacity={0.6}
        style={styles.squareFullBtn}
      >
        <Maximize2 size={16} color="#ffffff" />
      </TouchableOpacity>

      <Modal
        visible={isVideoFull}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setIsVideoFull(false)}
      >
        <View style={styles.fullVideoContainer}>
          <StatusBar style="light" />
          <VideoView
            style={{ width: "100%", height: "100%" }}
            player={player}
            nativeControls={true}
            allowsFullscreen={false}
          />
          <TouchableOpacity
            onPress={() => {
              setIsVideoFull(false);
              setTimeout(() => {
                player.play();
              }, 100);
            }}
            style={styles.customMinimizeBtn}
          >
            <Minimize2 size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  fullImage: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.8 },
  specBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    gap: 8,
    minWidth: "47%",
    flexGrow: 1,
  },
  specVal: { fontSize: 14, fontWeight: "700", color: "#334155" },
  videoWrapper: {
    width: SCREEN_WIDTH,
    height: 320,
    backgroundColor: "#000",
    position: "relative",
  },
  squareFullBtn: {
    position: "absolute",
    bottom: 50,
    right: 14,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: 36,
    height: 36,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    zIndex: 9999,
  },
  fullVideoContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  customMinimizeBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    padding: 12,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    zIndex: 9999,
  },
});
