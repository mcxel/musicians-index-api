"use client";

/**
 * Living Rankings — category × geography flip (Phase 2C).
 * Prefer computeRanks(); honest empty when a category has no measured data.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  computeRanks,
  type PerformerCategory,
  type PerformerIdentity,
} from "@/lib/performers/PerformerRegistry";
import { getRankingScore } from "@/lib/progression/ProgressionEngine";

export type LivingRankCategory =
  | "Overall"
  | "Music"
  | "Battles"
  | "Cyphers"
  | "Beat Makers"
  | "Comedy"
  | "Dance"
  | "DJ"
  | "Community"
  | "Commerce"
  | "Growth"
  | "Momentum";

export type LivingRankGeo = "City" | "State" | "Country" | "Global";

const CATEGORIES: LivingRankCategory[] = [
  "Overall",
  "Music",
  "Battles",
  "Cyphers",
  "Beat Makers",
  "Comedy",
  "Dance",
  "DJ",
  "Community",
  "Commerce",
  "Growth",
  "Momentum",
];

const GEOS: LivingRankGeo[] = ["Global", "Country", "State", "City"];

const MUSIC_CATEGORIES = new Set<PerformerCategory>([
  "Hip-Hop",
  "Rap",
  "R&B",
  "Gospel",
  "Country",
  "Rock",
  "EDM",
  "Afrobeats",
  "Pop",
  "Jazz",
  "Latin",
  "Soul",
  "Funk",
  "Blues",
  "Metal",
  "Reggae",
  "Dancehall",
  "Indie",
  "Electronic",
]);

/** Categories with no measured competitive ledger yet → honest empty. */
const NO_LEDGER: Set<LivingRankCategory> = new Set([
  "Battles",
  "Cyphers",
  "Community",
  "Commerce",
  "Growth",
  "Momentum",
]);

function parseState(city: string): string | null {
  // "Atlanta, GA" → GA
  const m = city.match(/,\s*([A-Z]{2})\s*$/);
  return m?.[1] ?? null;
}

function filterByGeo(
  rows: PerformerIdentity[],
  geo: LivingRankGeo,
  anchor?: PerformerIdentity | null,
): PerformerIdentity[] {
  if (geo === "Global") return rows;
  if (!anchor) return [];
  if (geo === "Country") {
    return rows.filter((p) => p.countryName === anchor.countryName);
  }
  if (geo === "City") {
    return rows.filter((p) => p.city === anchor.city);
  }
  // State
  const st = parseState(anchor.city);
  if (!st) return [];
  return rows.filter((p) => parseState(p.city) === st);
}

function filterByCategory(
  rows: PerformerIdentity[],
  category: LivingRankCategory,
): { rows: PerformerIdentity[]; emptyReason: string | null } {
  if (NO_LEDGER.has(category)) {
    return {
      rows: [],
      emptyReason: `No verified ${category} ranking ledger yet. Ranks appear when measured results exist.`,
    };
  }
  if (category === "Overall") {
    return { rows, emptyReason: null };
  }
  if (category === "Music") {
    const filtered = rows.filter((p) => MUSIC_CATEGORIES.has(p.category));
    return {
      rows: filtered,
      emptyReason: filtered.length ? null : "No music-category performers in this geo filter.",
    };
  }
  if (category === "Beat Makers") {
    // No Producer category on PerformerIdentity yet — honest empty until registry has them.
    return {
      rows: [],
      emptyReason:
        "No Beat Maker ranking ledger yet. Producer identities are not a PerformerRegistry category.",
    };
  }
  if (category === "Comedy") {
    const filtered = rows.filter((p) => /comedy/i.test(p.category));
    return {
      rows: filtered,
      emptyReason: filtered.length ? null : "No Comedy performers ranked for this filter.",
    };
  }
  if (category === "Dance") {
    const filtered = rows.filter((p) => /dance/i.test(p.category));
    return {
      rows: filtered,
      emptyReason: filtered.length ? null : "No Dance performers ranked for this filter.",
    };
  }
  if (category === "DJ") {
    const filtered = rows.filter((p) => p.category === "EDM" || /dj/i.test(p.category));
    return {
      rows: filtered,
      emptyReason: filtered.length ? null : "No DJ performers ranked for this filter.",
    };
  }
  return { rows, emptyReason: null };
}

export interface LivingRankingsPanelProps {
  accentColor?: string;
  /** Anchor performer for City/State/Country filters (ACTIVE_PERFORMER). */
  anchorPerformerId?: string | null;
  maxRows?: number;
}

export default function LivingRankingsPanel({
  accentColor = "#00D4FF",
  anchorPerformerId,
  maxRows = 10,
}: LivingRankingsPanelProps) {
  const [category, setCategory] = useState<LivingRankCategory>("Overall");
  const [geo, setGeo] = useState<LivingRankGeo>("Global");

  const ranked = useMemo(() => computeRanks(), []);
  const anchor = useMemo(
    () => (anchorPerformerId ? ranked.find((p) => p.id === anchorPerformerId) ?? null : ranked[0] ?? null),
    [ranked, anchorPerformerId],
  );

  const { list, emptyReason } = useMemo(() => {
    const geoFiltered = filterByGeo(ranked, geo, anchor);
    const { rows, emptyReason: reason } = filterByCategory(geoFiltered, category);
    // Re-rank within filter by XP (Overall) — ranking score only additive display
    const sorted = [...rows]
      .sort((a, b) => b.xp - a.xp)
      .map((p, i) => ({ ...p, rank: i + 1 }));
    return {
      list: sorted.slice(0, maxRows),
      emptyReason:
        reason ??
        (sorted.length === 0
          ? geo === "Global"
            ? "No ranked performers."
            : `No performers for ${geo} filter${anchor ? ` (${anchor.city})` : ""}.`
          : null),
    };
  }, [ranked, geo, category, anchor, maxRows]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div>
        <div
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.14em",
            color: accentColor,
          }}
        >
          LIVING RANKINGS
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
          XP via computeRanks · honest empty when no ledger
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={c}
            active={category === c}
            color={accentColor}
            onClick={() => setCategory(c)}
          />
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {GEOS.map((g) => (
          <Chip
            key={g}
            label={g}
            active={geo === g}
            color="#FFD700"
            onClick={() => setGeo(g)}
          />
        ))}
      </div>

      {emptyReason ? (
        <div
          style={{
            padding: 16,
            borderRadius: 10,
            border: "1px dashed rgba(255,255,255,0.15)",
            fontSize: 11,
            color: "rgba(255,255,255,0.4)",
            lineHeight: 1.5,
          }}
        >
          {emptyReason}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {list.map((p) => {
            const rs = getRankingScore(p.id);
            return (
              <Link
                key={p.id}
                href={p.profileRoute || `/performers/${p.slug}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                  textDecoration: "none",
                  color: "#fff",
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    color: accentColor,
                    width: 28,
                    flexShrink: 0,
                  }}
                >
                  #{p.rank}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {p.name}
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                    {p.category} · {p.city}
                    {rs > 0 ? ` · RS ${rs}` : ""}
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#AA2DFF" }}>
                  {p.xp.toLocaleString()} XP
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Chip({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        fontSize: 8,
        fontWeight: 900,
        letterSpacing: "0.04em",
        padding: "4px 8px",
        borderRadius: 6,
        cursor: "pointer",
        fontFamily: "inherit",
        border: active ? `1px solid ${color}` : "1px solid rgba(255,255,255,0.12)",
        background: active ? `${color}22` : "transparent",
        color: active ? color : "rgba(255,255,255,0.45)",
      }}
    >
      {label}
    </button>
  );
}
