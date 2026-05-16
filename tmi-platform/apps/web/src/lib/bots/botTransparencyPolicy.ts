/**
 * botTransparencyPolicy.ts
 *
 * Enforcement layer for TMI bot safety and transparency rules.
 *
 * SAFETY CONTRACT (enforced hard-stop):
 * 1. All bots must be labeled [BOT] in UI — no exceptions
 * 2. No bot may impersonate a human or real artist
 * 3. Bots cannot access private rooms without explicit policy/safety escalation
 * 4. Bots cannot transfer real money or manipulate financial records
 * 5. Bots cannot abuse reward/points systems
 * 6. Bots must obey youth/adult content separation (age gate)
 * 7. All bot actions must be logged
 * 8. Bots escalate risky situations to the governance chain (Marcel/Big Ace/MC)
 */

export type PolicyViolation = {
  violationId: string;
  botId: string;
  botLabel: string;
  rule: SafetyRule;
  attemptedAction: string;
  blocked: boolean;
  escalatedTo: string[];
  timestamp: number;
};

export type SafetyRule =
  | "RULE_BOT_LABEL_REQUIRED"
  | "RULE_NO_HUMAN_IMPERSONATION"
  | "RULE_PUBLIC_ROOMS_ONLY"
  | "RULE_NO_MONEY_TRANSFER"
  | "RULE_NO_REWARD_ABUSE"
  | "RULE_AGE_SEPARATION"
  | "RULE_ALL_ACTIONS_LOGGED"
  | "RULE_ESCALATE_RISKY_ACTIONS";

export type PolicyCheckResult = {
  allowed: boolean;
  violations: PolicyViolation[];
  message: string;
};

const policyViolationLog: PolicyViolation[] = [];
let violationCounter = 1;

function logViolation(v: Omit<PolicyViolation, "violationId" | "timestamp">): PolicyViolation {
  const violation: PolicyViolation = {
    ...v,
    violationId: `POL-VIOL-${String(violationCounter++).padStart(5, "0")}`,
    timestamp: Date.now(),
  };
  policyViolationLog.push(violation);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("tmi:policy-violation", { detail: violation })
    );
  }

  return violation;
}

export type BotActionRequest = {
  botId: string;
  botLabel: string;
  action: string;
  targetIsPrivateRoom?: boolean;
  targetIsYouthContent?: boolean;
  botIsAdultClassified?: boolean;
  involvesRealMoney?: boolean;
  involvesRewardManipulation?: boolean;
  botLabelVisible?: boolean;
  isImpersonatingHuman?: boolean;
  isLogged?: boolean;
};

const ESCALATION_CHAIN = ["big-ace", "mc", "sentinel", "marcel-root"];

/**
 * Enforce all safety rules on a bot action request.
 * Returns allowed=false and logs violations if any rules are broken.
 */
