/**
 * CanonicalUniversalPlayerFabric.ts — Universal Media Player Experience Law
 * + UNIVERSAL PLAYER FREEDOM LAW (Marcel locked 2026-09-02)
 * + Dual-View / Presence Continuity / Dynamic Communication Player laws
 *
 * Laws:
 * 1. SOURCE ≠ DECODER ≠ TARGET.
 * 2. Pipeline: EXPERIENCE SESSION → SOURCES → DISPLAY TARGETS (players 1–16 / Jumbotron / venue).
 * 3. Commands manipulate player assignment state, NEVER experience session truth.
 * 4. Audio Law: one authoritative PROGRAM contribution regardless of visual target count.
 * 5. Jumbotron Source Mirroring: JUMBOTRON_FEED may land on any player N without recursion.
 * 6. UNIVERSAL PLAYER FREEDOM LAW: PLAYER = DISPLAY TARGET — never dedicated.
 * 7. Dual-View / Presence Continuity / Dynamic Communication — see docs/audit/*.
 */

import {
  PresentationTargetResolver,
  type RecommendedAssignment,
} from "./PresentationTargetResolver";

export type { RecommendedAssignment };

export type CanonicalSourceType =
  | "BATTLE_PROGRAM"
  | "BATTLE_PERFORMER_A_ISO"
  | "BATTLE_PERFORMER_B_ISO"
  | "BATTLE_SCOREBOARD"
  | "CYPHER_ROTATION"
  | "LIVE_PROGRAM"
  | "AUDIENCE_CAMERA"
  | "FAN_AVATAR_LOBBY"
  | "LIVE_LOBBY_WALL"
  | "PRIVATE_VIDEO_CHAT"
  | "SHARED_PLAYLIST"
  | "JUMBOTRON_FEED";

/** Authorized viewpoints of one experience session — never permanently bound to a slot. */
export type CanonicalViewpointId =
  | "MAIN"
  | "PERFORMER_A"
  | "PERFORMER_B"
  | "AUDIENCE"
  | "SCOREBOARD"
  | "JUMBOTRON_VIEW"
  | "STAGE"
  | "SEAT_AVATAR"
  | "ROOM_OVERVIEW"
  | "MY_AVATAR"
  | "FRIEND_GROUP"
  | "FREE_LOOK"
  | "CUSTOM";

export type AudioAuthorityType = "PROGRAM" | "VOICE" | "SHARE" | "MUTED";

export interface CanonicalVisualSource {
  sourceId: string;
  sessionId: string;
  sourceType: CanonicalSourceType;
  title: string;
  decoderInstanceId: string; // Shared decoder identifier (SOURCE ≠ DECODER ≠ TARGET)
  audioAuthority: AudioAuthorityType;
  streamUrl?: string;
  is3DRendered?: boolean;
  /**
   * Authoritative live/playback cursor owned by the session/source.
   * TAKE / CHANGE VIEW / RETURN never restart this from 0.
   */
  livePositionMs?: number;
}

export type PlayerLayoutMode =
  | "FULL"
  | "SPLIT_HORIZONTAL"
  | "SPLIT_VERTICAL"
  | "QUAD"
  | "PIP";

export type QualityTier = "FULL_RATE" | "LOW_RATE" | "POSTER_THUMBNAIL";
export type VisibilityState = "VISIBLE" | "NEARBY" | "OFFSCREEN" | "HIDDEN";

export interface SplitAssignment {
  subSlotIndex: number;
  sourceId: string;
  sessionId: string;
  viewId: string;
}

export interface PlayerAssignmentSnapshot {
  sourceId: string | null;
  sessionId: string | null;
  viewId: string | null;
  viewpointId: CanonicalViewpointId | null;
  layoutMode: PlayerLayoutMode;
  splitAssignments?: SplitAssignment[];
  livePositionMsAtAssign?: number;
}

