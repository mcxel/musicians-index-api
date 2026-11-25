/**
 * GreenRoomEngine — Performer-Only Private Green Room, Stage-Door Video Lineup,
 * PASS-to-Tail Queue Authority, Jump Out / Jump Back In, Whisper Isolation,
 * and Performer Spectator Public Viewing Gate.
 *
 * CORE LAWS (OWNER CORRECTION — PERFORMER-ONLY GREEN ROOM):
 *   1. Private Green Room video lineup, stage-door queue, waiting-camera panels, PASS controls,
 *      Jump Out / Jump Back In, and backstage Whisper are strictly PERFORMER-ONLY features.
 *   2. Fans (role === 'fan') must NEVER see, subscribe to, or receive private Green Room video feeds,
 *      queue panels, or backstage Whisper sources — even via direct API or reference slot requests.
 *   3. Simply having a Performer account does NOT grant access to every private Green Room:
 *      only authenticated performers with valid room backstage/queue membership (or host/admin authority)
 *      may view that room's private Green Room cameras, and only for backstage participants who consented.
 *   4. PERFORMERS CAN WATCH WITHOUT FAN ACCOUNTS:
 *      Any authenticated Performer account can watch public live performances, Battles, Cyphers,
 *      concerts, and public audience views directly from their Performer account (SPECTATOR state)
 *      without switching to a Fan account or losing their queue position.
 *   5. PUBLIC CYPHER PANELS ≠ PRIVATE GREEN ROOM VIDEO PANELS:
 *      Being queued in the Green Room never makes a performer's camera visible to the public audience.
 */

export type GreenRoomStatus =
  | "idle"
  | "warmup"
  | "briefing"
  | "ready"
  | "spectating"
  | "jumped-out"
  | "called-to-stage";

export type PerformerSpectatorState =
  | "WATCHING_PUBLIC_STAGE"
  | "QUEUED_WATCHING_FROM_GREEN_ROOM"
  | "JUMPED_OUT_BROWSING"
  | "ON_STAGE_LIVE";

export type GreenRoomSlot = {
  performerId: string;
  performerName: string;
  status: GreenRoomStatus;
  queuePosition: number;
  isNextUpAtStageDoor: boolean;
  enteredAt: number;
  calledAt: number | null;
  notes: string;
  techCheckPassed: boolean;
  /** Backstage camera is shared ONLY with authorized Green Room peers when true. Never public. */
  backstageVideoConsent: boolean;
  /** Strictly false while in Green Room — only on-stage promotion publishes to public audience. */
  publiclyVisibleToFans: false;
  spectatorState: PerformerSpectatorState;
  jumpedOutAt: number | null;
  passCount: number;
  whisperAuthorizedPeers: string[];
};

export type GreenRoom = {
  venueSlug: string;
  open: boolean;
  slots: GreenRoomSlot[];
  capacity: number;
  hostCheckinRequired: boolean;
  hostUserId?: string;
};

export interface AuthorizedGreenRoomViewResult {
  ok: boolean;
  reason: string;
  viewerRole: "fan" | "performer" | "artist" | "host" | "admin";
  canWatchPublicStage: true;
  canWatchPublicAudience: true;
  requiresFanAccountSwitch: false;
  canAccessPrivateGreenRoom: boolean;
  stageDoorNextUp: GreenRoomSlot | null;
  privateLineup: GreenRoomSlot[];
  consentedBackstageCameraFeeds: Array<{
    performerId: string;
    performerName: string;
    queuePosition: number;
    isNextUpAtStageDoor: boolean;
    streamRefId: string;
    publiclyVisibleToFans: false;
  }>;
}

const greenRoomRegistry = new Map<string, GreenRoom>();
const performerSpectatorRegistry = new Map<string, PerformerSpectatorState>();

function recomputeQueuePositions(room: GreenRoom): void {
  room.slots.forEach((slot, idx) => {
    slot.queuePosition = idx + 1;
    slot.isNextUpAtStageDoor = idx === 0;
    slot.publiclyVisibleToFans = false;
  });
}

export function getGreenRoom(venueSlug: string): GreenRoom {
  if (!greenRoomRegistry.has(venueSlug)) {
    greenRoomRegistry.set(venueSlug, {
      venueSlug,
      open: false,
      slots: [],
      capacity: 10,
      hostCheckinRequired: true,
    });
  }
  return greenRoomRegistry.get(venueSlug)!;
}

