import React, { useEffect, useRef, useState } from "react";

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
      {/* Header */}
      <View className="px-5 pt-5">
        <Text className="text-3xl font-bold text-gray-900">
          Nearby Healthcare
        </Text>

        <Text className="text-gray-500 mt-2">
          Find hospitals and pharmacies near you
        </Text>

        {/* Search */}
        <View className="mt-6">
          <MapSearchBar value={search} onChange={setSearch} />
        </View>

        {/* Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-6"
        >
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
        </ScrollView>
      </View>

      {/* Map */}
      <View className="h-80 mx-5 mt-6 rounded-3xl overflow-hidden relative">
        <MapView
          key={`${region.latitude}-${region.longitude}`}
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

        <CurrentLocationButton onPress={goToMyLocation} />
      </View>

      {/* Nearby Places */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 120,
        }}
      >
        <View className="mb-5">
          <Text className="text-2xl font-bold text-gray-900">
            Nearby Places
          </Text>

          <Text className="text-gray-500 mt-2">
            Healthcare places near your location
          </Text>
        </View>

        {searchedPlaces.map((place) => (
          <NearbyPlaceCard
            key={place.id}
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
                },
              })
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
