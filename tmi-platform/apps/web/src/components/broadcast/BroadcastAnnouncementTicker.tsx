"use client";

/**
 * BroadcastAnnouncementTicker — real-time room-open announcement strip.
 *
 * Converges three existing, real building blocks (per
 * .cursor/artifacts/hub-role-separation/TMI_MASTER_CONVERGENCE_BLUEPRINT_2026_09_19.md §9)
 * instead of forking a new one:
 *   1. RuntimeEventBus's `world:session_added` / `world:session_ended` channels
 *      (published by BroadcastControlRuntime.startBroadcast() / GlobalLiveSessionRegistry)
 *      for real-time room-open/close pushes.
 *   2. GET /api/live/go — the same endpoint OpportunityDockPanel already polls —
 *      so the ticker has correct state even for rooms that were already live
 *      before this component mounted (a bus event only fires going forward).
 *   3. BroadcastOpportunityFeed's static discovery list, demoted to the honest
 *      FALLBACK tier only, shown when there is no real announcement.
 *
 * Rule 20/38: never fabricates a "Room X just opened" announcement — every
 * card comes from a real registry session (battle/cypher/challenge, the same
 * filter OpportunityDockPanel already applies). The fallback tier is visually
 * and textually labeled "Discover" and never phrased as live/happening-now.
 *
 * Routing reuses OpportunityDockPanel's exact `/live/rooms/${roomId}` pattern —
 * no new routing scheme invented here.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { runtimeEventBus, CHANNELS } from "@/lib/runtime/RuntimeEventBus";
import type {
  WorldSessionAddedPayload,
  WorldSessionEndedPayload,
} from "@/lib/runtime/RuntimeEventTypes";
import { BroadcastOpportunityFeed } from "@/components/broadcast/BroadcastOpportunityFeed";

/** Same shape OpportunityDockPanel.tsx already fetches from GET /api/live/go. */
interface LiveApiSession {
  userId: string;
  displayName: string;
  title: string;
  category: "cypher" | "battle" | "concert" | "challenge" | "live" | "game" | "session";
  roomId: string;
  viewerCount: number;
  accentColor?: string;
}

type AnnouncementCategory = "battle" | "cypher" | "challenge";

interface RealAnnouncement {
  id: string;
  label: string;
  title: string;
  route: string;
  accentColor: string;
  icon: string;
  viewerCount: number;
}

const CATEGORY_META: Record<AnnouncementCategory, { icon: string; label: string; accentColor: string }> = {
  battle: { icon: "⚔️", label: "BATTLE OPEN", accentColor: "#FF2DAA" },
  cypher: { icon: "🎤", label: "CYPHER LIVE", accentColor: "#00FFFF" },
  challenge: { icon: "🏆", label: "CHALLENGE OPEN", accentColor: "#FFD700" },
};

function isAnnouncementCategory(value: string): value is AnnouncementCategory {
  return value === "battle" || value === "cypher" || value === "challenge";
}

function sessionToAnnouncement(session: LiveApiSession): RealAnnouncement | null {
  if (!isAnnouncementCategory(session.category)) return null;
  const meta = CATEGORY_META[session.category];
  return {
    id: session.roomId,
    label: meta.label,
    title: session.title || session.displayName,
    // Same destination resolution OpportunityDockPanel.tsx already uses for its cards.
    route: `/live/rooms/${session.roomId}`,
    accentColor: session.accentColor || meta.accentColor,
    icon: meta.icon,
    viewerCount: session.viewerCount ?? 0,
  };
}

export interface BroadcastAnnouncementTickerProps {
  rotateMs?: number;
}

