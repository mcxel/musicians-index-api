"use client";

/**
 * Compact contextual trays for Performer HUD:
 * Dialogue side placement, Visual Studio, Presence, Guests/Green Room, MIX.
 * Launchers stay on VenueHudPerimeterActionDock thin rail.
 */

import {
  applyBackground,
  applyVisualFilter,
  resetVisuals,
  resolveCountryFlagBackground,
  type BackgroundSourceKind,
  type VisualFxModeId,
} from "@/lib/venue-hud/VenueHudVisualFxPolicy";
import {
  returnPerformerToStage,
  setHeadsetInvisiblePreference,
  setPerformerPresentationMode,
  type HeadsetInvisibleMode,
  type PerformerPresentationMode,
} from "@/lib/venue-hud/PerformerPresenceAuthority";
import {
  setGreenRoomMixGain,
  GREEN_ROOM_MIX_CHANNELS,
} from "@/lib/live/BackstageGreenRoomAuthority";
import type { LiveBannerSide } from "@/lib/live/StageDirectorEngine";
import { ChannelMixerDirector } from "@/lib/audio/mixer/ChannelMixerDirector";
import ServerBackedGuestsTray from "@/components/venue-hud/ServerBackedGuestsTray";
import { BACKSTAGE_AUDIO_PARTICIPANT_PREFIX } from "@/lib/audio/mixer/LiveRoomMixerBind";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";

function tile(active: boolean, accent: string): React.CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    minWidth: 56,
    padding: "8px 6px",
    borderRadius: 10,
    border: active ? `1px solid ${accent}` : "1px solid rgba(255,255,255,0.12)",
    background: active ? `${accent}18` : "rgba(0,0,0,0.45)",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

const FILTERS: { id: VisualFxModeId; icon: string; label: string }[] = [
  { id: "ORIGINAL", icon: "📷", label: "Original" },
  { id: "SIXTIES", icon: "📼", label: "1960s" },
  { id: "SEVENTIES", icon: "🎞️", label: "1970s" },
  { id: "EIGHTIES", icon: "💜", label: "1980s" },
  { id: "BLACK_AND_WHITE", icon: "⬛", label: "B&W" },
  { id: "RETRO", icon: "📺", label: "Retro" },
];

const BACKGROUNDS: { kind: BackgroundSourceKind; icon: string; label: string }[] = [
  { kind: "NONE", icon: "🚫", label: "Reset BG" },
  { kind: "CHROMA_KEY", icon: "🟩", label: "Green Screen" },
  { kind: "COUNTRY_FLAG", icon: "🏳️", label: "My Flag" },
  { kind: "IMAGE", icon: "🖼️", label: "Image" },
  { kind: "VIDEO", icon: "🎬", label: "Video" },
  { kind: "TMI_VENUE", icon: "🏟️", label: "Venue BG" },
];

export type ExtendedTrayId = "visual" | "presence" | "guests" | "mix" | "write-side";

export type PerformerHudExtendedTraysProps = {
  tray: ExtendedTrayId | string;
  roomId: string;
  liveSessionId: string;
  performerId: string;
  countryCode?: string | null;
  experienceKind?: string | null;
  hasAvatarBound?: boolean;
  hasVrRuntime?: boolean;
  hasFaceIdentity?: boolean;
  chromaReady?: boolean;
  writeSide?: LiveBannerSide;
  onWriteSideChange?: (side: LiveBannerSide) => void;
  visualFilter: VisualFxModeId;
  visualBg: BackgroundSourceKind;
  onVisualFilter: (m: VisualFxModeId) => void;
  onVisualBg: (k: BackgroundSourceKind) => void;
  presenceMode: PerformerPresentationMode;
  headsetMode: HeadsetInvisibleMode;
  onPresenceMode: (m: PerformerPresentationMode) => void;
  onHeadsetMode: (m: HeadsetInvisibleMode) => void;
  onStatus?: (line: string) => void;
  inviteNameDraft?: string;
  onInviteNameDraft?: (v: string) => void;
};

