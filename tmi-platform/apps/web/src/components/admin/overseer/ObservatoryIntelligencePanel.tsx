"use client";

/**
 * ObservatoryIntelligencePanel — Intelligence Deck client (BELOW Live Channel Ticker).
 * Presentation telemetry + Platform Core health + live room status from real registries.
 * Rule 20: no fake counts; honest empty when idle / no sessions.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AwrRenderHealthPanel from "@/components/admin/overseer/AwrRenderHealthPanel";
import ShowPackageDirector, {
  type ActiveShowPackageSnapshot,
} from "@/lib/presentation/ShowPackageDirector";
import {
  ensurePresentationDirectorsStarted,
  PresentationTelemetryDirector,
  type PresentationDirectorTelemetry,
} from "@/lib/presentation/directors";
import { listFrameworkManifests } from "@/lib/platform/FrameworkRegistry";
import { listCapabilityMatrix } from "@/lib/platform/PlatformCapabilityMatrix";
import { sanitizeWallHostLabel } from "@/lib/lobby/wallPublicIdentity";

type LiveSessionRow = {
  roomId?: string;
  title?: string;
  category?: string;
  displayName?: string;
  stageState?: string;
  viewerCount?: number;
};

function SectionLabel({ children, accent }: { children: string; accent: string }) {
  return (
    <div
      style={{
        fontSize: 9,
        letterSpacing: "0.18em",
        color: accent,
        fontWeight: 900,
        textTransform: "uppercase",
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function DestLink({ href, label, accent }: { href: string; label: string; accent: string }) {
  return (
    <Link
      href={href}
      style={{
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: accent,
        textDecoration: "none",
        border: `1px solid ${accent}55`,
        borderRadius: 999,
        padding: "3px 10px",
        background: `${accent}14`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Link>
  );
}

export default function ObservatoryIntelligencePanel() {
  const [showPack, setShowPack] = useState<ActiveShowPackageSnapshot>(() =>
    ShowPackageDirector.getSnapshot(),
  );
  const [directorTel, setDirectorTel] = useState<PresentationDirectorTelemetry | null>(null);
  const [sessions, setSessions] = useState<LiveSessionRow[]>([]);
  const [roomStatus, setRoomStatus] = useState<"loading" | "live" | "empty" | "error">("loading");

  const frameworks = useMemo(() => listFrameworkManifests(), []);
  const matrix = useMemo(() => listCapabilityMatrix(), []);

  const frameworkStats = useMemo(() => {
    const certified = frameworks.filter((f) => f.certificationStatus === "CERTIFIED").length;
    const testing = frameworks.filter((f) => f.certificationStatus === "TESTING").length;
    const draft = frameworks.filter((f) => f.certificationStatus === "DRAFT").length;
    return { total: frameworks.length, certified, testing, draft };
  }, [frameworks]);

  const matrixStats = useMemo(() => {
    const ok = matrix.filter((r) => r.certified === "✅").length;
    const partial = matrix.filter((r) => r.certified === "⚠️").length;
    const missing = matrix.filter((r) => r.certified === "❌").length;
    return { total: matrix.length, ok, partial, missing };
  }, [matrix]);

  useEffect(() => {
    ensurePresentationDirectorsStarted();
    const unsubPack = ShowPackageDirector.subscribe(setShowPack);
    const unsubTel = PresentationTelemetryDirector.subscribe(setDirectorTel);
    return () => {
      unsubPack();
      unsubTel();
    };
  }, []);

  useEffect(() => {
    let active = true;

    const poll = async () => {
      try {
        const res = await fetch("/api/live/go", { cache: "no-store" });
        if (!res.ok) {
          if (active) {
            setSessions([]);
            setRoomStatus("error");
          }
          return;
        }
        const data = (await res.json()) as { sessions?: LiveSessionRow[] };
        if (!active) return;
        const next = data.sessions ?? [];
        setSessions(next);
        setRoomStatus(next.length > 0 ? "live" : "empty");
      } catch {
        if (active) {
          setSessions([]);
          setRoomStatus("error");
        }
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

  const activeDirectors =
    directorTel?.directors.filter((d) => d.directorId !== "telemetry" && d.status === "ACTIVE")
      .length ?? 0;

  return (
    <div
      data-intel="observatory-convergence"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        height: "100%",
        minHeight: 0,
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
      }}
    >
      {/* Presentation telemetry */}
      <section
        style={{
          borderRadius: 10,
          border: "1px solid rgba(0,255,255,0.28)",
          background: "rgba(0,255,255,0.04)",
          padding: 12,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <SectionLabel accent="#00FFFF">Presentation Telemetry</SectionLabel>
          <DestLink href="/admin/presentation-preview" label="Open Preview →" accent="#00FFFF" />
        </div>
        <div style={{ display: "grid", gap: 4, fontSize: 11 }}>
          <div>
            Pack:{" "}
            <strong style={{ color: "#00FFFF" }}>
              {showPack.packName || showPack.packId || "NONE"}
            </strong>{" "}
            · Mode: <strong>{showPack.mode}</strong>
          </div>
          <div>
            State: <strong>{showPack.presentationState}</strong> · Phase:{" "}
            <strong>{showPack.phaseLabel ?? "NONE"}</strong>
          </div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 10 }}>
            {directorTel
              ? `Directors ACTIVE: ${activeDirectors} · Broadcast hint: ${directorTel.suggestedBroadcastRoomType} · Monitors: ${directorTel.monitorAllocations}`
              : "Director telemetry idle — open preview to exercise packs."}
          </div>
        </div>
      </section>

      <AwrRenderHealthPanel />

      {/* Platform Core health */}
      <section
        style={{
          borderRadius: 10,
          border: "1px solid rgba(255,215,0,0.28)",
          background: "rgba(255,215,0,0.04)",
          padding: 12,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <SectionLabel accent="#FFD700">Platform Core Health</SectionLabel>
          <DestLink href="/admin/platform-core" label="Open Core →" accent="#FFD700" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
          <div>
            Frameworks: <strong style={{ color: "#FFD700" }}>{frameworkStats.total}</strong>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              ✅ {frameworkStats.certified} · ⚠ {frameworkStats.testing} · draft {frameworkStats.draft}
            </div>
          </div>
          <div>
            Capability rows: <strong style={{ color: "#FFD700" }}>{matrixStats.total}</strong>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              ✅ {matrixStats.ok} · ⚠ {matrixStats.partial} · ❌ {matrixStats.missing}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
          Registry-backed only — not an autonomous god-runtime.
        </div>
      </section>

      {/* Room / runtime status */}
      <section
        style={{
          borderRadius: 10,
          border: "1px solid rgba(0,255,136,0.28)",
          background: "rgba(0,255,136,0.04)",
          padding: 12,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <SectionLabel accent="#00FF88">Live Room Runtime</SectionLabel>
          <span style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: "0.08em" }}>
            {roomStatus === "loading"
              ? "LOADING…"
              : roomStatus === "error"
                ? "UNAVAILABLE"
                : `${sessions.length} SESSION${sessions.length === 1 ? "" : "S"}`}
          </span>
        </div>

        {roomStatus === "loading" && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>Loading live sessions…</div>
        )}
        {roomStatus === "error" && (
          <div style={{ fontSize: 11, color: "#fb7185" }}>
            Unable to load GlobalLiveSessionRegistry. Retry shortly.
          </div>
        )}
        {roomStatus === "empty" && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
            No active rooms. Sessions appear here when creators go live.
          </div>
        )}
        {roomStatus === "live" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, overflowY: "auto", minHeight: 0 }}>
            {sessions.slice(0, 12).map((session, index) => (
              <div
                key={session.roomId ?? `${session.title ?? "room"}-${index}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(0,0,0,0.25)",
                  fontSize: 10,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {session.title ||
                      sanitizeWallHostLabel(session.displayName, { hostUserId: session.roomId }) ||
                      session.roomId ||
                      "Live Room"}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                    {(session.category ?? "live").toUpperCase()}
                    {session.stageState ? ` · ${session.stageState}` : ""}
                  </div>
                </div>
                <span style={{ color: "#00FF88", fontWeight: 900, flexShrink: 0 }}>
                  {typeof session.viewerCount === "number" ? session.viewerCount : "—"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
