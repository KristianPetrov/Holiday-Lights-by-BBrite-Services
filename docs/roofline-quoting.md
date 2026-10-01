# Roofline measurement and quote workflow

The site uses free public mapping services with no API keys: the U.S. Census
geocoder finds an address, USGS The National Map supplies aerial imagery, and a
locally hosted Overture Maps building extract supplies selectable outlines.
The only hosting costs are those covered by the existing Vercel plan and usage
limits. There is no per-lookup fee from these mapping services.

1. Enter the property street address and choose a service-area city, then select
   **Find My House**. Only the address and city go to Census; the route does not
   store them. Census coordinates can sit on the street, so the visitor must
   visually confirm the correct building on the aerial image.
2. Select the building outline for its approximate full exterior perimeter, or
   choose **Trace Roof Edges** for front-only lights or other selected edges.
   Tap consecutive corners. Use **Close Full Perimeter** only for a complete loop;
   use **Add Another Roofline** for separate paths without a connecting segment.
   Zoom and move the view as needed. Do not count shared edges twice.
3. Choose **Use This Length in My Estimate** to apply rounded linear feet to the
   calculator. Editing the address clears any applied map measurement. Manual
   entry is available if an address, image, or building outline is unavailable.
   The email request records the measurement source for the team to review.
4. Verify sloped gables, roof height, access, hidden edges, and imagery age before
   issuing a final quote. A horizontal building footprint is a rough starting
   point, not the exact roofline: eaves, gables, and multiple roof levels differ.
   Ask for photos or measure on site. Do not guess roof pitch from the image.
5. Preliminary roofline range = linear feet × $8–$15. An average tree uses four
   strands and costs approximately $100 per tree, not per strand. Example:
   150 feet plus three average trees = $1,500–$2,550. Larger trees and extra
   decorations need individual quotes.
6. Confirm the scope and final price, including seasonal light rental, design,
   installation, year-end takedown and collection. Lights remain BBrite's property.
   Display package ranges are $1,000–$3,000 and $4,000–$9,000; custom projects
   are quoted individually. The form prepares an email in the visitor's mail app;
   the visitor still needs to send it.

## Manual fallback

The team can also search the address in https://earth.google.com/web/, select
Measure, trace each desired roofline, choose feet, and enter the total manually.
Google Earth web measurements do not account for elevation changes. For a known
horizontal run and vertical rise, sloped length is sqrt(run² + rise²).
See [Google's measurement instructions](https://support.google.com/earth/answer/9010337?co=GENIE.Platform%3DDesktop&hl=en).

## Refresh the local building extract

The initial regional extract is Overture release `2026-09-23.1`, covering all seven
service areas. Download and preparation happen offline; production does not call
Overture or require a database. Each visit downloads only nearby compressed tiles.
Use a temporary Python virtual environment with the official `overturemaps` CLI:

```sh
python3 -m venv /tmp/holiday-roof-data-env
/tmp/holiday-roof-data-env/bin/pip install overturemaps
/tmp/holiday-roof-data-env/bin/overturemaps download --no-stac --release=2026-09-23.1 --bbox=-118.26,33.55,-117.75,33.91 -f geojsonseq --type=building -o /tmp/holiday-service-buildings.geojsonseq
python3 scripts/prepare-roof-data.py /tmp/holiday-service-buildings.geojsonseq
pnpm test
```

When selecting a newer release, update the release label in the preparation script
and attribution file before regenerating. Public tiles and the index are the
modified database, distributed under ODbL 1.0 with contributor attribution at
`public/roof-data/attribution.txt`. Do not remove these credits.

Sources: [Census API](https://geocoding.geo.census.gov/geocoder/Geocoding_Services_API.html),
[USGS imagery](https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer),
[Overture CLI](https://docs.overturemaps.org/getting-data/overturemaps-py/),
[Overture attribution](https://docs.overturemaps.org/attribution/#buildings).
