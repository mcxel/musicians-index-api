"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ImageSlotWrapper } from '@/components/visual-enforcement';

type SponsorEntry = {
  id: string;
  name: string;
  campaign: string;
  category: string;
  accent: string;
  ctaLabel: string;
  ctaHref: string;
  icon: string;
  imageSrc: string;
};

const SPONSORS: SponsorEntry[] = [
  { id: "soundwave", name: "SoundWave Audio", campaign: "Beat Vault Pro Bundle — Season 1", category: "Audio", accent: "#FFD700", ctaLabel: "Launch Campaign", ctaHref: "/advertise", icon: "🎧", imageSrc: "/tmi-curated/gameshow-35.jpg" },
  { id: "beatvault", name: "BeatVault Pro", campaign: "Studio Kit Drop — 30% off", category: "Software", accent: "#00FFFF", ctaLabel: "Book Slot", ctaHref: "/advertise", icon: "🎹", imageSrc: "/tmi-curated/mag-58.jpg" },
  { id: "tmi-merch", name: "TMI Merch Hub", campaign: "Season 1 Gold Tee — Limited", category: "Merch", accent: "#FF2DAA", ctaLabel: "Reserve", ctaHref: "/shop", icon: "👕", imageSrc: "/tmi-curated/season-pass.jpg" },
  { id: "crown-sponsor", name: "Crown Energy", campaign: "Official Battle Energy Drink", category: "Lifestyle", accent: "#FF6B35", ctaLabel: "Sponsor Battle", ctaHref: "/advertise", icon: "⚡", imageSrc: "/tmi-curated/home5.png" },
];

export default function HomePage05SponsorSpotlight() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SPONSORS.length), 4200);
    return () => clearInterval(t);
  }, []);

  const s = SPONSORS[idx]!;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.24em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
        SPONSOR SPOTLIGHT
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={s.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
          style={{
            position: "relative", overflow: "hidden",
            borderRadius: 10, border: `1.5px solid ${s.accent}44`,
            background: `linear-gradient(135deg, ${s.accent}0e 0%, rgba(0,0,0,0) 100%)`,
            padding: "10px 12px",
          }}
        >
          <ImageSlotWrapper imageId="img-8zf4og" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0.58) 70%, rgba(0,0,0,0.7) 100%)," +
                `radial-gradient(ellipse 70% 65% at 20% 30%, ${s.accent}20 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
          {/* Pulse edge */}
          <motion.div
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0, borderRadius: 10, border: `1px solid ${s.accent}33`, pointerEvents: "none" }}
          />
          <div
            style={{
              position: "absolute",
              left: 8,
              right: 8,
              bottom: 6,
              height: 10,
              borderRadius: 999,
              background: "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.01))",
              opacity: 0.32,
              pointerEvents: "none",
            }}
          />
          {/* Glow bg */}
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 70% 60% at 50% 30%, ${s.accent}12 0%, transparent 70%)`, pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 6, fontWeight: 900, letterSpacing: "0.2em", color: s.accent, textTransform: "uppercase", marginBottom: 3 }}>
              OFFICIAL SPONSOR · {s.category}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 22, lineHeight: 1 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#fff", letterSpacing: "0.04em" }}>{s.name}</div>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.45)" }}>{s.campaign}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <Link href={s.ctaHref} style={{ textDecoration: "none" }}>
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  style={{
                    padding: "4px 12px", borderRadius: 999,
                    background: s.accent, color: "#000",
                    fontSize: 6, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  {s.ctaLabel}
                </motion.span>
              </Link>
              <Link href="/advertise" style={{ textDecoration: "none" }}>
                <span style={{ padding: "4px 10px", borderRadius: 999, border: `1px solid ${s.accent}44`, fontSize: 6, fontWeight: 700, color: s.accent, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  View Deal →
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dot indicators */}
      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
        {SPONSORS.map((_, i) => (
          <button key={i} type="button" onClick={() => setIdx(i)} style={{ width: i === idx ? 16 : 5, height: 5, borderRadius: 999, background: i === idx ? s.accent : "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", transition: "all 200ms ease", padding: 0 }} />
        ))}
      </div>
    </div>
  );
}
