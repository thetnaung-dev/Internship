import type { Place } from "../types/Place";

type GooglePhoto = {
  name?: string;
};

type GoogleNearbyPlace = {
  id?: string;
  formattedAddress?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
  displayName?: {
    text?: string;
  };
  nationalPhoneNumber?: string;
  websiteUri?: string;
  regularOpeningHours?: {
    weekdayDescriptions?: string[];
  };
  photos?: GooglePhoto[];
};

const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

type Category = "hospital" | "pharmacy" | "clinic";

const CATEGORY_CONFIG: Record<Category, { label: string; types: string[] }> = {
  hospital: {
    label: "Hospital",
    types: ["hospital"],
  },
  pharmacy: {
    label: "Pharmacy",
    types: ["pharmacy"],
  },
  clinic: {
    label: "Clinic",
    types: ["medical_clinic", "medical_center"],
  },
};

export const getGooglePlacePhotoUrl = (
  photoName?: string,
  maxWidthPx = 1200,
) => {
  if (!photoName || !GOOGLE_PLACES_API_KEY) return undefined;
  return `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxWidthPx}&key=${GOOGLE_PLACES_API_KEY}`;
};

const fetchPlacePhotos = async (placeId: string): Promise<string[]> => {
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY!,
          "X-Goog-FieldMask": "photos",
        },
      },
    );
    const data = await res.json();
    console.log(`Photos for ${placeId}:`, JSON.stringify(data?.photos?.[0]));
    return (data?.photos ?? [])
      .map((p: GooglePhoto) => p.name)
      .filter(Boolean) as string[];
  } catch {
    return [];
  }
};

const cache = new Map<string, Place[]>();

export const searchNearbyPlaces = async (
  latitude: number,
  longitude: number,
  category: Category,
): Promise<Place[]> => {
  const cacheKey = `${category}-${latitude.toFixed(3)}-${longitude.toFixed(3)}`;

  if (cache.has(cacheKey)) {
    console.log(`Cache hit for ${category}`);
    return cache.get(cacheKey)!;
  }

  try {
    if (!GOOGLE_PLACES_API_KEY) {
      throw new Error("Missing GOOGLE_PLACES_API_KEY");
    }

    const config = CATEGORY_CONFIG[category];

    const body = {
      includedTypes: config.types,
      maxResultCount: 20,
      rankPreference: "DISTANCE",
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius: 5000,
        },
      },
    };

    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.types",
        },
        body: JSON.stringify(body),
      },
    );

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const json = JSON.parse(text);
    const placesData: GoogleNearbyPlace[] = Array.isArray(json?.places)
      ? json.places
      : [];

    const places: Place[] = (
      await Promise.all(
        placesData.map(async (item) => {
          const lat = item.location?.latitude;
          const lon = item.location?.longitude;

          if (typeof lat !== "number" || typeof lon !== "number") return null;

          const distance = getDistance(latitude, longitude, lat, lon);
          const placeId = String(item.id || `${lat},${lon}`);
          const photos = await fetchPlacePhotos(placeId);

          return {
            id: placeId,
            name: item.displayName?.text || config.label,
            type: config.label,
            latitude: lat,
            longitude: lon,
            distance: `${distance}m away`,
            address: item.formattedAddress,
            phone: item.nationalPhoneNumber,
            website: item.websiteUri,
            openingHours:
              item.regularOpeningHours?.weekdayDescriptions?.join("\n"),
            photos,
          };
        }),
      )
    ).filter(Boolean) as Place[];

    places.sort((a, b) => {
      const da = Number(a.distance.replace(/[^\d]/g, ""));
      const db = Number(b.distance.replace(/[^\d]/g, ""));
      return da - db;
    });

    cache.set(cacheKey, places);
    return places;
  } catch (error) {
    console.log(`Places Error (${category}):`, error);
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
