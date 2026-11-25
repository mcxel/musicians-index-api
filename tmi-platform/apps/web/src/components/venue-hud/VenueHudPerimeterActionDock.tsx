"use client";

/**
 * VenueHudPerimeterActionDock — Rule 40 Fan/Performer bottom edge dock.
 * Visual tile pickers (icon + name). Expands UP from bottom edge.
 * Reuses HudCommandBus, EmoteEngine, LobbyPropRegistry, /api/tips, VenueCurtainDirector.
 * NO TipEngine2 / Chat2 / PropEngine2.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { HudCommandBus } from "@/lib/venue-hud/TMIExperienceHudRuntime";
import { getEmoteSpecList, triggerEmote, type AvatarEmote } from "@/lib/avatars/EmoteEngine";
import {
  LOBBY_HOLDABLE_PROPS,
  isPropUnlockedForTier,
  type PropTier,
} from "@/lib/lobby/LobbyPropRegistry";
import { equipProp, unequipProp } from "@/lib/avatars/UnifiedAvatarRuntime";
import { createActiveProp } from "@/lib/avatars/AvatarPropManifest";
import FollowButton from "@/components/social/FollowButton";
import { getStageSnapshot, resumeFromIntermission, triggerIntermission } from "@/lib/live/StageLifecycleEngine";
import { venueTriggerFx } from "@/lib/venue/VenueToolsDirector";
import {
  clearPrivateDraft,
  getPrivateDraft,
  getPublicLiveWrite,
  noteLiveTypeDraft,
  postPublicLiveWrite,
  PRIVATE_TELEPROMPTER_STATUS,
  removePublicLiveWrite,
  setLiveTypeEnabled,
  type LiveWriteDraft,
} from "@/lib/live/liveWritePresentation";
import type { LiveBannerMode, LiveBannerSide } from "@/lib/live/StageDirectorEngine";
import { FAN_DOCK_ORDER, PERFORMER_DOCK_ORDER } from "@/lib/venue-hud/VenueHudSpatialCanon";
import {
  MODE_LABEL as COMPOSER_MODE_LABEL,
  type HudComposerMode,
} from "@/lib/venue-hud/HudComposerModeAuthority";
import { dictateToComposer, sttAvailability } from "@/lib/venue-hud/SpeechTextAdapter";
import {
  applyWorldPresenceCommand,
  type WorldPresencePosture,
} from "@/lib/world/worldPresenceBridge";
import OwnedActionRail from "@/components/hud/OwnedActionRail";
import { fanParticipationXpFor } from "@/lib/economy/HeartFireParticipationXpPolicy";
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
import PerformerHudExtendedTrays from "@/components/venue-hud/PerformerHudExtendedTrays";
import { playDiscreteCrowdReactionSfx } from "@/lib/audio/playDiscreteCrowdReactionSfx";
import { pressMnsAudienceReaction } from "@/lib/venue-hud/ExperienceAwareReactionHudPolicy";

const CYAN = "#00FFFF";
const FUCHSIA = "#FF2DAA";
const GOLD = "#FFD700";

const FAN_REACTIONS: {
  id: string;
  icon: string;
  label: string;
  reaction?: "heart" | "fire" | "applause" | "boo" | "yay";
}[] = [
  { id: "love", icon: "❤️", label: "Heart", reaction: "heart" },
  { id: "fire", icon: "🔥", label: "Fire", reaction: "fire" },
  { id: "clap", icon: "👏", label: "Solo Clap", reaction: "applause" },
  { id: "sync_clap", icon: "👏", label: "Sync Clap", reaction: "applause" },
  { id: "laugh", icon: "😂", label: "Laugh" },
  { id: "hype", icon: "🙌", label: "Hype" },
  { id: "yay", icon: "🎉", label: "Yay", reaction: "yay" },
  { id: "boo", icon: "👎", label: "Boo", reaction: "boo" },
];

const PERFORMER_APPRECIATION: { id: string; icon: string; label: string }[] = [
  { id: "send_love", icon: "❤️", label: "Send Love" },
  { id: "thank_you", icon: "🙏", label: "Thank You" },
  { id: "youre_awesome", icon: "🌟", label: "You're Awesome" },
  { id: "much_love", icon: "💖", label: "Much Love" },
  { id: "respect_opponent", icon: "🤝", label: "Respect Opponent" },
  { id: "great_performance", icon: "🏆", label: "Great Performance" },
];

const PERFORMER_EFFECTS: {
  id: string;
  icon: string;
  label: string;
  /** Canonical StageEffect when available; else presentation-only overlay event. */
  stageEffect?: "confetti-burst" | "fog-roll" | "strobe" | "laser-scan" | "spotlight-sweep" | "crowd-glow";
  overlayId: string;
}[] = [
  { id: "fireworks", icon: "🎆", label: "Fireworks", stageEffect: "strobe", overlayId: "fireworks" },
  { id: "smoke", icon: "💨", label: "Smoke", stageEffect: "fog-roll", overlayId: "smoke" },
  { id: "money_shower", icon: "💸", label: "Money Shower", overlayId: "money_shower" },
  { id: "coin_shower", icon: "🪙", label: "Coin Shower", overlayId: "coin_shower" },
  { id: "confetti", icon: "✨", label: "Confetti", stageEffect: "confetti-burst", overlayId: "confetti" },
];

const PERFORMER_CROWD: { id: string; icon: string; label: string }[] = [
  { id: "love", icon: "❤️", label: "Love" },
  { id: "noise", icon: "🙌", label: "Make Noise" },
  { id: "clap_with_me", icon: "👏", label: "Clap With Me" },
  { id: "turn_up", icon: "🔥", label: "Turn Up" },
  { id: "wave", icon: "👋", label: "Wave" },
  { id: "dance_with_me", icon: "💃", label: "Dance With Me" },
];

