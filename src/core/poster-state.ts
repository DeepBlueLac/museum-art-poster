import { z } from "zod";
import {
  POSTER_RATIOS,
  POSTER_TEMPLATES,
  type PosterState,
} from "@/core/types";

export const DEFAULT_POSTER_STATE: PosterState = {
  artworkId: 24645,
  template: "exhibition",
  ratio: "portrait",
  scale: 1,
  focusX: 0,
  focusY: 0,
};

const queryStateSchema = z.object({
  art: z.coerce.number().int().positive().catch(DEFAULT_POSTER_STATE.artworkId),
  layout: z.enum(POSTER_TEMPLATES).catch(DEFAULT_POSTER_STATE.template),
  ratio: z.enum(POSTER_RATIOS).catch(DEFAULT_POSTER_STATE.ratio),
  scale: z.coerce.number().min(1).max(1.8).catch(DEFAULT_POSTER_STATE.scale),
  fx: z.coerce.number().min(-1).max(1).catch(DEFAULT_POSTER_STATE.focusX),
  fy: z.coerce.number().min(-1).max(1).catch(DEFAULT_POSTER_STATE.focusY),
});

function roundStateValue(value: number) {
  return Math.round(value * 100) / 100;
}

export function parsePosterState(
  params: URLSearchParams,
  fallback: PosterState = DEFAULT_POSTER_STATE,
): PosterState {
  const result = queryStateSchema.safeParse({
    art: params.get("art") ?? fallback.artworkId,
    layout: params.get("layout") ?? fallback.template,
    ratio: params.get("ratio") ?? fallback.ratio,
    scale: params.get("scale") ?? fallback.scale,
    fx: params.get("fx") ?? fallback.focusX,
    fy: params.get("fy") ?? fallback.focusY,
  });

  if (!result.success) {
    return fallback;
  }

  return {
    artworkId: result.data.art,
    template: result.data.layout,
    ratio: result.data.ratio,
    scale: roundStateValue(result.data.scale),
    focusX: roundStateValue(result.data.fx),
    focusY: roundStateValue(result.data.fy),
  };
}

export function serializePosterState(state: PosterState) {
  const params = new URLSearchParams();
  params.set("art", String(state.artworkId));
  params.set("layout", state.template);
  params.set("ratio", state.ratio);
  params.set("scale", roundStateValue(state.scale).toFixed(2));
  params.set("fx", roundStateValue(state.focusX).toFixed(2));
  params.set("fy", roundStateValue(state.focusY).toFixed(2));
  return params;
}

export function updatePosterState(
  state: PosterState,
  patch: Partial<PosterState>,
): PosterState {
  return parsePosterState(
    serializePosterState({
      ...state,
      ...patch,
    }),
  );
}
