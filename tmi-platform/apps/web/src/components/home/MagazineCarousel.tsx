"use client";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";

const ISSUES = [
  { issue: "Vol.14", theme: "Crown Season", color: "#FF2DAA", sub: "The Rise of Independent Artists", tag: "FEATURED" },
  { issue: "Vol.13", theme: "Frequency", color: "#00FFFF", sub: "New Sounds, New Directions", tag: "TRENDING" },
  { issue: "Vol.12", theme: "Night Sessions", color: "#AA2DFF", sub: "Late Night Studio Culture", tag: null },
  { issue: "Vol.11", theme: "Undiscovered", color: "#FFD700", sub: "Emerging Talent Spotlight", tag: null },
  { issue: "Vol.10", theme: "Legacy Code", color: "#00FF99", sub: "Hip-Hop Then & Now", tag: null },
];

export default function MagazineCarousel() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0A0A12 0%, #0D0D1C 100%)",
      border: "1px solid rgba(170,45,255,0.2)",
      borderRadius: 12, padding: "24px",
      boxShadow: "0 0 30px rgba(170,45,255,0.05)",
    }}>
      <SectionTitle title="Magazine Issues" accent="purple" badge="Latest" />
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
        {ISSUES.map((issue, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -6, scale: 1.03 }}
            transition={{ duration: 0.2 }}
            style={{
              flexShrink: 0, width: 130, borderRadius: 10, overflow: "hidden",
              background: `linear-gradient(160deg, ${issue.color}18 0%, #0A0A12 60%)`,
              border: `1px solid ${issue.color}30`,
              cursor: "pointer",
            }}
          >
            {/* Cover art placeholder */}
            <div style={{
              height: 170, background: `linear-gradient(145deg, ${issue.color}22, #000)`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              position: "relative", padding: 12,
            }}>
              {issue.tag && (
                <div style={{
                  position: "absolute", top: 8, right: 8,
                  fontSize: 7, fontWeight: 800, letterSpacing: "0.15em",
                  background: issue.color, color: "#000",
                  padding: "2px 6px", borderRadius: 3,
                }}>
                  {issue.tag}
                </div>
              )}
              <div style={{ fontSize: 10, color: issue.color, fontWeight: 700, letterSpacing: "0.15em", textAlign: "center", marginBottom: 6 }}>{issue.issue}</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: "white", textAlign: "center", lineHeight: 1.2 }}>{issue.theme}</div>
            </div>
            <div style={{ padding: "10px 12px" }}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{issue.sub}</div>
              <Link href="/magazine" style={{ display: "block", marginTop: 8, fontSize: 9, color: issue.color, textDecoration: "none", fontWeight: 600 }}>
                Read Issue →
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
