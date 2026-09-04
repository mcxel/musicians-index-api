"use client";

/**
 * LEGACY / UNMOUNTED — do not route.
 *
 * Second admin shell built without knowledge of the 2026-07-29 Marcel mandate
 * that made OverseerFlightDeck (mounted at /admin/overseer) canonical. Has
 * zero production route consumers. Pending deletion after a final
 * zero-dependency confirmation pass — see OverseerDeck.tsx for detail.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import BackButton from "@/components/navigation/BackButton";
import AdminChainCommand from "@/components/admin/AdminChainCommand";
import AdminSecurityWall from "@/components/admin/AdminSecurityWall";
import AdminRevenuePanel from "@/components/admin/AdminRevenuePanel";
import AdminMagazineAnalytics from "@/components/admin/AdminMagazineAnalytics";
import AdminAccountLinker from "@/components/admin/AdminAccountLinker";
import AdminLiveFeedExplorer from "@/components/admin/AdminLiveFeedExplorer";
import AdminMonitorRouter from "@/components/admin/AdminMonitorRouter";
import AdminRuntimePanel from "@/components/admin/AdminRuntimePanel";
import { ADMIN_ROUTE_LIST, getAdminRouteById, type AdminSectionId } from "@/lib/adminRouteMap";
import { emitBigAceEvent, emitSystemEvent, getSystemEventLog, subscribeSystemEvent } from "@/lib/systemEventBus";
import AdminMotionLayer from "@/components/motion/AdminMotionLayer";
import OverseerDeck from "./OverseerDeck";
import AdminMotionHUD from "@/components/admin/AdminMotionHUD";
import RoleSwitcherWidget from "@/components/navigation/RoleSwitcherWidget";
import RoleHubAccountMenu from "@/components/navigation/RoleHubAccountMenu";

// Map admin section IDs to their respective components for inline rendering
const COMPONENT_MAP = {
  "chain-command": AdminChainCommand,
  "security": AdminSecurityWall,
  "integrations": AdminAccountLinker,
  "billing": AdminRevenuePanel,
  "bots": AdminLiveFeedExplorer,
  "live-feed": AdminLiveFeedExplorer,
  "artist-analytics": AdminMagazineAnalytics,
  "magazine-analytics": AdminMagazineAnalytics,
  "role-previews": AdminRuntimePanel,
  "user-management": AdminRuntimePanel,
} as const;

export default function AdminHubShell() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams() ?? undefined;

  const monitorParam = searchParams?.get("monitor") ?? null;
  const selectedTarget = useMemo(() => getAdminRouteById(monitorParam), [monitorParam]);
  const selectedId = selectedTarget.id;

  const [eventCount, setEventCount] = useState(() => getSystemEventLog().length);
  const [isMobile, setIsMobile] = useState(true);
  const [mobileAdminTab, setMobileAdminTab] = useState<"command" | "monitor" | "intel">("monitor");
  // State for currently displayed inline admin component (slot)
  const [inlineComponentId, setInlineComponentId] = useState<AdminSectionId | null>(null);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const apply = () => setIsMobile(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    return subscribeSystemEvent(() => {
      setEventCount(getSystemEventLog().length);
    });
  }, []);

  const selectSection = useCallback(
    (id: AdminSectionId) => {
      const target = getAdminRouteById(id);
      const nextParams = new URLSearchParams(searchParams?.toString() ?? "");
      nextParams.set("monitor", target.id);
      nextParams.set("route", target.route);
      router.push(`${pathname}?${nextParams.toString()}`);
        setInlineComponentId(id);

      emitSystemEvent({
        type: "admin.monitor.select",
        actor: "Admin Operator",
        sectionId: target.id,
        route: target.route,
        message: `Selected ${target.label} (${target.route})`,
      });

      emitBigAceEvent(target.id, target.route);
    },
    [pathname, router, searchParams],
  );

  const openFullView = useCallback(() => {
    emitSystemEvent({
      type: "admin.monitor.open",
      actor: "Admin Operator",
      sectionId: selectedTarget.id,
      route: selectedTarget.route,
      message: `Open Full View: ${selectedTarget.route}`,
    });
    router.push(selectedTarget.route);
  }, [router, selectedTarget.id, selectedTarget.route]);

  const hudEvents = useMemo(
    () =>
      getSystemEventLog()
        .slice(-10)
        .map((e, i) => ({
          id: String(i),
          message: (e as { message?: string }).message ?? "",
          level: ((e as { type?: string }).type?.includes("security") ? "critical" : (e as { type?: string }).type?.includes("error") ? "warning" : "info") as "info" | "warning" | "critical" | "resolved",
          timestamp: Date.now() - (9 - i) * 1000,
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [eventCount],
  );

  return (
    <AdminMotionLayer>
    <main
      data-testid="admin-hub-shell"
      aria-label="Administration hub shell"
      data-fallback-route="/home/1"
      style={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        background:
          "radial-gradient(circle at 10% 0%, rgba(250,204,21,0.18), transparent 38%), radial-gradient(circle at 90% 5%, rgba(168,85,247,0.2), transparent 35%), #03020b",
        color: "#e2e8f0",
        overflowX: "clip",
        boxSizing: "border-box",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid rgba(251,191,36,0.4)",
          background: "linear-gradient(90deg, rgba(28,12,44,0.95), rgba(14,9,27,0.94))",
          backdropFilter: "blur(8px)",
          padding: "10px 14px",
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <BackButton fallback="/home/1" label="← Back" />
        <strong style={{ color: "#fcd34d", letterSpacing: "0.18em", fontSize: 11 }}>OVERSEER DECK</strong>
        <strong style={{ color: "#c4b5fd", letterSpacing: "0.16em", fontSize: 11 }}>ADMINISTRATION HUB</strong>
        <button
          type="button"
          data-testid="admin-open-big-ace"
          onClick={() => router.push("/admin/big-ace")}
          style={{
            borderRadius: 8,
            border: "1px solid rgba(250,204,21,0.7)",
            background: "rgba(120,53,15,0.35)",
            color: "#fde68a",
            fontSize: 10,
            letterSpacing: "0.08em",
            padding: "5px 8px",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Big Ace Deck
        </button>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <RoleHubAccountMenu accentColor="#FFD700" />
          <RoleSwitcherWidget accentColor="#FFD700" buttonLabel="SWITCH ROLE" />
          <span style={{ color: "#99f6e4", fontSize: 11 }}>event bus logs: {eventCount}</span>
        </div>
      </header>

      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, width: "100%", maxWidth: "100%", minWidth: 0, boxSizing: "border-box" }}>
          {/* Mobile tab bar — one surface at a time (no 290|1fr|320 desktop matrix) */}
          <div style={{ display: "flex", gap: 6, width: "100%", minWidth: 0 }}>
            {(["command", "monitor", "intel"] as const).map((tab) => {
              const labels = { command: "COMMAND", monitor: "MONITOR", intel: "INTEL" } as const;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMobileAdminTab(tab)}
                  style={{
                    flex: 1,
                    padding: "7px 4px",
                    borderRadius: 8,
                    border: `1px solid ${mobileAdminTab === tab ? "rgba(250,204,21,0.8)" : "rgba(148,163,184,0.25)"}`,
                    background: mobileAdminTab === tab ? "rgba(250,204,21,0.12)" : "rgba(15,23,42,0.6)",
                    color: mobileAdminTab === tab ? "#fcd34d" : "rgba(255,255,255,0.45)",
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase" as const,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>
          {mobileAdminTab === "command" && (
            <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
              <AdminChainCommand selectedId={selectedId} onSelect={selectSection} />
              <AdminSecurityWall selectedId={selectedId} onSelect={selectSection} />
              <AdminAccountLinker selectedId={selectedId} onSelect={selectSection} />
            </div>
          )}
          {mobileAdminTab === "monitor" && (
            <div style={{ display: "grid", gap: 10 }}>
              <AdminMonitorRouter selectedTarget={selectedTarget} onOpenFullView={openFullView} />
              <AdminLiveFeedExplorer />
            </div>
          )}
          {mobileAdminTab === "intel" && (
            <div style={{ display: "grid", gap: 10 }}>
              <AdminRevenuePanel selectedId={selectedId} onSelect={selectSection} />
              <AdminMagazineAnalytics selectedId={selectedId} onSelect={selectSection} />
              <AdminRuntimePanel />
            </div>
          )}
        </div>
      ) : (
        <OverseerDeck
          inlinePanel={
            inlineComponentId ? (
              <div>
                <button
                  type="button"
                  onClick={() => setInlineComponentId(null)}
                  style={{
                    marginBottom: 8,
                    background: "rgba(250,204,21,0.12)",
                    border: "1px solid rgba(250,204,21,0.5)",
                    borderRadius: 6,
                    color: "#fcd34d",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Close
                </button>
                {(() => {
                  const Component = COMPONENT_MAP[inlineComponentId as keyof typeof COMPONENT_MAP];
                  return Component ? <Component selectedId={selectedId} onSelect={selectSection} /> : null;
                })()}
              </div>
            ) : undefined
          }
        />
      )}

      <footer
        style={{
          borderTop: "1px solid rgba(125,211,252,0.35)",
          background: "linear-gradient(180deg, rgba(8,16,30,0.95), rgba(3,6,16,0.98))",
          padding: "8px 12px",
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(auto-fit,minmax(min(100%,140px),1fr))"
            : "repeat(auto-fit,minmax(180px,1fr))",
          gap: 8,
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        {ADMIN_ROUTE_LIST.filter((item) => item.id !== "monitor").map((item) => {
          const active = item.id === selectedId;
          return (
            <button
              key={item.id}
              type="button"
              data-testid={`admin-route-${item.id}`}
              aria-label={`Open admin section ${item.label}`}
              data-fallback-route="/admin"
              onClick={() => selectSection(item.id)}
              data-clickable="true"
              data-section-id={item.id}
              style={{
                borderRadius: 10,
                border: active ? "1px solid rgba(56,189,248,0.8)" : "1px solid rgba(148,163,184,0.4)",
                background: active ? "rgba(14,116,144,0.2)" : "rgba(15,23,42,0.6)",
                color: active ? "#e0f2fe" : "#cbd5e1",
                textAlign: "left",
                padding: "7px 8px",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>{item.label}</div>
              <div style={{ fontSize: 9, color: "#93c5fd" }}>{item.route}</div>
            </button>
          );
        })}
      </footer>
      <AdminMotionHUD events={hudEvents} />
    </main>
    </AdminMotionLayer>
  );
}