export interface CanonicalPlayerAssignmentState {
  playerId: string; // "slot-1" through "slot-16" — never an experience identity
  /** Runtime-mutable assignment — never a dedicated enum binding slot→experience. */
  sourceId: string | null;
  sessionId: string | null;
  viewId: string | null;
  viewpointId: CanonicalViewpointId | null;
  layoutMode: PlayerLayoutMode;
  splitAssignments?: SplitAssignment[];
  pinned: boolean;
  /** Top of previousSourceStack (compat). */
  previousSource: string | null;
  /** Stack for RETURN — restore prior assignment at current live position. */
  previousSourceStack: PlayerAssignmentSnapshot[];
  presentationRevision: number;
  audioAuthority: AudioAuthorityType;
  qualityTier: QualityTier;
  visibilityState: VisibilityState;
  isFullscreen: boolean;
}

export interface IncomingCallAlert {
  callSessionId: string;
  callerId: string;
  callerName: string;
  status: "RINGING" | "ACCEPTED" | "DECLINED" | "TERMINATED";
  timestampMs: number;
}

export class CanonicalUniversalPlayerFabric {
  private sources: Map<string, CanonicalVisualSource> = new Map();
  private players: Map<string, CanonicalPlayerAssignmentState> = new Map();
  private activeFullscreenPlayerId: string | null = null;
  private isMobileDevice = false;

  // Presence Continuity & Bokeh (Lounge/Room preservation during calls)
  private isBokehActiveOnRoom = false;
  private primaryRoomPlayerId: string | null = null;
  private primaryRoomSessionId: string | null = null;

  // Dynamic Communication Player Law (Target Resolver & Auto-Layout)
  private activeIncomingCall: IncomingCallAlert | null = null;
  private activeCallSessionId: string | null = null;
  private callPlayerId: string | null = null;
  private callParticipants: string[] = [];

  constructor(isMobile = false) {
    this.isMobileDevice = isMobile;
    // Initialize exactly 16 identical display targets — no dedicated role per slot.
    for (let i = 1; i <= 16; i++) {
      const playerId = `slot-${i}`;
      this.players.set(playerId, {
        playerId,
        sourceId: null,
        sessionId: null,
        viewId: null,
        viewpointId: null,
        layoutMode: "FULL",
        pinned: false,
        previousSource: null,
        previousSourceStack: [],
        presentationRevision: 1,
        audioAuthority: "MUTED",
        qualityTier: i <= 4 ? "FULL_RATE" : "LOW_RATE",
        visibilityState: i <= 6 ? "VISIBLE" : "OFFSCREEN",
        isFullscreen: false,
      });
    }
  }

  /**
   * Jumbotron Source Mirroring Law:
   * JUMBOTRON_FEED may be assigned to ANY player N — never a dedicated jumbotron slot.
   * Physical Jumbotron in the venue is independent of player assignment.
   */
  public mirrorJumbotronFeedToPlayer(
    feed: CanonicalVisualSource,
    playerId: string
  ): {
    success: boolean;
    spawnedNewSession: boolean;
    sharedDecoderInstanceId: string | null;
    player: CanonicalPlayerAssignmentState | null;
    reason: string;
  } {
    if (feed.sourceType !== "JUMBOTRON_FEED") {
      return {
        success: false,
        spawnedNewSession: false,
        sharedDecoderInstanceId: null,
        player: null,
        reason: "Source must be JUMBOTRON_FEED",
      };
    }

    const existing = this.sources.get(feed.sourceId);
    if (existing) {
      if (existing.sessionId !== feed.sessionId || existing.decoderInstanceId !== feed.decoderInstanceId) {
        return {
          success: false,
          spawnedNewSession: false,
          sharedDecoderInstanceId: existing.decoderInstanceId,
          player: null,
          reason: "Conflicting jumbotron feed identity for shared source",
        };
      }
    } else {
      this.registerSource({
        ...feed,
        audioAuthority: "MUTED",
      });
    }

    const ok = this.take(playerId, feed.sourceId, "JUMBOTRON_VIEW");
    const player = this.players.get(playerId) ?? null;
    return {
      success: ok,
      spawnedNewSession: false,
      sharedDecoderInstanceId: feed.decoderInstanceId,
      player,
      reason: ok
        ? `Mirrored JUMBOTRON_FEED onto ${playerId} (mutable assignment, not dedicated)`
        : `Failed to place JUMBOTRON_FEED on ${playerId}`,
    };
  }