const TIP_AMOUNTS = [1, 5, 10, 25] as const;

type Tray =
  | "none"
  | "reactions"
  | "emotes"
  | "props"
  | "group"
  | "tip"
  | "crowd"
  | "appreciation"
  | "effects"
  | "curtain"
  | "chat"
  | "write"
  | "visual"
  | "presence"
  | "guests"
  | "mix"
  | "world";

const VISUAL_FILTERS: { id: VisualFxModeId; icon: string; label: string }[] = [
  { id: "ORIGINAL", icon: "📷", label: "Original" },
  { id: "SIXTIES", icon: "📼", label: "1960s" },
  { id: "SEVENTIES", icon: "🎞️", label: "1970s" },
  { id: "EIGHTIES", icon: "💜", label: "1980s" },
  { id: "BLACK_AND_WHITE", icon: "⬛", label: "B&W" },
  { id: "RETRO", icon: "📺", label: "Retro" },
];

const VISUAL_BACKGROUNDS: { kind: BackgroundSourceKind; icon: string; label: string }[] = [
  { kind: "NONE", icon: "🚫", label: "Reset BG" },
  { kind: "CHROMA_KEY", icon: "🟩", label: "Green Screen" },
  { kind: "COUNTRY_FLAG", icon: "🏳️", label: "My Flag" },
  { kind: "IMAGE", icon: "🖼️", label: "Image" },
  { kind: "VIDEO", icon: "🎬", label: "Video" },
  { kind: "TMI_VENUE", icon: "🏟️", label: "Venue BG" },
  { kind: "AUDIENCE_VIEW", icon: "👥", label: "Audience" },
];

export interface VenueHudPerimeterActionDockProps {
  roomId: string;
  role: "fan" | "performer" | "host" | "admin" | "guest" | "judge";
  /** Tip recipient — performer slug/id. Honest unavailable when missing. */
  tipArtistSlug?: string;
  /**
   * Real performer User.id for the Fan dock's FOLLOW control — reuses the
   * canonical prisma.follow-backed /api/social/follow authority via
   * components/social/FollowButton.tsx (never the dead
   * components/common/FollowButton.tsx / /api/artist/follow in-memory pair).
   * Distinct from `performerId` below, which means "current room owner's
   * identity for the live-write composer," not "who the fan is viewing."
   * Honest unavailable when missing — not threaded from every room-type
   * mounting call site yet (17 real call sites of TMIInteractiveVenueHud
   * found repo-wide); this is real wiring, population is a bounded follow-up.
   */
  performerUserId?: string;
  performerName?: string;
  avatarEntityId?: string;
  liveSessionId?: string;
  venueId?: string;
  performerId?: string;
  propTier?: PropTier;
  onStatus?: (line: string) => void;
  onToggleHud?: () => void;
  onActivity?: () => void;
  compactChatMessages?: { id: string; user: string; text: string }[];
  onSendChat?: (text: string) => void;
  /** §20985-C/D current composer mode (context destination). Default CHAT. */
  composerMode?: HudComposerMode;
  onComposerModeChange?: (mode: HudComposerMode) => void;
  /** ISO country for flag background — resolves via FlagAssetResolver (never emoji stretch). */
  countryCode?: string | null;
  /** Honest capability hints for presence / headset-invisible. */
  hasAvatarBound?: boolean;
  hasVrRuntime?: boolean;
  hasFaceIdentity?: boolean;
  chromaReady?: boolean;
  /** Experience kind drives guest vs competition admission authority. */
  experienceKind?: string | null;
}

