"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CapabilityBadge from "@/components/common/CapabilityBadge";
import PresenceBar from "@/components/live/PresenceBar";
import LiveFeedTicker, { type TickerEvent } from "@/components/live/LiveFeedTicker";
import { emitSystemEvent } from "@/lib/systemEventBus";
import { getComponentCapability } from "@/lib/capabilities/componentCapabilityRegistry";
import ArtifactMotionFrame from "@/components/common/ArtifactMotionFrame";
import { trackHomepageArticleClick } from "@/lib/artifactEventTracker";

type LobbyWallProps = {
  lobbyId: string;
};

export default function LobbyWall({ lobbyId }: LobbyWallProps) {
  const capability = getComponentCapability("lobby-wall");
  const billboards = ["crown-weekly", "game-night", "sponsor-drops"];
  const games = ["name-that-tune", "deal-or-feud", "sponsor-mission"];
  const featuredPerformers = [
    { id: "onyx-lyric", name: "Onyx Lyric", route: "/performers/onyx-lyric" },
    { id: "big-a", name: "Big A", route: "/performers/big-a" },
  ];
  const [events, setEvents] = useState<TickerEvent[]>([]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setEvents((prev) => [
        {
          id: `lobby-${now}`,
          message: `Lobby ${lobbyId} sync pulse: live wall updated`,
          level: "info" as const,
          at: now,
        },
        ...prev,
      ].slice(0, 8));
    }, 5000);

    return () => window.clearInterval(id);
  }, [lobbyId]);

  return (
    <main
      data-testid="lobby-wall"
      aria-label="Lobby wall page"
      data-chain="lobby-route-chain"
      data-fallback-route="/home/3"
      style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: 20 }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 12 }}>
        <Link data-testid="lobby-back-home" aria-label="Back to live home" data-fallback-route="/home/1" href="/home/3" style={{ color: "#93c5fd", textDecoration: "none" }}>← Back to Live Home</Link>
        <h1 style={{ margin: 0 }}>Lobby Wall · {lobbyId}</h1>
        <p style={{ margin: 0, color: "#cbd5e1" }}>Live billboards, active players, game rooms, ads, and event flow.</p>
        {capability ? <CapabilityBadge capability={capability} compact /> : null}
        <PresenceBar roomId={`lobby-${lobbyId}`} />

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <article style={panel}>
            <h2 style={h2}>Live Billboards</h2>
            {billboards.map((id) => (
              <Link key={id} data-testid={`lobby-billboard-${id}`} aria-label={`Open billboard ${id}`} data-fallback-route="/billboards/crown-weekly" href={`/billboards/${id}`} onClick={() => emitSystemEvent({ type: "pipeline.billboard.open", actor: "Lobby Wall", sectionId: `billboard-${id}`, route: `/billboards/${id}`, message: `Lobby billboard open ${id}` })} style={linkStyle}>
                /billboards/{id}
              </Link>
            ))}
          </article>

          <article style={panel}>
            <h2 style={h2}>Games Running</h2>
            {games.map((id) => (
              <Link key={id} data-testid={`lobby-game-${id}`} aria-label={`Open game ${id}`} data-fallback-route="/games/name-that-tune" href={`/games/${id}`} onClick={() => emitSystemEvent({ type: "pipeline.game.open", actor: "Lobby Wall", sectionId: `game-${id}`, route: `/games/${id}`, message: `Lobby game open ${id}` })} style={linkStyle}>
                /games/{id}
              </Link>
            ))}
          </article>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {featuredPerformers.map((performer, index) => (
            <ArtifactMotionFrame
              key={performer.id}
              artifactId={`lobby-featured-${performer.id}`}
              scope="lobby-featured"
              routeTarget={performer.route}
              featured={index === 0}
              cycleMs={4600}
              data-testid={`lobby-featured-${performer.id}`}
              aria-label={`Open featured performer ${performer.name}`}
              data-fallback-route="/home/3"
              style={{ ...panel, padding: 12 }}
            >
              <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#86efac" }}>Featured Performer</div>
              <div style={{ marginTop: 6, fontSize: 16, fontWeight: 800 }}>{performer.name}</div>
              <Link
                href={performer.route}
                data-testid={`lobby-featured-link-${performer.id}`}
                aria-label={`Go to performer profile ${performer.name}`}
                data-fallback-route="/performers"
                onClick={() =>
                  emitSystemEvent({
                    type: "homepage.artifact.route",
                    actor: "Lobby Wall",
                    sectionId: `featured-${performer.id}`,
                    route: performer.route,
                    message: `Lobby featured performer route ${performer.id}`,
                  })
                }
                style={{ ...linkStyle, marginTop: 8, marginBottom: 0 }}
              >
                Open Profile
              </Link>
              <Link
                href={`/performers/${performer.id}/article?from=${encodeURIComponent("/home/3")}`}
                data-testid={index === 0 ? "performer-article-link" : `performer-article-link-${performer.id}`}
                aria-label={`Open performer article ${performer.name}`}
                data-fallback-route="/magazine/articles/performer-feature"
                onClick={() =>
                  trackHomepageArticleClick({
                    actor: "Lobby Performer",
                    route: `/performers/${performer.id}/article?from=${encodeURIComponent("/home/3")}`,
                    performerId: performer.id,
                    sourceHomepage: "home3",
                    sourceFrame: `featured-${performer.id}`,
                  })
                }
                style={{ ...linkStyle, marginTop: 6, marginBottom: 0, borderColor: "rgba(251,191,36,0.5)", color: "#fde68a" }}
              >
                ARTICLE
              </Link>
            </ArtifactMotionFrame>
          ))}
        </section>

        <LiveFeedTicker events={events} position="inline" maxVisible={4} />
      </div>
    </main>
  );
}

const panel: React.CSSProperties = {
  border: "1px solid rgba(148,163,184,0.35)",
  borderRadius: 12,
  background: "rgba(15,23,42,0.72)",
  padding: 10,
};

const h2: React.CSSProperties = {
  marginTop: 0,
  fontSize: 12,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "#a5f3fc",
};

const linkStyle: React.CSSProperties = {
  display: "block",
  border: "1px solid rgba(56,189,248,0.35)",
  borderRadius: 8,
  background: "rgba(14,116,144,0.18)",
  color: "#e0f2fe",
  textDecoration: "none",
  padding: "8px 9px",
  marginBottom: 7,
  fontSize: 12,
};
