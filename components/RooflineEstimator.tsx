"use client";

import { useEffect, useMemo, useState } from "react";
import { buildingCenter, googleMapsViewUrl, imageryUrl, lengthFeet, mapBounds, project, unproject, type Building, type Point, type RoofLocation } from "@/lib/roofline";

const spinner = <span aria-hidden="true" className="inline-block h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" />;

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
  const mapLoading = visible && failedImage !== aerial && (loadedImage !== aerial || (buildingData?.key !== boundsKey && !buildingError));

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
  const controls = "rounded-lg border border-white/20 px-2 py-1.5 text-xs font-semibold text-snow hover:border-gold disabled:opacity-40";

  return (
    <div className="col-span-2 space-y-2">
      <button type="button" onClick={locate} disabled={busy} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-deep px-4 py-3 text-sm font-bold text-night shadow-[0_0_20px_rgba(244,197,106,0.2)] transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-wait disabled:opacity-80">
        {busy ? spinner : <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="10" cy="10" r="6" /><path d="m15 15 5 5" /></svg>}
        {busy ? "Finding Your House…" : visible ? "Find My House Again" : "Find My House"}
      </button>
      {!visible && <p className="text-xs text-mist">Enter your address and city above, then find your house. Address lookup uses U.S. Census.</p>}
      {busy && <div role="status" className="mx-auto flex aspect-square w-full max-w-[300px] flex-col items-center justify-center gap-3 rounded-xl border border-gold/20 bg-night text-gold">{spinner}<span className="text-sm font-semibold">Finding your house…</span></div>}
      {error && <p role="alert" className="text-sm text-gold">{error}</p>}
      {visible && location && (
        <div className="space-y-2">
          <p className="truncate text-xs text-mist" title={location.matchedAddress}>{location.matchedAddress}</p>
          <div className="flex flex-wrap items-center gap-1">
            <button type="button" className={`${controls} min-h-8 min-w-8 text-base`} aria-label="Zoom in" disabled={width <= 60} onClick={() => setWidth((w) => Math.max(60, w / 2))}>+</button>
            <button type="button" className={`${controls} min-h-8 min-w-8 text-base`} aria-label="Zoom out" disabled={width >= 480} onClick={() => setWidth((w) => Math.min(480, w * 2))}>−</button>
            <button type="button" className={`${controls} min-h-8 min-w-8`} onClick={() => pan(-1, 0)} aria-label="Move view west">←</button>
            <button type="button" className={`${controls} min-h-8 min-w-8`} onClick={() => pan(0, 1)} aria-label="Move view north">↑</button>
            <button type="button" className={`${controls} min-h-8 min-w-8`} onClick={() => pan(0, -1)} aria-label="Move view south">↓</button>
            <button type="button" className={`${controls} min-h-8 min-w-8`} onClick={() => pan(1, 0)} aria-label="Move view east">→</button>
            {selected && <button type="button" aria-label="Zoom to Selected House" className={`${controls} min-h-8 min-w-8`} onClick={() => {
              const middle = buildingCenter(selected);
              const size = Math.max(lengthFeet(selected.ring, true) * 0.3048 / 2, 60);
              setCenter(middle); setWidth(Math.min(480, size));
            }}>⌖</button>}
          </div>
          <div className="flex items-center justify-between gap-2 text-xs">
            <p className="text-gold">Tap your house outline.</p>
            {viewingPoint && <div className="flex shrink-0 gap-3">
              <a href={googleMapsViewUrl(viewingPoint, "street")} target="_blank" rel="noopener noreferrer" className="text-mist underline hover:text-gold" aria-label="Open Street View in a new tab">Street View ↗</a>
              <a href={googleMapsViewUrl(viewingPoint, "satellite")} target="_blank" rel="noopener noreferrer" className="text-mist underline hover:text-gold" aria-label="Open Google Satellite View in a new tab">Satellite ↗</a>
            </div>}
          </div>
          <div className="relative mx-auto w-full max-w-[300px]" aria-busy={mapLoading}>
          <svg viewBox="0 0 800 800" className="mx-auto block aspect-square w-full max-w-[300px] overflow-hidden rounded-xl border border-white/20 bg-night" aria-label="Aerial view with selectable building outlines">
            <title>Aerial view: select the outline around your house</title>
            <image href={aerial} x="0" y="0" width="800" height="800" onLoad={() => { setLoadedImage(aerial); setFailedImage(""); }} onError={() => setFailedImage(aerial)} />
            {loadedImage === aerial && failedImage !== aerial && buildings.map((b, i) => (
              <polygon key={b.id} points={b.ring.map((p) => pixel(p).join(",")).join(" ")} fill={selected?.id === b.id ? "#f4c56a66" : "#00000015"} stroke={selected?.id === b.id ? "#ffffff" : "#f4c56a"} strokeWidth={selected?.id === b.id ? "5" : "3"} tabIndex={0} role="button" aria-pressed={selected?.id === b.id} aria-label={`Select building ${i + 1}, approximately ${Math.round(lengthFeet(b.ring, true))} feet around`} onClick={() => selectHouse(b)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectHouse(b); } }} className="cursor-pointer outline-none focus:stroke-white focus:stroke-[6]" />
            ))}
            <circle cx={pixel(location.point)[0]} cy={pixel(location.point)[1]} r="7" fill="#74d7ff" stroke="white" strokeWidth="2" pointerEvents="none" />
          </svg>
          {mapLoading && <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-night/90 text-gold">{spinner}<span className="text-sm font-semibold">{loadedImage !== aerial ? "Loading your house map…" : "Loading house outlines…"}</span></div>}
          </div>
          {failedImage === aerial && <p role="alert" className="text-sm text-gold">The aerial image could not load. Do not use an outline you cannot verify. Try again later or enter a length manually.</p>}
          {buildingError && <p className="text-sm text-mist">{buildingError}</p>}
          {buildingData?.key === boundsKey && !buildings.length && <p className="text-sm text-mist">No building outlines here. Move the view to find your house or let our team measure it for your quote.</p>}
          <p aria-live="polite" className="text-xs font-semibold text-gold">{measuredFeet > 0 ? `Selected house: ${Math.round(measuredFeet)} ft` : "Choose the outline around your house."}</p>
          <p className="text-xs text-mist">USDA / USGS · Outlines: <a href="/roof-data/attribution.txt" target="_blank" rel="noopener noreferrer" className="underline">Overture Maps &amp; contributors (ODbL)</a>.</p>
        </div>
      )}
    </div>
  );
}
