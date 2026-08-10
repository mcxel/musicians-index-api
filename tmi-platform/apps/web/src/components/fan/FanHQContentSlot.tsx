"use client";

/**
 * Fan HQ bottom drawer slot — Phase A panel switcher (Marcel UX).
 * Mounts FULL WIDTH under the L | media stack | R block.
 * Left-panel buttons: Avatar Fan Lobby + YoPho (primary), plus existing canisters.
 * Re-click active → clears (door closes). Swap button → content swaps.
 * Snappy spring — instant press feel. Rule 26 Fan-only for lobby/inventory.
 * Reuses FanLobbyVenue + cinema skin from FanAvatarLobbyDrawer (dde74945).
 */

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";
import RoleGate from "@/components/auth/RoleGate";
import { PlaylistCanister } from "@/components/canisters/PlaylistCanister";
import { MemoryWallCanister } from "@/components/canisters/MemoryWallCanister";
import { InventoryCanister } from "@/components/canisters/InventoryCanister";
import { DEFAULT_FAN_LOBBY_SKIN_ID } from "@/lib/lobby/FanLobbySkinRegistry";
import YoPhoOpenFullStudioButton from "@/components/yopho/YoPhoOpenFullStudioButton";
const FanLobbyVenue = dynamic(() => import("@/components/live/FanLobbyVenue"), {
  ssr: false,
  loading: () => <SlotLoading label="Loading Avatar Lobby…" />,
});

const YoPhoTradingCard = dynamic(() => import("@/components/yopho/YoPhoTradingCard"), {
  ssr: false,
  loading: () => <SlotLoading label="Loading YoPho Card…" />,
});

export type FanHQSlotPanel = "lobby" | "yopho" | "playlist" | "memory" | "inventory";

/** Primary left-rail controls Marcel called out — keep labels exact. */
/** Prefer CommandCenterShell / FAN_COMMAND_PANELS — kept for leftover imports. */
export const FAN_HQ_PRIMARY_SLOT_PANELS: Array<{
  id: FanHQSlotPanel;
  label: string;
  info: string;
  accent: string;
}> = [
  { id: "lobby", label: "AVATAR FAN LOBBY", info: "Cinema hangout", accent: "#FFD700" },
  { id: "yopho", label: "YOPHO", info: "Page editor", accent: "#FF2DAA" },
  { id: "playlist", label: "PLAYLISTS", info: "Your tracks", accent: "#AA2DFF" },
  { id: "memory", label: "MEMORY WALL", info: "Your moments", accent: "#AA2DFF" },
];

export const FAN_HQ_SECONDARY_SLOT_PANELS: Array<{
  id: FanHQSlotPanel;
  label: string;
  info: string;
}> = [
  { id: "inventory", label: "INVENTORY", info: "Wearables" },
];

/** @deprecated use PRIMARY + SECONDARY — kept for any leftover imports */
export const FAN_HQ_SLOT_PANELS = [
  ...FAN_HQ_PRIMARY_SLOT_PANELS.map(({ id, label, info }) => ({ id, label, info })),
  ...FAN_HQ_SECONDARY_SLOT_PANELS,
];

interface FanHQContentSlotProps {
  activePanel: FanHQSlotPanel | null;
  fanId: string;
  fanDisplayName: string;
  onClose?: () => void;
}

/** Snappy — press → open, not a sluggish overlay */
const snapIn = { type: "spring" as const, stiffness: 520, damping: 34, mass: 0.7 };
const snapOut = { type: "spring" as const, stiffness: 480, damping: 38, mass: 0.65 };

