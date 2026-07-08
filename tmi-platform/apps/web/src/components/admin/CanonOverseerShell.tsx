"use client";

// Canon source: Adminisratation Hub.jpg — Big Ace Overseer Deck
// 12-panel layout assembling all existing overseer sub-panels
//
// LAYOUT (bottom → top of import precedence):
//   Row 0 (full-width): OverseerDock — Quick Dock / Chain Pulse / Alerts / Actions
//   Row 1 (3-col grid):
//     Left  — ChainCommandPanel · BigAceFinancePanel · BotSummonDeck · UnifiedInbox
//     Center — LiveFeedRouter (TV Screen Router / Boardroom) · FeedExplorer (Live Feed Explorer)
//     Right  — SentinelWall · AccountLinker · RevenueAnalytics · MagazineAnalytics

import OverseerDock            from "@/components/admin/overseer/OverseerDock";
import ChainCommandPanel       from "@/components/admin/overseer/ChainCommandPanel";
import FeedExplorer            from "@/components/admin/overseer/FeedExplorer";
import SentinelWall            from "@/components/admin/overseer/SentinelWall";
import AccountLinker           from "@/components/admin/overseer/AccountLinker";
// RevenueAnalytics is LEGACY (hardcoded demo data, see file header) — the
// real Stripe-backed replacement is AdminRevenuePanel. Wiring it in directly
// so the Overseer Deck's revenue panel shows real telemetry, not fake numbers.
import AdminRevenuePanel        from "@/components/admin/AdminRevenuePanel";
import StripeObservatoryCard    from "@/components/admin/StripeObservatoryCard";
import UnifiedInbox            from "@/components/admin/overseer/UnifiedInbox";
import LiveFeedRouter          from "@/components/admin/overseer/LiveFeedRouter";
import BotSummonDeck           from "@/components/admin/BotSummonDeck";
import BigAceFinancePanel      from "@/components/admin/BigAceFinancePanel";

// ─── Panel wrapper ─────────────────────────────────────────────────────────────

function OverseerPanel({
  id,
  label,
  accent = "#00FFFF",
  children,
  style,
}: {
  id?: string;
  label: string;
  accent?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <section
      id={id}
      data-overseer-panel={label}
      style={{
        position: "relative",
        background: `linear-gradient(160deg, rgba(40,10,40,0.92) 0%, rgba(20,5,24,0.94) 55%, rgba(10,2,14,0.96) 100%)`,
        border: `1px solid ${accent}55`,
        borderRadius: 10,
        boxShadow: `0 0 0 1px rgba(255,215,0,0.12), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 22px rgba(0,0,0,0.55), 0 6px 18px rgba(0,0,0,0.5)`,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {/* Gilded corner accents */}
      <span style={{ position: "absolute", top: 3, left: 3, width: 10, height: 10, borderTop: "2px solid #FFD700", borderLeft: "2px solid #FFD700", opacity: 0.7, pointerEvents: "none" }} />
      <span style={{ position: "absolute", top: 3, right: 3, width: 10, height: 10, borderTop: "2px solid #FFD700", borderRight: "2px solid #FFD700", opacity: 0.7, pointerEvents: "none" }} />
      <span style={{ position: "absolute", bottom: 3, left: 3, width: 10, height: 10, borderBottom: "2px solid #FFD700", borderLeft: "2px solid #FFD700", opacity: 0.7, pointerEvents: "none" }} />
      <span style={{ position: "absolute", bottom: 3, right: 3, width: 10, height: 10, borderBottom: "2px solid #FFD700", borderRight: "2px solid #FFD700", opacity: 0.7, pointerEvents: "none" }} />

      {/* Panel label strip */}
      <div
        style={{
          padding: "7px 14px",
          borderBottom: `1px solid ${accent}45`,
          background: `linear-gradient(to right, ${accent}22, rgba(255,215,0,0.06) 60%, transparent)`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent, boxShadow: `0 0 6px ${accent}` }} />
        <span
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.22em",
            color: accent,
            textTransform: "uppercase",
            textShadow: `0 0 8px ${accent}66`,
          }}
        >
          {label}
        </span>
      </div>
      {/* Panel content */}
      <div style={{ flex: 1, overflow: "hidden" }}>{children}</div>
    </section>
  );
}

