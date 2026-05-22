// app/(tabs)/place/[id].tsx

import * as Location from "expo-location";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, Platform, Pressable, Text, View } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

type Coordinates = { latitude: number; longitude: number };

// Helper to clean route coordinates
function sanitizeCoords(
  coords: any[],
): { latitude: number; longitude: number }[] {
  return coords
    .filter(
      (c) =>
        c != null &&
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

export async function getRoute(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
): Promise<{ latitude: number; longitude: number }[]> {
  const apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;
  if (!apiKey) {
    console.log("Missing GEOAPIFY_API_KEY -> using straight‑line");
    return [origin, destination];
  }

  try {
    const res = await fetch(
      `https://api.geoapify.com/v1/routing` +
        `?waypoints=${origin.latitude},${origin.longitude}|${destination.latitude},${destination.longitude}` +
        `&mode=drive` +
        `&apiKey=${apiKey}`,
    );

    if (!res.ok) {
      console.log("Routing API error (HTTP)", res.status, await res.text());
      return [origin, destination];
    }

    const json = await res.json();

    const coordinates: { latitude: number; longitude: number }[] = [];

    for (const feature of json?.features ?? []) {
      for (const coord of feature?.geometry?.coordinates ?? []) {
        const lat = Number(coord[1]);
        const lon = Number(coord[0]);

        if (!isNaN(lat) && !isNaN(lon)) {
          coordinates.push({ latitude: lat, longitude: lon });
        }
      }
    }

    if (coordinates.length < 2) {
      console.log("Routing API returned too few points -> using straight line");
      return [origin, destination];
    }

    return coordinates;
  } catch (error) {
    console.log("Routing API error (catch)", error);
    return [origin, destination];
  }
}

export default function PlaceDetailScreen() {
  const params = useLocalSearchParams<{
    name: string;
    type: string;
    distance: string;
    latitude: string;
    longitude: string;
    phone?: string;
    address?: string;
  }>();

  const latitude = Number(params.latitude);
  const longitude = Number(params.longitude);

  const [routeCoords, setRouteCoords] = useState<Coordinates[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  // 1. Get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  // 2. Compute route
  useEffect(() => {
    if (!userLocation || !latitude || !longitude) return;

    getRoute(userLocation, { latitude, longitude }).then((raw) => {
      const safe = sanitizeCoords(raw);
      setRouteCoords(safe);
    });
  }, [userLocation, latitude, longitude]);

  // Debug log
  useEffect(() => {
    console.log("routeCoords RAW:", JSON.stringify(routeCoords));
  }, [routeCoords]);

  // Region that fits both user and place
  const region = userLocation
    ? {
        latitude: (userLocation.latitude + latitude) / 2,
        longitude: (userLocation.longitude + longitude) / 2,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }
    : {
        latitude,
        longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-6">
        <Text className="text-2xl font-bold text-gray-900">{params.name}</Text>
        <Text className="text-lg text-gray-600 mt-1">{params.type}</Text>
        <Text className="text-blue-600 mt-1 font-semibold">
          {params.distance}
        </Text>
      </View>

      {/* Phone / Address */}
      <View className="px-5 mt-4">
        {params.phone && (
          <Pressable
            className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3 mb-3"
            onPress={() => {
              const scheme = Platform.OS === "android" ? "tel:" : "telprompt:";
              Linking.openURL(`${scheme}${params.phone}`);
            }}
          >
            <Text className="text-gray-700 ml-2 text-base">
              📞 {params.phone}
            </Text>
          </Pressable>
        )}

        {params.address && (
          <View className="flex-row items-start bg-gray-100 rounded-xl px-4 py-3">
            <Text className="text-gray-700 text-base" style={{ flexShrink: 1 }}>
              {params.address}
            </Text>
          </View>
        )}
      </View>

      {/* Map */}
      <View className="flex-1 px-5 mt-6">
        <View className="h-80 rounded-3xl overflow-hidden">
          <MapView style={{ flex: 1 }} mapType="hybrid" region={region}>
            {/* User marker */}
            {userLocation && (
              <Marker
                coordinate={userLocation}
                pinColor="blue"
                title="You are here"
              />
            )}

            {/* Place marker */}
            <Marker
              coordinate={{ latitude, longitude }}
              pinColor="green"
              title={params.name}
            />

            {/* Route polyline (only drawn if 2+ valid points) */}
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

      {/* Optional: show route points count */}
      <View className="px-5 mt-3 mb-4">
        <Text className="text-gray-500 text-sm">
          Route points: {routeCoords.length}
        </Text>
      </View>
    </SafeAreaView>
  );
}
