/**
 * MessagingSafetyScaffold — flag harassment / threats / spam in messaging.
 * Reports are intake signals, NOT proof. Negativity or politics alone never ban.
 * High-impact actions still require human review (hybrid automation).
 */

export type MessagingSafetyFlag = "harassment" | "threats" | "spam";

export type MessagingSafetyFinding = {
  flags: MessagingSafetyFlag[];
  policyTags: string[];
  /** Human-readable note for case desk (append-only). */
  note: string;
  /** Never auto-ban from this scaffold alone. */
  autoBanAllowed: false;
  /** Negativity / politics alone are never actionable here. */
  excludedAlone: ReadonlyArray<"negativity" | "politics">;
};

const THREAT_PATTERNS = [
  /\b(kill|murder|shoot|stab)\s+(you|him|her|them|u)\b/i,
  /\b(i'?ll|i will)\s+(hurt|harm|kill|find)\b/i,
  /\bdeath\s+threat\b/i,
];

const HARASS_PATTERNS = [
  /\b(kill yourself|kys)\b/i,
  /\b(slut|whore)\b/i,
  /\b(doxx?|doxxing)\b/i,
  /\bgo\s+die\b/i,
];

const SPAM_PATTERNS = [
  /(https?:\/\/\S+){3,}/i,
  /\b(buy\s+followers|crypto\s+giveaway|free\s+nft)\b/i,
  /(.)\1{8,}/,
];

/**
 * Evaluate message text for safety flags.
 * Does NOT treat disagreement, negativity, or political speech as ban-worthy.
 */
export function evaluateMessagingSafety(text: string): MessagingSafetyFinding {
  const raw = (text ?? "").trim();
  const flags: MessagingSafetyFlag[] = [];
  const policyTags: string[] = [];

  if (!raw) {
    return {
      flags: [],
      policyTags: [],
      note: "Empty message — no safety flags.",
      autoBanAllowed: false,
      excludedAlone: ["negativity", "politics"],
    };
  }

  if (THREAT_PATTERNS.some((re) => re.test(raw))) {
    flags.push("threats");
    policyTags.push("policy:threats");
  }
  if (HARASS_PATTERNS.some((re) => re.test(raw))) {
    flags.push("harassment");
    policyTags.push("policy:harassment");
  }
  if (SPAM_PATTERNS.some((re) => re.test(raw))) {
    flags.push("spam");
    policyTags.push("policy:spam");
  }

  const note =
    flags.length === 0
      ? "No harassment/threats/spam signals. Negativity/politics alone are not actionable."
      : `Scaffold flags: ${flags.join(", ")}. Reports ≠ proof — human review required for high-impact.`;

  return {
    flags,
    policyTags,
    note,
    autoBanAllowed: false,
    excludedAlone: ["negativity", "politics"],
  };
}

export function messagingFlagRequiresHumanReview(flags: MessagingSafetyFlag[]): boolean {
  return flags.includes("threats") || flags.includes("harassment");
}
