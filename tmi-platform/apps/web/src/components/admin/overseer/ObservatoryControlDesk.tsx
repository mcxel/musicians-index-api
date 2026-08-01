"use client";

/**
 * ObservatoryControlDesk — Living OS Control Desk (Phase 1).
 * Mounts BELOW Live Channel Ticker / in Intelligence control region.
 * Persistent rail + period filter + instant primary workspace swap.
 * Rule 20: honest Loading / Live / Empty / Degraded / Offline / Error.
 * Health lights from real signals only — GRAY when unavailable.
 * FINANCIAL_BOUNDARY: no autonomous price changes.
 */

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";

import BotSummonDeck from "@/components/admin/BotSummonDeck";
import AdminRevenuePanel from "@/components/admin/AdminRevenuePanel";
import AdminSubmissionPanel from "@/components/admin/AdminSubmissionPanel";
import PresentationTelemetryPanel from "@/components/admin/PresentationTelemetryPanel";
import PlatformCorePanel from "@/components/admin/PlatformCorePanel";
import ObservatoryDeck from "@/components/admin/overseer/ObservatoryDeck";
import ObservatoryIntelligencePanel from "@/components/admin/overseer/ObservatoryIntelligencePanel";
import ScamDefenseCenter from "@/components/admin/overseer/ScamDefenseCenter";
import MagazineAnalytics from "@/components/admin/overseer/MagazineAnalytics";
import HomeLiveLobbyWall from "@/components/discovery/HomeLiveLobbyWall";
import { BOT_ACCOUNT_REGISTRY } from "@/lib/bots/BotAccountRegistry";
import {
  DESK_HEALTH_COLOR,
  DESK_PERIODS,
  DESK_RAIL_ITEMS,
  loadObservatoryDeskState,
  saveObservatoryDeskState,
  type DeskHealth,
  type DeskHealthMap,
  type DeskPanelId,
  type DeskPeriod,
} from "@/lib/admin/ObservatoryDeskState";
import {
  ensurePresentationDirectorsStarted,
  PresentationTelemetryDirector,
  type PresentationDirectorTelemetry,
} from "@/lib/presentation/directors";
import { listCapabilityMatrix } from "@/lib/platform/PlatformCapabilityMatrix";

type RevenueMode = "live" | "test" | "not_configured" | "error" | "loading" | "unavailable";

function HonestEmpty({
  title,
  detail,
  href,
  hrefLabel,
}: {
  title: string;
  detail: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div
      style={{
        height: "100%",
        minHeight: 160,
        borderRadius: 10,
        border: "1px solid rgba(107,114,128,0.45)",
        background: "linear-gradient(160deg, rgba(18,18,22,0.95), rgba(8,8,12,0.98))",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        justifyContent: "center",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "#9CA3AF",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.45 }}>{detail}</div>
      {href ? (
        <Link
          href={href}
          style={{
            alignSelf: "flex-start",
            marginTop: 4,
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#00FFFF",
            textDecoration: "none",
            border: "1px solid rgba(0,255,255,0.4)",
            borderRadius: 999,
            padding: "5px 12px",
            background: "rgba(0,255,255,0.08)",
          }}
        >
          {hrefLabel ?? "Open surface →"}
        </Link>
      ) : null}
    </div>
  );
}

function PeriodNote({ period }: { period: DeskPeriod }) {
  if (period === "custom") {
    return (
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>
        Custom range picker deferred — filter stored as Custom stub for this session.
      </div>
    );
  }
  return (
    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>
      Period filter: <strong style={{ color: "#FFD700" }}>{period.toUpperCase()}</strong>
      {" · "}
      applies when a wired ledger/analytics source exists for this panel.
    </div>
  );
}

