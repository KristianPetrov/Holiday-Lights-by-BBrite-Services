import { site } from "@/lib/site";

export function houseLightingFeet(perimeter: number) {
  return Number.isFinite(perimeter) ? Math.max(0, perimeter) / 2 : 0;
}

export function estimateLighting(perimeter: number, trees: number) {
  const length = houseLightingFeet(perimeter);
  const count = Number.isFinite(trees) ? Math.max(0, Math.floor(trees)) : 0;
  return {
    min: length * site.pricing.roofline.min + count * site.pricing.tree,
    max: length * site.pricing.roofline.max + count * site.pricing.tree,
  };
}
