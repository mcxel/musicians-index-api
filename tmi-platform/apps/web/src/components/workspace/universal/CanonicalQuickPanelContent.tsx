"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useDiscoveryBus } from "@/lib/discovery/useDiscoveryBus";
import LiveLobbyWallHost from "@/components/live/LiveLobbyWallHost";
import type { LobbyRoom } from "@/components/live/LiveLobbyWallGrid";
import { LobbyEntryFlow } from "@/components/room/UniversalLobbyEntry";
import { resolveInstantJoin } from "@/lib/discovery/InstantJoinRuntime";
import { resolveLobbyDestination } from "@/lib/lobby/DestinationResolver";
import { resolveParticipationEntry } from "@/lib/live/ParticipationStateMachine";
import {
  listEquippableCostumes,
  listEquippableProps,
} from "@/lib/avatars/FanCosmeticCatalog";
import { listFanSelectableBases } from "@/lib/avatars/BobbleheadBaseRegistry";
import { BOBBLEHEAD_RUNTIME_LABEL } from "@/lib/avatars/BobbleheadRuntimeCharacter";
import {
  commitCanonicalDraftToFanWorld,
  getCanonicalAvatarDraft,
  hydrateCanonicalAvatarDraft,
  patchCanonicalAvatarDraft,
  persistCanonicalDraftIdentity,
  subscribeCanonicalAvatarDraft,
} from "@/lib/avatars/CanonicalAvatarDraft";
import { gatePreviewAction, resolveAvatarPreview } from "@/lib/avatars/AvatarPreviewRuntime";
import type { AvatarPreviewAction } from "@/lib/avatars/AvatarPreviewActions";
import {
  sendPlaybackCommand,
  subscribePlaylistNowPlaying,
  type PlaylistNowPlayingPayload,
} from "@/lib/playlists/commandCenterPlaybackBus";
import { digitalQuickPanelFrameStyle } from "@/lib/ui/digitalQuickPanelChrome";
import { openCanonicalDeepStudio } from "@/lib/workspace/universal/openCanonicalPresentation";
import type { UniversalWorkspaceId } from "@/lib/workspace/universal/types";
import { MemoryWallCanister } from "@/components/canisters/MemoryWallCanister";
import YoPhoFanPortraitWorkspace from "@/components/yopho/YoPhoFanPortraitWorkspace";
import VenueControlPanel from "@/components/hud/panels/VenueControlPanel";

const AvatarViewer = dynamic(
  () => import("@/components/3d/AvatarLobbyCanvas").then((mod) => mod.AvatarViewer),
  { ssr: false },
);

export interface CanonicalQuickPanelContentProps {
  workspaceId: UniversalWorkspaceId;
  userId: string;
  displayName: string;
  role: "fan" | "performer";
  accentColor?: string;
  onClose: () => void;
  /** When true, outer QuickPanelShell is omitted (host provides chrome). */
  embedded?: boolean;
}

function QuickPanelShell({
  title,
  accentColor,
  onClose,
  onOpenDeep,
  deepLabel,
  children,
}: {
  title: string;
  accentColor: string;
  onClose: () => void;
  onOpenDeep?: () => void;
  deepLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        maxHeight: "70vh",
        overflowY: "auto",
        borderRadius: 4,
        ...digitalQuickPanelFrameStyle(accentColor),
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 12px",
          borderBottom: `1px solid ${accentColor}44`,
          position: "sticky",
          top: 0,
          background: "rgba(2,8,22,0.92)",
          zIndex: 1,
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 900, color: accentColor, letterSpacing: "0.1em", flex: 1 }}>
          {title}
        </span>
        {onOpenDeep ? (
          <button
            type="button"
            onClick={onOpenDeep}
            style={{
              fontSize: 8,
              fontWeight: 800,
              padding: "4px 8px",
              borderRadius: 4,
              border: `1px solid ${accentColor}`,
              background: `${accentColor}18`,
              color: accentColor,
              cursor: "pointer",
            }}
          >
            {deepLabel ?? "OPEN STUDIO"}
          </button>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          style={{ background: "transparent", border: "none", color: "#7878AA", cursor: "pointer", fontSize: 14 }}
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  );
}

