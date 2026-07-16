import { useCompareStore } from "@/store/useCompareStore";
import { router } from "expo-router";
import {
  Bed,
  ChevronLeft,
  ChevronRight,
  Home,
  MapPin,
  Maximize2,
  Navigation,
  ShowerHead,
  Star,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
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

function PropertyDetail({ item }: { item: any }) {
  const removeItem = useCompareStore((s) => s.remove);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  const displayTitle = item.title_en || item.title_mm || "Property";
  const displayPrice =
    item.currency_unit === "lakhs"
      ? `${item.price} Lakhs`
      : `$${item.price}`;
  const displayImage = item.images?.[0] || DEFAULT_IMAGE;
  const regionName = item.states_regions
    ? item.states_regions.name_mm || item.states_regions.name_en
    : "";
  const townshipName = item.townships
    ? item.townships.name_mm || item.townships.name_en
    : "";
  const displayLocation =
    townshipName && regionName
      ? `${townshipName}, ${regionName}`
      : "Yangon, Myanmar";
  const propertyTypeLabel = item.property_type || "Property";

  let mediaDataset: string[] = [];
  if (item.video_url) mediaDataset.push(item.video_url);
  else if (item.video) mediaDataset.push(item.video);
  if (item.images && item.images.length > 0)
    mediaDataset = [...mediaDataset, ...item.images];
  if (mediaDataset.length === 0) mediaDataset = [DEFAULT_IMAGE];

  return (
    <View style={{ width: SCREEN_WIDTH }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Carousel with Arrow Buttons */}
        <View>
          {/* Close button */}
          <TouchableOpacity
            onPress={() => removeItem(item.id)}
            className="absolute top-3 right-3 z-20"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View className="w-8 h-8 bg-black/40 rounded-full items-center justify-center">
              <X size={16} color="#ffffff" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              setPreviewIndex(activeImageIndex);
              setIsModalVisible(true);
            }}
          >
            <Image
              source={{ uri: mediaDataset[activeImageIndex] }}
              style={{ width: SCREEN_WIDTH, height: 260 }}
              resizeMode="cover"
            />
            {isVideoFile(mediaDataset[activeImageIndex]) && (
              <View className="absolute inset-0 items-center justify-center">
                <View className="w-14 h-14 bg-black/40 rounded-full items-center justify-center">
                  <ChevronRight size={24} color="#ffffff" style={{ marginLeft: 3 }} />
                </View>
              </View>
            )}
          </TouchableOpacity>

          {mediaDataset.length > 1 && (
            <>
              <TouchableOpacity
                onPress={() =>
                  setActiveImageIndex((prev) =>
                    prev > 0 ? prev - 1 : mediaDataset.length - 1
                  )
                }
                className="absolute left-3 top-0 bottom-0 justify-center"
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <View className="w-9 h-9 bg-white/80 rounded-full items-center justify-center">
                  <ChevronLeft size={20} color="#191D31" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() =>
                  setActiveImageIndex((prev) =>
                    prev < mediaDataset.length - 1 ? prev + 1 : 0
                  )
                }
                className="absolute right-3 top-0 bottom-0 justify-center"
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <View className="w-9 h-9 bg-white/80 rounded-full items-center justify-center">
                  <ChevronRight size={20} color="#191D31" />
                </View>
              </TouchableOpacity>

              <View className="absolute bottom-3 right-4 bg-black/50 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-rubik-medium">
                  {activeImageIndex + 1}/{mediaDataset.length}
                </Text>
              </View>

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
            </>
          )}
        </View>

        <View className="px-5 pt-5 pb-10">
          <View className="flex-row gap-2 mb-3 flex-wrap">
            <View className="bg-primary-100 px-3 py-1 rounded-full">
              <Text className="text-primary-300 text-xs font-rubik-semibold capitalize">
                {propertyTypeLabel}
              </Text>
            </View>
            <View className="flex-row items-center gap-1 bg-primary-100 px-3 py-1 rounded-full">
              <Star size={12} color="#22c55e" fill="#22c55e" />
              <Text className="text-primary-300 text-xs font-rubik-semibold">
                {item.rating || "5.0"}
              </Text>
            </View>
          </View>

          <Text className="text-2xl font-rubik-extrabold text-black-300 mb-1">
            {displayTitle}
          </Text>
          <Text className="text-primary-300 text-xl font-rubik-bold mb-4">
            {displayPrice}
          </Text>

          <View className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-black-100 text-xs font-rubik-medium uppercase tracking-wider">
                  Ad Number
                </Text>
                <Text className="text-black-300 text-lg font-rubik-extrabold mt-0.5">
                  PROP-{10000 + (item.ad_number || 0)}
                </Text>
              </View>
              <View className="w-px h-10 bg-gray-200" />
              <View className="items-end">
                <Text className="text-black-100 text-xs font-rubik-medium uppercase tracking-wider">
                  Posted
                </Text>
                <Text className="text-black-300 text-sm font-rubik-bold mt-0.5">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "-"}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row justify-between bg-primary-100 rounded-2xl p-4 mb-4">
            <View className="items-center gap-1 flex-1">
              <Bed size={20} color="#22c55e" />
              <Text className="text-black-100 text-xs font-rubik mt-1">Beds</Text>
              <Text className="text-black-300 text-sm font-rubik-extrabold">{item.bedrooms || 0}</Text>
            </View>
            <View className="items-center gap-1 flex-1">
              <ShowerHead size={20} color="#22c55e" />
              <Text className="text-black-100 text-xs font-rubik mt-1">Baths</Text>
              <Text className="text-black-300 text-sm font-rubik-extrabold">{item.bathrooms || 0}</Text>
            </View>
            <View className="items-center gap-1 flex-1">
              <Maximize2 size={20} color="#22c55e" />
              <Text className="text-black-100 text-xs font-rubik mt-1">Area</Text>
              <Text className="text-black-300 text-sm font-rubik-extrabold">
                {item.area_value
                  ? `${item.area_value}${item.area_unit === "sqft" ? "ft²" : "A"}`
                  : "-"}
              </Text>
            </View>
            <View className="items-center gap-1 flex-1">
              <Home size={20} color="#22c55e" />
              <Text className="text-black-100 text-xs font-rubik mt-1">Type</Text>
              <Text className="text-black-300 text-sm font-rubik-extrabold">{propertyTypeLabel}</Text>
            </View>
          </View>

          <Text className="text-base font-rubik-bold text-black-300 mb-2">Description</Text>
          <Text className="text-black-200 text-sm font-rubik leading-6 mb-4">
            {item.description || "No description available."}
          </Text>

          <Text className="text-base font-rubik-bold text-black-300 mb-2">Location</Text>
          <View className="flex-row items-center gap-2 mb-4">
            <MapPin size={16} color="#666876" />
            <Text className="text-black-200 text-sm font-rubik flex-1">{displayLocation}</Text>
          </View>

          {item.latitude && item.longitude ? (
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/property/map?latitude=${item.latitude}&longitude=${item.longitude}&title=${encodeURIComponent(displayTitle)}&address=${encodeURIComponent(displayLocation)}` as any,
                )
              }
              activeOpacity={0.9}
              className="rounded-2xl overflow-hidden mb-5"
              style={{ height: 180 }}
            >
              <WebView
                source={{
                  uri: `https://www.openstreetmap.org/export/embed.html?bbox=${
                    item.longitude - 0.003
                  }%2C${item.latitude - 0.003}%2C${item.longitude + 0.003}%2C${
                    item.latitude + 0.003
                  }&layer=mapnik&marker=${item.latitude}%2C${item.longitude}`,
                }}
                style={{ flex: 1 }}
                scrollEnabled={false}
                pointerEvents="none"
              />
              <View className="absolute bottom-2 right-2 bg-white/90 px-2.5 py-1 rounded-full flex-row items-center gap-1">
                <Navigation size={11} color="#666876" />
                <Text className="text-black-200 text-xs font-rubik-medium">Tap to expand</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View className="rounded-2xl overflow-hidden border border-primary-200 mb-5">
              <View className="bg-primary-100 items-center justify-center py-8 gap-2">
                <MapPin size={32} color="#22c55e" />
                <Text className="text-black-200 text-sm font-rubik-medium text-center px-4">
                  {displayLocation}
                </Text>
              </View>
            </View>
          )}

          <View className="flex-row items-center gap-3 pt-2 border-t border-primary-100">
            <View className="size-10 rounded-full bg-primary-100 items-center justify-center">
              <Text className="text-primary-300 text-base font-rubik-bold">
                {(item.profiles?.full_name || "O")[0].toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-black-300 font-rubik-bold text-sm">
                {item.profiles?.full_name || "Owner"}
              </Text>
              <Text className="text-black-100 text-xs font-rubik">
                {item.search_value || item.phone || ""}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fullscreen Image Preview Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-black">
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
    </View>
  );
}

export default function CompareScreen() {
  const items = useCompareStore((s) => s.items);
  const scrollRef = useRef<ScrollView>(null);
  const [, setPage] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;
    const maxPage = items.length - 1;
    setPage((prev) => {
      if (prev > maxPage) {
        const newPage = maxPage;
        setTimeout(() => {
          scrollRef.current?.scrollTo({
            x: newPage * SCREEN_WIDTH,
            animated: false,
          });
        }, 0);
        return newPage;
      }
      return prev;
    });
  }, [items.length]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-primary-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-primary-100"
        >
          <ChevronLeft size={24} color="#22c55e" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-rubik-bold text-black-300 text-center mr-10">
          Compared Listings
        </Text>
      </View>

      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-black-100 text-lg font-rubik-bold">
            Select properties to compare
          </Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setPage(page);
          }}
        >
          {items.map((item: any) => (
            <PropertyDetail key={item.id} item={item} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
