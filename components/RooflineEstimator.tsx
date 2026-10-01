"use client";

import { useEffect, useMemo, useState } from "react";
import { buildingCenter, googleMapsViewUrl, imageryUrl, lengthFeet, mapBounds, project, unproject, type Building, type Point, type RoofLocation } from "@/lib/roofline";

type TileIndex = { tiles: string[] };
let indexRequest: Promise<TileIndex> | undefined;
const tileRequests = new Map<string, Promise<Building[]>>();

async function nearbyBuildings(bounds: readonly number[], signal: AbortSignal) {
  indexRequest ??= fetch("/roof-data/index.json").then((r) => { if (!r.ok) throw new Error("Data unavailable"); return r.json(); }).catch((e) => { indexRequest = undefined; throw e; });
  const index = await indexRequest;
  const [west, south] = unproject([bounds[0], bounds[1]]);
  const [east, north] = unproject([bounds[2], bounds[3]]);
  const available = new Set(index.tiles);
  const requests: Promise<Building[]>[] = [];
  for (let x = Math.floor(west * 100); x <= Math.floor(east * 100); x++) {
    for (let y = Math.floor(south * 100); y <= Math.floor(north * 100); y++) {
      const key = `${x}_${y}`;
      if (!available.has(key)) continue;
      if (!tileRequests.has(key)) tileRequests.set(key, fetch(`/roof-data/${key}.json.gz`).then(async (r) => {
        if (!r.ok || !r.body) throw new Error("Data unavailable");
        return new Response(r.body.pipeThrough(new DecompressionStream("gzip"))).json();
      }).catch((e) => { tileRequests.delete(key); throw e; }));
      requests.push(tileRequests.get(key)!);
    }
  }
  const all = (await Promise.all(requests)).flat();
  if (signal.aborted) return [];
  return Array.from(new Map(all.map((b) => [b.id, b])).values()).filter((b) => {
    const xs = b.ring.map((p) => p[0]), ys = b.ring.map((p) => p[1]);
    return Math.max(...xs) >= west && Math.min(...xs) <= east && Math.max(...ys) >= south && Math.min(...ys) <= north;
  });
}

