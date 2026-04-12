"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import SectionTitle from "@/components/ui/SectionTitle";
import { getHomeCharts } from "@/components/home/data/getHomeCharts";

interface StoreItem {
  id: string;
  name: string;
  price: number;
  type: string;
  color: string;
}

interface ChartArtist {
  rank: number;
  name: string;
  genre: string;
  followers: number;
  slug: string | null;
  change: "up" | "down" | "same" | "new";
}

const STORE_STUBS: StoreItem[] = [
  { id: "1", name: "Crown Season Vol. 3 Hoodie", price: 5499, type: "MERCH", color: "#FF2DAA" },
  { id: "2", name: "TMI Logo Snapback", price: 2999, type: "MERCH", color: "#00FFFF" },
  { id: "3", name: "Exclusive Beat Pack - Jaylen Cross", price: 1499, type: "DIGITAL", color: "#AA2DFF" },
  { id: "4", name: "Crown Avatar Bundle", price: 999, type: "AVATAR", color: "#FFD700" },
];

const CHANGE_ICON: Record<string, string> = { up: "▲", down: "▼", same: "–", new: "★" };
const CHANGE_COLOR: Record<string, string> = { up: "#00FF99", down: "#FF4466", same: "rgba(255,255,255,0.3)", new: "#FFD700" };

export default function ChartsStoreScreen() {
  const [chart, setChart] = useState<ChartArtist[]>([]);
  const [source, setSource] = useState<"live" | "fallback">("fallback");

  const formatCount = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${Math.round(value / 1000)}K`;
    return `${value}`;
  };

  useEffect(() => {
    getHomeCharts(10)
      .then((result) => {
        setChart(
          result.data.map((artist) => ({
            rank: artist.rank,
            name: artist.artist,
            genre: artist.genre,
            followers: artist.followers,
            slug: artist.slug,
            change: artist.change,
          }))
        );
        setSource(result.source);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: "calc(100vh - 52px)", background: "#050510", padding: "0 0 40px" }}>
      <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto", display: "grid", gap: 32 }}>

        {/* ── TOP CHARTS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {/* Artist Chart */}
          <div>
            <SectionTitle title="Top Artists" accent="purple" badge={`This Week · ${source === "live" ? "Live" : "Fallback"}`} />
            <div style={{
              background: "linear-gradient(135deg, #0A0812 0%, #0D0A18 100%)",
              border: "1px solid rgba(170,45,255,0.15)",
              borderRadius: 12, overflow: "hidden",
            }}>
              {chart.map((a, i) => (
                <motion.div
                  key={a.rank}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "9px 14px",
                    background: a.rank <= 3 ? "rgba(170,45,255,0.05)" : "transparent",
                    borderBottom: i < chart.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}
                >
                  <div style={{
                    width: 22, flexShrink: 0, textAlign: "center",
                    fontSize: a.rank <= 3 ? 14 : 11, fontWeight: 900,
                    color: a.rank === 1 ? "#FFD700" : a.rank <= 3 ? "#AA2DFF" : "rgba(255,255,255,0.25)",
                  }}>
                    {a.rank}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {a.slug ? (
                        <Link href={`/artist/${a.slug}`} style={{ color: "inherit", textDecoration: "none" }}>{a.name}</Link>
                      ) : a.name}
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{a.genre}</div>
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                    {formatCount(a.followers)}
                  </div>
                  <div style={{ fontSize: 9, color: CHANGE_COLOR[a.change], width: 12, flexShrink: 0, textAlign: "center" }}>
                    {CHANGE_ICON[a.change]}
                  </div>
                </motion.div>
              ))}
            </div>
            <div style={{ textAlign: "right", marginTop: 8 }}>
              <Link href="/charts" style={{ fontSize: 10, color: "#AA2DFF", textDecoration: "none", fontWeight: 700, letterSpacing: "0.1em" }}>
                Full Billboard →
              </Link>
            </div>
          </div>

          {/* Store preview */}
          <div>
            <SectionTitle title="TMI Store" accent="gold" badge="Featured" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {STORE_STUBS.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ x: 4 }}
                  style={{
                    background: "#0D0A14",
                    border: `1px solid ${item.color}20`,
                    borderLeft: `3px solid ${item.color}`,
                    borderRadius: "0 8px 8px 0",
                    padding: "12px 14px",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 900, color: item.color, letterSpacing: "0.12em", marginBottom: 3 }}>
                      {item.type}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "white", lineHeight: 1.3 }}>
                      {item.name}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: item.color }}>
                      ${(item.price / 100).toFixed(2)}
                    </div>
                  </div>
                </motion.div>
              ))}
              <div style={{ textAlign: "right", marginTop: 4 }}>
                <Link href="/store" style={{ fontSize: 10, color: "#FFD700", textDecoration: "none", fontWeight: 700, letterSpacing: "0.1em" }}>
                  Browse Store →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── DISCOVERY ROW ── */}
        <div>
          <SectionTitle title="Discover" accent="cyan" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { icon: "🎧", label: "New Releases", href: "/releases", color: "#AA2DFF" },
              { icon: "🏆", label: "Charts", href: "/charts", color: "#FFD700" },
              { icon: "🎙️", label: "Artists", href: "/artists", color: "#00FFFF" },
              { icon: "🎪", label: "Events", href: "/events", color: "#FF2DAA" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -4, boxShadow: `0 8px 24px ${item.color}20` }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
              >
                <Link href={item.href} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "#0D0A14",
                    border: `1px solid ${item.color}20`,
                    borderRadius: 10, padding: "20px 14px",
                    textAlign: "center", cursor: "pointer",
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: item.color, letterSpacing: "0.1em" }}>{item.label}</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
