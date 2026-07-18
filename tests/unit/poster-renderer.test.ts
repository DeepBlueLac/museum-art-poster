import { describe, expect, it } from "vitest";
import { calculateCoverCrop, EXPORT_SIZES, getPreviewSize } from "@/core/poster-renderer";

describe("poster renderer geometry", () => {
  it("keeps cover crops inside the image at every focal extreme", () => {
    for (const focusX of [-1, 0, 1]) {
      for (const focusY of [-1, 0, 1]) {
        const crop = calculateCoverCrop(1600, 900, 720, 900, 1.6, focusX, focusY);
        expect(crop.sx).toBeGreaterThanOrEqual(0);
        expect(crop.sy).toBeGreaterThanOrEqual(0);
        expect(crop.sx + crop.sw).toBeLessThanOrEqual(1600.0001);
        expect(crop.sy + crop.sh).toBeLessThanOrEqual(900.0001);
      }
    }
  });

  it("uses stable preview aspect ratios derived from export sizes", () => {
    for (const ratio of Object.keys(EXPORT_SIZES) as Array<keyof typeof EXPORT_SIZES>) {
      const preview = getPreviewSize(ratio, 720);
      const output = EXPORT_SIZES[ratio];
      expect(preview.width / preview.height).toBeCloseTo(output.width / output.height, 2);
    }
  });
});
