import Details from "@/components/features/property/details"; // သင်၏ component တည်ရှိရာနေရာအတိုင်း ပြင်ပါ
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
