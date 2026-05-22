import * as Location from "expo-location";

import { useEffect, useState } from "react";

export default function useUserLocation() {
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      setLoading(false);
      return;
    }

    const current = await Location.getCurrentPositionAsync({});

    setLocation(current.coords);

    setLoading(false);
  };

  return {
    location,
    loading,
    refreshLocation: getLocation,
  };
}
