// Central business details used across the site.

export const site = {
  name: "Holiday Lights by BBrite Services",
  shortName: "Holiday Lights OC",
  domain: "holidaylightsoc.com",
  url: "https://holidaylightsoc.com",
  region: "coastal Orange County, Long Beach, and Cerritos",
  yearsInBusiness: 20,
  tagline: "Seasonal Christmas light rentals, installation, and year-end removal.",
  description:
    "Holiday Lights by BBrite Services provides seasonal Christmas light rentals, custom design, installation, and year-end removal in Newport Beach, Long Beach, Sunset Beach, Seal Beach, Huntington Beach, Corona del Mar, Los Alamitos, and Cerritos. 20 years of bringing the Christmas spirit home.",

  phoneDisplay: "(714) 876-7622",
  phoneHref: "tel:+17148767622",
  email: "bbriteservices@gmail.com",

  pricing: {
    typical: { min: 1000, max: 3000 },
    showstopper: { min: 4000, max: 9000 },
    roofline: { min: 8, max: 15 },
    tree: 100,
    strandsPerTree: 4,
  },

  serviceArea: [
    "Newport Beach",
    "Long Beach",
    "Sunset Beach",
    "Seal Beach",
    "Huntington Beach",
    "Corona del Mar",
    "Los Alamitos",
    "Cerritos",
  ],
} as const;

export function formatUsd(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
