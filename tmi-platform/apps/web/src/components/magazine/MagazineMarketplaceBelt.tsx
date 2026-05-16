"use client";

// Canon source: Tmi Homepage 2.png — Platform & Marketplace Belt
// Structure: The Store (featured merch) · Booking Portal · My Achievements (850 pts)
//            · Sponsor Spotlight (powered by brand)

import React from "react";
import Link from "next/link";

interface MerchItem {
  id: string;
  name: string;
  price: string;
  badge?: string;
  href: string;
}

interface AchievementStat {
  label: string;
  value: string;
  accent: string;
}

interface SponsorSpot {
  brandName: string;
  tagline?: string;
  href: string;
  accentColor?: string;
}

interface MagazineMarketplaceBeltProps {
  featuredMerch?: MerchItem[];
  achievements?: AchievementStat[];
  totalPoints?: number;
  sponsor?: SponsorSpot;
}

const DEFAULT_MERCH: MerchItem[] = [
  { id: "m1", name: "TMI Crown Tee", price: "$34", badge: "NEW DROP", href: "/store/tmi-crown-tee" },
  { id: "m2", name: "Index Hoodie Vol. 2", price: "$65", href: "/store/index-hoodie" },
  { id: "m3", name: "Cypher Cap", price: "$28", badge: "HOT", href: "/store/cypher-cap" },
];

const DEFAULT_ACHIEVEMENTS: AchievementStat[] = [
  { label: "Fan Points", value: "850",  accent: "#FFD700" },
  { label: "Events",     value: "12",   accent: "#00FFFF" },
  { label: "Streak",     value: "18d",  accent: "#FF2DAA" },
];

// ─── Merch card ───────────────────────────────────────────────────────────────

function MerchCard({ item }: { item: MerchItem }) {
  return (
    <Link href={item.href} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "rgba(255,215,0,0.04)",
          border: "1px solid rgba(255,215,0,0.14)",
          borderRadius: 8,
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 5,
          cursor: "pointer",
          transition: "border-color 0.2s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,215,0,0.35)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,215,0,0.14)"; }}
      >
        {/* Merch image placeholder */}
        <div
          style={{
            height: 56,
            borderRadius: 5,
            background: "linear-gradient(135deg, rgba(255,215,0,0.1), rgba(170,45,255,0.08))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            position: "relative",
          }}
        >
          👕
          {item.badge && (
            <span
              style={{
                position: "absolute",
                top: 3,
                right: 3,
                fontSize: 5,
                fontWeight: 900,
                letterSpacing: "0.15em",
                background: "#FF2DAA",
                color: "#fff",
                borderRadius: 2,
                padding: "1px 4px",
              }}
            >
              {item.badge}
            </span>
          )}
        </div>
        <span style={{ fontSize: 8, fontWeight: 800, color: "#fff", letterSpacing: "0.05em" }}>{item.name}</span>
        <span style={{ fontSize: 10, fontWeight: 900, color: "#FFD700" }}>{item.price}</span>
      </div>
    </Link>
  );
}

// ─── Belt ─────────────────────────────────────────────────────────────────────

export default function MagazineMarketplaceBelt({
  featuredMerch = DEFAULT_MERCH,
  achievements = DEFAULT_ACHIEVEMENTS,
  totalPoints = 850,
  sponsor,
}: MagazineMarketplaceBeltProps) {
  return (
    <section data-belt="marketplace" style={{ width: "100%" }}>
      {/* Section label */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.28em", color: "#FFD700", textTransform: "uppercase" }}>
          PLATFORM & MARKETPLACE
        </span>
        <div style={{ flex: 1, height: 1, background: "linear-gradient(to right, rgba(255,215,0,0.3), transparent)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>

        {/* ── THE STORE ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)" }}>THE STORE</span>
            <Link href="/store" style={{ fontSize: 7, color: "#FFD700", textDecoration: "none", letterSpacing: "0.1em" }}>
              VIEW ALL →
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {featuredMerch.map((item) => <MerchCard key={item.id} item={item} />)}
          </div>
        </div>

        {/* ── BOOKING PORTAL ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)" }}>BOOKING</span>
          <Link href="/booking" style={{ textDecoration: "none", flex: 1 }}>
            <div
              style={{
                height: "100%",
                minHeight: 120,
                background: "rgba(0,255,136,0.05)",
                border: "1px solid rgba(0,255,136,0.2)",
                borderRadius: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                cursor: "pointer",
                padding: 12,
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,255,136,0.45)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,255,136,0.2)"; }}
            >
              <span style={{ fontSize: 28 }}>🎤</span>
              <span style={{ fontSize: 9, fontWeight: 900, color: "#00FF88", letterSpacing: "0.15em", textAlign: "center" }}>
                BOOKING PORTAL
              </span>
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", textAlign: "center", letterSpacing: "0.08em" }}>
                Book artists, venues & events
              </span>
            </div>
          </Link>
        </div>

        {/* ── MY ACHIEVEMENTS + SPONSOR ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

          {/* Achievements */}
          <div>
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 8 }}>
              MY ACHIEVEMENTS
            </span>
            <Link href="/achievements" style={{ textDecoration: "none" }}>
              <div
                style={{
                  background: "rgba(255,215,0,0.06)",
                  border: "1px solid rgba(255,215,0,0.2)",
                  borderRadius: 8,
                  padding: 10,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {/* Total points */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: "#FFD700" }}>{totalPoints.toLocaleString()}</span>
                  <span style={{ fontSize: 7, color: "rgba(255,215,0,0.6)", letterSpacing: "0.12em" }}>PTS</span>
                </div>
                {/* Stat rows */}
                {achievements.map((a) => (
                  <div key={a.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>{a.label}</span>
                    <span style={{ fontSize: 9, fontWeight: 900, color: a.accent }}>{a.value}</span>
                  </div>
                ))}
              </div>
            </Link>
          </div>

          {/* Sponsor Spotlight */}
          <div>
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 8 }}>
              SPONSOR SPOTLIGHT
            </span>
            {sponsor ? (
              <Link href={sponsor.href} style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: `${sponsor.accentColor ?? "#AA2DFF"}08`,
                    border: `1px solid ${sponsor.accentColor ?? "#AA2DFF"}25`,
                    borderRadius: 8,
                    padding: 10,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em" }}>POWERED BY</span>
                  <span style={{ fontSize: 12, fontWeight: 900, color: sponsor.accentColor ?? "#AA2DFF", letterSpacing: "0.08em" }}>{sponsor.brandName}</span>
                  {sponsor.tagline && <span style={{ fontSize: 7, color: "rgba(255,255,255,0.4)" }}>{sponsor.tagline}</span>}
                </div>
              </Link>
            ) : (
              <Link href="/advertise" style={{ textDecoration: "none" }}>
                <div
                  style={{
                    background: "rgba(170,45,255,0.05)",
                    border: "1px dashed rgba(170,45,255,0.25)",
                    borderRadius: 8,
                    padding: 10,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 8, color: "rgba(170,45,255,0.7)", letterSpacing: "0.12em" }}>YOUR BRAND HERE</span>
                  <span style={{ fontSize: 7, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em" }}>advertise →</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
