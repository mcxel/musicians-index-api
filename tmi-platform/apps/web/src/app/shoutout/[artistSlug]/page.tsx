"use client";
import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ShoutoutPage({ params }: { params: Promise<{ artistSlug: string }> }) {
  const { artistSlug } = use(params);
  const displayName = artistSlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const router = useRouter();

  const [yourName, setYourName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [requestMsg, setRequestMsg] = useState("");

  const canProceed = yourName.trim().length > 0 && requestMsg.trim().length > 0;

  function handleOrder() {
    if (!canProceed) return;
    const qs = new URLSearchParams({
      product: "SHOUTOUT",
      artistSlug,
      yourName: yourName.trim(),
      occasion: occasion.trim(),
      requestMsg: requestMsg.trim(),
    });
    router.push(`/api/stripe/checkout?${qs.toString()}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050510", padding: "60px 20px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link href={`/artists/${artistSlug}`} style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← {displayName}</Link>
          <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: 2, marginTop: 10 }}>REQUEST A SHOUTOUT</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>Get a personal message from {displayName} — delivered within 7 days.</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#AA2DFF", marginTop: 10 }}>$15</div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 24 }}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 8, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 6 }}>YOUR NAME *</label>
            <input type="text" value={yourName} onChange={e => setYourName(e.target.value)} placeholder="What should they call you?"
              style={{ width: "100%", padding: "11px 13px", fontSize: 13, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 7, color: "#fff", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 8, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 6 }}>OCCASION (OPTIONAL)</label>
            <input type="text" value={occasion} onChange={e => setOccasion(e.target.value)} placeholder="e.g. Birthday, Anniversary, Just because..."
              style={{ width: "100%", padding: "11px 13px", fontSize: 13, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 7, color: "#fff", outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", fontSize: 8, letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)", fontWeight: 700, marginBottom: 6 }}>YOUR MESSAGE REQUEST *</label>
            <textarea rows={4} value={requestMsg} onChange={e => setRequestMsg(e.target.value)} placeholder="Tell them what you'd like them to say..."
              style={{ width: "100%", padding: "11px 13px", fontSize: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 7, color: "#fff", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
          </div>
          <button
            onClick={handleOrder}
            disabled={!canProceed}
            style={{ display: "block", width: "100%", textAlign: "center", padding: "13px", fontSize: 11, fontWeight: 800, letterSpacing: "0.15em", color: "#fff", background: canProceed ? "linear-gradient(135deg,#AA2DFF,#FF2DAA)" : "rgba(255,255,255,0.1)", borderRadius: 7, border: "none", cursor: canProceed ? "pointer" : "not-allowed", opacity: canProceed ? 1 : 0.5 }}
          >
            REQUEST SHOUTOUT — $15 →
          </button>
          {!canProceed && (
            <div style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 8 }}>Fill in your name and message to continue</div>
          )}
        </div>
      </div>
    </div>
  );
}
