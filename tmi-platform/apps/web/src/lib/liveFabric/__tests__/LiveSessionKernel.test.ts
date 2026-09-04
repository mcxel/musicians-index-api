/**
 * LiveSessionKernel unit tests — lifecycle, idempotency, generation isolation, reconcile
 */

import {
  LiveSessionKernel,
  LiveSessionTransitionError,
  VALID_TRANSITIONS,
} from "../LiveSessionKernel";
import { SessionClock } from "../SessionClock";
import { FABRIC_CONTRACT_VERSIONS } from "../contracts/ContractVersions";

describe("LiveSessionKernel", () => {
  function make() {
    return new LiveSessionKernel({
      roomId: "room-1",
      hostUserId: "host-1",
      experienceType: "REGULAR_GO_LIVE",
    });
  }

  test("starts IDLE with generation 1 revision 0", () => {
    const k = make();
    expect(k.getState()).toBe("IDLE");
    expect(k.getGeneration()).toBe(1);
    expect(k.getRevision()).toBe(0);
    expect(k.getContractVersion()).toBe(FABRIC_CONTRACT_VERSIONS.LIVE_SESSION_KERNEL);
  });

  test("legal happy path to LIVE", () => {
    const k = make();
    k.transitionTo("PREFLIGHT");
    k.transitionTo("READY");
    k.transitionTo("CONNECTING");
    k.transitionTo("PUBLISHING");
    k.transitionTo("LIVE");
    expect(k.isLive()).toBe(true);
    expect(k.getSnapshot().liveAtMs).not.toBeNull();
  });

  test("rejects illegal transitions", () => {
    const k = make();
    expect(() => k.transitionTo("LIVE")).toThrow(LiveSessionTransitionError);
    expect(() => k.transitionTo("PUBLISHING")).toThrow(LiveSessionTransitionError);
  });

  test("transition matrix covers all states", () => {
    const states = Object.keys(VALID_TRANSITIONS);
    expect(states).toHaveLength(10);
    expect(VALID_TRANSITIONS.LIVE.has("ENDING")).toBe(true);
    expect(VALID_TRANSITIONS.IDLE.has("LIVE")).toBe(false);
  });

  test("command idempotency — duplicate commandId skips", () => {
    const k = make();
    k.transitionTo("PREFLIGHT");
    const rev = k.getRevision();
    const cmd = {
      commandId: "cmd-1",
      sessionId: k.getSessionId(),
      generation: k.getGeneration(),
      expectedRevision: rev,
      issuedAtMs: Date.now(),
      type: "NOOP",
      payload: { n: 1 },
      issuerId: "host-1",
      issuerRole: "performer" as const,
    };
    const r1 = k.executeCommand(cmd, () => {
      /* bump happens inside executeCommand after apply */
    });
    expect(r1.success).toBe(true);
    expect(r1.idempotentSkip).toBeFalsy();

    const r2 = k.executeCommand(cmd, () => {
      throw new Error("should not run");
    });
    expect(r2.success).toBe(true);
    expect(r2.idempotentSkip).toBe(true);
    expect(r2.appliedRevision).toBe(r1.appliedRevision);
  });

  test("generation mismatch rejects command", () => {
    const k = make();
    const cmd = {
      commandId: "cmd-gen",
      sessionId: k.getSessionId(),
      generation: 99,
      expectedRevision: 0,
      issuedAtMs: Date.now(),
      type: "X",
      payload: {},
      issuerId: "host-1",
      issuerRole: "performer" as const,
    };
    const r = k.executeCommand(cmd, () => undefined);
    expect(r.success).toBe(false);
    expect(r.generationMismatch).toBe(true);
  });

  test("gen N events never mutate gen N+1", () => {
    const k = make();
    const sessionId = k.getSessionId();
    const cmd = {
      commandId: "cmd-old-gen",
      sessionId,
      generation: 1,
      expectedRevision: 0,
      issuedAtMs: Date.now(),
      type: "X",
      payload: {},
      issuerId: "host-1",
      issuerRole: "performer" as const,
    };
    k.bumpGeneration("epoch");
    expect(k.getGeneration()).toBe(2);
    const r = k.executeCommand(cmd, () => {
      throw new Error("must not apply");
    });
    expect(r.success).toBe(false);
    expect(r.generationMismatch).toBe(true);
  });

  test("reconcile rejects stale generation", () => {
    const k = make();
    const snap = k.getSnapshot();
    k.bumpGeneration("advance");
    const result = k.reconcile(snap);
    expect(result.accepted).toBe(false);
    expect(result.reason).toBe("STALE_GENERATION");
  });

  test("SessionClock is monotonic and pausable", () => {
    const clock = new SessionClock();
    const a = clock.now();
    clock.advanceForTest(500);
    expect(clock.now()).toBeGreaterThanOrEqual(a + 500);
    clock.pause();
    const paused = clock.now();
    clock.advanceForTest(100);
    expect(clock.now()).toBeGreaterThanOrEqual(paused + 100);
  });

  test("duplicate END is safe via ENDING→ENDED then ignore", () => {
    const k = make();
    k.transitionTo("PREFLIGHT");
    k.transitionTo("READY");
    k.transitionTo("CONNECTING");
    k.transitionTo("PUBLISHING");
    k.transitionTo("LIVE");
    k.transitionTo("ENDING");
    k.transitionTo("ENDED");
    expect(() => k.transitionTo("ENDED")).not.toThrow();
    expect(k.getState()).toBe("ENDED");
  });

  test("host disconnect END_SESSION moves toward ENDING", () => {
    const k = new LiveSessionKernel({
      roomId: "r",
      hostUserId: "h",
      hostSuccessionPolicy: "END_SESSION",
    });
    k.transitionTo("PREFLIGHT");
    k.transitionTo("READY");
    k.transitionTo("CONNECTING");
    k.transitionTo("LIVE");
    k.disconnectParticipant("h", "LEFT");
    expect(k.getState()).toBe("ENDING");
  });
});
