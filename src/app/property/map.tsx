import { ChevronLeft, Navigation } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

export default function MapScreen() {
  const { latitude, longitude, title, address } = useLocalSearchParams<{
    latitude: string;
    longitude: string;
    title: string;
    address: string;
  }>();
  const router = useRouter();

  const lat = parseFloat(latitude || "0");
  const lng = parseFloat(longitude || "0");

  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
    lng - 0.001
  }%2C${lat - 0.001}%2C${lng + 0.001}%2C${
    lat + 0.001
  }&layer=mapnik&marker=${lat}%2C${lng}`;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-primary-200">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 items-center justify-center rounded-full bg-primary-100"
        >
          <ChevronLeft size={20} color="#191D31" />
        </TouchableOpacity>

        <View className="flex-1 mx-3">
          <Text className="text-black-300 font-rubik-semibold text-sm" numberOfLines={1}>
            {title || "Property"}
          </Text>
          <Text className="text-black-100 font-rubik text-xs" numberOfLines={1}>
            {address || ""}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() =>
            Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`)
          }
          className="flex-row items-center gap-1 bg-primary-100 px-3 py-2 rounded-full"
        >
          <Navigation size={14} color="#22c55e" />
          <Text className="text-primary-300 font-rubik-semibold text-xs">
            Google Maps
          </Text>
        </TouchableOpacity>
      </View>

      <WebView source={{ uri: mapUrl }} style={{ flex: 1 }} />
    </SafeAreaView>
  );
}
