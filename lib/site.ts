// Central business details. Anything marked TODO is a placeholder that
// should be replaced with the real value before launch.

export const site = {
  name: "Holiday Lights by BBrite Services",
  shortName: "Holiday Lights OC",
  domain: "holidaylightsoc.com",
  url: "https://holidaylightsoc.com",
  region: "Orange County, CA",
  yearsInBusiness: 20,
  tagline: "Custom Christmas light installation and takedown in Orange County.",
  description:
    "Holiday Lights by BBrite Services designs, installs, and takes down custom Christmas light displays across Orange County. 20 years of bringing the Christmas spirit home.",

  // TODO: replace with the real phone number and email.
  phoneDisplay: "(000) 000-0000",
  phoneHref: "tel:+10000000000",
  email: "hello@holidaylightsoc.com",
  isContactPlaceholder: true,

  pricing: {
    typical: { min: 1000, max: 3000 },
    showstopper: { min: 7000, max: 15000 },
  },

  serviceArea: [
    "Irvine",
    "Newport Beach",
    "Huntington Beach",
    "Costa Mesa",
    "Laguna Beach",
    "Mission Viejo",
    "Anaheim",
    "Orange",
    "Tustin",
    "Yorba Linda",
    "Dana Point",
    "San Clemente",
    "Fullerton",
    "Lake Forest",
    "Laguna Niguel",
    "Rancho Santa Margarita",
  ],
} as const;

export function formatUsd(n: number) {
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}
