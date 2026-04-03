"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";

const SECTIONS = [
  { label: "LEARN", href: "/beat-lab/learn", icon: "🎓", desc: "Beat-making tutorials, guided lessons, bot-led demos", color: "#00FFFF" },
  { label: "TEMPLATES", href: "/beat-lab/templates", icon: "🗂️", desc: "Trap, Boom Bap, Lo-Fi, R&B, EDM starter kits", color: "#AA2DFF" },
  { label: "CREATE", href: "/beat-lab/create", icon: "🎹", desc: "Beat forge, sample library, drum kits, loop packs", color: "#FF2DAA" },
  { label: "LIBRARY", href: "/beat-lab/library", icon: "🏪", desc: "Your saved beats, uploaded samples, loop collection", color: "#FFD700" },
  { label: "PUBLISH", href: "/beat-lab/publish", icon: "🚀", desc: "Set price, rights, royalty splits — push to marketplace", color: "#FF9500" },
  { label: "MY BEATS", href: "/beat-lab/my-beats", icon: "🎵", desc: "All your published beats and stats", color: "#00FFFF" },
  { label: "SALES", href: "/beat-lab/sales", icon: "💰", desc: "Revenue, licenses, downloads, and royalties", color: "#AA2DFF" },
  { label: "RESALES", href: "/beat-lab/resales", icon: "♻️", desc: "Track resale royalties and ownership chain", color: "#FF2DAA" },
];

const BOT_TEAM = [
  { name: "Beat Teacher", icon: "🎓", status: "ACTIVE" },
  { name: "Sample Bot", icon: "🎼", status: "ACTIVE" },
  { name: "Drum Kit Bot", icon: "🥁", status: "ACTIVE" },
  { name: "Mix Bot", icon: "🎚️", status: "IDLE" },
  { name: "Master Bot", icon: "🔊", status: "IDLE" },
  { name: "Pricing Bot", icon: "💲", status: "ACTIVE" },
  { name: "Sales Bot", icon: "📈", status: "ACTIVE" },
  { name: "Resale Bot", icon: "♻️", status: "IDLE" },
  { name: "Copyright Bot", icon: "©️", status: "ACTIVE" },
  { name: "Beat Sentinel", icon: "🛡️", status: "ACTIVE" },
];

export default function BeatLabPage() {
  const [hoveredBot, setHoveredBot] = useState<string | null>(null);
  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

          {/* Header */}
          <div style={{ padding: "40px 32px 0", borderBottom: "1px solid rgba(255,45,170,0.2)" }}>
            <div style={{ fontSize: 9, letterSpacing: 5, color: "#FF2DAA", fontWeight: 800, marginBottom: 6 }}>PRODUCTION ECOSYSTEM</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, letterSpacing: 4, margin: 0, lineHeight: 1 }}>
                  BEAT LAB
                </h1>
                <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                  Create → Sell → Resell. Every beat you make has a life and a royalty chain.
                </p>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <Link href="/beat-lab/create" style={{
                  display: "inline-block", padding: "12px 28px", borderRadius: 8,
                  background: "linear-gradient(135deg, #FF2DAA, #AA2DFF)",
                  color: "#fff", fontWeight: 800, fontSize: 12, letterSpacing: 2,
                  textDecoration: "none",
                }}>
                  + CREATE BEAT
                </Link>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: "flex", gap: 32, paddingBottom: 20, borderBottom: "1px solid rgba(255,45,170,0.1)" }}>
              {[
                { label: "TEMPLATES", val: "9", col: "#FF2DAA" },
                { label: "YOUR BEATS", val: "0", col: "#AA2DFF" },
                { label: "TOTAL SALES", val: "$0", col: "#FFD700" },
                { label: "RESALE ROYALTIES", val: "$0", col: "#00FFFF" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.col }}>{s.val}</div>
                  <div style={{ fontSize: 8, letterSpacing: 3, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section grid */}
          <div style={{ padding: "32px 32px 0" }}>
            <div style={{ fontSize: 9, letterSpacing: 4, color: "#FF2DAA", fontWeight: 800, marginBottom: 20 }}>BEAT LAB SECTIONS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {SECTIONS.map(sec => (
                <motion.div key={sec.label} whileHover={{ y: -3, scale: 1.01 }}>
                  <Link href={sec.href} style={{ textDecoration: "none" }}>
                    <div style={{
                      background: `${sec.color}08`, border: `1px solid ${sec.color}25`,
                      borderRadius: 12, padding: "20px 20px",
                      transition: "border-color 0.2s",
                    }}>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{sec.icon}</div>
                      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 3, color: sec.color, marginBottom: 6 }}>{sec.label}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{sec.desc}</div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bot Team */}
          <div style={{ padding: "32px 32px 0" }}>
            <div style={{ fontSize: 9, letterSpacing: 4, color: "#AA2DFF", fontWeight: 800, marginBottom: 16 }}>BEAT LAB BOT TEAM</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {BOT_TEAM.map(bot => (
                <motion.div
                  key={bot.name}
                  onHoverStart={() => setHoveredBot(bot.name)}
                  onHoverEnd={() => setHoveredBot(null)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 14px", borderRadius: 20,
                    background: hoveredBot === bot.name ? "rgba(255,45,170,0.12)" : "rgba(255,45,170,0.05)",
                    border: `1px solid ${bot.status === "ACTIVE" ? "rgba(255,45,170,0.3)" : "rgba(255,255,255,0.1)"}`,
                    cursor: "default",
                  }}
                >
                  <span>{bot.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: bot.status === "ACTIVE" ? "#fff" : "#666" }}>{bot.name}</span>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: bot.status === "ACTIVE" ? "#00FF88" : "#444",
                  }} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Beat Creation Flow */}
          <div style={{ padding: "32px 32px 0" }}>
            <div style={{ fontSize: 9, letterSpacing: 4, color: "#FFD700", fontWeight: 800, marginBottom: 16 }}>BEAT CREATION PIPELINE</div>
            <div style={{ display: "flex", gap: 0, overflowX: "auto", paddingBottom: 8 }}>
              {["Choose Samples", "Build Beat", "Preview", "Auto Mix", "Auto Master", "Set Price", "Publish", "Track Royalties"].map((step, i, arr) => (
                <div key={step} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <div style={{
                    padding: "8px 16px", borderRadius: 20,
                    background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)",
                    fontSize: 11, fontWeight: 600, color: "#FFD700", whiteSpace: "nowrap",
                  }}>{step}</div>
                  {i < arr.length - 1 && <div style={{ padding: "0 8px", color: "#333", fontSize: 14 }}>→</div>}
                </div>
              ))}
            </div>
          </div>

        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
