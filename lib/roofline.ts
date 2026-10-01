export type Point = [number, number]; // longitude, latitude
export type Building = { id: string; ring: Point[] };
export type RoofLocation = { point: Point; matchedAddress: string };

const R = 6378137;
export const COVERAGE = [-118.26, 33.55, -117.75, 33.91] as const;

export function project([lon, lat]: Point): Point {
  return [R * lon * Math.PI / 180, R * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))];
}

export function unproject([x, y]: Point): Point {
  return [x / R * 180 / Math.PI, (2 * Math.atan(Math.exp(y / R)) - Math.PI / 2) * 180 / Math.PI];
}

export function distance(a: Point, b: Point) {
  const rad = Math.PI / 180;
  const sinLat = Math.sin((b[1] - a[1]) * rad / 2);
  const sinLon = Math.sin((b[0] - a[0]) * rad / 2);
  const h = sinLat ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * sinLon ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function lengthFeet(points: Point[], close = false) {
  if (points.length < 2) return 0;
  let meters = 0;
  for (let i = 1; i < points.length; i++) meters += distance(points[i - 1], points[i]);
  if (close) meters += distance(points[points.length - 1], points[0]);
  return meters / 0.3048;
}

export function mapBounds(center: Point, groundWidth: number) {
  const [x, y] = project(center);
  const half = groundWidth / Math.cos(center[1] * Math.PI / 180) / 2;
  return [x - half, y - half, x + half, y + half] as const;
}

export function imageryUrl(bounds: readonly number[]) {
  const query = new URLSearchParams({ bbox: bounds.join(","), bboxSR: "3857", imageSR: "3857", size: "800,800", format: "jpg", f: "image" });
  return `https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/export?${query}`;
}

export function tileKey(point: Point) {
  return `${Math.floor(point[0] * 100)}_${Math.floor(point[1] * 100)}`;
}

export function buildingCenter(building: Building): Point {
  const xs = building.ring.map((p) => p[0]), ys = building.ring.map((p) => p[1]);
  return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
}

export function googleMapsViewUrl([lon, lat]: Point, view: "street" | "satellite") {
  const query = new URLSearchParams({ api: "1", map_action: view === "street" ? "pano" : "map" });
  if (view === "street") query.set("viewpoint", `${lat},${lon}`);
  else { query.set("center", `${lat},${lon}`); query.set("zoom", "20"); query.set("basemap", "satellite"); }
  return `https://www.google.com/maps/@?${query}`;
}