  public registerSource(source: CanonicalVisualSource): void {
    this.sources.set(source.sourceId, {
      livePositionMs: source.livePositionMs ?? 0,
      ...source,
    });
  }

  public getSource(sourceId: string): CanonicalVisualSource | undefined {
    return this.sources.get(sourceId);
  }

  public getAllSources(): CanonicalVisualSource[] {
    return Array.from(this.sources.values());
  }

  /** Advance shared live cursor on a source — players never own this. */
  public advanceSourceLivePosition(sourceId: string, livePositionMs: number): boolean {
    const source = this.sources.get(sourceId);
    if (!source) return false;
    source.livePositionMs = Math.max(0, livePositionMs);
    return true;
  }

  public getPlayer(playerId: string): Readonly<CanonicalPlayerAssignmentState> | undefined {
    return this.players.get(playerId);
  }

  public getAllPlayers(): CanonicalPlayerAssignmentState[] {
    return Array.from(this.players.values());
  }

  private snapshotPlayer(player: CanonicalPlayerAssignmentState): PlayerAssignmentSnapshot {
    const source = player.sourceId ? this.sources.get(player.sourceId) : undefined;
    return {
      sourceId: player.sourceId,
      sessionId: player.sessionId,
      viewId: player.viewId,
      viewpointId: player.viewpointId,
      layoutMode: player.layoutMode,
      splitAssignments: player.splitAssignments ? [...player.splitAssignments] : undefined,
      livePositionMsAtAssign: source?.livePositionMs,
    };
  }

  private pushPrevious(player: CanonicalPlayerAssignmentState): void {
    if (!player.sourceId) return;
    const snap = this.snapshotPlayer(player);
    player.previousSourceStack.push(snap);
    player.previousSource = snap.sourceId;
  }

  /**
   * TAKE: Assigns a source to any player without modifying the underlying session.
   * Freedom Law: any compatible source may land on any slot.
   */
  public take(
    playerId: string,
    sourceId: string,
    viewpointId: CanonicalViewpointId = "MAIN"
  ): boolean {
    const player = this.players.get(playerId);
    const source = this.sources.get(sourceId);
    if (!player || !source) return false;
    if (player.pinned && player.sourceId && player.sourceId !== sourceId) return false;

    this.pushPrevious(player);
    player.sourceId = source.sourceId;
    player.sessionId = source.sessionId;
    player.viewId = `${source.sourceType.toLowerCase()}-view`;
    player.viewpointId = viewpointId;
    player.layoutMode = "FULL";
    player.splitAssignments = undefined;
    player.presentationRevision++;

    // Presence Continuity: remember primary room session when PROGRAM lands
    if (source.audioAuthority === "PROGRAM" && !this.primaryRoomSessionId) {
      this.primaryRoomSessionId = source.sessionId;
      this.primaryRoomPlayerId = playerId;
    }

    this.rebalanceAudioAuthority();
    return true;
  }

  /** CHANGE VIEW: same session, different viewpoint — no session restart. */
  public changeView(
    playerId: string,
    sourceId: string,
    viewpointId: CanonicalViewpointId
  ): boolean {
    const player = this.players.get(playerId);
    const source = this.sources.get(sourceId);
    if (!player || !source) return false;

    this.pushPrevious(player);
    player.sourceId = source.sourceId;
    player.sessionId = source.sessionId;
    player.viewId = `${source.sourceType.toLowerCase()}-${viewpointId.toLowerCase()}`;
    player.viewpointId = viewpointId;
    player.presentationRevision++;
    this.rebalanceAudioAuthority();
    return true;
  }

  public move(fromPlayerId: string, toPlayerId: string): boolean {
    const from = this.players.get(fromPlayerId);
    const to = this.players.get(toPlayerId);
    if (!from || !to || !from.sourceId) return false;
    if (to.pinned && to.sourceId) return false;

    this.pushPrevious(to);
    to.sourceId = from.sourceId;
    to.sessionId = from.sessionId;
    to.viewId = from.viewId;
    to.viewpointId = from.viewpointId;
    to.layoutMode = from.layoutMode;
    to.splitAssignments = from.splitAssignments ? [...from.splitAssignments] : undefined;
    to.presentationRevision++;

    from.sourceId = null;
    from.sessionId = null;
    from.viewId = null;
    from.viewpointId = null;
    from.layoutMode = "FULL";
    from.splitAssignments = undefined;
    from.presentationRevision++;

    this.rebalanceAudioAuthority();
    return true;
  }

