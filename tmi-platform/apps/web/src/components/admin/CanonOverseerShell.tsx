"use client";

import { useState } from "react";

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
import Canister                from "@/components/admin/overseer/Canister";
import ChainCommandPanel       from "@/components/admin/overseer/ChainCommandPanel";
import FeedExplorer            from "@/components/admin/overseer/FeedExplorer";
import SentinelWall            from "@/components/admin/overseer/SentinelWall";
import AccountLinker           from "@/components/admin/overseer/AccountLinker";
import MagazineAnalytics       from "@/components/admin/overseer/MagazineAnalytics";
// RevenueAnalytics is LEGACY (hardcoded demo data, see file header) — the
// real Stripe-backed replacement is AdminRevenuePanel. Wiring it in directly
// so the Overseer Deck's revenue panel shows real telemetry, not fake numbers.
import AdminRevenuePanel        from "@/components/admin/AdminRevenuePanel";
import StripeObservatoryCard    from "@/components/admin/StripeObservatoryCard";
import UnifiedInbox            from "@/components/admin/overseer/UnifiedInbox";
import LiveFeedRouter          from "@/components/admin/overseer/LiveFeedRouter";
import BotSummonDeck           from "@/components/admin/BotSummonDeck";
import BigAceFinancePanel      from "@/components/admin/BigAceFinancePanel";

// ─── Shell ─────────────────────────────────────────────────────────────────────

export default function CanonOverseerShell() {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(false);
  const [fullscreenPanel, setFullscreenPanel] = useState<string | null>(null);

  const leftWidth = leftCollapsed ? 74 : 286;
  const rightWidth = rightCollapsed ? 74 : 306;
  const bottomHeight = bottomCollapsed ? 44 : 230;

  const toggleFullscreen = (panelId: string) => {
    setFullscreenPanel((curr) => (curr === panelId ? null : panelId));
  };

  const shellGridTemplate = fullscreenPanel
    ? "1fr"
    : `${leftWidth}px minmax(0,1fr) ${rightWidth}px`;

  const renderFullscreen = () => {
    switch (fullscreenPanel) {
      case "tv":
        return <LiveFeedRouter />;
      case "feed":
        return <FeedExplorer />;
      case "revenue":
        return <AdminRevenuePanel selectedId="billing" onSelect={() => undefined} />;
      default:
        return null;
    }
  };

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
        <Canister title="OVERSEER DOCK" accent="#FFD700" style={{ borderRadius: 10 }}>
          <OverseerDock />
        </Canister>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
          padding: "0 4px",
        }}
      >
        <button
          type="button"
          onClick={() => setLeftCollapsed((v) => !v)}
          style={{ borderRadius: 999, border: "1px solid rgba(255,215,0,0.35)", background: "rgba(255,215,0,0.1)", color: "#FFD700", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 10px", cursor: "pointer" }}
        >
          {leftCollapsed ? "Expand Left" : "Collapse Left"}
        </button>
        <button
          type="button"
          onClick={() => setRightCollapsed((v) => !v)}
          style={{ borderRadius: 999, border: "1px solid rgba(0,255,255,0.3)", background: "rgba(0,255,255,0.08)", color: "#00FFFF", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 10px", cursor: "pointer" }}
        >
          {rightCollapsed ? "Expand Right" : "Collapse Right"}
        </button>
        <button
          type="button"
          onClick={() => setBottomCollapsed((v) => !v)}
          style={{ borderRadius: 999, border: "1px solid rgba(170,45,255,0.35)", background: "rgba(170,45,255,0.1)", color: "#AA2DFF", fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "5px 10px", cursor: "pointer" }}
        >
          {bottomCollapsed ? "Expand Bottom" : "Collapse Bottom"}
        </button>
      </div>

      <div
        data-row="workspace"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          minHeight: 0,
          transition: "all 280ms ease",
        }}
      >
        <div
          data-row="main"
          style={{
            flex: 1,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: shellGridTemplate,
            gap: 8,
            transition: "all 280ms ease",
          }}
        >
          {fullscreenPanel ? (
            <Canister
              title="FOCUS MODE"
              accent="#00FFFF"
              statusLabel="FOCUSED"
              onToggleFullscreen={() => setFullscreenPanel(null)}
              style={{ minHeight: 0 }}
            >
              {renderFullscreen()}
            </Canister>
          ) : (
            <>
              <div
                data-col="left"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  minHeight: 0,
                  overflow: "hidden",
                }}
              >
                <Canister id="chain-command" title="CHAIN COMMAND" accent="#AA2DFF" collapsed={leftCollapsed}>
                  <ChainCommandPanel />
                </Canister>
                <Canister title="MONEY & BILLING" accent="#FFD700" collapsed={leftCollapsed}>
                  <BigAceFinancePanel />
                </Canister>
                <Canister title="BOT ROSTER & SUMMON" accent="#FF2DAA" collapsed={leftCollapsed} style={{ flex: 1 }}>
                  <BotSummonDeck />
                </Canister>
                <Canister title="UNIFIED INBOX" accent="#00FFFF" collapsed={leftCollapsed}>
                  <UnifiedInbox />
                </Canister>
              </div>

              <div data-col="center" style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
                <Canister
                  id="live-feed-router"
                  title="TV SCREEN ROUTER · BOARDROOM LIVE"
                  accent="#00FFFF"
                  style={{ flex: "0 0 350px" }}
                  onToggleFullscreen={() => toggleFullscreen("tv")}
                >
                  <LiveFeedRouter />
                </Canister>
                <Canister
                  title="LIVE FEED EXPLORER"
                  accent="#00FFFF"
                  style={{ flex: 1 }}
                  onToggleFullscreen={() => toggleFullscreen("feed")}
                >
                  <FeedExplorer />
                </Canister>
              </div>

              <div
                data-col="right"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  minHeight: 0,
                  overflow: "hidden",
                }}
              >
                <Canister id="sentinel-wall" title="SECURITY SENTINEL WALL" accent="#FF4444" collapsed={rightCollapsed}>
                  <SentinelWall />
                </Canister>
                <Canister title="ACCOUNT LINKER" accent="#AA2DFF" collapsed={rightCollapsed}>
                  <AccountLinker />
                </Canister>
                <Canister title="STRIPE WEBHOOK INTEGRITY" accent="#00FFFF" collapsed={rightCollapsed} style={{ flex: 1 }}>
                  <StripeObservatoryCard />
                </Canister>
              </div>
            </>
          )}
        </div>

        <div
          data-row="bottom"
          style={{
            height: bottomHeight,
            minHeight: bottomHeight,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            transition: "all 280ms ease",
          }}
        >
          <Canister
            id="revenue-analytics"
            title="ARTIST REVENUE & BUYOUTS"
            accent="#FFD700"
            collapsed={bottomCollapsed}
            onToggleFullscreen={() => toggleFullscreen("revenue")}
          >
            <AdminRevenuePanel
              selectedId="billing"
              onSelect={(id) => { window.location.href = id === "artist-analytics" ? "/admin/artist-analytics" : "/admin/revenue"; }}
            />
          </Canister>
          <Canister title="MAGAZINE & INDEX ANALYTICS" accent="#FF2DAA" collapsed={bottomCollapsed}>
            <MagazineAnalytics />
          </Canister>
        </div>
      </div>
    </div>
  );
}
