"use client";

import { useState } from "react";

/**
 * Quote request form. The site is static, so submitting opens the visitor's
 * email app with the details filled in. Swap this for a form service
 * (Formspree, a CRM webhook, etc.) when one is chosen.
 */
export default function ContactForm({ email }: { email: string }) {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (k: string) => String(data.get(k) ?? "").trim();
    const subject = `Christmas lights quote request from ${get("name")}`;
    const body = [
      `Name: ${get("name")}`,
      `Phone: ${get("phone")}`,
      `Email: ${get("email")}`,
      `City: ${get("city")}`,
      `Project size: ${get("size")}`,
      "",
      get("message"),
    ].join("\n");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  const field =
    "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-snow placeholder:text-mist/60 outline-none transition focus:border-gold focus:bg-white/[0.07]";

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
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
        <input name="city" autoComplete="address-level2" className={field} placeholder="Irvine, Newport Beach..." />
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
          Request My Free Quote
        </button>
        {sent && (
          <p className="text-sm text-mist" role="status">
            Your email app should open with your request ready to send.
          </p>
        )}
      </div>
    </form>
  );
}
