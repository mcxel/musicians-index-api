"use client";

/**
 * Command Center bottom drawer — Universal Drawer Base + per-module animation.
 * Fan: Avatar Lobby, YoPho, playlists, memory, inventory, live destinations, room controls.
 * Performer: Media Locker, Beat Lab, Performer YoPho, booking, stage, store.
 * Never mounts Fan Lobby ownership / Avatar Studio for performers.
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import RoleGate from "@/components/auth/RoleGate";
import UniversalDrawerBase from "@/components/drawers/UniversalDrawerBase";
import { PlaylistCanister } from "@/components/canisters/PlaylistCanister";
import { MemoryWallCanister } from "@/components/canisters/MemoryWallCanister";
import { InventoryCanister } from "@/components/canisters/InventoryCanister";
import MediaLockerCanister from "@/components/canisters/MediaLockerCanister";
import { BookingCanister } from "@/components/canisters/BookingCanister";
import { StoreCanister } from "@/components/canisters/StoreCanister";
import ThemeEditorPanel from "@/components/shell/ThemeEditorPanel";
import SponsorRail from "@/components/sponsors/SponsorRail";
import { getRailSponsors } from "@/lib/commerce/SponsorRegistry";
import { DEFAULT_FAN_LOBBY_SKIN_ID } from "@/lib/lobby/FanLobbySkinRegistry";
import { defaultRoomAuthority } from "@/lib/lobby/FanLobbyPresence";
import { animationForDrawerModule } from "@/lib/drawers/UniversalDrawerRegistry";
import { PERFORMER_SPONSOR_ZONE } from "./PerformerCommandDrawerRegistry";
import LiveDestinationsDrawerPanel from "./LiveDestinationsDrawerPanel";
import RoomControlsDrawerPanel from "./RoomControlsDrawerPanel";
import {
  createDefaultYoPhoBlueprint,
  type YoPhoPortraitBlueprint,
} from "@/lib/yopho/YoPhoPortraitEngine";
import type { CommandCenterPanelId, CommandCenterRole } from "./commandCenterRegistry";
import {
  FAN_COMMAND_PANELS,
  FAN_DRAWER_SWAP_PANELS,
  isFanOnlyPanel,
} from "./commandCenterRegistry";
import { useTheme } from "@/lib/design/ThemeEngine";

const FanLobbyVenue = dynamic(() => import("@/components/live/FanLobbyVenue"), {
  ssr: false,
  loading: () => <SlotLoading label="Loading Avatar Lobby…" />,
});

const YoPhoPortraitStageCanvas = dynamic(
  () => import("@/components/yopho/YoPhoPortraitStageCanvas"),
  { ssr: false, loading: () => <SlotLoading label="Loading YoPho…" /> },
);

function SlotLoading({ label }: { label: string }) {
  return (
    <div
      style={{
        minHeight: 220,
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

function YoPhoSlot({ role, displayName }: { role: CommandCenterRole; displayName: string }) {
  const [blueprint] = useState<YoPhoPortraitBlueprint>(() =>
    createDefaultYoPhoBlueprint(role === "performer" ? "performer" : "fan", displayName),
  );
  const fullHref = role === "performer" ? "/performer/canvas" : "/fan/canvas";

  return (
    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: "#FF2DAA" }}>
            YOPHO {role === "performer" ? "PERFORMER" : "FAN"} CANVAS
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Stage preview in drawer</div>
        </div>
        <Link
          href={fullHref}
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: "#00FFFF",
            textDecoration: "none",
            border: "1px solid rgba(0,255,255,0.35)",
            borderRadius: 8,
            padding: "6px 12px",
          }}
        >
          FULL EDITOR →
        </Link>
      </div>
      <YoPhoPortraitStageCanvas blueprint={blueprint} height={320} interactive />
    </div>
  );
}

function AnalyticsStub({ role }: { role: CommandCenterRole }) {
  return (
    <RoleGate
      allow={role === "performer" ? ["PERFORMER", "ARTIST", "ADMIN", "STAFF"] : ["FAN", "ADMIN", "STAFF"]}
      fallback={
        <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
          Analytics requires a signed-in {role === "performer" ? "Performer" : "Fan"} session.
        </div>
      }
    >
      <div style={{ padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: "#FFD700", marginBottom: 8 }}>
          ANALYTICS
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.5 }}>
          No analytics data connected yet. Mission-control redesign is deferred — this slot stays honest-empty
          until a real metrics source is wired.
        </p>
      </div>
    </RoleGate>
  );
}

function SponsorsStubFan() {
  return (
    <RoleGate
      allow={["FAN", "ADMIN", "STAFF"]}
      fallback={
        <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
          Sign in as a Fan to view sponsor / advertise paths.
        </div>
      }
    >
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>
          Fan sponsor drawer redesign deferred. Advertise path stays live.
        </p>
        <Link
          href="/sponsors/advertise"
          style={{
            display: "inline-block",
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid rgba(255,215,0,0.45)",
            color: "#FFD700",
            fontWeight: 800,
            fontSize: 12,
            textDecoration: "none",
            width: "fit-content",
          }}
        >
          Advertise here →
        </Link>
      </div>
    </RoleGate>
  );
}

interface CommandCenterDrawerProps {
  role: CommandCenterRole;
  activePanel: CommandCenterPanelId | null;
  /** Special panel: shell appearance (ThemeEngine) */
  appearanceOpen?: boolean;
  userId: string;
  displayName: string;
  onClose: () => void;
  /** Swap module inside the open drawer without navigating away */
  onSelectPanel?: (id: CommandCenterPanelId) => void;
}

