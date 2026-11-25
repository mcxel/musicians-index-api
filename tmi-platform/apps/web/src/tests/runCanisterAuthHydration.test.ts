/**
 * @jest-environment node
 *
 * Canister / avatar session authority.
 *
 * Replaces the previous plain-function version, which asserted the VULNERABLE
 * behavior: an unsigned tmi_session_id cookie plus a self-chosen tmi_role=FAN
 * cookie authenticated as that user. Identity must come only from the verified
 * session (getTmiAuth) and the role from the database.
 */

const mockGetTmiAuth = jest.fn();
jest.mock("@/lib/auth/getTmiAuth", () => ({ getTmiAuth: () => mockGetTmiAuth() }));

import { requireFanAvatarSession } from "@/lib/avatar/requireFanAvatarSession";

function reqWithCookies(cookies: Record<string, string>) {
  return { cookies: { get: (n: string) => (n in cookies ? { value: cookies[n] } : undefined) } } as never;
}

beforeEach(() => mockGetTmiAuth.mockReset());

it("forged identity cookies with no verified session → 401", async () => {
  mockGetTmiAuth.mockResolvedValue(null);
  const r = await requireFanAvatarSession(
    reqWithCookies({ tmi_session_id: "user-todd-james-1", tmi_role: "FAN", tmi_user_email: "victim@example.test", tmi_session: "x" }),
  );
  expect("error" in r && r.error.status).toBe(401);
});

it("verified FAN session → that user", async () => {
  mockGetTmiAuth.mockResolvedValue({ user: { id: "fan-1", name: "Fan One", email: "", role: "FAN", tier: "FREE" } });
  const r = await requireFanAvatarSession(reqWithCookies({}));
  expect(r).toEqual({ user: { id: "fan-1", displayName: "Fan One", role: "FAN" } });
});

it("verified PERFORMER is refused (Rule 26) even with a forged tmi_role=FAN cookie", async () => {
  mockGetTmiAuth.mockResolvedValue({ user: { id: "perf-1", name: "P", email: "", role: "PERFORMER", tier: "FREE" } });
  const r = await requireFanAvatarSession(reqWithCookies({ tmi_role: "FAN" }));
  expect("error" in r && r.error.status).toBe(403);
});

it("a forged tmi_session_id never overrides the verified user id", async () => {
  mockGetTmiAuth.mockResolvedValue({ user: { id: "fan-real", name: "R", email: "", role: "FAN", tier: "FREE" } });
  const r = await requireFanAvatarSession(reqWithCookies({ tmi_session_id: "someone-else" }));
  expect("user" in r && r.user.id).toBe("fan-real");
});
