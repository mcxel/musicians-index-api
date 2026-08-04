"use client";

/**
 * /rooms/cypher — canonical Cipher Arena live surface.
 *
 * Mounts CipherArenaShell as the production presentation shell.
 * Presentation ownership:
 *   CipherPresentationStateMachine → tmi:system:event →
 *   CypherPresentationAdapter → DirectorRegistry
 *
 * LEGACY: ArenaEventShell was previously mounted here for venue immersion.
 * Kept in the codebase (see components/live/ArenaEventShell.tsx) until the
 * CipherArenaShell mount is verified across discovery + go-live entry paths.
 * Do not delete ArenaEventShell until that verification lands.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import LocalCameraFeed from "@/components/live/LocalCameraFeed";
import CipherArenaShell from "@/components/cipher/CipherArenaShell";
import { CypherRuntimeProvider } from "@/components/eos/CypherRuntimeContext";
import CypherPresentationAdapter from "@/lib/cypher/CypherPresentationAdapter";
import type { CipherArenaConfig, CipherPerformer } from "@/lib/cipher/CipherPresentationTypes";
import {
  countHumanAttendance,
  type PresenceKind,
} from "@/lib/venues/venuePresenceMetrics";

const ROOM_ID = "cypher";

interface QueueSlotApiShape {
  performerId: string;
  performerName: string;
  status: string;
  priority: number;
}

interface AudienceMemberRow {
  userId: string;
  displayName?: string;
  role?: string;
  presenceKind?: PresenceKind;
}

type PresenceLoadState = "loading" | "ready" | "error";

export default function CypherRoomPage() {
  const [performers, setPerformers] = useState<CipherPerformer[]>([]);
  const [queueLoading, setQueueLoading] = useState(true);
  const [humanViewers, setHumanViewers] = useState(0);
  const [presenceState, setPresenceState] = useState<PresenceLoadState>("loading");
  const [activePerformerIndex, setActivePerformerIndex] = useState(0);

  // Boot presentation adapter once — owns DirectorRegistry routing.
  useEffect(() => {
    const adapter = new CypherPresentationAdapter(ROOM_ID, "cypher-pit-arena");
    adapter.initialize();
    // Seed lighting / monitor layout via the same bus the state machine uses.
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("tmi:system:event", {
          detail: {
            eventName: "InitializeCypher",
            payload: { competitionId: ROOM_ID },
          },
        }),
      );
    }
  }, []);

  // Real queue from /api/live/queue — honest empty when none.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/live/queue?venue=${ROOM_ID}`, { cache: "no-store" });
        const data = (await res.json()) as { slots?: QueueSlotApiShape[] };
        if (cancelled) return;
        const slots = data.slots ?? [];
        const next: CipherPerformer[] = slots.map((s, i) => ({
          id: s.performerId,
          displayName: s.performerName,
          accentColor: i === 0 ? "#00FFFF" : "#FFD700",
          verseLabel: s.status === "active" ? "ON MIC" : "IN QUEUE",
        }));
        setPerformers(next);
        const activeIdx = slots.findIndex((s) => s.status === "active");
        setActivePerformerIndex(activeIdx >= 0 ? activeIdx : 0);
      } catch {
        if (!cancelled) setPerformers([]);
      } finally {
        if (!cancelled) setQueueLoading(false);
      }
    };
    void load();
    const id = setInterval(load, 15_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Human attendance only — PresenceKind.HUMAN (Rule 20).
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(
          `/api/live/audience?venue=${encodeURIComponent(ROOM_ID)}&messages=0`,
          { cache: "no-store" },
        );
        if (!res.ok) {
          if (!cancelled) {
            setHumanViewers(0);
            setPresenceState("error");
          }
          return;
        }
        const data = (await res.json()) as { activeMembers?: AudienceMemberRow[] };
        if (cancelled) return;
        const members = Array.isArray(data.activeMembers) ? data.activeMembers : [];
        setHumanViewers(countHumanAttendance(members));
        setPresenceState("ready");
      } catch {
        if (!cancelled) {
          setHumanViewers(0);
          setPresenceState("error");
        }
      }
    };
    void load();
    const id = setInterval(load, 20_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const config: CipherArenaConfig = useMemo(
    () => ({
      roomId: ROOM_ID,
      eventTitle: "Cypher Arena",
      audienceCount: presenceState === "loading" ? undefined : humanViewers,
      performers,
      activePerformerIndex: performers.length === 0 ? 0 : Math.min(activePerformerIndex, performers.length - 1),
      mode: "cypher",
      // Votes stay closed until a real vote session opens — never fabricate %.
      voteState: undefined,
      winnerId: null,
    }),
    [performers, activePerformerIndex, humanViewers, presenceState],
  );

  const onVote = useCallback(async (performerId: string) => {
    try {
      await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ performerId: `cypher-${performerId}` }),
      });
    } catch {
      /* non-blocking — server is source of truth for displayed percentages */
    }
  }, []);

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "0 0 80px" }}>
          <div
            style={{
              padding: "28px 32px 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 9, letterSpacing: 4, color: "#AA2DFF", fontWeight: 800, marginBottom: 4 }}>
                LIVE ROOM
              </div>
              <h1 style={{ fontSize: "clamp(18px,3vw,26px)", fontWeight: 900, letterSpacing: 3, margin: 0 }}>
                CYPHER ARENA
              </h1>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ fontSize: 11, color: "#666" }}>
                {presenceState === "loading"
                  ? "Loading…"
                  : humanViewers === 0
                    ? "No connected viewers"
                    : `👤 ${humanViewers} watching`}
              </div>
              <Link href="/rooms" style={{ fontSize: 10, color: "#555", textDecoration: "none", letterSpacing: 1 }}>
                ← ROOMS
              </Link>
            </div>
          </div>

          <div style={{ padding: "20px 32px 0", height: "min(72vh, 720px)" }}>
            <CypherRuntimeProvider roomId={ROOM_ID} sessionGenre="Hip-Hop">
              <CipherArenaShell config={config} onVote={onVote} />
            </CypherRuntimeProvider>
          </div>

          <div style={{ padding: "16px 32px 0", maxWidth: 720 }}>
            {queueLoading && (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Loading queue…</div>
            )}
            {!queueLoading && performers.length === 0 && (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                Queue empty — request a mic from the Cypher Queue panel, or join from your Performer Dashboard.
              </div>
            )}
          </div>
        </div>
      </HUDFrame>
      <FooterHUD />
      <LocalCameraFeed />
    </PageShell>
  );
}
