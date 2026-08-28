"use client";

/**
 * PerformerDiscoveryWall — animated searchable floating tiles (Command Center).
 * Real photo/live presence only — no fan avatars (Rule 26).
 */

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  buildDiscoveryTiles,
  recordDemandSignal,
  type DiscoveryFilter,
  type DiscoveryTile,
} from "@/lib/discovery/performerDiscoveryQuery";
import type { LookingForRole } from "@/lib/booking/BookingProfileStore";

const GENRES = [
  "All",
  "Hip-Hop",
  "R&B",
  "Country",
  "Rock",
  "Gospel",
  "Comedy",
  "Dance",
  "Producer",
  "DJ",
];

const LOOKING: Array<LookingForRole | ""> = [
  "",
  "singer",
  "rapper",
  "dj",
  "producer",
  "dancer",
  "comedian",
  "band",
];

interface Props {
  kind?: DiscoveryFilter["kind"];
  accent?: string;
  maxTiles?: number;
  onBook?: (tile: DiscoveryTile) => void;
}

export default function PerformerDiscoveryWall({
  kind = "performer",
  accent = "#00FFFF",
  maxTiles = 48,
  onBook,
}: Props) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [bookableOnly, setBookableOnly] = useState(false);
  const [liveOnly, setLiveOnly] = useState(false);
  const [lookingFor, setLookingFor] = useState<LookingForRole | "">("");
  const [city, setCity] = useState("");

  const tiles = useMemo(() => {
    const filter: DiscoveryFilter = {
      kind,
      query,
      genre: genre === "All" ? undefined : genre,
      bookableOnly,
      liveOnly,
      city: city || undefined,
      lookingFor: lookingFor || undefined,
      trending: true,
    };
    if (city.trim()) recordDemandSignal(city, "search");
    return buildDiscoveryTiles(filter).slice(0, maxTiles);
  }, [kind, query, genre, bookableOnly, liveOnly, city, lookingFor, maxTiles]);

  return (
    <section style={sectionStyle(accent)}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
        <div>
          <div style={eyebrow(accent)}>Discovery Wall</div>
          <h2 style={titleStyle}>Find performers & partners</h2>
          <p style={subStyle}>
            Photo · live preview · city/region · bookable status. One tap to profile, book, or message.
          </p>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", alignSelf: "flex-end" }}>
          {tiles.length} results
        </div>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, genre, city…"
          style={inputStyle}
          aria-label="Search discovery"
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City / region"
          style={{ ...inputStyle, maxWidth: 140 }}
          aria-label="Filter by city"
        />
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          style={selectStyle}
          aria-label="Genre filter"
        >
          {GENRES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <select
          value={lookingFor}
          onChange={(e) => setLookingFor(e.target.value as LookingForRole | "")}
          style={selectStyle}
          aria-label="Looking for filter"
        >
          <option value="">Looking for…</option>
          {LOOKING.filter(Boolean).map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <ToggleChip active={liveOnly} onClick={() => setLiveOnly((v) => !v)} label="LIVE NOW" color="#FF2DAA" />
        <ToggleChip
          active={bookableOnly}
          onClick={() => setBookableOnly((v) => !v)}
          label="BOOKABLE"
          color={accent}
        />
      </div>

      {tiles.length === 0 ? (
        <div style={emptyStyle}>
          No matches with these filters. Clear filters or open booking profile to set availability.
        </div>
      ) : (
        <div style={wallGrid}>
          {tiles.map((tile, i) => (
            <motion.article
              key={`${tile.kind}-${tile.id}`}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: Math.min(i * 0.02, 0.4), type: "spring", stiffness: 280, damping: 22 }}
              whileHover={{ y: -4, scale: 1.02 }}
              style={tileCard(tile.promoted, accent)}
            >
              <div style={{ position: "relative", height: 120, overflow: "hidden", borderRadius: 10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.photoUrl}
                  alt={tile.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                {tile.isLive && (
                  <span style={liveBadge}>LIVE</span>
                )}
                {tile.promoted && <span style={promotedBadge}>PROMOTED</span>}
              </div>
              <div style={{ paddingTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                  <strong style={{ fontSize: 13 }}>{tile.name}</strong>
                  {tile.isVerified && <span style={{ color: accent, fontSize: 10 }}>✓</span>}
                </div>
                <div style={metaLine}>
                  {tile.genreOrCategory} · {tile.city}, {tile.region}
                </div>
                <div style={metaLine}>
                  {tile.bookable
                    ? tile.availableTonight
                      ? "Available tonight"
                      : tile.availableThisWeekend
                        ? "This weekend"
                        : tile.bookingStatus === "virtual"
                          ? "Virtual booking open"
                          : "Bookable"
                    : "Booking closed"}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                  <Link href={tile.profileRoute} style={cta(accent)}>
                    View Profile
                  </Link>
                  <Link
                    href={tile.bookRoute}
                    style={cta("#FFD700")}
                    onClick={() => {
                      recordDemandSignal(tile.city, "request");
                      onBook?.(tile);
                    }}
                  >
                    Book
                  </Link>
                  <Link href={tile.messageRoute} style={cta("#FF2DAA")}>
                    Message
                  </Link>
                  {tile.isLive && tile.liveRoomRoute && (
                    <Link href={tile.liveRoomRoute} style={cta("#FF2DAA")}>
                      Attend
                    </Link>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}

function ToggleChip({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        borderRadius: 999,
        border: `1px solid ${active ? color : "rgba(255,255,255,0.15)"}`,
        background: active ? `${color}22` : "rgba(255,255,255,0.04)",
        color: active ? color : "rgba(255,255,255,0.55)",
        padding: "6px 12px",
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: "0.08em",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function sectionStyle(accent: string): CSSProperties {
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
const titleStyle: CSSProperties = { margin: 0, fontSize: 20, fontWeight: 900 };
const subStyle: CSSProperties = { margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)", maxWidth: 520 };
const inputStyle: CSSProperties = {
  flex: 1,
  minWidth: 160,
  background: "rgba(0,0,0,0.35)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "#fff",
  padding: "8px 10px",
  fontSize: 12,
};
const selectStyle: CSSProperties = {
  ...inputStyle,
  flex: "0 0 auto",
  minWidth: 110,
};
const wallGrid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: 12,
};
function tileCard(promoted: boolean, accent: string): CSSProperties {
  return {
    background: "rgba(255,255,255,0.03)",
    border: `1px solid ${promoted ? "#FFD70066" : `${accent}22`}`,
    borderRadius: 14,
    padding: 10,
    boxShadow: promoted ? "0 0 18px rgba(255,215,0,0.12)" : undefined,
  };
}
const liveBadge: CSSProperties = {
  position: "absolute",
  top: 8,
  left: 8,
  background: "#E63000",
  color: "#fff",
  fontSize: 9,
  fontWeight: 900,
  padding: "3px 7px",
  borderRadius: 4,
  letterSpacing: "0.08em",
};
const promotedBadge: CSSProperties = {
  position: "absolute",
  top: 8,
  right: 8,
  background: "rgba(255,215,0,0.92)",
  color: "#111",
  fontSize: 8,
  fontWeight: 900,
  padding: "3px 6px",
  borderRadius: 4,
  letterSpacing: "0.06em",
};
const metaLine: CSSProperties = { fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 3 };
function cta(color: string): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: "0.06em",
    color,
    textDecoration: "none",
    border: `1px solid ${color}55`,
    borderRadius: 6,
    padding: "4px 7px",
    background: `${color}14`,
  };
}
const emptyStyle: CSSProperties = {
  padding: "28px 12px",
  textAlign: "center",
  color: "rgba(255,255,255,0.4)",
  fontSize: 13,
};
