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
import ArenaImmersivePanel from "@/components/live/ArenaImmersivePanel";
import VenueImmersiveRoom from "@/components/live/VenueImmersiveRoom";
import LiveSessionHeartbeat from "@/components/live/LiveSessionHeartbeat";
import { registerPresence } from "@/lib/rooms/RoomSessionBridge";
import { recordProfileLoopAction } from "@/lib/profile/ProfileSessionStore";
import { startPerformerSession, recordFanEntry } from "@/lib/performer/PerformerAnalyticsEngine";
import RoomWarpTransition from "@/components/live/RoomWarpTransition";
import BotRoomActivator from "@/components/bots/BotRoomActivator";

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

        {performerSlug
          ? <ArenaImmersivePanel roomId={id} mode="performer" />
          : <VenueImmersiveRoom roomId={id} mode="fan" />}

        <BotRoomActivator roomId={id} fanId={fanSlug ?? sessionId ?? "fan-guest"} />
        <RoomInteractionLayout roomId={id} sessionId={sessionId ?? undefined} />

        <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <SocketStatusBadge userId="guest-user" />
            <ReconnectButton userId="guest-user" />
            <ReturnPathButton />
          </div>
          <RouteRecoveryCard route="/live/rooms/[id]" />
          <SlugFallbackPanel entity="event" slug={id} />
        </div>
      </div>
    </main>
  );
}
