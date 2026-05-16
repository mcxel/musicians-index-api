"use client";

import { ImageSlotWrapper } from '@/components/visual-enforcement/ImageSlotWrapper';
import Link from "next/link";
import type { CSSProperties } from "react";
import { lockNavigation } from "@/lib/navigationLock";
import type { LiveArtist } from "@/lib/data/artistPool";
import type { Home1Artifact } from "@/packages/magazine-engine/home1ArtifactMap";
import FrameShell, { type FrameVariant } from "@/components/frames/FrameShell";
import ArtifactMotionFrame from "@/components/common/ArtifactMotionFrame";
import { trackArtifactClick, trackHomepageArticleClick } from "@/lib/artifactEventTracker";

type ArtistPortalFaceProps = {
  artist: LiveArtist;
  artifact: Home1Artifact;
  currentGenre: string;
  frameStyle?: CSSProperties;
  frameVariant?: FrameVariant;
  frameDepth?: number;
  frameScale?: number;
  isFeatured?: boolean;
  featureWeight?: number;
  orbitDepth?: number;
  trailStrength?: number;
};

function fillRoute(path: string, slug: string): string {
  return path.replace("[slug]", slug);
}

export default function ArtistPortalFace({
  artist,
  artifact,
  currentGenre,
  frameStyle,
  frameVariant = "orbit",
  frameDepth = 0,
  frameScale = 1,
  isFeatured = false,
  featureWeight = 0,
  orbitDepth = 0.5,
  trailStrength = 0.4,
}: ArtistPortalFaceProps) {
  const profileRoute = fillRoute(artifact.routeTarget, artist.id);
  const articleRoute = `/artists/${artist.id}/article?from=${encodeURIComponent("/home/1")}`;
  const roomId = `artist-portal-${artist.id}`;
  const currentImage = '/artists/artist-01.png';
  const livePulse = Math.max(0, Math.round(artist.score * 10));
  const momentum = Math.max(0, Math.round((100 - artist.rank * 2.3) * 10));

  const actions = [
    {
      id: "view",
      label: "View",
      routeTarget: `/artists/${artist.id}`,
      fallbackRoute: `/artist/${artist.id}`,
      analyticsEvent: "home1_artist_view_click",
    },
    {
      id: "vote",
      label: "Vote",
      routeTarget: `/vote/idol?artist=${artist.id}`,
      fallbackRoute: "/home/1",
      analyticsEvent: "home1_artist_vote_click",
    },
    {
      id: "article",
      label: "Article",
      routeTarget: articleRoute,
      fallbackRoute: "/magazine/articles/phase-c-artist",
      analyticsEvent: "home1_artist_article_click",
    },
    {
      id: "live",
      label: "Live",
      routeTarget: `/artists/${artist.id}/live`,
      fallbackRoute: `/live/room/${artist.id}`,
      analyticsEvent: "home1_artist_live_click",
    },
  ];

  if (artist.addOnTier !== "NONE") {
    actions.push({
      id: "book",
      label: "Book",
      routeTarget: `/booking/artists/${artist.id}`,
      fallbackRoute: "/booking",
      analyticsEvent: "home1_artist_booking_click",
    });
  }

  return (
    <ArtifactMotionFrame
      artifactId={artifact.artifactId}
      scope={artifact.slotRole === "crown" ? "home1-center" : "home1-orbit"}
      routeTarget={profileRoute}
      featured={isFeatured || artifact.slotRole === "crown"}
      cycleMs={4200}
      className={`home1-portal-frame-wrap home1-portal-frame-wrap--${artifact.slotRole ?? "surround"}`}
      style={
        frameStyle ?? {
          left: `${artifact.x}%`,
          top: `${artifact.y}%`,
          width: `${artifact.w}%`,
          height: `${artifact.h}%`,
          zIndex: artifact.zIndex,
        }
      }
      data-artist-id={artist.id}
      data-artist-rank={artist.rank}
      data-artist-genre={currentGenre}
      data-live-pulse={livePulse}
      data-live-momentum={momentum}
      data-artifact-id={artifact.artifactId}
      data-artifact-type={artifact.type}
      data-analytics-event={artifact.analyticsEvent}
      data-route-target={artifact.routeTarget}
      data-fallback-route={artifact.fallbackRoute}
    >
      <FrameShell
        variant={frameVariant}
        featured={isFeatured}
        style={{
          "--frame-depth": `${frameDepth}px`,
          "--frame-scale": String(frameScale),
          "--feature-weight": String(featureWeight),
          "--orbit-depth": String(orbitDepth),
          "--trail-strength": String(trailStrength),
        } as CSSProperties}
      >
        <div className={`home1-portal-face home1-portal-face--${artifact.slotRole ?? "surround"}`}>
          <div className="home1-portal-face__trail" aria-hidden />
          <Link
            href={profileRoute}
            className="home1-portal-face__portrait-link"
            data-testid={artifact.slotRole === "crown" ? "home1-artist-profile-link" : undefined}
            data-analytics-event="home1_artist_profile_click"
            onClick={() => {
              trackArtifactClick(
                {
                  id: artifact.artifactId,
                  type: "artist-frame",
                  route: profileRoute,
                  previewRoute: `${profileRoute}?preview=1`,
                  fallbackRoute: "/home/1",
                  onClickAction: "route",
                  dataSource: "home1.liveMagazine",
                },
                { actor: "Home1 Artifact" },
              );
              lockNavigation(profileRoute);
            }}
          >
            <ImageSlotWrapper
              imageId={`artist-portal-${artist.id}`}
              roomId={roomId}
              priority="high"
              fallbackUrl={currentImage}
              altText={`${artist.name} portrait`}
              className="w-full h-full object-cover"
              containerStyle={{ width: '100%', height: '100%' }}
            />
            <span className="home1-portal-face__genre">{currentGenre}</span>
          </Link>

          <div className="home1-portal-face__chrome">
            <span className="home1-portal-face__rank">#{artist.rank}</span>
            <Link
              href={profileRoute}
              className="home1-portal-face__name"
              data-analytics-event="home1_artist_name_profile_click"
              onClick={() => lockNavigation(profileRoute)}
            >
              {artist.name}
            </Link>
            <div className="home1-portal-face__stats" aria-label="Live artist signals">
              <span className="home1-portal-face__stat">LIVE {livePulse}</span>
              <span className="home1-portal-face__stat">MOM {momentum}</span>
            </div>
            <div className="home1-portal-face__actions">
              {actions.map((action) => (
                <Link
                  key={action.id}
                  href={action.routeTarget}
                  className="home1-portal-face__action"
                  data-testid={
                    action.id === "article"
                      ? artifact.slotRole === "crown"
                        ? "home1-artist-article-link"
                        : `home1-artist-article-link-${artist.id}`
                      : undefined
                  }
                  data-analytics-event={action.analyticsEvent}
                  data-route-target={action.routeTarget}
                  data-fallback-route={action.fallbackRoute}
                  onClick={() => {
                    if (action.id === "article") {
                      trackHomepageArticleClick({
                        actor: "Home1 Artifact",
                        route: action.routeTarget,
                        artistId: artist.id,
                        sourceHomepage: "home1",
                        sourceFrame: artifact.artifactId,
                      });
                    }
                    lockNavigation(action.routeTarget);
                  }}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </FrameShell>
    </ArtifactMotionFrame>
  );
}
