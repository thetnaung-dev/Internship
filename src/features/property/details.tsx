import { supabase } from "@/shared/lib/supabase";
import { useRouter, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Bed,
  Building,
  Car,
  ChevronDown,
  ChevronUp,
  Eye,
  Home,
  MapPin,
  Maximize2,
  MessageCircle,
  Navigation,
  Phone,
  Ruler,
  ShowerHead,
  Star,
  CheckCircle,
  Hash,
  Layers,
  LampCeiling,
  Clock,
  LandPlot,
  Building2,
  ChevronRight,
  Flag,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { ReportModal } from "@/features/report/ReportModal";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const GREEN = "#22c55e";
const GREEN_LIGHT = "#dcfce7";
const GRAY = "#8C8E98";
const GRAY_LIGHT = "#F5F5F7";
const GRAY_BORDER = "#E8E8ED";
const TEXT_PRIMARY = "#191D31";
const TEXT_SECONDARY = "#666876";
const CARD_RADIUS = 16;
const IMG_HEIGHT = SCREEN_HEIGHT / 2.5;
const HEADER_TRANSITION = IMG_HEIGHT * 0.65;
const STATUSBAR_HEIGHT = Platform.OS === "android" ? 6 : 20;

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

function AnimatedHeaderIcon({ Icon, size, scrollY }: { Icon: any; size: number; scrollY: SharedValue<number> }) {
  const whiteStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, HEADER_TRANSITION], [1, 0], Extrapolation.CLAMP),
  }));
  const darkStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, HEADER_TRANSITION], [0, 1], Extrapolation.CLAMP),
  }));
  return (
    <View>
      <Animated.View style={[{ position: "absolute" }, whiteStyle]}>
        <Icon size={size} color="#fff" />
      </Animated.View>
      <Animated.View style={darkStyle}>
        <Icon size={size} color={TEXT_PRIMARY} />
      </Animated.View>
    </View>
  );
}

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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center py-2.5">
      <View
        className="w-9 h-9 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: GREEN_LIGHT }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-xs font-rubik-medium" style={{ color: GRAY }}>
          {label}
        </Text>
        <Text
          className="text-sm font-rubik-semibold mt-0.5"
          style={{ color: TEXT_PRIMARY }}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

function FeatureChip({ label }: { label: string }) {
  return (
    <View
      className="flex-row items-center px-3.5 py-2 rounded-full mr-2 mb-2"
      style={{ backgroundColor: GREEN_LIGHT }}
    >
      <CheckCircle size={13} color={GREEN} style={{ marginRight: 5 }} />
      <Text className="text-xs font-rubik-medium" style={{ color: TEXT_SECONDARY }}>
        {label}
      </Text>
    </View>
  );
}

function SkeletonBlock({ height, width }: { height: number; width?: number | string }) {
  return (
    <View style={{ width: width || "100%" } as any}>
      <View
        className="rounded-2xl"
        style={{
          height,
          backgroundColor: GRAY_LIGHT,
        }}
      />
    </View>
  );
}

function SkeletonScreen() {
  return (
    <View className="flex-1 bg-white px-5 pt-16">
      <SkeletonBlock height={220} />
      <View className="mt-4">
        <SkeletonBlock height={20} width="60%" />
      </View>
      <View className="mt-3">
        <SkeletonBlock height={40} width="40%" />
      </View>
      <View className="mt-4">
        <SkeletonBlock height={100} />
      </View>
      <View className="mt-4">
        <SkeletonBlock height={80} />
      </View>
    </View>
  );
}

