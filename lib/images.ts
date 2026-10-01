import fs from "node:fs";
import path from "node:path";

// Photos are discovered from /public at build time, so new pictures show up
// on the site just by dropping them into the right folder:
//   - a folder whose name mentions crew/install/workers/team/progress is treated
//     as the crew at work
//   - images in any other folder also land in the finished-homes gallery
//   - any image whose file name contains "logo" is the logo (see PREFERRED_LOGO)

const PUBLIC_DIR = path.join(process.cwd(), "public");
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

// Curation. File names (not paths) listed in FEATURED lead the gallery in this
// order, and the first one is the hero background. HIDDEN files are skipped.
const FEATURED = [
  "20251130_174404.jpg",
  "our-best-mansion-lights-on-the-water.jpg",
  "20251130_172402.jpg",
  "20251201_185508.jpg",
  "night-time-clean-lights.jpg",
  "20251110_185811.jpg",
  "20251126_170508.jpg",
  "20251125_171522.jpg",
  "red-and-white-lights.jpg",
  "20251106_174255.jpg",
  "20251122_172932.jpg",
  "20251130_180925.jpg",
];
const HIDDEN = new Set([
  // Near-duplicates or motion-blurred shots of homes already in the gallery
  "20251119_175548.jpg",
  "20251110_185815.jpg",
  "20251126_170527.jpg",
  "20251130_180936.jpg",
  "20251201_185512.jpg",
  "20251122_173313.jpg",
]);
const CREW_FEATURED = [
  "picture-of-3-workers-setting-up-lights-on-the-roof.jpg",
  "workers-on-trees-and-roof.jpg",
  "chris-finn-on-ladder.jpg",
  "chris-finn-balancing-ladder-on-corner-of-house.jpg",
];

// Use the extravagant square logo throughout the site's branding.
const PREFERRED_LOGO = "brand/holiday-lights-extravagant-logo-transparent.png";
const PREFERRED_EMBLEM = PREFERRED_LOGO;

const CREW_WORDS = /(crew|install|worker|working|team|progress|process|behind|before|action)/i;

export type SiteImage = { src: string; alt: string };

type Found = { rel: string; dir: string; file: string };

function walk(dir: string, out: Found[] = []): Found[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (IMAGE_EXT.test(entry.name)) {
      const rel = path.relative(PUBLIC_DIR, full).split(path.sep).join("/");
      out.push({ rel, dir: path.dirname(rel), file: entry.name });
    }
  }
  return out;
}

function toSrc(rel: string) {
  return "/" + rel.split("/").map(encodeURIComponent).join("/");
}

const byName = (a: Found, b: Found) =>
  a.rel.localeCompare(b.rel, undefined, { numeric: true });

function featuredFirst(list: string[]) {
  const rank = (f: Found) => {
    const i = list.indexOf(f.file);
    return i === -1 ? list.length : i;
  };
  return (a: Found, b: Found) => rank(a) - rank(b) || byName(a, b);
}

/** Descriptive file names ("red-and-white-lights.jpg") make better alt text than camera names. */
function describe(file: string) {
  const base = file.replace(IMAGE_EXT, "");
  if (!/[a-z]{3,}/i.test(base)) return null;
  const words = base
    .replace(/[-_\s]+/g, " ")
    .replace(/^(blurry )?pictures? of (the )?/i, "")
    .trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function collect() {
  const all = walk(PUBLIC_DIR).sort(byName);

  const logos = all.filter((f) => /logo/i.test(f.file));
  const logoFile =
    logos.find((f) => f.rel === PREFERRED_LOGO) ??
    logos.find((f) => /\.png$/i.test(f.file)) ??
    logos[0];
  const emblemFile = logos.find((f) => f.rel === PREFERRED_EMBLEM) ?? logoFile;

  const houseFiles: Found[] = [];
  const crewFiles: Found[] = [];

  for (const f of all) {
    if (/logo/i.test(f.file) || f.dir === "." || HIDDEN.has(f.file)) continue;
    // Crew-named folders go to the crew section; everything else to the gallery.
    (CREW_WORDS.test(f.dir) ? crewFiles : houseFiles).push(f);
  }

  const toImages = (files: Found[], fallback: string) =>
    files.map((f, i) => ({
      src: toSrc(f.rel),
      alt: describe(f.file) ?? `${fallback} (${i + 1})`,
    }));

  return {
    logo: logoFile ? toSrc(logoFile.rel) : null,
    emblem: emblemFile ? toSrc(emblemFile.rel) : null,
    houses: toImages(
      houseFiles.sort(featuredFirst(FEATURED)),
      "Orange County home lit up with a custom Christmas light display",
    ),
    crew: toImages(
      crewFiles.sort(featuredFirst(CREW_FEATURED)),
      "Holiday Lights crew installing Christmas lights on an Orange County home",
    ),
  };
}

let cached: ReturnType<typeof collect> | null = null;

export function getSiteImages() {
  cached ??= collect();
  return cached;
}