export default function CommandCenterDrawer({
  role,
  activePanel,
  appearanceOpen = false,
  userId,
  displayName,
  onClose,
  onSelectPanel,
}: CommandCenterDrawerProps) {
  const theme = useTheme();
  const roomId = useMemo(() => `${role}-lobby-cc-${userId}`, [role, userId]);
  const open = appearanceOpen || activePanel != null;

  const moduleId = appearanceOpen ? "appearance" : activePanel ?? "lobby";
  const animationId = animationForDrawerModule(moduleId);

  const TITLE_MAP: Partial<Record<CommandCenterPanelId, string>> = {
    lobby: "AVATAR FAN LOBBY · CINEMA",
    yopho: "YOPHO",
    media_locker: "MEDIA LOCKER",
    beat_lab: "BEAT LAB",
    booking: "BOOKINGS",
    stage_tools: "STAGE TOOLS",
    store: "STORE",
    sponsors: "SPONSORS",
    playlist: "PLAYLISTS",
    memory: "MEMORY WALL",
    inventory: "INVENTORY",
    live_destinations: "LIVE DESTINATIONS",
    room_controls: "ROOM CONTROLS",
    analytics: "ANALYTICS",
    appearance: "SHELL COLORS",
  };
  const title = appearanceOpen
    ? "SHELL COLORS · THIS DEVICE"
    : (activePanel ? TITLE_MAP[activePanel] : undefined) ?? "DRAWER";

  const accent =
    (activePanel && FAN_COMMAND_PANELS.find((p) => p.id === activePanel)?.accent) ||
    theme.tertiary;

  // Block fan-only panels for performer role (defense in depth)
  if (activePanel && isFanOnlyPanel(activePanel) && role === "performer") {
    return null;
  }

  const swapChips =
    role === "fan" && !appearanceOpen && onSelectPanel ? (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginLeft: 8 }}>
        {FAN_DRAWER_SWAP_PANELS.map((id) => {
          const def = FAN_COMMAND_PANELS.find((p) => p.id === id);
          if (!def) return null;
          const active = activePanel === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectPanel(id)}
              style={{
                fontSize: 8,
                fontWeight: 900,
                letterSpacing: "0.06em",
                padding: "4px 8px",
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: "inherit",
                border: active ? `1px solid ${def.accent}` : "1px solid rgba(255,255,255,0.12)",
                background: active ? `${def.accent}22` : "transparent",
                color: active ? def.accent : "rgba(255,255,255,0.45)",
              }}
            >
              {def.label}
            </button>
          );
        })}
      </div>
    ) : null;

  return (
    <UniversalDrawerBase
      open={open}
      animationId={animationId}
      title={title}
      subtitle={appearanceOpen ? "Saved on this device (ThemeEngine)" : undefined}
      onClose={onClose}
      mode="under_dashboard"
      headerExtra={swapChips}
      accentColor={accent}
      contentKey={appearanceOpen ? "appearance" : activePanel ?? "x"}
    >
      {appearanceOpen ? (
        <div style={{ padding: 12 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "0 0 12px", padding: "0 4px" }}>
            Pick a shell palette for your Command Center. Changes apply instantly and persist on this device —
            not cloud-synced yet.
          </p>
          <ThemeEditorPanel accentColor={theme.primary} />
        </div>
      ) : null}

      {activePanel === "lobby" && role === "fan" ? (
        <RoleGate
          allow={["FAN", "ADMIN", "STAFF"]}
          fallback={
            <div style={{ padding: 24, textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
              Avatar Fan Lobby is Fan-only (Rule 26).
            </div>
          }
        >
          <div style={{ height: "min(42vh, 460px)", minHeight: 300 }}>
            <FanLobbyVenue
              roomId={roomId}
              userName={displayName}
              initialSkinId={DEFAULT_FAN_LOBBY_SKIN_ID}
              roomType="FAN_LOBBY"
              embedded
            />
          </div>
        </RoleGate>
      ) : null}

      {activePanel === "yopho" ? <YoPhoSlot role={role} displayName={displayName} /> : null}

      {activePanel === "playlist" ? (
        <div style={{ padding: 12 }}>
          <PlaylistCanister entityId={userId} entityName={displayName} isOwner accentColor={theme.primary} />
        </div>
      ) : null}

      {activePanel === "memory" ? (
        <div style={{ padding: 12 }}>
          <MemoryWallCanister
            entityId={userId}
            entityType={role === "performer" ? "performer" : "fan"}
            accentColor={theme.secondary}
          />
        </div>
      ) : null}

      {activePanel === "live_destinations" ? (
        <LiveDestinationsDrawerPanel viewerUserId={userId} accentColor={theme.primary} />
      ) : null}

      {activePanel === "room_controls" && role === "fan" ? (
        <RoomControlsDrawerPanel
          userId={userId}
          roomId={roomId}
          roomType="FAN_LOBBY"
          authority={defaultRoomAuthority("FAN_LOBBY", userId)}
          accentColor="#00FF88"
        />
      ) : null}

      {activePanel === "analytics" ? <AnalyticsStub role={role} /> : null}

      {activePanel === "inventory" && role === "fan" ? (
        <RoleGate allow={["FAN", "ADMIN", "STAFF"]} fallback={null}>
          <div style={{ padding: 12 }}>
            <InventoryCanister accentColor={theme.tertiary} />
          </div>
        </RoleGate>
      ) : null}

      {activePanel === "media_locker" && role === "performer" ? (
        <div style={{ padding: 12 }}>
          <MediaLockerCanister userId={userId} role="performer" accentColor={theme.secondary} />
        </div>
      ) : null}

      {activePanel === "beat_lab" && role === "performer" ? (
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            Beat Lab & Competition Vault — open the real vault surfaces.
          </div>
          <Link href="/beat-vault" style={toolLink(theme.tertiary)}>
            Open Beat Vault →
          </Link>
          <Link href="/performer/studio" style={toolLink(theme.primary)}>
            Performer Studio →
          </Link>
        </div>
      ) : null}

      {activePanel === "booking" && role === "performer" ? (
        <div style={{ padding: 12 }}>
          <BookingCanister entityId={userId} entityType="performer" showRequestForm={false} accentColor="#00FF88" />
        </div>
      ) : null}

      {activePanel === "stage_tools" && role === "performer" ? (
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            Stage & broadcast tools — real destinations only.
          </div>
          <Link href="/live/go" style={toolLink(theme.primary)}>
            🔴 Go Live →
          </Link>
          <Link href="/performer/studio" style={toolLink(theme.secondary)}>
            Studio & stage engines →
          </Link>
        </div>
      ) : null}

      {activePanel === "sponsors" && role === "performer" ? (
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            Sponsor placements for your surfaces (Rule 12 — never empty).
          </div>
          <SponsorRail sponsors={getRailSponsors("dashboard-performer")} zone={PERFORMER_SPONSOR_ZONE} />
          <Link
            href="/sponsors/advertise"
            style={{
              display: "inline-block",
              padding: "10px 14px",
              borderRadius: 10,
              border: `1px solid ${theme.tertiary}66`,
              color: theme.tertiary,
              fontWeight: 800,
              fontSize: 12,
              textDecoration: "none",
              width: "fit-content",
            }}
          >
            Advertise / sell a placement →
          </Link>
        </div>
      ) : null}

      {activePanel === "sponsors" && role === "fan" ? <SponsorsStubFan /> : null}

      {activePanel === "store" && role === "performer" ? (
        <div style={{ padding: 12 }}>
          <StoreCanister entityId={userId} entityName={displayName} storeType="performer" accentColor={theme.tertiary} />
        </div>
      ) : null}
    </UniversalDrawerBase>
  );
}

function toolLink(color: string): CSSProperties {
  return {
    display: "inline-block",
    padding: "10px 16px",
    borderRadius: 10,
    background: `${color}22`,
    border: `1px solid ${color}66`,
    color,
    fontWeight: 800,
    fontSize: 12,
    textDecoration: "none",
    width: "fit-content",
  };
}
