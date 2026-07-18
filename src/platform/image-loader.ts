import type { Artwork } from "@/core/types";
import { getArtworkImageUrl } from "@/services/artic";

const imageCache = new Map<string, Promise<HTMLImageElement>>();

export function loadArtworkImage(artwork: Artwork, width = 1686) {
  const url = getArtworkImageUrl(artwork, width);
  const cached = imageCache.get(url);
  if (cached) return cached;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The museum image could not be loaded."));
    image.src = url;
  }).catch((error) => {
    imageCache.delete(url);
    throw error;
  });

  imageCache.set(url, promise);
  return promise;
}