// ─── Shell ─────────────────────────────────────────────────────────────────────

export default function CanonOverseerShell() {
  return (
    <div
      data-canon-overseer-shell
      style={{
        minHeight: "100vh",
        background: "radial-gradient(ellipse at top, #260a2e 0%, #150818 45%, #05020a 100%)",
        border: "1px solid rgba(255,215,0,0.25)",
        boxShadow: "inset 0 0 60px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,215,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: 8,
        fontFamily: "inherit",
      }}
    >
      {/* ── Row 0: Overseer Dock (full width) ── */}
      <div data-row="dock">
        <OverseerPanel label="OVERSEER DOCK" accent="#FFD700" style={{ borderRadius: 10 }}>
          <OverseerDock />
        </OverseerPanel>
      </div>

      {/* ── Row 1: 3-column main grid ── */}
      <div
        data-row="main"
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "280px 1fr 300px",
          gap: 8,
          minHeight: 0,
        }}
      >
        {/* ── LEFT COLUMN ── */}
        <div
          data-col="left"
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          {/* Panel 1: Chain Command */}
          <OverseerPanel
            id="chain-command"
            label="CHAIN COMMAND"
            accent="#AA2DFF"
            style={{ flex: "0 0 auto" }}
          >
            <ChainCommandPanel />
          </OverseerPanel>

          {/* Panel 2: Money & Billing */}
          <OverseerPanel
            label="MONEY & BILLING"
            accent="#FFD700"
            style={{ flex: "0 0 auto" }}
          >
            <BigAceFinancePanel />
          </OverseerPanel>

          {/* Panel 3: Bot Roster & Summon */}
          <OverseerPanel
            label="BOT ROSTER & SUMMON"
            accent="#FF2DAA"
            style={{ flex: "1 1 auto", minHeight: 0 }}
          >
            <BotSummonDeck />
          </OverseerPanel>

          {/* Panel 4: Unified Inbox */}
          <OverseerPanel
            label="UNIFIED INBOX"
            accent="#00FFFF"
            style={{ flex: "0 0 auto" }}
          >
            <UnifiedInbox />
          </OverseerPanel>
        </div>

        {/* ── CENTER COLUMN ── */}
        <div
          data-col="center"
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          {/* Panel 5: TV Screen Router / Boardroom */}
          <OverseerPanel
            id="live-feed-router"
            label="TV SCREEN ROUTER · BOARDROOM LIVE"
            accent="#00FFFF"
            style={{ flex: "0 0 340px" }}
          >
            <LiveFeedRouter />
          </OverseerPanel>

          {/* Panel 6: Live Feed Explorer */}
          <OverseerPanel
            label="LIVE FEED EXPLORER"
            accent="#00FFFF"
            style={{ flex: 1, minHeight: 0 }}
          >
            <FeedExplorer />
          </OverseerPanel>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div
          data-col="right"
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          {/* Panel 7: Security Sentinel Wall */}
          <OverseerPanel
            id="sentinel-wall"
            label="SECURITY SENTINEL WALL"
            accent="#FF4444"
            style={{ flex: "0 0 auto" }}
          >
            <SentinelWall />
          </OverseerPanel>

          {/* Panel 8: Account Linker */}
          <OverseerPanel
            label="ACCOUNT LINKER"
            accent="#AA2DFF"
            style={{ flex: "0 0 auto" }}
          >
            <AccountLinker />
          </OverseerPanel>

          {/* Panel 9: Artist Revenue & Buyouts */}
          <OverseerPanel
            label="ARTIST REVENUE & BUYOUTS"
            accent="#FFD700"
            style={{ flex: "1 1 auto", minHeight: 0 }}
          >
            <AdminRevenuePanel
              selectedId="billing"
              onSelect={(id) => { window.location.href = id === "artist-analytics" ? "/admin/artist-analytics" : "/admin/revenue"; }}
            />
          </OverseerPanel>

          {/* Panel 10–12: Stripe Webhook Integrity */}
          <OverseerPanel
            label="STRIPE WEBHOOK INTEGRITY"
            accent="#00FFFF"
            style={{ flex: "1 1 auto", minHeight: 0 }}
          >
            <StripeObservatoryCard />
          </OverseerPanel>
        </div>
      </div>
    </div>
  );
}
