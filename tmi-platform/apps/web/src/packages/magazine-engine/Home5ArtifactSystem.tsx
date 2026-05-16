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

type Home5Feed = TmiAllFeeds["home5"];

type Home5ArtifactZone = {
  id: string;
  rank: number;
  x: number;
  y: number;
  w: number;
  h: number;
  frame: FrameVariant;
};

const HOME5_ZONES: Home5ArtifactZone[] = [
  { id: "leaderboard-1", rank: 1, x: 20, y: 28, w: 29, h: 30, frame: "crown" },
  { id: "leaderboard-2", rank: 2, x: 54, y: 26, w: 20, h: 24, frame: "featured" },
  { id: "leaderboard-3", rank: 3, x: 77, y: 28, w: 18, h: 22, frame: "battle" },
  { id: "leaderboard-4", rank: 4, x: 14, y: 60, w: 18, h: 20, frame: "orbit" },
  { id: "leaderboard-5", rank: 5, x: 35, y: 60, w: 16, h: 18, frame: "orbit" },
  { id: "leaderboard-6", rank: 6, x: 54, y: 58, w: 16, h: 18, frame: "orbit" },
  { id: "leaderboard-7", rank: 7, x: 73, y: 58, w: 16, h: 18, frame: "orbit" },
  { id: "leaderboard-8", rank: 8, x: 20, y: 83, w: 15, h: 14, frame: "battle" },
  { id: "leaderboard-9", rank: 9, x: 39, y: 83, w: 15, h: 14, frame: "battle" },
  { id: "leaderboard-10", rank: 10, x: 58, y: 83, w: 15, h: 14, frame: "battle" },
];

const DEFAULT_SLOT_ASSIGNMENT: Record<number, string> = {
  1: "big-a",
  2: "onyx-lyric",
  3: "kai-drift",
  4: "velvet-lane",
  5: "ray-journey",
  6: "circuit-halo",
  7: "afro-reign",
  8: "pop-crown",
  9: "soul-lumen",
  10: "global-signal",
};

const LIVE_SLOT_ASSIGNMENT: Record<number, string> = {
  1: "onyx-lyric",
  2: "big-a",
  3: "ray-journey",
  4: "afro-reign",
  5: "kai-drift",
  6: "velvet-lane",
  7: "circuit-halo",
  8: "global-signal",
  9: "pop-crown",
  10: "soul-lumen",
};

function artistForRank(rank: number, slots: Record<number, string>): ArtistSeedRecord {
  const id = slots[rank];
  return ARTIST_SEED.find((artist) => artist.id === id) ?? ARTIST_SEED[(rank - 1) % ARTIST_SEED.length];
}

export default function Home5ArtifactSystem() {
  const [feed, setFeed] = useState<Home5Feed | null>(null);

  useEffect(() => {
    ensureAllFeeds();

    const read = () => {
      const runtimeFeed = window.__TMI_ALL_FEEDS__?.home5;
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

  const liveMode = feed?.leaderboardState === "global-rank-live";
  const slotAssignment = liveMode ? LIVE_SLOT_ASSIGNMENT : DEFAULT_SLOT_ASSIGNMENT;

  const rankCards = useMemo(
    () =>
      HOME5_ZONES.map((zone) => {
        const artist = artistForRank(zone.rank, slotAssignment);
        return { zone, artist, route: `/artists/${artist.id}` };
      }),
    [slotAssignment],
  );

  const buildContract = (id: string, route: string): ArtifactRouteContract => ({
    id,
    type: "artist-frame",
    route,
    previewRoute: `${route}?preview=1`,
    fallbackRoute: "/home/5",
    onClickAction: "route",
    dataSource: "home5.leaderboard",
  });

  return (
    <section
      className="home5-artifact-canvas"
      aria-label="Home 5 Artifact Canvas"
      data-zone-id="home5-artifact-canvas"
      data-pdf-source="Tmi PDF's"
      data-pdf-map-ref="docs/TMI_PDF_TO_ARTIFACT_MAP.md"
    >
      <div className="home5-artifact-canvas__backdrop" aria-hidden />
      <header className="home5-artifact-canvas__header">
        <p className="home5-artifact-canvas__kicker">Live Billboard Matrix</p>
        <h2 className="home5-artifact-canvas__title">Leaderboard Artifact System</h2>
        <p className="home5-artifact-canvas__state">State: {feed?.leaderboardState ?? "standby"}</p>
      </header>

      <div className="home5-artifact-canvas__layer" data-ranking="home5-zone-map">
        {rankCards.map(({ zone, artist, route }) => (
          <ArtifactMotionFrame
            key={zone.id}
            artifactId={zone.id}
            scope={zone.rank <= 2 ? "home5-featured" : "home5-grid"}
            routeTarget={route}
            featured={zone.rank <= 2}
            cycleMs={4400}
            className="home5-artifact-zone"
            data-artifact-id={zone.id}
            data-rank={zone.rank}
            data-artist-id={artist.id}
            data-route-target={route}
            style={{
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.w}%`,
              height: `${zone.h}%`,
            }}
          >
            <FrameShell variant={zone.frame} featured={zone.rank <= 2}>
              <div className="home5-artist-card">
                <Link
                  className="home5-artist-card__portrait-link"
                  href={route}
                  onClick={() => trackArtifactClick(buildContract(zone.id, route), { actor: "Home5 Artifact" })}
                >
                  <ImageSlotWrapper imageId="img-mzwjk8" roomId="runtime-surface" priority="normal" className="home5-artist-card__image" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
                </Link>
                <div className="home5-artist-card__chrome">
                  <span className="home5-artist-card__rank">#{zone.rank}</span>
                  <Link
                    className="home5-artist-card__name"
                    href={route}
                    onClick={() => trackArtifactClick(buildContract(zone.id, route), { actor: "Home5 Artifact" })}
                  >
                    {artist.name}
                  </Link>
                  <span className="home5-artist-card__genre">{artist.genre}</span>
                  <Link
                    className="home5-artist-card__article"
                    data-testid={zone.rank === 1 ? "home5-artist-article-link" : `home5-artist-article-link-${artist.id}`}
                    href={`/artists/${artist.id}/article?from=${encodeURIComponent("/home/5")}`}
                    onClick={() =>
                      trackHomepageArticleClick({
                        actor: "Home5 Artifact",
                        route: `/artists/${artist.id}/article?from=${encodeURIComponent("/home/5")}`,
                        artistId: artist.id,
                        sourceHomepage: "home5",
                        sourceFrame: zone.id,
                      })
                    }
                  >
                    Article
                  </Link>
                </div>
              </div>
            </FrameShell>
          </ArtifactMotionFrame>
        ))}
      </div>
    </section>
  );
}
