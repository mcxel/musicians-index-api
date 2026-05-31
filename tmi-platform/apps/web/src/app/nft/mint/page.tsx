"use client";

import { useState } from "react";
import Link from "next/link";

const TEMPLATES = [
  { id: "beat",       label: "Beat NFT",         emoji: "🎵", desc: "Mint your original beat as a collectible",   price: "0.05 ETH" },
  { id: "artwork",    label: "Cover Art NFT",     emoji: "🎨", desc: "Turn your artwork into a tradeable asset",   price: "0.03 ETH" },
  { id: "moment",     label: "Live Moment NFT",   emoji: "🔴", desc: "Mint a clip from your live performance",    price: "0.08 ETH" },
  { id: "exclusive",  label: "Exclusive Access",  emoji: "💎", desc: "Fan-pass NFT with backstage perks",         price: "0.15 ETH" },
];

export default function NftMintPage() {
  const [template, setTemplate] = useState("beat");
  const [name, setName]         = useState("");
  const [desc, setDesc]         = useState("");
  const [edition, setEdition]   = useState("10");
  const [minted, setMinted]     = useState(false);

  const chosen = TEMPLATES.find((t) => t.id === template)!;

  if (minted) {
    return (
      <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: "#FFD700" }}>NFT Minted!</h2>
          <p style={{ margin: "0 0 8px", color: "rgba(255,255,255,0.5)", fontSize: 14 }}>"{name}" is now on the blockchain.</p>
          <p style={{ margin: "0 0 24px", color: "rgba(255,255,255,0.3)", fontSize: 12 }}>Edition of {edition} · {chosen.price} each</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/nft" style={{ padding: "11px 24px", borderRadius: 8, background: "rgba(255,215,0,0.12)", border: "1px solid rgba(255,215,0,0.35)", color: "#FFD700", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>VIEW NFT VAULT</Link>
            <Link href="/nft/mint" onClick={() => { setName(""); setDesc(""); setMinted(false); }} style={{ padding: "11px 24px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 800, textDecoration: "none" }}>MINT ANOTHER</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ background: "rgba(0,0,0,0.7)", borderBottom: "1px solid rgba(255,215,0,0.18)", padding: "12px 24px", display: "flex", gap: 20, alignItems: "center" }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: "#FFD700", textDecoration: "none", letterSpacing: "0.12em" }}>TMI</Link>
        <Link href="/nft" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>NFT Studio</Link>
        <span style={{ fontSize: 11, color: "#FFD700", fontWeight: 700 }}>Mint</span>
      </nav>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FFD700", fontWeight: 800, marginBottom: 6 }}>NFT STUDIO · BLOCKCHAIN</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900 }}>Mint Your NFT</h1>
        </div>

        {/* Type selector */}
        <section style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 12 }}>NFT TYPE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => setTemplate(t.id)} style={{
                padding: "14px", borderRadius: 10, cursor: "pointer", border: "none", textAlign: "left",
                background: template === t.id ? "rgba(255,215,0,0.1)" : "rgba(255,255,255,0.03)",
                outline: template === t.id ? "1.5px solid rgba(255,215,0,0.45)" : "1px solid rgba(255,255,255,0.07)",
                color: "#fff",
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{t.emoji}</div>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 2 }}>{t.label}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{t.desc}</div>
                <div style={{ fontSize: 10, color: "#FFD700", fontWeight: 700 }}>{t.price}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Upload area */}
        <div style={{ width: "100%", height: 110, borderRadius: 12, background: "rgba(255,215,0,0.04)", border: "2px dashed rgba(255,215,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, cursor: "pointer", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 28 }}>{chosen.emoji}</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em" }}>UPLOAD FILE · DRAG &amp; DROP</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>MP3, WAV, JPG, PNG, MP4 accepted</span>
        </div>

        {/* Fields */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 6 }}>NFT NAME</label>
          <input type="text" placeholder={`My ${chosen.label}...`} value={name} onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: "11px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: "block", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 6 }}>DESCRIPTION</label>
          <textarea rows={3} placeholder="Describe this NFT..." value={desc} onChange={(e) => setDesc(e.target.value)}
            style={{ width: "100%", padding: "11px 16px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 9, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", fontWeight: 800, marginBottom: 6 }}>EDITION SIZE</label>
          <div style={{ display: "flex", gap: 8 }}>
            {["1","5","10","25","100"].map((n) => (
              <button key={n} onClick={() => setEdition(n)} style={{
                padding: "8px 16px", borderRadius: 6, fontSize: 12, fontWeight: 800, cursor: "pointer", border: "none",
                background: edition === n ? "rgba(255,215,0,0.15)" : "rgba(255,255,255,0.04)",
                outline: edition === n ? "1.5px solid rgba(255,215,0,0.45)" : "1px solid rgba(255,255,255,0.08)",
                color: edition === n ? "#FFD700" : "rgba(255,255,255,0.5)",
              }}>{n === "1" ? "1/1" : `${n} pcs`}</button>
            ))}
          </div>
        </div>

        {/* Cost breakdown */}
        <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.2)", marginBottom: 20, fontSize: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>Mint price per NFT</span>
            <span style={{ color: "#FFD700", fontWeight: 700 }}>{chosen.price}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>Edition size</span>
            <span style={{ fontWeight: 700 }}>{edition}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontWeight: 800 }}>Platform fee</span>
            <span style={{ color: "rgba(255,255,255,0.4)" }}>2.5%</span>
          </div>
        </div>

        <button onClick={() => name && setMinted(true)} disabled={!name}
          style={{
            width: "100%", padding: "15px", borderRadius: 12, fontSize: 14, fontWeight: 900, letterSpacing: "0.1em", border: "none",
            cursor: name ? "pointer" : "not-allowed",
            background: name ? "linear-gradient(135deg, #FFD700, #FF2DAA)" : "rgba(255,255,255,0.06)",
            color: name ? "#050510" : "rgba(255,255,255,0.2)",
          }}>
          🎨 MINT TO BLOCKCHAIN
        </button>
      </div>
    </main>
  );
}
