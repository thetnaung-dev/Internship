import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import * as Location from "expo-location";
import { Locate, LocateFixed } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

interface Property {
  id: string;
  title_en: string | null;
  title_mm: string | null;
  price: number;
  currency_unit: string;
  deal_type: string;
  images: string[];
  latitude: number;
  longitude: number;
  distance?: number;
}

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function MapTabScreen() {
  const mapRef = useRef<MapView>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );

  const DEFAULT_REGION: Region = {
    latitude: 21.9162,
    longitude: 95.956,
    latitudeDelta: 5,
    longitudeDelta: 5,
  };

  const centerOnUser = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = loc.coords;
    setUserLocation({ latitude, longitude });

    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      },
      500,
    );

    return { latitude, longitude };
  }, []);

  useEffect(() => {
    const init = async () => {
      const loc = await centerOnUser();

      const { data } = await supabase
        .from("properties")
        .select(
          "id, title_en, title_mm, price, currency_unit, deal_type, images, latitude, longitude",
        )
        .not("latitude", "is", null)
        .not("longitude", "is", null);

      let mapped = (data || []) as Property[];

      if (loc) {
        mapped = mapped
          .map((p) => ({
            ...p,
            distance: haversineDistance(
              loc.latitude,
              loc.longitude,
              p.latitude,
              p.longitude,
            ),
          }))
          .sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }

      setProperties(mapped);
      setLoading(false);
    };

    init();
  }, []);

  const handleMarkerPress = (property: Property) => {
    setSelectedProperty(property);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#22c55e" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <View className="flex-1">
        <MapView
          ref={mapRef}
          className="flex-1"
          initialRegion={DEFAULT_REGION}
          showsUserLocation
          showsMyLocationButton={false}
          onPress={() => setSelectedProperty(null)}
        >
          {properties.map((property, index) => (
            <Marker
              key={property.id}
              coordinate={{
                latitude: property.latitude,
                longitude: property.longitude,
              }}
              onPress={() => handleMarkerPress(property)}
            >
              <View
                className={`rounded-full border-2 px-2 py-1 shadow ${
                  index === 0 && userLocation
                    ? "bg-primary-300 border-white"
                    : "bg-white border-primary-300"
                }`}
              >
                <Text
                  className={`font-rubik-bold text-xs ${
                    index === 0 && userLocation
                      ? "text-white"
                      : "text-primary-300"
                  }`}
                >
                  {property.currency_unit === "lakhs"
                    ? `${property.price}L`
                    : `$${property.price}`}
                </Text>
              </View>
            </Marker>
          ))}
        </MapView>

        <TouchableOpacity
          onPress={centerOnUser}
          className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg border border-primary-200"
          activeOpacity={0.7}
        >
          {userLocation ? (
            <LocateFixed size={22} color="#22c55e" />
          ) : (
            <Locate size={22} color="#8C8E98" />
          )}
        </TouchableOpacity>

        {selectedProperty && (
          <View className="absolute bottom-6 left-4 right-4 bg-white rounded-2xl shadow-lg border border-primary-200 p-4">
            <TouchableOpacity
              onPress={() => router.push(`/property/${selectedProperty.id}`)}
              className="flex-row"
            >
              {selectedProperty.images?.[0] && (
                <Image
                  source={{ uri: selectedProperty.images[0] }}
                  className="w-20 h-20 rounded-xl"
                  resizeMode="cover"
                />
              )}
              <View className="flex-1 ml-3 justify-center">
                <Text
                  className="text-black-300 font-rubik-bold text-base"
                  numberOfLines={1}
                >
                  {selectedProperty.title_en || selectedProperty.title_mm}
                </Text>
                <Text className="text-primary-300 font-rubik-bold text-lg mt-1">
                  {selectedProperty.currency_unit === "lakhs"
                    ? `${selectedProperty.price} Lakhs`
                    : `$${selectedProperty.price}`}
                </Text>
                <Text className="text-black-100 text-xs font-rubik mt-1">
                  {selectedProperty.distance !== undefined
                    ? `${selectedProperty.distance.toFixed(1)} km away`
                    : ""}
                </Text>
                <Text className="text-black-100 text-xs font-rubik uppercase mt-0.5">
                  {selectedProperty.deal_type}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
