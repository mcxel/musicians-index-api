"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FanHubShell from "@/components/fan/FanHubShell";
import type { FanSubscriptionTier } from "@/components/fan/FanTierSkinEngine";
import React from "react";
import RoomContainer from "@/components/room/RoomContainer";
import ActionCanister from "@/components/room/ActionCanister";
import WidgetDrawer from "@/components/room/WidgetDrawer";
import UnifiedAdSlot from "@/components/ads/UnifiedAdSlot";
import NeonWaveUnderlay from "@/components/atmosphere/NeonWaveUnderlay";
import BillboardLiveWall from "@/components/media/BillboardLiveWall";
import PlaylistArtifact from "@/components/artifacts/PlaylistArtifact";

interface MeUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  onboardingState: string;
  tier?: string;
  fanPoints?: number;
}

const FAN_ACTIONS = [
  { id: "live-rooms", icon: "🎭", label: "Live" },
  { id: "inventory", icon: "🎒", label: "Vault" },
  { id: "friends", icon: "👥", label: "Friends" },
  { id: "messages", icon: "💬", label: "Messages" },
  { id: "rankings", icon: "🏆", label: "Ranks" },
];

interface MeResponse {
  authenticated: boolean;
  user?: MeUser;
}

function toFanTier(raw?: string): FanSubscriptionTier {
  if (raw === "diamond")       return "diamond";
  if (raw === "gold-platinum") return "gold-platinum";
  if (raw === "pro-bronze")    return "pro-bronze";
  return "free";
}

export default function FanDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store", credentials: "include" });
        if (res.status === 401 || res.status === 403) { router.replace("/auth"); return; }
        const data = (await res.json()) as MeResponse;
        if (!data.authenticated || !data.user) { router.replace("/auth"); return; }
        setUser(data.user);
      } catch {
        router.replace("/auth");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [router]);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", background: "#05060c", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "rgba(255,255,255,0.3)", fontFamily: "monospace", letterSpacing: "0.14em", textTransform: "uppercase", fontSize: 11 }}>
          Loading hub…
        </p>
      </main>
    );
  }

  if (!user) return null;

  const displayName    = user.name ?? user.email.split("@")[0] ?? "Fan";
  const fanSlug        = user.id;
  const tier           = toFanTier(user.tier);
  const startingPoints = user.fanPoints ?? 0;
  const tagline        = `${user.email} · ${tier === "free" ? "Free Tier" : tier} · Welcome back`;

  return (
    <RoomContainer roomId="fan-dash" title="Fan Hub" accentColor="#00FF88" bpm={120}>
      <div style={{ minHeight: "100vh", position: "relative", padding: "40px 24px", color: "#fff", zIndex: 1 }}>
        <NeonWaveUnderlay colorA="#00FF88" colorB="#00FFFF" colorC="#AA2DFF" opacity={0.1} zIndex={0} />

        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <header style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#00FF88", fontWeight: 800 }}>DASHBOARD</div>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 900, margin: "8px 0 0", fontFamily: "var(--font-tmi-bebas, Impact, sans-serif)", letterSpacing: "0.05em" }}>
              FAN COMMAND CENTER
            </h1>
          </header>

          <UnifiedAdSlot venue="dashboard" slotKey="homepageBanner" format="horizontal" label="ADVERTISEMENT" style={{ marginBottom: 32 }} accentColor="#00FF88" />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 32 }}>
            <div style={{ background: "rgba(5,5,16,0.8)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 16, padding: 24, backdropFilter: "blur(20px)" }}>
              <h2 style={{ fontSize: 18, color: "#00FF88", fontWeight: 900, marginBottom: 12 }}>My Tickets & RSVPs</h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>You have 2 upcoming events.</p>
            </div>

            <div style={{ background: "rgba(5,5,16,0.8)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 16, padding: 24, backdropFilter: "blur(20px)" }}>
              <h2 style={{ fontSize: 18, color: "#00FF88", fontWeight: 900, marginBottom: 12 }}>Digital Vault</h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>3 unrevealed drops waiting.</p>
            </div>

            <div style={{ background: "rgba(5,5,16,0.8)", border: "1px solid rgba(0,255,136,0.3)", borderRadius: 16, padding: 24, backdropFilter: "blur(20px)" }}>
              <h2 style={{ fontSize: 18, color: "#00FF88", fontWeight: 900, marginBottom: 12 }}>Watch History</h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>14 hours logged this week.</p>
            </div>
          </div>

          <FanHubShell
            fanSlug={fanSlug}
            displayName={displayName}
            tier={tier}
            tagline={tagline}
            startingPoints={startingPoints}
          />

          {/* Now Playing — Playlist Artifact */}
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ alignSelf: "flex-start" }}>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#AA2DFF", fontWeight: 800 }}>NOW PLAYING</div>
              <h2 style={{ fontSize: 22, fontWeight: 900, margin: "4px 0 0", fontFamily: "var(--font-tmi-bebas, Impact, sans-serif)", letterSpacing: "0.05em" }}>
                YOUR PLAYLIST
              </h2>
            </div>
            <PlaylistArtifact
              skin="submarine"
              title={`${displayName}'s Playlist`}
              listeners={0}
              initialPoints={0}
            />
          </div>

          {/* Fan Lobby Wall — live rooms */}
          <div style={{ marginTop: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#00FF88", fontWeight: 800 }}>LIVE NOW</div>
                <h2 style={{ fontSize: 22, fontWeight: 900, margin: "4px 0 0", fontFamily: "var(--font-tmi-bebas, Impact, sans-serif)", letterSpacing: "0.05em" }}>
                  THE LOBBY WALL
                </h2>
              </div>
            </div>
            <BillboardLiveWall mode="home" maxTiles={12} />
          </div>
        </div>

        <ActionCanister actions={FAN_ACTIONS} />
        <WidgetDrawer />
      </div>
    </RoomContainer>
  );
}
