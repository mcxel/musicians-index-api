"use client";

/**
 * PerformerVenueNearYouMap — public city/region pins only (never private home).
 */

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  buildDiscoveryTiles,
  type DiscoveryTile,
} from "@/lib/discovery/performerDiscoveryQuery";

type MapKind = "all" | "performer" | "venue";

interface Props {
  accent?: string;
}

export default function PerformerVenueNearYouMap({ accent = "#AA2DFF" }: Props) {
  const [kind, setKind] = useState<MapKind>("all");
  const [liveOnly, setLiveOnly] = useState(false);
  const [bookableOnly, setBookableOnly] = useState(false);
  const [selected, setSelected] = useState<DiscoveryTile | null>(null);

  const tiles = useMemo(
    () =>
      buildDiscoveryTiles({
        kind,
        liveOnly,
        bookableOnly,
      }),
    [kind, liveOnly, bookableOnly],
  );

  // Project lat/lng into a 2D board (US-ish bounds)
  const pins = tiles.map((t) => {
    const x = ((t.lng + 125) / 55) * 100;
    const y = ((50 - t.lat) / 25) * 100;
    return {
      tile: t,
      left: Math.min(96, Math.max(2, x)),
      top: Math.min(92, Math.max(4, y)),
    };
  });

  return (
    <section style={section(accent)}>
      <header style={{ marginBottom: 12 }}>
        <div style={eyebrow(accent)}>Near You · Map</div>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>City / region discovery</h2>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          Public location granularity only. Pin → View Profile · Book · Message · View Show.
        </p>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {(["all", "performer", "venue"] as MapKind[]).map((k) => (
          <button key={k} type="button" onClick={() => setKind(k)} style={chip(kind === k, accent)}>
            {k === "all" ? "ALL" : k.toUpperCase()}
          </button>
        ))}
        <button type="button" onClick={() => setLiveOnly((v) => !v)} style={chip(liveOnly, "#FF2DAA")}>
          LIVE
        </button>
        <button
          type="button"
          onClick={() => setBookableOnly((v) => !v)}
          style={chip(bookableOnly, "#FFD700")}
        >
          BOOKABLE
        </button>
      </div>

      <div style={mapBoard}>
        <div style={mapGrid} />
        {pins.map(({ tile, left, top }) => (
          <button
            key={`${tile.kind}-${tile.id}`}
            type="button"
            title={`${tile.name} · ${tile.city}`}
            onClick={() => setSelected(tile)}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: `${top}%`,
              transform: "translate(-50%, -50%)",
              width: tile.isLive ? 14 : 10,
              height: tile.isLive ? 14 : 10,
              borderRadius: "50%",
              border: `2px solid ${tile.kind === "venue" ? "#22c55e" : accent}`,
              background: tile.isLive ? "#FF2DAA" : tile.promoted ? "#FFD700" : "#fff",
              boxShadow: tile.isLive ? "0 0 12px #FF2DAA" : "0 0 6px rgba(0,0,0,0.5)",
              cursor: "pointer",
              padding: 0,
            }}
          />
        ))}
        {pins.length === 0 && (
          <div style={emptyOverlay}>No pins for these filters.</div>
        )}
      </div>

      {selected && (
        <div style={detailCard(accent)}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.photoUrl}
              alt=""
              style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover" }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800 }}>{selected.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                {selected.kind.toUpperCase()} · {selected.city}, {selected.region}
                {selected.promoted ? " · PROMOTED" : ""}
                {selected.isLive ? " · LIVE" : ""}
              </div>
            </div>
            <button type="button" onClick={() => setSelected(null)} style={closeBtn}>
              ✕
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            <Link href={selected.profileRoute} style={cta(accent)}>
              View Profile
            </Link>
            <Link href={selected.bookRoute} style={cta("#FFD700")}>
              Book
            </Link>
            <Link href={selected.messageRoute} style={cta("#FF2DAA")}>
              Message
            </Link>
            {selected.liveRoomRoute && (
              <Link href={selected.liveRoomRoute} style={cta("#FF2DAA")}>
                View Show
              </Link>
            )}
          </div>
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
function chip(active: boolean, color: string): CSSProperties {
  return {
    borderRadius: 999,
    border: `1px solid ${active ? color : "rgba(255,255,255,0.15)"}`,
    background: active ? `${color}22` : "rgba(255,255,255,0.04)",
    color: active ? color : "rgba(255,255,255,0.55)",
    padding: "6px 12px",
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.08em",
    cursor: "pointer",
  };
}
const mapBoard: CSSProperties = {
  position: "relative",
  height: 280,
  borderRadius: 14,
  overflow: "hidden",
  background:
    "radial-gradient(circle at 30% 40%, rgba(170,45,255,0.18), transparent 45%), radial-gradient(circle at 70% 60%, rgba(0,255,255,0.12), transparent 40%), #070712",
  border: "1px solid rgba(255,255,255,0.08)",
};
const mapGrid: CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage:
    "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
  backgroundSize: "40px 40px",
  opacity: 0.5,
};
const emptyOverlay: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "grid",
  placeItems: "center",
  color: "rgba(255,255,255,0.4)",
  fontSize: 13,
};
function detailCard(accent: string): CSSProperties {
  return {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    border: `1px solid ${accent}33`,
    background: "rgba(0,0,0,0.35)",
  };
}
const closeBtn: CSSProperties = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.2)",
  color: "rgba(255,255,255,0.6)",
  borderRadius: 6,
  cursor: "pointer",
  padding: "4px 8px",
};
function cta(color: string): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.06em",
    color,
    textDecoration: "none",
    border: `1px solid ${color}55`,
    borderRadius: 6,
    padding: "6px 10px",
    background: `${color}14`,
  };
}
