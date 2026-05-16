// IntercomModeEngine.ts
// Manages performer intercom mode — who can open voice and under what conditions.

import type { VoiceRoomState } from "./RoomVoiceEngine";

export type IntercomMode = "OFF" | "PERFORMER_ONLY" | "AUDIENCE_REQUEST" | "OPEN";

export interface TalkbackRequest {
  id: string;
  audienceId: string;
  audienceDisplayName: string;
  requestedAt: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "FOCUSED" | "MUTED";
}

export interface IntercomSession {
  performerId: string;
  mode: IntercomMode;
  intercomEnabled: boolean;
  allowInstantAudienceTalkback: boolean;
  pendingRequests: TalkbackRequest[];
  acceptedIds: Set<string>;
  mutedIds: Set<string>;
  focusedId: string | null;
}

function buildSession(performerId: string, allowInstant: boolean): IntercomSession {
  return {
    performerId,
    mode: "OFF",
    intercomEnabled: false,
    allowInstantAudienceTalkback: allowInstant,
    pendingRequests: [],
    acceptedIds: new Set(),
    mutedIds: new Set(),
    focusedId: null,
  };
}

export class IntercomModeEngine {
  private sessions: Map<string, IntercomSession> = new Map();

  getOrCreate(performerId: string, allowInstantAudienceTalkback = false): IntercomSession {
    if (!this.sessions.has(performerId)) {
      this.sessions.set(performerId, buildSession(performerId, allowInstantAudienceTalkback));
    }
    return this.sessions.get(performerId)!;
  }

  enableIntercom(performerId: string, roomState: VoiceRoomState): boolean {
    const session = this.getOrCreate(performerId);
    // Performers can always open intercom; mode determines who can respond
    session.intercomEnabled = true;
    session.mode = this.resolveModeForState(session, roomState);
    return true;
  }

  disableIntercom(performerId: string): void {
    const session = this.sessions.get(performerId);
    if (!session) return;
    session.intercomEnabled = false;
    session.mode = "OFF";
    session.pendingRequests = [];
    session.acceptedIds.clear();
    session.focusedId = null;
  }

  private resolveModeForState(
    session: IntercomSession,
    roomState: VoiceRoomState
  ): IntercomMode {
    if (!session.intercomEnabled) return "OFF";
    switch (roomState) {
      case "FREE_ROAM":
      case "POST_SHOW":
        return session.allowInstantAudienceTalkback ? "OPEN" : "AUDIENCE_REQUEST";
      case "PRE_SHOW":
        return session.allowInstantAudienceTalkback ? "AUDIENCE_REQUEST" : "PERFORMER_ONLY";
      case "LIVE_SHOW":
        return "PERFORMER_ONLY"; // audience must request; performer explicitly accepts
    }
  }

  requestTalkback(
    performerId: string,
    audienceId: string,
    audienceDisplayName: string
  ): TalkbackRequest | null {
    const session = this.sessions.get(performerId);
    if (!session || !session.intercomEnabled) return null;
    if (session.mode === "OFF" || session.mode === "PERFORMER_ONLY") return null;

    // Deduplicate
    const existing = session.pendingRequests.find((r) => r.audienceId === audienceId);
    if (existing) return existing;

    const request: TalkbackRequest = {
      id: `tbk-${Date.now()}-${audienceId}`,
      audienceId,
      audienceDisplayName,
      requestedAt: Date.now(),
      status: "PENDING",
    };

    // If open mode + instant talkback allowed → auto-accept
    if (session.mode === "OPEN" && session.allowInstantAudienceTalkback) {
      request.status = "ACCEPTED";
      session.acceptedIds.add(audienceId);
    }

    session.pendingRequests.push(request);
    return request;
  }

  acceptTalkback(performerId: string, audienceId: string): boolean {
    const session = this.sessions.get(performerId);
    if (!session) return false;
    const req = session.pendingRequests.find((r) => r.audienceId === audienceId);
    if (!req) return false;
    req.status = "ACCEPTED";
    session.acceptedIds.add(audienceId);
    session.mutedIds.delete(audienceId);
    return true;
  }

  rejectTalkback(performerId: string, audienceId: string): void {
    const session = this.sessions.get(performerId);
    if (!session) return;
    const req = session.pendingRequests.find((r) => r.audienceId === audienceId);
    if (req) req.status = "REJECTED";
    session.acceptedIds.delete(audienceId);
  }

  muteTalkback(performerId: string, audienceId: string): void {
    const session = this.sessions.get(performerId);
    if (!session) return;
    const req = session.pendingRequests.find((r) => r.audienceId === audienceId);
    if (req) req.status = "MUTED";
    session.mutedIds.add(audienceId);
    session.acceptedIds.delete(audienceId);
    if (session.focusedId === audienceId) session.focusedId = null;
  }

  setFocused(performerId: string, audienceId: string): void {
    const session = this.sessions.get(performerId);
    if (!session) return;
    const req = session.pendingRequests.find((r) => r.audienceId === audienceId);
    if (req) req.status = "FOCUSED";
    session.focusedId = audienceId;
  }

  clearFocus(performerId: string): void {
    const session = this.sessions.get(performerId);
    if (!session) return;
    if (session.focusedId) {
      const req = session.pendingRequests.find((r) => r.audienceId === session.focusedId);
      if (req && req.status === "FOCUSED") req.status = "ACCEPTED";
    }
    session.focusedId = null;
  }

  getSession(performerId: string): IntercomSession | undefined {
    return this.sessions.get(performerId);
  }

  getPendingRequests(performerId: string): TalkbackRequest[] {
    return this.sessions.get(performerId)?.pendingRequests ?? [];
  }
}
