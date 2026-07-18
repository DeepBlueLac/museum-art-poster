import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { ContentShell } from "@/components/content-shell";
import {
  CURATED_ARTWORKS,
  findCuratedArtworkBySlug,
} from "@/data/curated-artworks";
import {
  artworkStructuredData,
  StructuredData,
} from "@/platform/structured-data";
import { getArtworkImageUrl, getArtworkSourceUrl } from "@/services/artic";

export const dynamicParams = false;

export function generateStaticParams() {
  return CURATED_ARTWORKS.map((artwork) => ({ slug: artwork.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artwork = findCuratedArtworkBySlug(slug);
  if (!artwork) return {};
  const description = `Create a ${artwork.title} poster from the public-domain image provided by the Art Institute of Chicago.`;
  return {
    title: `${artwork.title} Poster Maker`,
    description,
    alternates: { canonical: `/artworks/${artwork.slug}` },
    openGraph: {
      type: "article",
      title: `${artwork.title} Poster Maker`,
      description,
      url: `/artworks/${artwork.slug}`,
      images: [{ url: getArtworkImageUrl(artwork, 843), alt: artwork.altText }],
    },
  };
}

export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artwork = findCuratedArtworkBySlug(slug);
  if (!artwork) notFound();
  const editorHref = `/?art=${artwork.id}&layout=${artwork.recommendedTemplate}&ratio=${artwork.recommendedRatio}&scale=1.00&fx=0.00&fy=0.00`;

  return (
    <ContentShell>
      <StructuredData
        data={artworkStructuredData(artwork, `/artworks/${artwork.slug}`)}
      />
      <main className="contentPage artworkPage">
        <Link href="/" className="backLink"><ArrowLeft size={16} /> Back to studio</Link>
        <header className="artworkHero">
          <div className="artworkHeroImage">
            <Image
              src={getArtworkImageUrl(artwork, 843)}
              alt={artwork.altText}
              width={843}
              height={760}
              sizes="(max-width: 720px) 100vw, 58vw"
              priority
              unoptimized
            />
          </div>
          <div className="artworkHeroCopy">
            <span className="eyebrow">Verified public domain · {String(artwork.id).padStart(6, "0")}</span>
            <h1>{artwork.title}</h1>
            <p className="artistLine">{artwork.artist}<br />{artwork.date}</p>
            <p>{artwork.note}</p>
            <dl className="presetDetails">
              <div><dt>Recommended layout</dt><dd>{artwork.recommendedTemplate}</dd></div>
              <div><dt>Recommended format</dt><dd>{artwork.recommendedRatio}</dd></div>
              <div><dt>Collection</dt><dd>{artwork.department}</dd></div>
            </dl>
            <Link href={editorHref} className="editorCta">
              Open poster preset <ArrowUpRight size={18} />
            </Link>
            <a href={getArtworkSourceUrl(artwork)} target="_blank" rel="noreferrer" className="museumRecordLink">
              View museum record <ExternalLink size={15} />
            </a>
          </div>
        </header>

        <section className="nextWorks" aria-labelledby="next-works-title">
          <div className="sectionLabel"><span>Next</span><h2 id="next-works-title">Try another composition</h2></div>
          <div className="nextWorksGrid">
            {CURATED_ARTWORKS.filter((item) => item.id !== artwork.id)
              .slice(0, 3)
              .map((item) => (
                <Link href={`/artworks/${item.slug}`} key={item.id}>
                  <Image src={getArtworkImageUrl(item, 400)} alt="" width={400} height={260} unoptimized />
                  <span>{item.title}</span>
                </Link>
              ))}
          </div>
        </section>
      </main>
    </ContentShell>
  );
}