export function openGreenRoom(venueSlug: string, hostUserId?: string): void {
  const room = getGreenRoom(venueSlug);
  room.open = true;
  if (hostUserId) room.hostUserId = hostUserId;
}

export function closeGreenRoom(venueSlug: string): void {
  getGreenRoom(venueSlug).open = false;
}

export function enterGreenRoom(
  venueSlug: string,
  performerId: string,
  performerName: string,
  options?: { role?: string; backstageVideoConsent?: boolean },
): GreenRoomSlot | null {
  if (options?.role && options.role.toLowerCase() === "fan") {
    // Fans can NEVER enter the private performer Green Room
    return null;
  }
  const room = getGreenRoom(venueSlug);
  if (!room.open || room.slots.length >= room.capacity) return null;
  const existing = room.slots.find((s) => s.performerId === performerId);
  if (existing) {
    if (options?.backstageVideoConsent !== undefined) {
      existing.backstageVideoConsent = options.backstageVideoConsent;
    }
    recomputeQueuePositions(room);
    return existing;
  }
  const slot: GreenRoomSlot = {
    performerId,
    performerName,
    status: "warmup",
    queuePosition: room.slots.length + 1,
    isNextUpAtStageDoor: room.slots.length === 0,
    enteredAt: Date.now(),
    calledAt: null,
    notes: "",
    techCheckPassed: false,
    backstageVideoConsent: options?.backstageVideoConsent ?? true,
    publiclyVisibleToFans: false,
    spectatorState: "QUEUED_WATCHING_FROM_GREEN_ROOM",
    jumpedOutAt: null,
    passCount: 0,
    whisperAuthorizedPeers: [],
  };
  room.slots.push(slot);
  recomputeQueuePositions(room);
  performerSpectatorRegistry.set(`${venueSlug}:${performerId}`, "QUEUED_WATCHING_FROM_GREEN_ROOM");
  return slot;
}

export function markTechCheckPassed(venueSlug: string, performerId: string): void {
  const room = getGreenRoom(venueSlug);
  const slot = room.slots.find((s) => s.performerId === performerId);
  if (slot) {
    slot.techCheckPassed = true;
    slot.status = "ready";
  }
}

export function setGreenRoomPerformerReady(
  venueSlug: string,
  performerId: string,
  ready: boolean,
  backstageVideoConsent = true,
): GreenRoomSlot | null {
  const room = getGreenRoom(venueSlug);
  const slot = room.slots.find((s) => s.performerId === performerId);
  if (!slot) return null;
  slot.techCheckPassed = ready;
  slot.status = ready ? "ready" : "warmup";
  slot.backstageVideoConsent = backstageVideoConsent;
  return slot;
}

/**
 * PASS — Presentation apply ONLY after durable challenger-queue confirms the new order.
 * Never invent FIFO positions client-side. Pass `serverConfirmedLineup` from Claude's API.
 */
export function passGreenRoomTurnToTail(
  venueSlug: string,
  performerId: string,
  serverConfirmedLineup?: ReadonlyArray<{ performerId: string; position: number }>,
): { ok: boolean; reason: string; slot?: GreenRoomSlot; lineup?: GreenRoomSlot[] } {
  if (!serverConfirmedLineup || serverConfirmedLineup.length === 0) {
    return {
      ok: false,
      reason: "needs_durable_queue_confirm",
    };
  }
  const room = getGreenRoom(venueSlug);
  const byId = new Map(room.slots.map((s) => [s.performerId, s]));
  const nextSlots: GreenRoomSlot[] = [];
  for (const row of [...serverConfirmedLineup].sort((a, b) => a.position - b.position)) {
    const existing = byId.get(row.performerId);
    if (!existing) continue;
    if (row.performerId === performerId) existing.passCount += 1;
    existing.queuePosition = row.position + 1;
    existing.isNextUpAtStageDoor = row.position === 0;
    nextSlots.push(existing);
  }
  if (nextSlots.length === 0) {
    return { ok: false, reason: "performer_not_in_green_room_queue" };
  }
  room.slots = nextSlots;
  recomputeQueuePositions(room);
  const slot = room.slots.find((s) => s.performerId === performerId);
  return {
    ok: true,
    reason: "passed_to_queue_tail_server_confirmed",
    slot: slot ? { ...slot } : undefined,
    lineup: room.slots.map((s) => ({ ...s })),
  };
}

