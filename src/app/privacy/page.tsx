import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContentShell } from "@/components/content-shell";

export const metadata: Metadata = {
  title: "Privacy",
  description: "How Atelier Zero handles artwork searches, poster state, and anonymous product events.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <ContentShell>
      <main className="contentPage policyPage">
        <Link href="/" className="backLink"><ArrowLeft size={16} /> Back to studio</Link>
        <header className="contentHeader">
          <div><span className="eyebrow">Plain-language policy</span><h1>Privacy</h1></div>
          <p>No account, no image upload, and no storage of your artwork search terms.</p>
        </header>
        <section>
          <h2>What stays on your device</h2>
          <p>Your selected artwork, layout, format, zoom, and focal point remain in browser state. They appear in the URL only when needed to restore or share the composition.</p>
        </section>
        <section>
          <h2>What is measured</h2>
          <p>Atelier Zero records anonymous completion events such as artwork selected, poster rendered, downloaded, shared, or print-size interest. Event properties contain layout choices and numeric artwork IDs, not search text, files, precise location, or a browser fingerprint.</p>
        </section>
        <section>
          <h2>Museum requests</h2>
          <p>Searches and artwork images are requested directly from the Art Institute of Chicago&apos;s public API and IIIF image service. Their infrastructure receives the network information normally sent with a web request.</p>
        </section>
      </main>
    </ContentShell>
  );
}
