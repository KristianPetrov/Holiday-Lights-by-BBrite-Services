# Holiday Lights by BBrite Services

Marketing site for [holidaylightsoc.com](https://holidaylightsoc.com): custom Christmas light
design, installation, and post-Christmas takedown in Orange County.

Built with Next.js (App Router) and Tailwind CSS. The whole site is prerendered as static HTML.

## Develop

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # production build
```

## Business details

Phone, email, pricing, and service-area cities live in `lib/site.ts`.
The phone number and email there are **placeholders** until the real ones are filled in.

## Photos and logo

The site finds images in `public/` automatically at build time:

- `logo.png` (or any image with "logo" in its name) is used in the header and footer.
- Images in a folder whose name mentions crew, install, workers, team, or progress
  (for example `crew/` or `Installing/`) appear in the "Behind the Glow" crew section.
- Images in any other folder (for example `houses/`) appear in the "Our Work" gallery.
  Photos listed in `FEATURED` in `lib/images.ts` lead the gallery in that order (the first is the
  hero background), and `HIDDEN` skips near-duplicates.
- `public/og-image.jpg` is the 1200x630 image shown when the link is shared.

Supported formats: jpg, png, webp, avif, gif.