function AvatarQuickPanel({
  userId,
  displayName,
  role,
  accentColor = "#00E5FF",
  onClose,
  embedded,
}: Omit<CanonicalQuickPanelContentProps, "workspaceId">) {
  const outfits = useMemo(() => listEquippableCostumes().slice(0, 5), []);
  const props = useMemo(() => listEquippableProps().slice(0, 4), []);
  const bases = useMemo(() => listFanSelectableBases().slice(0, 6), []);
  const [draft, setDraft] = useState(() => getCanonicalAvatarDraft());
  const [saveNote, setSaveNote] = useState<string | null>(null);
  const isFan = role === "fan";

  useEffect(() => {
    const hydrated = hydrateCanonicalAvatarDraft();
    setDraft(hydrated);
    return subscribeCanonicalAvatarDraft(setDraft);
  }, []);

  const preview = useMemo(() => resolveAvatarPreview(draft), [draft]);
  const viewport = preview.viewport;
  const isBound = viewport.diagnostic === "OK" && Boolean(viewport.glbUrl);
  const rig = preview.rigProps;
  const baseId = draft.baseId;
  const activeOutfit = draft.equippedCosmeticIds[0] ?? "";
  const expression =
    draft.previewAction === "SMILE" ? "smile" : draft.previewAction === "HYPE" ? "hype" : "neutral";

  const handleSaveToFanWorld = () => {
    const result = commitCanonicalDraftToFanWorld({
      outfitLabel: activeOutfit || "Street Fit",
    });
    if (!result.ok) {
      setSaveNote(result.reason);
      if (result.storeHref && typeof window !== "undefined") {
        window.location.assign(result.storeHref);
      }
      return;
    }
    setSaveNote(`Saved to Fan World · ${result.look.loadoutId}`);
  };

  if (!isFan) {
    return null;
  }

  const avatarBody = (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            height: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "radial-gradient(ellipse at center, rgba(0,229,255,0.08) 0%, transparent 70%)",
            borderRadius: 8,
            border: "1px solid rgba(0,229,255,0.2)",
            position: "relative",
          }}
          data-avatar-binding={viewport.diagnostic}
        >
          {isBound ? (
            <AvatarViewer
              {...rig}
              size={140}
              enableOrbit={false}
              glbSlotId={viewport.slotId}
              glbUrl={viewport.glbUrl}
              certifiedOnly
            />
          ) : (
            <div style={{ textAlign: "center", padding: 12, maxWidth: 220 }}>
              <div
                style={{
                  width: 40,
                  height: 80,
                  margin: "0 auto 8px",
                  borderRadius: "20px 20px 12px 12px",
                  border: `1.5px dashed ${accentColor}66`,
                  opacity: 0.5,
                }}
              />
              <div style={{ fontSize: 9, fontWeight: 900, color: "#FF2DAA", letterSpacing: "0.08em" }}>
                {viewport.diagnostic}
              </div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.45)", marginTop: 4, lineHeight: 1.35 }}>
                Foundry GLB not certified — capsule disabled on production surfaces.
              </div>
            </div>
          )}
          <div
            style={{
              position: "absolute",
              bottom: 6,
              left: 8,
              right: 8,
              fontSize: 7,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.06em",
            }}
          >
            {isBound ? BOBBLEHEAD_RUNTIME_LABEL : viewport.diagnostic}
          </div>
        </div>
        <div style={{ fontSize: 9, fontWeight: 800, color: accentColor, letterSpacing: "0.08em" }}>BASES</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {bases.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                const next = patchCanonicalAvatarDraft({ baseId: b.id });
                persistCanonicalDraftIdentity(next);
              }}
              style={{
                fontSize: 8,
                fontWeight: 800,
                padding: "4px 8px",
                borderRadius: 6,
                border: `1px solid ${baseId === b.id ? accentColor : "rgba(255,255,255,0.15)"}`,
                background: baseId === b.id ? `${accentColor}22` : "rgba(255,255,255,0.04)",
                color: baseId === b.id ? accentColor : "rgba(255,255,255,0.7)",
                cursor: "pointer",
              }}
            >
              {b.displayName}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 9, fontWeight: 800, color: accentColor, letterSpacing: "0.08em" }}>OUTFITS</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {outfits.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => patchCanonicalAvatarDraft({ equippedCosmeticIds: [o.id] })}
              style={{
                fontSize: 8,
                fontWeight: 800,
                padding: "4px 8px",
                borderRadius: 6,
                border: `1px solid ${activeOutfit === o.id ? accentColor : "rgba(255,255,255,0.15)"}`,
                background: activeOutfit === o.id ? `${accentColor}22` : "rgba(255,255,255,0.04)",
                color: activeOutfit === o.id ? accentColor : "rgba(255,255,255,0.7)",
                cursor: "pointer",
              }}
            >
              {o.icon ?? "👕"} {o.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 9, fontWeight: 800, color: accentColor, letterSpacing: "0.08em" }}>EMOTES</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["neutral", "smile", "hype"] as const).map((expr) => {
            const action: AvatarPreviewAction =
              expr === "smile" ? "SMILE" : expr === "hype" ? "HYPE" : "IDLE";
            const gate = gatePreviewAction(action, viewport);
            const disabled = !gate.allowed;
            return (
              <button
                key={expr}
                type="button"
                disabled={disabled}
                title={
                  disabled
                    ? gate.reason ?? "Not available on production rig"
                    : `Set expression: ${expr}`
                }
                onClick={() => {
                  if (!disabled) patchCanonicalAvatarDraft({ previewAction: action });
                }}
                style={{
                  fontSize: 8,
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: `1px solid ${expression === expr && !disabled ? accentColor : "rgba(255,255,255,0.15)"}`,
                  background: expression === expr && !disabled ? accentColor : "rgba(255,255,255,0.04)",
                  color: disabled
                    ? "rgba(255,255,255,0.25)"
                    : expression === expr
                      ? "#050510"
                      : "rgba(255,255,255,0.7)",
                  cursor: disabled ? "not-allowed" : "pointer",
                  textTransform: "uppercase",
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                {expr}
              </button>
            );
          })}
          {props.slice(0, 2).map((p) => (
            <button
              key={p.id}
              type="button"
              disabled
              title="Prop sockets require certified AvatarRig GLB"
              style={{
                fontSize: 8,
                padding: "4px 8px",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.04)",
                cursor: "not-allowed",
                opacity: 0.45,
              }}
            >
              {p.icon ?? "🎭"}
            </button>
          ))}
        </div>
        {!isBound && (
          <div style={{ fontSize: 7, color: "rgba(255,180,0,0.85)" }}>
            Emotes disabled until Foundry certifies {viewport.slot.publicPath}.
          </div>
        )}
        <button
          type="button"
          data-testid="quick-avatar-save-fan-world"
          onClick={handleSaveToFanWorld}
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.08em",
            padding: "8px 10px",
            borderRadius: 8,
            border: `1px solid ${accentColor}`,
            background: `${accentColor}22`,
            color: accentColor,
            cursor: "pointer",
            textTransform: "uppercase",
          }}
        >
          Save → Fan World
        </button>
        {saveNote ? (
          <div style={{ fontSize: 7, color: "rgba(255,255,255,0.55)", lineHeight: 1.35 }}>{saveNote}</div>
        ) : null}
        <Link
          href="/avatar/studio"
          style={{ fontSize: 8, color: accentColor, textDecoration: "none", fontWeight: 700 }}
        >
          Open Avatar Studio →
        </Link>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
          {displayName} · {userId.slice(0, 8)}
        </div>
      </div>
  );

  if (embedded) return avatarBody;

  return (
    <QuickPanelShell
      title="AVATAR QUICK · SHARED DRAFT"
      accentColor={accentColor}
      onClose={onClose}
      onOpenDeep={() => openCanonicalDeepStudio("inventory")}
      deepLabel="DECORATE / CUSTOMIZE"
    >
      {avatarBody}
    </QuickPanelShell>
  );
}

