"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VenueAnalyticsRail from "@/components/venue/VenueAnalyticsRail";

export default function VenueAnalyticsPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store", credentials: "include" })
      .then((r) => r.json())
      .then((d: { authenticated: boolean }) => {
        if (!d.authenticated) router.replace("/auth?next=/dashboard/venue/analytics");
        else setReady(true);
      })
      .catch(() => router.replace("/auth"));
  }, [router]);

  if (!ready) return (
    <div style={{ minHeight: "100vh", background: "#05060c", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#22c55e", fontSize: 12, letterSpacing: 4 }}>LOADING...</span>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <Link href="/dashboard/venue" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>← Venue Dashboard</Link>
          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
          <Link href="/hub/venue" style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Venue Hub</Link>
        </div>

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.3em", color: "#22c55e", textTransform: "uppercase", margin: "0 0 6px" }}>Venue Analytics</p>
          <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: 0 }}>Analytics Dashboard</h1>
        </div>

        <VenueAnalyticsRail />
      </div>
    </main>
  );
}
