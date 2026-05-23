import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import CurrentLocationButton from "../components/CurrentLocationButton";
import FilterChip from "../components/FilterChip";
import MapSearchBar from "../components/MapSearchBar";
import NearbyPlaceCard from "../components/NearbyPlaceCard";

import { getUserLocation } from "../services/locationService";
import { searchNearbyPlaces } from "../services/placesService";
import type { Place } from "../types/Place";

const DEFAULT_REGION: Region = {
  latitude: 16.8409,
  longitude: 96.1735,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

type PlaceWithCategory = Place & {
  sourceCategory: "Hospital" | "Pharmacy" | "Clinic";
  uniqueKey: string;
};

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [search, setSearch] = useState("");
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [selectedFilter, setSelectedFilter] = useState<
    "All" | "Hospital" | "Pharmacy" | "Clinic"
  >("All");
  const [places, setPlaces] = useState<PlaceWithCategory[]>([]);

  const snapPoints = useMemo(() => ["20%", "50%", "88%"], []);

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      const location = await getUserLocation();

      const newRegion: Region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

      setRegion(newRegion);

      const [hospitals, pharmacies, clinics] = await Promise.all([
        searchNearbyPlaces(location.latitude, location.longitude, "hospital"),
        searchNearbyPlaces(location.latitude, location.longitude, "pharmacy"),
        searchNearbyPlaces(location.latitude, location.longitude, "clinic"),
      ]);

      const merged: PlaceWithCategory[] = [
        ...hospitals.map((p) => ({
          ...p,
          sourceCategory: "Hospital" as const,
          uniqueKey: `hospital-${p.id}`,
        })),
        ...pharmacies.map((p) => ({
          ...p,
          sourceCategory: "Pharmacy" as const,
          uniqueKey: `pharmacy-${p.id}`,
        })),
        ...clinics.map((p) => ({
          ...p,
          sourceCategory: "Clinic" as const,
          uniqueKey: `clinic-${p.id}`,
        })),
      ];

      setPlaces(merged);
      mapRef.current?.animateToRegion(newRegion, 1000);
    } catch (error) {
      console.log("Location error:", error);
      setRegion(DEFAULT_REGION);
    }
  };

  const goToMyLocation = async () => {
    try {
      const location = await getUserLocation();

      const newRegion: Region = {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
    } catch (error) {
      console.log("Go to location error:", error);
    }
  };

  const filteredPlaces =
    selectedFilter === "All"
      ? places
      : places.filter((place) => place.sourceCategory === selectedFilter);

  const searchedPlaces = filteredPlaces.filter((place) =>
    place.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        region={region}
        mapType="hybrid"
        showsUserLocation
        moveOnMarkerPress={false}
      >
        {searchedPlaces.map((place) => (
          <Marker
            key={place.uniqueKey}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.name}
            description={place.sourceCategory}
          />
        ))}
      </MapView>

      <View className="absolute top-0 left-0 right-0 px-4 pt-3 mt-7">
        <View className="rounded-[22px] px-4 py-3">
          <View className="mt-3">
            <MapSearchBar value={search} onChange={setSearch} />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
          >
            <View className="flex-row">
              <FilterChip
                title="All"
                active={selectedFilter === "All"}
                onPress={() => setSelectedFilter("All")}
              />
              <FilterChip
                title="Hospitals"
                active={selectedFilter === "Hospital"}
                onPress={() => setSelectedFilter("Hospital")}
              />
              <FilterChip
                title="Pharmacies"
                active={selectedFilter === "Pharmacy"}
                onPress={() => setSelectedFilter("Pharmacy")}
              />
              <FilterChip
                title="Clinics"
                active={selectedFilter === "Clinic"}
                onPress={() => setSelectedFilter("Clinic")}
              />
            </View>
          </ScrollView>
        </View>
      </View>

      <View className="absolute right-5 bottom-44">
        <CurrentLocationButton onPress={goToMyLocation} />
      </View>

      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        backgroundStyle={{
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          backgroundColor: "#ffffff",
        }}
        handleIndicatorStyle={{
          backgroundColor: "#d1d5db",
          width: 60,
          height: 5,
        }}
      >
        <View className="px-5 pb-4 pt-2">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[30px] font-bold text-gray-900">
                Nearby Places
              </Text>
              <Text className="text-gray-500 mt-1 text-base">
                Healthcare places near you
              </Text>
            </View>

            <View className="bg-blue-100 px-4 py-2 rounded-full">
              <Text className="text-blue-600 font-semibold text-sm">
                {searchedPlaces.length} Places
              </Text>
            </View>
          </View>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 140,
          }}
          showsVerticalScrollIndicator={false}
        >
          {searchedPlaces.map((place) => (
            <View key={place.uniqueKey} className="mb-4">
              <NearbyPlaceCard
                name={place.name}
                type={place.sourceCategory}
                distance={place.distance}
                photoName={place.photos?.[0]}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/place/[id]",
                    params: {
                      id: place.id,
                      name: place.name,
                      type: place.sourceCategory,
                      distance: place.distance,
                      latitude: place.latitude.toString(),
                      longitude: place.longitude.toString(),
                      phone: place.phone ?? "",
                      address: place.address ?? "",
                      website: place.website ?? "",
                      openingHours: place.openingHours ?? "",
                      photoName: place.photos?.[0] ?? "",
                    },
                  })
                }
              />
            </View>
          ))}
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}
