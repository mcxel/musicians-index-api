"use client";
import { motion } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";

const DEPARTMENTS = [
  {
    label: "BEAT PRODUCTION", href: "/academy/beats", icon: "🥁", color: "#FF2DAA",
    desc: "Learn to build beats: drums, samples, BPM theory, mastering, licensing",
    modules: 12, bots: ["Beat Teacher Bot", "Sample Bot", "Drum Kit Bot"],
  },
  {
    label: "NFT CREATION", href: "/academy/nfts", icon: "🖼️", color: "#00FFFF",
    desc: "Metadata, royalty splits, drop mechanics, wallets, gas fees",
    modules: 9, bots: ["NFT Guide Bot", "Metadata Bot", "Royalty Bot"],
  },
  {
    label: "ARTICLE WRITING", href: "/academy/articles", icon: "✍️", color: "#AA2DFF",
    desc: "Write music journalism, interviews, reviews, editorial strategy",
    modules: 8, bots: ["Writer Bot", "SEO Bot", "Editorial Bot"],
  },
  {
    label: "SPONSORSHIP 101", href: "/academy/sponsors", icon: "🏟️", color: "#FFD700",
    desc: "How to structure sponsor decks, negotiations, ROI tracking",
    modules: 6, bots: ["Sponsor Bot", "Pricing Bot"],
  },
];

export default function AcademyPage() {
  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

          {/* Header */}
          <div style={{ padding: "40px 32px 0", borderBottom: "1px solid rgba(255,215,0,0.1)" }}>
            <div style={{ fontSize: 9, letterSpacing: 5, color: "#FFD700", fontWeight: 800, marginBottom: 6 }}>EDUCATION HUB</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, letterSpacing: 4, margin: 0, lineHeight: 1 }}>
                  ACADEMY
                </h1>
                <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                  Bot-led courses, templates, and tutorials. Learn to create, earn, and grow.
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 32, paddingBottom: 20 }}>
              {[
                { label: "COURSES", val: "35", col: "#FFD700" },
                { label: "STUDENT BOTS", val: "4+", col: "#FF2DAA" },
                { label: "ENROLLED", val: "0", col: "#00FFFF" },
                { label: "COMPLETED", val: "0", col: "#AA2DFF" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.col }}>{s.val}</div>
                  <div style={{ fontSize: 8, letterSpacing: 3, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Departments */}
          <div style={{ padding: "32px" }}>
            <div style={{ fontSize: 9, letterSpacing: 4, color: "#FFD700", fontWeight: 800, marginBottom: 24 }}>DEPARTMENTS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {DEPARTMENTS.map((dept, i) => (
                <motion.div key={dept.label}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={dept.href} style={{ textDecoration: "none" }}>
                    <div style={{
                      background: `${dept.color}07`, border: `1px solid ${dept.color}22`,
                      borderRadius: 16, padding: "28px 24px",
                    }}>
                      <div style={{ fontSize: 40, marginBottom: 14 }}>{dept.icon}</div>
                      <div style={{ fontSize: 10, letterSpacing: 3, fontWeight: 800, color: dept.color, marginBottom: 8 }}>{dept.label}</div>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: 16 }}>{dept.desc}</p>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <span style={{ fontSize: 10, color: "#888" }}>{dept.modules} modules</span>
                        <span style={{ fontSize: 10, color: dept.color, fontWeight: 700 }}>{dept.bots.length} bots</span>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {dept.bots.map(b => (
                          <div key={b} style={{
                            padding: "3px 10px", borderRadius: 20,
                            background: `${dept.color}12`, border: `1px solid ${dept.color}25`,
                            fontSize: 9, color: dept.color, fontWeight: 600,
                          }}>{b}</div>
                        ))}
                      </div>

                      <div style={{
                        marginTop: 18, padding: "9px 0", borderRadius: 25,
                        background: `${dept.color}12`, border: `1px solid ${dept.color}30`,
                        color: dept.color, fontSize: 10, fontWeight: 800, letterSpacing: 2, textAlign: "center",
                      }}>ENTER DEPARTMENT →</div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
