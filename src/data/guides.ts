import type { PosterRatio, PosterTemplate } from "@/core/types";

export interface Guide {
  slug: string;
  title: string;
  description: string;
  eyebrow: string;
  intro: string;
  steps: string[];
  notes: string[];
  artworkId: number;
  template: PosterTemplate;
  ratio: PosterRatio;
}

export const GUIDES: Guide[] = [
  {
    slug: "museum-poster-maker",
    title: "Museum Poster Maker",
    description:
      "Turn a verified public-domain museum work into a balanced exhibition poster with source credits.",
    eyebrow: "Exhibition format",
    intro:
      "A useful museum poster does more than place a title under a picture. It protects the image, establishes a reading order, and keeps the source visible without competing with the work.",
    steps: [
      "Search an artist, artwork, or visual subject and choose a work marked public domain.",
      "Start with Exhibition when the artwork is wide or already has a strong internal frame.",
      "Use zoom only to remove dead edges; keep the main gesture or face inside the safe area.",
      "Export 4:5 for a versatile social and small-print composition.",
    ],
    notes: [
      "Long titles are automatically sized and wrapped inside a fixed typographic zone.",
      "The source line remains on every free export so the artwork stays traceable.",
    ],
    artworkId: 24645,
    template: "exhibition",
    ratio: "portrait",
  },
  {
    slug: "art-wallpaper-maker",
    title: "Art Wallpaper Maker",
    description:
      "Create a tall phone wallpaper from a public-domain painting without losing the focal subject.",
    eyebrow: "Mobile format",
    intro:
      "Phone wallpapers need a deliberate crop. The full-bleed layout uses a stable information band so the title stays readable while most of the screen remains image.",
    steps: [
      "Choose a painting with broad color fields or a clear central subject.",
      "Switch to Full bleed and 9:16, then move the focal point away from status-bar areas.",
      "Increase zoom in small increments; extreme crops quickly remove the visual context.",
      "Download the 1080×1920 PNG and set it from your device photo library.",
    ],
    notes: [
      "Monet's Water Lilies keeps visual detail across both light and dark phone interfaces.",
      "Atelier Zero never uploads the exported wallpaper or your device settings.",
    ],
    artworkId: 16568,
    template: "full-bleed",
    ratio: "story",
  },
  {
    slug: "public-domain-art-print",
    title: "Public-Domain Art Print",
    description:
      "Prepare a clearly credited art print from an artwork the museum marks as public domain.",
    eyebrow: "Rights-aware format",
    intro:
      "Public-domain status should be checked at the source, not guessed from an artist's death date. Atelier Zero only enables works that the museum API marks reusable and links every result back to the collection record.",
    steps: [
      "Select a work carrying the verified public-domain marker.",
      "Use Archive when you want the accession-style artwork number and museum credit to remain prominent.",
      "Keep the artwork title and artist line intact when sharing the result elsewhere.",
      "Recheck the linked museum record before commercial or large-format use.",
    ],
    notes: [
      "The first release exports digital PNG files; print fulfillment is intentionally out of scope.",
      "A future print-size option will be considered only after users signal real demand.",
    ],
    artworkId: 28560,
    template: "archive",
    ratio: "portrait",
  },
];

export function findGuideBySlug(slug: string) {
  return GUIDES.find((guide) => guide.slug === slug);
}
