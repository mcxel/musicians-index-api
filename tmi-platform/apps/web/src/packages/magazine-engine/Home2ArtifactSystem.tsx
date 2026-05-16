"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import FrameShell, { type FrameVariant } from "@/components/frames/FrameShell";
import { ARTIST_SEED, type ArtistSeedRecord } from "@/lib/artists/artistSeed";
import { trackArtifactClick, trackHomepageArticleClick } from "@/lib/artifactEventTracker";
import type { ArtifactRouteContract } from "@/lib/artifactRouteContract";
import { ensureAllFeeds, type TmiAllFeeds } from "@/packages/magazine-engine/liveFeedBus";
import ArtifactMotionFrame from "@/components/common/ArtifactMotionFrame";
import { ImageSlotWrapper } from '@/components/visual-enforcement';

type Home2Feed = TmiAllFeeds["home2"];

// ── Zone map: Home2 editorial/discovery/charts canvas ─────────────────────────
// Layout: featured article left-top (large), genre cluster right-top,
//         discovery row mid, mini-charts bottom strip
type Home2ArtifactZone =
  | { kind: "article"; id: string; x: number; y: number; w: number; h: number; frame: FrameVariant; title: string; badge: string; route: string }
  | { kind: "artist";  id: string; x: number; y: number; w: number; h: number; frame: FrameVariant; rank: number };

const HOME2_ZONES: Home2ArtifactZone[] = [
  // ── Featured article block (top-left, large) ──
  { kind: "article", id: "feature-story",    x: 2,  y: 4,  w: 34, h: 36, frame: "featured", title: "The Rise of Cyphers",       badge: "FEATURE",   route: "/articles/featured-story" },
  { kind: "article", id: "music-news",       x: 38, y: 4,  w: 24, h: 16, frame: "star",     title: "Crown Rankings Shake Up",   badge: "NEWS",      route: "/articles/featured-story" },
  { kind: "article", id: "interview-card",   x: 64, y: 4,  w: 18, h: 16, frame: "orbit",    title: "Host Julius on Energy",     badge: "Q&A",       route: "/articles/featured-story" },
  { kind: "article", id: "genre-beat",       x: 84, y: 4,  w: 14, h: 16, frame: "battle",   title: "Genre Hex Update",          badge: "GENRE",     route: "/home/2" },

  // ── Discovery artist row (mid) ──
  { kind: "artist",  id: "discovery-1",      x: 2,  y: 46, w: 18, h: 26, frame: "orbit",    rank: 1  },
  { kind: "artist",  id: "discovery-2",      x: 22, y: 46, w: 18, h: 26, frame: "orbit",    rank: 2  },
  { kind: "artist",  id: "discovery-3",      x: 42, y: 46, w: 18, h: 26, frame: "orbit",    rank: 3  },
  { kind: "artist",  id: "discovery-4",      x: 62, y: 46, w: 16, h: 22, frame: "battle",   rank: 4  },
  { kind: "artist",  id: "discovery-5",      x: 80, y: 46, w: 16, h: 22, frame: "battle",   rank: 5  },

  // ── Charts strip (bottom) ──
  { kind: "article", id: "charts-top10",     x: 2,  y: 78, w: 28, h: 18, frame: "battle",   title: "Top 10 This Week",          badge: "CHARTS",    route: "/home/2" },
  { kind: "article", id: "studio-recap",     x: 32, y: 78, w: 22, h: 18, frame: "orbit",    title: "Session 20: Discovery Reel", badge: "RECAP",    route: "/home/2" },
  { kind: "article", id: "weekly-playlist",  x: 56, y: 78, w: 20, h: 18, frame: "star",     title: "Midnight Neon · 28 tracks", badge: "WEEKLY",    route: "/home/2" },
  { kind: "article", id: "issue-archive",    x: 78, y: 78, w: 20, h: 18, frame: "featured", title: "Issue Archive · Vol 88",    badge: "ARCHIVE",   route: "/home/15" },
];

// ── Default editorial artist slot assignment (genre: editorial/discovery) ──
const DEFAULT_EDITORIAL_SLOTS: Record<number, string> = {
  1: "lyra-sky",
  2: "kira-bloom",
  3: "milo-spark",
  4: "tessa-glint",
  5: "neon-vale",
};

// ── Live mode — feed switches artist lineup ──
const LIVE_EDITORIAL_SLOTS: Record<number, string> = {
  1: "cleo-verse",
  2: "mira-glow",
  3: "luna-verse",
  4: "ivy-echo",
  5: "zuri-flame",
};

function artistForSlot(rank: number, slots: Record<number, string>): ArtistSeedRecord {
  const id = slots[rank];
  return ARTIST_SEED.find((a) => a.id === id) ?? ARTIST_SEED[(rank - 1 + 10) % ARTIST_SEED.length];
}

// ── BADGE color map ──
const BADGE_COLORS: Record<string, string> = {
  FEATURE:  "border-cyan-400/40 text-cyan-300 bg-cyan-400/10",
  NEWS:     "border-fuchsia-400/40 text-fuchsia-300 bg-fuchsia-400/10",
  "Q&A":    "border-emerald-400/40 text-emerald-300 bg-emerald-400/10",
  GENRE:    "border-amber-400/40 text-amber-300 bg-amber-400/10",
  CHARTS:   "border-yellow-400/40 text-yellow-300 bg-yellow-400/10",
  RECAP:    "border-violet-400/40 text-violet-300 bg-violet-400/10",
  WEEKLY:   "border-sky-400/40 text-sky-300 bg-sky-400/10",
  ARCHIVE:  "border-slate-400/40 text-slate-300 bg-slate-400/10",
};

