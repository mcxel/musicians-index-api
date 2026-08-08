"use client";

/**
 * ObservatoryControlDesk — Living OS Control Desk.
 * Phase 1: persistent rail + period + health/selection dual state + honest empties.
 * Phase 2: Workspace Manager — focus vs layout mode, named layouts, snap-grid tiles.
 * Mounts BELOW Live Channel Ticker; does not remount dual monitors / BotSummonDeck left rail.
 * FINANCIAL_BOUNDARY: no autonomous price changes.
 *
 * Deferred: Phase 3 Analytics Builder · 4 Command Timeline · 5 AI Workspace
 * · 6 Action Center · 7 OC Health · 8 Registry Inspector
 */

import { useEffect, useMemo, useState, type CSSProperties } from "react";

import { DeskPanelContent } from "@/components/admin/overseer/ObservatoryDeskPanels";
import ObservatoryWorkspaceGrid from "@/components/admin/overseer/ObservatoryWorkspaceGrid";
import { BOT_ACCOUNT_REGISTRY } from "@/lib/bots/BotAccountRegistry";
import {
  applyNamedLayout,
  DESK_HEALTH_COLOR,
  DESK_PERIODS,
  DESK_RAIL_ITEMS,
  deskPanelLabel,
  loadObservatoryDeskState,
  NAMED_LAYOUT_PRESETS,
  resetToDefaultLayout,
  saveCurrentAsLayout,
  saveObservatoryDeskState,
  setFocusPanelInTiles,
  type DeskHealth,
  type DeskHealthMap,
  type DeskNamedLayoutId,
  type DeskPanelId,
  type DeskPeriod,
  type DeskTile,
  type DeskWorkspaceMode,
  type ObservatoryDeskState,
} from "@/lib/admin/ObservatoryDeskState";
import {
  ensurePresentationDirectorsStarted,
  PresentationTelemetryDirector,
  type PresentationDirectorTelemetry,
} from "@/lib/presentation/directors";
import { listCapabilityMatrix } from "@/lib/platform/PlatformCapabilityMatrix";

type RevenueMode = "live" | "test" | "not_configured" | "error" | "loading" | "unavailable";

