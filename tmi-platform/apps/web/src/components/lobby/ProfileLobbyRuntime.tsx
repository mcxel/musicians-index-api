"use client";
/**
 * ProfileLobbyRuntime — unified runtime replacing all separate fan/artist/performer/
 * venue/sponsor/promoter/writer profile lobby variants.
 * One component, mode prop determines which surface renders.
 */
import { useState } from "react";
import Link from "next/link";
import { getRouteMap, type TMIRole } from "@/lib/routing/ProfileLobbyRouteMap";
import AvatarLobbyCanvas from "@/components/lobby/AvatarLobbyCanvas";
import TipBar from "@/components/hud/TipBar";
import TokenBalance from "@/components/hud/TokenBalance";

interface ProfileLobbyRuntimeProps {
  mode: TMIRole;
  userId?: string;
  displayName?: string;
  slug?: string;
  accentColor?: string;
  tokenBalance?: number;
  isOwner?: boolean;
  performerId?: string;
}

const ROLE_CONFIG: Record<TMIRole, { label: string; icon: string; accentColor: string; cta: string }> = {
  fan:        { label: "Fan Hub",        icon: "🎧", accentColor: "#00FFFF", cta: "Enter Show" },
  performer:  { label: "Performer HQ",  icon: "🎤", accentColor: "#AA2DFF", cta: "Go Live"    },
  artist:     { label: "Artist Studio",  icon: "🎨", accentColor: "#FF2DAA", cta: "Create"     },
  venue:      { label: "Venue Control",  icon: "🏟️", accentColor: "#FFD700", cta: "Open Doors" },
  sponsor:    { label: "Sponsor Deck",   icon: "🤝", accentColor: "#00FF88", cta: "View Deals" },
  advertiser: { label: "Ad Center",     icon: "📊", accentColor: "#FF6B35", cta: "Run Ads"    },
  promoter:   { label: "Promoter Deck", icon: "📣", accentColor: "#00E5FF", cta: "Book Event" },
  writer:     { label: "Writer Room",   icon: "📰", accentColor: "#FFD700", cta: "Write"      },
  admin:      { label: "Admin Control", icon: "⚙️", accentColor: "#FF2020", cta: "Oversee"    },
};

export default function ProfileLobbyRuntime({
  mode,
  userId,
  displayName = "TMI Member",
  slug,
  accentColor,
  tokenBalance = 0,
  isOwner = false,
  performerId,
}: ProfileLobbyRuntimeProps) {
  const [activeTab, setActiveTab] = useState<"lobby" | "profile" | "activity">("lobby");
  const config = ROLE_CONFIG[mode] ?? ROLE_CONFIG.fan;
  const routes = getRouteMap(mode);
  const color = accentColor ?? config.accentColor;

  const tabs = ["lobby", "profile", "activity"] as const;

  return (
    <div style={{
      background: "rgba(5,5,16,0.95)", borderRadius: 18,
      border: `1px solid ${color}20`, overflow: "hidden",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 18px", borderBottom: `1px solid ${color}18`,
        background: `linear-gradient(135deg, ${color}08, rgba(0,0,0,0))`,
      }}>
        <span style={{ fontSize: 24 }}>{config.icon}</span>
        <div>
          <div style={{ fontSize: 9, letterSpacing: "0.22em", color, fontWeight: 900 }}>
            {config.label.toUpperCase()}
          </div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginTop: 2 }}>
            {displayName}
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <TokenBalance userId={userId} initialBalance={tokenBalance} accentColor={color} compact />
          <Link href={routes.hub} style={{
            padding: "7px 16px", borderRadius: 8,
            background: `linear-gradient(135deg, ${color}, ${color}aa)`,
            color: "#000", fontSize: 9, fontWeight: 900, textDecoration: "none",
            letterSpacing: "0.1em",
          }}>
            {config.cta}
          </Link>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", borderBottom: `1px solid ${color}12` }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1, padding: "9px", background: "none", border: "none",
              fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
              color: activeTab === tab ? color : "rgba(255,255,255,0.3)",
              cursor: "pointer", textTransform: "uppercase",
              borderBottom: activeTab === tab ? `2px solid ${color}` : "2px solid transparent",
              transition: "all 0.15s",
            }}
          >
            {tab === "lobby" ? "🏟 LOBBY" : tab === "profile" ? "👤 PROFILE" : "📊 ACTIVITY"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: "16px" }}>
        {activeTab === "lobby" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <AvatarLobbyCanvas roomId={mode} accentColor={color} />
            {/* Quick nav links */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { label: "🏆 Hub",       href: routes.hub },
                { label: "👤 Profile",   href: routes.profile },
                ...(routes.studio ? [{ label: "🎛️ Studio", href: routes.studio }] : []),
                ...(routes.dashboard ? [{ label: "📊 Dashboard", href: routes.dashboard }] : []),
                ...(routes.analytics ? [{ label: "📈 Analytics", href: routes.analytics }] : []),
                { label: "⚙️ Settings",  href: routes.settings },
              ].slice(0, 6).map(link => (
                <Link key={link.href} href={link.href} style={{
                  padding: "9px 12px", borderRadius: 9,
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${color}18`,
                  color: "rgba(255,255,255,0.65)", fontSize: 10,
                  fontWeight: 700, textDecoration: "none",
                  display: "block", transition: "all 0.15s",
                }}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{
              background: `${color}08`, border: `1px solid ${color}20`,
              borderRadius: 12, padding: "16px",
            }}>
              <div style={{ fontSize: 9, letterSpacing: "0.18em", color, fontWeight: 900, marginBottom: 8 }}>
                PROFILE COMPLETION
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Avatar", "Bio", "Links", "Verification", "Portfolio"].map((item, i) => (
                  <span key={item} style={{
                    fontSize: 8, padding: "3px 8px", borderRadius: 6,
                    background: i < 3 ? `${color}20` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${i < 3 ? color + "44" : "rgba(255,255,255,0.1)"}`,
                    color: i < 3 ? color : "rgba(255,255,255,0.3)",
                    fontWeight: 800,
                  }}>
                    {i < 3 ? "✓" : "○"} {item}
                  </span>
                ))}
              </div>
            </div>
            <Link href={routes.profile} style={{
              display: "block", padding: "10px", textAlign: "center",
              background: `${color}10`, border: `1px solid ${color}22`,
              color, borderRadius: 10, fontSize: 10, fontWeight: 800, textDecoration: "none",
            }}>
              EDIT PROFILE →
            </Link>
          </div>
        )}

        {activeTab === "activity" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { event: "Joined live room", time: "2m ago", icon: "🔴" },
              { event: "Ranked up to #12",  time: "1h ago", icon: "🏆" },
              { event: "NFT minted",        time: "3h ago", icon: "🖼️" },
              { event: "Battle won",        time: "1d ago", icon: "⚔️" },
            ].map(a => (
              <div key={a.event} style={{
                display: "flex", gap: 10, alignItems: "center",
                padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>
                <span style={{ fontSize: 16 }}>{a.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>{a.event}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tip bar for performer/artist modes */}
      {(mode === "performer" || mode === "artist") && performerId && !isOwner && (
        <div style={{ padding: "0 16px 16px" }}>
          <TipBar
            performerId={performerId}
            performerName={displayName}
            accentColor={color}
            compact
          />
        </div>
      )}
    </div>
  );
}
