import Link from "next/link";
import type { Metadata } from "next";
import { resolveEnvironment } from "@/lib/venue/VenueEnvironmentRegistry";

export const metadata: Metadata = {
  title: "World Dance Party | TMI",
  description: "DJ-driven open-floor dance experience. Submit your track, earn points, join the Soul Train finale.",
};

const PHASES = [
  { label: "Warm-Up", desc: "DJ opens the floor. Crowd fills. First 50 dancers earn bonus XP.", color: "#00FFFF", icon: "🌅" },
  { label: "Open Floor", desc: "Free-for-all. Dance, react, show camera, earn streaks.", color: "#AA2DFF", icon: "🎵" },
  { label: "Spotlight Drops", desc: "Random dancers get featured on the big screen. Fan vote: Fire / Smooth / Wild.", color: "#FF2DAA", icon: "🔦" },
  { label: "Mini Battles", desc: "Quick 60-second dance battles. Crowd votes. Winner earns points.", color: "#FFD700", icon: "⚡" },
  { label: "Soul Train Finale", desc: "The line opens. Featured dancers enter. Emoji storm. Big points.", color: "#FF9500", icon: "🚂" },
  { label: "Afterparty", desc: "Slower songs. Social hangout. Artist networking. DM your friends.", color: "#00FF88", icon: "🌃" },
];

const RULES = [
  "Open floor only — no seats",
  "DJ plays dance tracks submitted with promo-use permission",
  "Track credit displays while song plays",
  "Bots seed lightly until real fans join",
  "Camera tile optional — avatar always visible",
  "Points for active dancing, reacting, streaks, and finale participation",
  "Memories auto-capture spotlight and finale moments",
];

export default function DancePartyPage() {
  const env = resolveEnvironment("dance-party");

  return (
    <main style={{ minHeight: "100vh", background: "radial-gradient(circle at 50% 0%, rgba(0,255,255,0.12), transparent 50%), #050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ textAlign: "center", padding: "56px 24px 40px", borderBottom: "1px solid rgba(0,255,255,0.1)" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.5em", color: "#00FFFF", fontWeight: 800, marginBottom: 10 }}>WORLD DANCE PARTY</div>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.4rem)", fontWeight: 900, marginBottom: 12 }}>The Floor Is Open</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 520, margin: "0 auto 28px", lineHeight: 1.7 }}>
          DJ-driven. Open floor. No seats. Artist-submitted tracks. Earn points every time you dance, react, and participate in the finale.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/dance-party/live" style={{ padding: "13px 32px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#050510", background: "linear-gradient(135deg,#00FFFF,#AA2DFF)", borderRadius: 10, textDecoration: "none" }}>
            JOIN THE PARTY →
          </Link>
          <Link href="/dance-party/submit" style={{ padding: "13px 32px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.4)", borderRadius: 10, textDecoration: "none" }}>
            SUBMIT YOUR TRACK
          </Link>
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 0" }}>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#AA2DFF", fontWeight: 800, marginBottom: 24 }}>PARTY PHASES</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
          {PHASES.map((phase, i) => (
            <div key={phase.label} style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${phase.color}25`, borderRadius: 12, padding: 18 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{phase.icon}</span>
                <div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em" }}>PHASE {i + 1}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: phase.color }}>{phase.label}</div>
                </div>
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>{phase.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,255,255,0.12)", borderRadius: 12, padding: 22 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800, marginBottom: 16 }}>FLOOR RULES</div>
            {RULES.map(r => (
              <div key={r} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ color: "#00FFFF", fontSize: 10, flexShrink: 0 }}>—</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{r}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(170,45,255,0.12)", borderRadius: 12, padding: 22 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#AA2DFF", fontWeight: 800, marginBottom: 16 }}>ENVIRONMENT</div>
            {[
              { label: "Room Type", value: env.class.replace(/-/g, " ").toUpperCase() },
              { label: "Seat Mode", value: env.seatMode.toUpperCase() },
              { label: "Lighting", value: env.lightingPreset.replace(/-/g, " ").toUpperCase() },
              { label: "Max Crowd", value: env.maxCapacity.toLocaleString() },
              { label: "Ad Zones", value: env.adZones.join(", ") },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>{label}</span>
                <span style={{ fontSize: 10, color: "#fff", fontWeight: 600, textAlign: "right", maxWidth: "55%" }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
