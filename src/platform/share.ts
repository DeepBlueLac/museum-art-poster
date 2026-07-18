import { serializePosterState } from "@/core/poster-state";
import type { PosterState } from "@/core/types";

export function buildShareUrl(state: PosterState, baseUrl?: string) {
  const fallbackBase = "https://museum-art-poster.vercel.app/";
  const url = new URL(
    baseUrl ?? (typeof window !== "undefined" ? window.location.href : fallbackBase),
  );
  url.pathname = "/";
  url.search = serializePosterState(state).toString();
  url.searchParams.set("utm_source", "share");
  url.searchParams.set("utm_medium", "poster");
  url.hash = "";
  return url.toString();
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

export async function copyShareLink(url: string) {
  await copyText(url);
}

export async function sharePoster(options: {
  blob: Blob;
  filename: string;
  title: string;
  url: string;
}) {
  const file = new File([options.blob], options.filename, { type: "image/png" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: options.title,
      text: "Made from a public-domain museum artwork in Atelier Zero.",
      url: options.url,
      files: [file],
    });
    return "shared" as const;
  }

  if (navigator.share) {
    await navigator.share({ title: options.title, url: options.url });
    return "shared" as const;
  }

  await copyText(options.url);
  return "copied" as const;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
