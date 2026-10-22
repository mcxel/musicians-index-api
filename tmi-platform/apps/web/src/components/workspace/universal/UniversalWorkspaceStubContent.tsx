"use client";

/**
 * Renders Command Center drawer module bodies inside Universal Workspace windows (stub migration).
 */

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import YoPhoActivityHub from "@/components/yopho/YoPhoActivityHub";
import Link from "next/link";
import RoleGate from "@/components/auth/RoleGate";
import { MemoryWallCanister } from "@/components/canisters/MemoryWallCanister";
import { InventoryCanister } from "@/components/canisters/InventoryCanister";
import MediaLockerCanister from "@/components/canisters/MediaLockerCanister";
import { BookingCanister } from "@/components/canisters/BookingCanister";
import NotificationCanister from "@/components/canisters/NotificationCanister";
import MessagingCanister from "@/components/canisters/MessagingCanister";
import { gpsDestinationById, gpsDestinationState } from "@/lib/commandCenter/gpsReleaseAllowlist";
import SubmissionsCanister from "@/components/canisters/SubmissionsCanister";
import { NotesWorkspace } from "@/components/workspaces/NotesWorkspace";
import ScoresCanister from "@/components/canisters/ScoresCanister";
import { DEFAULT_FAN_LOBBY_SKIN_ID } from "@/lib/lobby/FanLobbySkinRegistry";
import { defaultRoomAuthority } from "@/lib/lobby/FanLobbyPresence";
import { getWorkspaceDef } from "@/lib/workspace/universal/UniversalWorkspaceRegistry";
import type { UniversalWorkspaceId } from "@/lib/workspace/universal/types";
import type { CommandCenterRole } from "@/components/commandCenter/commandCenterRegistry";
import LiveDestinationsDrawerPanel from "@/components/commandCenter/LiveDestinationsDrawerPanel";
import RoomControlsDrawerPanel from "@/components/commandCenter/RoomControlsDrawerPanel";
import MarketplaceDrawerPanel from "@/components/drawers/MarketplaceDrawerPanel";
import ShopDrawerPanel from "@/components/drawers/ShopDrawerPanel";
import AchievementCenterDrawer from "@/components/drawers/AchievementCenterDrawer";
import ChampionshipCenterDrawer from "@/components/championship/ChampionshipCenterDrawer";
import ChampionshipHistoryPanel from "@/components/championship/ChampionshipHistoryPanel";
import { useTheme } from "@/lib/design/ThemeEngine";
import { useActivePerformer } from "@/lib/context/ActivePerformerContext";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import { resolveFanWorldEntry } from "@/lib/live/canonicalWorldViewport";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";
import { getAdSlotForZone } from "@/lib/commerce/SponsorRegistry";
import StreamAndWinRadioPlayer from "@/components/radio/StreamAndWinRadioPlayer";
import { startStreamWin, exitStreamWin } from "@/lib/radio/StreamWinModeRuntime";
import { startVideoShuffle, exitVideoShuffle } from "@/lib/shuffle/VideoShuffleModeRuntime";
import { getUserPrizeVault } from "@/lib/commerce/AudienceGiveawayEngine";

const FanLobbyVenue = dynamic(() => import("@/components/live/FanLobbyVenue"), {
  ssr: false,
  loading: () => (
    <div style={{ padding: 24, color: "rgba(255,255,255,0.35)", fontSize: 11 }}>Loading Avatar Lobby…</div>
  ),
});

function YoPhoWorkspaceSlot({
  role,
  displayName,
  userId,
  slug,
}: {
  role: CommandCenterRole;
  displayName: string;
  userId: string;
  slug?: string;
}) {
  return (
    <YoPhoActivityHub role={role} displayName={displayName} userId={userId} slug={slug} />
  );
}

