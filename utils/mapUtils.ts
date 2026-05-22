// In a file like `utils/maps.ts` or inside `place/[id].tsx`

type Coordinates = {
  latitude: number;
  longitude: number;
};

export async function getRoute(
  origin: Coordinates,
  destination: Coordinates,
): Promise<Coordinates[]> {
  try {
    const res = await fetch(
      `https://api.geoapify.com/v1/routing` +
        `?waypoints=${origin.latitude},${origin.longitude}|${destination.latitude},${destination.longitude}` +
        `&mode=drive&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
    );

    if (!res.ok) throw new Error(`Route HTTP ${res.status}`);

    const json = await res.json();

    const coordinates: Coordinates[] = [];

    for (const feature of json?.features ?? []) {
      for (const coord of feature?.geometry?.coordinates ?? []) {
        coordinates.push({ latitude: coord[1], longitude: coord[0] });
      }
    }

    return coordinates;
  } catch (error) {
    console.log("Route error:", error);
    // Fallback: straight line
    return [origin, destination];
  }
}
