"use client";

import { useEffect, useMemo, useState } from "react";
import { ensureAllFeeds, type TmiAllFeeds } from "@/packages/magazine-engine/liveFeedBus";

type FeedKey = keyof TmiAllFeeds;

type FeedCard = {
  key: FeedKey;
  route: string;
  phase: string;
  featuredId: string;
  timestamp: string;
  status: "LIVE" | "STANDBY" | "FALLBACK";
  activeArtist: string;
  activeGenre: string;
  activeArtifactCount: number;
  errors: string[];
};

const HOME_KEYS: FeedKey[] = ["home1", "home2", "home3", "home4", "home5"];

const LABELS: Record<FeedKey, string> = {
  home1: "HOME 1",
  home2: "HOME 2",
  home3: "HOME 3",
  home4: "HOME 4",
  home5: "HOME 5",
};

const COLORS: Record<FeedKey, string> = {
  home1: "#67e8f9",
  home2: "#a78bfa",
  home3: "#6ee7b7",
  home4: "#fcd34d",
  home5: "#f9a8d4",
};

function socketLabel(readyState: number | null): string {
  if (readyState === WebSocket.OPEN) return "OPEN";
  if (readyState === WebSocket.CONNECTING) return "CONNECTING";
  if (readyState === WebSocket.CLOSING) return "CLOSING";
  if (readyState === WebSocket.CLOSED) return "CLOSED";
  return "NONE";
}

function artifactCountFromFeed(feed: Record<string, unknown> | undefined): number {
  if (!feed) return 0;
  return Object.entries(feed).filter(([k, v]) => {
    if (k === "timestamp") return false;
    if (v === null || v === undefined) return false;
    if (typeof v === "string") return v.trim().length > 0;
    if (typeof v === "number") return Number.isFinite(v);
    if (typeof v === "boolean") return true;
    return true;
  }).length;
}

function inferActiveArtist(key: FeedKey, feed: Record<string, unknown> | undefined): string {
  if (!feed) return "n/a";
  if (key === "home1") return String(feed.featuredId ?? "n/a");
  if (key === "home3") return String(feed.activeShow ?? "n/a");
  if (key === "home4") return String(feed.marketplaceState ?? "n/a");
  if (key === "home5") return String(feed.leaderboardState ?? "n/a");
  return String(feed.layoutState ?? "n/a");
}

function inferGenre(feed: Record<string, unknown> | undefined): string {
  if (!feed) return "n/a";
  return String(feed.genre ?? "n/a");
}

export default function HomeFeedObserver({ title = "Unified Home Feed Observer" }: { title?: string }) {
  const [feeds, setFeeds] = useState<Partial<TmiAllFeeds>>({});
  const [lastUpdateAt, setLastUpdateAt] = useState<number>(0);
  const [socketState, setSocketState] = useState<number | null>(null);

  useEffect(() => {
    ensureAllFeeds();

    const refresh = () => {
      const next = (window.__TMI_ALL_FEEDS__ ?? {}) as Partial<TmiAllFeeds>;
      setFeeds(next);
      setLastUpdateAt(Date.now());
      const rs = window.__TMI_FEED_SOCKET__?.readyState;
      setSocketState(typeof rs === "number" ? rs : null);
    };

    const onAllFeeds = (event: Event) => {
      const detail = (event as CustomEvent<Partial<TmiAllFeeds>>).detail;
      setFeeds(detail ?? {});
      setLastUpdateAt(Date.now());
      const rs = window.__TMI_FEED_SOCKET__?.readyState;
      setSocketState(typeof rs === "number" ? rs : null);
    };

    refresh();
    window.addEventListener("tmi:all-feeds", onAllFeeds as EventListener);
    const timer = window.setInterval(refresh, 1000);

    return () => {
      window.removeEventListener("tmi:all-feeds", onAllFeeds as EventListener);
      window.clearInterval(timer);
    };
  }, []);

  const isSocketOpen = socketState === WebSocket.OPEN;
  const staleMs = lastUpdateAt ? Date.now() - lastUpdateAt : Number.POSITIVE_INFINITY;
  const stale = staleMs > 6000;

  const cards = useMemo<FeedCard[]>(() => {
    return HOME_KEYS.map((key) => {
      const route = `/home/${key.slice(-1)}`;
      const feed = feeds[key] as Record<string, unknown> | undefined;
      const phase = String(feed?.phase ?? "offline");
      const errors: string[] = [];

      if (!feed) {
        errors.push("missing-feed-payload");
      }
      if (!isSocketOpen) {
        errors.push(`socket-${socketLabel(socketState).toLowerCase()}`);
      }
      if (stale) {
        errors.push("stale-feed-heartbeat");
      }

      const activeArtifactCount = artifactCountFromFeed(feed);
      const activeArtist = inferActiveArtist(key, feed);
      const activeGenre = inferGenre(feed);
      const featuredId = String(feed?.featuredId ?? "n/a");
      const timestamp = String(feed?.timestamp ?? "n/a");

      let status: FeedCard["status"] = "LIVE";
      if (!isSocketOpen || stale) status = "FALLBACK";
      else if (phase === "idle" || phase === "standby" || phase === "offline") status = "STANDBY";

      return {
        key,
        route,
        phase,
        featuredId,
        timestamp,
        status,
        activeArtist,
        activeGenre,
        activeArtifactCount,
        errors,
      };
    });
  }, [feeds, isSocketOpen, socketState, stale]);

  return (
    <section
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 14,
        padding: 16,
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      <p style={{ marginTop: 2, marginBottom: 12, opacity: 0.75, fontSize: 12 }}>
        Socket: {socketLabel(socketState)} · Last update: {lastUpdateAt ? new Date(lastUpdateAt).toLocaleTimeString() : "n/a"}
      </p>

      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))" }}>
        {cards.map((card) => {
          const color = COLORS[card.key];
          return (
            <article
              key={card.key}
              style={{
                border: `1px solid ${color}55`,
                borderRadius: 12,
                background: `${color}10`,
                padding: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.16em", color }}>{LABELS[card.key]}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: card.status === "FALLBACK" ? "#f97316" : card.status === "LIVE" ? "#22c55e" : "#a3a3a3" }}>
                  {card.status}
                </span>
              </div>

              <div style={{ fontSize: 11, lineHeight: 1.65 }}>
                <div>phase: <strong>{card.phase}</strong></div>
                <div>featuredId: <strong>{card.featuredId}</strong></div>
                <div>timestamp: <strong>{card.timestamp}</strong></div>
                <div>route: <a href={card.route} target="_blank" rel="noreferrer" style={{ color }}>{card.route}</a></div>
                <div>active artist: <strong>{card.activeArtist}</strong></div>
                <div>active genre: <strong>{card.activeGenre}</strong></div>
                <div>active artifacts: <strong>{card.activeArtifactCount}</strong></div>
                <div>errors: <strong>{card.errors.length ? card.errors.join(", ") : "none"}</strong></div>
                {card.status === "FALLBACK" ? (
                  <div style={{ marginTop: 6, color: "#f97316", fontWeight: 700 }}>Feed Disconnected</div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
