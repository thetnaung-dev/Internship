import { useTranslation } from "react-i18next";
import { Image, Pressable, Text, View } from "react-native";
import { getGooglePlacePhotoUrl } from "../services/placesService";

type Props = {
  name: string;
  type: string;
  distance: string;
  photoName?: string;
  onPress: () => void;
};

export default function NearbyPlaceCard({
  name,
  type,
  distance,
  photoName,
  onPress,
}: Props) {
  const photoUrl = getGooglePlacePhotoUrl(photoName, 400);
  const typeKeyMap: Record<string, string> = {
    Hospital: "filterHospitals",
    Pharmacy: "filterPharmacies",
    Clinic: "filterClinics",
  };
  const { t } = useTranslation();
  const translatedType = typeKeyMap[type] ? t(typeKeyMap[type]) : type;

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        marginBottom: 12,
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 16,
          overflow: "hidden",
          backgroundColor: "#e5e7eb",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
            onError={(e) => console.log("photo error", e.nativeEvent)}
          />
        ) : (
          <View style={{ height: 240, backgroundColor: "#e5e7eb" }} />
        )}
      </View>

      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={{ fontSize: 18, fontWeight: "700", color: "#111827" }}
          numberOfLines={1}
        >
          {name}
        </Text>

        <Text
          style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}
          numberOfLines={1}
        >
          {translatedType} {/* was {type} */}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#2563eb",
            marginTop: 4,
            fontWeight: "600",
          }}
        >
          {distance}
        </Text>
      </View>
    </Pressable>
  );
}
