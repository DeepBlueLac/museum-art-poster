export const POSTER_TEMPLATES = ["exhibition", "full-bleed", "archive"] as const;
export type PosterTemplate = (typeof POSTER_TEMPLATES)[number];

export const POSTER_RATIOS = ["portrait", "square", "story"] as const;
export type PosterRatio = (typeof POSTER_RATIOS)[number];

export interface Artwork {
  id: number;
  slug?: string;
  title: string;
  artist: string;
  date: string;
  imageId: string;
  iiifBase: string;
  isPublicDomain: true;
  department?: string;
  altText: string;
}

export interface PosterState {
  artworkId: number;
  template: PosterTemplate;
  ratio: PosterRatio;
  scale: number;
  focusX: number;
  focusY: number;
}

export interface CuratedArtwork extends Artwork {
  slug: string;
  note: string;
  recommendedTemplate: PosterTemplate;
  recommendedRatio: PosterRatio;
}
