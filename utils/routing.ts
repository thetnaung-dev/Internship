export async function getRoute(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
): Promise<{ latitude: number; longitude: number }[]> {
  const apiKey = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;
  if (!apiKey) {
    console.log("Missing GEOAPIFY_API_KEY -> using straight‑line");
    return [origin, destination]; // ← always numbers
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
    console.log("Routing API JSON:", JSON.stringify(json, null, 2));

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
      return [origin, destination]; // straight‑line fallback
    }

    return coordinates;
  } catch (error) {
    console.log("Routing API error (catch)", error);
    return [origin, destination]; // straight‑line
  }
}