export function enforceBotPolicy(request: BotActionRequest): PolicyCheckResult {
  const violations: PolicyViolation[] = [];

  // RULE 1: Bot must be labeled
  if (request.botLabelVisible === false) {
    violations.push(
      logViolation({
        botId: request.botId,
        botLabel: request.botLabel,
        rule: "RULE_BOT_LABEL_REQUIRED",
        attemptedAction: request.action,
        blocked: true,
        escalatedTo: ESCALATION_CHAIN,
      })
    );
  }

  // RULE 2: No human impersonation
  if (request.isImpersonatingHuman === true) {
    violations.push(
      logViolation({
        botId: request.botId,
        botLabel: request.botLabel,
        rule: "RULE_NO_HUMAN_IMPERSONATION",
        attemptedAction: request.action,
        blocked: true,
        escalatedTo: ESCALATION_CHAIN,
      })
    );
  }

  // RULE 3: Public rooms only
  if (request.targetIsPrivateRoom === true) {
    violations.push(
      logViolation({
        botId: request.botId,
        botLabel: request.botLabel,
        rule: "RULE_PUBLIC_ROOMS_ONLY",
        attemptedAction: request.action,
        blocked: true,
        escalatedTo: ESCALATION_CHAIN,
      })
    );
  }

  // RULE 4: No real money transfer
  if (request.involvesRealMoney === true) {
    violations.push(
      logViolation({
        botId: request.botId,
        botLabel: request.botLabel,
        rule: "RULE_NO_MONEY_TRANSFER",
        attemptedAction: request.action,
        blocked: true,
        escalatedTo: ESCALATION_CHAIN,
      })
    );
  }

  // RULE 5: No reward/points abuse
  if (request.involvesRewardManipulation === true) {
    violations.push(
      logViolation({
        botId: request.botId,
        botLabel: request.botLabel,
        rule: "RULE_NO_REWARD_ABUSE",
        attemptedAction: request.action,
        blocked: true,
        escalatedTo: ESCALATION_CHAIN,
      })
    );
  }

  // RULE 6: Age separation — adult-classified bot cannot enter youth content zone
  if (request.targetIsYouthContent === true && request.botIsAdultClassified === true) {
    violations.push(
      logViolation({
        botId: request.botId,
        botLabel: request.botLabel,
        rule: "RULE_AGE_SEPARATION",
        attemptedAction: request.action,
        blocked: true,
        escalatedTo: ESCALATION_CHAIN,
      })
    );
  }

  // RULE 7: All actions must be logged
  if (request.isLogged === false) {
    violations.push(
      logViolation({
        botId: request.botId,
        botLabel: request.botLabel,
        rule: "RULE_ALL_ACTIONS_LOGGED",
        attemptedAction: request.action,
        blocked: false, // Warning only — cannot block unlogged action retroactively
        escalatedTo: ["admin", "big-ace"],
      })
    );
  }

  const blocked = violations.some((v) => v.blocked);
  const message = blocked
    ? `Action BLOCKED: ${violations.map((v) => v.rule).join(", ")}`
    : violations.length > 0
    ? `Action ALLOWED with warnings: ${violations.map((v) => v.rule).join(", ")}`
    : "Action ALLOWED — all policies passed";

  return {
    allowed: !blocked,
    violations,
    message,
  };
}

/**
 * Assert that a bot is properly labeled in the UI.
 * Call this in components rendering bot entities.
 */
export function assertBotLabel(label: string): boolean {
  return label.startsWith("[BOT]") || label.startsWith("BOT:");
}

/**
 * Get the public-facing transparency statement for display in UI.
 */
export function getBotTransparencyStatement(botLabel: string): string {
  return `${botLabel} is an automated system helper. It cannot access private content, handle money, or impersonate humans. All actions are logged and reviewed by TMI governance.`;
}

export function getPolicyViolationLog(): PolicyViolation[] {
  return [...policyViolationLog];
}

export function getViolationsByBot(botId: string): PolicyViolation[] {
  return policyViolationLog.filter((v) => v.botId === botId);
}

export const BOT_POLICY_RULES: Record<SafetyRule, string> = {
  RULE_BOT_LABEL_REQUIRED: "All bots must display a visible [BOT] label in the UI at all times",
  RULE_NO_HUMAN_IMPERSONATION: "Bots cannot pretend to be human users or real artists",
  RULE_PUBLIC_ROOMS_ONLY: "Bots cannot enter private rooms without explicit policy/safety escalation",
  RULE_NO_MONEY_TRANSFER: "Bots cannot transfer, receive, or manipulate real money",
  RULE_NO_REWARD_ABUSE: "Bots cannot manipulate reward or points systems",
  RULE_AGE_SEPARATION: "Adult-classified bots cannot access youth content zones",
  RULE_ALL_ACTIONS_LOGGED: "Every bot action must be recorded in the operations log",
  RULE_ESCALATE_RISKY_ACTIONS: "Risky or ambiguous situations must be escalated to Big Ace/MC/Marcel",
};
