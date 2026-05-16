"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import ArtistPortalFace from "@/packages/artists/ArtistPortalFace";
import type { FrameVariant } from "@/components/frames/FrameShell";
import { ARTIST_SEED } from "@/lib/artists/artistSeed";
import type { LiveArtist } from "@/lib/data/artistPool";
import { getCurrentGenre, getNextGenre } from "@/packages/genre-system/genreRotationEngine";
import { genreMatches, normalizeGenreLabel } from "@/packages/genre-system/genreRegistry";
import { publishHomeFeed, type Home1Feed } from "@/packages/magazine-engine/liveFeedBus";
import {
  home1ArtifactMap,
  home1FaceArtifacts,
  type Home1Artifact,
} from "@/packages/magazine-engine/home1ArtifactMap";
import AwkwardShapeOverlayFrame from "./AwkwardShapeOverlayFrame";
import Home1CoverOverlay from "./Home1CoverOverlay";
import RankNumberPop from "./RankNumberPop";
import NewsArticleGrid from "./NewsArticleGrid";
import SponsorAdSlotGrid from "./SponsorAdSlotGrid";

const SPIN_MS = 3000;
const STARBURST_MS = 900;
const ENTER_MS = 1080;
const IMPACT_DELAY_MS = 220;
const STAGE_PADDING_PERCENT = 2;
const ROTATION_SPEED = 0.0032;
const FEATURE_START_MS = 1100;
const FEATURE_DURATION_MS = 900;

type SlotLayout = {
  x: number;
  y: number;
  scale: number;
  z: number;
};

const HOME1_SLOT_LAYOUT: Record<string, SlotLayout> = {
  "crown-face-slot": { x: 50, y: 58, scale: 1.18, z: 50 },
  "surround-face-slot-2": { x: 22, y: 38, scale: 0.92, z: 31 },
  "surround-face-slot-3": { x: 78, y: 36, scale: 0.92, z: 31 },
  "surround-face-slot-4": { x: 18, y: 64, scale: 0.86, z: 23 },
  "surround-face-slot-5": { x: 82, y: 66, scale: 0.86, z: 23 },
  "surround-face-slot-6": { x: 34, y: 80, scale: 0.88, z: 27 },
  "surround-face-slot-7": { x: 66, y: 80, scale: 0.88, z: 27 },
};

function getFrameVariant(index: number, isCenter: boolean, isFeatured: boolean): FrameVariant {
  if (isCenter) {
    return "crown";
  }
  if (isFeatured) {
    return "featured";
  }
  if (index % 3 === 0) {
    return "battle";
  }
  return "orbit";
}

const STARBURST_PARTICLES = Array.from({ length: 44 }, (_, index) => {
  const angle = (index / 44) * Math.PI * 2;
  const distance = 120 + (index % 5) * 24;
  return {
    id: `particle-${index}`,
    dx: `${Math.cos(angle) * distance}px`,
    dy: `${Math.sin(angle) * distance}px`,
    delay: `${(index % 6) * 28}ms`,
    hue: `${40 + (index % 5) * 32}`,
  };
});

type Home1LiveFeedPayload = Home1Feed;

declare global {
  interface Window {
    __TMI_LIVE_FEED__?: Home1LiveFeedPayload;
    __TMI_DEBUG__?: {
      glow?: boolean;
      frames?: boolean;
      shapes?: boolean;
      z?: boolean;
      grid?: boolean;
      density?: boolean;
      zones?: boolean;
      spacing?: boolean;
      forceFeature?: (id: string | null) => void;
      setSpeed?: (speed: number) => void;
      triggerBurst?: () => void;
    };
  }
}

function artifactFrameStyle(artifact: Home1Artifact): CSSProperties {
  return {
    left: `${artifact.x}%`,
    top: `${artifact.y}%`,
    width: `${artifact.w}%`,
    height: `${artifact.h}%`,
    zIndex: artifact.zIndex,
  };
}

