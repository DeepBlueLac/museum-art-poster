"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Copy,
  Download,
  ExternalLink,
  ImageIcon,
  LoaderCircle,
  RotateCcw,
  Search,
  Share2,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PosterCanvas, type PosterCanvasHandle } from "@/components/poster-canvas";
import {
  DEFAULT_POSTER_STATE,
  parsePosterState,
  serializePosterState,
  updatePosterState,
} from "@/core/poster-state";
import {
  POSTER_RATIOS,
  POSTER_TEMPLATES,
  type Artwork,
  type PosterRatio,
  type PosterState,
  type PosterTemplate,
} from "@/core/types";
import {
  CURATED_ARTWORKS,
  DEFAULT_ARTWORK,
  findCuratedArtworkById,
} from "@/data/curated-artworks";
import { trackProductEvent } from "@/platform/analytics";
import { loadArtworkImage } from "@/platform/image-loader";
import {
  buildShareUrl,
  copyShareLink,
  downloadBlob,
  sharePoster,
} from "@/platform/share";
import {
  getArtworkImageUrl,
  getArtworkSourceUrl,
  lookupArtwork,
  searchArtworks,
} from "@/services/artic";

const TEMPLATE_LABELS: Record<PosterTemplate, string> = {
  exhibition: "Exhibition",
  "full-bleed": "Full bleed",
  archive: "Archive",
};

const RATIO_LABELS: Record<PosterRatio, string> = {
  portrait: "4:5",
  square: "1:1",
  story: "9:16",
};

function slugifyFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function ArtworkList({
  artworks,
  selectedId,
  onSelect,
  busyId,
}: {
  artworks: Artwork[];
  selectedId: number;
  onSelect: (artwork: Artwork) => void;
  busyId: number | null;
}) {
  return (
    <div className="artworkList" aria-label="Artwork results">
      {artworks.map((artwork) => {
        const selected = artwork.id === selectedId;
        return (
          <button
            className="artworkResult"
            type="button"
            key={artwork.id}
            aria-pressed={selected}
            onClick={() => onSelect(artwork)}
            disabled={busyId !== null}
          >
            <span className="artworkThumb">
              <Image
                src={getArtworkImageUrl(artwork, 200)}
                alt=""
                width={58}
                height={58}
                sizes="58px"
                unoptimized
              />
            </span>
            <span className="artworkResultCopy">
              <strong>{artwork.title}</strong>
              <small>{artwork.artist}</small>
            </span>
            <span className="resultMark" aria-hidden="true">
              {busyId === artwork.id ? (
                <LoaderCircle className="spin" size={16} />
              ) : selected ? (
                <Check size={16} />
              ) : (
                String(artwork.id).slice(-2).padStart(2, "0")
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function PosterStudio() {
  const canvasRef = useRef<PosterCanvasHandle>(null);
  const hydratedRef = useRef(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Artwork[]>(CURATED_ARTWORKS);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork>(DEFAULT_ARTWORK);
  const [posterState, setPosterState] = useState<PosterState>(DEFAULT_POSTER_STATE);
  const [searchState, setSearchState] = useState<"idle" | "loading" | "empty" | "error">(
    "idle",
  );
  const [busyArtworkId, setBusyArtworkId] = useState<number | null>(null);
  const [actionState, setActionState] = useState<
    | "idle"
    | "exporting"
    | "sharing"
    | "downloaded"
    | "shared"
    | "copied"
    | "interest"
    | "error"
  >("idle");

  useEffect(() => {
    trackProductEvent("studio_viewed");
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initialState = parsePosterState(new URLSearchParams(window.location.search));
    const curated = findCuratedArtworkById(initialState.artworkId);

    async function restore() {
      try {
        const artwork = curated ?? (await lookupArtwork(initialState.artworkId));
        if (!artwork || cancelled) return;
        await loadArtworkImage(artwork);
        if (cancelled) return;
        setSelectedArtwork(artwork);
        setPosterState(initialState);
      } catch {
        if (!cancelled) setPosterState(DEFAULT_POSTER_STATE);
      } finally {
        hydratedRef.current = true;
      }
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    const url = new URL(window.location.href);
    url.search = serializePosterState(posterState).toString();
    window.history.replaceState(null, "", url);
  }, [posterState]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setSearchState("loading");
      searchArtworks(normalizedQuery, controller.signal)
        .then((artworks) => {
          setResults(artworks);
          setSearchState(artworks.length > 0 ? "idle" : "empty");
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setSearchState("error");
        });
    }, 450);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const selectArtwork = useCallback(
    async (artwork: Artwork) => {
      setBusyArtworkId(artwork.id);
      try {
        await loadArtworkImage(artwork);
        const curated = findCuratedArtworkById(artwork.id);
        setSelectedArtwork(artwork);
        setPosterState((current) =>
          updatePosterState(current, {
            artworkId: artwork.id,
            template: curated?.recommendedTemplate ?? current.template,
            ratio: curated?.recommendedRatio ?? current.ratio,
            scale: 1,
            focusX: 0,
            focusY: 0,
          }),
        );
        trackProductEvent("artwork_selected", { artwork_id: artwork.id });
      } catch {
        setActionState("error");
      } finally {
        setBusyArtworkId(null);
      }
    },
    [],
  );

  const updateState = useCallback((patch: Partial<PosterState>) => {
    setPosterState((current) => updatePosterState(current, patch));
    setActionState("idle");
  }, []);

  const filename = useMemo(
    () => `${slugifyFilename(selectedArtwork.title) || "museum-art"}-${posterState.ratio}.png`,
    [posterState.ratio, selectedArtwork.title],
  );

  const getExport = useCallback(async () => {
    const handle = canvasRef.current;
    if (!handle) throw new Error("Poster is not ready.");
    return handle.exportBlob();
  }, []);

  const handleDownload = useCallback(async () => {
    setActionState("exporting");
    try {
      const blob = await getExport();
      downloadBlob(blob, filename);
      setActionState("downloaded");
      trackProductEvent("poster_downloaded", {
        artwork_id: selectedArtwork.id,
        layout: posterState.template,
        ratio: posterState.ratio,
      });
    } catch {
      setActionState("error");
    }
  }, [filename, getExport, posterState, selectedArtwork.id]);

  const handleShare = useCallback(async () => {
    setActionState("sharing");
    try {
      const blob = await getExport();
      const result = await sharePoster({
        blob,
        filename,
        title: `${selectedArtwork.title} — Atelier Zero`,
        url: buildShareUrl(posterState),
      });
      setActionState(result);
      trackProductEvent("poster_shared", {
        artwork_id: selectedArtwork.id,
        method: result,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setActionState("idle");
      } else {
        setActionState("error");
      }
    }
  }, [filename, getExport, posterState, selectedArtwork]);

  const handleCopyLink = useCallback(async () => {
    try {
      await copyShareLink(buildShareUrl(posterState));
      setActionState("copied");
      trackProductEvent("poster_shared", {
        artwork_id: selectedArtwork.id,
        method: "copy-link",
      });
    } catch {
      setActionState("error");
    }
  }, [posterState, selectedArtwork.id]);

  const actionMessage = {
    idle: "Ready to export",
    exporting: "Rendering full-size PNG…",
    sharing: "Preparing share…",
    downloaded: "PNG downloaded",
    shared: "Poster shared",
    copied: "Link copied",
    interest: "Print-size request noted",
    error: "Action failed — your poster is unchanged",
  }[actionState];

  return (
    <div className="appShell">
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
          <Link href="/guides/museum-poster-maker">Guide</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </header>

      <main className="studioGrid">
        <aside className="searchPanel" aria-label="Find an artwork">
          <div className="panelHeading">
            <span className="panelIndex">01</span>
            <div>
              <h1>Find the work</h1>
              <p>Public-domain art from the Art Institute of Chicago.</p>
            </div>
          </div>
          <label className="searchField">
            <Search size={18} aria-hidden="true" />
            <span className="srOnly">Search artwork, artist, or subject</span>
            <input
              value={query}
              onChange={(event) => {
                const value = event.target.value.slice(0, 80);
                setQuery(value);
                if (value.trim().length < 2) {
                  setResults(CURATED_ARTWORKS);
                  setSearchState("idle");
                }
              }}
              placeholder="Monet, waves, Paris…"
              autoComplete="off"
            />
            <span className="searchCount">{query.length}/80</span>
          </label>

          <div className="resultStatus" aria-live="polite">
            {searchState === "loading" ? (
              <><LoaderCircle className="spin" size={14} /> Searching the collection</>
            ) : searchState === "empty" ? (
              "No public-domain images found. Try an artist or broader subject."
            ) : searchState === "error" ? (
              "Museum search is unavailable. Curated works remain below."
            ) : query.trim().length >= 2 ? (
              `${results.length} reusable works`
            ) : (
              "Curated starting points"
            )}
          </div>

          {searchState === "error" ? (
            <ArtworkList
              artworks={CURATED_ARTWORKS}
              selectedId={selectedArtwork.id}
              onSelect={selectArtwork}
              busyId={busyArtworkId}
            />
          ) : results.length > 0 ? (
            <ArtworkList
              artworks={results}
              selectedId={selectedArtwork.id}
              onSelect={selectArtwork}
              busyId={busyArtworkId}
            />
          ) : (
            <div className="emptyResults">
              <ImageIcon size={24} />
              <span>Try “landscape”, “Hokusai”, or “blue”.</span>
            </div>
          )}
        </aside>

        <section className="previewPanel" aria-label="Poster preview">
          <div className="previewHeader">
            <div>
              <span className="eyebrow">Live composition</span>
              <strong>{TEMPLATE_LABELS[posterState.template]} / {RATIO_LABELS[posterState.ratio]}</strong>
            </div>
            <span className="publicDomainBadge">Verified public domain</span>
          </div>
          <div className="canvasStage">
            <PosterCanvas
              ref={canvasRef}
              artwork={selectedArtwork}
              state={posterState}
              onRendered={() =>
                trackProductEvent("poster_rendered", {
                  artwork_id: selectedArtwork.id,
                  layout: posterState.template,
                  ratio: posterState.ratio,
                })
              }
            />
          </div>
          <div className="artworkCaption">
            <div>
              <strong>{selectedArtwork.title}</strong>
              <span>{selectedArtwork.artist}, {selectedArtwork.date}</span>
            </div>
            <a
              href={getArtworkSourceUrl(selectedArtwork)}
              target="_blank"
              rel="noreferrer"
              className="sourceLink"
            >
              Source <ExternalLink size={14} />
            </a>
          </div>
        </section>

        <aside className="controlPanel" aria-label="Compose and export">
          <div className="panelHeading compactHeading">
            <span className="panelIndex">02</span>
            <div>
              <h2>Compose</h2>
              <p>Three decisions, then export.</p>
            </div>
          </div>

          <fieldset className="controlGroup">
            <legend>Layout</legend>
            <div className="segmented segmentedStack">
              {POSTER_TEMPLATES.map((template) => (
                <button
                  type="button"
                  key={template}
                  aria-pressed={posterState.template === template}
                  onClick={() => updateState({ template })}
                >
                  {TEMPLATE_LABELS[template]}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="controlGroup">
            <legend>Format</legend>
            <div className="segmented">
              {POSTER_RATIOS.map((ratio) => (
                <button
                  type="button"
                  key={ratio}
                  aria-pressed={posterState.ratio === ratio}
                  onClick={() => updateState({ ratio })}
                >
                  {RATIO_LABELS[ratio]}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="controlGroup cropControls">
            <div className="controlLabelRow">
              <span>Crop</span>
              <button
                type="button"
                className="iconButton"
                title="Reset crop"
                aria-label="Reset crop"
                onClick={() => updateState({ scale: 1, focusX: 0, focusY: 0 })}
              >
                <RotateCcw size={16} />
              </button>
            </div>
            <label className="rangeControl">
              <span>Zoom</span>
              <input
                type="range"
                min="1"
                max="1.8"
                step="0.02"
                value={posterState.scale}
                onChange={(event) => updateState({ scale: Number(event.target.value) })}
              />
              <output>{posterState.scale.toFixed(2)}×</output>
            </label>
            <label className="rangeControl">
              <span>Horizontal</span>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.02"
                value={posterState.focusX}
                onChange={(event) => updateState({ focusX: Number(event.target.value) })}
              />
              <output>{Math.round(posterState.focusX * 100)}</output>
            </label>
            <label className="rangeControl">
              <span>Vertical</span>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.02"
                value={posterState.focusY}
                onChange={(event) => updateState({ focusY: Number(event.target.value) })}
              />
              <output>{Math.round(posterState.focusY * 100)}</output>
            </label>
          </div>

          <div className="exportBlock">
            <button
              type="button"
              className="primaryAction"
              onClick={handleDownload}
              disabled={actionState === "exporting" || actionState === "sharing"}
            >
              {actionState === "exporting" ? <LoaderCircle className="spin" /> : <Download />}
              Download PNG
            </button>
            <div className="secondaryActions">
              <button
                type="button"
                onClick={handleShare}
                disabled={actionState === "exporting" || actionState === "sharing"}
              >
                <Share2 size={17} /> Share
              </button>
              <button type="button" onClick={handleCopyLink} title="Copy restorable link">
                <Copy size={17} /> Copy link
              </button>
            </div>
            <div className="actionStatus" data-state={actionState} aria-live="polite">
              {actionState === "downloaded" || actionState === "shared" || actionState === "copied" ? (
                <Check size={14} />
              ) : null}
              {actionMessage}
            </div>
          </div>

          <button
            type="button"
            className="interestAction"
            onClick={() => {
              trackProductEvent("print_export_interest", { ratio: posterState.ratio });
              setActionState("interest");
            }}
          >
            A4 / 4K print sizes
            <ArrowUpRight size={16} />
          </button>
        </aside>
      </main>

      <footer className="siteFooter">
        <span>Images marked public domain by the Art Institute of Chicago.</span>
        <nav aria-label="Footer navigation">
          <Link href="/guides/art-wallpaper-maker">Art wallpaper guide</Link>
          <Link href="/artworks/the-great-wave">Great Wave preset</Link>
          <Link href="/privacy">Privacy</Link>
        </nav>
      </footer>
    </div>
  );
}