function LiveDestinationsQuickPanel({
  accentColor,
  onClose,
  embedded,
  userId,
  role,
}: {
  accentColor: string;
  onClose: () => void;
  embedded?: boolean;
  userId: string;
  role: "fan" | "performer";
}) {
  const [joinDecision, setJoinDecision] = useState<ReturnType<typeof resolveInstantJoin> | null>(null);
  const records = useDiscoveryBus(userId);

  const handleRoomJoin = useCallback(
    (room: LobbyRoom) => {
      const record = records.find((r) => r.roomId === room.id || r.id === room.id);
      if (record) {
        const decision = resolveInstantJoin(record, { role: role === "performer" ? "PERFORMER" : "FAN" });
        if (decision.instant && decision.gateReason === "none") {
          if (typeof window !== "undefined") {
            window.location.assign(decision.href);
            return;
          }
        }
        setJoinDecision(decision);
        return;
      }
      const dest = resolveLobbyDestination({
        roomId: room.id,
        kind:
          room.type === "battle" || room.type === "cypher" || room.type === "challenge"
            ? room.type
            : room.type === "lounge"
              ? "lounge"
              : room.type === "performer-lobby"
                ? "performer-lobby"
                : "live",
        href: room.href,
      });
      if (typeof window !== "undefined") {
        window.location.assign(dest.href);
        return;
      }
      const fallbackKind =
        room.type === "battle"
          ? "battle"
          : room.type === "cypher"
            ? "cypher"
            : room.type === "challenge"
              ? "challenge"
              : room.type === "lounge"
                ? "lounge"
                : room.type === "performer-lobby"
                  ? "performer_lobby"
                  : "live";
      const resolution = resolveParticipationEntry({
        role: role === "performer" ? "PERFORMER" : "FAN",
        roomKind: fallbackKind,
      });
      setJoinDecision({
        instant: true,
        gateReason: "none",
        href: dest.href,
        entryMode: resolution.entryMode,
        roomKind: resolution.roomKind,
        initialState: resolution.initialState,
        claimFanSeat: resolution.claimFanSeat,
        room: {
          id: room.id,
          title: room.name,
          hostName: room.performerName,
          genre: room.genre,
          viewers: room.viewerCount,
          status: room.status === "live" ? "live" : "starting-soon",
          access: "free",
          accentColor: accentColor,
          roomRoute: dest.href,
          venueIndex: 0,
          participationEntryMode: resolution.entryMode,
          participationRoomKind: resolution.roomKind,
          claimFanSeat: resolution.claimFanSeat,
        },
      });
    },
    [records, accentColor, role],
  );

  const body = (
    <div style={{ padding: 8, minHeight: embedded ? 120 : 220 }}>
      <LiveLobbyWallHost
        accentColor={accentColor}
        title="Tap tile → join room instantly"
        typeLabel="LOBBIES"
        variant="quick"
        viewerUserId={userId}
        viewerRole={role === "performer" ? "PERFORMER" : "FAN"}
        onRoomJoin={handleRoomJoin}
        showFanLobbySearch={role === "fan"}
        enableMobileRoam={false}
      />
      {joinDecision ? (
        <LobbyEntryFlow room={joinDecision.room} instant onClose={() => setJoinDecision(null)} />
      ) : null}
    </div>
  );

  if (embedded) return body;

  return (
    <QuickPanelShell title="LIVE LOBBY WALL · LOBBIES" accentColor={accentColor} onClose={onClose}>
      {body}
    </QuickPanelShell>
  );
}

