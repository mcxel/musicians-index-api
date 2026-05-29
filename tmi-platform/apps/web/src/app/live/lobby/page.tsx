import type { Metadata } from "next";
import LobbyShell from "@/components/lobby/LobbyShell";
import RouteRecoveryCard from "@/components/routing/RouteRecoveryCard";
import SlugFallbackPanel from "@/components/routing/SlugFallbackPanel";
import SocketStatusBadge from "@/components/routing/SocketStatusBadge";
import ReconnectButton from "@/components/routing/ReconnectButton";
import ReturnPathButton from "@/components/routing/ReturnPathButton";
import { registerRoute } from "@/lib/routing/RouteClosureRegistry";
import { registerReturnPath } from "@/lib/routing/ReturnPathResolver";
import { resolveSlug } from "@/lib/routing/SlugRecoveryEngine";
import SocketRecoveryEngine from "@/lib/routing/SocketRecoveryEngine";
import LiveStoreOverlay from "@/components/live/LiveStoreOverlay";
import GhostChatWidget from "@/components/live/GhostChatWidget";
import SpotlightContainer from "@/components/live/SpotlightContainer";
import RoomWarpTransition from "@/components/live/RoomWarpTransition";
import LiveLobbyDrawer from "@/components/lobby/LiveLobbyDrawer";
import MixedLobbyWall from "@/components/lobby/MixedLobbyWall";
import ArenaJoinToast from "@/components/entry/ArenaJoinToast";

export const metadata: Metadata = {
  title: "Live Lobby | TMI",
  description: "Pre-show lobby. Claim your seat before the event goes live.",
};

export default function LiveLobbyPage() {
  registerRoute("/live/lobby", "open", {
    returnRoute: "/",
    fallbackRoute: "/",
    nextAction: "join-room",
  });
  registerReturnPath({
    fromRoute: "/live/lobby",
    toRoute: "/",
    label: "Back to Home",
  });
  resolveSlug("event", "tmi-main-lobby");
  SocketRecoveryEngine.register("guest-user", "sock_live_lobby", "tmi-main-lobby");

  return (
    <>
      <RoomWarpTransition roomId="tmi-main-lobby" hostName="TMI Live Lobby" />
      <LobbyShell slug="tmi-main-lobby" />
      <section style={{ padding: 12, background: "#050510", color: "#fff", display: "grid", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <SocketStatusBadge userId="guest-user" />
          <ReconnectButton userId="guest-user" />
          <ReturnPathButton />
        </div>
        <RouteRecoveryCard route="/live/lobby" />
        <SlugFallbackPanel entity="event" slug="tmi-main-lobby" />
      </section>
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 98 }}>
        <LiveStoreOverlay accentColor="#AA2DFF" />
      </div>
      <div style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 97 }}>
        <GhostChatWidget roomId="tmi-main-lobby" accentColor="#AA2DFF" />
      </div>
      <SpotlightContainer roomId="tmi-main-lobby" />
      <LiveLobbyDrawer />
      <section style={{ padding: "20px 24px 40px", background: "#050510", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "#AA2DFF", marginBottom: 16 }}>
          DISCOVERY BRIDGE — WHO&apos;S HERE NOW
        </div>
        <MixedLobbyWall />
      </section>
      <ArenaJoinToast />
    </>
  );
}
