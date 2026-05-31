"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useDrawer } from "./DrawerContext";
import MessagesWidget from "@/components/widgets/MessagesWidget";
import BookingsWidget from "@/components/room/BookingsWidget";
import RevenueWidget from "@/components/widgets/RevenueWidget";
import CommunicationWidget from "@/components/widgets/CommunicationWidget";
import SponsorsWidget from "@/components/widgets/SponsorsWidget";
import FriendsWidget from "@/components/widgets/FriendsWidget";
import NotificationsWidget from "@/components/widgets/NotificationsWidget";
import ArtifactWall from "@/components/artifacts/ArtifactWall";
import RankingsWidget from "@/components/widgets/RankingsWidget";
import LiveRoomsWidget from "@/components/widgets/LiveRoomsWidget";

const DRAWER_TITLES: Record<string, string> = {
  messages:       "💬 Messages",
  bookings:       "📅 Bookings",
  sponsors:       "🤝 Sponsors",
  revenue:        "💰 Revenue",
  inventory:      "💎 Artifact Vault",
  friends:        "👥 Friends",
  groups:         "🏠 Groups",
  "video-calls":  "📹 Video Calls",
  notifications:  "🔔 Notifications",
  communication:  "📡 Communication",
  rankings:       "🏆 Crown Rankings",
  "live-rooms":   "🎭 Live Rooms",
};

export default function WidgetDrawer() {
  const { activeDrawer, setActiveDrawer } = useDrawer();

  return (
    <AnimatePresence>
      {activeDrawer && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          style={{
            position: "fixed", top: 0, right: 0, bottom: 0,
            width: "clamp(320px, 85vw, 440px)",
            background: "rgba(5, 5, 16, 0.97)",
            borderLeft: "1px solid rgba(0,255,255,0.2)",
            boxShadow: "-20px 0 50px rgba(0,0,0,0.8)",
            backdropFilter: "blur(20px)",
            zIndex: 100, display: "flex", flexDirection: "column",
          }}
        >
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {DRAWER_TITLES[activeDrawer] ?? activeDrawer}
            </span>
            <button
              onClick={() => setActiveDrawer(null)}
              style={{ background: "transparent", border: "none", color: "#FF4444", cursor: "pointer", fontSize: 24, lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {activeDrawer === "messages"      && <MessagesWidget />}
            {activeDrawer === "bookings"      && <BookingsWidget />}
            {activeDrawer === "revenue"       && <RevenueWidget />}
            {activeDrawer === "communication" && <CommunicationWidget />}
            {activeDrawer === "friends"       && <FriendsWidget />}
            {activeDrawer === "notifications" && <NotificationsWidget />}
            {activeDrawer === "inventory"     && (
              <ArtifactWall
                role="fan"
                userPoints={1240}
                accentColor="#00FFFF"
                title="Artifact Vault"
              />
            )}
            {activeDrawer === "groups" && (
              <div style={{ color: "#fff" }}>
                <div style={{ padding: "32px 0", textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>🏠</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Create or join community group rooms.</div>
                  <a href="/groups/new" style={{ padding: "9px 20px", borderRadius: 8, background: "rgba(170,45,255,0.15)", border: "1px solid rgba(170,45,255,0.35)", color: "#AA2DFF", fontSize: 10, fontWeight: 800, textDecoration: "none", letterSpacing: "0.08em" }}>
                    + CREATE GROUP
                  </a>
                </div>
              </div>
            )}
            {activeDrawer === "video-calls" && (
              <div style={{ color: "#fff" }}>
                <div style={{ padding: "32px 0", textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📹</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>Start a 1-on-1 or group video call.</div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <a href="/video/call/new" style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(0,255,136,0.12)", border: "1px solid rgba(0,255,136,0.3)", color: "#00FF88", fontSize: 10, fontWeight: 800, textDecoration: "none" }}>
                      1-ON-1
                    </a>
                    <a href="/video/call/group" style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(170,45,255,0.12)", border: "1px solid rgba(170,45,255,0.3)", color: "#AA2DFF", fontSize: 10, fontWeight: 800, textDecoration: "none" }}>
                      GROUP
                    </a>
                  </div>
                </div>
              </div>
            )}
            {activeDrawer === "sponsors"    && <SponsorsWidget />}
            {activeDrawer === "rankings"    && <RankingsWidget />}
            {activeDrawer === "live-rooms"  && <LiveRoomsWidget />}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
