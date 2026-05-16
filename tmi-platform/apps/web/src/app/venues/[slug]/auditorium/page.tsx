"use client";

import { useState } from "react";
import Link from "next/link";
import VenueAudienceShell from "@/components/venues/VenueAudienceShell";
import { resolveEnvironment } from "@/lib/venue/VenueEnvironmentRegistry";

export default function VenueAuditoriumPage({ params }: { params: { slug: string } }) {
  const env = resolveEnvironment("artist-live");
  const venueName = params.slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const [seats, setSeats] = useState(0);
  const [reactions, setReactions] = useState(0);
  const [tips, setTips] = useState(0);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px 0" }}>
        <Link href={`/venues/${params.slug}`} style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← {venueName}</Link>

        <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 20, marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800, marginBottom: 6 }}>AUDITORIUM</div>
            <h1 style={{ fontSize: "clamp(1.4rem,4vw,2.2rem)", fontWeight: 900, margin: 0 }}>{venueName}</h1>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 9, background: "rgba(0,255,255,0.12)", border: "1px solid rgba(0,255,255,0.3)", color: "#00FFFF", borderRadius: 4, padding: "3px 9px", fontWeight: 700 }}>
              {env.class.toUpperCase()}
            </span>
            <span style={{ fontSize: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.5)", borderRadius: 4, padding: "3px 9px" }}>
              {env.seatMode}
            </span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>Max {env.maxCapacity.toLocaleString()}</span>
          </div>
        </div>

        {/* Environment info strip */}
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 18px", marginBottom: 24, display: "flex", gap: 24, flexWrap: "wrap" }}>
          {[
            { label: "LIGHTING", value: env.lightingPreset.replace(/-/g, " ").toUpperCase() },
            { label: "CAMERA", value: env.cameraMode.toUpperCase() },
            { label: "AD ZONES", value: String(env.adZones.length) },
            { label: "PROPS", value: String(env.props.length) },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 7, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{value}</div>
            </div>
          ))}
        </div>

        <VenueAudienceShell
          occupiedSeats={seats}
          reactions={reactions}
          tipsTotal={tips}
          onSeatDelta={(d) => setSeats(s => Math.max(0, s + d))}
          onReaction={() => setReactions(r => r + 1)}
          onTip={(amount) => setTips(t => t + amount)}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <Link href={`/venues/${params.slug}/lobby`} style={{ padding: "10px 20px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "#00FFFF", borderRadius: 8, textDecoration: "none" }}>
            ENTER LOBBY
          </Link>
          <Link href={`/venues/${params.slug}/live`} style={{ padding: "10px 20px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#00FFFF", border: "1px solid rgba(0,255,255,0.4)", borderRadius: 8, textDecoration: "none" }}>
            GO LIVE
          </Link>
        </div>
      </section>
    </main>
  );
}