function tileStyle(active: boolean, accent: string): React.CSSProperties {
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

export default function VenueHudPerimeterActionDock({
  roomId,
  role,
  tipArtistSlug,
  performerUserId,
  performerName = "Performer",
  avatarEntityId = "local-fan",
  liveSessionId,
  performerId,
  propTier = "free",
  onStatus,
  onToggleHud,
  onActivity,
  compactChatMessages = [],
  onSendChat,
  composerMode = "CHAT",
  onComposerModeChange,
  countryCode = null,
  hasAvatarBound = false,
  hasVrRuntime = false,
  hasFaceIdentity = false,
  chromaReady = false,
  experienceKind = null,
}: VenueHudPerimeterActionDockProps) {
  const [tray, setTray] = useState<Tray>("none");
  const [writeSide, setWriteSide] = useState<LiveBannerSide>("CENTER");
  const [visualFilter, setVisualFilter] = useState<VisualFxModeId>("ORIGINAL");
  const [visualBg, setVisualBg] = useState<BackgroundSourceKind>("NONE");
  const [presenceMode, setPresenceMode] = useState<PerformerPresentationMode>("STAGE_CAMERA");
  const [headsetMode, setHeadsetMode] = useState<HeadsetInvisibleMode>("OFF");
  const [inviteNameDraft, setInviteNameDraft] = useState("");
  const [chatDraft, setChatDraft] = useState("");
  const [dictating, setDictating] = useState(false);
  const sttSupported = typeof window !== "undefined" && sttAvailability() === "available";
  const [tipBusy, setTipBusy] = useState(false);
  const [tipError, setTipError] = useState<string | null>(null);
  const [activePropId, setActivePropId] = useState<string | null>(null);
  const [crowdInvite, setCrowdInvite] = useState<string | null>(null);
  const [writeDraft, setWriteDraft] = useState("");
  const [writeMode, setWriteMode] = useState<LiveBannerMode>("STATIC");
  const [writeStay, setWriteStay] = useState(true);
  const [writeSeconds, setWriteSeconds] = useState(10);
  const [writePublic, setWritePublic] = useState(false);
  const [liveTypeOn, setLiveTypeOn] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  // Lane 4/5: canonical world-presence posture for the local fan avatar.
  // SIT/STAND/MOVE route through worldPresenceBridge — never a second seat DB.
  const [worldPosture, setWorldPosture] = useState<WorldPresencePosture>("seated");

  const isPerformer = role === "performer" || role === "host" || role === "admin";
  const writerId = performerId ?? (isPerformer ? "performer" : "");
  const dockOrder = isPerformer ? PERFORMER_DOCK_ORDER : FAN_DOCK_ORDER;

  const emotes = useMemo(() => getEmoteSpecList().slice(0, 12), []);
  const props = useMemo(
    () => LOBBY_HOLDABLE_PROPS.filter((p) => isPropUnlockedForTier(p, propTier)),
    [propTier],
  );

  const toggleTray = (t: Tray) => setTray((cur) => (cur === t ? "none" : t));

  const fireReaction = useCallback(
    (icon: string, label: string, reaction?: "heart" | "fire" | "applause" | "boo" | "yay") => {
      void HudCommandBus.execute("EMIT_REACTION", { params: { emoji: icon } });
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tmi:reaction", { detail: { roomId, type: label, emoji: icon, reaction } }),
        );
      }
      // Discrete crowd SFX — gate BOO/GROAN/DISAPPOINTMENT on active performer PERSONAL bus.
      if (reaction === "boo" || reaction === "yay") {
        const mns = pressMnsAudienceReaction({
          venueSlug: roomId,
          fanId: avatarEntityId,
          kind: reaction === "boo" ? "BOO" : "YAY",
        });
        const playback = playDiscreteCrowdReactionSfx({
          reactionFamily: reaction === "boo" ? "BOO" : "CHEER",
          listenerIsActivePerformer: isPerformer,
          experienceType: experienceKind,
        });
        onStatus?.(
          playback.suppressedBoo
            ? `${icon} ${label} · suppressed on performer PERSONAL (audience/PROGRAM untouched)`
            : playback.played
              ? `${icon} ${label}${mns.accepted ? "" : " (cooldown)"}`
              : `${icon} ${label}`,
        );
        setTray("none");
        onActivity?.();
        return;
      }
      if (reaction === "heart" || reaction === "fire" || reaction === "applause") {
        void fetch("/api/live/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            action: "react",
            venueSlug: roomId,
            reaction,
            targetId: performerUserId ?? tipArtistSlug ?? roomId,
            ownerId: performerUserId ?? tipArtistSlug ?? roomId,
            presentationMode: "VENUE_3D",
          }),
        })
          .then(async (res) => {
            if (!res.ok) {
              onStatus?.(`${icon} ${label} (visual only — auth required for XP)`);
              return;
            }
            const data = (await res.json().catch(() => null)) as {
              message?: string;
              rewardStatus?: string;
              allowVenueAnimation?: boolean;
            } | null;
            if (reaction === "heart" || reaction === "fire") {
              onStatus?.(
                data?.message
                  ? `${icon} ${label} · ${data.message}`
                  : `${icon} ${label} · XP pending owner approval (cap-ready; +${fanParticipationXpFor(reaction)} proposed)`,
              );
              if (data?.allowVenueAnimation && typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("tmi:venue:reaction-animation", {
                    detail: { roomId, reaction, avatarEntityId },
                  }),
                );
              }
            } else {
              onStatus?.(`${icon} ${label}`);
            }
          })
          .catch(() => onStatus?.(`${icon} ${label}`));
      } else {
        onStatus?.(`${icon} ${label}`);
      }
      setTray("none");
    },
    [roomId, onStatus, performerUserId, tipArtistSlug, avatarEntityId, isPerformer, experienceKind, onActivity],
  );

  const fireAppreciation = useCallback(
    (icon: string, label: string) => {
      void HudCommandBus.execute("EMIT_REACTION", { params: { emoji: icon } });
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tmi:performer:appreciation", {
            detail: { roomId, label, emoji: icon },
          }),
        );
      }
      onStatus?.(`${icon} ${label} → audience`);
      setTray("none");
    },
    [roomId, onStatus],
  );

  const fireStageEffect = useCallback(
    (
      icon: string,
      label: string,
      overlayId: string,
      stageEffect?: "confetti-burst" | "fog-roll" | "strobe" | "laser-scan" | "spotlight-sweep" | "crowd-glow",
    ) => {
      if (stageEffect) {
        try {
          venueTriggerFx(stageEffect);
        } catch {
          /* stage FX director may be offline for this room */
        }
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tmi:performer:stage-fx", {
            detail: {
              roomId,
              overlayId,
              stageEffect: stageEffect ?? null,
              label,
              emoji: icon,
              cosmeticOnly: true,
            },
          }),
        );
      }
      onStatus?.(`${icon} ${label} (visual only — not currency)`);
      setTray("none");
    },
    [roomId, onStatus],
  );

  const fireEmote = useCallback(
    (emote: AvatarEmote, label: string, icon: string) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tmi-avatar-emote", {
            detail: { entityId: avatarEntityId, emote, roomId },
          }),
        );
      }
      try {
        triggerEmote(avatarEntityId, emote, roomId);
      } catch {
        /* entity may not exist yet — event still broadcast */
      }
      onStatus?.(`${icon} ${label}`);
      setTray("none");
    },
    [avatarEntityId, roomId, onStatus],
  );

  const fireProp = useCallback(
    (propId: string, label: string, icon: string) => {
      const next = activePropId === propId ? null : propId;
      setActivePropId(next);
      // Real canonical prop authority — same AvatarEntity.equippedProps
      // AudienceScene/AvatarLobbyCanvas already render (Step: audience
      // reaction wiring closure, 2026-09-24). Previously this only fired a
      // CustomEvent with zero listeners, so equipped props never appeared
      // on the real avatar.
      try {
        if (next) {
          equipProp(avatarEntityId, createActiveProp(next));
        } else {
          unequipProp(avatarEntityId, propId);
        }
      } catch {
        /* entity may not exist yet — dock state still reflects the toggle */
      }
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tmi:prop:toggle", {
            detail: { roomId, propId, active: Boolean(next), entityId: avatarEntityId },
          }),
        );
      }
      onStatus?.(next ? `${icon} ${label} equipped` : `${label} put away`);
      setTray("none");
    },
    [activePropId, avatarEntityId, roomId, onStatus],
  );

  const joinGroup = useCallback(
    (actionId: string, icon: string, label: string) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tmi:group-action:join", {
            detail: { roomId, actionId, entityId: avatarEntityId },
          }),
        );
      }
      onStatus?.(`Joined ${icon} ${label}`);
      setTray("none");
    },
    [avatarEntityId, roomId, onStatus],
  );

  const sendCrowdPrompt = useCallback(
    (id: string, icon: string, label: string) => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("tmi:crowd-prompt", {
            detail: { roomId, promptId: id, icon, label },
          }),
        );
      }
      onStatus?.(`Crowd invite: ${icon} ${label}`);
      setTray("none");
    },
    [roomId, onStatus],
  );

  // Lane 5: SIT / STAND / MOVE via the canonical world-presence authority.
  // seatId is resolved inside the bridge from audienceRuntimeEngine occupancy;
  // the dock never mints a seat or reconnects media.
  const fireWorldCommand = useCallback(
    (command: "SIT" | "STAND") => {
      const result = applyWorldPresenceCommand({
        roomId,
        participantId: avatarEntityId,
        command,
      });
      if (!result.ok) {
        onStatus?.(result.error === "not_a_participant" ? "Join the venue to move" : "Action unavailable");
        setTray("none");
        return;
      }
      setWorldPosture(result.presence.posture);
      onStatus?.(command === "SIT" ? "Seated" : "Standing");
      setTray("none");
    },
    [roomId, avatarEntityId, onStatus],
  );

  const sendTip = useCallback(
    async (amount: number) => {
      if (!tipArtistSlug?.trim()) {
        setTipError("Tip unavailable — performer not bound.");
        return;
      }
      setTipBusy(true);
      setTipError(null);
      try {
        const res = await fetch("/api/tips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            artistSlug: tipArtistSlug.trim(),
            amount,
            roomId,
          }),
        });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) {
          setTipError(data.error ?? "Could not start tip checkout.");
          return;
        }
        window.location.href = data.url;
      } catch {
        setTipError("Network error — tip not sent.");
      } finally {
        setTipBusy(false);
      }
    },
    [tipArtistSlug, roomId],
  );

  const curtainAction = useCallback(
    (kind: "open" | "close") => {
      if (kind === "close") {
        triggerIntermission();
        onStatus?.(`Curtain closed · ${getStageSnapshot().state}`);
      } else {
        const state = getStageSnapshot().state;
        if (state === "INTERMISSION" || state === "CURTAIN_CLOSE") resumeFromIntermission();
        else onStatus?.("Curtain is already open");
        onStatus?.(`Curtain open · ${getStageSnapshot().state}`);
      }
      setTray("none");
    },
    [onStatus],
  );

  /**
   * Rule 30: PAUSE LIVE is a session-state transition, not a stream stop —
   * same real StageLifecycleEngine authority as the curtain buttons above
   * (IntermissionProgramDirector/ad-pod insertion don't exist as code yet
   * per Rule 30's own scope-honesty note, so pausing is honestly curtain
   * closure today). Named/labeled separately from "Curtain" because a
   * performer thinks in terms of "pause the show," not "close the curtain."
   */
  const pauseShow = useCallback(() => {
    triggerIntermission();
    onStatus?.(`Show paused · ${getStageSnapshot().state}`);
    setTray("none");
  }, [onStatus]);

  const resumeShow = useCallback(() => {
    const state = getStageSnapshot().state;
    if (state === "INTERMISSION" || state === "CURTAIN_CLOSE") resumeFromIntermission();
    onStatus?.(`Show resumed · ${getStageSnapshot().state}`);
    setTray("none");
  }, [onStatus]);

  const saveDraft = useCallback(
    (text: string) => {
      if (!writerId) return;
      const draft: LiveWriteDraft = {
        performerId: writerId,
        roomId,
        sessionId: liveSessionId ?? `session:${roomId}`,
        text,
      };
      const typed = noteLiveTypeDraft(draft, {
        mode: writeMode,
        stayUp: writeStay,
        durationMs: writeStay ? null : writeSeconds * 1000,
      });
      setWriteDraft(text);
      if (typed.published) setWritePublic(true);
      onActivity?.();
    },
    [writerId, roomId, liveSessionId, onActivity, writeMode, writeStay, writeSeconds],
  );

  // Fan listens for performer crowd prompts
  useEffect(() => {
    if (!writerId) return;
    const existing = getPrivateDraft(writerId);
    if (existing) setWriteDraft(existing.text);
    setWritePublic(getPublicLiveWrite()?.performerId === writerId);
  }, [writerId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const viewport = window.visualViewport;
    if (!viewport) return;
    const apply = () => {
      const covered = window.innerHeight - viewport.height - viewport.offsetTop;
      setKeyboardInset(Math.max(0, Math.round(covered)));
    };
    apply();
    viewport.addEventListener("resize", apply);
    viewport.addEventListener("scroll", apply);
    return () => {
      viewport.removeEventListener("resize", apply);
      viewport.removeEventListener("scroll", apply);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || isPerformer) return;
    const onPrompt = (ev: Event) => {
      const d = (ev as CustomEvent<{ promptId?: string; icon?: string; label?: string }>).detail;
      if (d?.promptId) setCrowdInvite(`${d.icon ?? ""} ${d.label ?? d.promptId}`);
    };
    window.addEventListener("tmi:crowd-prompt", onPrompt);
    return () => window.removeEventListener("tmi:crowd-prompt", onPrompt);
  }, [isPerformer]);

  const chip = (label: string, icon: string, active: boolean, onClick: () => void, testId: string) => (
    <button
      key={testId}
      type="button"
      data-testid={testId}
      onClick={onClick}
      style={{
        ...tileStyle(active, CYAN),
        minWidth: 48,
        padding: "6px 8px",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.06em" }}>{label}</span>
    </button>
  );

  return (
    <div
      data-testid="venue-hud-perimeter-dock"
      data-dock-role={isPerformer ? "performer" : "fan"}
      style={{
        position: "absolute",
        bottom: keyboardInset,
        left: 0,
        right: 0,
        pointerEvents: "auto",
        zIndex: 115,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        gap: 6,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Compact chat — lower-left above dock, narrow */}
      {(tray === "chat" || compactChatMessages.length > 0) && tray === "chat" ? (
        <div
          data-testid="venue-hud-compact-chat"
          style={{
            alignSelf: "flex-start",
            marginLeft: 12,
            width: "min(280px, 42vw)",
            maxHeight: 140,
            overflow: "hidden",
            borderRadius: 12,
            border: "1px solid rgba(0,255,255,0.25)",
            background: "rgba(5,5,16,0.78)",
            backdropFilter: "blur(16px)",
            padding: 8,
          }}
        >
          <div style={{ fontSize: 8, fontWeight: 800, color: CYAN, letterSpacing: "0.14em", marginBottom: 6 }}>
            {composerMode === "CHAT" ? "LIVE CHAT" : COMPOSER_MODE_LABEL[composerMode]}
          </div>
          {/* §20985-C/D one composer → contextual destination. Mode picker sets the
              destination; the SAME input collects text for whichever mode is active. */}
          <div style={{ display: "flex", gap: 3, marginBottom: 6, flexWrap: "wrap" }}>
            {(["CHAT", "THROW_IN_AN_IDEA", "RESPOND_TO_HOST"] as HudComposerMode[]).map((m) => (
              <button
                key={m}
                type="button"
                data-testid={`composer-mode-${m.toLowerCase()}`}
                onClick={() => onComposerModeChange?.(m)}
                style={{
                  fontSize: 8,
                  fontWeight: 800,
                  padding: "3px 7px",
                  borderRadius: 7,
                  border: `1px solid ${composerMode === m ? CYAN : "rgba(255,255,255,0.18)"}`,
                  background: composerMode === m ? "rgba(0,255,255,0.16)" : "rgba(255,255,255,0.05)",
                  color: composerMode === m ? CYAN : "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                }}
              >
                {m === "CHAT" ? "💬 CHAT" : m === "THROW_IN_AN_IDEA" ? "💡 IDEA" : "🎤 HOST"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 72, overflowY: "auto" }}>
            {compactChatMessages.slice(-5).map((m) => (
              <div key={m.id} style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>
                <span style={{ color: CYAN, fontWeight: 700 }}>{m.user} </span>
                {m.text}
              </div>
            ))}
            {compactChatMessages.length === 0 ? (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>No messages yet.</div>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
            {sttSupported ? (
              <button
                type="button"
                data-testid="composer-dictate"
                title="Dictate into the composer (editable before send)"
                onClick={() => {
                  if (dictating) return;
                  setDictating(true);
                  dictateToComposer({
                    onTranscript: (t) => {
                      setChatDraft((cur) => (cur.trim() ? `${cur.trim()} ${t.trim()}` : t.trim()));
                      setDictating(false);
                    },
                    onEnd: () => setDictating(false),
                    onError: () => setDictating(false),
                  });
                }}
                style={{
                  height: 28,
                  borderRadius: 8,
                  border: `1px solid ${dictating ? FUCHSIA : "rgba(255,255,255,0.12)"}`,
                  background: dictating ? "rgba(255,45,170,0.2)" : "rgba(255,255,255,0.06)",
                  color: dictating ? FUCHSIA : "#fff",
                  fontSize: 11,
                  padding: "0 8px",
                  cursor: "pointer",
                }}
              >
                {dictating ? "⏺" : "🎙"}
              </button>
            ) : null}
            <input
              value={chatDraft}
              data-testid="composer-input"
              data-composer-mode={composerMode}
              onChange={(e) => setChatDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && chatDraft.trim()) {
                  onSendChat?.(chatDraft.trim());
                  setChatDraft("");
                }
              }}
              placeholder={COMPOSER_MODE_LABEL[composerMode]}
              style={{
                flex: 1,
                height: 28,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.06)",
                color: "#fff",
                fontSize: 11,
                padding: "0 8px",
              }}
            />
            <button
              type="button"
              onClick={() => {
                if (!chatDraft.trim()) return;
                onSendChat?.(chatDraft.trim());
                setChatDraft("");
              }}
              style={{
                fontSize: 9,
                fontWeight: 800,
                color: "#050510",
                background: CYAN,
                border: "none",
                borderRadius: 8,
                padding: "0 10px",
                cursor: "pointer",
              }}
            >
              SEND
            </button>
          </div>
        </div>
      ) : null}

      {/* Fan crowd-invite banner */}
      {crowdInvite && !isPerformer ? (
        <button
          type="button"
          data-testid="crowd-invite-join"
          onClick={() => {
            joinGroup("crowd-join", "🙌", crowdInvite);
            setCrowdInvite(null);
          }}
          style={{
            alignSelf: "center",
            padding: "8px 14px",
            borderRadius: 12,
            border: `1px solid ${FUCHSIA}`,
            background: "rgba(255,45,170,0.2)",
            color: FUCHSIA,
            fontSize: 11,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Join {crowdInvite}
        </button>
      ) : null}

      {/* Expanded tray — expands UP */}
      {tray !== "none" && tray !== "chat" ? (
        <div
          data-testid={`venue-hud-tray-${tray}`}
          style={{
            margin: "0 10px",
            padding: 10,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(8,10,22,0.88)",
            backdropFilter: "blur(20px)",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
            maxHeight: 180,
            overflowY: "auto",
          }}
        >
          {tray === "reactions"
            ? FAN_REACTIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => fireReaction(r.icon, r.label, r.reaction)}
                  style={tileStyle(false, FUCHSIA)}
                >
                  <span style={{ fontSize: 22 }}>{r.icon}</span>
                  <span style={{ fontSize: 9, fontWeight: 700 }}>{r.label}</span>
                </button>
              ))
            : null}

          {tray === "emotes" ? (
            <div style={{ width: "100%" }}>
              <OwnedActionRail
                title="Dance & Emotes"
                accent={CYAN}
                items={emotes.map((e) => ({
                  id: e.emote,
                  icon: e.emoji,
                  label: e.label,
                  owned: true,
                }))}
                onActivate={(item) => {
                  const hit = emotes.find((e) => e.emote === item.id);
                  if (hit) fireEmote(hit.emote, hit.label, hit.emoji);
                }}
              />
            </div>
          ) : null}

          {tray === "appreciation" && isPerformer
            ? PERFORMER_APPRECIATION.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => fireAppreciation(a.icon, a.label)}
                  style={tileStyle(false, GOLD)}
                >
                  <span style={{ fontSize: 22 }}>{a.icon}</span>
                  <span style={{ fontSize: 9, fontWeight: 700 }}>{a.label}</span>
                </button>
              ))
            : null}

          {tray === "effects" && isPerformer
            ? PERFORMER_EFFECTS.map((fx) => (
                <button
                  key={fx.id}
                  type="button"
                  onClick={() => fireStageEffect(fx.icon, fx.label, fx.overlayId, fx.stageEffect)}
                  style={tileStyle(false, FUCHSIA)}
                >
                  <span style={{ fontSize: 22 }}>{fx.icon}</span>
                  <span style={{ fontSize: 9, fontWeight: 700 }}>{fx.label}</span>
                </button>
              ))
            : null}

          {tray === "props"
            ? props.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => fireProp(p.id, p.label, p.icon)}
                  style={tileStyle(activePropId === p.id, p.accent)}
                >
                  <span style={{ fontSize: 22 }}>{p.icon}</span>
                  <span style={{ fontSize: 9, fontWeight: 700 }}>{p.label}</span>
                </button>
              ))
            : null}

          {tray === "group"
            ? FAN_REACTIONS.slice(0, 4).map((r) => (
                <button
                  key={`g-${r.id}`}
                  type="button"
                  onClick={() => joinGroup(r.id, r.icon, r.label)}
                  style={tileStyle(false, GOLD)}
                >
                  <span style={{ fontSize: 22 }}>{r.icon}</span>
                  <span style={{ fontSize: 9, fontWeight: 700 }}>Group {r.label}</span>
                </button>
              ))
            : null}

          {/* Lane 5: Fan world-presence controls — SIT/STAND via the canonical
              worldPresenceBridge authority. STAND does not release the reserved
              seat; SIT returns to the canonical seat transform. */}
          {tray === "world"
            ? (
                <>
                  <button
                    type="button"
                    data-testid="dock-world-sit"
                    onClick={() => fireWorldCommand("SIT")}
                    style={tileStyle(worldPosture === "seated", CYAN)}
                  >
                    <span style={{ fontSize: 22 }}>🪑</span>
                    <span style={{ fontSize: 9, fontWeight: 700 }}>{worldPosture === "seated" ? "SEATED" : "SIT"}</span>
                  </button>
                  <button
                    type="button"
                    data-testid="dock-world-stand"
                    onClick={() => fireWorldCommand("STAND")}
                    style={tileStyle(worldPosture === "standing", GOLD)}
                  >
                    <span style={{ fontSize: 22 }}>🧍</span>
                    <span style={{ fontSize: 9, fontWeight: 700 }}>{worldPosture === "standing" ? "STANDING" : "STAND"}</span>
                  </button>
                </>
              )
            : null}

          {tray === "tip" ? (
            tipArtistSlug ? (
              TIP_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  disabled={tipBusy}
                  onClick={() => void sendTip(amt)}
                  style={tileStyle(false, GOLD)}
                >
                  <span style={{ fontSize: 18 }}>💵</span>
                  <span style={{ fontSize: 10, fontWeight: 800 }}>${amt}</span>
                </button>
              ))
            ) : (
              <div data-testid="dock-tip-unavailable" style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                Tip unavailable — performer not bound.
              </div>
            )
          ) : null}
          {tipError ? (
            <div style={{ width: "100%", textAlign: "center", fontSize: 10, color: "#FF6B9A" }}>{tipError}</div>
          ) : null}

          {tray === "crowd"
            ? PERFORMER_CROWD.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => sendCrowdPrompt(c.id, c.icon, c.label)}
                  style={tileStyle(false, FUCHSIA)}
                >
                  <span style={{ fontSize: 22 }}>{c.icon}</span>
                  <span style={{ fontSize: 9, fontWeight: 700 }}>{c.label}</span>
                </button>
              ))
            : null}

          {tray === "curtain" && isPerformer ? (
            <>
              <button type="button" data-testid="curtain-open" onClick={() => curtainAction("open")} style={tileStyle(false, CYAN)}>
                <span style={{ fontSize: 22 }}>🎭</span>
                <span style={{ fontSize: 9, fontWeight: 700 }}>Open Curtain</span>
              </button>
              <button type="button" data-testid="curtain-close" onClick={() => curtainAction("close")} style={tileStyle(false, GOLD)}>
                <span style={{ fontSize: 22 }}>🎭</span>
                <span style={{ fontSize: 9, fontWeight: 700 }}>Close Curtain</span>
              </button>
              <button type="button" data-testid="dock-pause-show" onClick={() => pauseShow()} style={tileStyle(false, FUCHSIA)}>
                <span style={{ fontSize: 22 }}>⏸</span>
                <span style={{ fontSize: 9, fontWeight: 700 }}>Pause Show</span>
              </button>
              <button type="button" data-testid="dock-resume-show" onClick={() => resumeShow()} style={tileStyle(false, FUCHSIA)}>
                <span style={{ fontSize: 22 }}>▶</span>
                <span style={{ fontSize: 9, fontWeight: 700 }}>Resume Show</span>
              </button>
            </>
          ) : null}
          {isPerformer && (tray === "visual" || tray === "presence" || tray === "guests" || tray === "mix") ? (
            <PerformerHudExtendedTrays
              tray={tray}
              roomId={roomId}
              liveSessionId={liveSessionId ?? `session:${roomId}`}
              performerId={writerId}
              countryCode={countryCode}
              experienceKind={experienceKind}
              hasAvatarBound={hasAvatarBound}
              hasVrRuntime={hasVrRuntime}
              hasFaceIdentity={hasFaceIdentity}
              chromaReady={chromaReady}
              writeSide={writeSide}
              onWriteSideChange={setWriteSide}
              visualFilter={visualFilter}
              visualBg={visualBg}
              onVisualFilter={setVisualFilter}
              onVisualBg={setVisualBg}
              presenceMode={presenceMode}
              headsetMode={headsetMode}
              onPresenceMode={setPresenceMode}
              onHeadsetMode={setHeadsetMode}
              onStatus={onStatus}
              inviteNameDraft={inviteNameDraft}
              onInviteNameDraft={setInviteNameDraft}
            />
          ) : null}
          {tray === "write" && isPerformer ? (
            <>
            <PerformerHudExtendedTrays
              tray="write-side"
              roomId={roomId}
              liveSessionId={liveSessionId ?? `session:${roomId}`}
              performerId={writerId}
              writeSide={writeSide}
              onWriteSideChange={setWriteSide}
              visualFilter={visualFilter}
              visualBg={visualBg}
              onVisualFilter={setVisualFilter}
              onVisualBg={setVisualBg}
              presenceMode={presenceMode}
              headsetMode={headsetMode}
              onPresenceMode={setPresenceMode}
              onHeadsetMode={setHeadsetMode}
              onStatus={onStatus}
            />

            <div data-testid="live-write-composer" data-teleprompter={PRIVATE_TELEPROMPTER_STATUS} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button type="button" data-testid="live-write-post" onClick={() => {
                  const posted = postPublicLiveWrite({
                    performerId: writerId,
                    roomId,
                    sessionId: liveSessionId ?? `session:${roomId}`,
                    text: writeDraft,
                    mode: writeMode,
                    stayUp: writeStay,
                    durationMs: writeStay ? null : writeSeconds * 1000,
                    side: writeSide,
                  });
                  setWritePublic(Boolean(posted));
                  onStatus?.(posted ? "LIVE TEXT ON" : "Nothing to post");
                }} style={tileStyle(false, CYAN)}>POST</button>
                <button type="button" data-testid="live-write-live-type" onClick={() => {
                  const scope = {
                    performerId: writerId,
                    roomId,
                    sessionId: liveSessionId ?? `session:${roomId}`,
                  };
                  const next = !liveTypeOn;
                  setLiveTypeEnabled(scope, next);
                  setLiveTypeOn(next);
                  onStatus?.(next ? "LIVE TYPE ON" : "LIVE TYPE OFF");
                }} style={tileStyle(liveTypeOn, FUCHSIA)}>{liveTypeOn ? "LIVE TYPE ON" : "LIVE TYPE OFF"}</button>
                <button type="button" data-testid="live-write-remove" onClick={() => {
                  const removed = removePublicLiveWrite(writerId, {
                    roomId,
                    sessionId: liveSessionId ?? `session:${roomId}`,
                  });
                  setWritePublic(false);
                  onStatus?.(removed ? "Public text removed" : "No public text");
                }} style={tileStyle(false, GOLD)}>REMOVE</button>
                <button type="button" data-testid="live-write-clear-draft" onClick={() => {
                  clearPrivateDraft(writerId);
                  setWriteDraft("");
                }} style={tileStyle(false, "rgba(255,255,255,0.4)")}>CLEAR DRAFT</button>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)" }}>
                {PRIVATE_TELEPROMPTER_STATUS} · {writePublic ? "LIVE TEXT ON" : "PRIVATE DRAFT"}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {(["STATIC", "ANIMATED", "SCROLL_UP"] as LiveBannerMode[]).map((mode) => (
                  <button key={mode} type="button" onClick={() => setWriteMode(mode)} style={tileStyle(writeMode === mode, CYAN)}>{mode === "SCROLL_UP" ? "SCROLL UP" : mode}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button type="button" onClick={() => setWriteStay(true)} style={tileStyle(writeStay, GOLD)}>STAY UP</button>
                {[5, 10, 15, 30].map((seconds) => (
                  <button key={seconds} type="button" onClick={() => { setWriteStay(false); setWriteSeconds(seconds); }} style={tileStyle(!writeStay && writeSeconds === seconds, GOLD)}>{seconds}s</button>
                ))}
              </div>
              <textarea
                data-testid="live-write-draft"
                value={writeDraft}
                onChange={(event) => saveDraft(event.target.value)}
                onKeyDown={() => onActivity?.()}
                placeholder="Private draft. POST to show it."
                style={{ width: "100%", minHeight: 64, borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.45)", color: "#fff", padding: 8 }}
              />
            </div>
            </>
          ) : null}
        </div>
      ) : null}

      {/* Bottom dock flush to edge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 10px",
          overflowX: "auto",
          borderTop: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(8,10,18,0.72)",
          backdropFilter: "blur(22px)",
        }}
      >
        {dockOrder.map((id) => {
          if (id === "HUD")
            return chip("HUD", "◱", false, () => onToggleHud?.(), "dock-hud");
          if (id === "VIEW")
            return chip("VIEW", "👁", false, () => {
              window.dispatchEvent(new CustomEvent("tmi:venue:toggle-view", { detail: { roomId } }));
              onStatus?.("View mode toggled");
            }, "dock-view");
          if (id === "CHAT")
            return chip("CHAT", "💬", tray === "chat", () => toggleTray("chat"), "dock-chat");
          if (id === "FOLLOW")
            return performerUserId ? (
              <div key="dock-follow" data-testid="dock-follow" style={{ flexShrink: 0 }}>
                <FollowButton
                  targetUserId={performerUserId}
                  targetName={performerName}
                  variant="icon"
                  accent={FUCHSIA}
                />
              </div>
            ) : (
              <div
                key="dock-follow-unavailable"
                data-testid="dock-follow-unavailable"
                title="Follow unavailable — performer not bound"
                style={{ ...tileStyle(false, "rgba(255,255,255,0.2)"), minWidth: 48, padding: "6px 8px", flexShrink: 0, opacity: 0.4, cursor: "default" }}
              >
                <span style={{ fontSize: 16 }}>+</span>
                <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.06em" }}>FOLLOW</span>
              </div>
            );
          if (id === "REACTIONS")
            return chip("REACT", "🔥", tray === "reactions", () => toggleTray("reactions"), "dock-reactions");
          if (id === "EMOTES")
            return chip("EMOTE", "💃", tray === "emotes", () => toggleTray("emotes"), "dock-emotes");
          if (id === "PROPS")
            return chip("PROPS", "🕯️", tray === "props", () => toggleTray("props"), "dock-props");
          if (id === "GROUP")
            return chip("GROUP", "🙌", tray === "group", () => toggleTray("group"), "dock-group");
          if (id === "TIP")
            return chip("TIP", "💵", tray === "tip", () => toggleTray("tip"), "dock-tip");
          if (id === "MEMORY")
            return chip("MEM", "📷", false, () => {
              window.dispatchEvent(new CustomEvent("tmi:open-workspace", { detail: { workspaceId: "memory", surface: "DRAWER" } }));
            }, "dock-memory");
          if (id === "MORE")
            return chip(id, "⋯", tray === "world", () => toggleTray("world"), `dock-${id.toLowerCase()}`);
          if (id === "VISUAL")
            return chip("LOOK", "✨", tray === "visual", () => toggleTray("visual"), "dock-visual");
          if (id === "PRESENCE")
            return chip("PRES", "📍", tray === "presence", () => toggleTray("presence"), "dock-presence");
          if (id === "GUESTS")
            return chip("GUESTS", "🚪", tray === "guests", () => toggleTray("guests"), "dock-guests");
          if (id === "MIX")
            return chip("MIX", "🎚", tray === "mix", () => toggleTray("mix"), "dock-mix");
          if (id === "CAMERA")
            return chip("CAM", "📷", false, () => void HudCommandBus.execute("TOGGLE_CAMERA"), "dock-camera");
          if (id === "MIC")
            return chip("MIC", "🎤", false, () => void HudCommandBus.execute("TOGGLE_MIC"), "dock-mic");
          if (id === "APPRECIATION")
            return chip("THANKS", "🙏", tray === "appreciation", () => toggleTray("appreciation"), "dock-appreciation");
          if (id === "CROWD")
            return chip("CROWD", "🙌", tray === "crowd", () => toggleTray("crowd"), "dock-crowd");
          if (id === "CURTAIN")
            return chip("CURTAIN", "🎭", tray === "curtain", () => toggleTray("curtain"), "dock-curtain");
          if (id === "FX")
            return chip("FX", "🎆", tray === "effects", () => toggleTray("effects"), "dock-effects");
          if (id === "SMOKE")
            return chip("SMOKE", "🌫️", false, () => {
              const result = venueTriggerFx("fog-roll");
              onStatus?.(result.ok ? "Fog roll" : result.error ?? "Fog unavailable");
            }, "dock-smoke");
          if (id === "WRITE")
            return chip("WRITE", "✎", tray === "write", () => toggleTray("write"), "dock-write");
          return null;
        })}
      </div>
    </div>
  );
}
