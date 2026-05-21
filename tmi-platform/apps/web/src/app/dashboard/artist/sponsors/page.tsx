"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const SPONSOR_SLOTS = [
  { label: "Profile Banner",     status: "available", rate: "$250/mo",  color: "#AA2DFF" },
  { label: "Magazine Feature",   status: "available", rate: "$500/mo",  color: "#FF2DAA" },
  { label: "Live Show Billboard", status: "pending",   rate: "$1,000/show", color: "#FFD700" },
  { label: "Beat Vault Ad",      status: "active",    rate: "$150/mo",  color: "#00FFFF" },
];

export default function ArtistSponsorsPage() {
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
      <span style={{ color: "#AA2DFF", fontSize: 12, letterSpacing: 4 }}>LOADING...</span>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <Link href="/dashboard/artist" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Artist Hub</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#AA2DFF", fontWeight: 800, marginBottom: 4 }}>ARTIST SPONSORS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 8px" }}>Sponsor Management</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: "0 0 28px" }}>Manage your sponsored placements and partner relationships.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
          {SPONSOR_SLOTS.map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, background: "rgba(255,255,255,0.03)", border: `1px solid ${s.color}22`, borderRadius: 10, padding: "14px 18px" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{s.label}</div>
                <div style={{ fontSize: 11, color: s.color, marginTop: 3 }}>{s.rate}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: "uppercase",
                  color: s.status === "active" ? "#22c55e" : s.status === "pending" ? "#f59e0b" : "rgba(255,255,255,0.4)",
                  background: s.status === "active" ? "rgba(34,197,94,0.1)" : s.status === "pending" ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.05)",
                  padding: "3px 8px", borderRadius: 4,
                }}>
                  {s.status}
                </span>
                <Link href="/sponsor/campaigns" style={{ fontSize: 11, color: s.color, textDecoration: "none", fontWeight: 700 }}>Manage →</Link>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "rgba(170,45,255,0.06)", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 12, padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>Get Sponsored</div>
          <div style={{ color: "#666", fontSize: 13, marginBottom: 16 }}>Brands are looking for TMI artists to sponsor. Apply now.</div>
          <Link href="/contact?subject=sponsorship-artist" style={{ display: "inline-block", padding: "10px 24px", background: "linear-gradient(90deg,#AA2DFF,#FF2DAA)", borderRadius: 8, color: "#fff", fontWeight: 800, fontSize: 12, textDecoration: "none" }}>
            Apply for Sponsorship
          </Link>
        </div>
      </div>
    </main>
  );
}
