import React, { useEffect, useMemo, useRef, useState } from "react";

import { router } from "expo-router";

import { ScrollView, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import MapView, { Marker, Region } from "react-native-maps";

import CurrentLocationButton from "../components/CurrentLocationButton";
import FilterChip from "../components/FilterChip";
import MapSearchBar from "../components/MapSearchBar";
import NearbyPlaceCard from "../components/NearbyPlaceCard";

import { getUserLocation } from "../services/locationService";
import { searchNearbyPlaces } from "../services/placesService";

import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import type { Place } from "../types/Place";

const DEFAULT_REGION: Region = {
  latitude: 16.8409,
  longitude: 96.1735,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);

  const [search, setSearch] = useState("");

  const [region, setRegion] = useState<Region>(DEFAULT_REGION);

  const [selectedFilter, setSelectedFilter] = useState<
    "All" | "Hospital" | "Pharmacy"
  >("All");

  const [places, setPlaces] = useState<Place[]>([]);
  const snapPoints = useMemo(() => ["20%", "50%", "88%"], []);
  const bottomSheetRef = useRef<BottomSheet>(null);
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

      const hospitals = await searchNearbyPlaces(
        location.latitude,
        location.longitude,
        "hospital",
      );

      const pharmacies = await searchNearbyPlaces(
        location.latitude,
        location.longitude,
        "pharmacy",
      );

      setPlaces([...hospitals, ...pharmacies]);

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
      console.log(error);
    }
  };

  const filteredPlaces =
    selectedFilter === "All"
      ? places
      : places.filter((place) => place.type === selectedFilter);

  const searchedPlaces = filteredPlaces.filter((place) =>
    place.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* MAP */}
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
            key={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.name}
            description={place.type}
          />
        ))}
      </MapView>

      {/* HEADER CARD */}
      <View className="absolute top-0 left-0 right-0 px-4 pt-3 mt-7">
        <View className="rounded-[22px] px-4 py-3">
          {/* TOP ROW */}

          {/* SEARCH */}
          <View className="mt-3">
            <MapSearchBar value={search} onChange={setSearch} />
          </View>

          {/* FILTERS */}
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
            </View>
          </ScrollView>
        </View>
      </View>

      <View className="absolute right-5 bottom-44">
        <CurrentLocationButton onPress={goToMyLocation} />
      </View>

      {/* BOTTOM SHEET */}
      {/* BOTTOM SHEET */}
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
        {/* HEADER */}
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

        {/* LIST */}
        <BottomSheetScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 140,
          }}
          showsVerticalScrollIndicator={false}
        >
          {searchedPlaces.map((place) => (
            <View key={place.id} className="mb-4">
              <NearbyPlaceCard
                name={place.name}
                distance={place.distance}
                type={place.type}
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/place/[id]",
                    params: {
                      id: place.id,
                      name: place.name,
                      type: place.type,
                      distance: place.distance,
                      latitude: place.latitude.toString(),
                      longitude: place.longitude.toString(),
                      phone: place.phone ?? "",
                      address: place.address ?? "",
                      website: place.website ?? "",
                      openingHours: place.openingHours ?? "",
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
