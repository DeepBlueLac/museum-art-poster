import type { ReactNode } from "react";
import type { Artwork } from "@/core/types";
import { getArtworkImageUrl, getArtworkSourceUrl } from "@/services/artic";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://museum-art-poster.vercel.app";

export function webApplicationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Atelier Zero",
    url: SITE_URL,
    description:
      "Create downloadable posters and wallpapers from verified public-domain museum artworks.",
    applicationCategory: "DesignApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with Canvas support",
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "USD",
    },
  };
}

export function artworkStructuredData(artwork: Artwork, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: artwork.title,
    creator: {
      "@type": "Person",
      name: artwork.artist,
    },
    dateCreated: artwork.date,
    contentUrl: getArtworkImageUrl(artwork, 1686),
    acquireLicensePage: getArtworkSourceUrl(artwork),
    creditText: "Art Institute of Chicago, public domain",
    isPartOf: `${SITE_URL}${path}`,
  };
}

export function StructuredData({ data }: { data: unknown }): ReactNode {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
