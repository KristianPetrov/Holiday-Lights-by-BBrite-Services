"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const NAV = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#work", label: "Our Work" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export default function Header({ logo, name }: { logo: string | null; name: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-white/10 bg-night/85 backdrop-blur-xl"
          : "bg-gradient-to-b from-night/80 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <a href="#top" className="flex items-center gap-3" aria-label={`${name} home`}>
          {logo ? (
            <Image
              src={logo}
              alt={`${name} logo`}
              width={1536}
              height={1024}
              sizes="160px"
              className="h-16 w-auto object-contain sm:h-[4.5rem] drop-shadow-[0_0_12px_rgb(244_197_106/0.25)]"
              preload
            />
          ) : (
            <span className="font-display text-lg font-semibold leading-tight">
              <span className="text-gold-gradient">Holiday Lights</span>
              <span className="block text-[0.65rem] font-sans font-bold uppercase tracking-[0.3em] text-mist">
                by BBrite Services
              </span>
            </span>
          )}
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-snow/80 transition-colors hover:text-gold"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a href="#contact" className="btn-primary hidden !px-5 !py-2.5 text-sm sm:inline-flex">
            Free Quote
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 px-5 pb-6 pt-2 lg:hidden" aria-label="Mobile">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-white/5 py-4 text-lg font-semibold"
            >
              {item.label}
            </a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)} className="btn-primary mt-6 w-full justify-center">
            Get My Free Quote
          </a>
        </nav>
      )}
    </header>
  );
}