export default function Details({ propertyId, onBack }: DetailsProps) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const isBurmese = i18n.language === "mm" || i18n.language?.startsWith("my");

  const [property, setProperty] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [relatedProperties, setRelatedProperties] = useState<any[]>([]);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [agent, setAgent] = useState<any>(null);
  const [showReport, setShowReport] = useState(false);

  const carouselRef = useRef<FlatList>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, HEADER_TRANSITION], [0, 1], Extrapolation.CLAMP),
  }));

  const headerShadowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, HEADER_TRANSITION], [0, 1], Extrapolation.CLAMP),
  }));

  const headerTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, HEADER_TRANSITION], [0, 1], Extrapolation.CLAMP),
  }));

  const headerIconBgStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, HEADER_TRANSITION], [1, 0], Extrapolation.CLAMP),
  }));


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
            `*, states_regions(name_en, name_mm), townships(name_en, name_mm), profiles(id, full_name, avatar_url, phone)`,
          )
          .eq("id", propertyId)
          .single();

        if (error) throw error;
        setProperty(data);

        if (data?.user_id) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, phone")
            .eq("id", data.user_id)
            .single();
          setAgent(profileData);
        }
      } catch (err) {
        console.error("Error fetching:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPropertyDetails();
  }, [propertyId]);

  useEffect(() => {
    async function fetchRelated() {
      if (!property?.township_id) return;
      const { data } = await supabase
        .from("properties")
        .select("*, states_regions(name_en, name_mm), townships(name_en, name_mm)")
        .eq("township_id", property.township_id)
        .neq("id", propertyId)
        .eq("is_sold", false)
        .order("created_at", { ascending: false })
        .limit(10);
      setRelatedProperties(data || []);
    }
    fetchRelated();
  }, [property?.township_id, propertyId]);

  useFocusEffect(
    React.useCallback(() => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setCurrentUserId(user.id);
          supabase
            .rpc("increment_property_views", { property_view_id: propertyId })
            .then(({ error }) => {
              if (error) console.error("View increment error:", error);
            });
        }
      });
    }, [propertyId]),
  );

  const handleContact = () => {
    const phone = property.search_value || property.phone || agent?.phone;
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleChatPress = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    if (user.id === property.user_id) return;
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
      if (conversationId) {
        const title = property.title_en || property.title_mm || "Property";
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          sender_id: user.id,
          text: `Hi! I'm interested in: ${title}`,
        });
      }
    }
    if (conversationId) router.push(`/chat/${conversationId}` as any);
  };

  const handleReportPress = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    setShowReport(true);
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveImageIndex(index);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setActiveImageIndex((prev) => {
          const next = (prev + 1) % mediaDataset.length;
          carouselRef.current?.scrollToIndex({ index: next, animated: true });
          return next;
        });
      }, 3000);
    }
  };

  if (isLoading) return <SkeletonScreen />;

  if (!property) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Text className="font-rubik-bold text-center" style={{ color: TEXT_SECONDARY }}>
          {isBurmese ? "ကြော်ငြာအချက်အလက် ရှာမတွေ့ပါ" : "Property details not found."}
        </Text>
        <TouchableOpacity
          onPress={onBack}
          className="mt-6 px-8 py-3 rounded-full"
          style={{ backgroundColor: GREEN }}
        >
          <Text className="text-white font-rubik-bold text-sm">
            {isBurmese ? "ပြန်သွားရန်" : "Go Back"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwner = currentUserId === property.user_id;
  const propertyTypeMap: Record<string, string> = {
    apartment: "တိုက်ခန်း",
    condo: "ကွန်ဒို",
    house: "လုံးချင်းအိမ်",
    land: "မြေကွက်",
    hostel: "အဆောင်",
  };

  const displayTitle =
    isBurmese && property.title_mm
      ? property.title_mm
      : property.title_en || property.title_mm;

  const displayPrice =
    property.currency_unit === "lakhs"
      ? `${property.price} ${isBurmese ? "သိန်း (ကျပ်)" : "Lakhs"}`
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
    townshipName && regionName ? `${townshipName}, ${regionName}` : "Yangon, Myanmar";

  const dealTypeLabel =
    property.deal_type === "rent"
      ? isBurmese
        ? "ငှားရန်ရှိသည်"
        : "For Rent"
      : isBurmese
        ? "ရောင်းရန်ရှိသည်"
        : "For Sale";

  const similarDealText = property.deal_type === "rent" ? "ငှားရန်" : "ရောင်းရန်";
  const similarHeading = townshipName
    ? `${townshipName} ${similarDealText} အိမ်ခြံမြေများ`
    : `${similarDealText} အိမ်ခြံမြေများ`;

  const propertyTypeLabel =
    propertyTypeMap[property.property_type] || property.property_type || "Property";

  let mediaDataset: string[] = [];
  if (property.video_url) mediaDataset.push(property.video_url);
  else if (property.video) mediaDataset.push(property.video);
  if (property.images && property.images.length > 0)
    mediaDataset = [...mediaDataset, ...property.images];
  if (mediaDataset.length === 0) mediaDataset = [DEFAULT_IMAGE];
  const isLongDesc = (property.description?.length ?? 0) > 100;

  const mapUrl = property.latitude && property.longitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${property.longitude - 0.003}%2C${property.latitude - 0.003}%2C${property.longitude + 0.003}%2C${property.latitude + 0.003}&layer=mapnik&marker=${property.latitude}%2C${property.longitude}`
    : null;

  const features = [
    property.air_conditioning && "Air Conditioning",
    property.balcony && "Balcony",
    property.garden && "Garden",
    property.water_supply && "Water Supply",
    property.electricity && "Electricity",
    property.security && "Security",
    property.internet && "Internet",
    property.car_parking && "Car Parking",
  ].filter(Boolean) as string[];

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* ── Floating Header ── */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        }}
      >
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#4ade80",
            },
            headerBgStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: GRAY_BORDER,
            },
            headerShadowStyle,
          ]}
        />
        <View style={{ paddingTop: STATUSBAR_HEIGHT }}>
          <View className="flex-row items-center justify-between px-2" style={{ height: 32 }}>
            <TouchableOpacity
              onPress={onBack}
              className="items-center justify-center"
              style={{ width: 32, height: 32, borderRadius: 16 }}
            >
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: "rgba(0,0,0,0.3)",
                  },
                  headerIconBgStyle,
                ]}
              />
              <AnimatedHeaderIcon Icon={ArrowLeft} size={20} scrollY={scrollY} />
            </TouchableOpacity>

            <Animated.Text
              numberOfLines={1}
              style={[
                {
                  flex: 1,
                  textAlign: "center",
                  fontSize: 14,
                  fontFamily: "rubik-bold",
                  color: TEXT_PRIMARY,
                },
                headerTitleStyle,
              ]}
            >
{dealTypeLabel}
            </Animated.Text>

            <View className="flex-row gap-1">
              <TouchableOpacity
                onPress={handleReportPress}
                className="items-center justify-center"
                style={{ width: 32, height: 32, borderRadius: 16 }}
              >
                <Animated.View
                  style={[
                    {
                      position: "absolute",
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: "rgba(0,0,0,0.3)",
                    },
                    headerIconBgStyle,
                  ]}
                />
                <AnimatedHeaderIcon Icon={Flag} size={18} scrollY={scrollY} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Image Gallery ── */}
        <View>
          <FlatList
              ref={carouselRef}
              data={mediaDataset}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, i) => String(i)}
              onScroll={onScroll}
              scrollEventThrottle={16}
              renderItem={({ item: mediaUrl }) => (
                <TouchableOpacity activeOpacity={1}>
                  {isVideoFile(mediaUrl) ? (
                    <View
                      style={{ width: SCREEN_WIDTH, height: IMG_HEIGHT, backgroundColor: "#000" }}
                    >
                      <Image
                        source={{ uri: "https://via.placeholder.com/800x600?text=Video" }}
                        style={{ width: SCREEN_WIDTH, height: IMG_HEIGHT }}
                        resizeMode="cover"
                      />
                    </View>
                  ) : (
                    <Image
                      source={{ uri: mediaUrl }}
                      style={{ width: SCREEN_WIDTH, height: IMG_HEIGHT }}
                      resizeMode="cover"
                    />
                  )}
                </TouchableOpacity>
              )}
            />

            {/* Page indicator */}
            <View
              className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full"
              style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
            >
              <Text className="text-white text-xs font-rubik-medium">
                {activeImageIndex + 1}/{mediaDataset.length}
              </Text>
            </View>

            {/* Dots */}
            {mediaDataset.length > 1 && (
              <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-1.5">
                {mediaDataset.map((_, i) => (
                  <View
                    key={i}
                    className="rounded-full"
                    style={{
                      width: i === activeImageIndex ? 20 : 6,
                      height: 6,
                      backgroundColor: i === activeImageIndex ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                    }}
                  />
                ))}
              </View>
            )}
          </View>

        {/* ── Property Header Card ── */}
        <Animated.View
          entering={FadeInUp.duration(500).delay(100)}
          className="mx-4 mt-4 px-5 pt-6 pb-5 rounded-[20px] bg-white"
          style={{
            elevation: 6,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
          }}
        >
          <Text
            className="font-rubik-bold leading-8"
            style={{ color: "#111827", fontSize: 22 }}
            numberOfLines={2}
          >
            {displayTitle}
          </Text>

          <View
            className="flex-row items-center justify-between mt-4 -mx-5 -mb-5 px-5 py-3 rounded-b-[20px]"
            style={{ backgroundColor: "#FB6C00" }}
          >
            <View className="flex-row items-center gap-2">
              <Clock size={15} color="#fff" />
              <Text className="font-rubik-medium" style={{ color: "#fff", fontSize: 14 }}>
                {property.created_at
                  ? new Date(property.created_at).toLocaleString(isBurmese ? "my-MM" : "en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Eye size={15} color="#fff" />
              <Text className="font-rubik-medium" style={{ color: "#fff", fontSize: 14 }}>
                {property.views ?? 0} {isBurmese ? "ကြည့်ရှုမှု" : "Views"}
              </Text>
            </View>
          </View>
        </Animated.View>

        <View className="px-4 mt-5">
          {/* ── Quick Info ── */}
          <Animated.View
            entering={FadeInUp.duration(400).delay(200)}
            className="rounded-2xl px-5 py-4 mb-5"
            style={{
              backgroundColor: "#fff",
              elevation: 3,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 10,
              borderWidth: 1,
              borderColor: GRAY_BORDER,
            }}
          >
            <Text className="text-base font-rubik-extrabold mb-3" style={{ color: TEXT_PRIMARY }}>
              {isBurmese ? "အချက်အလက်များ" : "Quick Info"}
            </Text>
            <View className="flex-row flex-wrap">
              <View className="w-1/2">
                <InfoRow
                  icon={<Hash size={16} color={GREEN} />}
                  label={isBurmese ? "အိမ်ခြံမြေကုဒ်" : "Property Code"}
                  value={`PROP-${10000 + (property.ad_number || 0)}`}
                />
                <InfoRow
                  icon={<Building2 size={16} color={GREEN} />}
                  label={isBurmese ? "အမျိုးအစား" : "Property Type"}
                  value={propertyTypeLabel}
                />
                <InfoRow
                  icon={<Home size={16} color={GREEN} />}
                  label={isBurmese ? "စျေးနှုန်း" : "Price"}
                  value={displayPrice}
                />
                <InfoRow
                  icon={<MapPin size={16} color={GREEN} />}
                  label={isBurmese ? "မြို့နယ်" : "Township"}
                  value={townshipName || "-"}
                />
                <InfoRow
                  icon={<Ruler size={16} color={GREEN} />}
                  label={isBurmese ? "ဧရိယာ" : "Area"}
                  value={
                    property.area_value
                      ? `${property.area_value} ${property.area_unit === "sqft" ? "sqft" : "Acre"}`
                      : "-"
                  }
                />
                {property.width && property.length && (
                  <InfoRow
                    icon={<LandPlot size={16} color={GREEN} />}
                    label={isBurmese ? "မြေအကျယ်" : "Land Size"}
                    value={`${property.width}×${property.length}ft`}
                  />
                )}
              </View>
              <View className="w-1/2">
                <InfoRow
                  icon={<Building size={16} color={GREEN} />}
                  label={isBurmese ? "အဆောက်အဦး" : "Building Type"}
                  value={property.building_type || propertyTypeLabel}
                />
                <InfoRow
                  icon={<Star size={16} color={GREEN} />}
                  label={isBurmese ? "ပိုင်ဆိုင်မှု" : "Ownership"}
                  value={property.ownership || "-"}
                />
                <InfoRow
                  icon={<Bed size={16} color={GREEN} />}
                  label={isBurmese ? "အိပ်ခန်း" : "Bedrooms"}
                  value={property.bedrooms ? `${property.bedrooms}` : "-"}
                />
                <InfoRow
                  icon={<ShowerHead size={16} color={GREEN} />}
                  label={isBurmese ? "ရေချိုးခန်း" : "Bathrooms"}
                  value={property.bathrooms ? `${property.bathrooms}` : "-"}
                />
                <InfoRow
                  icon={<Layers size={16} color={GREEN} />}
                  label={isBurmese ? "အလွှာ" : "Floors"}
                  value={property.floor || "-"}
                />
                <InfoRow
                  icon={<LampCeiling size={16} color={GREEN} />}
                  label={isBurmese ? "ပရိဘောဂ" : "Furnished"}
                  value={property.furnished_status || "-"}
                />
              </View>
            </View>
            <View className="flex-row pt-1">
              <View className="w-1/2">
                <InfoRow
                  icon={<Car size={16} color={GREEN} />}
                  label={isBurmese ? "ကားပါကင်" : "Parking"}
                  value={property.parking ? (isBurmese ? "ရှိသည်" : "Available") : "-"}
                />
              </View>
              <View className="w-1/2">
                <InfoRow
                  icon={<Clock size={16} color={GREEN} />}
                  label={isBurmese ? "တည်ဆောက်နှစ်" : "Year Built"}
                  value={property.year_built || "-"}
                />
              </View>
            </View>
          </Animated.View>

          {/* ── Description ── */}
          <Animated.View
            entering={FadeInUp.duration(400).delay(300)}
            className="rounded-2xl px-5 py-4 mb-5"
            style={{
              backgroundColor: "#fff",
              elevation: 3,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 10,
              borderWidth: 1,
              borderColor: GRAY_BORDER,
            }}
          >
            <Text className="text-base font-rubik-extrabold" style={{ color: TEXT_PRIMARY }}>
              {isBurmese ? "အကျဉ်းချုပ်" : "Description"}
            </Text>
            <View className="mt-3 pt-3" style={{ borderTopWidth: 2, borderTopColor: "#D90000" }}>
              <Text
                className="text-sm font-rubik leading-6"
                style={{ color: TEXT_SECONDARY }}
                numberOfLines={showFullDesc ? undefined : 3}
              >
                {property.description || (isBurmese ? "အသေးစိတ်အချက်အလက်မရှိသေးပါ" : "No description available.")}
              </Text>
              {isLongDesc && (
                <TouchableOpacity
                  onPress={() => setShowFullDesc(!showFullDesc)}
                  className="flex-row items-center gap-1 mt-2"
                >
                  <Text className="text-sm font-rubik-semibold" style={{ color: GREEN }}>
                    {showFullDesc
                      ? isBurmese
                        ? "ရှင်းရှင်းပြရန်"
                      : "See less"
                    : isBurmese
                      ? "ဆက်ဖတ်ရန်"
                      : "See more"}
                </Text>
                {showFullDesc ? (
                  <ChevronUp size={14} color={GREEN} />
                ) : (
                  <ChevronDown size={14} color={GREEN} />
                )}
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

          {/* ── Features ── */}
          {features.length > 0 && (
            <Animated.View
              entering={FadeInUp.duration(400).delay(400)}
              className="rounded-2xl px-5 py-4 mb-5"
              style={{
                backgroundColor: "#fff",
                elevation: 3,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 10,
                borderWidth: 1,
                borderColor: GRAY_BORDER,
              }}
            >
              <Text className="text-base font-rubik-extrabold mb-3" style={{ color: TEXT_PRIMARY }}>
                {isBurmese ? "ပါဝင်သောအရာများ" : "Features"}
              </Text>
              <View className="flex-row flex-wrap">
                {features.map((f, i) => (
                  <FeatureChip key={i} label={f} />
                ))}
              </View>
            </Animated.View>
          )}

          {/* ── Location ── */}
          <Animated.View
            entering={FadeInUp.duration(400).delay(500)}
            className="rounded-2xl overflow-hidden mb-5"
            style={{
              backgroundColor: "#fff",
              elevation: 3,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 10,
              borderWidth: 1,
              borderColor: GRAY_BORDER,
            }}
          >
            <View className="px-5 pt-4 pb-3">
              <Text className="text-base font-rubik-extrabold mb-1" style={{ color: TEXT_PRIMARY }}>
                {isBurmese ? "တည်နေရာ" : "Location"}
              </Text>
              <View className="flex-row items-center gap-2">
                <MapPin size={15} color={GREEN} />
                <Text className="text-sm font-rubik flex-1" style={{ color: TEXT_SECONDARY }}>
                  {displayLocation}
                </Text>
              </View>
            </View>

            {mapUrl ? (
              <TouchableOpacity
                onPress={() =>
                  router.push(
                    `/property/map?latitude=${property.latitude}&longitude=${property.longitude}&title=${encodeURIComponent(displayTitle)}&address=${encodeURIComponent(displayLocation)}` as any,
                  )
                }
                activeOpacity={0.9}
                style={{ height: 180, borderTopWidth: 1, borderTopColor: GRAY_BORDER }}
              >
                <WebView
                  source={{ uri: mapUrl }}
                  style={{ flex: 1 }}
                  scrollEnabled={false}
                  pointerEvents="none"
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    `https://www.google.com/maps/search/${encodeURIComponent(displayLocation)}`,
                  )
                }
                style={{ height: 120, borderTopWidth: 1, borderTopColor: GRAY_BORDER }}
              >
                <View className="flex-1 items-center justify-center" style={{ backgroundColor: GRAY_LIGHT }}>
                  <MapPin size={32} color={GREEN} />
                  <Text className="text-sm font-rubik-medium mt-1" style={{ color: GREEN }}>
                    {isBurmese ? "မြေပုံဖွင့်ရန်" : "Open Map"}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/maps/search/${encodeURIComponent(displayLocation)}`,
                )
              }
              className="flex-row items-center justify-center py-3 gap-2"
              style={{ borderTopWidth: 1, borderTopColor: GRAY_BORDER }}
            >
              <Navigation size={15} color={GREEN} />
              <Text className="font-rubik-bold text-sm" style={{ color: GREEN }}>
                {isBurmese ? "Google Maps တွင်ကြည့်ရန်" : "View on Google Maps"}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Agent Card ── */}
          {agent && !isOwner && (
            <Animated.View
              entering={FadeInUp.duration(400).delay(600)}
              className="rounded-2xl px-5 py-4 mb-5"
              style={{
                backgroundColor: "#fff",
                elevation: 3,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 10,
                borderWidth: 1,
                borderColor: GRAY_BORDER,
              }}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  router.push(
                    `/agent/${agent.id}?propertyId=${property.id}&phone=${encodeURIComponent(property.search_value || property.phone || agent.phone || "")}` as any,
                  )
                }
              >
                <Text className="text-base font-rubik-extrabold mb-3" style={{ color: TEXT_PRIMARY }}>
                  {isBurmese ? "အေးဂျင့်" : "Agent"}
                </Text>
                <View className="flex-row items-center">
                  <View
                    className="w-14 h-14 rounded-full items-center justify-center"
                    style={{ backgroundColor: GREEN_LIGHT }}
                  >
                    {agent.avatar_url ? (
                      <Image
                        source={{ uri: agent.avatar_url }}
                        className="w-14 h-14 rounded-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <Text className="text-lg font-rubik-bold" style={{ color: GREEN }}>
                        {(agent.full_name || "A")[0]}
                      </Text>
                    )}
                  </View>
                  <View className="flex-1 ml-3">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-sm font-rubik-semibold" style={{ color: TEXT_PRIMARY }}>
                        {agent.full_name || "Agent"}
                      </Text>
                      <CheckCircle size={14} color="#3B82F6" fill="#3B82F6" />
                    </View>
                    <Text className="text-xs font-rubik mt-0.5" style={{ color: GRAY }}>
                      {isBurmese ? "အိမ်ခြံမြေအကျိုးဆောင်" : "Real Estate Agent"}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-0.5">
                      <Phone size={11} color={GRAY} />
                      <Text className="text-xs font-rubik" style={{ color: GRAY }}>
                        {agent.phone || property.search_value || "-"}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color={GRAY} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* ── Similar Properties ── */}
          {relatedProperties.length > 0 && (
            <Animated.View entering={FadeInUp.duration(400).delay(700)} className="mb-5">
              <Text
                className="text-lg font-rubik-extrabold mb-4"
                style={{ color: "#000000" }}
                numberOfLines={1}
              >
                {similarHeading}
              </Text>
              <FlatList
                data={relatedProperties}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingRight: 20 }}
                snapToInterval={290}
                decelerationRate="fast"
                renderItem={({ item: rp }) => {
                  const rpPrice = rp.price
                    ? `${rp.price.toLocaleString()} ${rp.currency_unit === "lakhs" ? "သိန်း (ကျပ်)" : "$"}`
                    : "";
                  const rpImage = rp.images?.[0] || DEFAULT_IMAGE;
                  const rpTitle = rp.title_mm || rp.title_en || "";
                  const rpLocation = [rp.townships?.name_mm || rp.townships?.name_en, rp.states_regions?.name_mm || rp.states_regions?.name_en].filter(Boolean).join(" | ");
                  const rpType = rp.property_type
                    ? ({ apartment: "တိုက်ခန်း", condo: "ကွန်ဒို", house: "လုံးချင်းအိမ်", land: "မြေကွက်", hostel: "အဆောင်" } as Record<string, string>)[rp.property_type] || rp.property_type
                    : "";
                  return (
                    <TouchableOpacity
                      onPress={() => router.push(`/property/${rp.id}` as any)}
                      activeOpacity={0.85}
                      className="mr-4 rounded-xl overflow-hidden"
                      style={{
                        width: 290,
                        backgroundColor: "#fff",
                        elevation: 4,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        borderWidth: 1,
                        borderColor: "#E5E7EB",
                      }}
                    >
                      <Image
                        source={{ uri: rpImage }}
                        style={{ width: 290, height: 218 }}
                        resizeMode="cover"
                      />
                      <View className="px-4 py-4">
                        <Text
                          className="font-rubik-bold"
                          style={{ color: "#111827", fontSize: 17 }}
                          numberOfLines={2}
                        >
                          {rpTitle}
                        </Text>
                        {rpLocation && (
                          <View className="flex-row items-center gap-1.5 mt-2">
                            <MapPin size={14} color="#3B82F6" fill="#3B82F6" />
                            <Text className="flex-1 text-sm font-rubik" style={{ color: "#3B82F6" }} numberOfLines={1}>
                              {rpLocation}
                            </Text>
                          </View>
                        )}
                        {rpType && (
                          <View className="flex-row items-center gap-1.5 mt-1.5">
                            <Building size={14} color="#3B82F6" fill="#3B82F6" />
                            <Text className="text-sm font-rubik" style={{ color: "#3B82F6" }}>
                              {rpType}
                            </Text>
                          </View>
                        )}
                        {rpPrice && (
                          <Text className="text-base font-rubik-extrabold mt-2.5" style={{ color: "#FB6C00" }}>
                            {rpPrice}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </Animated.View>
          )}
        </View>
      </Animated.ScrollView>

      {/* ── Bottom Sticky Action Bar ── */}
      <SafeAreaView
        edges={["bottom"]}
        className="bg-white"
        style={{
          borderTopWidth: 1,
          borderTopColor: GRAY_BORDER,
          elevation: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        }}
      >
        <View className="flex-row items-center px-4 py-3 gap-3">
          {isOwner ? (
            <>
              <TouchableOpacity
                onPress={handleContact}
                className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl"
                style={{ backgroundColor: GREEN_LIGHT }}
              >
                <Phone size={18} color={GREEN} />
                <Text className="font-rubik-bold text-sm" style={{ color: GREEN }}>
                  {isBurmese ? "ဖုန်းခေါ်ရန်" : "Call"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  supabase
                    .from("properties")
                    .update({ is_sold: true, sold_at: new Date().toISOString() })
                    .eq("id", propertyId)
                    .then(() => onBack());
                }}
                className="flex-1 py-3.5 rounded-xl items-center justify-center"
                style={{ backgroundColor: GREEN }}
              >
                <Text className="text-white font-rubik-bold text-sm">
                  {isBurmese ? "ရောင်းပြီး" : "Mark Sold"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={handleContact}
                className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl"
                style={{ backgroundColor: GREEN }}
              >
                <Phone size={18} color="#fff" />
                <Text className="text-white font-rubik-bold text-sm">
                  {isBurmese ? "ဖုန်းခေါ်ရန်" : "Call"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleChatPress}
                className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl"
                style={{ backgroundColor: GREEN }}
              >
                <MessageCircle size={18} color="#fff" />
                <Text className="text-white font-rubik-bold text-sm">
                  {isBurmese ? "စာပို့ရန်" : "Chat"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>

      <ReportModal
        visible={showReport}
        propertyId={property.id}
        onClose={() => setShowReport(false)}
      />
    </View>
  );
}