export default function BroadcastAnnouncementTicker({
  rotateMs = 6000,
}: BroadcastAnnouncementTickerProps) {
  const [sessions, setSessions] = useState<Map<string, LiveApiSession>>(new Map());
  const [index, setIndex] = useState(0);

  // ── Poll GET /api/live/go — same real endpoint + field shape OpportunityDockPanel
  // already relies on — so the ticker is correct even before any bus event fires. ──
  useEffect(() => {
    let cancelled = false;
    const fetchSessions = async () => {
      try {
        const res = await fetch("/api/live/go", { cache: "no-store" });
        const data = (await res.json()) as { sessions?: LiveApiSession[] };
        if (cancelled) return;
        const next = new Map<string, LiveApiSession>();
        for (const session of data.sessions ?? []) {
          if (isAnnouncementCategory(session.category)) {
            next.set(session.roomId, session);
          }
        }
        setSessions(next);
      } catch {
        if (!cancelled) setSessions(new Map());
      }
    };
    void fetchSessions();
    const poll = window.setInterval(() => void fetchSessions(), 15000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, []);

  // ── Real-time push: RuntimeEventBus world:session_added / world:session_ended ──
  // (channels confirmed real in lib/runtime/RuntimeEventBus.ts + RuntimeEventTypes.ts;
  // published by BroadcastControlRuntime.startBroadcast()). Covers a room opening
  // or closing between two 15s poll cycles — never invents an event type the bus
  // doesn't actually emit.
  useEffect(() => {
    const unsubAdded = runtimeEventBus.subscribe<WorldSessionAddedPayload>(
      CHANNELS.WORLD_SESSION_ADDED,
      (event) => {
        const { sessionId, performerName, venueType } = event.detail;
        if (!isAnnouncementCategory(venueType)) return;
        setSessions((prev) => {
          const next = new Map(prev);
          next.set(sessionId, {
            userId: sessionId,
            displayName: performerName,
            title: performerName,
            category: venueType,
            roomId: sessionId,
            viewerCount: 0,
          });
          return next;
        });
      },
    );
    const unsubEnded = runtimeEventBus.subscribe<WorldSessionEndedPayload>(
      CHANNELS.WORLD_SESSION_ENDED,
      (event) => {
        const { sessionId } = event.detail;
        setSessions((prev) => {
          if (!prev.has(sessionId)) return prev;
          const next = new Map(prev);
          next.delete(sessionId);
          return next;
        });
      },
    );
    return () => {
      unsubAdded();
      unsubEnded();
    };
  }, []);

  const announcements = useMemo(
    () =>
      Array.from(sessions.values())
        .map(sessionToAnnouncement)
        .filter((a): a is RealAnnouncement => a !== null),
    [sessions],
  );

  // Keep the rotation index in range whenever the real announcement set changes size.
  useEffect(() => {
    setIndex((current) => (announcements.length === 0 ? 0 : current % announcements.length));
  }, [announcements.length]);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % announcements.length);
    }, rotateMs);
    return () => window.clearInterval(timer);
  }, [announcements.length, rotateMs]);

  // ── No real announcement: honest fallback tier only, never phrased as live. ──
  if (announcements.length === 0) {
    return (
      <div data-broadcast-ticker="fallback">
        <div
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: "rgba(255,255,255,0.4)",
            marginBottom: 4,
            textTransform: "uppercase",
          }}
        >
          Discover · Nothing live in Battle/Cypher/Challenge right now
        </div>
        <BroadcastOpportunityFeed rotateMs={rotateMs} />
      </div>
    );
  }

  const current = announcements[index % announcements.length]!;

  return (
    <div data-broadcast-ticker="live" data-broadcast-ticker-active-id={current.id}>
      <Link
        href={current.route}
        style={{
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderRadius: 8,
          border: `1px solid ${current.accentColor}55`,
          background: `linear-gradient(120deg, ${current.accentColor}1f, rgba(0,0,0,0.3))`,
          padding: "6px 8px",
        }}
      >
        <span style={{ fontSize: 15, lineHeight: 1 }}>{current.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 7,
              fontWeight: 900,
              letterSpacing: "0.14em",
              color: current.accentColor,
              marginBottom: 1,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span aria-hidden style={{ color: "#00FF88" }}>●</span> LIVE NOW · {current.label}
          </div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: "#fff",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {current.title}
          </div>
        </div>
        {current.viewerCount > 0 ? (
          <span style={{ fontSize: 8, color: "rgba(255,255,255,0.5)", fontWeight: 700, flexShrink: 0 }}>
            👥 {current.viewerCount}
          </span>
        ) : null}
        <span style={{ color: current.accentColor, fontSize: 13, flexShrink: 0 }}>›</span>
      </Link>
    </div>
  );
}
