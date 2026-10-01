# Roofline measurement and quote workflow

1. Collect the property street address and city. Confirm which edges the customer
   wants lit: front only, selected rooflines, or the full exterior perimeter. Ask
   for photos when trees or satellite imagery obscure a roof section.
2. Open https://earth.google.com/web/ and search the address. Use a top-down view,
   select Measure, trace the selected roof edges, and choose feet. For a complete
   perimeter, include every exterior edge and the closing segment. For separate
   rooflines, measure each path independently and add the lengths once.
3. Record each segment, the total linear feet, imagery date where available, and
   uncertain sections. Measure length, not roof area in square feet. Avoid counting
   shared or overlapping edges twice.
4. Confirm sloped gables, roof height, access, and hidden sections on site or with
   an appropriate roof measurement report. Google Earth's web measurements do not
   account for elevation changes. For a sloped segment with known horizontal run
   and vertical rise, its length is sqrt(run² + rise²). Do not guess pitch from
   the aerial image.
5. Calculate the preliminary roofline range: confirmed linear feet × $8–$15.
   An average tree uses four strands and is approximately $100 per tree, not $100
   per strand. Quote larger trees and additional decorations individually.
   Example: 150 feet and three average trees = $1,500–$2,550.
6. Confirm the final scope and price with the customer, including seasonal rental,
   installation, year-end takedown, and collection. The lights remain BBrite's
   property and are taken back. Confirm the actual removal appointment separately.
   Display ranges on the website are $1,000–$3,000 and $4,000–$9,000; custom projects
   are quoted individually.

The website does not automatically measure a roof or import measurements from
Google Earth. The address supports this manual workflow, while the optional
calculator accepts measurements entered by the customer. No mapping API key is
needed. Final pricing is subject to confirmed measurements and installation access.

Google's measurement instructions:
https://support.google.com/earth/answer/9010337?co=GENIE.Platform%3DDesktop&hl=en
