import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { notFound } from "next/navigation";
import { ContentShell } from "@/components/content-shell";
import { findCuratedArtworkById } from "@/data/curated-artworks";
import { findGuideBySlug, GUIDES } from "@/data/guides";
import { SITE_URL, StructuredData } from "@/platform/structured-data";
import { getArtworkImageUrl } from "@/services/artic";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = findGuideBySlug(slug);
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      title: `${guide.title} · Atelier Zero`,
      description: guide.description,
      url: `/guides/${guide.slug}`,
      images: ["/opengraph-image"],
    },
  };
}

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = findGuideBySlug(slug);
  if (!guide) notFound();
  const artwork = findCuratedArtworkById(guide.artworkId);
  if (!artwork) notFound();
  const editorHref = `/?art=${artwork.id}&layout=${guide.template}&ratio=${guide.ratio}&scale=1.00&fx=0.00&fy=0.00`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: guide.title,
    description: guide.description,
    url: `${SITE_URL}/guides/${guide.slug}`,
    image: getArtworkImageUrl(artwork, 843),
    step: guide.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text: step,
    })),
  };

  return (
    <ContentShell>
      <StructuredData data={structuredData} />
      <main className="contentPage">
        <Link href="/" className="backLink"><ArrowLeft size={16} /> Back to studio</Link>
        <header className="contentHeader">
          <div>
            <span className="eyebrow">{guide.eyebrow}</span>
            <h1>{guide.title}</h1>
          </div>
          <p>{guide.description}</p>
        </header>

        <section className="guideLead">
          <div className="guideImage">
            <Image
              src={getArtworkImageUrl(artwork, 843)}
              alt={artwork.altText}
              width={843}
              height={700}
              sizes="(max-width: 720px) 100vw, 52vw"
              priority
              unoptimized
            />
            <span>{artwork.title} · {artwork.artist}</span>
          </div>
          <div className="guideIntro">
            <p>{guide.intro}</p>
            <Link href={editorHref} className="editorCta">
              Open this preset <ArrowUpRight size={18} />
            </Link>
          </div>
        </section>

        <section className="guideSteps" aria-labelledby="steps-title">
          <div className="sectionLabel"><span>01</span><h2 id="steps-title">Make the composition</h2></div>
          <ol>
            {guide.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </section>

        <section className="guideNotes" aria-labelledby="notes-title">
          <div className="sectionLabel"><span>02</span><h2 id="notes-title">Before you export</h2></div>
          <div>
            {guide.notes.map((note) => (
              <p key={note}><Check size={17} /> {note}</p>
            ))}
          </div>
        </section>
      </main>
    </ContentShell>
  );
}
