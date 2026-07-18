import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Atelier Zero — Museum Poster Maker",
    short_name: "Atelier Zero",
    description: "Create posters from verified public-domain museum art.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2f0e8",
    theme_color: "#161616",
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
