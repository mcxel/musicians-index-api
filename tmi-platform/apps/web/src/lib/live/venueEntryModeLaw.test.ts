import {
  hostGoLiveIsAlwaysInstant,
  resolveJoinStageInitialState,
  resolveVenueEntryPolicy,
  operatorModeToOwnership,
} from "./venueEntryModeLaw";
import { resolveParticipationEntry } from "./ParticipationStateMachine";
import { resolveBackstagePublish } from "./backstagePublishGate";
import {
  claimStageAdmissionOnce,
  getEventHealth,
  pauseAutomationForHumanTakeover,
  recordEventHeartbeat,
  recommendRecovery,
  resetEventResilienceForTests,
} from "./eventResilienceLaw";
import {
  GPS_VENUES_HREF,
  LOBBY_WALL_BUTTON_LABEL,
  livingWallAllowsQualityOff,
} from "@/lib/lobby/livingLobbyWallLaw";

describe("venue entry + living lobby wall + resilience", () => {
  beforeEach(() => {
    resetEventResilienceForTests();
  });

  it("locks GPS venues to /rooms and Lobby Wall label", () => {
    expect(GPS_VENUES_HREF).toBe("/rooms");
    expect(LOBBY_WALL_BUTTON_LABEL).toBe("LOBBY WALL");
  });

  it("never allows quality off for visible live tiles", () => {
    expect(livingWallAllowsQualityOff({ visible: true, isLive: true })).toBe(false);
    expect(livingWallAllowsQualityOff({ visible: false, isLive: true })).toBe(true);
  });

  it("keeps host Go Live instant and maps operator modes", () => {
    expect(hostGoLiveIsAlwaysInstant()).toBe(true);
    expect(operatorModeToOwnership("TMI_AUTOMATED")).toBe("bot_operated");
    expect(operatorModeToOwnership("HUMAN_HOSTED")).toBe("human_owned");
  });

  it("WATCH puts performers in audience, not backstage", () => {
    const r = resolveParticipationEntry({
      role: "PERFORMER",
      roomKind: "live",
      joinIntent: "WATCH",
    });
    expect(r.entryMode).toBe("SPECTATOR");
    expect(r.initialState).toBe("SPECTATOR");
    expect(r.claimFanSeat).toBe(false);
  });

  it("JOIN_STAGE respects HOST_APPROVAL vs INSTANT_STAGE", () => {
    const wait = resolveParticipationEntry({
      role: "PERFORMER",
      roomKind: "live",
      joinIntent: "JOIN_STAGE",
      venueEntryMode: "HOST_APPROVAL",
    });
    expect(wait.initialState).toBe("REQUESTED");

    const instant = resolveParticipationEntry({
      role: "PERFORMER",
      roomKind: "live",
      joinIntent: "JOIN_STAGE",
      venueEntryMode: "INSTANT_STAGE",
      mediaReady: true,
    });
    expect(instant.initialState).toBe("ON_STAGE");

    const queue = resolveVenueEntryPolicy({ roomKind: "battle" });
    expect(queue.venueEntryMode).toBe("QUEUE_SCHEDULED");
    expect(resolveJoinStageInitialState({ venueEntryMode: "QUEUE_SCHEDULED" })).toBe("QUEUED");
  });

  it("blocks backstage publish without consent / host admission", () => {
    const denied = resolveBackstagePublish({
      roomId: "r1",
      participantId: "p1",
      participationState: "READY",
      guestAcceptedInvite: true,
      guestConsentToBroadcast: false,
      mediaReady: true,
      hostAuthorizedAdmission: true,
      admissionAuthority: "HUMAN_HOST",
    });
    expect(denied.mayPublishToProgram).toBe(false);

    const ok = resolveBackstagePublish({
      roomId: "r1",
      participantId: "p1",
      participationState: "READY",
      guestAcceptedInvite: true,
      guestConsentToBroadcast: true,
      mediaReady: true,
      hostAuthorizedAdmission: true,
      admissionAuthority: "HUMAN_HOST",
    });
    expect(ok.mayPublishToProgram).toBe(true);
  });

  it("supports heartbeat recovery and duplicate admission lock", () => {
    recordEventHeartbeat("room-a", Date.now());
    expect(getEventHealth("room-a").status).toBe("healthy");
    pauseAutomationForHumanTakeover("room-a");
    const paused = getEventHealth("room-a");
    expect(paused.status).toBe("paused");
    expect(recommendRecovery(paused)).toBe("HUMAN_TAKEOVER");

    expect(claimStageAdmissionOnce("room-a", "guest-1").ok).toBe(true);
    expect(claimStageAdmissionOnce("room-a", "guest-1").ok).toBe(false);
  });
});
