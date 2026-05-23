import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

type Coordinates = { latitude: number; longitude: number };

function getGooglePlacePhotoUrl(photoName?: string, maxWidthPx = 1200) {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!photoName || !apiKey) return undefined;

  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${apiKey}`;
}

function sanitizeCoords(coords: any[]): Coordinates[] {
  return coords
    .filter(
      (c) =>
        c &&
        typeof c.latitude === "number" &&
        typeof c.longitude === "number" &&
        !isNaN(c.latitude) &&
        !isNaN(c.longitude),
    )
    .map((c) => ({
      latitude: c.latitude,
      longitude: c.longitude,
    }));
}

async function getRoute(
  origin: Coordinates,
  destination: Coordinates,
): Promise<Coordinates[]> {
  const apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;
  if (!apiKey) return [origin, destination];

  try {
    const res = await fetch(
      `https://api.geoapify.com/v1/routing?waypoints=${origin.latitude},${origin.longitude}|${destination.latitude},${destination.longitude}&mode=drive&apiKey=${apiKey}`,
    );

    if (!res.ok) return [origin, destination];

    const json = await res.json();
    const coordinates: Coordinates[] = [];

    for (const feature of json?.features ?? []) {
      for (const coord of feature?.geometry?.coordinates ?? []) {
        const lat = Number(coord[1]);
        const lon = Number(coord[0]);
        if (!isNaN(lat) && !isNaN(lon)) {
          coordinates.push({ latitude: lat, longitude: lon });
        }
      }
    }

    return coordinates.length >= 2 ? coordinates : [origin, destination];
  } catch {
    return [origin, destination];
  }
}

export default function PlaceDetailScreen() {
  const params = useLocalSearchParams<{
    id: string;
    name: string;
    type: string;
    distance: string;
    latitude: string;
    longitude: string;
    phone?: string;
    address?: string;
    website?: string;
    openingHours?: string;
    photoName?: string;
  }>();

  const latitude = Number(params.latitude);
  const longitude = Number(params.longitude);

  const [routeCoords, setRouteCoords] = useState<Coordinates[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!userLocation || !latitude || !longitude) return;
    getRoute(userLocation, { latitude, longitude }).then((raw) => {
      setRouteCoords(sanitizeCoords(raw));
    });
  }, [userLocation, latitude, longitude]);

  const region = useMemo(() => {
    if (userLocation) {
      return {
        latitude: (userLocation.latitude + latitude) / 2,
        longitude: (userLocation.longitude + longitude) / 2,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      };
    }

    return {
      latitude,
      longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    };
  }, [userLocation, latitude, longitude]);

  const displayName = params.name;
  const displayPhone = params.phone;
  const displayAddress = params.address;
  const displayWebsite = params.website;
  const displayHours = params.openingHours;
  const headerPhotoUrl = params.photoName
    ? getGooglePlacePhotoUrl(params.photoName, 1200)
    : undefined;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={{ paddingVertical: 24 }}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        )}

        <View
          style={{ width: "100%", height: 240, backgroundColor: "#e5e7eb" }}
        >
          {headerPhotoUrl ? (
            <Image
              source={{ uri: headerPhotoUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#6b7280" }}>No photo available</Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#111827" }}>
            {displayName}
          </Text>
          <Text style={{ fontSize: 18, color: "#4b5563", marginTop: 6 }}>
            {params.type}
          </Text>
          <Text style={{ color: "#2563eb", marginTop: 6, fontWeight: "600" }}>
            {params.distance}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          {displayPhone && (
            <Pressable
              style={{
                backgroundColor: "#f3f4f6",
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 12,
              }}
              onPress={() => {
                const scheme =
                  Platform.OS === "android" ? "tel:" : "telprompt:";
                Linking.openURL(`${scheme}${displayPhone}`);
              }}
            >
              <Text style={{ fontSize: 16, color: "#374151" }}>
                📞 {displayPhone}
              </Text>
            </Pressable>
          )}

          {displayWebsite && (
            <Pressable
              style={{
                backgroundColor: "#f3f4f6",
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 12,
              }}
              onPress={() => Linking.openURL(displayWebsite)}
            >
              <Text style={{ fontSize: 16, color: "#2563eb" }}>
                🌐 {displayWebsite}
              </Text>
            </Pressable>
          )}

          {displayAddress && (
            <View
              style={{
                backgroundColor: "#f3f4f6",
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 16, color: "#374151" }}>
                📍 {displayAddress}
              </Text>
            </View>
          )}

          {displayHours && (
            <View
              style={{
                backgroundColor: "#f3f4f6",
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 16, color: "#374151", lineHeight: 22 }}>
                {displayHours}
              </Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ height: 320, borderRadius: 24, overflow: "hidden" }}>
            <MapView style={{ flex: 1 }} mapType="hybrid" region={region}>
              {userLocation && (
                <Marker
                  coordinate={userLocation}
                  pinColor="blue"
                  title="You are here"
                />
              )}

              <Marker
                coordinate={{ latitude, longitude }}
                pinColor="green"
                title={displayName}
              />

              {routeCoords.length >= 2 && (
                <Polyline
                  coordinates={routeCoords}
                  strokeColor="#3b82f6"
                  strokeWidth={4}
                />
              )}
            </MapView>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