function toolbarBtn(active?: boolean, accent = "#00FFFF"): CSSProperties {
  return {
    border: active ? `1px solid ${accent}` : "1px solid rgba(255,255,255,0.18)",
    background: active ? `${accent}22` : "rgba(0,0,0,0.35)",
    color: active ? accent : "rgba(255,255,255,0.7)",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

export default function ObservatoryControlDesk() {
  const [hydrated, setHydrated] = useState(false);
  const [panel, setPanel] = useState<DeskPanelId>("overview");
  const [period, setPeriod] = useState<DeskPeriod>("today");
  const [mode, setMode] = useState<DeskWorkspaceMode>("focus");
  const [tiles, setTiles] = useState<DeskTile[]>([]);
  const [maximizedTileId, setMaximizedTileId] = useState<string | null>(null);
  const [activeLayoutId, setActiveLayoutId] = useState<DeskNamedLayoutId>("default");
  const [savedLayouts, setSavedLayouts] = useState<ObservatoryDeskState["savedLayouts"]>({});
  const [roomFetch, setRoomFetch] = useState<"loading" | "ok" | "empty" | "error">("loading");
  const [revenueMode, setRevenueMode] = useState<RevenueMode>("loading");
  const [directorTel, setDirectorTel] = useState<PresentationDirectorTelemetry | null>(null);

  useEffect(() => {
    const saved = loadObservatoryDeskState();
    setPanel(saved.panel);
    setPeriod(saved.period);
    setMode(saved.mode);
    setTiles(saved.tiles);
    setMaximizedTileId(saved.maximizedTileId);
    setActiveLayoutId(saved.activeLayoutId);
    setSavedLayouts(saved.savedLayouts);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveObservatoryDeskState({
      panel,
      period,
      mode,
      tiles,
      maximizedTileId,
      activeLayoutId,
      savedLayouts,
    });
  }, [hydrated, panel, period, mode, tiles, maximizedTileId, activeLayoutId, savedLayouts]);

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

  const selectPanel = (id: DeskPanelId) => {
    setPanel(id);
    setTiles((prev) => {
      const next = setFocusPanelInTiles(prev, id, mode);
      if (mode === "layout" && maximizedTileId) {
        const match = next.find((t) => t.panelId === id && !t.hidden);
        if (match) setMaximizedTileId(match.id);
      }
      return next;
    });
    if (mode === "focus") setMaximizedTileId(null);
    setActiveLayoutId("custom");
  };

  const switchMode = (next: DeskWorkspaceMode) => {
    setMode(next);
    setMaximizedTileId(null);
    setTiles((prev) => setFocusPanelInTiles(prev, panel, next));
    setActiveLayoutId("custom");
  };

  const currentDeskState = (): ObservatoryDeskState => ({
    panel,
    period,
    mode,
    tiles,
    maximizedTileId,
    activeLayoutId,
    savedLayouts,
  });

  const loadLayout = (layoutId: DeskNamedLayoutId) => {
    const next = applyNamedLayout(currentDeskState(), layoutId);
    setPanel(next.panel);
    setMode(next.mode);
    setTiles(next.tiles);
    setMaximizedTileId(next.maximizedTileId);
    setActiveLayoutId(next.activeLayoutId);
  };

  const resetLayout = () => {
    const fresh = resetToDefaultLayout();
    setPanel(fresh.panel);
    setMode(fresh.mode);
    setTiles(fresh.tiles);
    setMaximizedTileId(null);
    setActiveLayoutId("default");
    setSavedLayouts({});
  };

  const persistActiveLayout = () => {
    const target: DeskNamedLayoutId =
      activeLayoutId === "custom" || activeLayoutId === "default" ? "custom" : activeLayoutId;
    const next = saveCurrentAsLayout(currentDeskState(), target);
    setSavedLayouts(next.savedLayouts);
    setActiveLayoutId(next.activeLayoutId);
  };

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
      data-phase="2"
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
          maxHeight: 720,
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
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", padding: "0 4px 6px" }}>
          {mode === "focus"
            ? "Focus mode — rail sets primary module"
            : "Layout mode — rail focuses / adds tile"}
        </div>
        {DESK_RAIL_ITEMS.map((item) => {
          const h = health[item.id] ?? "gray";
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
              Focus:{" "}
              <strong style={{ color: "#00FFFF" }}>{deskPanelLabel(panel)}</strong>
              {" · "}
              Mode:{" "}
              <strong style={{ color: mode === "layout" ? "#FF2DAA" : "#00FFFF" }}>
                {mode === "layout" ? "Layout" : "Focus"}
              </strong>
              {" · "}
              Health ≠ Selection (cyan = selected)
            </div>
          </div>

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

        {/* Workspace Manager toolbar */}
        <div
          data-desk-workspace-toolbar
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 6,
            padding: "6px 8px",
            borderRadius: 8,
            border: "1px solid rgba(255,45,170,0.28)",
            background: "rgba(0,0,0,0.28)",
          }}
        >
          <span
            style={{
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: "0.12em",
              color: "#FF2DAA",
              textTransform: "uppercase",
              marginRight: 4,
            }}
          >
            Workspace
          </span>
          <button type="button" style={toolbarBtn(mode === "focus")} onClick={() => switchMode("focus")}>
            Focus
          </button>
          <button
            type="button"
            style={toolbarBtn(mode === "layout", "#FF2DAA")}
            onClick={() => switchMode("layout")}
          >
            Layout
          </button>

          <span style={{ width: 1, height: 16, background: "rgba(255,255,255,0.15)", margin: "0 4px" }} />

          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <button type="button" style={toolbarBtn(activeLayoutId === "single-monitor", "#00FFFF")} onClick={() => loadLayout("single-monitor")}>
              🖥️ 1-Mon
            </button>
            <button type="button" style={toolbarBtn(activeLayoutId === "dual-monitor", "#00FFFF")} onClick={() => loadLayout("dual-monitor")}>
              🖥️🖥️ 2-Mon
            </button>
            <button type="button" style={toolbarBtn(activeLayoutId === "quad-monitor", "#00FFFF")} onClick={() => loadLayout("quad-monitor")}>
              🔲 4-Mon
            </button>
            <button type="button" style={toolbarBtn(activeLayoutId === "16-tile-matrix", "#FF2DAA")} onClick={() => loadLayout("16-tile-matrix")}>
              🔢 16-Tile Matrix
            </button>
          </div>

          <span style={{ width: 1, height: 16, background: "rgba(255,255,255,0.15)", margin: "0 4px" }} />

          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9 }}>
            <span style={{ color: "rgba(255,255,255,0.45)", fontWeight: 800, letterSpacing: "0.08em" }}>
              LAYOUT
            </span>
            <select
              value={activeLayoutId}
              onChange={(e) => {
                const value = e.target.value as DeskNamedLayoutId | "reset";
                if (value === "reset") {
                  resetLayout();
                  return;
                }
                loadLayout(value);
              }}
              style={{
                background: "rgba(0,0,0,0.55)",
                color: "#fff",
                border: "1px solid rgba(0,255,255,0.35)",
                borderRadius: 6,
                padding: "4px 8px",
                fontSize: 10,
                fontWeight: 700,
                fontFamily: "inherit",
              }}
            >
              {NAMED_LAYOUT_PRESETS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                  {savedLayouts[l.id] ? " ★" : ""}
                </option>
              ))}
              <option value="custom">Custom (current)</option>
              <option value="reset">Reset to default</option>
            </select>
          </label>

          <button type="button" style={toolbarBtn(false, "#FFD700")} onClick={persistActiveLayout}>
            Save Layout
          </button>
          <button type="button" style={toolbarBtn(false, "#9CA3AF")} onClick={resetLayout}>
            Reset
          </button>
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
          ) : mode === "focus" ? (
            <DeskPanelContent panel={panel} period={period} />
          ) : (
            <ObservatoryWorkspaceGrid
              period={period}
              focusPanel={panel}
              tiles={tiles}
              maximizedTileId={maximizedTileId}
              onTilesChange={(next) => {
                setTiles(next);
                setActiveLayoutId("custom");
              }}
              onMaximizedChange={setMaximizedTileId}
              onFocusPanel={setPanel}
            />
          )}
        </div>
      </section>
    </div>
  );
}
