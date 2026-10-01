// Measures a building's outline from Google's Geocoding API (v4 Search
// Destinations), which returns the building footprint traced from aerial
// imagery as a GeoJSON polygon. The outline perimeter approximates the roof's
// eave line seen from above. It does not include the extra length of sloped
// gable rakes or hidden roof sections, so it is a starting point, not a final
// measurement.

const SEARCH_URL = "https://geocode.googleapis.com/v4/geocode/destinations";
const FEET_PER_METER = 3.28084;
const EARTH_RADIUS_M = 6_371_008.8;

type Position = [number, number]; // [lng, lat]
type GeoPolygon =
  | { type: "Polygon"; coordinates: Position[][] }
  | { type: "MultiPolygon"; coordinates: Position[][][] };

type PlaceView = {
  structureType?: string;
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  displayPolygon?: GeoPolygon;
};

type Destination = {
  primary?: PlaceView;
  containingPlaces?: PlaceView[];
  subDestinations?: PlaceView[];
};

export type RoofOutline = {
  /** Outline perimeter in feet, rounded to the nearest foot. */
  feet: number;
  formattedAddress?: string;
  /** Outline rings in local feet (x east, y north), for drawing a preview. */
  rings: [number, number][][];
};

export class RoofLookupError extends Error {
  constructor(
    public code: "not_configured" | "not_found" | "upstream",
    message: string,
  ) {
    super(message);
  }
}

function rings(polygon: GeoPolygon): Position[][] {
  return polygon.type === "Polygon" ? polygon.coordinates : polygon.coordinates.flat();
}

function distanceMeters([lng1, lat1]: Position, [lng2, lat2]: Position) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Perimeter of every ring (outer walls and any courtyard), in feet. */
export function perimeterFeet(polygon: GeoPolygon) {
  let meters = 0;
  for (const ring of rings(polygon)) {
    for (let i = 1; i < ring.length; i++) meters += distanceMeters(ring[i - 1], ring[i]);
    const first = ring[0];
    const last = ring[ring.length - 1];
    if (first && last && (first[0] !== last[0] || first[1] !== last[1])) meters += distanceMeters(last, first);
  }
  return meters * FEET_PER_METER;
}

function containsPoint(polygon: GeoPolygon, [x, y]: Position) {
  let inside = false;
  for (const ring of rings(polygon)) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
  }
  return inside;
}

function centroid(polygon: GeoPolygon): Position {
  const pts = rings(polygon).flat();
  const sum = pts.reduce(([a, b], [x, y]) => [a + x, b + y], [0, 0]);
  return [sum[0] / pts.length, sum[1] / pts.length];
}

function toLocalFeet(polygon: GeoPolygon): [number, number][][] {
  const [lng0, lat0] = centroid(polygon);
  const metersPerDegLat = (Math.PI / 180) * EARTH_RADIUS_M;
  const metersPerDegLng = metersPerDegLat * Math.cos((lat0 * Math.PI) / 180);
  return rings(polygon).map((ring) =>
    ring.map(([lng, lat]) => [
      Math.round((lng - lng0) * metersPerDegLng * FEET_PER_METER * 10) / 10,
      Math.round((lat - lat0) * metersPerDegLat * FEET_PER_METER * 10) / 10,
    ]),
  );
}

/**
 * Picks the building at the address: the one containing the address point,
 * otherwise the building nearest to it.
 */
export function pickBuilding(destinations: Destination[]) {
  const views = destinations.flatMap((d) => [d.primary, ...(d.containingPlaces ?? []), ...(d.subDestinations ?? [])]);
  const buildings = views.filter(
    (v): v is PlaceView & { displayPolygon: GeoPolygon } => v?.structureType === "BUILDING" && !!v.displayPolygon,
  );
  if (!buildings.length) return undefined;

  const primary = destinations[0]?.primary;
  const loc = primary?.location;
  if (!loc) return { building: buildings[0], address: primary?.formattedAddress };
  const point: Position = [loc.longitude, loc.latitude];
  const building =
    buildings.find((b) => containsPoint(b.displayPolygon, point)) ??
    [...buildings].sort((a, b) => distanceMeters(centroid(a.displayPolygon), point) - distanceMeters(centroid(b.displayPolygon), point))[0];
  return { building, address: primary?.formattedAddress ?? building.formattedAddress };
}

export async function lookupRoofOutline(address: string): Promise<RoofOutline> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new RoofLookupError("not_configured", "GOOGLE_MAPS_API_KEY is not set");

  const res = await fetch(SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "destinations.primary,destinations.containingPlaces,destinations.subDestinations",
    },
    body: JSON.stringify({ addressQuery: { addressQuery: address }, regionCode: "US" }),
    cache: "no-store",
  });
  if (!res.ok) throw new RoofLookupError("upstream", `Google returned ${res.status}: ${(await res.text()).slice(0, 300)}`);

  const data = (await res.json()) as { destinations?: Destination[] };
  const match = pickBuilding(data.destinations ?? []);
  if (!match) throw new RoofLookupError("not_found", "No building outline found for that address");

  return {
    feet: Math.round(perimeterFeet(match.building.displayPolygon)),
    formattedAddress: match.address,
    rings: toLocalFeet(match.building.displayPolygon),
  };
}
