/**
 * Level-1 certification: go-live admit gate + PRODUCER specialty mapping.
 */
import {
  admitGoLive,
  mayMintServerKitRoom,
  normalizeGoLiveAdmitRole,
} from "../lib/live/goLiveAdmitGate";
import { normalizeRole } from "../lib/live/LiveDestinationRouter";
import { classifyShellIdentity } from "../lib/auth/sessionRole";

describe("Go Live admit gate + PRODUCER specialty", () => {
  it("normalizes PRODUCER for admit / destination / shell", () => {
    expect(normalizeGoLiveAdmitRole("PRODUCER")).toBe("PRODUCER");
    expect(normalizeRole("PRODUCER")).toBe("PERFORMER");
    expect(classifyShellIdentity("PRODUCER")).toBe("PERFORMER");
  });

  it("denies unauthenticated go-live", () => {
    const d = admitGoLive({ authenticated: false, role: "PERFORMER" });
    expect(d.allowed).toBe(false);
    if (!d.allowed) expect(d.status).toBe(401);
  });

  it("admits performer + producer public stage", () => {
    const performer = admitGoLive({
      authenticated: true,
      role: "PERFORMER",
      privacy: "public",
      listed: true,
    });
    expect(performer.allowed).toBe(true);
    if (performer.allowed) expect(performer.mode).toBe("public_stage");

    const producer = admitGoLive({
      authenticated: true,
      role: "PRODUCER",
      privacy: "public",
      listed: true,
    });
    expect(producer.allowed).toBe(true);
    if (producer.allowed) expect(producer.mode).toBe("public_stage");
  });

  it("routes fans to fan_lobby and blocks sponsor public stage", () => {
    const fan = admitGoLive({
      authenticated: true,
      role: "FAN",
      privacy: "public",
      listed: true,
    });
    expect(fan.allowed).toBe(true);
    if (fan.allowed) expect(fan.mode).toBe("fan_lobby");

    const sponsor = admitGoLive({
      authenticated: true,
      role: "SPONSOR",
      privacy: "public",
      listed: true,
    });
    expect(sponsor.allowed).toBe(false);
    if (!sponsor.allowed) expect(sponsor.status).toBe(403);
  });

  it("allows Daily/server-kit mint for creators only", () => {
    expect(mayMintServerKitRoom("PERFORMER")).toBe(true);
    expect(mayMintServerKitRoom("PRODUCER")).toBe(true);
    expect(mayMintServerKitRoom("FAN")).toBe(false);
  });
});