export default function Home1LiveMagazine() {
  const [isPrimaryInstance] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    const runtime = window as Window & { __HOME1_ACTIVE__?: boolean };
    if (runtime.__HOME1_ACTIVE__) {
      return false;
    }

    runtime.__HOME1_ACTIVE__ = true;
    return true;
  });

  const [genre, setGenre] = useState(getCurrentGenre());
  const [phase, setPhase] = useState<"rotate" | "starburst" | "enter">("rotate");
  const [rotation, setRotation] = useState(0);
  const [orbitSpeed, setOrbitSpeed] = useState(ROTATION_SPEED);
  const [featuredArtistId, setFeaturedArtistId] = useState<string | null>(null);
  const [forcedFeatureArtistId, setForcedFeatureArtistId] = useState<string | null>(null);
  const [featureCursor, setFeatureCursor] = useState(0);
  const [featureWeights, setFeatureWeights] = useState<Record<string, number>>({});
  const releaseBoostRef = useRef<Record<string, number>>({});
  const previousFeaturedArtistRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isPrimaryInstance || typeof window === "undefined") {
      return;
    }

    return () => {
      const runtime = window as Window & { __HOME1_ACTIVE__?: boolean };
      runtime.__HOME1_ACTIVE__ = false;
    };
  }, [isPrimaryInstance]);

  const crownArtifact = useMemo(
    () => home1FaceArtifacts.find((artifact) => artifact.slotRole === "crown") ?? home1FaceArtifacts[0],
    [],
  );
  const ringArtifacts = useMemo(
    () => home1FaceArtifacts.filter((artifact) => artifact.artifactId !== crownArtifact.artifactId),
    [crownArtifact.artifactId],
  );

  const crownLayout = HOME1_SLOT_LAYOUT[crownArtifact?.artifactId ?? ""];
  const orbitCenterX = crownLayout?.x ?? 50;
  const orbitCenterY = (crownLayout?.y ?? 58) + 1;
  const orbitRadiusX = 24;
  const orbitRadiusY = 24;

  const artists = useMemo<LiveArtist[]>(() => {
    const selected: LiveArtist[] = [];
    const normalized = normalizeGenreLabel(genre);
    const pool = ARTIST_SEED.filter((artist) => genreMatches(artist.genre, normalized));
    const genreHash = Array.from(normalized).reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const orderedPool =
      pool.length > 0
        ? [...pool.slice(genreHash % pool.length), ...pool.slice(0, genreHash % pool.length)]
        : pool;

    for (const artist of orderedPool) {
      selected.push({
        ...artist,
        rank: selected.length + 1,
        score: Number((99 - selected.length * 1.25).toFixed(1)),
      });
      if (selected.length >= home1FaceArtifacts.length) {
        return selected;
      }
    }

    const discoveryPool = ARTIST_SEED.filter((artist) => !pool.some((entry) => entry.id === artist.id));
    const discoveryOffset = discoveryPool.length > 0 ? genreHash % discoveryPool.length : 0;
    const orderedDiscoveryPool = [
      ...discoveryPool.slice(discoveryOffset),
      ...discoveryPool.slice(0, discoveryOffset),
    ];

    for (const artist of orderedDiscoveryPool) {
      selected.push({
        ...artist,
        rank: selected.length + 1,
        score: Number((92 - selected.length * 0.9).toFixed(1)),
      });
      if (selected.length >= home1FaceArtifacts.length) {
        break;
      }
    }

    return selected;
  }, [genre]);

  const crownArtist = artists[0];
  const ringArtists = useMemo(
    () => artists.slice(1, ringArtifacts.length + 1),
    [artists, ringArtifacts.length],
  );
  const ringArtistSignature = useMemo(
    () => ringArtists.map((artist) => artist.id).join("|"),
    [ringArtists],
  );
  const effectiveFeaturedArtistId = forcedFeatureArtistId ?? featuredArtistId;

  useEffect(() => {
    window.__TMI_DEBUG__ = {
      ...window.__TMI_DEBUG__,
      forceFeature: (id) => setForcedFeatureArtistId(id && id.length > 0 ? id : null),
      setSpeed: (speed) => {
        if (Number.isFinite(speed) && speed > 0) {
          setOrbitSpeed(speed);
        }
      },
      triggerBurst: () => {
        setFeaturedArtistId(null);
        setForcedFeatureArtistId(null);
        setPhase("starburst");
      },
    };
  }, []);

  useEffect(() => {
    const payload: Home1LiveFeedPayload = {
      phase,
      genre,
      featuredId: effectiveFeaturedArtistId,
      orbitAngle: Number(rotation.toFixed(4)),
      orbitSpeed,
      timestamp: Date.now(),
    };

    publishHomeFeed("home1", payload as Home1Feed);
    window.__TMI_LIVE_FEED__ = payload;
    window.dispatchEvent(new CustomEvent<Home1LiveFeedPayload>("tmi:live-feed", { detail: payload }));
  }, [phase, genre, effectiveFeaturedArtistId, rotation, orbitSpeed]);

  useEffect(() => {
    const previousFeaturedArtist = previousFeaturedArtistRef.current;
    if (previousFeaturedArtist && previousFeaturedArtist !== featuredArtistId) {
      releaseBoostRef.current[previousFeaturedArtist] = 0.16;
    }
    previousFeaturedArtistRef.current = featuredArtistId;
  }, [featuredArtistId]);

  useEffect(() => {
    if (ringArtists.length === 0) {
      setFeatureWeights({});
      return;
    }

    let frame = 0;
    const tick = () => {
      setFeatureWeights((previous) => {
        const next: Record<string, number> = {};
        let changed = false;

        for (const artist of ringArtists) {
          const current = previous[artist.id] ?? 0;
          const target = artist.id === effectiveFeaturedArtistId ? 1 : 0;
          const releaseBoost = releaseBoostRef.current[artist.id] ?? 0;
          const seeded = target === 0 ? Math.max(current, releaseBoost) : current;
          const updated = seeded + (target - seeded) * 0.12;

          if (releaseBoost > 0) {
            const reducedBoost = releaseBoost * 0.72;
            if (reducedBoost < 0.01) {
              delete releaseBoostRef.current[artist.id];
            } else {
              releaseBoostRef.current[artist.id] = reducedBoost;
            }
          }

          const normalized = updated < 0.003 ? 0 : Number(updated.toFixed(4));
          if (normalized > 0) {
            next[artist.id] = normalized;
          }

          if ((previous[artist.id] ?? 0) !== normalized) {
            changed = true;
          }
        }

        return changed ? next : previous;
      });

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [effectiveFeaturedArtistId, ringArtistSignature]);

  useEffect(() => {
    if (phase !== "rotate") {
      return;
    }

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      setRotation((previous) => previous + delta * orbitSpeed);
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [phase, orbitSpeed]);

  useEffect(() => {
    if (phase !== "rotate") {
      return;
    }

    const timer = window.setTimeout(() => {
      setFeaturedArtistId(null);
      setGenre(getNextGenre());
      setPhase("enter");
    }, SPIN_MS);

    return () => window.clearTimeout(timer);
  }, [phase, genre]);

  useEffect(() => {
    if (phase !== "rotate" || ringArtists.length === 0 || forcedFeatureArtistId) {
      setFeaturedArtistId(null);
      return;
    }

    let releaseTimer = 0;
    const featureTimer = window.setTimeout(() => {
      setFeatureCursor((previous) => {
        const next = (previous + 1) % ringArtists.length;
        const targetArtist = ringArtists[next]?.id ?? null;
        setFeaturedArtistId(targetArtist);
        releaseTimer = window.setTimeout(() => {
          setFeaturedArtistId((current) => (current === targetArtist ? null : current));
        }, FEATURE_DURATION_MS);
        return next;
      });
    }, FEATURE_START_MS);

    return () => {
      window.clearTimeout(featureTimer);
      window.clearTimeout(releaseTimer);
    };
  }, [phase, ringArtists.length, ringArtistSignature, forcedFeatureArtistId]);

  useEffect(() => {
    if (phase !== "enter") {
      return;
    }

    const enterTimer = window.setTimeout(() => {
      setPhase("starburst");
    }, ENTER_MS + IMPACT_DELAY_MS);

    return () => window.clearTimeout(enterTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "starburst") {
      return;
    }

    const starburstTimer = window.setTimeout(() => {
      setPhase("rotate");
    }, STARBURST_MS);

    return () => window.clearTimeout(starburstTimer);
  }, [phase]);

  if (!isPrimaryInstance) {
    return null;
  }

  return (
    <section
      className={`home1-live-magazine home1-stage phase-${phase}`}
      aria-label="Home 1 Live Magazine"
      data-pdf-source="Tmi PDF's"
      data-pdf-map-ref="docs/TMI_PDF_TO_ARTIFACT_MAP.md"
    >
      {/* Magazine cover overlay — TMI artifacts, promo rotator, chips */}
      <Home1CoverOverlay
        currentGenre={genre}
        rankOneName={crownArtist?.name}
        rankOneId={crownArtist?.id}
        votingLive
        crownUpdating={phase === "starburst"}
        confettiActive={phase === "starburst"}
        data-testid="home1-cover-overlay"
      />

      <div className="home1-live-magazine__backdrop" aria-hidden />
      {phase !== "rotate" ? <div className="genre-label" aria-live="polite">{genre.toUpperCase()}</div> : null}
      {phase === "starburst" ? <div className="home1-live-magazine__event-pill">NEW GENRE</div> : null}
      <div className="home1-live-magazine__starburst" aria-hidden={phase !== "starburst"} />
      {phase === "starburst" ? (
        <div className="home1-starburst home1-burst" aria-hidden>
          {STARBURST_PARTICLES.map((particle) => (
            <span
              key={particle.id}
              className="star-particle burst-star"
              style={{
                "--dx": particle.dx,
                "--dy": particle.dy,
                "--particle-delay": particle.delay,
                "--particle-hue": particle.hue,
              } as CSSProperties}
            />
          ))}
        </div>
      ) : null}

      <div className="home1-live-magazine__stage" data-phase={phase}>
        {crownArtist && crownArtifact ? (
          <div
            style={{
              position: "absolute",
              left: `${(crownLayout?.x ?? crownArtifact.x)}%`,
              top: `${(crownLayout?.y ?? crownArtifact.y)}%`,
              width: `${crownArtifact.w}%`,
              height: `${crownArtifact.h}%`,
              zIndex: crownLayout?.z ?? crownArtifact.zIndex,
              transform: `translate(-50%, -50%) scale(${crownLayout?.scale ?? 1})`,
            }}
          >
            <AwkwardShapeOverlayFrame
              variant="crown"
              rank={1}
              animated
              showBackShapes={phase !== "rotate"}
              data-testid="awkward-shape-overlay-frame"
            >
              <ArtistPortalFace
                key={crownArtifact.artifactId}
                artist={{ ...crownArtist, rank: 1 }}
                artifact={crownArtifact}
                currentGenre={genre}
                frameStyle={{ left: 0, top: 0, width: "100%", height: "100%", position: "relative" }}
                frameDepth={crownLayout?.z ?? crownArtifact.zIndex}
                frameScale={crownLayout?.scale ?? 1}
                isFeatured={false}
                frameVariant={getFrameVariant(0, true, false)}
              />
            </AwkwardShapeOverlayFrame>
            {/* Rank #1 badge overlay */}
            <RankNumberPop rank={1} active size="md" position="top-left" data-testid="rank-number-pop-1" />
          </div>
        ) : null}

        {ringArtifacts.map((slotArtifact, slotIndex) => {
          const artistIndex = slotIndex;
          const artist = ringArtists[artistIndex];
          if (!artist) {
            return null;
          }

          const baseAngle = (slotIndex / Math.max(1, ringArtifacts.length)) * Math.PI * 2;
          const angle = baseAngle + rotation;

          const dynamicX = orbitCenterX + Math.cos(angle) * orbitRadiusX;
          const dynamicY = orbitCenterY + Math.sin(angle) * orbitRadiusY;
          const depthMix = (Math.sin(angle) + 1) / 2;
          const slotLayout = HOME1_SLOT_LAYOUT[slotArtifact.artifactId];

          const maxX = 100 - slotArtifact.w / 2 - STAGE_PADDING_PERCENT;
          const minX = slotArtifact.w / 2 + STAGE_PADDING_PERCENT;
          const maxY = 100 - slotArtifact.h / 2 - STAGE_PADDING_PERCENT;
          const minY = slotArtifact.h / 2 + STAGE_PADDING_PERCENT;
          const featureWeight = phase === "rotate" ? (featureWeights[artist.id] ?? 0) : 0;
          const isFeatured = featureWeight > 0.08;
          const focusOffsetX = (orbitCenterX - dynamicX) * featureWeight * 0.18;
          const focusOffsetY = (orbitCenterY - dynamicY) * featureWeight * 0.08;
          const finalX = dynamicX + focusOffsetX;
          const finalY = dynamicY + focusOffsetY;
          const depthScale = (slotLayout?.scale ?? 1) * (0.88 + depthMix * 0.16);
          const slotScale = depthScale + featureWeight * 0.9;
          const slotDepth = Math.round((slotLayout?.z ?? slotArtifact.zIndex) + depthMix * 14 + featureWeight * 46);
          const effectiveW = slotArtifact.w * slotScale;
          const effectiveH = slotArtifact.h * slotScale;
          const scaledMaxX = 100 - effectiveW / 2 - STAGE_PADDING_PERCENT;
          const scaledMinX = effectiveW / 2 + STAGE_PADDING_PERCENT;
          const scaledMaxY = 100 - effectiveH / 2 - STAGE_PADDING_PERCENT;
          const scaledMinY = effectiveH / 2 + STAGE_PADDING_PERCENT;
          const boundedX = Math.max(minX, Math.min(maxX, finalX));
          const boundedY = Math.max(minY, Math.min(maxY, finalY));
          const fullyBoundedX = Math.max(scaledMinX, Math.min(scaledMaxX, boundedX));
          const fullyBoundedY = Math.max(scaledMinY, Math.min(scaledMaxY, boundedY));

          const orbitStyle: CSSProperties = {
            left: `${fullyBoundedX}%`,
            top: `${fullyBoundedY}%`,
            width: `${slotArtifact.w}%`,
            height: `${slotArtifact.h}%`,
            zIndex: slotDepth,
            transform: `translate(-50%, -50%) scale(${slotScale})`,
          };

          return (
            <ArtistPortalFace
              key={slotArtifact.artifactId}
              artist={{ ...artist, rank: artistIndex + 2 }}
              artifact={slotArtifact}
              currentGenre={genre}
              frameStyle={orbitStyle}
              frameDepth={slotDepth}
              frameScale={slotScale}
              isFeatured={isFeatured}
              featureWeight={featureWeight}
              orbitDepth={depthMix}
              trailStrength={0.2 + depthMix * 0.6}
              frameVariant={getFrameVariant(slotIndex + 1, false, isFeatured)}
            />
          );
        })}
      </div>

      {home1ArtifactMap
        .filter((artifact) => artifact.type === "nav-hotspot")
        .map((artifact) => (
          <Link
            key={artifact.artifactId}
            href={artifact.routeTarget}
            className="home1-live-magazine__hotspot"
            style={artifactFrameStyle(artifact)}
            aria-label={artifact.label}
            data-artifact-id={artifact.artifactId}
            data-analytics-event={artifact.analyticsEvent}
            data-route-target={artifact.routeTarget}
            data-fallback-route={artifact.fallbackRoute}
          />
        ))}

      <div
        style={{
          position: "absolute",
          left: "3%",
          bottom: "4%",
          width: "32%",
          maxHeight: "34%",
          overflow: "auto",
          zIndex: 92,
          pointerEvents: "auto",
        }}
      >
        <NewsArticleGrid columns={2} title="Live News" />
      </div>

      <div
        style={{
          position: "absolute",
          right: "3%",
          bottom: "4%",
          width: "32%",
          maxHeight: "34%",
          overflow: "auto",
          zIndex: 92,
          pointerEvents: "auto",
        }}
      >
        <SponsorAdSlotGrid columns={2} title="Live Sponsors" />
      </div>

      {home1ArtifactMap
        .filter((artifact) => artifact.type !== "face-slot" && artifact.type !== "nav-hotspot")
        .map((artifact) => (
          <div
            key={artifact.artifactId}
            className={`home1-live-magazine__artifact home1-live-magazine__artifact--${artifact.type}`}
            style={artifactFrameStyle(artifact)}
            data-artifact-id={artifact.artifactId}
            data-artifact-type={artifact.type}
            data-analytics-event={artifact.analyticsEvent}
            data-route-target={artifact.routeTarget}
            data-fallback-route={artifact.fallbackRoute}
          >
            <Link href={artifact.routeTarget} className="home1-live-magazine__artifact-link">
              {artifact.type === "genre-label" ? `Top Genre: ${genre}` : artifact.label}
            </Link>
          </div>
        ))}
    </section>
  );
}
