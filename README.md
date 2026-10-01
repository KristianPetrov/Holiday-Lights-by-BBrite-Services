# Holiday Lights by BBrite Services

Marketing site for [holidaylightsoc.com](https://holidaylightsoc.com): custom Christmas light
rentals, design, installation, and year-end takedown and collection in coastal
Orange County, Long Beach, and Cerritos.

Built with Next.js (App Router) and Tailwind CSS. The whole site is prerendered as static HTML.

## Develop

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # production build
```

## Business details

Phone, email, pricing, and service-area cities live in `lib/site.ts`.

The quote form collects the property address and optional roofline length/tree
count. It prepares an email in the visitor's email app; the visitor must send it.
The estimate uses $8–$15 per linear foot and about $100 per average tree (four
strands). It is an estimate for the entered items, not a confirmed booking or quote.
See [the roofline quoting workflow](docs/roofline-quoting.md).

### Automatic roof measurement (optional)

Set `GOOGLE_MAPS_API_KEY` in Vercel (Project Settings, Environment Variables) and
redeploy to show a "Measure my roof from my address" button on the quote form. The
key needs the **Geocoding API** enabled in Google Cloud. The site calls Google's
Geocoding v4 Search Destinations endpoint from the server (`app/api/roof-estimate`),
takes the building outline at the address, and fills in its perimeter in feet.
Restrict the key to the Geocoding API and set a daily quota cap in Google Cloud.

## Photos and logo

The site finds images in `public/` automatically at build time:

- `brand/holiday-lights-extravagant-logo-transparent.png` is the preferred logo
  throughout the site. Other logo files are fallbacks and are excluded from galleries.
- Images in a folder whose name mentions crew, install, workers, team, or progress
  (for example `crew/` or `Installing/`) appear in the "Behind the Glow" crew section.
- Images in any other folder (for example `houses/`) appear in the "Our Work" gallery.
  Photos listed in `FEATURED` in `lib/images.ts` lead the gallery in that order (the first is the
  hero background), and `HIDDEN` skips near-duplicates.
- `public/og-image.jpg` is the 1200x630 image shown when the link is shared.

Supported formats: jpg, png, webp, avif, gif.
