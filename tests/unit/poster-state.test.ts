import { describe, expect, it } from "vitest";
import {
  DEFAULT_POSTER_STATE,
  parsePosterState,
  serializePosterState,
  updatePosterState,
} from "@/core/poster-state";

describe("poster state", () => {
  it("parses and serializes a safe share state", () => {
    const params = new URLSearchParams({
      art: "16568",
      layout: "full-bleed",
      ratio: "story",
      scale: "1.42",
      fx: "-0.24",
      fy: "0.36",
    });

    const state = parsePosterState(params);
    expect(state).toEqual({
      artworkId: 16568,
      template: "full-bleed",
      ratio: "story",
      scale: 1.42,
      focusX: -0.24,
      focusY: 0.36,
    });
    expect(parsePosterState(serializePosterState(state))).toEqual(state);
  });

  it("falls back when query values exceed their contract", () => {
    const state = parsePosterState(
      new URLSearchParams({
        art: "-3",
        layout: "freeform",
        ratio: "cinema",
        scale: "99",
        fx: "8",
        fy: "nan",
      }),
    );

    expect(state).toEqual(DEFAULT_POSTER_STATE);
  });

  it("clamps updates through the same validation path", () => {
    const state = updatePosterState(DEFAULT_POSTER_STATE, {
      scale: 9,
      focusX: -7,
    });
    expect(state.scale).toBe(1);
    expect(state.focusX).toBe(0);
  });
});
