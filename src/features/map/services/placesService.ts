import type { Place } from "../types/Place";

type PlaceWithDistance = Place & {
  distanceNum: number;
};

const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;

export const searchNearbyPlaces = async (
  latitude: number,
  longitude: number,
  category: "hospital" | "pharmacy",
): Promise<Place[]> => {
  try {
    if (!GEOAPIFY_API_KEY) {
      throw new Error("Missing GEOAPIFY API key");
    }

    const radius = 5000;
    const geoapifyCategory =
      category === "hospital" ? "healthcare.hospital" : "healthcare.pharmacy";

    const url =
      `https://api.geoapify.com/v2/places` +
      `?categories=${encodeURIComponent(geoapifyCategory)}` +
      `&filter=circle:${longitude},${latitude},${radius}` +
      `&bias=proximity:${longitude},${latitude}` +
      `&limit=20` +
      `&apiKey=${GEOAPIFY_API_KEY}`;

    console.log("Fetching:", url);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    const text = await response.text();
    console.log("RAW RESPONSE:", text);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const json = JSON.parse(text);
    const features = Array.isArray(json?.features) ? json.features : [];

    const places: PlaceWithDistance[] = features
      .map((feature: any) => {
        const lon = feature?.geometry?.coordinates?.[0];
        const lat = feature?.geometry?.coordinates?.[1];

        if (typeof lat !== "number" || typeof lon !== "number") {
          return null;
        }

        const distanceNum = getDistance(latitude, longitude, lat, lon);

        return {
          id: String(
            feature?.properties?.place_id ||
              feature?.properties?.osm_id ||
              `${lat},${lon}`,
          ),
          name:
            feature?.properties?.name ||
            (category === "hospital" ? "Hospital" : "Pharmacy"),
          latitude: lat,
          longitude: lon,
          type: category === "hospital" ? "Hospital" : "Pharmacy",
          distanceNum,
          distance: `${distanceNum}m away`,
        };
      })
      .filter(Boolean) as PlaceWithDistance[];

    places.sort((a, b) => a.distanceNum - b.distanceNum);

    return places;
  } catch (error) {
    console.log("Places Error:", error);
    return [];
  }
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