export default function RooflineEstimator({ address, city, onUse }: {
  address: string;
  city: string;
  onUse: (feet: number, source: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState<RoofLocation | null>(null);
  const [locatedFor, setLocatedFor] = useState("");
  const [center, setCenter] = useState<Point>([-118.1, 33.74]);
  const [width, setWidth] = useState(160);
  const [buildingData, setBuildingData] = useState<{ key: string; buildings: Building[] } | null>(null);
  const [buildingError, setBuildingError] = useState("");
  const [failedImage, setFailedImage] = useState("");
  const [loadedImage, setLoadedImage] = useState("");
  const [selected, setSelected] = useState<Building | null>(null);
  const inputKey = `${address.trim()}|${city}`;
  const visible = !!location && locatedFor === inputKey;
  const bounds = useMemo(() => mapBounds(center, width), [center, width]);
  const boundsKey = bounds.join(",");
  const aerial = imageryUrl(bounds);
  const buildings = buildingData?.key === boundsKey ? buildingData.buildings : [];

  useEffect(() => {
    if (!visible) return;
    const controller = new AbortController();
    nearbyBuildings(bounds, controller.signal).then((data) => {
      if (!controller.signal.aborted) { setBuildingData({ key: bounds.join(","), buildings: data }); setBuildingError(""); }
    }).catch(() => { if (!controller.signal.aborted) setBuildingError("Building outlines are unavailable. Please enter a length manually or let our team measure it for your quote."); });
    return () => controller.abort();
  }, [bounds, visible]);

  async function locate() {
    if (!address.trim() || !city) { setError("Enter your property address and select your city first."); return; }
    const searchedFor = inputKey;
    setBusy(true); setError("");
    setLocation(null); setSelected(null);
    try {
      const response = await fetch("/api/roof-location", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ address, city }), signal: AbortSignal.timeout(15000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We couldn't find the address.");
      setLocation(data); setCenter(data.point); setWidth(160); setLocatedFor(searchedFor);
    } catch (e) { setError(e instanceof Error ? e.message : "Address lookup unavailable. Enter a length manually or request a quote."); }
    finally { setBusy(false); }
  }

  function pixel(point: Point) {
    const [x, y] = project(point);
    return [(x - bounds[0]) / (bounds[2] - bounds[0]) * 800, (bounds[3] - y) / (bounds[3] - bounds[1]) * 800];
  }
  function pan(dx: number, dy: number) {
    const [x, y] = project(center);
    const step = (bounds[2] - bounds[0]) * 0.3;
    setCenter(unproject([x + dx * step, y + dy * step]));
  }
  function selectHouse(building: Building) {
    setSelected(building);
    onUse(Math.round(lengthFeet(building.ring, true)), `Customer-confirmed full building footprint ${building.id} at ${location?.matchedAddress}; approximate, pending verification`);
  }
  const measuredFeet = selected ? lengthFeet(selected.ring, true) : 0;
  const viewingPoint = selected ? buildingCenter(selected) : location?.point;
  const controls = "rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-snow hover:border-gold disabled:opacity-40";

  return (
    <div className="space-y-3 sm:col-span-2">
      <p className="font-semibold text-snow">Find your house &amp; estimate the lights</p>
      <p className="text-sm leading-relaxed text-mist">Tap the outline around your house. We automatically calculate its approximate full perimeter and update your price estimate.</p>
      <button type="button" onClick={locate} disabled={busy} className={controls}>{busy ? "Finding your house…" : "Find My House"}</button>
      <p className="text-xs leading-relaxed text-mist">Finding your house sends only the street address and city to the U.S. Census address service. Aerial imagery is supplied by USGS.</p>
      {error && <p role="alert" className="text-sm text-gold">{error}</p>}
      {visible && location && (
        <div className="space-y-3">
          <p className="text-sm text-mist">Located: {location.matchedAddress}. Confirm your house below; the address marker may be on the street.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={controls} disabled={width <= 60} onClick={() => setWidth((w) => Math.max(60, w / 2))}>Zoom in</button>
            <button type="button" className={controls} disabled={width >= 480} onClick={() => setWidth((w) => Math.min(480, w * 2))}>Zoom out</button>
            <button type="button" className={controls} onClick={() => pan(-1, 0)} aria-label="Move view west">←</button>
            <button type="button" className={controls} onClick={() => pan(0, 1)} aria-label="Move view north">↑</button>
            <button type="button" className={controls} onClick={() => pan(0, -1)} aria-label="Move view south">↓</button>
            <button type="button" className={controls} onClick={() => pan(1, 0)} aria-label="Move view east">→</button>
            {selected && <button type="button" className={controls} onClick={() => {
              const middle = buildingCenter(selected);
              const size = Math.max(lengthFeet(selected.ring, true) * 0.3048 / 2, 60);
              setCenter(middle); setWidth(Math.min(480, size));
            }}>Zoom to Selected House</button>}
          </div>
          <p className="text-sm text-gold">Tap the box around your house to estimate its full perimeter. The selected house is highlighted.</p>
          {viewingPoint && <div className="flex flex-wrap gap-2">
            <a href={googleMapsViewUrl(viewingPoint, "street")} target="_blank" rel="noopener noreferrer" className={controls}>Open Street View ↗</a>
            <a href={googleMapsViewUrl(viewingPoint, "satellite")} target="_blank" rel="noopener noreferrer" className={controls}>Open Google Satellite View ↗</a>
          </div>}
          <p className="text-xs leading-relaxed text-mist">These views open in a new tab to help you identify your house. Street View is available where Google has coverage. Return here and select the matching outline for your estimate.</p>
          {loadedImage !== aerial && failedImage !== aerial && <p role="status" className="text-sm text-mist">Loading aerial image…</p>}
          <svg viewBox="0 0 800 800" className="block aspect-square w-full overflow-hidden rounded-xl border border-white/20 bg-night" aria-label="Aerial view with selectable building outlines">
            <title>Aerial view: select the outline around your house</title>
            <image href={aerial} x="0" y="0" width="800" height="800" onLoad={() => setLoadedImage(aerial)} onError={() => setFailedImage(aerial)} />
            {loadedImage === aerial && failedImage !== aerial && buildings.map((b, i) => (
              <polygon key={b.id} points={b.ring.map((p) => pixel(p).join(",")).join(" ")} fill={selected?.id === b.id ? "#f4c56a66" : "#00000015"} stroke={selected?.id === b.id ? "#ffffff" : "#f4c56a"} strokeWidth={selected?.id === b.id ? "5" : "3"} tabIndex={0} role="button" aria-pressed={selected?.id === b.id} aria-label={`Select building ${i + 1}, approximately ${Math.round(lengthFeet(b.ring, true))} feet around`} onClick={() => selectHouse(b)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectHouse(b); } }} className="cursor-pointer outline-none focus:stroke-white focus:stroke-[6]" />
            ))}
            <circle cx={pixel(location.point)[0]} cy={pixel(location.point)[1]} r="7" fill="#74d7ff" stroke="white" strokeWidth="2" pointerEvents="none" />
          </svg>
          {failedImage === aerial && <p role="alert" className="text-sm text-gold">The aerial image could not load. Do not use an outline you cannot verify. Try again later or enter a length manually.</p>}
          {buildingError && <p className="text-sm text-mist">{buildingError}</p>}
          {buildingData?.key === boundsKey && !buildings.length && <p className="text-sm text-mist">No building outlines here. Move the view to find your house or let our team measure it for your quote.</p>}
          <p aria-live="polite" className="font-semibold text-gold">{measuredFeet > 0 ? `Estimated full house perimeter: ${Math.round(measuredFeet)} feet — applied to your estimate below.` : "Select the outline around your house to see its estimated perimeter."}</p>
          <p className="text-xs leading-relaxed text-mist">This estimate covers the full building perimeter. Roof overhangs, slopes, and the edges you choose to light may change the final length. Imagery and outlines may be older; confirm the correct house before selecting it. Our team verifies measurements and pricing.</p>
          <p className="text-xs text-mist">Imagery: USDA, USGS The National Map. Outlines: <a href="/roof-data/attribution.txt" target="_blank" rel="noopener noreferrer" className="underline">Overture Maps &amp; contributors (ODbL)</a>.</p>
        </div>
      )}
    </div>
  );
}
