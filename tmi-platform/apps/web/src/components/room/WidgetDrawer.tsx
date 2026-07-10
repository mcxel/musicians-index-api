"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDrawer } from "./DrawerContext";
import { useTmiSession } from "@/hooks/SessionContext";
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
import PlaylistArtifact from "@/components/artifacts/PlaylistArtifact";
import MemoryWall from "@/components/media/MemoryWall";
import MemoryWallPhotoStrip from "@/components/media/MemoryWallPhotoStrip";
import RadioJourneyCard from "@/components/radio/RadioJourneyCard";
import MixtapeShareCard from "@/components/mixtape/MixtapeShareCard";

const DRAWER_TITLES: Record<string, string> = {
  camera:         "🎥 Camera",
  audio:          "🎚 Audio",
  playlist:       "🎵 Playlist",
  upload:         "⬆️ Upload",
  "video-shuffle":"🎬 Video Shuffle",
  radio:          "📻 Stream & Win Radio",
  memory:         "🖼️ Memory Wall",
  yopho:          "✨ Yopho Canvas",
  messages:       "💬 Messages",
  bookings:       "📅 Bookings",
  sponsors:       "🤝 Sponsors",
  revenue:        "💰 Revenue",
  analytics:      "📊 Analytics",
  merch:          "🛒 Merch",
  share:          "📤 Share",
  settings:       "⚙️ Settings",
  inventory:      "💎 Artifact Vault",
  friends:        "👥 Friends",
  groups:         "🏠 Groups",
  "video-calls":  "📹 Video Calls",
  notifications:  "🔔 Notifications",
  communication:  "📡 Communication",
  rankings:       "🏆 Crown Rankings",
  "live-rooms":   "🎭 Live Rooms",
};

const LEFT_DRAWERS = new Set(["camera", "audio", "playlist", "upload", "video-shuffle", "radio", "memory", "yopho"]);

