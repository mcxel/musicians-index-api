"use client";

import Link from "next/link";
import { useState } from "react";

export default function VenueInteractionRailClient({ venueSlug }: { venueSlug: string }) {
  const [tipped, setTipped] = useState(false);
  const [voted, setVoted] = useState(false);
  const [reacted, setReacted] = useState(false);

  return (
    <div style={{ marginTop: 14, border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, padding: "10px 12px", background: "rgba(255,255,255,0.03)" }}>
      <div style={{ fontSize: 9, color: "#00FFFF", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800, marginBottom: 8 }}>VENUE LOOP</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
        <button onClick={() => setTipped(!tipped)} style={{ border: "1px solid rgba(255,215,0,0.35)", background: "rgba(255,215,0,0.08)", color: "#FFD700", borderRadius: 6, padding: "6px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
          {tipped ? "Tipped ✓" : "Tip Artist"}
        </button>
        <button onClick={() => setVoted(!voted)} style={{ border: "1px solid rgba(0,255,255,0.35)", background: "rgba(0,255,255,0.08)", color: "#00FFFF", borderRadius: 6, padding: "6px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
          {voted ? "Voted ✓" : "Vote"}
        </button>
        <button onClick={() => setReacted(!reacted)} style={{ border: "1px solid rgba(255,45,170,0.35)", background: "rgba(255,45,170,0.08)", color: "#FF2DAA", borderRadius: 6, padding: "6px 8px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
          {reacted ? "Reacted 🔥" : "Emoji"}
        </button>
        <Link href={`/venues/${venueSlug}/live`} style={{ border: "1px solid rgba(170,45,255,0.35)", background: "rgba(170,45,255,0.08)", color: "#AA2DFF", borderRadius: 6, padding: "6px 8px", fontSize: 10, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
          Live View
        </Link>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Link href={`/venues/${venueSlug}/lobby`} style={{ color: "#00FF88", textDecoration: "none", fontSize: 10 }}>Lobby</Link>
        <Link href={`/venues/${venueSlug}/audience`} style={{ color: "#FFD700", textDecoration: "none", fontSize: 10 }}>Audience</Link>
        <Link href={`/venues/${venueSlug}/chat`} style={{ color: "#FF2DAA", textDecoration: "none", fontSize: 10 }}>Chat</Link>
        <Link href="/memories" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 10 }}>Save Memory</Link>
      </div>
    </div>
  );
}
