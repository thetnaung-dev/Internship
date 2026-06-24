import { Button, ButtonText } from "@/components/features/ui/button/button";
import { Heading } from "@/components/features/ui/heading/heading";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { VideoView, useVideoPlayer } from "expo-video";
import {
  Bed,
  ChevronLeft,
  Heart,
  Home,
  MapPin,
  Maximize2,
  MessageCircle,
  Minimize2,
  Navigation,
  Phone,
  ShowerHead,
  Star,
  Trash2,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

interface DetailsProps {
  propertyId: string;
  onBack: () => void;
}

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
  const [isNavigatingChat, setIsNavigatingChat] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const carouselRef = useRef<FlatList>(null);

  useEffect(() => {
    const images = [];
    if (property?.video_url) images.push(property.video_url);
    else if (property?.video) images.push(property.video);
    if (property?.images) images.push(...property.images);
    const count = images.length || 1;
    if (count <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveImageIndex((prev) => {
        const next = (prev + 1) % count;
        carouselRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [property]);

  useEffect(() => {
    async function fetchPropertyDetails() {
      if (!propertyId) return;
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("properties")
          .select(
            `*, states_regions(name_en, name_mm), townships(name_en, name_mm), profiles(id, full_name)`,
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

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setCurrentUserId(user.id);
    });
  }, [propertyId]);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !propertyId) return;
      const { data } = await supabase
        .from("saved_properties")
        .select("id")
        .eq("user_id", user.id)
        .eq("property_id", propertyId)
        .maybeSingle();
      if (data) {
        setIsSaved(true);
        setSavedId(data.id);
      }
    })();
  }, [propertyId]);

  const toggleSave = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setAlertDialog({
        title: isBurmese ? "အကောင့်ဝင်ရန်လိုအပ်သည်" : "Authentication Required",
        message: isBurmese
          ? "သိမ်းရန် အကောင့်ဝင်ပေးပါ"
          : "Please log in to save properties.",
      });
      return;
    }
    if (isSaved && savedId) {
      const { error } = await supabase
        .from("saved_properties")
        .delete()
        .eq("id", savedId)
        .eq("user_id", user.id);
      if (!error) {
        setIsSaved(false);
        setSavedId(null);
      }
    } else {
      const { data } = await supabase
        .from("saved_properties")
        .insert({ user_id: user.id, property_id: propertyId })
        .select("id")
        .single();
      if (data) {
        setIsSaved(true);
        setSavedId(data.id);
      }
    }
  };

  const handleMarkAsSold = () => {
    Alert.alert(
      isBurmese ? "ရောင်းပြီးကြောင်းမှတ်သားရန်" : "Mark as Sold",
      isBurmese
        ? "ဤအိမ်ခြံမြေကို ရောင်းပြီးကြောင်း မှတ်သားလိုပါသလား?"
        : "Are you sure you want to mark this property as sold?",
      [
        { text: isBurmese ? "မလုပ်တော့ပါ" : "Cancel", style: "cancel" },
        {
          text: isBurmese ? "ရောင်းပြီးမှတ်သားရန်" : "Mark Sold",
          onPress: async () => {
            await supabase
              .from("properties")
              .update({ is_sold: true })
              .eq("id", propertyId);
            setProperty((prev: any) =>
              prev ? { ...prev, is_sold: true } : prev,
            );
          },
        },
      ],
    );
  };

  const handleDeleteProperty = () => {
    Alert.alert(
      isBurmese ? "ဖျက်မည်" : "Delete Property",
      isBurmese
        ? "ဤအိမ်ခြံမြေကို ဖျက်လိုပါသလား?"
        : "Are you sure you want to delete this property?",
      [
        { text: isBurmese ? "မလုပ်တော့ပါ" : "Cancel", style: "cancel" },
        {
          text: isBurmese ? "ဖျက်မည်" : "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase
              .from("properties")
              .delete()
              .eq("id", propertyId)
              .eq("user_id", currentUserId);
            if (!error) {
              onBack();
            }
          },
        },
      ],
    );
  };

  const handleChatPress = async () => {
    try {
      setIsNavigatingChat(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setAlertDialog({
          title: isBurmese
            ? "အကောင့်ဝင်ရန်လိုအပ်သည်"
            : "Authentication Required",
          message: isBurmese
            ? "စာပို့ရန်အတွက် အရင်ဆုံးအကောင့်ဝင်ပေးပါ"
            : "Please log in to contact the seller.",
        });
        return;
      }

      if (user.id === property.user_id) {
        setAlertDialog({
          title: isBurmese ? "သတိပေးချက်" : "Notice",
          message: isBurmese
            ? "သင့်ကိုယ်ပိုင်ကြော်ငြာကို စာပို့၍မရပါ"
            : "You cannot open a chat on your own property.",
        });
        return;
      }

      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("property_id", property.id)
        .eq("buyer_id", user.id)
        .eq("seller_id", property.user_id)
        .maybeSingle();

      let conversationId = existing?.id;

      if (!conversationId) {
        const { data: created } = await supabase
          .from("conversations")
          .insert({
            property_id: property.id,
            buyer_id: user.id,
            seller_id: property.user_id,
          })
          .select("id")
          .single();

        conversationId = created?.id;
        if (!conversationId) return;

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
      setAlertDialog({
        title: "Error",
        message: error?.message || "Could not start conversation.",
      });
    } finally {
      setIsNavigatingChat(false);
    }
  };

  const handleContact = () => {
    if (property.search_value || property.phone) {
      Linking.openURL(`tel:${property.search_value || property.phone}`);
    }
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveImageIndex(index);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setActiveImageIndex((prev) => {
          const next = (prev + 1) % mediaDataset.length;
          carouselRef.current?.scrollToIndex({
            index: next,
            animated: true,
          });
          return next;
        });
      }, 3000);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" className="text-primary-300" />
      </View>
    );
  }

  if (!property) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Text className="text-black-200 font-rubik-bold text-center">
          {isBurmese
            ? "ကြော်ငြာအချက်အလက် ရှာမတွေ့ပါ"
            : "Property details not found."}
        </Text>
        <TouchableOpacity
          onPress={onBack}
          className="mt-4 bg-primary-300 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-rubik-bold text-sm">
            {isBurmese ? "ပြန်သွားရန်" : "Go Back"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwner = currentUserId === property.user_id;
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

  const propertyTypeLabel =
    isBurmese && property.property_type
      ? property.property_type
      : property.property_type || "property";

  let mediaDataset: string[] = [];
  if (property.video_url) mediaDataset.push(property.video_url);
  else if (property.video) mediaDataset.push(property.video);
  if (property.images && property.images.length > 0)
    mediaDataset = [...mediaDataset, ...property.images];
  if (mediaDataset.length === 0) mediaDataset = [DEFAULT_IMAGE];

  const isLongDesc = (property.description?.length ?? 0) > 150;
  const displayDesc =
    expanded || !isLongDesc
      ? property.description
      : property.description?.slice(0, 150) + "...";

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    property.longitude - 0.003
  }%2C${property.latitude - 0.003}%2C${property.longitude + 0.003}%2C${
    property.latitude + 0.003
  }&layer=mapnik&marker=${property.latitude}%2C${property.longitude}`;

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel */}
        <View>
          <View style={{ opacity: property.is_sold ? 0.5 : 1 }}>
            <FlatList
              ref={carouselRef}
              data={mediaDataset}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              onScroll={onScroll}
              scrollEventThrottle={16}
              renderItem={({ item: mediaUrl, index }) => (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() => {
                    setPreviewIndex(index);
                    setIsModalVisible(true);
                  }}
                >
                  {isVideoFile(mediaUrl) ? (
                    <VideoItem
                      videoUrl={mediaUrl}
                      isActive={index === activeImageIndex}
                    />
                  ) : (
                    <Image
                      source={{ uri: mediaUrl }}
                      style={{
                        width: SCREEN_WIDTH,
                        height: SCREEN_HEIGHT / 2.5,
                      }}
                      resizeMode="cover"
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>

          {/* Image count badge */}
          {mediaDataset.length > 1 && (
            <View className="absolute bottom-3 right-4 bg-black/50 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-rubik-medium">
                {activeImageIndex + 1}/{mediaDataset.length}
              </Text>
            </View>
          )}

          {/* Dot indicators */}
          {mediaDataset.length > 1 && (
            <View className="absolute bottom-3 left-0 right-0 flex-row justify-center gap-1">
              {mediaDataset.map((_, i) => (
                <View
                  key={i}
                  className={`h-1.5 rounded-full ${
                    i === activeImageIndex
                      ? "w-4 bg-white"
                      : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </View>
          )}

          {/* Sold badge */}
          {property.is_sold && (
            <View className="absolute top-20 left-4">
              <View className="bg-red-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-rubik-bold uppercase">
                  {isBurmese ? "ရောင်းပြီး" : "Sold"}
                </Text>
              </View>
            </View>
          )}

          {/* Back + Save buttons */}
          <SafeAreaView className="absolute top-0 left-0 right-0">
            <View className="flex-row items-center justify-between px-4 pt-2">
              <TouchableOpacity
                onPress={onBack}
                className="w-10 h-10 bg-white rounded-full items-center justify-center"
                style={{ elevation: 3 }}
              >
                <ChevronLeft size={20} color="#191D31" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleSave}
                className="w-10 h-10 bg-white rounded-full items-center justify-center"
                style={{ elevation: 3 }}
              >
                <Heart
                  size={20}
                  color={isSaved ? "#EF4444" : "#191D31"}
                  fill={isSaved ? "#EF4444" : "transparent"}
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>

        {/* Content */}
        <View className="px-5 pt-5 pb-8">
          {/* Badges */}
          <View className="flex-row gap-2 mb-3 flex-wrap">
            <View className="bg-primary-100 px-3 py-1 rounded-full">
              <Text className="text-primary-300 text-xs font-rubik-semibold capitalize">
                {propertyTypeLabel}
              </Text>
            </View>
            {property.is_sold && (
              <View className="bg-red-50 px-3 py-1 rounded-full">
                <Text className="text-red-500 text-xs font-rubik-semibold">
                  {isBurmese ? "ရောင်းပြီး" : "Sold"}
                </Text>
              </View>
            )}
            <View className="flex-row items-center gap-1 bg-primary-100 px-3 py-1 rounded-full">
              <Star size={12} color="#22c55e" fill="#22c55e" />
              <Text className="text-primary-300 text-xs font-rubik-semibold">
                {property.rating || "5.0"}
              </Text>
            </View>
          </View>

          {/* Title + Price */}
          <Text className="text-2xl font-rubik-extrabold text-black-300 mb-1">
            {displayTitle}
          </Text>
          <Text className="text-primary-300 text-xl font-rubik-bold mb-4">
            {displayPrice}
          </Text>

          {/* Specs Row */}
          <View className="flex-row justify-between bg-primary-100 rounded-2xl p-4 mb-5">
            <SpecItem
              icon={<Bed size={20} color="#22c55e" />}
              label={isBurmese ? "အိပ်ခန်း" : "Beds"}
              value={`${property.bedrooms || 0}`}
            />
            <SpecItem
              icon={<ShowerHead size={20} color="#22c55e" />}
              label={isBurmese ? "ရေချိုးခန်း" : "Baths"}
              value={`${property.bathrooms || 0}`}
            />
            <SpecItem
              icon={<Maximize2 size={20} color="#22c55e" />}
              label={isBurmese ? "အကျယ်" : "Area"}
              value={
                property.area_value
                  ? `${property.area_value}${property.area_unit === "sqft" ? "ft²" : "A"}`
                  : "-"
              }
            />
            <SpecItem
              icon={<Home size={20} color="#22c55e" />}
              label={isBurmese ? "အမျိုးအစား" : "Type"}
              value={propertyTypeLabel}
            />
          </View>

          {/* Description */}
          <Text className="text-base font-rubik-bold text-black-300 mb-2">
            {isBurmese ? "အကျဉ်းချုပ်" : "Description"}
          </Text>
          <Text className="text-black-200 text-sm font-rubik leading-6 mb-1">
            {displayDesc || (isBurmese ? "အသေးစိတ်အချက်အလက်မရှိသေးပါ" : "No description available.")}
          </Text>
          {isLongDesc && (
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              <Text className="text-primary-300 text-sm font-rubik-semibold mb-5">
                {expanded
                  ? isBurmese ? "ရှင်းရှင်းပြရန်" : "Show less"
                  : isBurmese ? "ဆက်ဖတ်ရန်" : "Read more"}
              </Text>
            </TouchableOpacity>
          )}

          <View className="mb-5" />

          {/* Location */}
          <Text className="text-base font-rubik-bold text-black-300 mb-2">
            {isBurmese ? "တည်နေရာ" : "Location"}
          </Text>
          <View className="flex-row items-center gap-2 mb-4">
            <MapPin size={16} color="#666876" />
            <Text className="text-black-200 text-sm font-rubik flex-1">
              {displayLocation}
            </Text>
          </View>

          {/* Map Preview */}
          {property.latitude && property.longitude ? (
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/property/map?latitude=${property.latitude}&longitude=${property.longitude}&title=${encodeURIComponent(displayTitle)}&address=${encodeURIComponent(displayLocation)}` as any,
                )
              }
              activeOpacity={0.9}
              className="rounded-2xl overflow-hidden mb-6"
              style={{ height: 200 }}
            >
              <WebView
                source={{ uri: mapUrl }}
                style={{ flex: 1 }}
                scrollEnabled={false}
                pointerEvents="none"
              />
              <View className="absolute bottom-3 right-3 bg-white/90 px-3 py-1 rounded-full flex-row items-center gap-1">
                <Navigation size={12} color="#666876" />
                <Text className="text-black-200 text-xs font-rubik-medium">
                  {isBurmese ? "အကြည့်ချဲ့ရန်" : "Tap to expand"}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                const query = encodeURIComponent(displayLocation);
                Linking.openURL(
                  `https://www.google.com/maps/search/${query}`,
                );
              }}
              className="rounded-2xl overflow-hidden border border-primary-200 mb-6"
            >
              <View className="bg-primary-100 items-center justify-center py-10 gap-2">
                <MapPin size={40} color="#22c55e" />
                <Text className="text-black-200 text-sm font-rubik-medium text-center px-4">
                  {displayLocation}
                </Text>
              </View>
              <View className="flex-row items-center justify-center py-3 border-t border-primary-200 gap-2">
                <Navigation size={16} color="#22c55e" />
                <Text className="text-primary-300 font-rubik-bold text-sm">
                  {isBurmese ? "Google Maps တွင်ကြည့်ရန်" : "View on Google Maps"}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Agent Section */}
          <View className="flex-row items-center gap-3 mb-6">
            <View className="size-12 rounded-full bg-primary-100 items-center justify-center">
              <Text className="text-primary-300 text-lg font-rubik-bold">
                {(property.profiles?.full_name || "O")[0].toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-black-300 font-rubik-bold text-base">
                {property.profiles?.full_name ||
                  (isBurmese ? "ပိုင်ရှင်" : "Owner")}
              </Text>
              <Text className="text-black-100 text-sm font-rubik">
                {property.search_value || property.phone || ""}
              </Text>
            </View>
          </View>

          {/* Contact / Action Buttons */}
          {isOwner ? (
            <View className="flex-row gap-3">
              {!property.is_sold && (
                <TouchableOpacity
                  onPress={handleMarkAsSold}
                  className="flex-1 flex-row items-center justify-center gap-2 bg-amber-50 border border-amber-200 py-4 rounded-2xl"
                >
                  <Star size={18} color="#D97706" fill="#D97706" />
                  <Text className="text-amber-600 font-rubik-bold text-sm">
                    {isBurmese ? "ရောင်းပြီးမှတ်သားရန်" : "Mark as Sold"}
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleDeleteProperty}
                className="flex-1 flex-row items-center justify-center gap-2 bg-red-50 border border-red-100 py-4 rounded-2xl"
              >
                <Trash2 size={18} color="#EF4444" />
                <Text className="text-red-500 font-rubik-bold text-sm">
                  {isBurmese ? "ဖျက်မည်" : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleContact}
                className="flex-1 flex-row items-center justify-center gap-2 bg-primary-100 border border-primary-200 py-4 rounded-2xl"
              >
                <Phone size={18} color="#22c55e" />
                <Text className="text-primary-300 font-rubik-bold text-sm">
                  {isBurmese ? "ဖုန်းခေါ်ရန်" : "Call Now"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleChatPress}
                disabled={isNavigatingChat}
                className="flex-1 flex-row items-center justify-center gap-2 bg-primary-300 py-4 rounded-2xl"
              >
                {isNavigatingChat ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <MessageCircle size={18} color="#ffffff" />
                    <Text className="text-white font-rubik-bold text-sm">
                      {isBurmese ? "စာပို့ရန်" : "Chat"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Image Viewer Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-black">
          <StatusBar style="light" />
          <TouchableOpacity
            onPress={() => setIsModalVisible(false)}
            className="absolute top-14 right-5 z-10"
          >
            <X size={26} color="#ffffff" />
          </TouchableOpacity>

          <FlatList
            data={mediaDataset.filter((url: string) => !isVideoFile(url))}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={previewIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item: imgUrl }) => (
              <Image
                source={{ uri: imgUrl }}
                style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
                resizeMode="contain"
              />
            )}
          />
        </View>
      </Modal>

      {/* Alert Dialog */}
      <AlertDialog
        isOpen={!!alertDialog}
        onClose={() => setAlertDialog(null)}
        useRNModal={true}
      >
        <AlertDialog.Backdrop />
        <AlertDialog.Content className="p-6 rounded-3xl bg-white w-5/6 items-center shadow-xl">
          <AlertDialog.Header>
            <Heading>{alertDialog?.title || ""}</Heading>
          </AlertDialog.Header>
          <AlertDialog.Body>
            <Text className="text-center text-black-200">
              {alertDialog?.message || ""}
            </Text>
          </AlertDialog.Body>
          <AlertDialog.Footer className="w-full flex-row justify-center">
            <Button onPress={() => setAlertDialog(null)} className="flex-1">
              <ButtonText>OK</ButtonText>
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </View>
  );
}

function SpecItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="items-center gap-1">
      {icon}
      <Text className="text-black-300 font-rubik-bold text-sm">{value}</Text>
      <Text className="text-black-100 text-xs font-rubik">{label}</Text>
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
    <View
      style={{
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT / 2.5,
        backgroundColor: "#000",
        position: "relative",
      }}
    >
      <VideoView
        style={{ width: "100%", height: "100%" }}
        player={player}
        nativeControls={true}
        allowsFullscreen={false}
      />
      <TouchableOpacity
        onPress={() => setIsVideoFull(true)}
        activeOpacity={0.6}
        style={{
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
        }}
      >
        <Maximize2 size={16} color="#ffffff" />
      </TouchableOpacity>

      <Modal
        visible={isVideoFull}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setIsVideoFull(false)}
      >
        <View className="flex-1 bg-black justify-center items-center">
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
            className="absolute top-14 left-5 bg-slate-900/60 p-3 rounded-full border border-white/20 z-50"
          >
            <Minimize2 size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
