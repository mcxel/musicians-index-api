/**
 * Security Stability Certification — Slice A + Slice B.
 * Admit only when code enforces (no fake PASS).
 *
 * Slice A: workspace identity from session membership only — never ?workspace=
 * Slice B: partner workspace switcher off for normal admin; governance override audited
 */

import {
  securityStabilitySliceA_noQueryWorkspaceAuth,
  securityStabilitySliceB_partnerSwitcherOffByDefault,
  resolveWorkspaceFromSession,
  partnerWorkspaceSwitcherAllowed,
} from "../lib/auth/workspaceSecurity";

type SliceResult = { id: string; pass: boolean; evidence: string };

function run(): { admit: boolean; slices: SliceResult[] } {
  const sliceA: SliceResult = {
    id: "SecurityStability.SliceA.SessionOnlyWorkspace",
    pass: securityStabilitySliceA_noQueryWorkspaceAuth(),
    evidence:
      "resolveWorkspaceFromSession ignores workspaceQuery; unauthorized → 403; member email maps role",
  };

  const denied = resolveWorkspaceFromSession({ email: "outsider@example.com" });
  const sliceA403: SliceResult = {
    id: "SecurityStability.SliceA.Unauthorized403",
    pass: denied.ok === false && denied.status === 403,
    evidence: denied.ok === false ? denied.reason : "unexpected ok",
  };

  const sliceB: SliceResult = {
    id: "SecurityStability.SliceB.PartnerSwitcherOffPlusGovernanceAudit",
    pass: securityStabilitySliceB_partnerSwitcherOffByDefault(),
    evidence:
      "partnerWorkspaceSwitcherAllowed() false by default; governance override requires member email + audit log",
  };

  const includeWorkspacesDefault = partnerWorkspaceSwitcherAllowed();
  const sliceBDefault: SliceResult = {
    id: "SecurityStability.SliceB.ConciergeDefaultOff",
    pass: includeWorkspacesDefault === false,
    evidence: "AdminConcierge includeWorkspaces defaults false — partner pills not in normal admin sessions",
  };

  const slices = [sliceA, sliceA403, sliceB, sliceBDefault];
  const admit = slices.every((s) => s.pass);
  return { admit, slices };
}

describe("Security Stability Certification — Slices A+B", () => {
  it("Slice A: workspace identity from session membership only (never ?workspace=)", () => {
    expect(securityStabilitySliceA_noQueryWorkspaceAuth()).toBe(true);
  });

  it("Slice A (403): unauthorized outsider session produces 403 status", () => {
    const denied = resolveWorkspaceFromSession({ email: "outsider@example.com" });
    expect(denied.ok).toBe(false);
    // Real control-flow narrowing (not just the runtime assertion above) —
    // TS can't infer from expect().toBe() that the union narrowed, so prove
    // it structurally: if resolution unexpectedly succeeded, fail loudly
    // here rather than accessing `.status` on the wrong branch.
    if (denied.ok) {
      throw new Error("Expected unauthorized workspace resolution to fail, but it succeeded");
    }
    expect(denied.status).toBe(403);
  });

  it("Slice B: partner switcher off by default and governance override audited", () => {
    expect(securityStabilitySliceB_partnerSwitcherOffByDefault()).toBe(true);
  });

  it("Slice B (Default): AdminConcierge includeWorkspaces defaults to false", () => {
    expect(partnerWorkspaceSwitcherAllowed()).toBe(false);
  });

  it("Full Certification: all slices pass and system admits", () => {
    const report = run();
    for (const s of report.slices) {
      expect(s.pass).toBe(true);
    }
    expect(report.admit).toBe(true);
  });
});

if (typeof describe === "undefined") {
  const report = run();
  for (const s of report.slices) {
    console.log(`${s.pass ? "PASS" : "FAIL"} ${s.id} — ${s.evidence}`);
  }
  console.log(report.admit ? "ADMIT Security Stability Certification Slices A+B" : "DENY — do not admit");
  if (!report.admit) {
    process.exitCode = 1;
  }
}

export { run };