/**
 * Jump Out — Performer temporarily browses TMI or spectates full-screen while retaining
 * their valid Green Room queue position.
 */
export function jumpOutGreenRoomToBrowse(
  venueSlug: string,
  performerId: string,
): { ok: boolean; reason: string; slot?: GreenRoomSlot } {
  const room = getGreenRoom(venueSlug);
  const slot = room.slots.find((s) => s.performerId === performerId);
  if (!slot) {
    return { ok: false, reason: "performer_not_in_green_room_queue" };
  }
  slot.status = "jumped-out";
  slot.spectatorState = "JUMPED_OUT_BROWSING";
  slot.jumpedOutAt = Date.now();
  performerSpectatorRegistry.set(`${venueSlug}:${performerId}`, "JUMPED_OUT_BROWSING");
  return { ok: true, reason: "jumped_out_membership_retained", slot: { ...slot } };
}

/**
 * Jump Back In — Performer returns from browsing/spectating to their retained queue position.
 */
export function jumpBackInGreenRoom(
  venueSlug: string,
  performerId: string,
): { ok: boolean; reason: string; slot?: GreenRoomSlot } {
  const room = getGreenRoom(venueSlug);
  const slot = room.slots.find((s) => s.performerId === performerId);
  if (!slot) {
    return { ok: false, reason: "performer_not_in_green_room_queue" };
  }
  slot.status = slot.techCheckPassed ? "ready" : "warmup";
  slot.spectatorState = "QUEUED_WATCHING_FROM_GREEN_ROOM";
  slot.jumpedOutAt = null;
  performerSpectatorRegistry.set(`${venueSlug}:${performerId}`, "QUEUED_WATCHING_FROM_GREEN_ROOM");
  return { ok: true, reason: "jumped_back_in_queue_position_preserved", slot: { ...slot } };
}

/**
 * Leave Queue Explicitly — Performer forfeits their position and leaves the Green Room,
 * but may continue watching the public show as a Performer Spectator without switching to a Fan account.
 */
export function leaveGreenRoomQueueExplicitly(
  venueSlug: string,
  performerId: string,
): { ok: boolean; reason: string; spectatorState: PerformerSpectatorState } {
  exitGreenRoom(venueSlug, performerId);
  performerSpectatorRegistry.set(`${venueSlug}:${performerId}`, "WATCHING_PUBLIC_STAGE");
  return {
    ok: true,
    reason: "left_queue_forfeited_position_spectating_public_show",
    spectatorState: "WATCHING_PUBLIC_STAGE",
  };
}

/**
 * Performer Spectator Mode — Any authenticated performer can watch any public performance
 * directly from their Performer account without switching to a Fan account.
 */
export function enterPerformerSpectatorMode(
  venueSlug: string,
  performerId: string,
  role: "performer" | "artist" | "host" | "admin" | "fan" = "performer",
): {
  ok: boolean;
  reason: string;
  requiresFanAccountSwitch: false;
  spectatorState: PerformerSpectatorState;
  canWatchPublicStage: true;
  canWatchPublicAudience: true;
  grantsStagePublishing: false;
  grantsBackstageWhisper: false;
} {
  const room = getGreenRoom(venueSlug);
  const inQueue = room.slots.find((s) => s.performerId === performerId);
  const state: PerformerSpectatorState = inQueue
    ? "QUEUED_WATCHING_FROM_GREEN_ROOM"
    : "WATCHING_PUBLIC_STAGE";
  if (inQueue) {
    inQueue.status = "spectating";
    inQueue.spectatorState = "QUEUED_WATCHING_FROM_GREEN_ROOM";
  }
  performerSpectatorRegistry.set(`${venueSlug}:${performerId}`, state);
  void role;
  return {
    ok: true,
    reason: "performer_spectator_active_without_fan_switch",
    requiresFanAccountSwitch: false,
    spectatorState: state,
    canWatchPublicStage: true,
    canWatchPublicAudience: true,
    grantsStagePublishing: false,
    grantsBackstageWhisper: false,
  };
}

