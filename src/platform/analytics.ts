export type ProductEvent =
  | "studio_viewed"
  | "artwork_selected"
  | "poster_rendered"
  | "poster_downloaded"
  | "poster_shared"
  | "print_export_interest";

type EventProperties = Record<string, string | number | boolean>;

export function trackProductEvent(name: ProductEvent, properties: EventProperties = {}) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("atelier-zero:analytics", {
      detail: { name, properties },
    }),
  );

  void import("@vercel/analytics").then(({ track }) => {
    track(name, properties);
  });
}
