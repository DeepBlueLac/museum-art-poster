import type { CuratedArtwork } from "@/core/types";

const IIIF_BASE = "https://www.artic.edu/iiif/2";

export const CURATED_ARTWORKS: CuratedArtwork[] = [
  {
    id: 24645,
    slug: "the-great-wave",
    title:
      'Under the Wave off Kanagawa, also known as The Great Wave, from "Thirty-Six Views of Mount Fuji"',
    artist: "Katsushika Hokusai",
    date: "1830/33",
    imageId: "b3974542-b9b4-7568-fc4b-966738f61d78",
    iiifBase: IIIF_BASE,
    isPublicDomain: true,
    department: "Arts of Asia",
    altText: "Hokusai woodblock print of a towering blue wave above boats with Mount Fuji in the distance",
    note: "A wide image that rewards an exhibition layout with generous type below the horizon.",
    recommendedTemplate: "exhibition",
    recommendedRatio: "portrait",
  },
  {
    id: 27992,
    slug: "a-sunday-on-la-grande-jatte",
    title: "A Sunday on La Grande Jatte — 1884",
    artist: "Georges Seurat",
    date: "1884–86, border added 1888–89",
    imageId: "2d484387-2509-5e8e-2c43-22f9981972eb",
    iiifBase: IIIF_BASE,
    isPublicDomain: true,
    department: "Painting and Sculpture of Europe",
    altText: "Pointillist park scene with figures resting beside the River Seine",
    note: "The built-in painted border suits a restrained archive treatment and square crop.",
    recommendedTemplate: "archive",
    recommendedRatio: "square",
  },
  {
    id: 16568,
    slug: "water-lilies",
    title: "Water Lilies",
    artist: "Claude Monet",
    date: "1906",
    imageId: "3c27b499-af56-f0d5-93b5-a7f2f1ad5813",
    iiifBase: IIIF_BASE,
    isPublicDomain: true,
    department: "Painting and Sculpture of Europe",
    altText: "Soft green and violet water lilies floating across a reflective pond",
    note: "An atmospheric field of color that works especially well as a full-bleed wallpaper.",
    recommendedTemplate: "full-bleed",
    recommendedRatio: "story",
  },
  {
    id: 20684,
    slug: "paris-street-rainy-day",
    title: "Paris Street; Rainy Day",
    artist: "Gustave Caillebotte",
    date: "1877",
    imageId: "f8fd76e9-c396-5678-36ed-6a348c904d27",
    iiifBase: IIIF_BASE,
    isPublicDomain: true,
    department: "Painting and Sculpture of Europe",
    altText: "Umbrella-carrying pedestrians crossing a broad Paris intersection in the rain",
    note: "Strong perspective and open pavement leave useful negative space for editorial type.",
    recommendedTemplate: "exhibition",
    recommendedRatio: "portrait",
  },
  {
    id: 28560,
    slug: "the-bedroom",
    title: "The Bedroom",
    artist: "Vincent van Gogh",
    date: "1889",
    imageId: "6644829f-f292-c5c4-a73c-0356a6fdbf0d",
    iiifBase: IIIF_BASE,
    isPublicDomain: true,
    department: "Painting and Sculpture of Europe",
    altText: "Van Gogh painting of a bright blue bedroom with a wooden bed and chairs",
    note: "Compressed perspective and bold color hold up well in a compact archive frame.",
    recommendedTemplate: "archive",
    recommendedRatio: "portrait",
  },
  {
    id: 80607,
    slug: "van-gogh-self-portrait",
    title: "Self-Portrait",
    artist: "Vincent van Gogh",
    date: "1887",
    imageId: "47c5bcb8-62ef-e5d7-55e7-f5121f409a30",
    iiifBase: IIIF_BASE,
    isPublicDomain: true,
    department: "Painting and Sculpture of Europe",
    altText: "Vincent van Gogh self-portrait with a straw hat against a blue background",
    note: "A face-forward composition designed for a tall, full-bleed social format.",
    recommendedTemplate: "full-bleed",
    recommendedRatio: "story",
  },
];

export const DEFAULT_ARTWORK = CURATED_ARTWORKS[0];

export function findCuratedArtworkById(id: number) {
  return CURATED_ARTWORKS.find((artwork) => artwork.id === id);
}

export function findCuratedArtworkBySlug(slug: string) {
  return CURATED_ARTWORKS.find((artwork) => artwork.slug === slug);
}
