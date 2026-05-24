'use client';
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const LICENSE_TIERS = [
  { id: "basic",     label: "Basic License",   price: 29.99,  uses: "Non-commercial, streaming only",          limit: "500k streams" },
  { id: "premium",   label: "Premium License", price: 79.99,  uses: "Commercial, all platforms",               limit: "Unlimited" },
  { id: "exclusive", label: "Exclusive",        price: 499.00, uses: "Full ownership, beat removed from store", limit: "Yours forever" },
];

export default function BeatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawSlug = params?.slug;
  const slug = typeof rawSlug === 'string' ? rawSlug : Array.isArray(rawSlug) ? rawSlug[0] : '';
  const title = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const [previewing, setPreviewing] = useState(false);

  function buyTier(tier: typeof LICENSE_TIERS[0]) {
    router.push(`/api/stripe/checkout?priceId=price_beat_${tier.id}&mode=payment&name=${encodeURIComponent(title + ' - ' + tier.label)}`);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/beats" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Beat Marketplace</Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 32 }}>
          <div>
            <div style={{ width: "100%", aspectRatio: "1", background: previewing ? "linear-gradient(135deg, rgba(170,45,255,0.35), rgba(255,45,170,0.2))" : "linear-gradient(135deg, rgba(170,45,255,0.2), rgba(255,45,170,0.1))", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, marginBottom: 20, transition: "background 0.3s" }}>
              {previewing ? "⏸" : "🎶"}
            </div>
            <button
              onClick={() => setPreviewing(p => !p)}
              style={{ width: "100%", padding: "14px", borderRadius: 10, background: previewing ? "rgba(170,45,255,0.3)" : "rgba(170,45,255,0.15)", border: "1px solid rgba(170,45,255,0.3)", color: "#AA2DFF", fontWeight: 800, fontSize: 14, cursor: "pointer" }}
            >
              {previewing ? "⏸ Pause Preview" : "▶ Preview Beat"}
            </button>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#AA2DFF", fontWeight: 800, marginBottom: 8 }}>BEAT</div>
            <h1 style={{ fontSize: "clamp(20px,3vw,32px)", fontWeight: 900, margin: "0 0 8px" }}>{title}</h1>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 24 }}>by Mako Beats · Trap · 140 BPM · Key: Am</div>
            <div style={{ display: "grid", gap: 10 }}>
              {LICENSE_TIERS.map((t) => (
                <div key={t.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{t.label}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{t.uses} · {t.limit}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 900, color: "#AA2DFF" }}>${t.price}</div>
                    <button onClick={() => buyTier(t)} style={{ marginTop: 6, padding: "6px 14px", borderRadius: 7, background: "#AA2DFF", color: "#fff", border: "none", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>Buy</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
