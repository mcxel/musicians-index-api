"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface OpportunityItem {
  id: string;
  title: string;
  type: "battle" | "cypher" | "challenge" | "showcase" | "venue" | "booking";
  description?: string;
  entrants?: number;
  prize?: string;
  route: string;
  accentColor?: string;
  startsIn?: number; // seconds
  requiresApproval?: boolean;
}

interface LiveApiSession {
  userId: string;
  displayName: string;
  title: string;
  category: "cypher" | "battle" | "concert" | "challenge" | "live" | "game" | "session";
  roomId: string;
  viewerCount: number;
  accentColor?: string;
}

interface OpportunityDockPanelProps {
  performerId?: string;
  onSelectOpportunity?: (item: OpportunityItem) => void;
  compact?: boolean;
}

const OpportunityCategories = [
  { label: "All", icon: "⭐", type: "all" },
  { label: "Battles", icon: "⚔️", type: "battle" },
  { label: "Cyphers", icon: "🎤", type: "cypher" },
  { label: "Challenges", icon: "🏆", type: "challenge" },
  { label: "Showcases", icon: "🎬", type: "showcase" },
  { label: "Venues", icon: "🏢", type: "venue" },
  { label: "Bookings", icon: "📅", type: "booking" },
];

export default function OpportunityDockPanel({
  performerId,
  onSelectOpportunity,
  compact = false,
}: OpportunityDockPanelProps) {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Fetch opportunities from real live registry API.
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/live/go", { cache: "no-store" });
        const data = await res.json() as { sessions?: LiveApiSession[] };
        const sessions = data.sessions ?? [];

        const mapped: OpportunityItem[] = sessions
          .filter((session) => session.category === "battle" || session.category === "cypher" || session.category === "challenge")
          .map((session) => ({
            id: session.roomId,
            title: session.title || session.displayName,
            type:
              session.category === "battle"
                ? "battle"
                : session.category === "cypher"
                  ? "cypher"
                  : "challenge",
            description: session.displayName,
            entrants: session.viewerCount,
            route: `/live/rooms/${session.roomId}`,
            accentColor: session.accentColor ?? "#FF2DAA",
          }));

        setOpportunities(mapped);
      } catch (err) {
        console.error("Opportunities fetch failed:", err);
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchOpportunities();
    const interval = setInterval(() => void fetchOpportunities(), 15000);
    return () => clearInterval(interval);
  }, [performerId]);

  const filteredItems =
    selectedType === "all" ? opportunities : opportunities.filter((o) => o.type === selectedType);

  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds) return "Anytime";
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    if (hours > 0) return `In ${hours}h`;
    return `In ${mins}m`;
  };

  return (
    <div
      style={{
        background: "rgba(15, 15, 26, 0.8)",
        border: "1px solid rgba(255, 45, 170, 0.15)",
        borderRadius: 12,
        padding: compact ? 12 : 16,
        backdropFilter: "blur(10px)",
        minHeight: compact ? 180 : 320,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "#FF2DAA", textTransform: "uppercase" }}>
          ⚡ Opportunities
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: "rgba(255, 45, 170, 0.1)",
            border: "1px solid rgba(255, 45, 170, 0.3)",
            borderRadius: 4,
            padding: "4px 8px",
            fontSize: 10,
            cursor: "pointer",
            color: "#FF2DAA",
          }}
        >
          {isExpanded ? "−" : "+"}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            {/* Category Picker */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12, overflowX: "auto", paddingBottom: 8 }}>
              {OpportunityCategories.map((cat) => (
                <button
                  key={cat.type}
                  onClick={() => setSelectedType(cat.type)}
                  style={{
                    background:
                      selectedType === cat.type ? "rgba(255, 45, 170, 0.2)" : "rgba(255, 255, 255, 0.05)",
                    border: `1px solid ${selectedType === cat.type ? "#FF2DAA" : "rgba(255, 255, 255, 0.1)"}`,
                    borderRadius: 20,
                    padding: "6px 12px",
                    fontSize: 10,
                    cursor: "pointer",
                    color: selectedType === cat.type ? "#FF2DAA" : "rgba(255, 255, 255, 0.6)",
                    fontWeight: selectedType === cat.type ? 700 : 500,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>

            {/* Opportunity Cards Scroll */}
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
                  No open {selectedType === "all" ? "opportunities" : selectedType + "s"} right now.
                </div>
              ) : (
                filteredItems.map((opp) => (
                  <motion.div
                    key={opp.id}
                    whileHover={{ scale: 1.05 }}
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                      border: `1px solid ${opp.accentColor || "#FF2DAA"}44`,
                      borderRadius: 8,
                      padding: 10,
                      minWidth: 150,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                    onClick={() => onSelectOpportunity?.(opp)}
                  >
                    {/* Title */}
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                      {opp.title}
                    </div>

                    {/* Meta */}
                    <div style={{ fontSize: 8, color: "rgba(255, 255, 255, 0.5)", marginBottom: 2 }}>
                      {opp.description}
                    </div>

                    {/* Stats */}
                    <div style={{ display: "flex", gap: 6, fontSize: 8, color: "rgba(255, 255, 255, 0.4)", marginBottom: 8 }}>
                      {opp.entrants && <span>👥 {opp.entrants} joined</span>}
                      {opp.prize && <span>🏆 {opp.prize}</span>}
                      {opp.startsIn && <span>⏱ {formatTimeRemaining(opp.startsIn)}</span>}
                    </div>

                    {/* CTA */}
                    <Link
                      href={opp.route}
                      style={{
                        display: "block",
                        fontSize: 9,
                        fontWeight: 700,
                        color: opp.accentColor || "#FF2DAA",
                        textDecoration: "none",
                        textAlign: "right",
                        marginTop: "auto",
                      }}
                    >
                      {opp.requiresApproval ? "REQUEST →" : "JOIN →"}
                    </Link>
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
