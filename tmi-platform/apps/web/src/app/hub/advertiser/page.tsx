"use client";

/**
 * Advertiser / Sponsor Command Hub — rebuilt onto CanonicalRoleShellChrome.
 *
 * Phase 0 law: enter ≠ complete. Account + LOG OUT must stay visible.
 * Mobile: TOP identity · CENTER workspace · TOOLS drawer — not squeezed desktop 3-col.
 * Does NOT mount RoomContainer / WidgetDrawer (those belong to live rooms, not role hubs).
 */

import { useState } from "react";
import Link from "next/link";
import MediaMonitor from "@/components/video/MediaMonitor";
import { MemoryWallCanister } from "@/components/canisters/MemoryWallCanister";
import MessagingCanister from "@/components/canisters/MessagingCanister";
import DiscoveryRail from "@/components/discovery/DiscoveryRail";
import { useTmiSession } from "@/hooks/SessionContext";

type HubMode = "ADVERTISER" | "SPONSOR";

export default function AdvertiserSponsorHub() {
  const [mode, setMode] = useState<HubMode>("ADVERTISER");
  const { userId } = useTmiSession();
  const accentColor = mode === "ADVERTISER" ? "#FF8C00" : "#00FFFF";

  return (
      <div style={{ padding: "12px 14px 28px", maxWidth: 1280, margin: "0 auto", width: "100%" }}>
        <div
          data-advertiser-mode-toggle="1"
          style={{
            display: "flex",
            gap: 6,
            padding: 4,
            marginBottom: 14,
            background: "rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            maxWidth: 360,
          }}
        >
          {(["ADVERTISER", "SPONSOR"] as const).map((m) => {
            const active = mode === m;
            const color = m === "ADVERTISER" ? "#FF8C00" : "#00FFFF";
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  padding: "8px 12px",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.1em",
                  borderRadius: 8,
                  border: active ? `1px solid ${color}` : "1px solid transparent",
                  background: active ? color : "transparent",
                  color: active ? "#050510" : "rgba(255,255,255,0.45)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {m}
              </button>
            );
          })}
        </div>

        {/* CENTER — monitor first (mobile + desktop) */}
        <section style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", color: "rgba(255,255,255,0.5)" }}>
              LIVE PLACEMENT FEED
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.1em",
                padding: "4px 8px",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              ● STANDBY — No active ad running
            </span>
          </div>
          <div
            style={{
              position: "relative",
              borderRadius: 14,
              overflow: "hidden",
              border: `2px solid ${accentColor}44`,
              background: "#000",
              minHeight: 200,
              aspectRatio: "16 / 9",
              maxHeight: "min(52vh, 420px)",
            }}
          >
            <MediaMonitor mode="standby" isActive={false} />
            <div
              style={{
                position: "absolute",
                left: 12,
                bottom: 12,
                right: 12,
                background: "rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: 10,
                pointerEvents: "none",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>No ad placement active</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                Launch a campaign to begin serving ads.
              </div>
            </div>
          </div>
        </section>

        {/* Primary actions — always reachable */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <Link
            href="/sponsor/placements"
            style={{
              flex: "1 1 140px",
              textAlign: "center",
              padding: "12px 14px",
              borderRadius: 10,
              background: "#fff",
              color: "#050510",
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: "0.1em",
              textDecoration: "none",
            }}
          >
            ▶ RUN AD
          </Link>
          <Link
            href="/sponsor/payments"
            style={{
              flex: "1 1 140px",
              textAlign: "center",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: "0.1em",
              textDecoration: "none",
            }}
          >
            💰 BOOST BUDGET
          </Link>
          <Link
            href="/sponsor/campaigns/new"
            style={{
              flex: "1 1 140px",
              textAlign: "center",
              padding: "12px 14px",
              borderRadius: 10,
              border: `1px solid ${accentColor}`,
              color: accentColor,
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: "0.1em",
              textDecoration: "none",
            }}
          >
            + LAUNCH CAMPAIGN
          </Link>
        </div>

        {/* Campaign + ROI — stacked cards (not side rails squeezed onto phone) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <aside
            style={{
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14,
              padding: 14,
            }}
          >
            <h2 style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", margin: "0 0 12px" }}>
              CAMPAIGN CONTROL
            </h2>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>No active campaign</div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 999, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ width: "0%", height: "100%", background: accentColor }} />
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>
              Launch a campaign to see budget progress here.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 10, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900 }}>0</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>ACTIVE SLOTS</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 10, textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: "rgba(255,255,255,0.35)" }}>—</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em" }}>TARGET GENRE</div>
              </div>
            </div>
          </aside>

          <aside
            style={{
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 14,
              padding: 14,
            }}
          >
            <h2 style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "rgba(255,255,255,0.4)", margin: "0 0 12px" }}>
              ROI &amp; PERFORMANCE
            </h2>
            {[
              { label: "Conversion Rate", value: "—" },
              { label: "Total Clicks", value: "0" },
              { label: "Watch Time", value: "—" },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{row.label}</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: row.value === "—" ? "rgba(255,255,255,0.3)" : "#fff" }}>
                  {row.value}
                </span>
              </div>
            ))}
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 8 }}>
              Stats appear once your first campaign is live.
            </div>
          </aside>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          <DiscoveryRail type="performers" limit={6} accentColor={accentColor} label="DISCOVER ARTISTS" />
          <DiscoveryRail type="venues" limit={4} accentColor="#00FFFF" label="EVENT & VENUE OPPORTUNITIES" />
          <DiscoveryRail type="sponsors" limit={4} accentColor="#FFD700" label="SPONSORSHIP SURFACES" />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: 12,
          }}
        >
          <MemoryWallCanister
            entityId={userId ?? "advertiser"}
            entityType="sponsor"
            title="Campaign Moments"
            accentColor="#FF8C00"
          />
          <MessagingCanister height={320} />
        </div>
      </div>
  );
}
