"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";

const TABS = ["DROPS", "AUCTIONS", "RESALE", "TOP SELLERS", "RECENT SALES", "ROYALTIES"] as const;
type Tab = typeof TABS[number];

const MOCK_DROPS = [
  { title: "Gregory Marcel Champion Drop", artist: "GM Official", type: "Champion NFT", price: "$299", endsIn: "2h 14m", img: "🏆", limited: true },
  { title: "Cypher Proof — Round 44", artist: "Julius", type: "Battle Proof", price: "$49", endsIn: "5h 02m", img: "⚔️", limited: false },
  { title: "Dirty Dozens Season 3 Pack", artist: "Platform", type: "Fan Pack", price: "$89", endsIn: "23h 00m", img: "🎁", limited: true },
  { title: "Monday Stage Live Clip", artist: "TMI Studio", type: "Cypher Clip", price: "$19", endsIn: "47h 30m", img: "🎬", limited: false },
  { title: "Beat Lab Pro Template", artist: "Beat Bots", type: "Beat NFT", price: "$35", endsIn: "72h", img: "🥁", limited: false },
  { title: "VIP Room Pass - Dec", artist: "Platform", type: "Room Pass", price: "$199", endsIn: "96h", img: "🔑", limited: true },
];

const MOCK_AUCTIONS = [
  { title: "Crown Card #001", currentBid: "$888", bids: 14, artist: "Gregory Marcel", endsIn: "4h 22m" },
  { title: "Cypher Legend Fragment", currentBid: "$440", bids: 9, artist: "Julius", endsIn: "11h" },
  { title: "Monthly Idol Trophy NFT", currentBid: "$650", bids: 22, artist: "Platform Vault", endsIn: "1h 55m" },
];

export default function TheEndPage() {
  const [tab, setTab] = useState<Tab>("DROPS");

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

          {/* Header */}
          <div style={{ padding: "40px 32px 0", borderBottom: "1px solid rgba(255,215,0,0.15)" }}>
            <div style={{ fontSize: 9, letterSpacing: 5, color: "#FFD700", fontWeight: 800, marginBottom: 6 }}>UNIFIED MARKETPLACE</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, letterSpacing: 4, margin: 0, lineHeight: 1 }}>
                  THE END
                </h1>
                <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                  Drops. Auctions. Resales. Royalties. The final frontier of the platform economy.
                </p>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                <Link href="/nft-lab/create" style={{
                  display: "inline-block", padding: "10px 22px", borderRadius: 8,
                  border: "1px solid rgba(255,215,0,0.4)", color: "#FFD700", fontWeight: 800,
                  fontSize: 11, letterSpacing: 2, textDecoration: "none",
                }}>SELL</Link>
                <Link href="/the-end/drops" style={{
                  display: "inline-block", padding: "10px 22px", borderRadius: 8,
                  background: "linear-gradient(135deg, #FFD700, #FF9500)",
                  color: "#050510", fontWeight: 800, fontSize: 11, letterSpacing: 2,
                  textDecoration: "none",
                }}>BROWSE ALL</Link>
              </div>
            </div>

            {/* Market stats */}
            <div style={{ display: "flex", gap: 32, paddingBottom: 20 }}>
              {[
                { label: "LIVE DROPS", val: "6", col: "#00FFFF" },
                { label: "ACTIVE AUCTIONS", val: "3", col: "#FF2DAA" },
                { label: "TOTAL VOLUME", val: "$48,200", col: "#FFD700" },
                { label: "RESALE ROYALTIES", val: "10%", col: "#AA2DFF" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.col }}>{s.val}</div>
                  <div style={{ fontSize: 8, letterSpacing: 3, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, padding: "0 32px", borderBottom: "1px solid rgba(255,215,0,0.1)", overflowX: "auto" }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "16px 20px", border: "none", cursor: "pointer",
                background: "transparent",
                borderBottom: tab === t ? "2px solid #FFD700" : "2px solid transparent",
                color: tab === t ? "#FFD700" : "#666",
                fontSize: 10, fontWeight: 800, letterSpacing: 2, whiteSpace: "nowrap",
              }}>{t}</button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ padding: "28px 32px" }}>
            <AnimatePresence mode="wait">
              {tab === "DROPS" && (
                <motion.div key="drops" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
                    {MOCK_DROPS.map(drop => (
                      <div key={drop.title} style={{
                        background: "rgba(255,215,0,0.04)", border: "1px solid rgba(255,215,0,0.15)",
                        borderRadius: 12, padding: 20, position: "relative",
                      }}>
                        {drop.limited && (
                          <div style={{
                            position: "absolute", top: 12, right: 12,
                            background: "rgba(255,45,170,0.2)", border: "1px solid #FF2DAA",
                            borderRadius: 20, padding: "3px 10px", fontSize: 8, color: "#FF2DAA", fontWeight: 800, letterSpacing: 2,
                          }}>LIMITED</div>
                        )}
                        <div style={{ fontSize: 40, marginBottom: 12 }}>{drop.img}</div>
                        <div style={{ fontSize: 8, letterSpacing: 3, color: "#888", marginBottom: 4 }}>{drop.type}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{drop.title}</div>
                        <div style={{ fontSize: 11, color: "#666", marginBottom: 14 }}>by {drop.artist}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontSize: 20, fontWeight: 900, color: "#FFD700" }}>{drop.price}</div>
                          <div style={{ fontSize: 10, color: "#FF2DAA" }}>⏱ {drop.endsIn}</div>
                        </div>
                        <motion.button whileTap={{ scale: 0.97 }} style={{
                          marginTop: 12, width: "100%", padding: "10px 0", borderRadius: 8,
                          background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)",
                          color: "#FFD700", fontWeight: 700, fontSize: 11, letterSpacing: 2, cursor: "pointer",
                        }}>BUY NOW</motion.button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === "AUCTIONS" && (
                <motion.div key="auctions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 700 }}>
                    {MOCK_AUCTIONS.map(a => (
                      <div key={a.title} style={{
                        background: "rgba(255,45,170,0.04)", border: "1px solid rgba(255,45,170,0.15)",
                        borderRadius: 12, padding: "20px 24px",
                        display: "flex", alignItems: "center", gap: 24,
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{a.title}</div>
                          <div style={{ fontSize: 11, color: "#888" }}>by {a.artist}</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 22, fontWeight: 900, color: "#FF2DAA" }}>{a.currentBid}</div>
                          <div style={{ fontSize: 9, color: "#666", letterSpacing: 2 }}>{a.bids} BIDS</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 11, color: "#FF2DAA", marginBottom: 8 }}>⏱ {a.endsIn}</div>
                          <button style={{
                            padding: "8px 20px", borderRadius: 20,
                            background: "rgba(255,45,170,0.15)", border: "1px solid #FF2DAA",
                            color: "#FF2DAA", fontWeight: 700, fontSize: 10, cursor: "pointer",
                          }}>BID</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {(tab === "RESALE" || tab === "TOP SELLERS" || tab === "RECENT SALES" || tab === "ROYALTIES") && (
                <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{
                    padding: 40, textAlign: "center",
                    background: "rgba(255,215,0,0.03)", border: "1px solid rgba(255,215,0,0.1)", borderRadius: 12,
                  }}>
                    <div style={{ fontSize: 40, marginBottom: 16 }}>🔜</div>
                    <div style={{ fontSize: 14, color: "#888" }}>{tab} data loading…</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
