/**
 * Client-safe policy catalog (no Prisma). Shared by server PolicyAcceptance + UI.
 */

export const CURRENT_POLICY_VERSION = "2026-08-24";

export type PolicyId =
  | "TOS"
  | "PRIVACY"
  | "COMMUNITY_GUIDELINES"
  | "MESSAGING_CONDUCT"
  | "LIABILITY_ACK";

export type PolicyDefinition = {
  policyId: PolicyId;
  version: string;
  title: string;
  summary: string;
  required: boolean;
};

export const REQUIRED_MESSAGING_POLICIES: PolicyDefinition[] = [
  {
    policyId: "TOS",
    version: CURRENT_POLICY_VERSION,
    title: "Terms of Service",
    summary: "I agree to the TMI Terms of Service.",
    required: true,
  },
  {
    policyId: "PRIVACY",
    version: CURRENT_POLICY_VERSION,
    title: "Privacy Policy",
    summary: "I agree to the TMI Privacy Policy.",
    required: true,
  },
  {
    policyId: "COMMUNITY_GUIDELINES",
    version: CURRENT_POLICY_VERSION,
    title: "Community Guidelines",
    summary: "I agree to follow TMI Community Guidelines.",
    required: true,
  },
  {
    policyId: "MESSAGING_CONDUCT",
    version: CURRENT_POLICY_VERSION,
    title: "Messaging Conduct",
    summary: "I agree to respectful messaging conduct and anti-harassment rules.",
    required: true,
  },
  {
    policyId: "LIABILITY_ACK",
    version: CURRENT_POLICY_VERSION,
    title: "Liability & Rules Acknowledgment",
    summary:
      "I understand TMI is not responsible for user-to-user communications and I agree to the platform rules.",
    required: true,
  },
];
