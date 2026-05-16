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
import MagazineAnalytics       from "@/components/admin/overseer/MagazineAnalytics";
import RevenueAnalytics        from "@/components/admin/overseer/RevenueAnalytics";
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
        background: "rgba(5,5,16,0.82)",
        border: `1px solid ${accent}20`,
        borderRadius: 10,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {/* Panel label strip */}
      <div
        style={{
          padding: "6px 12px",
          borderBottom: `1px solid ${accent}18`,
          background: `linear-gradient(to right, ${accent}10, transparent)`,
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 8,
            fontWeight: 900,
            letterSpacing: "0.22em",
            color: accent,
            textTransform: "uppercase",
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
        background: "radial-gradient(ellipse at top, #0d0025 0%, #050510 50%, #000 100%)",
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
            <RevenueAnalytics />
          </OverseerPanel>

          {/* Panel 10–12: Magazine & Index Analytics */}
          <OverseerPanel
            label="MAGAZINE & INDEX ANALYTICS"
            accent="#FF2DAA"
            style={{ flex: "0 0 auto" }}
          >
            <MagazineAnalytics />
          </OverseerPanel>
        </div>
      </div>
    </div>
  );
}
