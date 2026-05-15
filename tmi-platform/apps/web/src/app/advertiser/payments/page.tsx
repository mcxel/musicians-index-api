"use client";

import { useState } from "react";
import Link from "next/link";

const PACKAGES = [
  {
    id: "starter",
    name: "Starter Ad",
    price: "$49 / mo",
    priceId: "price_ad_starter",
    color: "#00FFFF",
    perks: ["500K impressions/mo", "Homepage tile placement", "Basic click tracking"],
  },
  {
    id: "pro",
    name: "Pro Ad",
    price: "$149 / mo",
    priceId: "price_ad_pro",
    color: "#FF2DAA",
    perks: ["2M impressions/mo", "Live room + magazine tiles", "Profile page halos", "Full analytics dashboard"],
    featured: true,
  },
  {
    id: "premium",
    name: "Premium Ad",
    price: "$399 / mo",
    priceId: "price_ad_premium",
    color: "#FFD700",
    perks: ["Unlimited impressions", "Jumbotron placements", "Premiere sponsorship slots", "Priority placement bidding", "Dedicated rep"],
  },
];

export default function AdvertiserPaymentsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (priceId: string, pkgId: string) => {
    setLoading(pkgId);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          items: [{ priceId, quantity: 1 }],
          successUrl: "/advertiser/payments?success=1",
          cancelUrl: "/advertiser/payments?cancelled=1",
        }),
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        setError(err.error ?? "Checkout failed. Please try again.");
        return;
      }
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ marginBottom: 10 }}>
        <Link href="/dashboard/advertiser" style={{ color: "#FFD700", fontSize: 11, fontWeight: 700, textDecoration: "none", letterSpacing: 3 }}>← ADVERTISER HUB</Link>
      </div>
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FFD700", fontWeight: 800, marginBottom: 4 }}>AD PACKAGES</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,38px)", fontWeight: 900, letterSpacing: 2, margin: 0 }}>REACH MUSIC FANS IN REAL TIME</h1>
        <p style={{ color: "#666", fontSize: 13, marginTop: 8 }}>Place ads on live rooms, magazine tiles, and performer profiles.</p>
      </div>

      {error && (
        <div style={{ background: "rgba(255,45,100,0.12)", border: "1px solid rgba(255,45,100,0.4)", borderRadius: 8, padding: "12px 16px", marginBottom: 24, color: "#FF4466", fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, maxWidth: 960, margin: "0 auto" }}>
        {PACKAGES.map((pkg) => (
          <div key={pkg.id} style={{
            background: pkg.featured ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${pkg.color}40`,
            borderRadius: 14,
            padding: "28px 22px",
            position: "relative",
            overflow: "hidden",
          }}>
            {pkg.featured && (
              <div style={{ position: "absolute", top: 12, right: 12, background: pkg.color, color: "#000", fontSize: 9, fontWeight: 900, letterSpacing: 2, padding: "3px 8px", borderRadius: 4 }}>
                POPULAR
              </div>
            )}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: pkg.color }} />
            <div style={{ fontSize: 11, letterSpacing: 3, color: pkg.color, fontWeight: 800, marginBottom: 8, textTransform: "uppercase" }}>{pkg.name}</div>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 20 }}>{pkg.price}</div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
              {pkg.perks.map((p) => (
                <li key={p} style={{ fontSize: 13, color: "#aaa", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: pkg.color, fontSize: 16, lineHeight: 1 }}>✓</span> {p}
                </li>
              ))}
            </ul>
            <button
              onClick={() => void handleCheckout(pkg.priceId, pkg.id)}
              disabled={loading !== null}
              style={{
                width: "100%",
                padding: "13px",
                background: loading === pkg.id ? "#333" : `linear-gradient(90deg, ${pkg.color}, ${pkg.color}88)`,
                border: "none",
                borderRadius: 8,
                color: "#000",
                fontWeight: 900,
                fontSize: 13,
                letterSpacing: 1,
                cursor: loading !== null ? "not-allowed" : "pointer",
              }}
            >
              {loading === pkg.id ? "REDIRECTING..." : "SELECT PACKAGE"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}