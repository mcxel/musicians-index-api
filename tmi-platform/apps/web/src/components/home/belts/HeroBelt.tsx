"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlowFrame from "@/components/home/shared/GlowFrame";
import LivePulseBadge from "@/components/home/shared/LivePulseBadge";
import SectionTitle from "@/components/ui/SectionTitle";
import { getHomeCrown, type HomeCrownData } from "@/components/home/data/getHomeCrown";
import { getHomeEditorial } from "@/components/home/data/getHomeEditorial";

const FALLBACK_CROWN: HomeCrownData = {
  winners: [
    { name: "JAYLEN CROSS", genre: "Hip-Hop", title: '"Crown Season" Vol. 3', votes: "24,881", week: "Week 14" },
  ],
  genres: ["Hip-Hop", "R&B / Soul", "Neo-Soul", "Trap"],
};

const FALLBACK_HEADLINES = [
  "Crown season enters its final vote window.",
  "Editorial desk tracks the week’s fastest risers.",
  "Live rooms and releases are surging across the platform.",
];

export default function HeroBelt() {
  const [crown, setCrown] = useState<HomeCrownData>(FALLBACK_CROWN);
  const [headlines, setHeadlines] = useState<string[]>(FALLBACK_HEADLINES);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [editorialSource, setEditorialSource] = useState<"live" | "fallback">("fallback");

  useEffect(() => {
    Promise.all([getHomeCrown(), getHomeEditorial()])
      .then(([crownData, editorialResult]) => {
        setCrown(crownData);
        setHeadlines(editorialResult.data.news.slice(0, 3));
        setEditorialSource(editorialResult.source);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (headlines.length <= 1) return;
    const timer = setInterval(() => setHeadlineIndex((current) => (current + 1) % headlines.length), 4500);
    return () => clearInterval(timer);
  }, [headlines.length]);

  const hero = crown.winners[0] ?? FALLBACK_CROWN.winners[0];
  const headline = headlines[headlineIndex] ?? FALLBACK_HEADLINES[0];

  return (
    <GlowFrame accent="cyan">
      <div
        style={{
          padding: "28px 28px 24px",
          minHeight: 280,
          background: "linear-gradient(135deg, rgba(6,12,28,0.96) 0%, rgba(13,5,24,0.98) 48%, rgba(4,18,20,0.98) 100%)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
          <SectionTitle
            title="Frontline Signal"
            subtitle="Editorial lead, crown movement, and live pulse from the current issue."
            accent="cyan"
            badge={hero.week}
          />
          <LivePulseBadge label={editorialSource === "live" ? "Live Feed" : "Fallback Feed"} accent="cyan" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) minmax(260px, 0.9fr)", gap: 18, alignItems: "stretch" }}>
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.24em", color: "#00FFFF", textTransform: "uppercase" }}>
              The Musician&apos;s Index Live Desk
            </div>
            <div>
              <div style={{ fontSize: 34, fontWeight: 900, lineHeight: 1.02, color: "white", marginBottom: 8 }}>
                {hero.name}
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", marginBottom: 10 }}>{hero.title}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                <span style={{ fontSize: 10, color: "#FFD700", letterSpacing: "0.14em", textTransform: "uppercase" }}>{hero.genre}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{hero.votes} votes</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${headlineIndex}-${headline}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                style={{
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  padding: "14px 16px",
                  minHeight: 68,
                }}
              >
                <div style={{ fontSize: 9, color: "#FF2DAA", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6 }}>
                  Breaking Editorial
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.82)", lineHeight: 1.5 }}>{headline}</div>
              </motion.div>
            </AnimatePresence>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link
                href="/contest"
                style={{
                  padding: "10px 18px",
                  borderRadius: 6,
                  textDecoration: "none",
                  background: "linear-gradient(90deg, #00FFFF, #AA2DFF)",
                  color: "#000",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                Vote Now
              </Link>
              <Link
                href="/magazine"
                style={{
                  padding: "10px 18px",
                  borderRadius: 6,
                  textDecoration: "none",
                  border: "1px solid rgba(0,255,255,0.36)",
                  color: "#00FFFF",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                Read Issue
              </Link>
            </div>
          </div>

          <div
            style={{
              borderRadius: 14,
              border: "1px solid rgba(255,45,170,0.16)",
              background: "linear-gradient(180deg, rgba(255,45,170,0.10) 0%, rgba(255,255,255,0.02) 100%)",
              padding: "18px 16px",
              display: "grid",
              gap: 12,
              alignContent: "start",
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", color: "#FF2DAA", textTransform: "uppercase" }}>
              Genre Watch
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {crown.genres.slice(0, 6).map((genre) => (
                <span
                  key={genre}
                  style={{
                    padding: "5px 9px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.74)",
                    fontSize: 9,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {genre}
                </span>
              ))}
            </div>
            <div style={{ paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", color: "#FFD700", textTransform: "uppercase", marginBottom: 6 }}>
                Crown Leader
              </div>
              <div style={{ fontSize: 16, color: "white", fontWeight: 800, marginBottom: 4 }}>{hero.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.58)", lineHeight: 1.45 }}>{hero.title}</div>
            </div>
          </div>
        </div>
      </div>
    </GlowFrame>
  );
}