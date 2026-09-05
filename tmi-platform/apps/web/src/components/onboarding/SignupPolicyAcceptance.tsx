"use client";

import {
  REQUIRED_MESSAGING_POLICIES,
  type PolicyId,
} from "@/lib/messaging/policyCatalog";

export function emptyPolicyChecks(): Record<PolicyId, boolean> {
  return {
    TOS: false,
    PRIVACY: false,
    COMMUNITY_GUIDELINES: false,
    MESSAGING_CONDUCT: false,
    LIABILITY_ACK: false,
  };
}

export function allRequiredPoliciesAccepted(
  checks: Record<PolicyId, boolean>,
): boolean {
  return REQUIRED_MESSAGING_POLICIES.every((p) => checks[p.policyId]);
}

export function isSignupAgeEligible(dobIso: string): boolean {
  if (!dobIso.trim()) return false;
  const birth = new Date(dobIso);
  if (Number.isNaN(birth.getTime())) return false;
  const now = new Date();
  const age =
    now.getFullYear() -
    birth.getFullYear() -
    (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
  return age >= 16;
}

export const POLICY_ACCEPTANCE_ERROR =
  "Accept Terms, Privacy, Community Guidelines, Messaging Conduct, and liability acknowledgment.";

export const AGE_REQUIRED_ERROR = "You must be 16 or older to create an account.";

type Props = {
  checks: Record<PolicyId, boolean>;
  onChange: (next: Record<PolicyId, boolean>) => void;
  accent?: string;
};

/** Required policy + liability checkboxes — same set as main `/signup`. */
export default function SignupPolicyAcceptance({
  checks,
  onChange,
  accent = "#FFD700",
}: Props) {
  return (
    <div>
      <div
        style={{
          fontSize: 8,
          letterSpacing: "0.15em",
          color: "rgba(255,255,255,0.38)",
          marginBottom: 8,
          fontWeight: 700,
        }}
      >
        POLICY ACCEPTANCE (REQUIRED)
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {REQUIRED_MESSAGING_POLICIES.map((pol) => (
          <label
            key={pol.policyId}
            style={{
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
              fontSize: 11,
              color: "rgba(255,255,255,0.75)",
              cursor: "pointer",
              lineHeight: 1.4,
            }}
          >
            <input
              type="checkbox"
              checked={!!checks[pol.policyId]}
              onChange={(e) =>
                onChange({ ...checks, [pol.policyId]: e.target.checked })
              }
              style={{ marginTop: 2 }}
            />
            <span>
              <strong style={{ color: accent }}>{pol.title}</strong> — {pol.summary}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