function badgeClass(badge: string) {
  return BADGE_COLORS[badge] ?? "border-white/20 text-white/70 bg-white/5";
}

export default function Home2ArtifactSystem() {
  const [feed, setFeed] = useState<Home2Feed | null>(null);

  useEffect(() => {
    ensureAllFeeds();

    const read = () => {
      const runtimeFeed = window.__TMI_ALL_FEEDS__?.home2;
      setFeed(runtimeFeed ?? null);
    };

    read();
    window.addEventListener("tmi:all-feeds", read as EventListener);
    const id = window.setInterval(read, 350);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("tmi:all-feeds", read as EventListener);
    };
  }, []);

  const liveMode = feed?.layoutState === "magazine-live" || feed?.phase === "active";
  const slotAssignment = liveMode ? LIVE_EDITORIAL_SLOTS : DEFAULT_EDITORIAL_SLOTS;

  const zones = useMemo(() => {
    return HOME2_ZONES.map((zone) => {
      if (zone.kind === "artist") {
        const artist = artistForSlot(zone.rank, slotAssignment);
        return { ...zone, artist, route: `/artists/${artist.id}` };
      }
      return { ...zone, artist: null };
    });
  }, [slotAssignment]);

  const buildContract = (id: string, route: string, type: ArtifactRouteContract["type"]): ArtifactRouteContract => ({
    id,
    type,
    route,
    previewRoute: `${route}?preview=1`,
    fallbackRoute: "/home/2",
    onClickAction: "route",
    dataSource: "home2.artifactCanvas",
  });

  return (
    <section
      className="home2-artifact-canvas"
      aria-label="Home 2 Editorial Artifact Canvas"
      data-zone-id="home2-artifact-canvas"
      data-pdf-source="Tmi PDF's"
      data-pdf-map-ref="docs/TMI_PDF_TO_ARTIFACT_MAP.md"
    >
      <div className="home2-artifact-canvas__backdrop" aria-hidden />
      <header className="home2-artifact-canvas__header">
        <p className="home2-artifact-canvas__kicker">Culture &amp; Discovery</p>
        <h2 className="home2-artifact-canvas__title">Editorial Artifact System</h2>
        <p className="home2-artifact-canvas__state">
          Genre: {feed?.genre ?? "Unknown"} · Layout: {feed?.layoutState ?? "idle"}
        </p>
      </header>

      <div className="home2-artifact-canvas__layer" data-zone-map="home2">
        {zones.map((zone) => (
          <ArtifactMotionFrame
            key={zone.id}
            artifactId={zone.id}
            scope={zone.id === "feature-story" ? "home2-featured" : "home2-grid"}
            routeTarget={zone.kind === "artist" ? zone.route : (zone as { route: string }).route}
            featured={zone.id === "feature-story" || zone.id === "discovery-1"}
            cycleMs={4700}
            className={zone.kind === "article" ? "home2-article-zone" : "home2-artist-zone"}
            data-artifact-id={zone.id}
            data-artifact-kind={zone.kind}
            data-route-target={zone.kind === "artist" ? zone.route : (zone as { route: string }).route}
            style={{
              position: "absolute",
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.w}%`,
              height: `${zone.h}%`,
            }}
          >
            {zone.kind === "article" ? (
              <FrameShell variant={zone.frame} featured={zone.id === "feature-story"}>
                <Link
                  className="home2-article-card"
                  href={(zone as { route: string }).route}
                  onClick={() => trackArtifactClick(buildContract(zone.id, (zone as { route: string }).route, "magazine-page"), { actor: "Home2 Artifact" })}
                >
                  <span className={`home2-article-card__badge border rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] ${badgeClass((zone as { badge: string }).badge)}`}>
                    {(zone as { badge: string }).badge}
                  </span>
                  <p className="home2-article-card__title">{(zone as { title: string }).title}</p>
                  <span className="home2-article-card__cta">Read →</span>
                </Link>
              </FrameShell>
            ) : (
              <FrameShell variant={zone.frame} featured={zone.rank <= 2}>
                <div className="home2-artist-card">
                  <Link className="home2-artist-card__portrait-link" href={zone.route!} onClick={() => trackArtifactClick(buildContract(zone.id, zone.route!, "artist-frame"), { actor: "Home2 Artifact" })}>
                    <ImageSlotWrapper imageId="img-70ic9h" roomId="runtime-surface" priority="normal" className="home2-artist-card__image" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
                  </Link>
                  <div className="home2-artist-card__chrome">
                    <span className="home2-artist-card__rank">#{zone.rank}</span>
                    <Link className="home2-artist-card__name" href={zone.route!} onClick={() => trackArtifactClick(buildContract(zone.id, zone.route!, "artist-frame"), { actor: "Home2 Artifact" })}>
                      {zone.artist!.name}
                    </Link>
                    <span className="home2-artist-card__genre">{zone.artist!.genre}</span>
                    <Link
                      className="home2-artist-card__article"
                      href={`/artists/${zone.artist!.id}/article?from=${encodeURIComponent("/home/2")}`}
                      onClick={() =>
                        trackHomepageArticleClick({
                          actor: "Home2 Artifact",
                          route: `/artists/${zone.artist!.id}/article?from=${encodeURIComponent("/home/2")}`,
                          artistId: zone.artist!.id,
                          sourceHomepage: "home2",
                          sourceFrame: zone.id,
                        })
                      }
                    >
                      Article
                    </Link>
                  </div>
                </div>
              </FrameShell>
            )}
          </ArtifactMotionFrame>
        ))}
      </div>
    </section>
  );
}
