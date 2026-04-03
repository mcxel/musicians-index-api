"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import PageShell from "@/components/layout/PageShell";
import HUDFrame from "@/components/hud/HUDFrame";
import FooterHUD from "@/components/hud/FooterHUD";
import Link from "next/link";

const SECTIONS = [
  { label: "DROPS", href: "/nft-lab/drops", icon: "💧", desc: "Time-limited NFT drops with countdown timers", color: "#00FFFF" },
  { label: "CREATE", href: "/nft-lab/create", icon: "🎨", desc: "Mint original art, audio, video, collectibles", color: "#FF2DAA" },
  { label: "TEMPLATES", href: "/nft-lab/templates", icon: "🗂️", desc: "NFT starter kits: artist card, battle proof, fan pack", color: "#AA2DFF" },
  { label: "MY NFTS", href: "/nft-lab/my-nfts", icon: "🖼️", desc: "Your minted and owned NFT collection", color: "#FFD700" },
  { label: "LEARN", href: "/nft-lab/learn", icon: "🎓", desc: "NFT creation school: metadata, royalties, gas, drops", color: "#FF9500" },
  { label: "MINT", href: "/nft-lab/mint", icon: "⚙️", desc: "Direct mint flow for verified creators", color: "#00FF88" },
  { label: "PUBLISH", href: "/nft-lab/publish", icon: "🚀", desc: "Push to THE END marketplace + external chains", color: "#00FFFF" },
  { label: "RESALES", href: "/nft-lab/resales", icon: "♻️", desc: "Track resale royalties on secondary market", color: "#FF2DAA" },
];

const NFT_TYPES = [
  { name: "Artist Card", icon: "🎤", count: 125 },
  { name: "Battle Proof", icon: "⚔️", count: 89 },
  { name: "Fan Pack", icon: "🎁", count: 203 },
  { name: "Audio NFT", icon: "🎵", count: 67 },
  { name: "Beat NFT", icon: "🥁", count: 44 },
  { name: "Cypher Clip", icon: "🎬", count: 31 },
  { name: "Event Ticket", icon: "🎟️", count: 512 },
  { name: "Champion NFT", icon: "🏆", count: 18 },
  { name: "Sponsor NFT", icon: "🏟️", count: 7 },
  { name: "Room Pass", icon: "🔑", count: 92 },
  { name: "Avatar Skin", icon: "👤", count: 156 },
  { name: "Prop NFT", icon: "🎩", count: 78 },
];

export default function NftLabPage() {
  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

          {/* Header */}
          <div style={{ padding: "40px 32px 0", borderBottom: "1px solid rgba(0,255,255,0.2)" }}>
            <div style={{ fontSize: 9, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 6 }}>DIGITAL OWNERSHIP ENGINE</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 20, marginBottom: 28 }}>
              <div>
                <h1 style={{ fontSize: "clamp(32px,5vw,56px)", fontWeight: 900, letterSpacing: 4, margin: 0, lineHeight: 1 }}>
                  NFT LAB
                </h1>
                <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                  Mint → List → Sell → Collect royalties on every resale. Forever.
                </p>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <Link href="/nft-lab/create" style={{
                  display: "inline-block", padding: "12px 28px", borderRadius: 8,
                  background: "linear-gradient(135deg, #00FFFF, #AA2DFF)",
                  color: "#050510", fontWeight: 800, fontSize: 12, letterSpacing: 2,
                  textDecoration: "none",
                }}>
                  + MINT NFT
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 32, paddingBottom: 20 }}>
              {[
                { label: "NFT TYPES", val: "12", col: "#00FFFF" },
                { label: "YOUR NFTS", val: "0", col: "#AA2DFF" },
                { label: "FLOOR PRICE", val: "—", col: "#FFD700" },
                { label: "ROYALTY EARNED", val: "$0", col: "#FF2DAA" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.col }}>{s.val}</div>
                  <div style={{ fontSize: 8, letterSpacing: 3, color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div style={{ padding: "32px 32px 0" }}>
            <div style={{ fontSize: 9, letterSpacing: 4, color: "#00FFFF", fontWeight: 800, marginBottom: 20 }}>NFT LAB SECTIONS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
              {SECTIONS.map(sec => (
                <motion.div key={sec.label} whileHover={{ y: -3, scale: 1.01 }}>
                  <Link href={sec.href} style={{ textDecoration: "none" }}>
                    <div style={{
                      background: `${sec.color}08`, border: `1px solid ${sec.color}25`,
                      borderRadius: 12, padding: "20px", transition: "border-color 0.2s",
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

          {/* NFT Type Index */}
          <div style={{ padding: "32px 32px 0" }}>
            <div style={{ fontSize: 9, letterSpacing: 4, color: "#AA2DFF", fontWeight: 800, marginBottom: 16 }}>12 NFT TYPES ON THIS PLATFORM</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
              {NFT_TYPES.map(t => (
                <div key={t.name} style={{
                  padding: "12px 14px", borderRadius: 10,
                  background: "rgba(170,45,255,0.06)", border: "1px solid rgba(170,45,255,0.15)",
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{t.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{t.name}</div>
                  <div style={{ fontSize: 10, color: "#AA2DFF" }}>{t.count.toLocaleString()} minted</div>
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