  public swap(playerIdA: string, playerIdB: string): boolean {
    const a = this.players.get(playerIdA);
    const b = this.players.get(playerIdB);
    if (!a || !b) return false;

    const temp = this.snapshotPlayer(a);
    this.pushPrevious(a);
    this.pushPrevious(b);

    a.sourceId = b.sourceId;
    a.sessionId = b.sessionId;
    a.viewId = b.viewId;
    a.viewpointId = b.viewpointId;
    a.layoutMode = b.layoutMode;
    a.splitAssignments = b.splitAssignments ? [...b.splitAssignments] : undefined;
    a.presentationRevision++;

    b.sourceId = temp.sourceId;
    b.sessionId = temp.sessionId;
    b.viewId = temp.viewId;
    b.viewpointId = temp.viewpointId;
    b.layoutMode = temp.layoutMode;
    b.splitAssignments = temp.splitAssignments;
    b.presentationRevision++;

    this.rebalanceAudioAuthority();
    return true;
  }

  public pin(playerId: string, isPinned: boolean): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;
    player.pinned = isPinned;
    return true;
  }

  public unpin(playerId: string): boolean {
    return this.pin(playerId, false);
  }

  /**
   * SPLIT: presentation-only. Does not change experience ownership / session.
   */
  public split(
    playerId: string,
    mode: "SPLIT_HORIZONTAL" | "SPLIT_VERTICAL" | "QUAD",
    subSourceIds: string[]
  ): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;

    this.pushPrevious(player);

    const splits: SplitAssignment[] = [];
    for (let i = 0; i < subSourceIds.length; i++) {
      const srcId = subSourceIds[i]!;
      const src = this.sources.get(srcId);
      if (src) {
        splits.push({
          subSlotIndex: i,
          sourceId: src.sourceId,
          sessionId: src.sessionId,
          viewId: `${src.sourceType.toLowerCase()}-sub-${i}`,
        });
      }
    }

    player.layoutMode = mode;
    player.splitAssignments = splits;
    player.presentationRevision++;
    return true;
  }

  public unsplit(playerId: string): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;

    player.layoutMode = "FULL";
    player.splitAssignments = undefined;
    player.presentationRevision++;
    return true;
  }

  public expand(playerId: string): boolean {
    return this.fullscreen(playerId);
  }

  public fullscreen(playerId: string): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;

    if (this.activeFullscreenPlayerId && this.activeFullscreenPlayerId !== playerId) {
      const prev = this.players.get(this.activeFullscreenPlayerId);
      if (prev) prev.isFullscreen = false;
    }

    player.isFullscreen = !player.isFullscreen;
    this.activeFullscreenPlayerId = player.isFullscreen ? playerId : null;
    this.updateMediaBudget();
    return true;
  }

  /**
   * RETURN: restore prior assignment at the source's current live position.
   * Never restarts the experience / decoder from the beginning.
   */
  public returnToPreviousSource(playerId: string): boolean {
    const player = this.players.get(playerId);
    if (!player || player.previousSourceStack.length === 0) return false;

    const prior = player.previousSourceStack.pop()!;
    player.previousSource =
      player.previousSourceStack.length > 0
        ? player.previousSourceStack[player.previousSourceStack.length - 1]!.sourceId
        : null;

    if (!prior.sourceId) {
      player.sourceId = null;
      player.sessionId = null;
      player.viewId = null;
      player.viewpointId = null;
      player.layoutMode = "FULL";
      player.splitAssignments = undefined;
      player.presentationRevision++;
      this.rebalanceAudioAuthority();
      return true;
    }

    const source = this.sources.get(prior.sourceId);
    if (!source) return false;

    // Restore assignment — livePositionMs on source is unchanged (current live position).
    player.sourceId = prior.sourceId;
    player.sessionId = source.sessionId;
    player.viewId = prior.viewId;
    player.viewpointId = prior.viewpointId;
    player.layoutMode = prior.layoutMode;
    player.splitAssignments = prior.splitAssignments
      ? [...prior.splitAssignments]
      : undefined;
    player.presentationRevision++;

    this.rebalanceAudioAuthority();
    return true;
  }

  /** SEND TO PLAYER N — same as MOVE. */
  public sendToPlayer(fromPlayerId: string, toPlayerId: string): boolean {
    return this.move(fromPlayerId, toPlayerId);
  }

  /** SEND TO AVAILABLE PLAYER — first non-pinned idle or overwritable slot. */
  public sendToAvailablePlayer(fromPlayerId: string): string | null {
    const from = this.players.get(fromPlayerId);
    if (!from?.sourceId) return null;

    for (const player of this.players.values()) {
      if (player.playerId === fromPlayerId) continue;
      if (player.pinned) continue;
      if (!player.sourceId || player.sourceId === from.sourceId) {
        if (this.move(fromPlayerId, player.playerId)) return player.playerId;
      }
    }

    for (const player of this.players.values()) {
      if (player.playerId === fromPlayerId) continue;
      if (player.pinned) continue;
      if (this.move(fromPlayerId, player.playerId)) return player.playerId;
    }
    return null;
  }

  /**
   * Freedom assertion helper — no slot carries a dedicated experience role enum.
   */
  public assertNoDedicatedSlotBindings(): boolean {
    for (const player of this.players.values()) {
      if (!/^slot-\d+$/.test(player.playerId)) return false;
      const asAny = player as CanonicalPlayerAssignmentState & {
        dedicatedRole?: string;
        experienceBinding?: string;
      };
      if (asAny.dedicatedRole || asAny.experienceBinding) return false;
    }
    return true;
  }

  public rebalanceAudioAuthority(): void {
    let programAssigned = false;

    for (const player of this.players.values()) {
      if (!player.sourceId) {
        player.audioAuthority = "MUTED";
        continue;
      }

      const source = this.sources.get(player.sourceId);
      if (!source) {
        player.audioAuthority = "MUTED";
        continue;
      }

      if (source.audioAuthority === "VOICE") {
        player.audioAuthority = "VOICE";
      } else if (source.audioAuthority === "SHARE") {
        player.audioAuthority = "SHARE";
      } else if (source.audioAuthority === "PROGRAM") {
        if (!programAssigned) {
          player.audioAuthority = "PROGRAM";
          programAssigned = true;
        } else {
          player.audioAuthority = "MUTED";
        }
      } else {
        player.audioAuthority = "MUTED";
      }
    }
  }

  public updateMediaBudget(): void {
    for (const player of this.players.values()) {
      if (player.isFullscreen) {
        player.qualityTier = "FULL_RATE";
        player.visibilityState = "VISIBLE";
      } else if (this.activeFullscreenPlayerId) {
        player.qualityTier = "POSTER_THUMBNAIL";
        player.visibilityState = "OFFSCREEN";
      } else if (this.isMobileDevice) {
        const slotNum = parseInt(player.playerId.replace("slot-", ""), 10);
        player.qualityTier = slotNum <= 2 ? "FULL_RATE" : "POSTER_THUMBNAIL";
        player.visibilityState = slotNum <= 4 ? "VISIBLE" : "OFFSCREEN";
      } else {
        const slotNum = parseInt(player.playerId.replace("slot-", ""), 10);
        player.qualityTier = slotNum <= 6 ? "FULL_RATE" : "LOW_RATE";
        player.visibilityState = slotNum <= 8 ? "VISIBLE" : "NEARBY";
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DUAL-VIEW EXPERIENCE LAW & PRESENCE CONTINUITY LAW
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Dual-View Experience Law:
   * recommendedAssignment[0]=PROGRAM, [1]=USER_CONTEXT — convenience only.
   * Never reserves Player 1 as program or Player 2 as social in architecture.
   */
  public applyDefaultDualView(
    primarySourceId: string,
    secondarySourceId: string,
    playerIds: [string, string] = ["slot-1", "slot-2"]
  ): { success: boolean; recommendedAssignment: RecommendedAssignment[] } {
    const recommendedAssignment = PresentationTargetResolver.buildRecommendedDualAssignment(
      primarySourceId,
      secondarySourceId
    );
    const mapped = PresentationTargetResolver.mapRecommendationsToPlayers(
      recommendedAssignment,
      playerIds
    );
    let ok = true;
    for (const row of mapped) {
      const viewpoint =
        row.assignment.viewpointHint === "MAIN"
          ? "MAIN"
          : row.assignment.viewpointHint === "SEAT_AVATAR"
            ? "SEAT_AVATAR"
            : "FREE_LOOK";
      ok = this.take(row.playerId, row.assignment.sourceId, viewpoint) && ok;
    }
    const primaryPlayer = this.players.get(mapped[0]?.playerId ?? "slot-1");
    if (primaryPlayer?.sessionId) {
      this.primaryRoomSessionId = primaryPlayer.sessionId;
      this.primaryRoomPlayerId = primaryPlayer.playerId;
    }
    return { success: ok, recommendedAssignment };
  }

  public isBokehActive(): boolean {
    return this.isBokehActiveOnRoom;
  }

  /**
   * Presence Continuity Law:
   * Taking a call or focusing communication softens background room with bokeh,
   * ducks room PROGRAM audio, and promotes the chat player without restarting
   * the room, teleporting the avatar, or dropping room state.
   */
  public activateSecondaryCommunicationFocus(focusPlayerId: string): boolean {
    const focusPlayer = this.players.get(focusPlayerId);
    if (!focusPlayer) return false;

    this.isBokehActiveOnRoom = true;
    for (const p of this.players.values()) {
      if (p.playerId !== focusPlayerId && p.audioAuthority === "PROGRAM") {
        p.audioAuthority = "MUTED";
      }
    }
    focusPlayer.audioAuthority = "VOICE";
    return true;
  }

  public deactivateSecondaryCommunicationFocus(): boolean {
    this.isBokehActiveOnRoom = false;
    this.rebalanceAudioAuthority();
    return true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DYNAMIC COMMUNICATION PLAYER LAW & DETERMINISTIC TARGET RESOLVER
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Non-destructive alert: privacy fail-closed (user camera/mic OFF).
   */
  public handleIncomingCallAlert(
    callerId: string,
    callerName: string,
    callSessionId: string
  ): IncomingCallAlert {
    this.activeIncomingCall = {
      callSessionId,
      callerId,
      callerName,
      status: "RINGING",
      timestampMs: Date.now(),
    };
    return this.activeIncomingCall;
  }

  public getActiveIncomingCall(): IncomingCallAlert | null {
    return this.activeIncomingCall;
  }

  public declineIncomingCall(callSessionId: string): boolean {
    if (this.activeIncomingCall?.callSessionId === callSessionId) {
      this.activeIncomingCall.status = "DECLINED";
      this.activeIncomingCall = null;
      return true;
    }
    return false;
  }

  /**
   * ACCEPT → ONE canonical WebRTC communication session → PresentationTargetResolver
   * EMPTY → IDLE/AMBIENT → SECONDARY AVAILABLE → SAFE SPLIT; protect pinned/program.
   * Cam/mic publication only after ACCEPT (privacy fail-closed at alert stage).
   */
  public acceptIncomingCall(
    callSessionId: string,
    participants: string[],
    preferredPlayerId?: string
  ): {
    success: boolean;
    targetPlayerId: string | null;
    layoutMode: PlayerLayoutMode;
    resolveReason?: string;
  } {
    if (this.activeIncomingCall?.callSessionId === callSessionId) {
      this.activeIncomingCall.status = "ACCEPTED";
    }

    const sourceMap = new Map(
      Array.from(this.sources.values()).map((s) => [
        s.sourceId,
        {
          sourceId: s.sourceId,
          sourceType: s.sourceType,
          audioAuthority: s.audioAuthority,
        },
      ])
    );

    const resolved = PresentationTargetResolver.resolveCommunicationTarget({
      players: this.getAllPlayers().map((p) => ({
        playerId: p.playerId,
        sourceId: p.sourceId,
        pinned: p.pinned,
        audioAuthority: p.audioAuthority,
      })),
      sources: sourceMap,
      preferredPlayerId,
      participantCount: participants.length,
    });

    if (!resolved.success || !resolved.targetPlayerId) {
      return { success: false, targetPlayerId: null, layoutMode: "FULL", resolveReason: resolved.reason };
    }

    const targetPlayerId = resolved.targetPlayerId;
    const callSourceId = `src-call-${callSessionId}`;
    this.registerSource({
      sourceId: callSourceId,
      sessionId: callSessionId,
      sourceType: "PRIVATE_VIDEO_CHAT",
      title: `Video Call (${participants.join(", ")})`,
      decoderInstanceId: `dec-call-${callSessionId}`,
      audioAuthority: "VOICE",
    });

    // Track primary room before take for presence continuity
    const slot1 = this.players.get("slot-1");
    if (slot1?.sessionId && resolved.protectPrimary) {
      this.primaryRoomSessionId = slot1.sessionId;
      this.primaryRoomPlayerId = "slot-1";
    }

    this.take(targetPlayerId, callSourceId, "FRIEND_GROUP");

    this.activeCallSessionId = callSessionId;
    this.callPlayerId = targetPlayerId;
    this.callParticipants = [...participants];

    const layout = this.computeCallLayout(participants.length);
    const targetPlayer = this.players.get(targetPlayerId)!;
    targetPlayer.layoutMode = layout;

    if (this.primaryRoomPlayerId && this.primaryRoomPlayerId !== targetPlayerId) {
      this.activateSecondaryCommunicationFocus(targetPlayerId);
    }

    return {
      success: true,
      targetPlayerId,
      layoutMode: layout,
      resolveReason: resolved.reason,
    };
  }

  /**
   * Adds participant to active video call and automatically adapts layout on the same player.
   */
  public addCallParticipant(callSessionId: string, newParticipantId: string): boolean {
    if (this.activeCallSessionId !== callSessionId || !this.callPlayerId) return false;
    if (this.callParticipants.includes(newParticipantId)) return true;

    this.callParticipants.push(newParticipantId);
    const player = this.players.get(this.callPlayerId);
    if (!player) return false;

    player.layoutMode = this.computeCallLayout(this.callParticipants.length);
    player.presentationRevision++;
    return true;
  }

  /**
   * Reversibly collapses the layout when participants leave without blank panes or stale video.
   */
  public removeCallParticipant(callSessionId: string, participantId: string): boolean {
    if (this.activeCallSessionId !== callSessionId || !this.callPlayerId) return false;

    this.callParticipants = this.callParticipants.filter((p) => p !== participantId);
    const player = this.players.get(this.callPlayerId);
    if (!player) return false;

    player.layoutMode = this.computeCallLayout(this.callParticipants.length);
    player.presentationRevision++;
    return true;
  }

  public endVideoCall(callSessionId: string): boolean {
    if (this.activeCallSessionId !== callSessionId || !this.callPlayerId) return false;

    const player = this.players.get(this.callPlayerId);
    if (player) {
      player.sourceId = null;
      player.sessionId = null;
      player.viewId = null;
      player.viewpointId = null;
      player.layoutMode = "FULL";
      player.splitAssignments = undefined;
      player.presentationRevision++;
    }

    this.deactivateSecondaryCommunicationFocus();

    this.activeIncomingCall = null;
    this.activeCallSessionId = null;
    this.callPlayerId = null;
    this.callParticipants = [];

    this.rebalanceAudioAuthority();
    return true;
  }

  public getCallPlayerId(): string | null {
    return this.callPlayerId;
  }

  public getCallParticipants(): string[] {
    return [...this.callParticipants];
  }

  private computeCallLayout(count: number): PlayerLayoutMode {
    if (count <= 1) return "FULL";
    if (count === 2) return "SPLIT_HORIZONTAL";
    if (count === 3) return "SPLIT_HORIZONTAL"; // 3-way
    if (count === 4) return "QUAD"; // 2x2 grid
    return "QUAD"; // adaptive grid
  }
}
