/**
 * FloatingWorkspacePanel — Pass 8.x holographic overlay (blueprint North Star).
 *
 * Fixed HUD layers stay fixed. This panel floats over the stage with glass/glow
 * neon-purple canister chrome matching Inventory + Memory Wall blueprint cards.
 * Open: ~170ms scale 98→100%, fade, slide up 20px. Close: ~150ms reverse. No bounce.
 */

"use client";

import { useEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import RoleGate from "@/components/auth/RoleGate";
import { InventoryCanister } from "@/components/canisters/InventoryCanister";
import { MemoryWallCanister } from "@/components/canisters/MemoryWallCanister";
import { PlaylistCanister } from "@/components/canisters/PlaylistCanister";
import { BookingCanister } from "@/components/canisters/BookingCanister";
import MessagesWidget from "@/components/widgets/MessagesWidget";
import MemoryWallMotionGrid from "@/components/memory/MemoryWallMotionGrid";
import MediaCard from "@/components/memory/MediaCard";
import VenueConcierge from "@/components/workspace/VenueConcierge";
import { useMemoryLibrary } from "@/hooks/useMemoryLibrary";
import {
  FLOATING_WORKSPACE_MODULE_CATALOG,
  modulesForRole,
  type FloatingWorkspaceModuleId,
} from "@/lib/workspace/FloatingWorkspaceModules";
import { useFloatingWorkspace } from "@/lib/workspace/floatingWorkspaceStore";

const PANEL_GLASS: CSSProperties = {
  background: "rgba(10, 10, 26, 0.92)",
  backdropFilter: "blur(22px)",
  border: "1px solid rgba(170, 45, 255, 0.4)",
  borderRadius: 16,
  boxShadow:
    "0 16px 48px rgba(0, 0, 0, 0.75), 0 0 32px rgba(170, 45, 255, 0.22), inset 0 1px 0 rgba(255,255,255,0.06)",
  color: "#fff",
  fontFamily: "'Inter', sans-serif",
};

function ModuleTabStrip({
  moduleIds,
  active,
  onSelect,
}: {
  moduleIds: FloatingWorkspaceModuleId[];
  active: FloatingWorkspaceModuleId;
  onSelect: (id: FloatingWorkspaceModuleId) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        overflowX: "auto",
        paddingBottom: 2,
        marginBottom: 12,
      }}
    >
      {moduleIds.map((id) => {
        const def = FLOATING_WORKSPACE_MODULE_CATALOG[id];
        const isActive = id === active;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            title={def.description}
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "6px 10px",
              borderRadius: 8,
              border: isActive
                ? "1px solid rgba(255,45,170,0.65)"
                : "1px solid rgba(255,255,255,0.12)",
              background: isActive
                ? "linear-gradient(135deg, rgba(255,45,170,0.35), rgba(170,45,255,0.3))"
                : "rgba(255,255,255,0.04)",
              color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            <span>{def.icon}</span>
            <span>{def.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function QuickMemoriesModule({
  onViewAll,
}: {
  onViewAll: () => void;
}) {
  const { recent, loading, error } = useMemoryLibrary({ take: 8, enabled: true });

  return (
    <div>
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.1em",
          color: "rgba(255,255,255,0.55)",
          marginBottom: 10,
        }}
      >
        RECENT FROM MEMORY WALL
      </div>
      {loading && (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>Loading memories…</div>
      )}
      {!loading && error && (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
          Unable to load memories. Retry from Memory Wall.
        </div>
      )}
      {!loading && !error && recent.length === 0 && (
        <div
          style={{
            padding: 14,
            borderRadius: 12,
            border: "1px dashed rgba(0,229,255,0.3)",
            color: "rgba(255,255,255,0.65)",
            fontSize: 12,
          }}
        >
          No memories yet. Capture from Camera to fill this shelf.
        </div>
      )}
      {!loading && recent.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}
        >
          {recent.slice(0, 4).map((item, index) => (
            <MediaCard key={item.id} item={item} index={index} compact />
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={onViewAll}
        style={{
          width: "100%",
          marginTop: 14,
          padding: "12px 0",
          borderRadius: 10,
          background: "linear-gradient(135deg,#00E5FF,#AA2DFF)",
          border: "none",
          color: "#000",
          fontSize: 11,
          fontWeight: 900,
          letterSpacing: "0.1em",
          cursor: "pointer",
          boxShadow: "0 0 20px rgba(0,229,255,0.35)",
        }}
      >
        VIEW ALL MEMORIES
      </button>
    </div>
  );
}

function HonestAnalyticsModule({ mode }: { mode: "fan" | "performer" | "live" }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        border: "1px solid rgba(170,45,255,0.3)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8 }}>
        {mode === "live" ? "Live Analytics" : mode === "performer" ? "Performer Analytics" : "Fan Analytics"}
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
        Metrics appear here when backed by real session or wallet data. No demo
        counts from the HUD blueprint are shown (Rule 20).
      </div>
      <div style={{ marginTop: 12, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
        Status: honest empty — waiting for live signals.
      </div>
    </div>
  );
}

function ScheduleModule() {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 12,
        border: "1px dashed rgba(255,215,0,0.3)",
        color: "rgba(255,255,255,0.7)",
        fontSize: 12,
      }}
    >
      No scheduled dates yet. Book a venue from Venue Concierge or Booking to
      populate this list.
    </div>
  );
}

function ModuleBody({
  moduleId,
  onOpenMemoryWall,
}: {
  moduleId: FloatingWorkspaceModuleId;
  onOpenMemoryWall: () => void;
}): ReactNode {
  switch (moduleId) {
    case "venue_concierge":
      return <VenueConcierge />;
    case "avatar_inventory":
      return (
        <RoleGate
          allow={["FAN", "ADMIN", "STAFF"]}
          fallback={
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
              Avatar Inventory is Fan-only (Rule 26).
            </div>
          }
        >
          <InventoryCanister accentColor="#AA2DFF" />
        </RoleGate>
      );
    case "quick_memories":
      return <QuickMemoriesModule onViewAll={onOpenMemoryWall} />;
    case "memory_wall":
      return (
        <MemoryWallMotionGrid
          accentColor="#00E5FF"
          title="MEMORY WALL"
          compact
          take={40}
        />
      );
    case "collections":
      return (
        <MemoryWallCanister
          entityId="session"
          entityType="fan"
          title="Collections"
          accentColor="#AA2DFF"
          useSessionOwner
        />
      );
    case "analytics":
      return <HonestAnalyticsModule mode="fan" />;
    case "live_analytics":
      return <HonestAnalyticsModule mode="live" />;
    case "camera":
      return (
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            border: "1px solid rgba(0,229,255,0.28)",
            background: "rgba(0,229,255,0.06)",
            fontSize: 12,
            color: "rgba(255,255,255,0.75)",
            lineHeight: 1.5,
          }}
        >
          Camera capture stays on the dock control (📷 CAMERA) so the stage HUD
          never reflows. Tap CAMERA on the mid bar to capture a real photo into
          Memory Wall.
        </div>
      );
    case "messages":
      return <MessagesWidget />;
    case "schedule":
      return <ScheduleModule />;
    case "booking":
      return (
        <BookingCanister
          entityId="self"
          entityType="performer"
          accentColor="#FFD700"
          showRequestForm
        />
      );
    case "music":
      return (
        <PlaylistCanister
          entityId="self"
          entityName="Your Music"
          accentColor="#AA2DFF"
          isOwner
        />
      );
    default:
      return null;
  }
}

export default function FloatingWorkspacePanel() {
  const { isOpen, activeModuleId, role, close, setModule, setRole } =
    useFloatingWorkspace();

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store", credentials: "include" })
      .then((r) => r.json())
      .then((d: { role?: string | null }) => {
        if (active && d.role) setRole(d.role);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [setRole]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  const moduleIds = useMemo(() => modulesForRole(role), [role]);
  const activeDef = FLOATING_WORKSPACE_MODULE_CATALOG[activeModuleId];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="floating-workspace"
          role="dialog"
          aria-label="Floating workspace"
          initial={{ opacity: 0, y: 20, scale: 0.98, x: "-50%" }}
          animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
          exit={{ opacity: 0, y: 16, scale: 0.98, x: "-50%" }}
          transition={{ duration: 0.17, ease: "easeOut" }}
          style={{
            position: "fixed",
            left: "50%",
            bottom: 118,
            width: "min(720px, calc(100vw - 48px))",
            maxHeight: "min(62vh, 560px)",
            zIndex: 9600,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            pointerEvents: "auto",
            ...PANEL_GLASS,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              background: "linear-gradient(90deg, rgba(170,45,255,0.18), transparent)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>{activeDef.icon}</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                {activeDef.label}
              </span>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close floating workspace"
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.5)",
                fontSize: 16,
                cursor: "pointer",
                padding: "2px 6px",
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: "12px 16px 16px", overflow: "auto", flex: 1, minHeight: 0 }}>
            <ModuleTabStrip
              moduleIds={moduleIds}
              active={activeModuleId}
              onSelect={setModule}
            />
            <ModuleBody
              moduleId={activeModuleId}
              onOpenMemoryWall={() => setModule("memory_wall")}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