function PrimaryWorkspace({
  panel,
  period,
}: {
  panel: DeskPanelId;
  period: DeskPeriod;
}) {
  switch (panel) {
    case "overview":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 0, height: "100%" }}>
          <PeriodNote period={period} />
          <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            <ObservatoryIntelligencePanel />
          </div>
        </div>
      );
    case "analytics":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
          <PeriodNote period={period} />
          <MagazineAnalytics />
          <HonestEmpty
            title="Analytics ledger"
            detail="No multi-source analytics engine is wired for period charts. Magazine/index signals above are registry-backed. Full analytics charts stay deferred until a real ledger exists."
            href="/admin/analytics"
            hrefLabel="Open Admin Analytics →"
          />
        </div>
      );
    case "revenue":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%", overflow: "auto" }}>
          <PeriodNote period={period} />
          <AdminRevenuePanel
            selectedId="billing"
            onSelect={(id) => {
              window.location.href =
                id === "artist-analytics" ? "/admin/artist-analytics" : "/admin/revenue";
            }}
          />
          <Link
            href="/admin/revenue"
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: "#FFD700",
              textDecoration: "none",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Open Revenue Desk →
          </Link>
        </div>
      );
    case "audience":
      return (
        <HonestEmpty
          title="Audience"
          detail="No dedicated audience telemetry panel is mounted yet. Live room audience counts appear under Rooms when GlobalLiveSessionRegistry reports sessions."
          href="/admin/live"
          hrefLabel="Open Live Admin →"
        />
      );
    case "rooms":
      return (
        <div style={{ height: "100%", overflow: "auto" }}>
          <PeriodNote period={period} />
          <ObservatoryDeck />
        </div>
      );
    case "lobby-wall":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%", overflow: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#FF2DAA" }}>
              LIVE SURFACE PROJECTION
            </span>
            <Link
              href="/live/lobby-wall"
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: "#00FFFF",
                textDecoration: "none",
                border: "1px solid rgba(0,255,255,0.35)",
                borderRadius: 999,
                padding: "3px 10px",
              }}
            >
              Full Lobby Wall →
            </Link>
          </div>
          <HomeLiveLobbyWall surface="home3_mosaic" maxTiles={8} showOpenOverlay title="Lobby Wall" />
        </div>
      );
    case "bots":
      return (
        <div style={{ height: "100%", overflow: "auto" }}>
          <BotSummonDeck />
        </div>
      );
    case "rankings":
      return (
        <HonestEmpty
          title="Rankings"
          detail="XP-driven ranks live in PerformerRegistry (computeRanks). No Observatory rankings tile engine is wired here yet."
          href="/home/1-2"
          hrefLabel="Open Billboard / Rankings →"
        />
      );
    case "presentation":
      return (
        <div style={{ height: "100%", overflow: "auto" }}>
          <PresentationTelemetryPanel />
        </div>
      );
    case "webrtc":
      return (
        <HonestEmpty
          title="WebRTC"
          detail="No Observatory WebRTC health telemetry source is wired. Media Matrix remains on the dual monitors above."
          href="/admin/video-observatory"
          hrefLabel="Open Video Observatory →"
        />
      );
    case "commerce":
      return (
        <HonestEmpty
          title="Commerce"
          detail="Commerce admin surface exists; no period-filtered Observatory commerce ledger is mounted in this desk yet."
          href="/admin/commerce"
          hrefLabel="Open Commerce →"
        />
      );
    case "submissions":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%", overflow: "auto" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Link
              href="/admin/beat-locker"
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: "#FF2DAA",
                textDecoration: "none",
                border: "1px solid rgba(255,45,170,0.4)",
                borderRadius: 999,
                padding: "3px 10px",
              }}
            >
              Beat Locker →
            </Link>
          </div>
          <AdminSubmissionPanel actorName="Observatory" accentColor="#FF2DAA" />
        </div>
      );
    case "alerts":
      return (
        <div style={{ height: "100%", overflow: "auto" }}>
          <ScamDefenseCenter />
        </div>
      );
    case "system-health":
      return (
        <div style={{ height: "100%", overflow: "auto" }}>
          <PeriodNote period={period} />
          <PlatformCorePanel />
          <div style={{ marginTop: 10 }}>
            <Link
              href="/admin/platform-core"
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#FFD700",
                textDecoration: "none",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Open Platform Core →
            </Link>
          </div>
        </div>
      );
    case "stats":
      return (
        <HonestEmpty
          title="Stats"
          detail="No unified stats engine is available for this desk panel."
          href="/admin/analytics"
          hrefLabel="Open Analytics →"
        />
      );
    case "geography":
      return (
        <HonestEmpty
          title="Geography"
          detail="No geography / region telemetry source is wired."
          href="/admin/global-pulse"
          hrefLabel="Open Global Pulse →"
        />
      );
    case "engagement":
      return (
        <HonestEmpty
          title="Engagement"
          detail="No engagement ledger is mounted for Observatory period filters."
          href="/admin/analytics"
          hrefLabel="Open Analytics →"
        />
      );
    case "growth":
      return (
        <HonestEmpty
          title="Growth"
          detail="No growth chart source is wired — inventing curves would violate Rule 20."
          href="/admin/artist-analytics"
          hrefLabel="Open Artist Analytics →"
        />
      );
    case "sponsors":
      return (
        <HonestEmpty
          title="Sponsors"
          detail="Sponsor placements use SponsorRegistry on marketplace surfaces. No Observatory sponsor telemetry panel yet."
          href="/admin/sponsors"
          hrefLabel="Open Sponsors →"
        />
      );
    case "prizes":
      return (
        <HonestEmpty
          title="Prizes"
          detail="Cash / prize payouts remain gated by Revenue-First Rewards Governor. No prize ledger in this desk."
          href="/admin/contests"
          hrefLabel="Open Contests →"
        />
      );
    default:
      return (
        <HonestEmpty
          title="Panel unavailable"
          detail="Unknown desk panel."
        />
      );
  }
}

