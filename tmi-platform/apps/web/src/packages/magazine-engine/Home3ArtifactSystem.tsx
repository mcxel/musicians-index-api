"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import FrameShell, { type FrameVariant } from "@/components/frames/FrameShell";
import { trackArtifactClick } from "@/lib/artifactEventTracker";
import type { ArtifactRouteContract } from "@/lib/artifactRouteContract";
import { ensureAllFeeds, type TmiAllFeeds } from "@/packages/magazine-engine/liveFeedBus";
import ArtifactMotionFrame from "@/components/common/ArtifactMotionFrame";

type Home3Feed = TmiAllFeeds["home3"];

// ── Show / room artifact zone ──────────────────────────────────────────────────
type Home3ShowZone = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  frame: FrameVariant;
  label: string;
  badge: string;
  route: string;
  live?: boolean;
};

const HOME3_ZONES: Home3ShowZone[] = [
  // Main lobby preview (large left)
  { id: "main-lobby",     x: 2,  y: 4,  w: 34, h: 38, frame: "featured", label: "Main Lobby",          badge: "LIVE",      route: "/rooms/lobby",        live: true  },
  // Random room quick join (star - center-right)
  { id: "random-room",    x: 38, y: 4,  w: 24, h: 22, frame: "crown",    label: "Join Random Room",    badge: "INSTANT",   route: "/rooms/random",       live: true  },
  // Cypher arena
  { id: "cypher-arena",   x: 64, y: 4,  w: 18, h: 18, frame: "battle",   label: "Cypher Arena",        badge: "BATTLE",    route: "/live/cypher"          },
  // Stage Alpha countdown
  { id: "stage-alpha",    x: 84, y: 4,  w: 14, h: 10, frame: "orbit",    label: "Stage Alpha T-09:45", badge: "COUNTDOWN", route: "/events/weekly-crown"  },
  // Stage Beta
  { id: "stage-beta",     x: 84, y: 16, w: 14, h: 10, frame: "orbit",    label: "Stage Beta T-15:10",  badge: "COUNTDOWN", route: "/events/weekly-crown"  },

  // Lobby Wall (mid-left)
  { id: "lobby-wall",     x: 2,  y: 48, w: 22, h: 28, frame: "orbit",    label: "Lobby Wall",          badge: "USERS",     route: "/rooms/lobby"          },
  // World premiere
  { id: "world-premiere", x: 26, y: 48, w: 20, h: 14, frame: "star",     label: "World Premieres",     badge: "PREMIERE",  route: "/events/weekly-crown", live: true },
  // Event calendar
  { id: "event-calendar", x: 48, y: 48, w: 20, h: 14, frame: "battle",   label: "Event Calendar",      badge: "EVENTS",    route: "/events"               },
  // Gateway
  { id: "gateway",        x: 70, y: 48, w: 16, h: 14, frame: "crown",    label: "Gateway",             badge: "ENTER",     route: "/rooms/lobby"          },
  // Stream & Win
  { id: "stream-win",     x: 88, y: 48, w: 10, h: 14, frame: "orbit",    label: "Stream & Win",        badge: "REWARDS",   route: "/home/4"               },

  // Bottom row – active rooms
  { id: "room-1",         x: 2,  y: 80, w: 20, h: 16, frame: "battle",   label: "Room · Hip Hop",      badge: "OPEN",      route: "/rooms/lobby"          },
  { id: "room-2",         x: 24, y: 80, w: 20, h: 16, frame: "orbit",    label: "Room · R&B Night",    badge: "OPEN",      route: "/rooms/lobby"          },
  { id: "room-3",         x: 46, y: 80, w: 20, h: 16, frame: "orbit",    label: "Room · EDM Drop",     badge: "OPEN",      route: "/rooms/lobby"          },
  { id: "room-4",         x: 68, y: 80, w: 16, h: 16, frame: "battle",   label: "Room · Pop Singles",  badge: "OPEN",      route: "/rooms/lobby"          },
];

