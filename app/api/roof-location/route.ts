import { COVERAGE } from "@/lib/roofline";
import { site } from "@/lib/site";

export const maxDuration = 15;

const headers = { "Cache-Control": "no-store" };
const error = (message: string, status: number) => Response.json({ error: message }, { status, headers });

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return error("Please use the estimator on this website.", 403);
  const body = await request.text();
  if (body.length > 2000) return error("Please enter a street address and city.", 400);
  let input: { address?: unknown; city?: unknown };
  try { input = JSON.parse(body); } catch { return error("Please enter a street address and city.", 400); }
  if (!input || typeof input !== "object") return error("Please enter a street address and city.", 400);
  const address = typeof input.address === "string" ? input.address.trim() : "";
  const city = typeof input.city === "string" ? input.city.trim() : "";
  if (address.length < 5 || address.length > 160 || !site.serviceArea.some((name) => name === city)) {
    return error("Enter your street address and select a city we serve.", 400);
  }
  try {
    const query = new URLSearchParams({ street: address, city, state: "CA", benchmark: "Public_AR_Current", format: "json" });
    const response = await fetch(`https://geocoding.geo.census.gov/geocoder/locations/address?${query}`, { cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!response.ok) return error("Address lookup is unavailable. You can enter a length manually or request a free quote.", 503);
    const data = await response.json();
    const match = data.result?.addressMatches?.[0];
    if (!match) return error("We couldn't locate this address. Check the street number and city, or enter a length manually.", 404);
    const { x, y } = match.coordinates ?? {};
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < COVERAGE[0] || x > COVERAGE[2] || y < COVERAGE[1] || y > COVERAGE[3]) {
      return error("This location is outside our estimator's coverage. Call us for a quote.", 404);
    }
    return Response.json({ point: [x, y], matchedAddress: match.matchedAddress }, { headers });
  } catch {
    return error("Address lookup timed out. Please try again or enter a length manually.", 503);
  }
}