export default function PerformerHudExtendedTrays(props: PerformerHudExtendedTraysProps) {
  const sessionId = props.liveSessionId || `session:${props.roomId}`;
  const caps = {
    hasAvatarBound: props.hasAvatarBound,
    hasVrRuntime: props.hasVrRuntime,
    hasFaceIdentity: props.hasFaceIdentity,
    chromaReady: props.chromaReady,
  };
  if (props.tray === "write-side") {
    return (
      <div data-testid="live-write-side" style={{ display: "flex", gap: 6, width: "100%" }}>
        {(["LEFT", "CENTER", "RIGHT"] as LiveBannerSide[]).map((side) => (
          <button
            key={side}
            type="button"
            data-testid={`live-write-side-${side.toLowerCase()}`}
            onClick={() => props.onWriteSideChange?.(side)}
            style={tile(props.writeSide === side, CYAN)}
          >
            <span style={{ fontSize: 14 }}>{side === "LEFT" ? "◀" : side === "RIGHT" ? "▶" : "●"}</span>
            <span style={{ fontSize: 9, fontWeight: 700 }}>{side}</span>
          </button>
        ))}
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", alignSelf: "center" }}>
          Private draft never broadcasts. POST publishes stage dialogue only.
        </div>
      </div>
    );
  }

  if (props.tray === "visual") {
    return (
      <div data-testid="performer-visual-studio" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: CYAN }}>FILTERS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              data-testid={`visual-filter-${f.id}`}
              onClick={() => {
                const r = applyVisualFilter({
                  sessionId,
                  performerId: props.performerId,
                  mode: f.id,
                });
                props.onVisualFilter(f.id);
                if (typeof window !== "undefined" && r.presetId) {
                  window.dispatchEvent(
                    new CustomEvent("tmi:visual-filter", {
                      detail: { roomId: props.roomId, presetId: r.presetId, mode: f.id },
                    }),
                  );
                }
                props.onStatus?.(
                  r.ok
                    ? `${f.label} · ${r.status}${r.VISUAL_EFFECT_CHANGE_RECONNECTS_CAMERA === 0 ? " · cam intact" : ""}`
                    : `${f.label} unavailable (${r.status})`,
                );
              }}
              style={tile(props.visualFilter === f.id, CYAN)}
            >
              <span style={{ fontSize: 18 }}>{f.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700 }}>{f.label}</span>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", color: FUCHSIA }}>BACKGROUNDS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {BACKGROUNDS.map((b) => (
            <button
              key={b.kind}
              type="button"
              data-testid={`visual-bg-${b.kind}`}
              onClick={() => {
                if (b.kind === "NONE") {
                  resetVisuals(sessionId, props.performerId);
                  props.onVisualBg("NONE");
                  props.onStatus?.("Background reset · session intact");
                  return;
                }
                let assetId: string | null = null;
                if (b.kind === "COUNTRY_FLAG") {
                  const flag = resolveCountryFlagBackground(props.countryCode);
                  if (!flag.ok) {
                    props.onStatus?.(`Flag background: ${flag.reason} (no emoji stretch)`);
                    return;
                  }
                  assetId = props.countryCode ?? null;
                }
                const r = applyBackground({
                  sessionId,
                  performerId: props.performerId,
                  kind: b.kind,
                  assetId,
                });
                if (r.ok) props.onVisualBg(b.kind);
                if (typeof window !== "undefined" && r.ok) {
                  window.dispatchEvent(
                    new CustomEvent("tmi:visual-background", {
                      detail: {
                        roomId: props.roomId,
                        kind: b.kind,
                        cutout: r.cutout,
                        liveEffectBackgroundMode: r.liveEffectBackgroundMode,
                      },
                    }),
                  );
                }
                props.onStatus?.(r.ok ? `${b.label} applied` : `${b.label}: ${r.reason}`);
              }}
              style={tile(props.visualBg === b.kind, FUCHSIA)}
            >
              <span style={{ fontSize: 18 }}>{b.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700 }}>{b.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (props.tray === "presence") {
    const modes: { id: PerformerPresentationMode; label: string; icon: string }[] = [
      { id: "STAGE_CAMERA", label: "Stage Cam", icon: "🎥" },
      { id: "STAGE_COMPOSITE", label: "Composite", icon: "🟩" },
      { id: "STAGE_3D_AVATAR", label: "3D Avatar", icon: "🧍" },
      { id: "AUDIENCE_VISIT", label: "Visit Audience", icon: "🪑" },
      { id: "VR_EMBODIMENT", label: "VR", icon: "🥽" },
    ];
    const headsets: { id: HeadsetInvisibleMode; label: string }[] = [
      { id: "OFF", label: "Headset Visible" },
      { id: "AVATAR_REPLACEMENT", label: "Hide via Avatar" },
      { id: "PHOTOREAL_FACE", label: "Photoreal Face" },
      { id: "AI_VIDEO_RECONSTRUCTION", label: "AI Video (GAP)" },
    ];
    return (
      <div data-testid="performer-presence-tray" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              data-testid={`presence-mode-${m.id}`}
              onClick={() => {
                const r = setPerformerPresentationMode({
                  performerId: props.performerId,
                  roomId: props.roomId,
                  liveSessionId: sessionId,
                  mode: m.id,
                  capabilities: caps,
                });
                if (r.ok) props.onPresenceMode(m.id);
                props.onStatus?.(r.ok ? `${m.label} · ${r.status}` : `${m.label}: ${r.reason}`);
              }}
              style={tile(props.presenceMode === m.id, GOLD)}
            >
              <span style={{ fontSize: 18 }}>{m.icon}</span>
              <span style={{ fontSize: 9, fontWeight: 700 }}>{m.label}</span>
            </button>
          ))}
          <button
            type="button"
            data-testid="presence-return-stage"
            onClick={() => {
              const r = returnPerformerToStage({
                performerId: props.performerId,
                roomId: props.roomId,
                liveSessionId: sessionId,
              });
              if (r.ok) props.onPresenceMode(r.snapshot.presentationMode);
              props.onStatus?.(r.reason);
            }}
            style={tile(false, CYAN)}
          >
            <span style={{ fontSize: 18 }}>↩</span>
            <span style={{ fontSize: 9, fontWeight: 700 }}>Return Stage</span>
          </button>
        </div>
        <div style={{ fontSize: 10, fontWeight: 800, color: FUCHSIA }}>HEADSET INVISIBLE</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {headsets.map((h) => (
            <button
              key={h.id}
              type="button"
              data-testid={`headset-mode-${h.id}`}
              onClick={() => {
                const r = setHeadsetInvisiblePreference({
                  performerId: props.performerId,
                  roomId: props.roomId,
                  liveSessionId: sessionId,
                  mode: h.id,
                  capabilities: caps,
                });
                if (r.ok || h.id === "OFF") props.onHeadsetMode(h.id);
                props.onStatus?.(`${h.label}: ${r.reason} (${r.status})`);
              }}
              style={tile(props.headsetMode === h.id, FUCHSIA)}
            >
              <span style={{ fontSize: 9, fontWeight: 700 }}>{h.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (props.tray === "guests") {
    return (
      <ServerBackedGuestsTray
        roomId={props.roomId}
        liveSessionId={sessionId}
        performerId={props.performerId}
        experienceKind={props.experienceKind}
        onStatus={props.onStatus}
      />
    );
  }

  if (props.tray === "mix") {
    ChannelMixerDirector.bindSession({ roomId: props.roomId, liveSessionId: sessionId });
    const strips: Array<{ key: keyof typeof GREEN_ROOM_MIX_CHANNELS; label: string; defaultGain: number }> = [
      { key: "STAGE_PROGRAM", label: "Live Stage / Battle", defaultGain: 0.75 },
      { key: "BACKSTAGE_WHISPER", label: "Backstage Conversation", defaultGain: 0.25 },
      { key: "GUEST_FRIEND", label: "Guest / Friend", defaultGain: 0.6 },
      { key: "MY_MIC_MONITOR", label: "Mic Monitor", defaultGain: 0.8 },
      { key: "EFFECTS_MUSIC", label: "Effects / Music", defaultGain: 0.2 },
      { key: "ENTRANCE_DINGS", label: "Entrance Dings", defaultGain: 0.15 },
    ];
    return (
      <div data-testid="performer-mix-tray" style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
          Existing MIX · PERSONAL listen only · does not grant Whisper/program access · backstage tracks
          use {BACKSTAGE_AUDIO_PARTICIPANT_PREFIX}* and survive program roster sync
        </div>
        {strips.map((s) => (
          <label key={s.key} style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 10 }}>
            <span style={{ fontWeight: 700 }}>{s.label}</span>
            <input
              type="range"
              min={0}
              max={100}
              defaultValue={Math.round(s.defaultGain * 100)}
              data-testid={`mix-${s.key}`}
              onChange={(e) => {
                const gain = Number(e.target.value) / 100;
                const r = setGreenRoomMixGain({ channel: s.key, gain });
                props.onStatus?.(r.ok ? `${s.label}: ${Math.round(gain * 100)}%` : r.message);
              }}
            />
          </label>
        ))}
      </div>
    );
  }

  return null;
}