const BADGE_COLORS: Record<string, string> = {
  LIVE:      "border-emerald-400/50 text-emerald-300 bg-emerald-400/10",
  INSTANT:   "border-yellow-400/50 text-yellow-300 bg-yellow-400/10",
  BATTLE:    "border-rose-400/50 text-rose-300 bg-rose-400/10",
  COUNTDOWN: "border-cyan-400/50 text-cyan-300 bg-cyan-400/10",
  USERS:     "border-fuchsia-400/50 text-fuchsia-300 bg-fuchsia-400/10",
  PREMIERE:  "border-violet-400/50 text-violet-300 bg-violet-400/10",
  EVENTS:    "border-sky-400/50 text-sky-300 bg-sky-400/10",
  ENTER:     "border-amber-400/50 text-amber-300 bg-amber-400/10",
  REWARDS:   "border-gold-400/50 text-amber-200 bg-amber-400/8",
  OPEN:      "border-slate-400/30 text-slate-300 bg-slate-400/8",
};

function badgeClass(badge: string) {
  return BADGE_COLORS[badge] ?? "border-white/20 text-white/70 bg-white/5";
}

export default function Home3ArtifactSystem() {
  const [feed, setFeed] = useState<Home3Feed | null>(null);

  useEffect(() => {
    ensureAllFeeds();
    const read = () => {
      const runtimeFeed = window.__TMI_ALL_FEEDS__?.home3;
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

  const liveMode = feed?.activeShow !== "none" && feed?.activeShow !== undefined;

  const zones = useMemo(() => HOME3_ZONES, []);

  const buildContract = (id: string, route: string, type: ArtifactRouteContract["type"]): ArtifactRouteContract => ({
    id,
    type,
    route,
    previewRoute: `${route}?preview=1`,
    fallbackRoute: "/home/3",
    onClickAction: "route",
    dataSource: "home3.artifactCanvas",
  });

  return (
    <section
      className="home3-artifact-canvas"
      aria-label="Home 3 Live World Artifact Canvas"
      data-zone-id="home3-artifact-canvas"
      data-pdf-source="Tmi PDF's"
      data-pdf-map-ref="docs/TMI_PDF_TO_ARTIFACT_MAP.md"
    >
      <div className="home3-artifact-canvas__backdrop" aria-hidden />
      <header className="home3-artifact-canvas__header">
        <p className="home3-artifact-canvas__kicker">Live World Activity</p>
        <h2 className="home3-artifact-canvas__title">Live Rooms Artifact System</h2>
        <p className="home3-artifact-canvas__state">
          Show: {feed?.activeShow ?? "none"} · Mode: {liveMode ? "live" : "standby"}
        </p>
      </header>

      <div className="home3-artifact-canvas__layer" data-zone-map="home3">
        {zones.map((zone) => (
          <ArtifactMotionFrame
            key={zone.id}
            artifactId={zone.id}
            scope={zone.id === "main-lobby" || zone.id === "random-room" ? "home3-featured" : "home3-grid"}
            routeTarget={zone.route}
            featured={zone.id === "main-lobby" || zone.id === "random-room"}
            cycleMs={4600}
            className="home3-show-zone"
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
            <FrameShell variant={zone.frame} featured={zone.id === "main-lobby" || zone.id === "random-room"}>
              <Link className="home3-show-card" href={zone.route} onClick={() => trackArtifactClick(buildContract(zone.id, zone.route, zone.id.includes("room") || zone.id.includes("lobby") ? "lobby" : "show"), { actor: "Home3 Artifact" })}>
                <span
                  className={`home3-show-card__badge border rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] ${badgeClass(zone.badge)}`}
                >
                  {zone.badge}
                  {zone.live && (
                    <span className="ml-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 align-middle" />
                  )}
                </span>
                <p className="home3-show-card__label">{zone.label}</p>
                {zone.id === "random-room" && (
                  <p className="home3-show-card__cta">Instant Drop →</p>
                )}
              </Link>
            </FrameShell>
          </ArtifactMotionFrame>
        ))}
      </div>
    </section>
  );
}
