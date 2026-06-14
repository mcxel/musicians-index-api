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
  if (raw === "pro-RUBY")    return "pro-RUBY";
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

          <style>{`
            @keyframes fanEqBar{0%,100%{height:4px}50%{height:var(--eqh)}}
            @keyframes fanReact{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-60px) scale(0.3);opacity:0}}
            @keyframes fanSpotPulse{0%,100%{box-shadow:0 0 6px #00FF88}50%{box-shadow:0 0 18px #00FF88,0 0 36px rgba(0,255,136,0.3)}}
            .fan-react-btn:hover{background:rgba(0,255,136,0.18)!important;transform:scale(1.12)}
            .fan-react-btn:active{transform:scale(0.95)}
          `}</style>

          {/* ── Artist Spotlight Strip ── */}
          <div style={{ background: "rgba(5,5,16,0.85)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: 14, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, backdropFilter: "blur(20px)" }}>
            <div>
              <div style={{ fontSize: 8, color: "rgba(0,255,136,0.6)", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 2 }}>Artist Spotlight</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#FFD700", letterSpacing: "0.04em" }}>Chario Ace</div>
              <div style={{ fontSize: 10, color: "#E63000", fontWeight: 700, letterSpacing: "0.08em" }}>HIP-HOP · LIVE NOW</div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={() => router.push("/arena/hip-hop")} style={{ background: "rgba(0,255,136,0.1)", border: "1px solid rgba(0,255,136,0.4)", borderRadius: 8, padding: "8px 14px", color: "#00FF88", fontWeight: 800, fontSize: 11, cursor: "pointer", letterSpacing: "0.08em" }}>
                📡 SPIN
              </button>
              <button onClick={() => router.push("/battles/vote")} style={{ background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.4)", borderRadius: 8, padding: "8px 14px", color: "#FFD700", fontWeight: 800, fontSize: 11, cursor: "pointer", letterSpacing: "0.08em" }}>
                ✓ VOTE
              </button>
              <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Next Show</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#FFD700", fontFamily: "monospace" }}>8:00 PM</div>
              </div>
              <button onClick={() => router.push(`/fan/${fanSlug}/tickets`)} style={{ background: "rgba(170,45,255,0.1)", border: "1px solid rgba(170,45,255,0.4)", borderRadius: 8, padding: "8px 14px", color: "#AA2DFF", fontWeight: 800, fontSize: 11, cursor: "pointer", letterSpacing: "0.08em" }}>
                🎟 TICKETS
              </button>
              <button onClick={() => router.push(`/fan/${fanSlug}/memory`)} style={{ background: "rgba(0,255,255,0.1)", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, padding: "8px 14px", color: "#00FFFF", fontWeight: 800, fontSize: 11, cursor: "pointer", letterSpacing: "0.08em" }}>
                🎞 MEMORY WALL
              </button>
            </div>
          </div>

          {/* ── Stage Screen + Sidebar Layout (blueprint-aligned) ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 180px", gap: 10, marginBottom: 16 }}>

            {/* LEFT: marquee screen + reactions + analytics */}
            <div>
              {/* Marquee stage screen */}
              <div style={{ position: "relative", border: "2px solid #E63000", borderRadius: 8, overflow: "hidden", background: "#06000a", height: 180, marginBottom: 8, boxShadow: "0 0 16px rgba(230,48,0,0.3)", animation: "fanSpotPulse 2s ease-in-out infinite" }}>
                <div style={{ position: "absolute", inset: 14, borderRadius: 4, background: "linear-gradient(to bottom, #0a0020, #050510)", display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 12, overflow: "hidden" }}>
                  {[...Array(10)].map((_, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", animation: "fanSpotPulse 1.8s ease-in-out infinite", animationDelay: `${i * 0.15}s`, margin: "0 4px" }}>
                      <div style={{ width: 18 + (i % 3) * 3, height: 18 + (i % 3) * 3, borderRadius: "50%", background: ["#5C2A00","#8B2200","#2F1B0E","#6B2C00","#4a1e00","#703200","#5C2A00","#8B2200","#2F1B0E","#703200"][i], border: `2px solid ${["#FF2DAA","#00FFFF","#FFD700","#AA2DFF","#FF9500","#00FF88","#00FFFF","#FF2DAA","#FFD700","#00FF88"][i]}` }} />
                      <div style={{ width: 12 + (i % 3) * 2, height: 20, borderRadius: "3px 3px 0 0", background: "#1a0a00" }} />
                    </div>
                  ))}
                </div>
                <div style={{ position: "absolute", top: 12, right: 12, background: "#E63000", borderRadius: 4, padding: "3px 8px", fontSize: 8, fontWeight: 700, fontFamily: "'Orbitron', monospace", zIndex: 10, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF88", boxShadow: "0 0 5px #00FF88", display: "inline-block", animation: "fanSpotPulse 1.2s ease-in-out infinite" }} /> LIVE
                </div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #E63000, transparent)" }} />
              </div>

              {/* Reaction dock */}
              <div style={{ background: "rgba(5,5,16,0.8)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
                <div style={{ fontSize: 8, color: "rgba(0,255,136,0.5)", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" as const, marginBottom: 8 }}>Live Reactions</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" as const, marginBottom: 9 }}>
                  {[["👍","THANK YOU"],["❤️","HEARTS"],["✋","FLICKER"],["🎉","CONFETTI"],["⚡","SPARK"],["🎵","VIBE"]].map(([em, lbl]) => (
                    <button key={lbl} className="fan-react-btn" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "7px 9px", background: "rgba(0,255,136,0.06)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 8, cursor: "pointer", color: "#fff", fontSize: 7, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, transition: "all 0.15s", minWidth: 42 }}>
                      <span style={{ fontSize: 16, lineHeight: 1 }}>{em}</span>{lbl}
                    </button>
                  ))}
                  <div style={{ flex: 1, minWidth: 46, background: "rgba(4,8,26,0.95)", border: "1px solid rgba(255,140,0,0.3)", borderRadius: 8, padding: "7px 4px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, position: "relative" }}>
                    <span style={{ position: "absolute", top: 2, right: 3, fontSize: 6, fontWeight: 700, color: "rgba(255,140,0,0.55)" }}>AD</span>
                    <div style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,140,0,0.9)" }}>SPONSOR</div>
                    <div style={{ fontSize: 6, color: "rgba(255,140,0,0.4)" }}>Your Ad Here</div>
                  </div>
                </div>
                <input placeholder="Say something to the crowd..." onKeyDown={e => { if (e.key === "Enter") e.currentTarget.value = ""; }} style={{ width: "100%", boxSizing: "border-box" as const, background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,255,136,0.2)", borderRadius: 7, padding: "7px 11px", color: "#fff", fontSize: 11, outline: "none", fontFamily: "inherit" }} />
              </div>

              {/* Fan Analytics */}
              <div style={{ background: "rgba(5,5,16,0.85)", border: "1px solid rgba(0,255,255,0.2)", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 8, color: "rgba(0,255,255,0.6)", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" as const }}>Fan Analytics</div>
                  <span style={{ fontSize: 9, color: "#00FFFF" }}>24 min session</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {[["Watch time","24 hrs"],["Tips sent","8"],["Artists followed","3"],["XP earned",`${startingPoints.toLocaleString()}`]].map(([k,v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                        <span style={{ color: "rgba(255,255,255,0.4)" }}>{k}</span>
                        <span style={{ fontWeight: 700, color: "#FFD700", fontFamily: "monospace" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 56 }}>
                    {[35,58,25,80,100,70,88].map((h, i) => (
                      <div key={i} style={{ width: 10, borderRadius: "2px 2px 0 0", background: h > 75 ? "#FFD700" : h > 50 ? "#FF6B00" : "#E63000", height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button onClick={() => router.push("/store")} style={{ flex: 1, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 7, padding: "5px 0", color: "#FFD700", fontSize: 9, fontWeight: 800, cursor: "pointer" }}>⭐ UPGRADE</button>
                  <button onClick={() => router.push("/rankings")} style={{ flex: 1, background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.25)", borderRadius: 7, padding: "5px 0", color: "#00FFFF", fontSize: 9, fontWeight: 800, cursor: "pointer" }}>🏆 RANKS</button>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Cosmetic Shop */}
              <div style={{ background: "rgba(8,14,38,0.95)", border: "1px solid rgba(220,70,0,0.5)", borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,140,0,0.8)", textTransform: "uppercase" as const, textAlign: "center", marginBottom: 8 }}>Cosmetic Shop</div>
                <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                  {[["🔴","FREE"],["💧","RAF"],["⭕","EPIC"]].map(([em, lbl]) => (
                    <button key={lbl} onClick={() => router.push("/store")} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 3px", background: "transparent", border: "1px solid rgba(220,70,0,0.5)", borderRadius: 6, cursor: "pointer", color: "rgba(255,215,0,0.9)", fontSize: 14 }}>
                      {em}<span style={{ fontSize: 7, fontWeight: 700 }}>{lbl}</span>
                    </button>
                  ))}
                </div>
                <div style={{ background: "rgba(4,8,26,0.95)", border: "1px solid rgba(255,140,0,0.3)", borderRadius: 6, padding: "5px 6px", textAlign: "center", position: "relative" }}>
                  <span style={{ position: "absolute", top: 2, right: 3, fontSize: 6, fontWeight: 700, color: "rgba(255,140,0,0.55)" }}>AD</span>
                  <div style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,140,0,0.9)" }}>🎯 Upgrade to Gold</div>
                  <div style={{ fontSize: 6, color: "rgba(255,140,0,0.4)", marginTop: 1 }}>Remove ads + bonus PunPoints</div>
                </div>
              </div>

              {/* Billboard Fans */}
              <div style={{ background: "rgba(8,14,38,0.95)", border: "1px solid rgba(220,70,0,0.5)", borderRadius: 8, padding: 10, textAlign: "center" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,140,0,0.8)", textTransform: "uppercase" as const, marginBottom: 5 }}>Billboard Fans</div>
                <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, color: "#FFD700", fontSize: 20 }}>38.5K</div>
                <div style={{ fontSize: 9, color: "#FF6B00", marginTop: 3 }}>SByeeGil</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 10, fontSize: 9, marginTop: 5 }}>
                  <span>❤️ <strong style={{ color: "#FFD700" }}>8</strong></span>
                  <span>🟡 <strong style={{ color: "#FFD700" }}>6</strong></span>
                </div>
              </div>

              {/* PunPoints */}
              <div style={{ background: "rgba(8,14,38,0.95)", border: "1px solid rgba(220,70,0,0.5)", borderRadius: 8, padding: 10, textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 5 }}>
                  <span>🟠</span>
                  <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,140,0,0.8)", textTransform: "uppercase" as const }}>PunPoints</div>
                </div>
                <div style={{ fontSize: 13, marginBottom: 6 }}>⭐⭐⭐⭐⭐</div>
                <button onClick={() => router.push("/store")} style={{ width: "100%", padding: "4px 0", fontSize: 9, background: "transparent", border: "1px solid rgba(220,70,0,0.5)", color: "rgba(255,140,0,0.9)", borderRadius: 6, cursor: "pointer", fontWeight: 700 }}>UPGRADE</button>
              </div>

              {/* Memory Wall mini */}
              <div onClick={() => router.push(`/fan/${fanSlug}/memory`)} style={{ background: "rgba(8,14,38,0.95)", border: "1px solid rgba(220,70,0,0.5)", borderRadius: 8, padding: 10, textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,140,0,0.8)", textTransform: "uppercase" as const, marginBottom: 5 }}>Memory Wall</div>
                <div style={{ fontSize: 20, marginBottom: 4 }}>🎞</div>
                <div style={{ fontSize: 7, color: "rgba(255,140,0,0.4)" }}>Videos · Audio · Images</div>
              </div>

              {/* Tickets */}
              <div onClick={() => router.push(`/fan/${fanSlug}/tickets`)} style={{ background: "rgba(8,14,38,0.95)", border: "1px solid rgba(220,70,0,0.5)", borderRadius: 8, padding: 10, textAlign: "center", cursor: "pointer" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(255,140,0,0.8)", textTransform: "uppercase" as const, marginBottom: 5 }}>My Tickets</div>
                <div style={{ fontSize: 20, marginBottom: 4 }}>🎟</div>
                <div style={{ fontSize: 7, color: "rgba(255,140,0,0.4)" }}>2 upcoming events</div>
              </div>

              {/* Sidebar AD */}
              <div style={{ background: "rgba(4,8,26,0.95)", border: "1px solid rgba(255,140,0,0.3)", borderRadius: 8, padding: 10, textAlign: "center", position: "relative" }}>
                <span style={{ position: "absolute", top: 3, right: 4, fontSize: 6, fontWeight: 700, color: "rgba(255,140,0,0.55)" }}>AD</span>
                <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,140,0,0.9)", marginBottom: 3 }}>🎵 BerntoutStudio AI</div>
                <div style={{ fontSize: 7, color: "rgba(255,140,0,0.4)", marginBottom: 6 }}>Make beats with AI. Free trial.</div>
                <button onClick={() => router.push("/store")} style={{ width: "100%", padding: "4px 0", fontSize: 8, fontWeight: 700, background: "transparent", border: "1px solid rgba(220,70,0,0.5)", color: "rgba(255,140,0,0.9)", borderRadius: 5, cursor: "pointer" }}>TRY FREE</button>
              </div>
            </div>
          </div>

          <UnifiedAdSlot venue="dashboard" slotKey="homepageBanner" format="horizontal" label="ADVERTISEMENT" style={{ marginBottom: 16 }} accentColor="#00FF88" />

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
