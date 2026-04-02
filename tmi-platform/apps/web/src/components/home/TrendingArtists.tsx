"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";
import { formatCount } from "@/lib/api/homepage";

interface ArtistRow {
  rank: number;
  name: string;
  genre: string;
  change: number;
  streams: string;
  slug: string | null;
}

const STUBS: ArtistRow[] = [
  { rank: 1, name: "NOVA REIGN", genre: "Neo-Soul", change: 12, streams: "2.4M", slug: null },
  { rank: 2, name: "JAYLEN CROSS", genre: "Hip-Hop", change: 5, streams: "1.9M", slug: null },
  { rank: 3, name: "AMIRAH WELLS", genre: "R&B / Soul", change: 8, streams: "1.7M", slug: null },
  { rank: 4, name: "CYPHER KINGS", genre: "Trap", change: -1, streams: "1.4M", slug: null },
  { rank: 5, name: "DIANA CROSS", genre: "R&B", change: 3, streams: "1.2M", slug: null },
  { rank: 6, name: "DESTINED", genre: "Neo-Soul", change: 2, streams: "1.1M", slug: null },
  { rank: 7, name: "AXIS THEORY", genre: "Jazz Fusion", change: 6, streams: "980K", slug: null },
  { rank: 8, name: "LUNAR ECHO", genre: "Lo-Fi", change: -2, streams: "870K", slug: null },
];

export default function TrendingArtists() {
  const [artists, setArtists] = useState<ArtistRow[]>(STUBS);

  useEffect(() => {
    fetch("/api/homepage/trending-artists?limit=8")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (!Array.isArray(data) || data.length === 0) return;
        setArtists(
          (data as Array<{
            id: string; slug: string | null; stageName: string;
            genres: string[]; followers: number;
          }>).map((a, i) => ({
            rank: i + 1,
            name: (a.stageName ?? "Unknown").toUpperCase(),
            genre: a.genres?.[0] ?? "Music",
            change: 0,
            streams: a.followers ? formatCount(a.followers) : "—",
            slug: a.slug ?? null,
          }))
        );
      })
      .catch(() => {});
  }, []);
  return (
    <div style={{
      background: "linear-gradient(135deg, #080A18 0%, #0A0A18 100%)",
      border: "1px solid rgba(0,255,255,0.15)",
      borderRadius: 12,
      padding: "22px 24px",
      marginBottom: 20,
    }}>
      <SectionTitle title="Trending Artists" subtitle="Based on streams & engagement" accent="cyan" badge="LIVE RANK" />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {artists.map((a, i) => (
          <motion.div
            key={a.rank}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            whileHover={{ x: 4 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "10px 12px",
              borderRadius: 8,
              background: i === 0 ? "rgba(255,215,0,0.06)" : "rgba(255,255,255,0.02)",
              border: i === 0 ? "1px solid rgba(255,215,0,0.2)" : "1px solid rgba(255,255,255,0.04)",
              cursor: "pointer",
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 6, flexShrink: 0,
              background: i === 0 ? "#FFD700" : i < 3 ? "rgba(0,255,255,0.15)" : "rgba(255,255,255,0.06)",
              border: i === 0 ? "none" : `1px solid ${i < 3 ? "#00FFFF40" : "rgba(255,255,255,0.1)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 900,
              color: i === 0 ? "#000" : i < 3 ? "#00FFFF" : "rgba(255,255,255,0.5)",
            }}>
              {a.rank === 1 ? "♛" : a.rank}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: i === 0 ? "#FFD700" : "white", letterSpacing: "0.08em", textTransform: "uppercase", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {a.slug ? (
                  <Link href={`/artist/${a.slug}`} style={{ color: "inherit", textDecoration: "none" }}>{a.name}</Link>
                ) : a.name}
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.05em" }}>{a.genre}</div>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600, flexShrink: 0 }}>
              {a.streams}
            </div>
            <div style={{
              fontSize: 9, fontWeight: 800, flexShrink: 0, minWidth: 30, textAlign: "right",
              color: a.change > 0 ? "#2DFFAA" : a.change < 0 ? "#FF2DAA" : "rgba(255,255,255,0.4)",
            }}>
              {a.change > 0 ? `↑${a.change}` : a.change < 0 ? `↓${Math.abs(a.change)}` : "—"}
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ textAlign: "right", marginTop: 14 }}>
        <Link href="/charts" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#00FFFF", textDecoration: "none", border: "1px solid rgba(0,255,255,0.25)", padding: "5px 14px", borderRadius: 4 }}>
          Full Charts →
        </Link>
      </div>
    </div>
  );
}
