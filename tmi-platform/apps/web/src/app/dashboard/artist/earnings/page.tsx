"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const STREAMS = [
  { label: "Beat Sales",       value: "$0.00",  color: "#FFD700" },
  { label: "Tips Received",    value: "$0.00",  color: "#FF2DAA" },
  { label: "Ticket Revenue",   value: "$0.00",  color: "#AA2DFF" },
  { label: "Sponsor Income",   value: "$0.00",  color: "#00FFFF" },
  { label: "NFT Royalties",    value: "$0.00",  color: "#22c55e" },
  { label: "Total This Month", value: "$0.00",  color: "#f59e0b" },
];

export default function ArtistEarningsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store", credentials: "include" })
      .then((r) => r.json())
      .then((d) => { if (!d.authenticated) router.replace("/auth"); else setReady(true); })
      .catch(() => router.replace("/auth"));
  }, [router]);

  if (!ready) return (
    <div style={{ minHeight: "100vh", background: "#05060c", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#FFD700", fontSize: 12, letterSpacing: 4 }}>LOADING...</span>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <Link href="/dashboard/artist" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Artist Hub</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#FFD700", fontWeight: 800, marginBottom: 4 }}>ARTIST EARNINGS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 24px" }}>Revenue Dashboard</h1>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 32 }}>
          {STREAMS.map((s) => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${s.color}28`, borderRadius: 10, padding: "16px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: s.color }} />
              <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#555", marginTop: 4, textTransform: "uppercase" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.15)", borderRadius: 12, padding: "20px" }}>
          <div style={{ fontSize: 11, color: "#FFD700", fontWeight: 700, marginBottom: 12 }}>QUICK ACTIONS</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { label: "Withdraw Earnings", href: "/settings/payout" },
              { label: "Beat Vault",        href: "/beat-vault" },
              { label: "NFT Studio",        href: "/nft" },
              { label: "Transactions",      href: "/transactions" },
            ].map((a) => (
              <Link key={a.href} href={a.href} style={{ padding: "10px 18px", borderRadius: 8, background: "rgba(255,215,0,0.08)", border: "1px solid rgba(255,215,0,0.2)", color: "#FFD700", textDecoration: "none", fontSize: 12, fontWeight: 700 }}>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
