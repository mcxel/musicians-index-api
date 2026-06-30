import Link from "next/link";
import { redirect } from "next/navigation";
import RouteRecoveryCard from "@/components/routing/RouteRecoveryCard";
import SlugFallbackPanel from "@/components/routing/SlugFallbackPanel";
import SocketStatusBadge from "@/components/routing/SocketStatusBadge";
import ReconnectButton from "@/components/routing/ReconnectButton";
import ReturnPathButton from "@/components/routing/ReturnPathButton";
import { registerRoute } from "@/lib/routing/RouteClosureRegistry";
import { registerReturnPath } from "@/lib/routing/ReturnPathResolver";
import { resolveSlug } from "@/lib/routing/SlugRecoveryEngine";
import SocketRecoveryEngine from "@/lib/routing/SocketRecoveryEngine";
import RoomInteractionLayout from "@/components/live/RoomInteractionLayout";
import LiveRoomWebRTCLayer from "@/components/live/LiveRoomWebRTCLayer";
import UniversalVenueRenderer from "@/components/live/UniversalVenueRenderer";
import LiveSessionHeartbeat from "@/components/live/LiveSessionHeartbeat";
import { registerPresence } from "@/lib/rooms/RoomSessionBridge";
import { recordProfileLoopAction } from "@/lib/profile/ProfileSessionStore";
import { startPerformerSession, recordFanEntry } from "@/lib/performer/PerformerAnalyticsEngine";
import RoomWarpTransition from "@/components/live/RoomWarpTransition";
import BotRoomActivator from "@/components/bots/BotRoomActivator";
import { getAdSlotForZone } from "@/lib/commerce/SponsorRegistry";
import DiscoveryRail from "@/components/discovery/DiscoveryRail";
import UnifiedAudienceShell from "@/components/live/UnifiedAudienceShell";
import TmiAudiencePerspectiveShell from "@/components/audience/TmiAudiencePerspectiveShell";
import SplitStreamMatrix from "@/components/media/SplitStreamMatrix";
import PerformanceVotePanel from "@/components/arena/PerformanceVotePanel";
import AudienceEntryBeacon from "@/components/live/AudienceEntryBeacon";
import ArenaEventShell from "@/components/live/ArenaEventShell";
// ── Rule 15 Canisters ──────────────────────────────────────────────────────────
import { PlaylistCanister } from "@/components/canisters/PlaylistCanister";
import { MemoryWallCanister } from "@/components/canisters/MemoryWallCanister";
import MessagingCanister from "@/components/canisters/MessagingCanister";
import { StoreCanister } from "@/components/canisters/StoreCanister";
import AvatarCreationCenter from "@/components/canisters/AvatarCreationCenter";
import { AvatarWorkspaceCanister } from "@/components/canisters/AvatarWorkspaceCanister";
import { InventoryCanister } from "@/components/canisters/InventoryCanister";
import { PrivateLobbyCanister } from "@/components/canisters/PrivateLobbyCanister";
import ControlCanisterCluster from "@/components/live/ControlCanisterCluster";

// Referrers that grant direct room entry (passed via ?from= query param)
const LOBBY_AUTHORIZED_ORIGINS = new Set([
  "live-lobby",
  "lobby-wall",
  "fan-lobby-wall",
  "performer-lobby-wall",
  "mixed-lobby-wall",
  "fan-hub",
  "billboard",
  "billboard-wall",
  "home-3",
]);

