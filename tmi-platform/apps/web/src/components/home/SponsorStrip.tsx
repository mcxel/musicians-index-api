"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import SectionTitle from "@/components/ui/SectionTitle";

interface SponsorRow { name: string; tier: string; }

const STUBS: SponsorRow[] = [
  { name: "AMPLIFY RECORDS", tier: "PLATINUM" },
  { name: "BEATLAB STUDIOS", tier: "GOLD" },
  { name: "VELOCITY AUDIO", tier: "GOLD" },
  { name: "NOVA MEDIA GROUP", tier: "SILVER" },
  { name: "CROWN & CO.", tier: "SILVER" },
  { name: "FREQUENCY LABS", tier: "BRONZE" },
  { name: "THE VAULT COLLECTIVE", tier: "BRONZE" },
  { name: "SONIC AXIS", tier: "BRONZE" },
];

const TIER_COLOR: Record<string, string> = {
  PLATINUM: "#E0E0FF",
  GOLD: "#FFD700",
  SILVER: "#C0C0C0",
  BRONZE: "#CD7F32",
};

export default function SponsorStrip() {
  const [sponsors, setSponsors] = useState<SponsorRow[]>(STUBS);

  useEffect(() => {
    fetch("/api/homepage/sponsors")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: unknown) => {
        if (!Array.isArray(data) || data.length === 0) return;
        setSponsors(
          (data as Array<{ name: string; tier?: string | null }>).map((s) => ({
            name: (s.name ?? "SPONSOR").toUpperCase(),
            tier: (s.tier ?? "BRONZE").toUpperCase(),
          }))
        );
      })
      .catch(() => {});
  }, []);

  const doubled = [...sponsors, ...sponsors];
  return (
    <div style={{
      background: "linear-gradient(135deg, #080816 0%, #0A0A12 100%)",
      border: "1px solid rgba(0,255,255,0.12)",
      borderRadius: 12,
      padding: "22px 28px",
      marginBottom: 20,
      overflow: "hidden",
      position: "relative",
    }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 60, background: "linear-gradient(to right, #080816, transparent)", zIndex: 2, pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 60, background: "linear-gradient(to left, #080816, transparent)", zIndex: 2, pointerEvents: "none" }} />

      <SectionTitle title="Powered By" subtitle="Official platform sponsors" accent="cyan" />

      <div style={{ overflow: "hidden", position: "relative" }}>
        <motion.div
          style={{ display: "flex", gap: 24, width: "max-content" }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          {doubled.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.06 }}
              style={{
                padding: "10px 20px",
                border: `1px solid ${TIER_COLOR[s.tier]}40`,
                borderRadius: 8,
                background: `${TIER_COLOR[s.tier]}08`,
                cursor: "pointer",
                flexShrink: 0,
                boxShadow: `0 0 12px ${TIER_COLOR[s.tier]}15`,
              }}
            >
              <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.2em", color: TIER_COLOR[s.tier], textTransform: "uppercase", marginBottom: 3, opacity: 0.7 }}>
                {s.tier}
              </div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "white", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                {s.name}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
