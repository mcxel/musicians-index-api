"use client";

import { PersonaSwitcher } from "@/components/hud/PersonaSwitcher";
import PerformerHubDashboard from "@/components/performer/PerformerHubDashboard";
import LiveMediaWall from "@/components/media/LiveMediaWall";
import Link from "next/link";
import { HubBackNav } from "@/components/nav/HubBackNav";
import RoomContainer from "@/components/room/RoomContainer";
import ActionCanister from "@/components/room/ActionCanister";
import WidgetDrawer from "@/components/room/WidgetDrawer";
import NeonWaveUnderlay from "@/components/atmosphere/NeonWaveUnderlay";

const NAV_LINKS = [
  { href: "/hub/performer",     label: "Control Room" },
  { href: "/performer/studio",  label: "Studio"       },
  { href: "/performer/profile", label: "Profile"      },
  { href: "/battles",           label: "Battles"      },
  { href: "/battles/new",       label: "Challenge"    },
  { href: "/cypher/stage",      label: "Cypher"       },
  { href: "/beat-vault",        label: "Beat Vault"   },
  { href: "/nft/mint",          label: "Mint NFT"     },
  { href: "/messages",          label: "Messages"     },
  { href: "/settings",          label: "Settings"     },
];

const PERFORMER_ACTIONS = [
  { id: "live-rooms", icon: "🎭", label: "Go Live"  },
  { id: "revenue",    icon: "💰", label: "Revenue"  },
  { id: "rankings",   icon: "🏆", label: "Rankings" },
  { id: "messages",   icon: "💬", label: "Messages" },
  { id: "bookings",   icon: "📅", label: "Bookings" },
];

export default function PerformerHubPage() {
  return (
    <RoomContainer roomId="performer-hub" title="Performer Hub" accentColor="#AA2DFF" bpm={120}>
      <div style={{ fontFamily: "'Inter', sans-serif", background: "#050510", minHeight: "100vh", position: "relative" }}>
        <NeonWaveUnderlay colorA="#AA2DFF" colorB="#FF2DAA" colorC="#00FFFF" opacity={0.08} zIndex={0} />

        {/* Nav bar */}
        <div style={{ position: "relative", zIndex: 2, background: "rgba(0,0,0,0.75)", borderBottom: "1px solid rgba(170,45,255,0.2)", padding: "10px 24px", display: "flex", alignItems: "center", gap: 16, overflowX: "auto", backdropFilter: "blur(12px)" }}>
          <HubBackNav accentColor="#AA2DFF" />
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", color: "#AA2DFF", textTransform: "uppercase", flexShrink: 0 }}>Performer Hub</span>
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
              {link.label}
            </Link>
          ))}
          <div style={{ marginLeft: "auto", flexShrink: 0 }}>
            <PersonaSwitcher currentRole="performer" compact />
          </div>
        </div>

        {/* Go Live action strip */}
        <div style={{ position: "relative", zIndex: 1, background: "linear-gradient(135deg, rgba(170,45,255,0.15), rgba(255,45,170,0.08))", borderBottom: "1px solid rgba(170,45,255,0.15)", padding: "14px 28px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.28em", color: "#AA2DFF", fontWeight: 800 }}>PERFORMER CONTROL ROOM</div>
            <div style={{ fontSize: 18, fontWeight: 900, marginTop: 3 }}>Nova Cipher <span style={{ color: "#FFD700", fontSize: 13 }}>· Rank #1</span></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginLeft: "auto", flexWrap: "wrap" }}>
            <Link href="/performer/studio" style={{ padding: "9px 20px", borderRadius: 9, background: "linear-gradient(135deg, #AA2DFF, #FF2DAA)", color: "#fff", fontSize: 11, fontWeight: 900, textDecoration: "none", letterSpacing: "0.08em", boxShadow: "0 0 20px rgba(170,45,255,0.35)" }}>
              🔴 GO LIVE
            </Link>
            <Link href="/battles/new" style={{ padding: "9px 18px", borderRadius: 9, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              ⚔️ CHALLENGE
            </Link>
            <Link href="/nft/mint" style={{ padding: "9px 18px", borderRadius: 9, background: "rgba(0,255,255,0.07)", border: "1px solid rgba(0,255,255,0.22)", color: "#00FFFF", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>
              🎨 MINT NFT
            </Link>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <PerformerHubDashboard performerId="nova-cipher" displayName="Nova Cipher" />
          <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px 40px" }}>
            <LiveMediaWall roomId="performer-hub" title="LIVE BATTLES & ROOMS" mode="wall" nodeCount={6} accentColor="#AA2DFF" enterHref="/live/rooms" compact={false} />
          </div>
        </div>

        <ActionCanister actions={PERFORMER_ACTIONS} />
        <WidgetDrawer />
      </div>
    </RoomContainer>
  );
}