/** Stats drawer — real /api/fan/stats or honest empty + full-report link. */
function HubAnalyticsDrawerPanel({
  role,
  userId,
  accent,
}: {
  role: CommandCenterRole;
  userId: string;
  accent: string;
}) {
  const [state, setState] = useState<"loading" | "ready" | "empty" | "error" | "guest">("loading");
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    if (role !== "fan") {
      setState("empty");
      setSummary(null);
      return;
    }
    let cancelled = false;
    setState("loading");
    void (async () => {
      try {
        const res = await fetch(`/api/fan/stats?userId=${encodeURIComponent(userId)}`, {
          credentials: "include",
          cache: "no-store",
        });
        if (res.status === 401) {
          if (!cancelled) setState("guest");
          return;
        }
        if (!res.ok) throw new Error(`stats ${res.status}`);
        const data = (await res.json()) as {
          metrics?: {
            xp?: { value?: number };
            roomsJoined?: { value?: number };
            eventsAttended?: { value?: number };
          };
        };
        const m = data.metrics;
        if (!m) {
          if (!cancelled) setState("empty");
          return;
        }
        const parts = [
          typeof m.xp?.value === "number" ? `XP ${m.xp.value}` : null,
          typeof m.roomsJoined?.value === "number" ? `Rooms ${m.roomsJoined.value}` : null,
          typeof m.eventsAttended?.value === "number" ? `Events ${m.eventsAttended.value}` : null,
        ].filter(Boolean);
        if (!cancelled) {
          // Honest empty when all zeros — still show real zeros via ready if API returned
          const anyReal = parts.some((p) => !p?.endsWith(" 0"));
          setSummary(parts.length ? parts.join(" · ") : null);
          setState(parts.length ? (anyReal ? "ready" : "empty") : "empty");
          if (!anyReal && parts.length) setSummary(parts.join(" · "));
        }
      } catch {
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [role, userId]);

  return (
    <div style={{ padding: 16, fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
      {state === "loading" && <p>Loading statistics…</p>}
      {state === "guest" && <p>Sign in to view your real statistics.</p>}
      {state === "error" && <p>Unable to load statistics. Retry from the full report.</p>}
      {state === "empty" && (
        <p>
          {role === "performer"
            ? "Performer analytics appear when session telemetry is available. No fabricated engagement."
            : "No statistics recorded yet."}
        </p>
      )}
      {state === "ready" && summary && (
        <p style={{ color: "#fff", fontWeight: 700, marginBottom: 8 }}>{summary}</p>
      )}
      {state === "empty" && summary && (
        <p style={{ color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>{summary}</p>
      )}
      <Link
        href={role === "performer" ? "/performer/analytics" : "/fan/stats"}
        style={{ display: "block", marginTop: 12, color: accent, fontWeight: 800 }}
      >
        Open full statistics →
      </Link>
    </div>
  );
}

/** Rewards — AudienceGiveawayEngine PrizeVault only (honest empty when none). */
function HubPrizeVaultDrawerPanel({
  userId,
  role,
}: {
  userId: string;
  role: CommandCenterRole;
}) {
  const awards = useMemo(() => getUserPrizeVault(userId), [userId]);
  if (role !== "fan" && awards.length === 0) {
    return (
      <div style={{ padding: 16, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
        Prize vault is fan-facing. No fabricated performer reward inventory.
      </div>
    );
  }
  if (awards.length === 0) {
    return (
      <div style={{ padding: 16, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
        Prize vault entries appear when you win real rewards. No fabricated inventory (Rule 20).
      </div>
    );
  }
  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      {awards.map((a) => (
        <div
          key={a.awardId}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid rgba(255,215,0,0.35)",
            background: "rgba(255,215,0,0.06)",
            fontSize: 11,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          <div style={{ fontWeight: 800, color: "#FFD700" }}>{a.prizeTitle}</div>
          <div style={{ opacity: 0.7, marginTop: 4 }}>
            {a.status}
            {a.claimedAt ? ` · claimed ${a.claimedAt.slice(0, 10)}` : ""}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Sponsors — Rule 12 getAdSlotForZone; never invent paying sponsors.
 *  Performer: page / live promotion placements.
 *  Fan: Fan Live Lobby Wall placements (income path allowed).
 */
function HubSponsorsDrawerPanel({ role }: { role: CommandCenterRole }) {
  const zone =
    role === "performer" ? "hub-drawer-sponsors-performer" : "hub-drawer-sponsors-fan-lobby";
  const slot = getAdSlotForZone(zone);
  const intro =
    role === "performer"
      ? "Promote brands on your performer page and live surfaces when a sponsor is live."
      : "Fan Live Lobby Wall can carry sponsor placements so fans can earn too — never fake inventory.";

  if (slot.type === "paid" && slot.sponsor) {
    return (
      <div style={{ padding: 16, fontSize: 12 }}>
        <p style={{ color: "rgba(255,255,255,0.55)", marginBottom: 10, fontSize: 10 }}>{intro}</p>
        <div style={{ fontWeight: 900, color: slot.sponsor.accentColor, marginBottom: 6 }}>
          {slot.sponsor.name}
        </div>
        <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: 10 }}>{slot.sponsor.tagline}</p>
        <Link href={slot.sponsor.ctaHref} style={{ color: "#FFD700", fontWeight: 800 }}>
          {slot.sponsor.ctaLabel} →
        </Link>
      </div>
    );
  }
  if (slot.type === "platform" && slot.platformPromo) {
    const p = slot.platformPromo;
    return (
      <div style={{ padding: 16, fontSize: 12 }}>
        <p style={{ color: "rgba(255,255,255,0.55)", marginBottom: 10, fontSize: 10 }}>{intro}</p>
        <div style={{ fontWeight: 900, color: p.accentColor, marginBottom: 6 }}>{p.headline}</div>
        <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: 10 }}>{p.body}</p>
        <Link href={p.ctaHref} style={{ color: p.accentColor, fontWeight: 800 }}>
          {p.ctaLabel} →
        </Link>
        <div style={{ marginTop: 14 }}>
          <Link href="/sponsors/advertise" style={{ color: "#FFD700", fontWeight: 700, fontSize: 11 }}>
            Advertise here →
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: 16, fontSize: 12 }}>
      <p style={{ color: "rgba(255,255,255,0.55)", marginBottom: 10, fontSize: 10 }}>{intro}</p>
      <p style={{ color: "rgba(255,255,255,0.65)", marginBottom: 10 }}>
        No paid sponsor is live in this zone yet.
      </p>
      <Link href="/sponsors/advertise" style={{ color: "#FFD700", fontWeight: 800 }}>
        Advertise here →
      </Link>
    </div>
  );
}

function SubmissionsMediaChildren() {
  const [child, setChild] = useState<"menu" | "radio" | "shuffle">("menu");
  if (child === "radio") {
    return (
      <div data-testid="hub-submissions-stream-win" style={{ display: "grid", gap: 8 }}>
        <button type="button" data-testid="hub-submissions-return" onClick={() => { exitStreamWin(); setChild("menu"); }}>RETURN</button>
        <StreamAndWinRadioPlayer />
      </div>
    );
  }
  if (child === "shuffle") {
    return (
      <div data-testid="hub-submissions-video-shuffle" style={{ display: "grid", gap: 8 }}>
        <button type="button" data-testid="hub-submissions-return" onClick={() => { exitVideoShuffle(); setChild("menu"); }}>RETURN</button>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
          Video Shuffle plays on Monitor A through the existing shuffle runtime.
        </p>
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button
        type="button"
        data-testid="hub-submissions-stream-win"
        onClick={() => { setChild("radio"); void startStreamWin(); }}
        style={{ minHeight: 44, textAlign: "left" }}
      >
        STREAM AND WIN RADIO
      </button>
      <button
        type="button"
        data-testid="hub-submissions-video-shuffle"
        onClick={() => { setChild("shuffle"); void startVideoShuffle(); }}
        style={{ minHeight: 44, textAlign: "left" }}
      >
        VIDEO SHUFFLE
      </button>
    </div>
  );
}

export default function UniversalWorkspaceStubContent({
  workspaceId,
  role,
  userId,
  displayName,
}: {
  workspaceId: UniversalWorkspaceId;
  role: CommandCenterRole;
  userId: string;
  displayName: string;
}) {
  const theme = useTheme();
  const def = getWorkspaceDef(workspaceId);
  const panel = def.legacyDrawerId;
  const { resolvePerformerId, activePerformer } = useActivePerformer();
  const contextPerformerId = resolvePerformerId(role === "performer" ? userId : null);
  const contextPerformer = contextPerformerId ? getPerformerById(contextPerformerId) : null;
  const contextDisplayName = activePerformer?.name ?? contextPerformer?.name ?? displayName;
  const contextSlug = activePerformer?.slug ?? contextPerformer?.slug ?? contextPerformerId ?? undefined;
  const publishedRoomId = useLivePrivacyState((s) => s.publishedRoomId);
  const inPlaceRoomId = useGoLiveTransition((s) => s.inPlace?.roomId ?? null);
  const roomId =
    role === "fan"
      ? resolveFanWorldEntry({
          publishedRoomId: publishedRoomId ?? inPlaceRoomId,
          from: "universal-workspace",
        }).roomId
      : `${role}-lobby-cc-${userId}`;

  if (!panel) {
    return (
      <div style={{ padding: 16, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
        Workspace content is not wired for this module yet.
      </div>
    );
  }

  switch (panel) {
    case "lobby":
      return (
        <RoleGate
          allow={["FAN", "ADMIN", "STAFF"]}
          fallback={
            <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
              Avatar Fan Lobby is Fan-only (Rule 26).
            </div>
          }
        >
          <div style={{ height: "min(52vh, 520px)", minHeight: 280 }}>
            <FanLobbyVenue
              roomId={roomId}
              userName={displayName}
              initialSkinId={DEFAULT_FAN_LOBBY_SKIN_ID}
              roomType="FAN_LOBBY"
              embedded
            />
          </div>
        </RoleGate>
      );
    case "yopho":
      return (
        <YoPhoWorkspaceSlot
          role={role}
          displayName={role === "performer" ? contextDisplayName : displayName}
          userId={role === "performer" ? contextPerformerId ?? userId : userId}
          slug={role === "performer" ? contextSlug : undefined}
        />
      );
    case "memory":
      return (
        <div style={{ padding: 12 }}>
          <MemoryWallCanister
            entityId={userId}
            entityType={role === "performer" ? "performer" : "fan"}
            accentColor={theme.secondary}
          />
        </div>
      );
    case "inventory":
      return (
        <RoleGate allow={["FAN", "ADMIN", "STAFF"]} fallback={null}>
          <div style={{ padding: 12 }}>
            <InventoryCanister accentColor={theme.tertiary} />
          </div>
        </RoleGate>
      );
    case "messaging":
      if (gpsDestinationState("messages") !== "LIVE") {
        return (
          <div data-testid="workspace-messages-soon" style={{ padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.12em" }}>COMING SOON</div>
            <p style={{ fontSize: 12, lineHeight: 1.45 }}>{gpsDestinationById("messages")?.building}</p>
          </div>
        );
      }
      return (
        <div style={{ padding: 8, minHeight: 320 }}>
          <MessagingCanister height={360} compact={false} />
        </div>
      );
    case "notifications":
      return (
        <div style={{ padding: 12 }}>
          <NotificationCanister accentColor={theme.primary} />
        </div>
      );
    case "analytics":
      return <HubAnalyticsDrawerPanel role={role} userId={userId} accent={theme.primary} />;
    case "booking":
      return (
        <div style={{ padding: 12 }}>
          <BookingCanister
            entityId={contextPerformerId ?? userId}
            entityType="performer"
            accentColor="#FFD700"
            showRequestForm
          />
        </div>
      );
    case "store":
      return (
        <ShopDrawerPanel
          role={role}
          fallbackPerformerId={role === "performer" ? userId : undefined}
          accentColor="#AA2DFF"
        />
      );
    case "beat_lab":
      return role === "performer" ? (
        <div style={{ padding: 16, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
          Beat Lab opens from Media Center swap chips or{" "}
          <Link href="/performer/beats" style={{ color: theme.primary }}>
            /performer/beats
          </Link>
          .
        </div>
      ) : null;
    case "media_locker":
      return role === "performer" ? (
        <div style={{ padding: 12 }}>
          <MediaLockerCanister userId={contextPerformerId ?? userId} role="performer" accentColor={theme.primary} />
        </div>
      ) : null;
    case "achievement_center":
      return (
        <AchievementCenterDrawer role={role} userId={userId} displayName={displayName} />
      );
    case "championship_center":
      return <ChampionshipCenterDrawer role={role} userId={userId} />;
    case "championship_history":
      return <ChampionshipHistoryPanel />;
    case "live_destinations":
      return (
        <LiveDestinationsDrawerPanel
          viewerUserId={userId}
          viewerRole={role === "performer" ? "PERFORMER" : "FAN"}
          accentColor={theme.primary}
        />
      );
    case "room_controls":
      return role === "fan" ? (
        <RoomControlsDrawerPanel
          userId={userId}
          roomId={roomId}
          roomType="FAN_LOBBY"
          authority={defaultRoomAuthority("FAN_LOBBY", userId)}
          accentColor="#00FF88"
        />
      ) : null;
    case "marketplace":
      return <MarketplaceDrawerPanel scope="global" accentColor="#00FFFF" />;
    case "submissions":
      return (
        <div data-testid="hub-submissions-drawer" style={{ padding: 12, display: "grid", gap: 12 }}>
          <SubmissionsCanister role={role} userId={userId} displayName={displayName} accentColor={theme.secondary} />
          <SubmissionsMediaChildren />
        </div>
      );
    case "scores":
      return (
        <div style={{ padding: 12 }}>
          <ScoresCanister accentColor="#FFD700" />
        </div>
      );
    case "prize_vault":
      return <HubPrizeVaultDrawerPanel userId={userId} role={role} />;
    case "sponsors":
      return <HubSponsorsDrawerPanel role={role} />;
    case "notes":
      return <NotesWorkspace />;
    default:
      return (
        <div style={{ padding: 16, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
          Module «{panel}» — open from Command Center drawer swap chips for full tools.
        </div>
      );
  }
}
