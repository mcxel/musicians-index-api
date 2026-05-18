"use client";

import Link from "next/link";
import BillboardColumnPulse from "@/components/home/BillboardColumnPulse";

export default function MagazineBillboardsPage() {
  return (
    <main
      style={{
        minHeight: "100svh",
        background: "linear-gradient(170deg, #06030f 0%, #080c20 50%, #050816 100%)",
        color: "#fff",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(6,3,15,0.96)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,255,255,0.12)",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Link
          href="/home/magazine"
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.35)",
            textDecoration: "none",
          }}
        >
          ← MAGAZINE
        </Link>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: "0.25em",
              color: "#00FFFF",
              textTransform: "uppercase",
            }}
          >
            TMI BILLBOARD INDEX
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.55 }}>
            Live Rankings · All Divisions
          </div>
        </div>
        <Link
          href="/rankings/crown"
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.1em",
            color: "#FFD700",
            textDecoration: "none",
            border: "1px solid rgba(255,215,0,0.3)",
            borderRadius: 6,
            padding: "4px 10px",
          }}
        >
          VOTE LIVE
        </Link>
      </div>

      {/* Billboard content */}
      <BillboardColumnPulse />
    </main>
  );
}
