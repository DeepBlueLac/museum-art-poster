import { describe, expect, it } from "vitest";
import { getArtworkImageUrl, normalizeArtwork } from "@/services/artic";

const rawArtwork = {
  id: 24645,
  title: "The Great Wave",
  artist_title: "Katsushika Hokusai",
  date_display: "1830/33",
  image_id: "image-id",
  is_public_domain: true,
  department_title: "Arts of Asia",
  thumbnail: { alt_text: "A large wave" },
};

describe("Art Institute normalization", () => {
  it("accepts only public-domain records with an image", () => {
    expect(
      normalizeArtwork({ ...rawArtwork, is_public_domain: false }, "https://example.com/iiif/2"),
    ).toBeNull();
    expect(
      normalizeArtwork({ ...rawArtwork, image_id: null }, "https://example.com/iiif/2"),
    ).toBeNull();

    const artwork = normalizeArtwork(rawArtwork, "https://example.com/iiif/2/");
    expect(artwork).toMatchObject({
      id: 24645,
      imageId: "image-id",
      isPublicDomain: true,
    });
    expect(artwork?.iiifBase).toBe("https://example.com/iiif/2");
  });

  it("clamps IIIF widths to the museum-supported export ceiling", () => {
    const artwork = normalizeArtwork(rawArtwork, "https://example.com/iiif/2");
    expect(artwork).not.toBeNull();
    expect(getArtworkImageUrl(artwork!, 5000)).toContain("/full/1686,/0/default.jpg");
  });

  it("rejects insecure image service origins", () => {
    expect(() => normalizeArtwork(rawArtwork, "http://example.com/iiif/2")).toThrow(
      "must use HTTPS",
    );
  });
});
