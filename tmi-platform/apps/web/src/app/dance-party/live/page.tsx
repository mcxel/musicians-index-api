import type { Metadata } from "next";
import Link from "next/link";
import WorldDancePartyArena from "@/packages/foundation-visual/WorldDancePartyArena";
import RouteRecoveryCard from "@/components/routing/RouteRecoveryCard";
import SlugFallbackPanel from "@/components/routing/SlugFallbackPanel";
import SocketStatusBadge from "@/components/routing/SocketStatusBadge";
import ReconnectButton from "@/components/routing/ReconnectButton";
import ReturnPathButton from "@/components/routing/ReturnPathButton";
import { registerRoute } from "@/lib/routing/RouteClosureRegistry";
import { registerReturnPath } from "@/lib/routing/ReturnPathResolver";
import { resolveSlug } from "@/lib/routing/SlugRecoveryEngine";
import SocketRecoveryEngine from "@/lib/routing/SocketRecoveryEngine";

export const metadata: Metadata = {
  title: "Dance Party Live | TMI",
  description: "Live DJ-driven world dance party. Open floor, camera tiles, soul train finale.",
};

const CURRENT_DJ = "DJ KOVA";
const CURRENT_TRACK = "Midnight Grind (Dance Edit)";
const TRACK_PRODUCER = "Wavetek";

export default function DancePartyLivePage() {
  registerRoute("/dance-party/live", "open", {
    returnRoute: "/dance-party",
    fallbackRoute: "/live/lobby",
    nextAction: "dance",
  });
  registerReturnPath({ fromRoute: "/dance-party/live", toRoute: "/dance-party", label: "Back to Dance Party" });
  resolveSlug("event", "dance-party-live");
  SocketRecoveryEngine.register("guest-user", "sock_dance_party", "dance-party-live");

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid rgba(0,255,255,0.1)", background: "rgba(0,0,0,0.6)" }}>
        <Link href="/dance-party" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← Dance Party</Link>
        <div style={{ flex: 1, textAlign: "center" }}>
          <span style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800 }}>WORLD DANCE PARTY — LIVE</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/dance-party/submit" style={{ fontSize: 9, fontWeight: 800, color: "#AA2DFF", border: "1px solid rgba(170,45,255,0.3)", borderRadius: 6, padding: "4px 12px", textDecoration: "none" }}>SUBMIT TRACK</Link>
        </div>
      </div>

      {/* Now playing strip */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 20px", background: "rgba(0,255,255,0.05)", borderBottom: "1px solid rgba(0,255,255,0.08)" }}>
        <span style={{ fontSize: 16 }}>🎵</span>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{CURRENT_TRACK}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>Produced by {TRACK_PRODUCER} · <span style={{ color: "#AA2DFF" }}>Promo Use License</span></div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 9, color: "#00FFFF", fontWeight: 700 }}>DJ: {CURRENT_DJ}</div>
      </div>

      {/* Arena */}
      <WorldDancePartyArena djName={CURRENT_DJ} activeVisualizer="laser-grid" />

      {/* Fan action bar */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(5,5,16,0.95)", borderTop: "1px solid rgba(0,255,255,0.2)", padding: "10px 20px", display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", zIndex: 100 }}>
        {[
          { label: "TIP", color: "#00FF88" },
          { label: "CLAP", color: "#FFD700" },
          { label: "LOVE", color: "#FF2DAA" },
          { label: "HYPE", color: "#AA2DFF" },
          { label: "CHAT", color: "#00FFFF" },
          { label: "VOTE", color: "#FF9500" },
          { label: "SAVE", color: "#fff" },
        ].map(({ label, color }) => (
          <button key={label} style={{ padding: "8px 16px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color, border: `1px solid ${color}40`, borderRadius: 20, background: `${color}10`, cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding: "16px 20px 100px", display: "grid", gap: 8 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <SocketStatusBadge userId="guest-user" />
          <ReconnectButton userId="guest-user" />
          <ReturnPathButton />
        </div>
        <RouteRecoveryCard route="/dance-party/live" />
        <SlugFallbackPanel entity="event" slug="dance-party-live" />
      </div>
    </main>
  );
}
