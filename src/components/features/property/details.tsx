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
    MapPin,
    Maximize2,
    MessageCircle,
    Minimize2,
    Navigation,
    Phone,
    ShowerHead,
    Star,
    X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    Linking,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

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
  const [alertDialog, setAlertDialog] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef<FlatList>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const HEADER_HEIGHT = 48;
  const HEADER_VISIBLE_OFFSET = 180;

  const headerBg = scrollY.interpolate({
    inputRange: [0, HEADER_VISIBLE_OFFSET],
    outputRange: ["transparent", "#dcfce7"],
    extrapolate: "clamp",
  });

  const headerBorderOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_VISIBLE_OFFSET],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [60, HEADER_VISIBLE_OFFSET],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const iconColor = scrollY.interpolate({
    inputRange: [0, HEADER_VISIBLE_OFFSET],
    outputRange: ["#ffffff", "#191D31"],
    extrapolate: "clamp",
  });

  const iconBg = scrollY.interpolate({
    inputRange: [0, HEADER_VISIBLE_OFFSET],
    outputRange: ["rgba(255,255,255,0.2)", "transparent"],
    extrapolate: "clamp",
  });

  const [headerIconColor, setHeaderIconColor] = useState("#ffffff");

  useEffect(() => {
    const c1 = iconColor.addListener(({ value }) => setHeaderIconColor(value));
    return () => {
      iconColor.removeListener(c1);
    };
  }, []);

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
      await supabase.from("saved_properties").delete().eq("id", savedId);
      setIsSaved(false);
      setSavedId(null);
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

  const windowHeight = Dimensions.get("window").height;

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            backgroundColor: headerBg,
          },
        ]}
      >
        <View
          className="flex-row items-center justify-between px-3"
          style={{ height: HEADER_HEIGHT }}
        >
          <Animated.View
            className="size-8 rounded-full items-center justify-center overflow-hidden"
            style={{ backgroundColor: iconBg }}
          >
            <TouchableOpacity
              onPress={onBack}
              className="size-8 items-center justify-center"
            >
              <ChevronLeft size={18} color={headerIconColor} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            className="flex-1 items-center justify-center px-2"
            style={{ opacity: titleOpacity }}
          >
            {property && (
              <Text className="text-primary-300 font-rubik-bold text-sm uppercase">
                {property.deal_type === "rent"
                  ? isBurmese
                    ? "ငှားရန်"
                    : "For Rent"
                  : isBurmese
                    ? "ရောင်းရန်"
                    : "For Sale"}
              </Text>
            )}
          </Animated.View>

          <Animated.View
            className="size-8 rounded-full items-center justify-center overflow-hidden"
            style={{ backgroundColor: iconBg }}
          >
            <TouchableOpacity
              onPress={toggleSave}
              className="size-8 items-center justify-center"
            >
              <Heart
                size={18}
                color={isSaved ? "#F75555" : headerIconColor}
                fill={isSaved ? "#F75555" : "transparent"}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
        <Animated.View
          className="h-[1px] bg-primary-200"
          style={{ opacity: headerBorderOpacity }}
        />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 bg-white"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        <View className="relative w-full" style={{ height: windowHeight / 2 }}>
          <FlatList
            ref={carouselRef}
            data={mediaDataset}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
              );
              setActiveImageIndex(idx);
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
            }}
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
                    style={{ width: SCREEN_WIDTH, height: windowHeight / 2 }}
                    resizeMode="cover"
                  />
                )}
              </TouchableOpacity>
            )}
          />

          <View className="absolute top-0 w-full h-32 bg-gradient-to-b from-black/50 to-transparent" />

          <View className="absolute bottom-5 left-5">
            <View className="bg-primary-300 px-4 py-2 rounded-full self-start">
              <Text className="text-white text-xs font-rubik-bold uppercase p-2 text-center">
                {property.deal_type === "rent"
                  ? isBurmese
                    ? "ငှားရန်"
                    : "For Rent"
                  : isBurmese
                    ? "ရောင်းရန်"
                    : "For Sale"}
              </Text>
            </View>
          </View>

          {mediaDataset.length > 1 && (
            <View className="absolute bottom-5 right-5">
              <View className="bg-black/50 px-3 py-1.5 rounded-full">
                <Text className="text-white text-xs font-rubik-medium">
                  {activeImageIndex + 1}/{mediaDataset.length}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="px-5 mt-4 flex gap-2">
          <View className="flex flex-row items-center gap-3">
            <View className="flex flex-row items-center px-4 py-2 bg-primary-100 rounded-full">
              <Text className="text-xs font-rubik-bold text-primary-300">
                {t(property.property_type || "premium")}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-1.5">
              <Star size={16} color="#22c55e" fill="#22c55e" />
              <Text className="text-black-200 text-sm font-rubik-medium">
                {property.rating || "5.0"}
              </Text>
            </View>
          </View>

          <Text className="text-2xl font-rubik-extrabold text-black-300 mt-1">
            {displayTitle}
          </Text>

          <View className="flex flex-row items-center mt-2 gap-2">
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10">
              <Bed size={18} color="#22c55e" />
            </View>
            <Text className="text-black-300 text-sm font-rubik-medium mr-3">
              {property.bedrooms || 0} {isBurmese ? "အိပ်ခန်း" : "Beds"}
            </Text>
            <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10">
              <ShowerHead size={18} color="#22c55e" />
            </View>
            <Text className="text-black-300 text-sm font-rubik-medium mr-3">
              {property.bathrooms || 0} {isBurmese ? "ရေချိုးခန်း" : "Baths"}
            </Text>
            {property.area_value && (
              <>
                <View className="flex flex-row items-center justify-center bg-primary-100 rounded-full size-10">
                  <Maximize2 size={16} color="#22c55e" />
                </View>
                <Text className="text-black-300 text-sm font-rubik-medium">
                  {property.area_value}{" "}
                  {property.area_unit === "sqft"
                    ? "Sqft"
                    : isBurmese
                      ? "ဧက"
                      : "Acre"}
                </Text>
              </>
            )}
          </View>

          <View className="w-full border-t border-primary-200 pt-6 mt-5">
            <Text className="text-black-300 text-xl font-rubik-bold mb-4">
              {isBurmese ? "ပိုင်ရှင်" : "Agent"}
            </Text>
            <View className="flex flex-row items-center justify-between">
              <View className="flex flex-row items-center">
                <View className="size-14 rounded-full bg-primary-100 items-center justify-center">
                  <Text className="text-primary-300 text-xl font-rubik-bold">
                    {(property.profiles?.full_name || "O")[0].toUpperCase()}
                  </Text>
                </View>
                <View className="flex flex-col items-start justify-center ml-3">
                  <Text className="text-lg text-black-300 font-rubik-bold">
                    {property.profiles?.full_name ||
                      (isBurmese ? "ပိုင်ရှင်" : "Owner")}
                  </Text>
                  <Text className="text-sm text-black-200 font-rubik-medium">
                    {property.search_value || property.phone || ""}
                  </Text>
                </View>
              </View>

              <View className="flex flex-row items-center gap-3">
                <TouchableOpacity
                  onPress={handleChatPress}
                  disabled={isNavigatingChat}
                  className="size-10 rounded-full bg-primary-100 items-center justify-center"
                >
                  <MessageCircle size={20} color="#22c55e" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL(
                      `tel:${property.search_value || property.phone}`,
                    )
                  }
                  className="size-10 rounded-full bg-primary-100 items-center justify-center"
                >
                  <Phone size={20} color="#22c55e" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="mt-6">
            <Text className="text-black-300 text-xl font-rubik-bold">
              {isBurmese ? "အကျဉ်းချုပ်" : "Overview"}
            </Text>
            <Text className="text-black-200 text-base font-rubik mt-2 leading-6">
              {property.description ||
                (isBurmese
                  ? "အသေးစိတ်အချက်အလက်မရှိသေးပါ"
                  : "No description available.")}
            </Text>
          </View>

          {property.latitude && property.longitude && (
            <View className="mt-6">
              <Text className="text-black-300 text-xl font-rubik-bold">
                {isBurmese ? "တည်နေရာ" : "Location"}
              </Text>
              <View className="flex flex-row items-center justify-start mt-3 gap-2">
                <MapPin size={20} color="#22c55e" />
                <Text className="text-black-200 text-sm font-rubik-medium flex-1">
                  {displayLocation}
                </Text>
              </View>
              <View className="rounded-2xl overflow-hidden border border-primary-200 mt-3">
                <MapView
                  style={{ width: "100%", height: 180 }}
                  initialRegion={{
                    latitude: property.latitude,
                    longitude: property.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: property.latitude,
                      longitude: property.longitude,
                    }}
                    title={displayTitle}
                  />
                </MapView>
                <TouchableOpacity
                  onPress={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`;
                    Linking.openURL(url);
                  }}
                  className="flex-row items-center justify-center py-3 bg-primary-100 gap-2"
                >
                  <Navigation size={16} color="#22c55e" />
                  <Text className="text-primary-300 font-rubik-bold text-sm">
                    {isBurmese ? "လမ်းညွှန်ချက်များ" : "Get Directions"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View className="absolute bg-white bottom-0 w-full rounded-t-2xl border-t border-primary-200 p-5">
        <View className="flex flex-row items-center justify-between gap-4">
          <View className="flex flex-col items-start">
            <Text className="text-black-200 text-xs font-rubik-medium">
              {isBurmese ? "စျေးနှုန်း" : "Price"}
            </Text>
            <Text className="text-primary-300 text-2xl font-rubik-bold">
              {displayPrice}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleChatPress}
            disabled={isNavigatingChat}
            className="flex-1 flex flex-row items-center justify-center bg-primary-300 py-4 rounded-full shadow-md"
          >
            {isNavigatingChat ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white text-base font-rubik-bold">
                {isBurmese ? "စာပို့ရန်" : "Send Message"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

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
        height: Dimensions.get("window").height / 2,
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
