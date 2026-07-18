import type { MetadataRoute } from "next";
import { CURATED_ARTWORKS } from "@/data/curated-artworks";
import { GUIDES } from "@/data/guides";
import { SITE_URL } from "@/platform/structured-data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const updatedAt = new Date("2026-07-19T00:00:00Z");
  return [
    { url: SITE_URL, lastModified: updatedAt, changeFrequency: "weekly", priority: 1 },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: updatedAt,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    ...GUIDES.map((guide) => ({
      url: `${SITE_URL}/guides/${guide.slug}`,
      lastModified: updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    ...CURATED_ARTWORKS.map((artwork) => ({
      url: `${SITE_URL}/artworks/${artwork.slug}`,
      lastModified: updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      images: [
        `https://www.artic.edu/iiif/2/${artwork.imageId}/full/843,/0/default.jpg`,
      ],
    })),
  ];
}