export default function WidgetDrawer() {
  const { activeDrawer, setActiveDrawer } = useDrawer();
  const { userId, userName } = useTmiSession();
  const [isCameraPanelVisible, setIsCameraPanelVisible] = useState(true);

  useEffect(() => {
    if (activeDrawer === "camera") {
      setIsCameraPanelVisible(true);
    }
  }, [activeDrawer]);

  const openFromLeft = Boolean(activeDrawer && LEFT_DRAWERS.has(activeDrawer));

  return (
    <AnimatePresence>
      {activeDrawer && (
        <motion.div
          initial={{ x: openFromLeft ? "-100%" : "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: openFromLeft ? "-100%" : "100%", opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          style={{
            position: "fixed", top: 0, right: openFromLeft ? "auto" : 0, left: openFromLeft ? 0 : "auto", bottom: 0,
            width: "clamp(320px, 85vw, 440px)",
            background: "rgba(5, 5, 16, 0.97)",
            borderLeft: openFromLeft ? "none" : "1px solid rgba(0,255,255,0.2)",
            borderRight: openFromLeft ? "1px solid rgba(0,255,255,0.2)" : "none",
            boxShadow: openFromLeft ? "20px 0 50px rgba(0,0,0,0.8)" : "-20px 0 50px rgba(0,0,0,0.8)",
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
            {activeDrawer === "camera" && isCameraPanelVisible && (
              <CameraArenaModule
                onClose={() => {
                  setIsCameraPanelVisible(false);
                  setActiveDrawer(null);
                }}
              />
            )}
            {activeDrawer === "audio" && (
              <PanelLinkStack
                description="Jump into the existing studio surface for mic, sound check, and live audio routing."
                links={[
                  { href: "/performer/studio", label: "Open Audio Controls" },
                  { href: "/performer/studio", label: "Run Sound Check" },
                ]}
              />
            )}
            {activeDrawer === "playlist" && userId && <PlaylistArtifact artifactId={`${userId}-playlist`} skin="submarine" title="Performer Playlist" />}
            {activeDrawer === "upload" && (
              <PanelLinkStack
                description="Use the existing submission and upload flows without leaving the performance cockpit."
                links={[
                  { href: "/submit", label: "Open Submit Hub" },
                  { href: "/performer/studio", label: "Open Studio Uploads" },
                ]}
              />
            )}
            {activeDrawer === "video-shuffle" && (
              <PanelLinkStack
                description="Switch performance destinations using existing live routes."
                links={[
                  { href: "/cypher/stage", label: "Open Cypher Stage" },
                  { href: "/battles", label: "Open Battle Floor" },
                  { href: "/live/rooms", label: "Browse Live Rooms" },
                ]}
              />
            )}
            {activeDrawer === "radio" && <RadioJourneyCard />}
            {activeDrawer === "memory" && userId && (
              <div style={{ display: "grid", gap: 12 }}>
                <MemoryWallPhotoStrip entityId={userId} entityType="performer" accentColor="#FF2DAA" />
                <MemoryWall accentColor="#FFD700" title="" entityId={userId} entityType="performer" />
              </div>
            )}
            {activeDrawer === "yopho" && (
              <PanelLinkStack
                description="Open your current public-facing profile and identity surfaces."
                links={[
                  { href: "/performer/profile", label: "Open Performer Profile" },
                  { href: "/avatar", label: "Open Avatar" },
                ]}
              />
            )}
            {activeDrawer === "messages"      && <MessagesWidget />}
            {activeDrawer === "bookings"      && <BookingsWidget />}
            {activeDrawer === "revenue"       && <RevenueWidget />}
            {activeDrawer === "analytics"     && <PanelLinkStack description="Analytics is available through the existing ranking and performance surfaces." links={[{ href: "/rankings", label: "Open Rankings" }, { href: "/hub/performer", label: "Return to Performer Hub" }]} />}
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
            {activeDrawer === "merch" && (
              <PanelLinkStack
                description="Use existing merch and NFT routes from the performer cockpit."
                links={[
                  { href: "/store", label: "Open Store" },
                  { href: "/nft/mint", label: "Mint NFT" },
                ]}
              />
            )}
            {activeDrawer === "share" && userId && (
              <MixtapeShareCard curatorId={userId} curatorName={`${userName || "Your"} Mixtape`} />
            )}
            {activeDrawer === "settings" && (
              <PanelLinkStack
                description="Open current account and system settings routes."
                links={[
                  { href: "/settings", label: "Open Settings" },
                  { href: "/support", label: "Open Support" },
                ]}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PanelLinkStack({
  description,
  links,
}: {
  description: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.62)", lineHeight: 1.5 }}>{description}</div>
      <div style={{ display: "grid", gap: 8 }}>
        {links.map((link) => (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            style={{
              textDecoration: "none",
              borderRadius: 10,
              border: "1px solid rgba(0,255,255,0.18)",
              background: "rgba(255,255,255,0.03)",
              color: "#e5faff",
              padding: "10px 12px",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function CameraArenaModule({ onClose }: { onClose: () => void }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      style={{
        border: "1px solid rgba(255,215,0,0.28)",
        borderRadius: 12,
        background: "rgba(13,10,10,0.9)",
        overflow: "hidden",
        boxShadow: "0 14px 30px rgba(0,0,0,0.45)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          borderBottom: "1px solid rgba(255,215,0,0.18)",
          background: "linear-gradient(180deg, rgba(255,215,0,0.06), rgba(255,215,0,0.01))",
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", color: "#ffd166", textTransform: "uppercase" }}>
          Camera Control Module
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => setIsCollapsed((v) => !v)}
            style={{
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              background: "rgba(255,255,255,0.05)",
              color: "#e2e8f0",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              padding: "6px 10px",
            }}
          >
            {isCollapsed ? "Expand" : "Collapse"}
          </button>
          <button
            onClick={onClose}
            aria-label="Close camera panel"
            title="Close camera panel"
            style={{
              border: "1px solid rgba(255,68,68,0.45)",
              borderRadius: 8,
              background: "rgba(255,68,68,0.15)",
              color: "#ff8080",
              fontSize: 12,
              fontWeight: 900,
              cursor: "pointer",
              padding: "6px 10px",
            }}
          >
            X
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div
            style={{
              borderBottom: "1px solid rgba(255,215,0,0.14)",
              background: "#000",
              aspectRatio: "16 / 9",
              display: "grid",
              placeItems: "center",
              padding: 14,
            }}
          >
            <div style={{ width: "100%", height: "100%", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "linear-gradient(160deg, rgba(170,45,255,0.2), rgba(0,229,255,0.12))", display: "grid", placeItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#f8fafc", letterSpacing: "0.1em", textTransform: "uppercase" }}>Live Camera View</div>
                <div style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.62)" }}>Preview and advanced routing open in Studio</div>
              </div>
            </div>
          </div>

          <div style={{ padding: 10, background: "rgba(2,6,23,0.65)", display: "grid", gap: 8 }}>
            <div style={{ fontSize: 9, color: "#94a3b8", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800 }}>Command Registry</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
              {[
                { href: "/performer/studio", label: "Go Live" },
                { href: "/performer/studio", label: "Camera Settings" },
                { href: "/performer/studio", label: "Switch Camera" },
                { href: "/performer/studio", label: "Mute" },
                { href: "/performer/studio", label: "Stop Camera" },
                { href: "/live/rooms", label: "Open Live Rooms" },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  style={{
                    textDecoration: "none",
                    borderRadius: 8,
                    border: "1px solid rgba(148,163,184,0.4)",
                    background: "rgba(15,23,42,0.75)",
                    color: "#e2e8f0",
                    padding: "8px 10px",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    textAlign: "center",
                  }}
                >
                  {action.label}
                </Link>
              ))}
              <button
                onClick={onClose}
                style={{
                  borderRadius: 8,
                  border: "1px solid rgba(255,68,68,0.45)",
                  background: "rgba(255,68,68,0.12)",
                  color: "#fecaca",
                  padding: "8px 10px",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                Hide Preview
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
