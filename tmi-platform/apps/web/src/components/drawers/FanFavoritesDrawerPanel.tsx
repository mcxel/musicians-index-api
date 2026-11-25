"use client";

/**
 * FanFavoritesDrawerPanel — aggregation view over canonical Follow (Fan Them).
 * Does NOT merge LIKE / SAVE TO PLAYLIST / memory isFavorite into one state.
 * Honest empty — no seed artists/songs/battles.
 */

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";

type FavRow = { id: string; label: string; href: string };

export default function FanFavoritesDrawerPanel({
  userId,
  accentColor = "#FF2DAA",
}: {
  userId: string;
  accentColor?: string;
}) {
  const [rows, setRows] = useState<FavRow[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!userId || userId === "anonymous") {
      setRows([]);
      setError("Sign in to see artists you FAN THEM.");
      return;
    }

    fetch(`/api/social/follow?list=following&userId=${encodeURIComponent(userId)}`, {
      credentials: "include",
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("fetch_failed");
        const data = (await res.json()) as { ids?: string[] };
        const ids = Array.isArray(data.ids) ? data.ids : [];
        if (cancelled) return;
        setRows(
          ids.map((id) => ({
            id,
            label: id,
            href: `/p/${encodeURIComponent(id)}`,
          })),
        );
        setError("");
      })
      .catch(() => {
        if (!cancelled) {
          setRows([]);
          setError("Unable to load favorites.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div data-testid="fan-favorites-drawer" style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: accentColor }}>
        FAVORITES · FAN THEM
      </div>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.45 }}>
        Shows people you FAN THEM (Follow). Likes and playlist saves stay separate.
      </p>

      {rows === null ? (
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0 }}>Loading favorites…</p>
      ) : null}

      {error ? (
        <p style={{ fontSize: 11, color: "rgba(255,100,100,0.85)", margin: 0 }}>{error}</p>
      ) : null}

      {rows !== null && rows.length === 0 && !error ? (
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.5 }}>
          No favorites yet.
        </p>
      ) : null}

      {rows !== null && rows.length > 0 ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {rows.slice(0, 24).map((row) => (
            <li key={row.id}>
              <Link
                href={row.href}
                style={{
                  display: "block",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${accentColor}33`,
                  background: "rgba(255,255,255,0.03)",
                  color: "#fff",
                  textDecoration: "none",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {row.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <Link href="/performers" style={linkStyle(accentColor)}>
          Discover Artists →
        </Link>
        <Link href="/home/1-2" style={linkStyle(`${accentColor}99`)}>
          Billboard →
        </Link>
      </div>
    </div>
  );
}

function linkStyle(color: string): CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color,
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: 8,
    border: `1px solid ${color}44`,
  };
}
