"use client";

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
import AdminMotionHUD from "@/components/admin/AdminMotionHUD";

export default function AdminHubShell() {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams() ?? undefined;

  const monitorParam = searchParams?.get("monitor") ?? null;
  const selectedTarget = useMemo(() => getAdminRouteById(monitorParam), [monitorParam]);
  const selectedId = selectedTarget.id;

  const [eventCount, setEventCount] = useState(() => getSystemEventLog().length);

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
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        background:
          "radial-gradient(circle at 10% 0%, rgba(250,204,21,0.18), transparent 38%), radial-gradient(circle at 90% 5%, rgba(168,85,247,0.2), transparent 35%), #03020b",
        color: "#e2e8f0",
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
        <span style={{ marginLeft: "auto", color: "#99f6e4", fontSize: 11 }}>event bus logs: {eventCount}</span>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "290px 1fr 320px", gap: 12, padding: 12, minHeight: 0 }}>
        <div style={{ display: "grid", gap: 10, alignContent: "start" }}>
          <AdminChainCommand selectedId={selectedId} onSelect={selectSection} />
          <AdminSecurityWall selectedId={selectedId} onSelect={selectSection} />
          <AdminAccountLinker selectedId={selectedId} onSelect={selectSection} />
        </div>

        <div style={{ display: "grid", gridTemplateRows: "1fr auto", gap: 10, minHeight: 0 }}>
          <AdminMonitorRouter selectedTarget={selectedTarget} onOpenFullView={openFullView} />
          <AdminLiveFeedExplorer />
        </div>

        <div style={{ display: "grid", gridTemplateRows: "auto auto 1fr", gap: 10, minHeight: 0 }}>
          <AdminRevenuePanel selectedId={selectedId} onSelect={selectSection} />
          <AdminMagazineAnalytics selectedId={selectedId} onSelect={selectSection} />
          <AdminRuntimePanel />
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid rgba(125,211,252,0.35)",
          background: "linear-gradient(180deg, rgba(8,16,30,0.95), rgba(3,6,16,0.98))",
          padding: "8px 12px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 8,
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