function SlotLoading({ label }: { label: string }) {
  return (
    <div
      style={{
        minHeight: 240,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.35)",
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
  );
}

function FanYoPhoSlotEditor({
  fanDisplayName,
  fanId,
}: {
  fanDisplayName: string;
  fanId: string;
}) {
  return (
    <div style={{ padding: "12px 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "#FF2DAA" }}>
            YOPHO CARD · WHO I AM RIGHT NOW
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
            Interactive motor card · song · share URL
          </div>
        </div>
        <YoPhoOpenFullStudioButton role="fan" userId={fanId} label="FULL STUDIO →" />
      </div>
      <YoPhoTradingCard
        role="fan"
        displayName={fanDisplayName}
        userKey={fanId}
        compact
        showEditor
        showShare
        showMoneyCtas
      />
    </div>
  );
}

export default function FanHQContentSlot({
  activePanel,
  fanId,
  fanDisplayName,
  onClose,
}: FanHQContentSlotProps) {
  const roomId = useMemo(() => `fan-lobby-hq-${fanId}`, [fanId]);
  const open = activePanel != null;
  const title =
    activePanel === "lobby"
      ? "AVATAR FAN LOBBY · CINEMA SKIN"
      : activePanel === "yopho"
        ? "YOPHO PAGE EDITOR"
        : activePanel === "playlist"
          ? "PLAYLISTS"
          : activePanel === "memory"
            ? "MEMORY WALL"
            : activePanel === "inventory"
              ? "INVENTORY"
              : "";

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="fan-hq-bottom-drawer"
          initial={{ height: 0, opacity: 0.85 }}
          animate={{ height: "min(94vh, 1080px)", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={open ? snapIn : snapOut}
          style={{
            flexShrink: 0,
            width: "100%",
            overflow: "hidden",
            background: "#050510",
            borderTop: "1px solid rgba(255,215,0,0.35)",
            boxShadow: "0 -16px 40px rgba(0,0,0,0.55)",
            display: "flex",
            flexDirection: "column",
          }}
          role="region"
          aria-label={title || "Fan drawer"}
        >
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 14px",
              background: "rgba(0,0,0,0.72)",
              borderBottom: "1px solid rgba(255,215,0,0.18)",
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: "#FFD700" }}>
              {title}
            </div>
            <div style={{ flex: 1 }} />
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,68,68,0.45)",
                  color: "#FF6666",
                  borderRadius: 8,
                  padding: "5px 10px",
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                }}
              >
                CLOSE
              </button>
            ) : null}
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activePanel ?? "empty"}
                initial={{ y: 28, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -18, opacity: 0 }}
                transition={snapIn}
                style={{ height: "100%", minHeight: 280 }}
              >
                {activePanel === "lobby" ? (
                  <RoleGate
                    allow={["FAN", "ADMIN", "STAFF"]}
                    fallback={
                      <div
                        style={{
                          minHeight: 240,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "rgba(255,255,255,0.45)",
                          fontSize: 12,
                          padding: 24,
                          textAlign: "center",
                        }}
                      >
                        Avatar Fan Lobby is Fan-only (Rule 26). Sign in as a Fan to enter.
                      </div>
                    }
                  >
                    <div style={{ height: "min(42vh, 460px)", minHeight: 300 }}>
                      <FanLobbyVenue
                        roomId={roomId}
                        userName={fanDisplayName}
                        initialSkinId={DEFAULT_FAN_LOBBY_SKIN_ID}
                        embedded
                      />
                    </div>
                  </RoleGate>
                ) : null}

                {activePanel === "yopho" ? (
                  <FanYoPhoSlotEditor fanDisplayName={fanDisplayName} fanId={fanId} />
                ) : null}

                {activePanel === "playlist" ? (
                  <div style={{ padding: 12 }}>
                    <PlaylistCanister entityId={fanId} entityName={fanDisplayName} isOwner accentColor="#AA2DFF" />
                  </div>
                ) : null}

                {activePanel === "memory" ? (
                  <div style={{ padding: 12 }}>
                    <MemoryWallCanister entityId={fanId} entityType="fan" title="Memory Wall" accentColor="#AA2DFF" />
                  </div>
                ) : null}

                {activePanel === "inventory" ? (
                  <RoleGate
                    allow={["FAN", "ADMIN", "STAFF"]}
                    fallback={
                      <div
                        style={{
                          minHeight: 160,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "rgba(255,255,255,0.45)",
                          fontSize: 12,
                          padding: 24,
                          textAlign: "center",
                        }}
                      >
                        Inventory is Fan-only (Rule 26).
                      </div>
                    }
                  >
                    <div style={{ padding: 12 }}>
                      <InventoryCanister accentColor="#FF6B35" />
                    </div>
                  </RoleGate>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
