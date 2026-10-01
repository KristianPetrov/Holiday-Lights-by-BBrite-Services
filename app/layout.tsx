import fs from "node:fs";
import path from "node:path";
import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { site } from "@/lib/site";
import { getSiteImages } from "@/lib/images";
import "./globals.css";

const display = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
});

const body = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

// public/og-image.jpg is a 1200x630 share card; fall back to a photo if it's missing.
const { houses, logo } = getSiteImages();
const shareImage = fs.existsSync(path.join(process.cwd(), "public/og-image.jpg"))
  ? "/og-image.jpg"
  : (houses[0]?.src ?? logo ?? undefined);

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Christmas Light Rentals in OC & Long Beach`,
    template: `%s | ${site.shortName}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "Christmas light installation",
    "Orange County Christmas lights",
    "holiday lighting",
    "Christmas light takedown",
    "professional Christmas light installers",
    "Long Beach Christmas lights",
    "Seal Beach Christmas lights",
    "Sunset Beach Christmas lights",
    "Corona del Mar Christmas lights",
    "Cerritos Christmas lights",
    "Newport Beach Christmas lights",
    "Huntington Beach Christmas lights",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: `${site.name} | Christmas Lights in OC & Long Beach`,
    description: site.description,
    locale: "en_US",
    ...(shareImage ? { images: [{ url: shareImage, width: 1200, height: 630, alt: site.name }] } : {}),
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Christmas Lights in OC & Long Beach`,
    description: site.description,
    ...(shareImage ? { images: [shareImage] } : {}),
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
