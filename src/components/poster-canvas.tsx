"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { EXPORT_SIZES, getPreviewSize, renderPoster } from "@/core/poster-renderer";
import type { Artwork, PosterState } from "@/core/types";
import { loadArtworkImage } from "@/platform/image-loader";

export interface PosterCanvasHandle {
  exportBlob: () => Promise<Blob>;
}

interface PosterCanvasProps {
  artwork: Artwork;
  state: PosterState;
  onRendered?: () => void;
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("The browser could not create a PNG."));
    }, "image/png");
  });
}

export const PosterCanvas = forwardRef<PosterCanvasHandle, PosterCanvasProps>(
  function PosterCanvas({ artwork, state, onRendered }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const lastTrackedRenderRef = useRef("");
    const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

    useEffect(() => {
      let cancelled = false;
      setStatus("loading");
      loadArtworkImage(artwork)
        .then((image) => {
          if (cancelled) return;
          imageRef.current = image;
          setStatus("ready");
        })
        .catch(() => {
          if (!cancelled) setStatus("error");
        });

      return () => {
        cancelled = true;
      };
    }, [artwork]);

    useEffect(() => {
      const canvas = canvasRef.current;
      const image = imageRef.current;
      if (!canvas || !image || status !== "ready") return;
      const size = getPreviewSize(state.ratio);
      canvas.width = size.width;
      canvas.height = size.height;
      const context = canvas.getContext("2d");
      if (!context) return;
      renderPoster(context, size.width, size.height, artwork, image, state);

      const trackingKey = `${artwork.id}:${state.template}:${state.ratio}`;
      if (lastTrackedRenderRef.current !== trackingKey) {
        lastTrackedRenderRef.current = trackingKey;
        onRendered?.();
      }
    }, [artwork, onRendered, state, status]);

    useImperativeHandle(
      ref,
      () => ({
        exportBlob: async () => {
          await document.fonts.ready;
          const image = imageRef.current ?? (await loadArtworkImage(artwork));
          const size = EXPORT_SIZES[state.ratio];
          const canvas = document.createElement("canvas");
          canvas.width = size.width;
          canvas.height = size.height;
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Canvas is not available in this browser.");
          renderPoster(context, size.width, size.height, artwork, image, state);
          return canvasToBlob(canvas);
        },
      }),
      [artwork, state],
    );

    return (
      <div
        className="posterFrame"
        data-status={status}
      >
        <canvas
          ref={canvasRef}
          className="posterCanvas"
          data-testid="poster-canvas"
          aria-label={`Poster preview using ${artwork.title} by ${artwork.artist}`}
        />
        {status === "loading" ? (
          <div className="canvasStatus" role="status">
            <span className="statusTicker" />
            Preparing museum image
          </div>
        ) : null}
        {status === "error" ? (
          <div className="canvasStatus canvasStatusError" role="alert">
            Image unavailable. Keep your settings and try another work.
          </div>
        ) : null}
      </div>
    );
  },
);
