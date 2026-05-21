"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

const TIP_AMOUNTS = [1, 3, 5, 10, 20, 50];

export default function TipArtistPage() {
  const params = useParams();
  const slug = params && typeof params.artistSlug === "string" ? params.artistSlug : "";
  const displayName = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const [selected, setSelected] = useState<number | null>(5);
  const [custom, setCustom] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const amount = custom ? parseFloat(custom) : selected ?? 0;

  const handleSend = async () => {
    if (!amount || amount < 1) return;
    setSent(true);
  };

  if (sent) {
    return (
      <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>&#128142;</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 10px" }}>Tip Sent!</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 24 }}>${amount.toFixed(2)} sent to {displayName}. Thank you for supporting live music.</p>
          <Link href={`/artists/${slug}`} style={{ padding: "12px 28px", borderRadius: 10, background: "#FF2DAA", color: "#fff", fontWeight: 800, fontSize: 14, textDecoration: "none" }}>Back to {displayName}</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href={`/artists/${slug}`} style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← {displayName}</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FF2DAA", fontWeight: 800, marginBottom: 4 }}>TIP JAR</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 6px" }}>Tip {displayName}</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 32px" }}>Show your support directly to the artist.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
          {TIP_AMOUNTS.map((amt) => (
            <button key={amt} onClick={() => { setSelected(amt); setCustom(""); }}
              style={{ padding: "14px", borderRadius: 10, background: selected === amt && !custom ? "rgba(255,45,170,0.2)" : "rgba(255,255,255,0.04)", border: `1px solid ${selected === amt && !custom ? "#FF2DAA" : "rgba(255,255,255,0.1)"}`, color: selected === amt && !custom ? "#FF2DAA" : "rgba(255,255,255,0.7)", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>
              ${amt}
            </button>
          ))}
        </div>

        <input value={custom} onChange={(e) => { setCustom(e.target.value); setSelected(null); }} type="number" min="1" placeholder="Custom amount ($)" style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 13, outline: "none", marginBottom: 16, boxSizing: "border-box" }} />

        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Add a message (optional)" rows={3} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 13, outline: "none", resize: "none", marginBottom: 20, boxSizing: "border-box" }} />

        <button onClick={handleSend} disabled={!amount || amount < 1}
          style={{ width: "100%", padding: "15px", borderRadius: 12, background: amount >= 1 ? "#FF2DAA" : "rgba(255,255,255,0.1)", color: amount >= 1 ? "#fff" : "rgba(255,255,255,0.3)", fontWeight: 900, fontSize: 15, cursor: amount >= 1 ? "pointer" : "not-allowed", border: "none" }}>
          Send ${amount > 0 ? amount.toFixed(2) : "0.00"} Tip →
        </button>
      </div>
    </main>
  );
}
