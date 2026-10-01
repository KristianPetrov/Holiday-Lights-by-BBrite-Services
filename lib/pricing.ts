import { site } from "@/lib/site";

export function estimateLighting(feet: number, trees: number) {
  const length = Number.isFinite(feet) ? Math.max(0, feet) : 0;
  const count = Number.isFinite(trees) ? Math.max(0, Math.floor(trees)) : 0;
  return {
    min: length * site.pricing.roofline.min + count * site.pricing.tree,
    max: length * site.pricing.roofline.max + count * site.pricing.tree,
  };
}
