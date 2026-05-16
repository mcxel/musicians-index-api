"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Claim = {
  id: string;
  bundleName: string;
  status: "PENDING" | "CLAIMED";
  createdAt: string;
  claimedAt?: string;
};

export default function RewardsClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");
  const [busyClaimId, setBusyClaimId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/rewards/claims?userId=demo-user")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setClaims(data);
        }
      })
      .catch(() => {
        setMessage("Could not load claims right now.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function redeemClaim(claimId: string) {
    setBusyClaimId(claimId);
    setMessage("");
    try {
      const res = await fetch("/api/rewards/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, userId: "demo-user" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.error ?? "Claim redemption failed.");
        return;
      }

      setClaims((previous) =>
        previous.map((claim) => (claim.id === claimId ? { ...claim, status: "CLAIMED", claimedAt: data?.claim?.claimedAt } : claim)),
      );
      setMessage("Reward redeemed and added to your inventory.");
    } catch {
      setMessage("Claim redemption failed.");
    } finally {
      setBusyClaimId(null);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#090914", color: "#fff", padding: 24 }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: "clamp(1.6rem,4vw,2.4rem)" }}>Reward Claims</h1>
        <p style={{ opacity: 0.8, marginTop: 0 }}>Redeem pending prize bundles and move them into your usable inventory.</p>

        <div style={{ display: "flex", gap: 10, margin: "20px 0 26px", flexWrap: "wrap" }}>
          <Link href="/rewards" style={{ color: "#facc15", textDecoration: "none", border: "1px solid rgba(250,204,21,0.4)", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700 }}>
            Back to Rewards
          </Link>
          <Link href="/shop" style={{ color: "#00FFFF", textDecoration: "none", border: "1px solid rgba(0,255,255,0.35)", borderRadius: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700 }}>
            Open Shop
          </Link>
        </div>

        {message && (
          <div style={{ marginBottom: 16, padding: "10px 12px", borderRadius: 8, background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.25)", color: "#8af5ff", fontSize: 12 }}>
            {message}
          </div>
        )}

        {loading && <div style={{ color: "rgba(255,255,255,0.55)" }}>Loading claims...</div>}

        {!loading && claims.length === 0 && (
          <div style={{ color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 16 }}>
            No pending claims right now. Keep competing to unlock more prize drops.
          </div>
        )}

        {!loading && claims.length > 0 && (
          <div style={{ display: "grid", gap: 12 }}>
            {claims.map((claim) => (
              <article key={claim.id} style={{ border: "1px solid rgba(255,255,255,0.14)", borderRadius: 12, padding: 16, background: "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>{claim.bundleName}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                      Issued {new Date(claim.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                  {claim.status === "PENDING" ? (
                    <button
                      type="button"
                      onClick={() => redeemClaim(claim.id)}
                      disabled={busyClaimId === claim.id}
                      style={{
                        border: "none",
                        borderRadius: 8,
                        padding: "9px 14px",
                        background: "linear-gradient(135deg,#FFD700,#FF9500)",
                        color: "#090914",
                        fontWeight: 900,
                        fontSize: 11,
                        letterSpacing: "0.08em",
                        cursor: busyClaimId === claim.id ? "wait" : "pointer",
                        opacity: busyClaimId === claim.id ? 0.75 : 1,
                      }}
                    >
                      {busyClaimId === claim.id ? "REDEEMING..." : "REDEEM"}
                    </button>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", color: "#00FF88" }}>CLAIMED</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
