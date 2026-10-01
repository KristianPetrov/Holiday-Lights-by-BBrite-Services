"use client";

import { useRef, useState } from "react";
import { formatUsd, site } from "@/lib/site";
import { estimateLighting } from "@/lib/pricing";

/**
 * Quote request form. The site is static, so submitting opens the visitor's
 * email app with the details filled in. Swap this for a form service
 * (Formspree, a CRM webhook, etc.) when one is chosen.
 */
type Measured = { feet: number; formattedAddress?: string; rings: [number, number][][] };

export default function ContactForm({ email, autoMeasure = false }: { email: string; autoMeasure?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [sent, setSent] = useState(false);
  const [feet, setFeet] = useState("");
  const [trees, setTrees] = useState("");
  const [measuring, setMeasuring] = useState(false);
  const [measured, setMeasured] = useState<Measured | null>(null);
  const [measureError, setMeasureError] = useState("");
  const estimate = estimateLighting(Number(feet), Number(trees));

  async function measureRoof() {
    const data = new FormData(formRef.current ?? undefined);
    const street = String(data.get("address") ?? "").trim();
    const city = String(data.get("city") ?? "").trim();
    setMeasureError("");
    setMeasured(null);
    if (!street || !city) {
      setMeasureError("Enter your street address and city first.");
      return;
    }
    setMeasuring(true);
    try {
      const res = await fetch("/api/roof-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: `${street}, ${city}, CA` }),
      });
      if (!res.ok) throw new Error(res.status === 404 ? "not_found" : "failed");
      const result = (await res.json()) as Measured;
      setMeasured(result);
      setFeet(String(result.feet));
    } catch (err) {
      setMeasureError(
        err instanceof Error && err.message === "not_found"
          ? "We couldn't find a roof outline for that address. Measure it yourself below, or leave it blank and we'll handle it."
          : "The roof measurement isn't available right now. Measure it yourself below, or leave it blank and we'll handle it.",
      );
    } finally {
      setMeasuring(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const subject = `Christmas lights quote request from ${get("name")}`;
    const body = [
      `Name: ${get("name")}`,
      `Phone: ${get("phone")}`,
      `Email: ${get("email")}`,
      `Property address: ${get("address")}`,
      `City: ${get("city")}`,
      `Project size: ${get("size")}`,
      `Approximate roofline feet: ${get("feet") || "Please measure for me"}${measured && get("feet") === String(measured.feet) ? " (auto-measured outline from address)" : ""}`,
      `Average trees: ${get("trees") || "Not specified"}`,
      ...(estimate.max > 0 ? [`Preliminary roofline/tree estimate: ${formatUsd(estimate.min)}–${formatUsd(estimate.max)} (subject to confirmation)`] : []),
      "",
      get("message"),
    ].join("\n");
    window.location.assign(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    setSent(true);
  }

  const field =
    "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-snow placeholder:text-mist/60 outline-none transition focus:border-gold focus:bg-white/[0.07]";

  return (
    <form ref={formRef} onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-1">
        <span className="mb-1.5 block text-sm font-semibold text-mist">Name</span>
        <input name="name" required autoComplete="name" className={field} placeholder="Your name" />
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-semibold text-mist">Phone</span>
        <input name="phone" type="tel" autoComplete="tel" className={field} placeholder="(714) 555-0123" />
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-semibold text-mist">Email</span>
        <input name="email" type="email" required autoComplete="email" className={field} placeholder="you@email.com" />
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-semibold text-mist">City</span>
        <select name="city" required autoComplete="address-level2" className={field} defaultValue="">
          <option value="" disabled className="bg-night">Select your city</option>
          {site.serviceArea.map((city) => <option key={city} className="bg-night">{city}</option>)}
        </select>
      </label>
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-semibold text-mist">Property street address</span>
        <input name="address" required autoComplete="street-address" className={field} placeholder="Street number and street name" aria-describedby="address-help" />
        <span id="address-help" className="mt-2 block text-sm text-mist">We use your address to review the roofline for your free quote. No measuring needed on your end.</span>
      </label>
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-semibold text-mist">What are you dreaming of?</span>
        <select name="size" className={field} defaultValue="Classic home display">
          <option className="bg-night">Classic home display</option>
          <option className="bg-night">Full showstopper (roofline, trees, yard)</option>
          <option className="bg-night">Something custom and one-of-a-kind</option>
          <option className="bg-night">Business or commercial property</option>
          <option className="bg-night">Not sure yet, help me decide</option>
        </select>
      </label>
      <fieldset className="grid gap-4 rounded-2xl border border-gold/20 bg-gold/5 p-4 sm:col-span-2 sm:grid-cols-2">
        <legend className="px-2 text-sm font-semibold text-gold">Optional: estimate your roofline &amp; trees</legend>
        {autoMeasure && (
          <div className="sm:col-span-2">
            <button type="button" onClick={measureRoof} disabled={measuring} className="btn-primary disabled:opacity-60">
              {measuring ? "Measuring your roof..." : "Measure my roof from my address"}
            </button>
            <div aria-live="polite" className="mt-3 text-sm leading-relaxed text-mist">
              {measureError && <p>{measureError}</p>}
              {measured && (
                <div className="flex items-center gap-4">
                  <RoofPreview rings={measured.rings} />
                  <p>
                    Found about <span className="font-semibold text-gold">{measured.feet} feet</span> of roof perimeter
                    {measured.formattedAddress ? ` at ${measured.formattedAddress}` : ""}. That&apos;s the full outline seen from above. If you only want some edges lit, lower the number. We confirm the length before your final quote.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-mist">Roofline length (feet)</span>
          <input name="feet" type="number" min="0" step="0.1" inputMode="decimal" value={feet} onChange={(e) => setFeet(e.target.value)} className={field} placeholder="e.g. 150" />
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-mist">Number of average trees</span>
          <input name="trees" type="number" min="0" step="1" inputMode="numeric" value={trees} onChange={(e) => setTrees(e.target.value)} className={field} placeholder="e.g. 3" />
        </label>
        <div className="sm:col-span-2">
          <p aria-live="polite" aria-atomic="true" className="font-semibold text-gold">
            {estimate.max > 0 ? `Approximate roofline & tree total: ${formatUsd(estimate.min)}–${formatUsd(estimate.max)}` : "Enter a length or tree count for a rough price range."}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-mist">Based on $8–$15 per foot and about $100 per average tree (four strands). Covers the items entered. Final quote depends on roof height, access, tree size, and other decorations.</p>
        </div>
        <details className="text-sm leading-relaxed text-mist sm:col-span-2">
          <summary className="cursor-pointer font-semibold text-snow">{autoMeasure ? "Prefer to measure it yourself?" : "Want to measure your roofline?"}</summary>
          <p className="mt-3">Open <a href="https://earth.google.com/web/" target="_blank" rel="noopener noreferrer" className="text-gold underline">Google Earth (new tab)</a>, search your address, and use Measure in a top-down view. Trace only the roof edges you want lit, add their lengths, and select feet. For the entire perimeter, include every exterior edge.</p>
          <p className="mt-2">Satellite measurements are approximate and do not account for roof pitch. We confirm the lighting length before your final quote. You can also leave the length blank and let us handle it.</p>
        </details>
      </fieldset>
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-semibold text-mist">Tell us about your vision</span>
        <textarea
          name="message"
          rows={4}
          className={field}
          placeholder="Rooflines, trees, colors, warm white or multicolor... For custom projects, describe exactly what you want to create."
        />
      </label>
      <div className="flex flex-col items-start gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <button type="submit" className="btn-primary">
          Prepare My Quote Request
        </button>
        {sent && (
          <p className="text-sm text-mist" role="status">
            Your email app should open with your request ready to send.
          </p>
        )}
      </div>
      <p className="text-xs leading-relaxed text-mist sm:col-span-2">This opens your email app with the request ready to send. Prefer to call? <a href={site.phoneHref} className="text-gold underline">{site.phoneDisplay}</a>.</p>
    </form>
  );
}

/** Small top-down sketch of the measured outline so visitors can check it's their house. */
function RoofPreview({ rings }: { rings: [number, number][][] }) {
  const pts = rings.flat();
  if (!pts.length) return null;
  const xs = pts.map(([x]) => x);
  const ys = pts.map(([, y]) => y);
  const minX = Math.min(...xs);
  const maxY = Math.max(...ys);
  const size = Math.max(Math.max(...xs) - minX, maxY - Math.min(...ys), 1);
  const pad = size * 0.08;
  const d = rings
    .map((ring) => ring.map(([x, y], i) => `${i ? "L" : "M"}${(x - minX + pad).toFixed(1)} ${(maxY - y + pad).toFixed(1)}`).join(" ") + " Z")
    .join(" ");
  return (
    <svg viewBox={`0 0 ${size + pad * 2} ${size + pad * 2}`} className="h-20 w-20 shrink-0" role="img" aria-label="Outline of the roof we measured">
      <path d={d} fill="rgba(255, 200, 80, 0.12)" stroke="currentColor" strokeWidth={2} className="text-gold" fillRule="evenodd" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
