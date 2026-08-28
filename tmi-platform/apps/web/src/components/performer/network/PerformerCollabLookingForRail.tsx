"use client";

/**
 * Collab looking-for rail — honest empty when no performers set looking-for.
 */

import { useMemo, type CSSProperties } from "react";
import Link from "next/link";
import { listCollabLookingForTiles } from "@/lib/discovery/performerDiscoveryQuery";

interface Props {
  accent?: string;
}

export default function PerformerCollabLookingForRail({ accent = "#FF2DAA" }: Props) {
  const tiles = useMemo(() => listCollabLookingForTiles(), []);

  return (
    <section style={section(accent)}>
      <header style={{ marginBottom: 12 }}>
        <div style={eyebrow(accent)}>Collaboration Discovery</div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>LOOKING FOR…</h2>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          Singer / rapper / DJ / producer / dancer — only when booking profiles declare it.
        </p>
      </header>

      {tiles.length === 0 ? (
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
          No collaboration posts yet. Set your{" "}
          <strong style={{ color: accent }}>Looking for</strong> tags on your booking profile to
          appear here.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
          {tiles.map((t) => (
            <div key={t.id} style={card(accent)}>
              <div style={{ fontWeight: 800 }}>{t.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                Looking for: {t.lookingFor.join(", ")}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                {t.city}, {t.region}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <Link href={t.profileRoute} style={cta(accent)}>
                  View Profile
                </Link>
                <Link href={t.messageRoute} style={cta("#00FFFF")}>
                  Message
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function section(accent: string): CSSProperties {
  return {
    background: "rgba(10,8,24,0.92)",
    border: `1px solid ${accent}33`,
    borderRadius: 16,
    padding: 18,
  };
}
function eyebrow(accent: string): CSSProperties {
  return {
    fontSize: 9,
    letterSpacing: "0.28em",
    color: accent,
    fontWeight: 800,
    textTransform: "uppercase",
    marginBottom: 4,
  };
}
function card(accent: string): CSSProperties {
  return {
    padding: 12,
    borderRadius: 12,
    border: `1px solid ${accent}33`,
    background: `${accent}0d`,
  };
}
function cta(color: string): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 800,
    color,
    textDecoration: "none",
    border: `1px solid ${color}55`,
    borderRadius: 6,
    padding: "5px 8px",
    background: `${color}14`,
  };
}
