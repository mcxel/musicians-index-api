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
import SeatArrivalTransition from "@/components/live/SeatArrivalTransition";

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
      <SeatArrivalTransition />
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
    </>
  );
}
