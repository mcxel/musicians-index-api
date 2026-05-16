"use client";

import { useState } from "react";
import Link from "next/link";

type Step = "select" | "price" | "confirm" | "done";

export default function NftPublishPage() {
  const [step, setStep] = useState<Step>("select");
  const [selected, setSelected] = useState<string | null>(null);
  const [price, setPrice] = useState("9.99");
  const [royalty, setRoyalty] = useState("10");

  const DEMO_NFTS = [
    { id: "nft-001", name: "Season 1 Champion NFT", icon: "🏆" },
    { id: "nft-003", name: "The End — VIP Access",   icon: "🎟️" },
  ];

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "32px 24px" }}>
        <Link href="/nft-lab" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← NFT Lab</Link>
        <div style={{ marginTop: 20, fontSize: 9, letterSpacing: "0.4em", color: "#00FFFF", fontWeight: 800, marginBottom: 8 }}>PUBLISH TO MARKETPLACE</div>
        <h1 style={{ fontSize: "clamp(1.4rem,3.5vw,2rem)", fontWeight: 900, marginBottom: 6 }}>Publish NFT</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>List your NFT on THE END marketplace. Set price and royalty.</p>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 0, marginBottom: 32, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
          {(["select", "price", "confirm", "done"] as Step[]).map((s, i) => (
            <div key={s} style={{ flex: 1, padding: "8px 0", textAlign: "center", fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", background: step === s ? "rgba(0,255,255,0.12)" : "rgba(255,255,255,0.02)", color: step === s ? "#00FFFF" : "rgba(255,255,255,0.25)", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              {(i + 1)}. {s.toUpperCase()}
            </div>
          ))}
        </div>

        {step === "select" && (
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 12 }}>SELECT NFT TO LIST</div>
            <div style={{ display: "grid", gap: 10, marginBottom: 24 }}>
              {DEMO_NFTS.map(nft => (
                <button key={nft.id} onClick={() => setSelected(nft.id)} style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 16px", background: selected === nft.id ? "rgba(0,255,255,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${selected === nft.id ? "rgba(0,255,255,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 28 }}>{nft.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{nft.name}</span>
                </button>
              ))}
            </div>
            <button onClick={() => selected && setStep("price")} disabled={!selected} style={{ width: "100%", padding: "12px", fontSize: 10, fontWeight: 800, color: "#050510", background: selected ? "#00FFFF" : "rgba(255,255,255,0.06)", border: "none", borderRadius: 8, cursor: selected ? "pointer" : "not-allowed" }}>NEXT — SET PRICE</button>
          </div>
        )}

        {step === "price" && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 8 }}>LISTING PRICE (USD)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "rgba(255,255,255,0.3)" }}>$</span>
                <input value={price} onChange={e => setPrice(e.target.value)} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", padding: "12px 14px", fontSize: 18, fontWeight: 700 }} />
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 8 }}>ROYALTY ON RESALE (%)</label>
              <input value={royalty} onChange={e => setRoyalty(e.target.value)} type="number" min="5" max="30" style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#fff", padding: "12px 14px", fontSize: 16, boxSizing: "border-box" }} />
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>Minimum 5%. You earn {royalty}% every time this sells on secondary.</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep("select")} style={{ flex: 1, padding: "12px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, cursor: "pointer" }}>BACK</button>
              <button onClick={() => setStep("confirm")} style={{ flex: 2, padding: "12px", fontSize: 10, fontWeight: 800, color: "#050510", background: "#00FFFF", border: "none", borderRadius: 8, cursor: "pointer" }}>REVIEW LISTING</button>
            </div>
          </div>
        )}

        {step === "confirm" && (
          <div>
            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "20px", marginBottom: 24 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 14 }}>LISTING SUMMARY</div>
              {[
                ["NFT", DEMO_NFTS.find(n => n.id === selected)?.name ?? "—"],
                ["Price", `$${price}`],
                ["Royalty", `${royalty}%`],
                ["Platform fee", "5%"],
                ["You receive", `$${(parseFloat(price) * 0.95).toFixed(2)}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{k}</span>
                  <span style={{ fontSize: 10, fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setStep("price")} style={{ flex: 1, padding: "12px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, cursor: "pointer" }}>BACK</button>
              <button onClick={() => setStep("done")} style={{ flex: 2, padding: "12px", fontSize: 10, fontWeight: 800, color: "#050510", background: "linear-gradient(135deg,#00FFFF,#AA2DFF)", border: "none", borderRadius: 8, cursor: "pointer" }}>PUBLISH TO THE END</button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🚀</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#00FF88", marginBottom: 8 }}>NFT Published</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>Your NFT is now listed on THE END marketplace for ${price}.</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <Link href="/nft-marketplace" style={{ padding: "11px 22px", fontSize: 10, fontWeight: 800, color: "#050510", background: "#00FF88", borderRadius: 8, textDecoration: "none" }}>VIEW LISTING</Link>
              <Link href="/nft-lab" style={{ padding: "11px 22px", fontSize: 10, fontWeight: 800, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 8, textDecoration: "none" }}>NFT LAB</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
