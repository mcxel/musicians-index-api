"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface DiscoveryItem {
  id: string;
  title: string;
  category: "live" | "battle" | "cypher" | "challenge" | "radio" | "genre" | "event";
  thumbnail?: string;
  avatar?: string;
  description?: string;
  viewerCount?: number;
  route: string;
  accentColor?: string;
  isLive?: boolean;
  startsIn?: number; // seconds
}

interface DiscoveryDockPanelProps {
  role?: "fan" | "performer";
  onPreview?: (item: DiscoveryItem) => void;
  onJoin?: (item: DiscoveryItem) => void;
  compact?: boolean;
}

const GenreBubbles = [
  { label: "Live", color: "#E63000", icon: "🔴" },
  { label: "Battles", color: "#FF2DAA", icon: "⚔️" },
  { label: "Cyphers", color: "#00FFFF", icon: "🎤" },
  { label: "Challenges", color: "#FFD700", icon: "🏆" },
  { label: "Radio", color: "#AA2DFF", icon: "📻" },
  { label: "Hip-Hop", color: "#FF6B35", icon: "🎵" },
  { label: "R&B", color: "#38bdf8", icon: "💿" },
  { label: "Country", color: "#c084fc", icon: "🤠" },
];

export default function DiscoveryDockPanel({
  role = "fan",
  onPreview,
  onJoin,
  compact = false,
}: DiscoveryDockPanelProps) {
  const [items, setItems] = useState<DiscoveryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>("Live");
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Fetch discovery data from /api/live/go or respective endpoints
  useEffect(() => {
    const fetchDiscovery = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/live/go", { cache: "no-store" });
        const data = await res.json() as { sessions?: any[] };

        // Transform sessions into discovery items
        const discovered: DiscoveryItem[] = (data.sessions || []).map((session: any) => ({
          id: session.roomId,
          title: session.displayName || session.title,
          category: session.category || "live",
          avatar: session.avatarUrl,
          description: session.title,
          viewerCount: session.viewerCount,
          route: `/live/rooms/${session.roomId}`,
          accentColor: session.accentColor,
          isLive: true,
        }));

        setItems(discovered);
      } catch (err) {
        console.error("Discovery fetch failed:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchDiscovery();
    const interval = setInterval(() => void fetchDiscovery(), 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const filteredItems =
    selectedGenre === "Live"
      ? items.filter((i) => i.isLive)
      : items.filter((i) => i.category === selectedGenre.toLowerCase() || i.category.includes(selectedGenre.toLowerCase()));

  const formatViewerCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toLocaleString();
  };

  return (
    <div
      style={{
        background: "rgba(15, 15, 26, 0.8)",
        border: "1px solid rgba(0, 255, 255, 0.15)",
        borderRadius: 12,
        padding: compact ? 12 : 16,
        backdropFilter: "blur(10px)",
        minHeight: compact ? 180 : 320,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "#00FFFF", textTransform: "uppercase" }}>
          🎯 {role === "fan" ? "Discover" : "Opportunities"}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: "rgba(0, 255, 255, 0.1)",
            border: "1px solid rgba(0, 255, 255, 0.3)",
            borderRadius: 4,
            padding: "4px 8px",
            fontSize: 10,
            cursor: "pointer",
            color: "#00FFFF",
          }}
        >
          {isExpanded ? "−" : "+"}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            {/* Genre Bubble Picker */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12, overflowX: "auto", paddingBottom: 8 }}>
              {GenreBubbles.map((bubble) => (
                <button
                  key={bubble.label}
                  onClick={() => setSelectedGenre(bubble.label)}
                  style={{
                    background:
                      selectedGenre === bubble.label
                        ? bubble.color + "30"
                        : "rgba(255, 255, 255, 0.05)",
                    border: `1px solid ${selectedGenre === bubble.label ? bubble.color : "rgba(255, 255, 255, 0.1)"}`,
                    borderRadius: 20,
                    padding: "6px 12px",
                    fontSize: 10,
                    cursor: "pointer",
                    color: selectedGenre === bubble.label ? bubble.color : "rgba(255, 255, 255, 0.6)",
                    fontWeight: selectedGenre === bubble.label ? 700 : 500,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {bubble.icon} {bubble.label}
                </button>
              ))}
            </div>

            {/* Room Cards Scroll */}
            <div
              style={{
                display: "flex",
                gap: 12,
                overflowX: "auto",
                paddingBottom: 12,
                maxHeight: compact ? 120 : 200,
              }}
            >
              {loading ? (
                <div style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.4)", padding: "12px 0" }}>Loading…</div>
              ) : filteredItems.length === 0 ? (
                <div style={{ fontSize: 10, color: "rgba(255, 255, 255, 0.3)", padding: "12px 0" }}>
                  No {selectedGenre} rooms live right now. Create alert?
                </div>
              ) : (
                filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                      border: `1px solid ${item.accentColor || "#00FFFF"}44`,
                      borderRadius: 8,
                      padding: 10,
                      minWidth: 140,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                    onClick={() => {
                      onPreview?.(item);
                      onJoin?.(item);
                    }}
                  >
                    {/* Thumbnail */}
                    {item.avatar && (
                      <div
                        style={{
                          width: "100%",
                          height: 80,
                          borderRadius: 6,
                          background: `url(${item.avatar}) center/cover`,
                          marginBottom: 8,
                          border: `1px solid ${item.accentColor || "#00FFFF"}66`,
                        }}
                      />
                    )}

                    {/* Info */}
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
                      {item.title.slice(0, 20)}
                    </div>
                    <div style={{ fontSize: 8, color: "rgba(255, 255, 255, 0.4)", marginBottom: 6 }}>
                      {item.category.toUpperCase()} {item.isLive && "• LIVE"}
                    </div>

                    {/* Viewers / CTA */}
                    <div style={{ display: "flex", gap: 4, alignItems: "center", justifyContent: "space-between" }}>
                      {item.viewerCount !== undefined && (
                        <span style={{ fontSize: 8, color: "rgba(255, 255, 255, 0.5)" }}>
                          👁 {formatViewerCount(item.viewerCount)}
                        </span>
                      )}
                      <Link
                        href={item.route}
                        style={{
                          fontSize: 8,
                          fontWeight: 700,
                          color: item.accentColor || "#00FFFF",
                          textDecoration: "none",
                          marginLeft: "auto",
                        }}
                      >
                        JOIN →
                      </Link>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
