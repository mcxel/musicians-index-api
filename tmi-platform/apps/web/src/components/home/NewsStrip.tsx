"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const FALLBACK_HEADLINES = [
  "🏆 Crown Season enters Week 14 — voting closes Friday midnight",
  "🎙️ Nova Reign drops surprise visual for \"Frequencies\" — 2M views overnight",
  "🎮 Game Night: Name That Tune tournament kicks off at 9PM EST",
  "📢 New: Live Cypher Rooms now open to all members",
  "🎤 Interview: Amirah Wells talks touring, healing, and her next era",
  "🔥 DJ Cyphers mix goes viral — 500K streams in 48 hours",
  "💰 Brand partnerships up 40% this quarter on the Index",
  "🌍 Platform now live in 24 countries worldwide",
];

interface NewsArticle { id: string; title: string; excerpt?: string; }

const HEADLINE_EMOJIS = ["🏆", "🎙️", "🔥", "📢", "🎤", "💰", "🌍", "⭐", "🎶", "🎬", "🎯", "🚀"];

export default function NewsStrip() {
  const [headlines, setHeadlines] = useState<string[]>(FALLBACK_HEADLINES);

  useEffect(() => {
    fetch("/api/homepage/belt-feed?belt=news&limit=12")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const live = (data as NewsArticle[]).map(
          (a, i) => `${HEADLINE_EMOJIS[i % HEADLINE_EMOJIS.length]} ${a.title}`,
        );
        setHeadlines(live);
      })
      .catch(() => {});
  }, []);

  const ticker = [...headlines, ...headlines];
  return (
    <div style={{
      background: "rgba(0,255,255,0.04)", border: "1px solid rgba(0,255,255,0.15)",
      borderRadius: 8, padding: "10px 0", marginBottom: 20,
      overflow: "hidden", display: "flex", alignItems: "center",
    }}>
      <div style={{
        flexShrink: 0, padding: "0 16px", fontSize: 9, fontWeight: 800,
        letterSpacing: "0.2em", color: "#00FFFF", textTransform: "uppercase",
        borderRight: "1px solid rgba(0,255,255,0.2)",
        display: "flex", alignItems: "center", gap: 6,
      }}>
        <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }}>●</motion.span>
        BREAKING
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          style={{ display: "flex", whiteSpace: "nowrap" }}
        >
          {ticker.map((h, i) => (
            <span key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", padding: "0 28px", cursor: "pointer" }}>
              {h}<span style={{ color: "rgba(0,255,255,0.25)", marginLeft: 28 }}>◆</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