export function authorizeGreenRoomWhisper(
  venueSlug: string,
  performerA: string,
  performerB: string,
): { ok: boolean; reason: string; isolatedFromPublicBroadcast: true } {
  const room = getGreenRoom(venueSlug);
  const slotA = room.slots.find((s) => s.performerId === performerA);
  const slotB = room.slots.find((s) => s.performerId === performerB);
  if (!slotA || !slotB) {
    return {
      ok: false,
      reason: "whisper_requires_both_performers_in_authorized_green_room",
      isolatedFromPublicBroadcast: true,
    };
  }
  if (!slotA.whisperAuthorizedPeers.includes(performerB)) {
    slotA.whisperAuthorizedPeers.push(performerB);
  }
  if (!slotB.whisperAuthorizedPeers.includes(performerA)) {
    slotB.whisperAuthorizedPeers.push(performerA);
  }
  return {
    ok: true,
    reason: "private_backstage_whisper_authorized",
    isolatedFromPublicBroadcast: true,
  };
}

/**
 * Server-authoritative Green Room access gate.
 * - Fans NEVER receive private Green Room lineup or backstage cameras.
 * - Performers not in this room's Green Room can watch the public stage & audience as Performers
 *   (requiresFanAccountSwitch: false) but do NOT receive private Green Room cameras.
 * - Authorized Green Room performers (or host/admin) receive the private lineup + consented backstage feeds.
 */
export function getAuthorizedGreenRoomView(params: {
  venueSlug: string;
  viewerUserId: string;
  viewerRole: "fan" | "performer" | "artist" | "host" | "admin";
}): AuthorizedGreenRoomViewResult {
  const room = getGreenRoom(params.venueSlug);
  recomputeQueuePositions(room);

  if (params.viewerRole === "fan") {
    return {
      ok: false,
      reason: "fan_forbidden_from_private_green_room",
      viewerRole: "fan",
      canWatchPublicStage: true,
      canWatchPublicAudience: true,
      requiresFanAccountSwitch: false,
      canAccessPrivateGreenRoom: false,
      stageDoorNextUp: null,
      privateLineup: [],
      consentedBackstageCameraFeeds: [],
    };
  }

  const isMember = room.slots.some((s) => s.performerId === params.viewerUserId);
  const isHostOrAdmin =
    params.viewerRole === "host" ||
    params.viewerRole === "admin" ||
    (room.hostUserId && room.hostUserId === params.viewerUserId);

  if (!isMember && !isHostOrAdmin) {
    return {
      ok: false,
      reason: "performer_spectator_public_only_not_in_room_green_room",
      viewerRole: params.viewerRole,
      canWatchPublicStage: true,
      canWatchPublicAudience: true,
      requiresFanAccountSwitch: false,
      canAccessPrivateGreenRoom: false,
      stageDoorNextUp: null,
      privateLineup: [],
      consentedBackstageCameraFeeds: [],
    };
  }

  const lineup = room.slots.map((s) => ({ ...s }));
  const consentedFeeds = lineup
    .filter((s) => s.backstageVideoConsent && s.status !== "jumped-out")
    .map((s) => ({
      performerId: s.performerId,
      performerName: s.performerName,
      queuePosition: s.queuePosition,
      isNextUpAtStageDoor: s.isNextUpAtStageDoor,
      streamRefId: `green-room-cam:${params.venueSlug}:${s.performerId}`,
      publiclyVisibleToFans: false as const,
    }));

  return {
    ok: true,
    reason: "authorized_performer_green_room_access_granted",
    viewerRole: params.viewerRole,
    canWatchPublicStage: true,
    canWatchPublicAudience: true,
    requiresFanAccountSwitch: false,
    canAccessPrivateGreenRoom: true,
    stageDoorNextUp: lineup[0] ?? null,
    privateLineup: lineup,
    consentedBackstageCameraFeeds: consentedFeeds,
  };
}

export function callPerformerToStage(venueSlug: string, performerId: string): GreenRoomSlot | null {
  const room = getGreenRoom(venueSlug);
  const slot = room.slots.find((s) => s.performerId === performerId);
  if (!slot) return null;
  slot.status = "called-to-stage";
  slot.spectatorState = "ON_STAGE_LIVE";
  slot.calledAt = Date.now();
  return slot;
}

export function exitGreenRoom(venueSlug: string, performerId: string): void {
  const room = getGreenRoom(venueSlug);
  room.slots = room.slots.filter((s) => s.performerId !== performerId);
  recomputeQueuePositions(room);
}

export function addPerformerNote(venueSlug: string, performerId: string, note: string): void {
  const room = getGreenRoom(venueSlug);
  const slot = room.slots.find((s) => s.performerId === performerId);
  if (slot) slot.notes = note;
}

export function resetGreenRoomsForTests(): void {
  greenRoomRegistry.clear();
  performerSpectatorRegistry.clear();
}
