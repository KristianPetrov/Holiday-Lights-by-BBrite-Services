"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { SiteImage } from "@/lib/images";

/** Photo grid with a keyboard-friendly lightbox. */
export default function Gallery({
  images,
  limit,
  compact = false,
}: {
  images: SiteImage[];
  limit?: number;
  /** Two-column layout for use inside a narrower column. */
  compact?: boolean;
}) {
  const [active, setActive] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const shown = showAll || !limit ? images : images.slice(0, limit);

  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (d: number) => setActive((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, step]);

  return (
    <>
      <ul
        className={
          compact
            ? "grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:gap-4"
            : "grid grid-flow-dense auto-rows-[220px] grid-cols-2 gap-3 sm:auto-rows-[260px] md:grid-cols-3 md:gap-4 lg:grid-cols-4"
        }
      >
        {shown.map((img, i) => (
          <li
            key={img.src}
            className={
              compact
                ? i === 0 && shown.length % 2 === 1
                  ? "col-span-2"
                  : ""
                : i % 7 === 0
                  ? "col-span-2 row-span-2"
                  : i % 7 === 4
                    ? "md:col-span-2"
                    : ""
            }
          >
            <button
              type="button"
              onClick={() => setActive(i)}
              className="group relative block h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-night-3"
              aria-label={`Open photo: ${img.alt}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes={compact ? "(min-width: 1024px) 30vw, 50vw" : "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"}
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-night/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </button>
          </li>
        ))}
      </ul>

      {limit && images.length > limit && !showAll && (
        <div className="mt-10 text-center">
          <button type="button" onClick={() => setShowAll(true)} className="btn-ghost">
            See all {images.length} photos
          </button>
        </div>
      )}

      {active !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-night/95 p-4 backdrop-blur"
          onClick={close}
        >
          <div className="relative h-[80vh] w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[active].src}
              alt={images[active].alt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={close}
            className="absolute right-5 top-5 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold hover:border-gold"
          >
            Close
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 p-3 hover:border-gold sm:left-6"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 p-3 hover:border-gold sm:right-6"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-mist">
                {active + 1} / {images.length}
              </p>
            </>
          )}
        </div>
      )}
    </>
  );
}
