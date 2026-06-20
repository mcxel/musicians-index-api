import Link from "next/link";
import UniversalVenueRenderer from "@/components/live/UniversalVenueRenderer";
import type { VenueIndex } from "@/components/live/AudienceScene";

interface LiveArenaPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function idToVenue(id: string): VenueIndex {
  const s = id.toLowerCase();
  if (/battle|versus|cypher|octagon|ring|fight|championship/.test(s)) return 1; // Arena
  if (/club|vip|lounge/.test(s)) return 2;
  if (/outdoor|festival|rooftop/.test(s)) return 3;
  if (/boardroom|judge|game/.test(s)) return 4;
  return 0; // Theater (main-stage, concert, idol, etc)
}

export default async function LiveArenaPage({ params, searchParams }: LiveArenaPageProps) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const modeValue = typeof sp["mode"] === "string" ? sp["mode"] : Array.isArray(sp["mode"]) ? sp["mode"][0] : "audience";
  const mode = modeValue === "performer" ? "performer" : "audience";
  const venueIndex = idToVenue(id);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <nav style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "12px 24px", display: "flex", gap: 16, alignItems: "center", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/live/rooms" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 11, fontWeight: 700 }}>← Lobby</Link>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>›</span>
        <span style={{ fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: "0.06em" }}>ARENA — {id.toUpperCase().replace(/-/g, " ")}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Link href={`/live/arena/${id}?mode=audience`} style={{ padding: "4px 12px", borderRadius: 6, fontSize: 9, fontWeight: 800, background: mode === "audience" ? "rgba(0,255,255,0.15)" : "rgba(255,255,255,0.04)", color: mode === "audience" ? "#00FFFF" : "rgba(255,255,255,0.4)", border: `1px solid ${mode === "audience" ? "rgba(0,255,255,0.35)" : "rgba(255,255,255,0.1)"}`, textDecoration: "none", letterSpacing: "0.08em" }}>
            👥 AUDIENCE
          </Link>
          <Link href={`/live/arena/${id}?mode=performer`} style={{ padding: "4px 12px", borderRadius: 6, fontSize: 9, fontWeight: 800, background: mode === "performer" ? "rgba(255,45,170,0.15)" : "rgba(255,255,255,0.04)", color: mode === "performer" ? "#FF2DAA" : "rgba(255,255,255,0.4)", border: `1px solid ${mode === "performer" ? "rgba(255,45,170,0.35)" : "rgba(255,255,255,0.1)"}`, textDecoration: "none", letterSpacing: "0.08em" }}>
            🎤 STAGE
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px", display: "grid", gap: 16 }}>
        {/* Arena header — UniversalVenueRenderer below renders the real 3D crowd + panel together */}
        <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "#050510" }}>
          <div style={{ padding: "8px 14px", background: "rgba(0,0,0,0.6)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF2020", display: "inline-block" }} />
            <span style={{ fontSize: 9, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.18em" }}>
              LIVE — {["THEATER", "ARENA", "CLUB", "OUTDOOR", "BOARDROOM"][venueIndex]} STAGE
            </span>
            <span style={{ marginLeft: "auto", fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
              {mode === "performer" ? "Stage view — your crowd" : "Audience view — house left to right"}
            </span>
          </div>
        </div>

        {/* UniversalVenueRenderer — AudienceScene + WebRTC + chat + reactions + moderation, all in one (Phase 3B) */}
        <UniversalVenueRenderer roomId={id} mode={mode} venueIndex={venueIndex} />
      </div>
    </main>
  );
}
