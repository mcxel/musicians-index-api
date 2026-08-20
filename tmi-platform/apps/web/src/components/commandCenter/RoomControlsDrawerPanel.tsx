"use client";

/**
 * ROOM_CONTROLS drawer module — skin switcher (host-gated stub) + gather UX stub.
 * Seating gather is UX only — not a security gate (PartyMigrationIntent).
 */

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  DEFAULT_FAN_LOBBY_SKIN_ID,
  listSwitchableFanLobbySkins,
  type FanLobbySkinId,
} from "@/lib/lobby/FanLobbySkinRegistry";
import {
  canControlRoom,
  createPartyMigrationIntent,
  defaultRoomAuthority,
  type RoomAuthority,
  type SocialRoomType,
} from "@/lib/lobby/FanLobbyPresence";
import { loungeSideRoomEntryHref, SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID } from "@/lib/live/canonicalWorldViewport";

interface RoomControlsDrawerPanelProps {
  userId: string;
  roomId: string;
  roomType?: SocialRoomType;
  authority?: RoomAuthority;
  accentColor?: string;
  /** When true, actor is staff — may control any room. */
  isStaff?: boolean;
}

export default function RoomControlsDrawerPanel({
  userId,
  roomId,
  roomType = "FAN_LOBBY",
  authority: authorityProp,
  accentColor = "#00FF88",
  isStaff = false,
}: RoomControlsDrawerPanelProps) {
  const authority = authorityProp ?? defaultRoomAuthority(roomType, userId);
  const canControl = canControlRoom(authority, userId, { isStaff });
  const skins = useMemo(() => listSwitchableFanLobbySkins(), []);
  const [selectedSkin, setSelectedSkin] = useState<FanLobbySkinId>(
    (authority.lockedSkinId as FanLobbySkinId) || DEFAULT_FAN_LOBBY_SKIN_ID,
  );
  const [gatherMsg, setGatherMsg] = useState<string | null>(null);
  const [migrateMsg, setMigrateMsg] = useState<string | null>(null);

  const onGather = () => {
    // Gather UX only — does not gate access or package streams.
    setGatherMsg("Gather ping sent locally — everybody take a seat (UX stub, not a security gate).");
  };

  const onMigrateStub = () => {
    const intent = createPartyMigrationIntent({
      fromRoomId: roomId,
      toRoomId: SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID,
      toRoomType: "PLAYLIST_LOUNGE",
      initiatedBy: userId,
      memberIds: [userId],
      gatherAtDestination: true,
    });
    setMigrateMsg(
      `PartyMigrationIntent ${intent.intentId} created (consent-based). Inventory/WebRTC not packaged — destination re-resolves.`,
    );
  };

  return (
    <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", color: accentColor }}>
          ROOM CONTROLS
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
          {roomType.replace(/_/g, " ")} · {authority.mode}
          {authority.mode === "HUMAN_HOSTED" && authority.hostUserId
            ? ` · host ${authority.hostUserId === userId ? "you" : authority.hostUserId.slice(0, 8)}`
            : " · bot-locked skins/playlist"}
        </div>
      </div>

      <section
        style={{
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(0,0,0,0.28)",
          padding: 12,
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>
          SKIN SWITCHER {canControl ? "" : "· HOST GATED"}
        </div>
        {!canControl ? (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "0 0 8px" }}>
            {authority.mode === "BOT_AUTOMATED"
              ? "Bot-automated room — skins locked. Gold+ can host their own HUMAN_HOSTED lounge."
              : "Only the room host can change the shared skin. Tier alone ≠ control here."}
          </p>
        ) : null}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {skins.map((s) => {
            const active = s.id === selectedSkin;
            return (
              <button
                key={s.id}
                type="button"
                disabled={!canControl}
                onClick={() => setSelectedSkin(s.id)}
                title={s.tagline}
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  padding: "8px 10px",
                  borderRadius: 8,
                  cursor: canControl ? "pointer" : "not-allowed",
                  opacity: canControl ? 1 : 0.45,
                  border: active ? `1px solid ${accentColor}` : "1px solid rgba(255,255,255,0.12)",
                  background: active ? `${accentColor}22` : "transparent",
                  color: active ? accentColor : "rgba(255,255,255,0.55)",
                  fontFamily: "inherit",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        {canControl ? (
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", margin: "8px 0 0" }}>
            Stub: selection stays local until room-authority sync persists shared skin.
          </p>
        ) : null}
      </section>

      <section
        style={{
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.1)",
          background: "rgba(0,0,0,0.28)",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)" }}>
          GATHER · PARTY MIGRATE
        </div>
        <button type="button" onClick={onGather} style={btn(accentColor)}>
          Everybody take a seat (gather UX)
        </button>
        <button type="button" onClick={onMigrateStub} style={btn("#AA2DFF")}>
          Party migrate → Playlist Lounge (consent stub)
        </button>
        {gatherMsg ? <p style={note}>{gatherMsg}</p> : null}
        {migrateMsg ? <p style={note}>{migrateMsg}</p> : null}
      </section>

      <Link
        href={loungeSideRoomEntryHref(SYSTEM_OPERATED_PLAYLIST_LOUNGE_ROOM_ID, { from: "fan-avatar-lobby" })}
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: "#AA2DFF",
          textDecoration: "none",
          border: "1px solid rgba(170,45,255,0.4)",
          borderRadius: 8,
          padding: "10px 14px",
          width: "fit-content",
        }}
      >
        Open Playlist Lounge →
      </Link>
    </div>
  );
}

const note: CSSProperties = {
  fontSize: 10,
  color: "rgba(255,255,255,0.4)",
  margin: 0,
  lineHeight: 1.4,
};

function btn(color: string): CSSProperties {
  return {
    fontSize: 11,
    fontWeight: 800,
    padding: "10px 12px",
    borderRadius: 8,
    cursor: "pointer",
    fontFamily: "inherit",
    border: `1px solid ${color}66`,
    background: `${color}18`,
    color,
    textAlign: "left",
  };
}
