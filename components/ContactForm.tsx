"use client";

import { useState } from "react";
import { formatUsd, site } from "@/lib/site";
import { estimateLighting, houseLightingFeet } from "@/lib/pricing";
import RooflineEstimator from "@/components/RooflineEstimator";

/**
 * Quote request form. Submitting opens the visitor's
 * email app with the details filled in. Swap this for a form service
 * (Formspree, a CRM webhook, etc.) when one is chosen.
 */
export default function ContactForm({ email }: { email: string }) {
  const [sent, setSent] = useState(false);
  const [feet, setFeet] = useState("");
  const [trees, setTrees] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [measurementSource, setMeasurementSource] = useState("Manually entered / not measured");
  const estimate = estimateLighting(Number(feet), Number(trees));
  const lightingFeet = houseLightingFeet(Number(feet));

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
      `Approximate full house perimeter (feet): ${get("feet") || "Please measure for me"}`,
      `Estimated front and sides lighting (50% of perimeter): ${feet ? `${lightingFeet} feet` : "Please measure for me"}`,
      `Measurement source: ${measurementSource}`,
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
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <label>
        <span className="mb-1.5 block text-sm font-semibold text-mist">City</span>
        <select name="city" required autoComplete="address-level2" className={field} value={city} onChange={(e) => { setCity(e.target.value); if (measurementSource !== "Manually entered / not measured") { setFeet(""); setMeasurementSource("Manually entered / not measured"); } }}>
          <option value="" disabled className="bg-night">Select your city</option>
          {site.serviceArea.map((city) => <option key={city} className="bg-night">{city}</option>)}
        </select>
      </label>
      <label>
        <span className="mb-1.5 block text-sm font-semibold text-mist">Property street address</span>
        <input name="address" required autoComplete="street-address" className={field} placeholder="Street number and street name" value={address} onChange={(e) => { setAddress(e.target.value); if (measurementSource !== "Manually entered / not measured") { setFeet(""); setMeasurementSource("Manually entered / not measured"); } }} />
      </label>
      <fieldset className="grid grid-cols-2 gap-2 rounded-2xl border border-gold/20 bg-gold/5 p-3 sm:col-span-2">
        <legend className="px-2 text-sm font-semibold text-gold">Estimate your lights (optional)</legend>
        <RooflineEstimator address={address} city={city} onUse={(length, source) => { setFeet(String(length)); setMeasurementSource(source); }} />
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-mist">Full house perimeter (feet)</span>
          <input name="feet" type="number" min="0" step="0.1" inputMode="decimal" value={feet} onChange={(e) => { setFeet(e.target.value); setMeasurementSource("Manually entered / not measured"); }} className={`${field} !px-3 !py-2`} placeholder="e.g. 150" />
        </label>
        <label>
          <span className="mb-1.5 block text-sm font-semibold text-mist">Average trees</span>
          <input name="trees" type="number" min="0" step="1" inputMode="numeric" value={trees} onChange={(e) => setTrees(e.target.value)} className={`${field} !px-3 !py-2`} placeholder="e.g. 3" />
        </label>
        <div className="col-span-2 rounded-lg bg-night/60 px-3 py-2">
          <p aria-live="polite" aria-atomic="true" className="font-semibold text-gold">
            {estimate.max > 0 ? `Estimated total: ${formatUsd(estimate.min)}–${formatUsd(estimate.max)}` : "Select your house or enter feet and trees."}
          </p>
          <p className="mt-1 text-xs text-mist">House lighting uses half the perimeter for the front and sides{lightingFeet > 0 ? ` (${lightingFeet} ft)` : ""}. $8–$12/ft + about $100/tree. Final quote confirmed by our team.</p>
        </div>
        <details className="text-xs leading-relaxed text-mist col-span-2">
          <summary className="cursor-pointer font-semibold text-snow">How is the house perimeter estimated?</summary>
          <p className="mt-3">Select the outline around your house in the aerial view or enter its full exterior perimeter. We use 50% of that perimeter to estimate lighting for the front and sides. Street View and Google&apos;s satellite view can help you identify the correct house.</p>
          <p className="mt-2">Roof slopes, overhangs, access, tree size, and your chosen lighting coverage can change the final quote. An average tree uses four strands. You can leave the perimeter blank and let us measure it.</p>
        </details>
      </fieldset>
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