export default function ObservatoryControlDesk() {
  const [hydrated, setHydrated] = useState(false);
  const [panel, setPanel] = useState<DeskPanelId>("overview");
  const [period, setPeriod] = useState<DeskPeriod>("today");
  const [roomFetch, setRoomFetch] = useState<"loading" | "ok" | "empty" | "error">("loading");
  const [revenueMode, setRevenueMode] = useState<RevenueMode>("loading");
  const [directorTel, setDirectorTel] = useState<PresentationDirectorTelemetry | null>(null);

  useEffect(() => {
    const saved = loadObservatoryDeskState();
    setPanel(saved.panel);
    setPeriod(saved.period);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveObservatoryDeskState({ panel, period });
  }, [hydrated, panel, period]);

  useEffect(() => {
    ensurePresentationDirectorsStarted();
    return PresentationTelemetryDirector.subscribe(setDirectorTel);
  }, []);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch("/api/live/go", { cache: "no-store" });
        if (!active) return;
        if (!res.ok) {
          setRoomFetch("error");
          return;
        }
        const data = (await res.json()) as { sessions?: unknown[] };
        const count = data.sessions?.length ?? 0;
        setRoomFetch(count > 0 ? "ok" : "empty");
      } catch {
        if (active) setRoomFetch("error");
      }
    };
    void poll();
    const id = setInterval(() => {
      void poll();
    }, 12000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const res = await fetch("/api/admin/revenue", { cache: "no-store" });
        if (!active) return;
        if (!res.ok) {
          setRevenueMode("error");
          return;
        }
        const data = (await res.json()) as { mode?: RevenueMode };
        setRevenueMode(data.mode ?? "unavailable");
      } catch {
        if (active) setRevenueMode("unavailable");
      }
    };
    void poll();
    const id = setInterval(() => {
      void poll();
    }, 30000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const health = useMemo<DeskHealthMap>(() => {
    const activeBots = BOT_ACCOUNT_REGISTRY.filter((b) => b.status === "ACTIVE").length;
    const botsHealth: DeskHealth =
      BOT_ACCOUNT_REGISTRY.length === 0 ? "gray" : activeBots > 0 ? "green" : "yellow";

    let roomsHealth: DeskHealth = "gray";
    if (roomFetch === "loading") roomsHealth = "gray";
    else if (roomFetch === "error") roomsHealth = "red";
    else if (roomFetch === "empty") roomsHealth = "yellow";
    else roomsHealth = "green";

    let presentationHealth: DeskHealth = "gray";
    if (directorTel) {
      const active = directorTel.directors.filter(
        (d) => d.directorId !== "telemetry" && d.status === "ACTIVE",
      ).length;
      presentationHealth = active > 0 ? "green" : "yellow";
    }

    let revenueHealth: DeskHealth = "gray";
    if (revenueMode === "loading") revenueHealth = "gray";
    else if (revenueMode === "live") revenueHealth = "green";
    else if (revenueMode === "test") revenueHealth = "yellow";
    else if (revenueMode === "not_configured") revenueHealth = "purple";
    else if (revenueMode === "error" || revenueMode === "unavailable") revenueHealth = "red";

    const matrix = listCapabilityMatrix();
    const missing = matrix.filter((r) => r.certified === "❌").length;
    const partial = matrix.filter((r) => r.certified === "⚠️").length;
    let systemHealth: DeskHealth = "gray";
    if (matrix.length === 0) systemHealth = "gray";
    else if (missing > 0) systemHealth = "red";
    else if (partial > 0) systemHealth = "yellow";
    else systemHealth = "green";

    const blend = (...values: DeskHealth[]): DeskHealth => {
      if (values.includes("red")) return "red";
      if (values.every((v) => v === "gray")) return "gray";
      if (values.includes("yellow") || values.includes("purple")) return "yellow";
      if (values.includes("green")) return "green";
      return "gray";
    };

    return {
      overview: blend(roomsHealth, presentationHealth, systemHealth),
      analytics: "gray",
      revenue: revenueHealth,
      audience: "gray",
      rooms: roomsHealth,
      "lobby-wall": roomsHealth,
      bots: botsHealth,
      rankings: "gray",
      presentation: presentationHealth,
      webrtc: "gray",
      commerce: "gray",
      submissions: "gray",
      alerts: "gray",
      "system-health": systemHealth,
      stats: "gray",
      geography: "gray",
      engagement: "gray",
      growth: "gray",
      sponsors: "gray",
      prizes: "gray",
    };
  }, [roomFetch, revenueMode, directorTel]);

  const resolvedHealth = health;

  const selectPanel = (id: DeskPanelId) => setPanel(id);

  const railBtnStyle = (id: DeskPanelId, accent: string): CSSProperties => {
    const selected = panel === id;
    return {
      display: "flex",
      alignItems: "center",
      gap: 8,
      width: "100%",
      textAlign: "left",
      borderRadius: 8,
      border: selected ? "1.5px solid #00FFFF" : `1px solid ${accent}33`,
      background: selected ? "rgba(0,255,255,0.12)" : "rgba(0,0,0,0.35)",
      color: selected ? "#00FFFF" : "rgba(255,255,255,0.85)",
      boxShadow: selected ? "0 0 12px rgba(0,255,255,0.25)" : "none",
      padding: "7px 10px",
      cursor: "pointer",
      fontFamily: "inherit",
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
    };
  };

  return (
    <div
      data-observatory-control-desk
      data-phase="1"
      style={{
        display: "grid",
        gridTemplateColumns: "200px minmax(0, 1fr)",
        gap: 12,
        minHeight: 520,
        borderRadius: 12,
        border: "2px solid rgba(0,255,255,0.35)",
        background: "linear-gradient(180deg, rgba(0,255,255,0.06), rgba(170,45,255,0.05))",
        boxShadow: "inset 0 0 24px rgba(0,255,255,0.05), 0 8px 28px rgba(0,0,0,0.45)",
        padding: 12,
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Persistent control rail */}
      <aside
        data-desk-rail
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          minHeight: 0,
          maxHeight: 640,
          overflowY: "auto",
          paddingRight: 4,
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.18em",
            color: "#00FFFF",
            textTransform: "uppercase",
            marginBottom: 6,
            padding: "0 4px",
          }}
        >
          Control Rail
        </div>
        {DESK_RAIL_ITEMS.map((item) => {
          const h = resolvedHealth[item.id] ?? "gray";
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => selectPanel(item.id)}
              aria-pressed={panel === item.id}
              style={railBtnStyle(item.id, item.accent)}
              title={`${item.label} · health ${h}`}
            >
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: DESK_HEALTH_COLOR[h],
                  boxShadow: h === "gray" ? "none" : `0 0 6px ${DESK_HEALTH_COLOR[h]}`,
                }}
              />
              <span style={{ flex: 1, minWidth: 0 }}>{item.label}</span>
            </button>
          );
        })}
      </aside>

      {/* Primary workspace */}
      <section
        data-desk-workspace
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          minWidth: 0,
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.2em",
                color: "#00FFFF",
                textTransform: "uppercase",
              }}
            >
              Living OS Control Desk
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              Active:{" "}
              <strong style={{ color: "#00FFFF" }}>
                {DESK_RAIL_ITEMS.find((i) => i.id === panel)?.label ?? panel}
              </strong>
              {" · "}
              Health ≠ Selection (cyan = selected)
            </div>
          </div>

          {/* Filter bar */}
          <div
            data-desk-filter-bar
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              alignItems: "center",
              border: "1px solid rgba(255,215,0,0.28)",
              borderRadius: 999,
              padding: "4px 6px",
              background: "rgba(0,0,0,0.35)",
            }}
          >
            <span
              style={{
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.12em",
                color: "#FFD700",
                textTransform: "uppercase",
                padding: "0 6px",
              }}
            >
              Period
            </span>
            {DESK_PERIODS.map((p) => {
              const active = period === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id)}
                  aria-pressed={active}
                  style={{
                    border: active ? "1px solid #FFD700" : "1px solid transparent",
                    background: active ? "rgba(255,215,0,0.18)" : "transparent",
                    color: active ? "#FFD700" : "rgba(255,255,255,0.55)",
                    borderRadius: 999,
                    padding: "3px 8px",
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div
          style={{
            flex: 1,
            minHeight: 420,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(0,0,0,0.35)",
            padding: 12,
            overflow: "auto",
          }}
        >
          {!hydrated ? (
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>Loading desk state…</div>
          ) : (
            <PrimaryWorkspace panel={panel} period={period} />
          )}
        </div>
      </section>
    </div>
  );
}
