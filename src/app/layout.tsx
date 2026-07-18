import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import {
  SITE_URL,
  StructuredData,
  webApplicationStructuredData,
} from "@/platform/structured-data";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Atelier Zero — Museum Poster Maker",
    template: "%s · Atelier Zero",
  },
  description:
    "Create downloadable posters and wallpapers from verified public-domain museum art. No account, no upload, clear source credits.",
  keywords: [
    "museum poster maker",
    "public domain art poster",
    "art wallpaper maker",
    "printable museum art",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Atelier Zero",
    title: "Atelier Zero — Museum Poster Maker",
    description:
      "Turn verified public-domain museum art into a finished poster in under a minute.",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atelier Zero — Museum Poster Maker",
    description: "Create a finished poster from public-domain museum art.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StructuredData data={webApplicationStructuredData()} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
