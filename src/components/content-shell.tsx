import Link from "next/link";

export function ContentShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="contentShell">
      <header className="brandBar">
        <Link href="/" className="brand" aria-label="Atelier Zero home">
          <span className="brandMark">A0</span>
          <span>Atelier Zero</span>
        </Link>
        <div className="editionMeta">
          <span>Open collection edition</span>
          <span className="liveDot">CC0 only</span>
        </div>
        <nav className="topNav" aria-label="Utility navigation">
          <Link href="/">Open studio</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </header>
      {children}
      <footer className="siteFooter contentFooter">
        <span>Independent tool. Artwork data and images from the Art Institute of Chicago.</span>
        <nav aria-label="Footer navigation">
          <Link href="/">Open studio</Link>
          <Link href="/guides/museum-poster-maker">Poster guide</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}