interface LiveRoomPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LiveRoomPage({ params, searchParams }: LiveRoomPageProps) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const fanSlug = typeof sp['fan'] === 'string' ? sp['fan'] : Array.isArray(sp['fan']) ? sp['fan'][0] : null;
  const sessionId = typeof sp['sessionId'] === 'string' ? sp['sessionId'] : Array.isArray(sp['sessionId']) ? sp['sessionId'][0] : null;
  const fromValue = typeof sp['from'] === 'string' ? sp['from'] : Array.isArray(sp['from']) ? sp['from'][0] : '';
  const fromFanHub = fromValue === 'fan-hub';
  const fromLiveLobby = fromValue === 'live-lobby';
  const performerSlug = typeof sp['performer'] === 'string' ? sp['performer'] : Array.isArray(sp['performer']) ? sp['performer'][0] : null;
  const performerSid = performerSlug
    ? (typeof sp['sid'] === 'string' ? sp['sid'] : Array.isArray(sp['sid']) ? sp['sid'][0] : null)
    : null;
  // Battle Mode (Phase 4 convergence, 2026-06-20) — real battle context
  // passed from /battles/[id]'s "WATCH & VOTE LIVE" link. Renders the real
  // split-stream + vote-closure engines (previously only reachable on the
  // orphaned, zero-inbound-links /battles/live page) as a mode of this same
  // canonical room, instead of a separate battle page or audience renderer.
  const battleId = typeof sp['battleId'] === 'string' ? sp['battleId'] : Array.isArray(sp['battleId']) ? sp['battleId'][0] : null;
  const opponentA = typeof sp['opponentA'] === 'string' ? sp['opponentA'] : Array.isArray(sp['opponentA']) ? sp['opponentA'][0] : null;
  const opponentB = typeof sp['opponentB'] === 'string' ? sp['opponentB'] : Array.isArray(sp['opponentB']) ? sp['opponentB'][0] : null;
  const battleAccentA = typeof sp['accentA'] === 'string' ? sp['accentA'] : Array.isArray(sp['accentA']) ? sp['accentA'][0] : undefined;
  const isBattleMode = Boolean(battleId && opponentA && opponentB);
  const returnHref = performerSlug && performerSid
    ? `/performers/${encodeURIComponent(performerSlug)}/dashboard?returnedFrom=${encodeURIComponent(id)}&sid=${encodeURIComponent(performerSid)}`
    : fanSlug
      ? `/fan/${encodeURIComponent(fanSlug)}?returnedFrom=${encodeURIComponent(id)}&session=ended${sessionId ? `&sessionId=${encodeURIComponent(sessionId)}` : ''}`
      : fromFanHub
        ? '/dashboard/fan'
        : fromLiveLobby
          ? '/live/lobby'
          : '/home/3';
  const returnLabel = performerSlug ? '← Performer Dashboard' : fanSlug ? '← Back to Fan Profile' : fromFanHub ? '← Fan Hub' : fromLiveLobby ? '← Back to Live Lobby' : '← Home 3';

  // ── Audience Entry Gate ────────────────────────────────────────────────────
  // Fans must arrive via the Live Lobby or a Billboard Lobby Wall.
  // Performers arriving with ?performer= bypass the gate (they're going live).
  // Direct URLs (bookmarks, social shares, etc.) redirect through the lobby
  // so the fan is properly seated and registered before entering the room.
  const isPerformerEntry = Boolean(performerSlug && performerSid);
  const hasLobbyAuthorization = LOBBY_AUTHORIZED_ORIGINS.has(fromValue) || fromValue.includes('lobby');
  if (!isPerformerEntry && !hasLobbyAuthorization) {
    redirect(`/live/lobby?room=${encodeURIComponent(id)}&seat=1`);
  }
  // ──────────────────────────────────────────────────────────────────────────

  if (sessionId) {
    recordProfileLoopAction(sessionId, { type: 'enter_room', value: 1 });
  }

  // Performer arriving — start analytics session and register stage presence
  if (performerSlug && performerSid) {
    startPerformerSession(performerSid, performerSlug, id);
    registerPresence({ sessionId: performerSid, userId: performerSlug, roomId: id, role: 'performer', joinedAtMs: Date.now() });
  }

  // Fan arriving — attribute to active performer session; pass ProfileSessionStore sid for action derivation
  if (fromFanHub) {
    recordFanEntry(id, sessionId ?? undefined);
  }

  registerRoute("/live/rooms/[id]", "open", {
    returnRoute: returnHref,
    fallbackRoute: "/live/rooms",
    nextAction: "interact",
  });
  registerReturnPath({
    fromRoute: "/live/rooms/[id]",
    toRoute: returnHref,
    label: returnLabel,
  });
  resolveSlug("event", id);
  SocketRecoveryEngine.register("guest-user", `sock_room_${id}`, id);

  // Register fan presence if arriving from the fan hub
  const sid = Array.isArray(sp['sid']) ? sp['sid'][0] : (sp['sid'] ?? null);
  if (fromFanHub && sid) {
    registerPresence({ sessionId: sid, userId: 'fan-user', roomId: id, role: 'fan', joinedAtMs: Date.now() });
  }

  // Rule 12: No Empty Inventory
  const roomAd = getAdSlotForZone(`live-room-${id}`);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "34px 18px" }}>
      <RoomWarpTransition roomId={id} hostName={`Room ${id}`} />
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <Link href={returnHref} style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12 }}>{returnLabel}</Link>
        <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", margin: "10px 0 6px" }}>Room {id}</h1>
        <p style={{ color: "rgba(255,255,255,0.65)", marginTop: 0 }}>
          Runtime spine active: join, interact, tip, and return.
        </p>

        <LiveRoomWebRTCLayer roomId={id} />

        {performerSlug && <LiveSessionHeartbeat enabled={true} intervalMs={15_000} stageState="live" roomId={id} />}

        {/* Battle Mode (Phase 4 convergence, 2026-06-20) — unified via ArenaEventShell.
            The ArenaEventShell wraps UniversalVenueRenderer with event-type-aware
            venue mapping, consolidating all event types (battle, cypher, challenge,
            concert, live-show, monday-stage) into one canonical runtime.
        */}
        {isBattleMode && opponentA && opponentB ? (
          <ArenaEventShell
            roomId={id}
            eventType="battle"
            mode={performerSlug ? "performer" : "audience"}
            liveState="live"
          />
        ) : (
          /* Universal Venue Renderer (Phase 3B convergence, 2026-06-20) —
              fallback for non-battle events. fanIdOverride and TmiAudiencePerspectiveShell's
              fanId below share the same resolution to prevent duplicate audience entries. */
          <UniversalVenueRenderer
            roomId={id}
            mode={performerSlug ? "performer" : "audience"}
            fanIdOverride={fanSlug ?? sessionId ?? undefined}
          />
        )}

        {/* Battle Vote Panel (rendered below venue when in battle mode) */}
        {isBattleMode && opponentA && opponentB && (
          <div style={{ marginTop: 12 }}>
            <PerformanceVotePanel
              battleId={battleId!}
              artistALabel={opponentA}
              artistBLabel={opponentB}
              accentA={battleAccentA}
              autoOpenVoting
            />
          </div>
        )}

        {/* Real seat-bound audience view — assignSeatForFan()/joinAudienceSeat()
            engines already existed in lib/audience/ but were never wired into
            a route. Every seat here is a real fanId, never a fabricated count. */}
        {!performerSlug && (
          <div style={{ marginTop: 16 }}>
            <AudienceEntryBeacon roomId={id} viewerId={fanSlug ?? sessionId ?? undefined} source={fromValue || "live-room"} />
            <TmiAudiencePerspectiveShell roomId={id} fanId={fanSlug ?? sessionId ?? undefined} />
          </div>
        )}

        <BotRoomActivator roomId={id} fanId={fanSlug ?? sessionId ?? "fan-guest"} />
        <RoomInteractionLayout roomId={id} sessionId={sessionId ?? undefined} />

        {/* Unified Audience Shell — Messages/Playlist/Memory Wall/Avatar/
            Inventory/Rooms as docked overlays, never a route change */}
        <UnifiedAudienceShell
          roomId={id}
          userId={fanSlug ?? sessionId ?? performerSid ?? "fan-guest"}
          accentColor={performerSlug ? "#FF2DAA" : "#00FFFF"}
        />

        {/* PreShowControlBooth — cluster of draggable control canisters for performer */}
        {performerSlug && (
          <ControlCanisterCluster
            eventId={id}
            eventMode="casual"
            availableCanisters={['lighting', 'effects', 'banner', 'camera', 'support', 'stage', 'director', 'event-owner', 'curtain']}
          />
        )}

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <SocketStatusBadge userId="guest-user" />
            <ReconnectButton userId="guest-user" />
            <ReturnPathButton />
          </div>
          <RouteRecoveryCard route="/live/rooms/[id]" />
          <SlugFallbackPanel entity="event" slug={id} />
        </div>

        {/* Rule 12: No Empty Inventory — platform promo between room and discovery */}
        {roomAd.type === 'platform' && roomAd.platformPromo && (
          <div style={{ margin: "20px 0", background: `${roomAd.platformPromo.accentColor}0a`, border: `1px solid ${roomAd.platformPromo.accentColor}33`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: roomAd.platformPromo.accentColor }}>{roomAd.platformPromo.headline}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{roomAd.platformPromo.body}</div>
            </div>
            <a href={roomAd.platformPromo.ctaHref} style={{ padding: "7px 16px", background: roomAd.platformPromo.accentColor, borderRadius: 7, fontSize: 9, fontWeight: 900, color: "#050310", textDecoration: "none", flexShrink: 0 }}>
              {roomAd.platformPromo.ctaLabel}
            </a>
          </div>
        )}
        {roomAd.type === 'advertise-cta' && (
          <div style={{ margin: "16px 0", textAlign: "center" }}>
            <a href="/sponsors/advertise" style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textDecoration: "none", letterSpacing: "0.08em", fontWeight: 700 }}>
              ADVERTISE ON TMI · FROM $25
            </a>
          </div>
        )}

        {/* Rule 6: Discovery Rails — keep fans in the content graph after the room */}
        <div style={{ marginTop: 32 }}>
          <DiscoveryRail type="liveRooms" exclude={id} accentColor="#E63000" label="OTHER LIVE ROOMS" />
          <DiscoveryRail type="performers" accentColor="#00E5FF" label="FEATURED PERFORMERS" />
          <DiscoveryRail type="games" accentColor="#AA2DFF" label="BATTLES & GAMES" />
          <DiscoveryRail type="sponsors" accentColor="#FFD700" label="PLATFORM PARTNERS" />
        </div>

        {/* ── Rule 15 Canister Section ── */}
        <div style={{ marginTop: 32, paddingBottom: 60, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Playlist — listen while watching */}
          <PlaylistCanister entityId={performerSlug ?? id} accentColor="#AA2DFF" />
          {/* Memory Wall — capture moments from this room */}
          <MemoryWallCanister entityId={id} entityType="room" title="Room Memories" accentColor="#FF2DAA" />
          {/* Messaging — DM the performer or other fans */}
          <MessagingCanister recipientId={performerSlug ?? id} height={340} compact />
          {/* Store — support the performer */}
          {performerSlug && (
            <StoreCanister entityId={performerSlug} storeType="performer" accentColor="#FFD700" maxItems={4} />
          )}
          {/* Avatar Creation Center */}
          <AvatarCreationCenter accentColor="#AA2DFF" />
          {/* Avatar Workspace */}
          <AvatarWorkspaceCanister accentColor="#00FFFF" />
          {/* Inventory */}
          <InventoryCanister accentColor="#FF6B35" />
          {/* Private Lobby */}
          {performerSlug && (
            <PrivateLobbyCanister entityId={performerSlug} accentColor="#AA2DFF" />
          )}
        </div>
      </div>
    </main>
  );
}