function PlaylistQuickRemotePanel({
  accentColor,
  onClose,
}: {
  accentColor: string;
  onClose: () => void;
}) {
  const [nowPlaying, setNowPlaying] = useState<PlaylistNowPlayingPayload | null>(null);

  useEffect(() => {
    return subscribePlaylistNowPlaying(setNowPlaying);
  }, []);

  return (
    <QuickPanelShell
      title="PLAYLIST REMOTE"
      accentColor={accentColor}
      onClose={onClose}
      onOpenDeep={() => openCanonicalDeepStudio("playlist-studio")}
      deepLabel="FULL STUDIO"
    >
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        {nowPlaying ? (
          <>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{nowPlaying.title}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>{nowPlaying.artist ?? "Unknown artist"}</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8 }}>
              <button type="button" onClick={() => sendPlaybackCommand("prev")} style={remoteBtn(accentColor)}>⏮</button>
              <button
                type="button"
                onClick={() => sendPlaybackCommand(nowPlaying.isPlaying ? "pause" : "play")}
                style={{ ...remoteBtn(accentColor), padding: "8px 16px" }}
              >
                {nowPlaying.isPlaying ? "⏸" : "▶"}
              </button>
              <button type="button" onClick={() => sendPlaybackCommand("next")} style={remoteBtn(accentColor)}>⏭</button>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textAlign: "center", padding: "16px 0" }}>
            Nothing playing. Open full studio to pick a playlist.
          </div>
        )}
        <Link href="/hub/fan?drawer=playlist" style={{ fontSize: 9, color: accentColor, textAlign: "center" }}>
          Change playlist →
        </Link>
      </div>
    </QuickPanelShell>
  );
}

