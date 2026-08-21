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

const report = run();
for (const s of report.slices) {
  console.log(`${s.pass ? "PASS" : "FAIL"} ${s.id} — ${s.evidence}`);
}
console.log(report.admit ? "ADMIT Security Stability Certification Slices A+B" : "DENY — do not admit");

if (!report.admit) {
  process.exitCode = 1;
}

export { run };
