import { z } from "zod";
import type { Artwork } from "@/core/types";

const API_ROOT = "https://api.artic.edu/api/v1";
const ARTWORK_FIELDS = [
  "id",
  "title",
  "artist_title",
  "date_display",
  "image_id",
  "is_public_domain",
  "department_title",
  "thumbnail",
].join(",");

const rawArtworkSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  artist_title: z.string().nullable().optional(),
  date_display: z.string().nullable().optional(),
  image_id: z.string().nullable().optional(),
  is_public_domain: z.boolean(),
  department_title: z.string().nullable().optional(),
  thumbnail: z
    .object({
      alt_text: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

const searchResponseSchema = z.object({
  data: z.array(rawArtworkSchema),
  config: z.object({
    iiif_url: z.string().url(),
  }),
});

const detailResponseSchema = z.object({
  data: rawArtworkSchema,
  config: z.object({
    iiif_url: z.string().url(),
  }),
});

let lastRequestAt = 0;
let requestQueue = Promise.resolve();

function wait(milliseconds: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Request aborted", "AbortError"));
      return;
    }
    const timeout = window.setTimeout(resolve, milliseconds);
    signal?.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timeout);
        reject(new DOMException("Request aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

async function waitForRequestSlot(signal?: AbortSignal) {
  const slot = requestQueue.then(async () => {
    const remaining = Math.max(0, 1000 - (Date.now() - lastRequestAt));
    if (remaining > 0) await wait(remaining, signal);
    lastRequestAt = Date.now();
  });
  requestQueue = slot.catch(() => undefined);
  await slot;
}

function normalizeIiifBase(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:") {
    throw new Error("Museum image service must use HTTPS.");
  }
  return url.toString().replace(/\/$/, "");
}

export function normalizeArtwork(
  raw: z.infer<typeof rawArtworkSchema>,
  iiifBase: string,
): Artwork | null {
  if (!raw.is_public_domain || !raw.image_id) return null;

  return {
    id: raw.id,
    title: raw.title,
    artist: raw.artist_title?.trim() || "Unknown artist",
    date: raw.date_display?.trim() || "Date unknown",
    imageId: raw.image_id,
    iiifBase: normalizeIiifBase(iiifBase),
    isPublicDomain: true,
    department: raw.department_title?.trim() || undefined,
    altText:
      raw.thumbnail?.alt_text?.trim() ||
      `${raw.title} by ${raw.artist_title?.trim() || "an unknown artist"}`,
  };
}

export function getArtworkImageUrl(artwork: Artwork, width = 843) {
  const safeWidth = Math.min(1686, Math.max(200, Math.round(width)));
  return `${artwork.iiifBase}/${artwork.imageId}/full/${safeWidth},/0/default.jpg`;
}

export function getArtworkSourceUrl(artwork: Artwork) {
  return `https://www.artic.edu/artworks/${artwork.id}`;
}

async function fetchJson(url: URL, signal?: AbortSignal) {
  await waitForRequestSlot(signal);
  const response = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Museum request failed (${response.status}).`);
  }
  return response.json() as Promise<unknown>;
}

export async function searchArtworks(query: string, signal?: AbortSignal) {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2 || normalizedQuery.length > 80) return [];

  const url = new URL(`${API_ROOT}/artworks/search`);
  url.searchParams.set("q", normalizedQuery);
  url.searchParams.set("limit", "16");
  url.searchParams.set("fields", ARTWORK_FIELDS);
  url.searchParams.set("query[term][is_public_domain]", "true");
  const parsed = searchResponseSchema.parse(await fetchJson(url, signal));

  return parsed.data
    .map((raw) => normalizeArtwork(raw, parsed.config.iiif_url))
    .filter((artwork): artwork is Artwork => artwork !== null)
    .slice(0, 12);
}

export async function lookupArtwork(id: number, signal?: AbortSignal) {
  if (!Number.isInteger(id) || id <= 0) return null;
  const url = new URL(`${API_ROOT}/artworks/${id}`);
  url.searchParams.set("fields", ARTWORK_FIELDS);
  const parsed = detailResponseSchema.parse(await fetchJson(url, signal));
  return normalizeArtwork(parsed.data, parsed.config.iiif_url);
}
