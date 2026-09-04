"use client";

/**
 * Renders Command Center drawer module bodies inside Universal Workspace windows (stub migration).
 */

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
import SubmissionsCanister from "@/components/canisters/SubmissionsCanister";
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
import { useTheme } from "@/lib/design/ThemeEngine";
import { useActivePerformer } from "@/lib/context/ActivePerformerContext";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import { resolveFanWorldEntry } from "@/lib/live/canonicalWorldViewport";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";

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
      return (
        <div style={{ padding: 16, fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
          Analytics metrics appear when backed by real session data (Rule 20). Period controls live in the
          full report route.
          <Link
            href={role === "performer" ? "/performer/analytics" : "/fan/stats"}
            style={{ display: "block", marginTop: 12, color: theme.primary, fontWeight: 800 }}
          >
            Open full statistics →
          </Link>
        </div>
      );
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
      return <MarketplaceDrawerPanel accentColor="#00FFFF" />;
    case "submissions":
      return (
        <div style={{ padding: 12 }}>
          <SubmissionsCanister role={role} userId={userId} displayName={displayName} accentColor={theme.secondary} />
        </div>
      );
    case "scores":
      return (
        <div style={{ padding: 12 }}>
          <ScoresCanister accentColor="#FFD700" />
        </div>
      );
    case "prize_vault":
      return role === "fan" ? (
        <div style={{ padding: 16, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
          Prize vault entries appear when you win real rewards. No fabricated inventory (Rule 20).
        </div>
      ) : null;
    case "sponsors":
      return (
        <div style={{ padding: 16, fontSize: 12 }}>
          <Link href="/sponsors/advertise" style={{ color: "#FFD700", fontWeight: 800 }}>
            Advertise here →
          </Link>
        </div>
      );
    default:
      return (
        <div style={{ padding: 16, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
          Module «{panel}» — open from Command Center drawer swap chips for full tools.
        </div>
      );
  }
}
