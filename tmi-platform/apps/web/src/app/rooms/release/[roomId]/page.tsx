"use client";

/**
 * /rooms/release/[roomId] — Phase 1 World / Mini Release presentation consumer.
 *
 * Shows & Releases catalog (+ optional ReleasePartyDirector phase) →
 * composeReleaseProgram → ReleasePresentationShell.
 * Premiere + artist + real merch — NOT Battle VS, NOT Cypher circle.
 * World vs Mini from kind / ?scope= — never invent World.
 * Never invents streams, preorders, attendance (Rule 20).
 */

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useMemo, useState } from "react";
import ReleasePresentationShell from "@/components/live/ReleasePresentationShell";
import TMIInteractiveVenueHud from "@/components/venue-hud/TMIInteractiveVenueHud";
import {
  getCurrentPhase,
  type ReleaseEventPhase,
  type ReleasePartyConfig,
} from "@/lib/broadcast/ReleasePartyDirectorEngine";
import type { ShowsReleasePublicCard } from "@/lib/events/ScheduledEventRegistry";
import {
  clearReleaseProgram,
  composeReleaseProgram,
  getActiveReleaseProgram,
  type ReleaseLifecyclePhase,
  type ReleaseMerchCta,
  type ReleaseProgramComposition,
  type ReleaseScope,
} from "@/lib/experiencePresentation/composeReleaseProgram";

const UniversalVenueRenderer = dynamic(
  () => import("@/components/live/UniversalVenueRenderer"),
  { ssr: false },
);

function resolveScope(
  roomId: string,
  scopeParam: string | null,
  kind: string | null
): ReleaseScope {
  const q = (scopeParam ?? "").toLowerCase();
  if (q === "world" || q === "world-release") return "WORLD";
  if (q === "mini" || q === "mini-release") return "MINI";
  if (kind === "WORLD_RELEASE") return "WORLD";
  if (kind === "MINI_RELEASE") return "MINI";
  if (roomId.startsWith("world-") || roomId.includes("world-release")) return "WORLD";
  return "MINI";
}

function mapDirectorPhase(phase: ReleaseEventPhase): ReleaseLifecyclePhase {
  return phase;
}

function ReleaseRoomInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = typeof params?.roomId === "string" ? params.roomId : "release-open";
  const eventIdParam = searchParams?.get("eventId")?.trim() || null;
  const releaseId = eventIdParam ?? (roomId.startsWith("release-") ? roomId.replace(/^release-/, "") : roomId);

  const [card, setCard] = useState<ShowsReleasePublicCard | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [merchCtas] = useState<ReleaseMerchCta[]>([]);
  const [releaseProgram, setReleaseProgram] = useState<ReleaseProgramComposition | null>(null);
  const [directorPhase, setDirectorPhase] = useState<ReleaseLifecyclePhase | null>(null);
  const [countdownSec, setCountdownSec] = useState<number | null>(null);

  const scope = useMemo(
    () => resolveScope(roomId, searchParams?.get("scope") ?? null, card?.kind ?? null),
    [roomId, searchParams, card?.kind],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch(`/api/events/shows-releases`, {
          credentials: "include",
          cache: "no-store",
        });
        const data = (await res.json()) as { ok?: boolean; events?: ShowsReleasePublicCard[] };
        if (!res.ok || !data.ok) {
          if (!cancelled) setLoadError("Unable to load Shows & Releases catalog.");
          return;
        }
        const events = Array.isArray(data.events) ? data.events : [];
        const match =
          events.find((e) => e.eventId === eventIdParam) ??
          events.find((e) => e.roomId === roomId) ??
          events.find(
            (e) =>
              (e.kind === "WORLD_RELEASE" || e.kind === "MINI_RELEASE") &&
              (e.eventId === releaseId || e.roomId === releaseId)
          ) ??
          null;
        if (!cancelled) {
          if (match && (match.kind === "WORLD_RELEASE" || match.kind === "MINI_RELEASE")) {
            setCard(match);
          } else if (match) {
            setCard(null);
            setLoadError("Matched event is a concert — use /rooms/concert for concert DNA.");
          } else {
            setCard(null);
          }
        }
      } catch {
        if (!cancelled) setLoadError("Unable to load Shows & Releases catalog.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventIdParam, roomId, releaseId]);

  // Director countdown when we have a real scheduled start (never invent times).
  useEffect(() => {
    if (!card?.scheduledStartIso) {
      setDirectorPhase(card?.phase ?? null);
      setCountdownSec(null);
      return;
    }
    const startsAt = Math.floor(Date.parse(card.scheduledStartIso) / 1000);
    if (!Number.isFinite(startsAt)) {
      setDirectorPhase(card.phase);
      setCountdownSec(null);
      return;
    }

    const tick = () => {
      const config: ReleasePartyConfig = {
        eventId: card.eventId,
        title: card.title,
        artistName: card.performerName,
        releaseName: card.title,
        releaseArtUrl: card.artworkUrl ?? "",
        genre: "release",
        startsAt,
        durationMinutes: 60,
        songCount: 1,
        performerCount: 1,
        hasSponsors: Boolean(
          card.sponsors?.releaseSponsorId ||
            card.sponsors?.presentingSponsorId ||
            card.sponsors?.artistSponsorId
        ),
      };
      const elapsedMs = Math.max(0, Date.now() - startsAt * 1000);
      const state = getCurrentPhase(config, elapsedMs);
      setDirectorPhase(mapDirectorPhase(state.phase));
      setCountdownSec(
        typeof state.countdownRemainingSec === "number" ? state.countdownRemainingSec : null
      );
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [card]);

  useEffect(() => {
    const phase: ReleaseLifecyclePhase =
      directorPhase ?? card?.phase ?? "PRESHOW";

    const composed = composeReleaseProgram({
      sessionId: `release-session:${releaseId}`,
      releaseId,
      roomId,
      eventId: card?.eventId ?? eventIdParam,
      scope,
      artistId: card?.performerId ?? null,
      artistDisplayName: card?.performerName ?? null,
      artistSlug: card?.performerSlug ?? null,
      releaseTitle: card?.title ?? null,
      artworkUrl: card?.artworkUrl ?? null,
      countdownRemainingSec: countdownSec,
      merchCtas,
      lifecyclePhase: phase,
      bindJumbotron: true,
    });
    setReleaseProgram(composed);

    return () => {
      if (getActiveReleaseProgram()?.releaseId === releaseId) {
        clearReleaseProgram("release-room-unmount");
      }
    };
  }, [
    releaseId,
    roomId,
    eventIdParam,
    scope,
    card,
    directorPhase,
    countdownSec,
    merchCtas,
  ]);

  const badgeColor = scope === "WORLD" ? "#00FFFF" : "#FFD700";
  const storeHref = card?.performerSlug
    ? `/profile/performer/${encodeURIComponent(card.performerSlug)}`
    : card?.performerId
      ? `/profile/performer/${encodeURIComponent(card.performerId)}`
      : null;

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", position: "relative" }}>
      <div
        style={{
          padding: "16px 18px",
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          borderBottom: `1px solid ${scope === "WORLD" ? "rgba(0,255,255,0.35)" : "rgba(255,215,0,0.35)"}`,
          position: "relative",
          zIndex: 3,
          background: "rgba(5,5,16,0.92)",
        }}
      >
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.16em", color: badgeColor, fontWeight: 900 }}>
            {scope === "WORLD" ? "🌍 WORLD RELEASE" : "⭐ MINI RELEASE"} · PREMIERE
          </div>
          <h1 style={{ margin: "4px 0 0", fontSize: 22, color: "#FF8C00" }}>Release Party</h1>
          <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.65)", fontSize: 13 }}>
            Room {roomId} — premiere focus; not Battle VS / Cypher combat.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {storeHref ? (
            <Link
              href={storeHref}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid rgba(255,140,0,0.4)",
                background: "rgba(255,140,0,0.1)",
                color: "#FF8C00",
                fontWeight: 900,
                fontSize: 11,
                textDecoration: "none",
              }}
            >
              ARTIST PROFILE
            </Link>
          ) : null}
          {card?.joinHref ? (
            <Link
              href={`/live/rooms/${encodeURIComponent(card.roomId)}?from=shows-releases&eventId=${encodeURIComponent(card.eventId)}`}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                border: `1px solid ${badgeColor}66`,
                background: `${badgeColor}18`,
                color: badgeColor,
                fontWeight: 900,
                fontSize: 11,
                textDecoration: "none",
              }}
            >
              OPEN LIVE ROOM
            </Link>
          ) : null}
          <Link
            href="/home/4"
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.75)",
              fontWeight: 700,
              fontSize: 11,
              textDecoration: "none",
            }}
          >
            MARKETPLACE
          </Link>
        </div>
      </div>

      <div style={{ position: "relative", minHeight: 420 }}>
        <UniversalVenueRenderer
          roomId={roomId}
          mode="audience"
          venueIndex={0}
          instantEmptyStage
          eventType={scope === "WORLD" ? "world-release" : "mini-release"}
        />
        <div
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            top: 12,
            zIndex: 4,
            maxWidth: 720,
            margin: "0 auto",
            pointerEvents: "none",
          }}
        >
          {loading ? (
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>Loading release catalog…</p>
          ) : null}
          {loadError ? (
            <p style={{ color: "#FF6B6B", fontSize: 13 }}>{loadError}</p>
          ) : null}
          {!loading && !card ? (
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>
              No published World/Mini Release for this room yet — waiting for real Shows & Releases
              catalog data (no invented premiere).
            </p>
          ) : null}
          <div style={{ pointerEvents: "auto" }}>
            <ReleasePresentationShell composition={releaseProgram} />
          </div>
        </div>
        <TMIInteractiveVenueHud
          roomId={roomId}
          roomTitle={scope === "WORLD" ? "World Release" : "Mini Release"}
          experienceType="WORLD_RELEASE"
          role="performer"
          ownership="human_owned"
          isRoomOwner
        />
      </div>

      <div style={{ padding: 16, maxWidth: 640, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
        {card ? (
          <>
            {card.publicTypeLabel} · {card.dayTimeLabel} · {card.priceLabel} · phase {card.phase}
            {directorPhase ? ` · director ${directorPhase}` : ""}
          </>
        ) : (
          "Waiting for real release catalog — no invented premiere."
        )}
      </div>
    </main>
  );
}

export default function ReleaseRoomPage() {
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: 24 }}>
          Loading release room…
        </main>
      }
    >
      <ReleaseRoomInner />
    </Suspense>
  );
}
