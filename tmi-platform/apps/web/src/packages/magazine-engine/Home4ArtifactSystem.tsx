"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import FrameShell, { type FrameVariant } from "@/components/frames/FrameShell";
import { trackArtifactClick } from "@/lib/artifactEventTracker";
import type { ArtifactRouteContract } from "@/lib/artifactRouteContract";
import { ensureAllFeeds, type TmiAllFeeds } from "@/packages/magazine-engine/liveFeedBus";
import ArtifactMotionFrame from "@/components/common/ArtifactMotionFrame";

type Home4Feed = TmiAllFeeds["home4"];

// ── Marketplace / game / ad artifact zone ─────────────────────────────────────
type Home4MarketZone = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  frame: FrameVariant;
  label: string;
  badge: string;
  route: string;
  hot?: boolean;
};

const HOME4_ZONES: Home4MarketZone[] = [
  // Featured game (large top-left)
  { id: "game-engine",    x: 2,  y: 4,  w: 34, h: 36, frame: "featured", label: "Game Engine Live",       badge: "FEATURED", route: "/home/4",          hot: true },
  // Name That Tune
  { id: "name-that-tune", x: 38, y: 4,  w: 22, h: 18, frame: "crown",    label: "Name That Tune",         badge: "LIVE",     route: "/home/4",          hot: true },
  // Deal or Feud
  { id: "deal-or-feud",   x: 62, y: 4,  w: 20, h: 18, frame: "battle",   label: "Deal or Feud",           badge: "SHOWDOWN", route: "/home/10"                   },
  // Booking portal
  { id: "booking-portal", x: 84, y: 4,  w: 14, h: 18, frame: "orbit",    label: "Booking Portal",         badge: "BOOK",     route: "/booking"                   },

  // Sponsor / ad strip (mid)
  { id: "sponsor-alpha",  x: 2,  y: 46, w: 20, h: 22, frame: "orbit",    label: "Sponsor Alpha",          badge: "AD",       route: "/advertise"                 },
  { id: "ad-slot-b",      x: 24, y: 46, w: 20, h: 22, frame: "orbit",    label: "Ad Slot B",              badge: "AD",       route: "/advertise"                 },
  { id: "weekly-event",   x: 46, y: 46, w: 24, h: 22, frame: "star",     label: "Weekly Event Tracker",   badge: "EVENTS",   route: "/events",          hot: true },
  { id: "prize-pool",     x: 72, y: 46, w: 26, h: 22, frame: "featured", label: "Prize Pool Live",        badge: "PRIZE",    route: "/home/4",          hot: true },

  // Bottom marketplace strip
  { id: "store-emotes",   x: 2,  y: 74, w: 20, h: 20, frame: "battle",   label: "Emote Store",            badge: "STORE",    route: "/store"                     },
  { id: "store-skins",    x: 24, y: 74, w: 20, h: 20, frame: "orbit",    label: "Venue Skins",            badge: "SKIN",     route: "/store"                     },
  { id: "rewards-hub",    x: 46, y: 74, w: 22, h: 20, frame: "orbit",    label: "Rewards Hub",            badge: "REWARDS",  route: "/rewards"                   },
  { id: "game-selector",  x: 70, y: 74, w: 28, h: 20, frame: "crown",    label: "Game Selector",          badge: "MODES",    route: "/home/4"                    },
];

const BADGE_COLORS: Record<string, string> = {
  FEATURED:  "border-cyan-400/50 text-cyan-300 bg-cyan-400/10",
  LIVE:      "border-emerald-400/50 text-emerald-300 bg-emerald-400/10",
  SHOWDOWN:  "border-rose-400/50 text-rose-300 bg-rose-400/10",
  BOOK:      "border-amber-400/50 text-amber-300 bg-amber-400/10",
  AD:        "border-slate-400/30 text-slate-400 bg-slate-400/8",
  EVENTS:    "border-sky-400/50 text-sky-300 bg-sky-400/10",
  PRIZE:     "border-yellow-400/50 text-yellow-300 bg-yellow-400/10",
  STORE:     "border-fuchsia-400/50 text-fuchsia-300 bg-fuchsia-400/10",
  SKIN:      "border-violet-400/50 text-violet-300 bg-violet-400/10",
  REWARDS:   "border-gold-400/50 text-amber-200 bg-amber-400/8",
  MODES:     "border-cyan-400/40 text-cyan-200 bg-cyan-400/8",
};

function badgeClass(badge: string) {
  return BADGE_COLORS[badge] ?? "border-white/20 text-white/70 bg-white/5";
}

export default function Home4ArtifactSystem() {
  const [feed, setFeed] = useState<Home4Feed | null>(null);

  useEffect(() => {
    ensureAllFeeds();
    const read = () => {
      const runtimeFeed = window.__TMI_ALL_FEEDS__?.home4;
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

  const liveMode = feed?.marketplaceState === "game-engine-live";
  const zones = useMemo(() => HOME4_ZONES, []);

  const buildContract = (id: string, route: string, type: ArtifactRouteContract["type"]): ArtifactRouteContract => ({
    id,
    type,
    route,
    previewRoute: `${route}?preview=1`,
    fallbackRoute: "/home/4",
    onClickAction: "route",
    dataSource: "home4.artifactCanvas",
  });

  return (
    <section
      className="home4-artifact-canvas"
      aria-label="Home 4 Marketplace Artifact Canvas"
      data-zone-id="home4-artifact-canvas"
      data-pdf-source="Tmi PDF's"
      data-pdf-map-ref="docs/TMI_PDF_TO_ARTIFACT_MAP.md"
    >
      <div className="home4-artifact-canvas__backdrop" aria-hidden />
      <header className="home4-artifact-canvas__header">
        <p className="home4-artifact-canvas__kicker">Sponsor · Ads · Marketplace</p>
        <h2 className="home4-artifact-canvas__title">Marketplace Artifact System</h2>
        <p className="home4-artifact-canvas__state">
          Market: {feed?.marketplaceState ?? "standby"} · Mode: {liveMode ? "live" : "standby"}
        </p>
      </header>

      <div className="home4-artifact-canvas__layer" data-zone-map="home4">
        {zones.map((zone) => (
          <ArtifactMotionFrame
            key={zone.id}
            artifactId={zone.id}
            scope={zone.id === "game-engine" || zone.id === "prize-pool" ? "home4-featured" : "home4-grid"}
            routeTarget={zone.route}
            featured={zone.id === "game-engine" || zone.id === "prize-pool"}
            cycleMs={4500}
            className="home4-market-zone"
            data-artifact-id={zone.id}
            data-route-target={zone.route}
            style={{
              position: "absolute",
              left: `${zone.x}%`,
              top: `${zone.y}%`,
              width: `${zone.w}%`,
              height: `${zone.h}%`,
            }}
          >
            <FrameShell variant={zone.frame} featured={zone.id === "game-engine" || zone.id === "prize-pool"}>
              <Link className="home4-market-card" href={zone.route} onClick={() => trackArtifactClick(buildContract(zone.id, zone.route, zone.badge === "AD" ? "sponsor-ad" : zone.badge === "SHOWDOWN" ? "game" : "cta"), { actor: "Home4 Artifact" })}>
                <span
                  className={`home4-market-card__badge border rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] ${badgeClass(zone.badge)}`}
                >
                  {zone.badge}
                  {zone.hot && (
                    <span className="ml-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 align-middle" />
                  )}
                </span>
                <p className="home4-market-card__label">{zone.label}</p>
              </Link>
            </FrameShell>
          </ArtifactMotionFrame>
        ))}
      </div>
    </section>
  );
}
