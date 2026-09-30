import fs from "node:fs";
import path from "node:path";

// Photos are discovered from /public at build time, so new pictures show up
// on the site just by dropping them into the right folder:
//   - a folder whose name mentions crew/install/workers/team/progress is treated
//     as the crew at work
//   - images in any other folder also land in the finished-homes gallery
//   - any image whose file name contains "logo" is the logo

const PUBLIC_DIR = path.join(process.cwd(), "public");
const IMAGE_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;

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

function collect() {
  const all = walk(PUBLIC_DIR).sort(byName);

  const logoFile =
    all.find((f) => /logo/i.test(f.file) && /\.png$/i.test(f.file)) ??
    all.find((f) => /logo/i.test(f.file));

  const houses: SiteImage[] = [];
  const crew: SiteImage[] = [];

  for (const f of all) {
    if (f === logoFile || /logo/i.test(f.file) || f.dir === ".") continue;
    if (CREW_WORDS.test(f.dir)) {
      crew.push({ src: toSrc(f.rel), alt: "Holiday Lights crew installing Christmas lights on an Orange County home" });
    } else {
      // House-named folders and anything unclassified go to the gallery.
      houses.push({ src: toSrc(f.rel), alt: "Orange County home lit up with a custom Christmas light display" });
    }
  }

  return {
    logo: logoFile ? toSrc(logoFile.rel) : null,
    houses: houses.map((img, i) => ({ ...img, alt: `${img.alt} (${i + 1})` })),
    crew: crew.map((img, i) => ({ ...img, alt: `${img.alt} (${i + 1})` })),
  };
}

let cached: ReturnType<typeof collect> | null = null;

export function getSiteImages() {
  cached ??= collect();
  return cached;
}