function remoteBtn(accentColor: string): React.CSSProperties {
  return {
    fontSize: 14,
    padding: "8px 12px",
    borderRadius: 8,
    border: `1px solid ${accentColor}`,
    background: `${accentColor}18`,
    color: accentColor,
    cursor: "pointer",
  };
}

export default function CanonicalQuickPanelContent({
  workspaceId,
  userId,
  displayName,
  role,
  accentColor = "#00E5FF",
  onClose,
  embedded = false,
}: CanonicalQuickPanelContentProps) {
  if (workspaceId === "inventory") {
    if (role === "performer") return null;
    return (
      <AvatarQuickPanel
        userId={userId}
        displayName={displayName}
        role={role}
        accentColor={accentColor}
        onClose={onClose}
        embedded={embedded}
      />
    );
  }

  if (workspaceId === "lobby" || workspaceId === "live-destinations") {
    return (
      <LiveDestinationsQuickPanel
        accentColor={accentColor}
        onClose={onClose}
        embedded={embedded}
        userId={userId}
        role={role}
      />
    );
  }

  if (workspaceId === "memory-wall") {
    const inner = (
      <div style={{ padding: 8 }}>
        <MemoryWallCanister
          entityId={userId}
          entityType={role === "performer" ? "performer" : "fan"}
          title="Memory Wall"
          accentColor={accentColor}
          useSessionOwner
        />
      </div>
    );
    if (embedded) return inner;
    return (
      <QuickPanelShell title="MEMORY WALL" accentColor={accentColor} onClose={onClose} onOpenDeep={() => openCanonicalDeepStudio("memory-wall")}>
        {inner}
      </QuickPanelShell>
    );
  }

  if (workspaceId === "yopho") {
    const inner = (
      <div style={{ padding: 4, maxHeight: 320, overflow: "auto" }}>
        <YoPhoFanPortraitWorkspace userId={userId} displayName={displayName} compact />
      </div>
    );
    if (embedded) return inner;
    return (
      <QuickPanelShell title="YOPHO" accentColor={accentColor} onClose={onClose} onOpenDeep={() => openCanonicalDeepStudio("yopho")}>
        {inner}
      </QuickPanelShell>
    );
  }

  if (workspaceId === "playlist-studio") {
    return <PlaylistQuickRemotePanel accentColor={accentColor} onClose={onClose} />;
  }

  if (workspaceId === "room-controls") {
    const inner = (
      <VenueControlPanel
        role={role}
        userId={userId}
        venueId={userId}
        accentColor={accentColor}
      />
    );
    if (embedded) return inner;
    return (
      <QuickPanelShell
        title="VENUE CONTROLS"
        accentColor={accentColor}
        onClose={onClose}
        onOpenDeep={() => openCanonicalDeepStudio("room-controls")}
        deepLabel="FULL CONTROLS"
      >
        {inner}
      </QuickPanelShell>
    );
  }

  const fallback = (
    <div style={{ padding: 14, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
      Quick controls for this workspace — open full studio for deep work.
    </div>
  );
  if (embedded) return fallback;
  return (
    <QuickPanelShell title={workspaceId.toUpperCase()} accentColor={accentColor} onClose={onClose}>
      {fallback}
    </QuickPanelShell>
  );
}
