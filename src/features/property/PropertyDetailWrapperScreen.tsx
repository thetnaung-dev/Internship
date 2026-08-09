import Details from "@/features/property/details";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View } from "react-native";

export default function DetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={{ flex: 1 }}>
      <Details propertyId={id} onBack={() => router.back()} />
    </View>
  );
}
