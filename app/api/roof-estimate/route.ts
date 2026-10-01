import { lookupRoofOutline, RoofLookupError } from "@/lib/roofOutline";

// Looks up the building outline for a quote-form address and returns its
// perimeter in feet. Needs GOOGLE_MAPS_API_KEY (Geocoding API enabled).
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { address?: unknown };
  const address = typeof body.address === "string" ? body.address.trim() : "";
  if (address.length < 5 || address.length > 200) {
    return Response.json({ error: "invalid_address" }, { status: 400 });
  }

  try {
    return Response.json(await lookupRoofOutline(address));
  } catch (err) {
    if (err instanceof RoofLookupError) {
      if (err.code !== "not_found") console.error("Roof lookup failed:", err.message);
      const status = err.code === "not_found" ? 404 : err.code === "not_configured" ? 503 : 502;
      return Response.json({ error: err.code }, { status });
    }
    throw err;
  }
}
