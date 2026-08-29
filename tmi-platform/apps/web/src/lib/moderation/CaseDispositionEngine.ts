/**
 * CaseDispositionEngine — maps Case Desk dispositions to real commands
 * (ModerationEngine / TrustSafety) or DISABLED WITH REASON.
 *
 * Hybrid automation: reports ≠ proof; high-impact needs human review.
 * LEGAL HOLD = retention only (no punitive account action).
 * EXPORT = OFF until a real export pipeline exists.
 */

export type CaseDisposition =
  | "ALLOW"
  | "WARNING"
  | "HOLD"
  | "REMOVE"
  | "ESCALATE"
  | "LEGAL_HOLD"
  | "EXPORT";

export type DispositionCommand =
  | {
      disposition: CaseDisposition;
      enabled: true;
      /** TrustSafety applyCaseAction when source is trust case */
      trustAction?: "resolve" | "hide_content" | "remove_from_room" | "escalate" | "close" | "start_review";
      /** ModerationEngine applyAdminAction when source is report / user target */
      moderationAction?: "clear" | "warn" | "suspend" | "ban";
      /** Append-only note line (outcome / legal hold) */
      noteTemplate: string;
      highImpact: boolean;
      requiresHuman: boolean;
    }
  | {
      disposition: CaseDisposition;
      enabled: false;
      disabledReason: string;
    };

const DISPOSITIONS: Record<CaseDisposition, DispositionCommand> = {
  ALLOW: {
    disposition: "ALLOW",
    enabled: true,
    trustAction: "resolve",
    moderationAction: "clear",
    noteTemplate: "ALLOW — no violation after review. Reports are not proof.",
    highImpact: false,
    requiresHuman: true,
  },
  WARNING: {
    disposition: "WARNING",
    enabled: true,
    trustAction: "start_review",
    moderationAction: "warn",
    noteTemplate: "WARNING issued. Policy tag attached; no permanent ban.",
    highImpact: false,
    requiresHuman: true,
  },
  HOLD: {
    disposition: "HOLD",
    enabled: true,
    trustAction: "escalate",
    moderationAction: "suspend",
    noteTemplate: "HOLD — temporary account/content hold pending further review.",
    highImpact: true,
    requiresHuman: true,
  },
  REMOVE: {
    disposition: "REMOVE",
    enabled: true,
    trustAction: "hide_content",
    moderationAction: "warn",
    noteTemplate: "REMOVE — content hidden / removed from surface. Account not banned.",
    highImpact: true,
    requiresHuman: true,
  },
  ESCALATE: {
    disposition: "ESCALATE",
    enabled: true,
    trustAction: "escalate",
    moderationAction: undefined,
    noteTemplate:
      "ESCALATE — human safety review. Permanent ban only via /api/admin/moderation (human-only).",
    highImpact: true,
    requiresHuman: true,
  },
  LEGAL_HOLD: {
    disposition: "LEGAL_HOLD",
    enabled: true,
    trustAction: undefined,
    moderationAction: undefined,
    noteTemplate: "LEGAL HOLD — retention only. Evidence preserved; no punitive action from this disposition.",
    highImpact: false,
    requiresHuman: true,
  },
  EXPORT: {
    disposition: "EXPORT",
    enabled: false,
    disabledReason: "Case export pipeline not shipped — EXPORT is OFF.",
  },
};

export function getDispositionCommand(disposition: CaseDisposition): DispositionCommand {
  return DISPOSITIONS[disposition];
}

export function listDispositionCommands(): DispositionCommand[] {
  return Object.values(DISPOSITIONS);
}

/** Policy tags that may attach as findings on a case note. */
export const POLICY_TAG_CATALOG = [
  "policy:harassment",
  "policy:threats",
  "policy:spam",
  "policy:impersonation",
  "policy:scam",
  "policy:csam",
  "policy:violence",
  "policy:other",
] as const;

export type PolicyTag = (typeof POLICY_TAG_CATALOG)[number];

export function formatAppendNote(params: {
  actor: string;
  disposition: CaseDisposition;
  policyTags?: string[];
  body?: string;
}): string {
  const tags = params.policyTags?.length ? ` [${params.policyTags.join(" ")}]` : "";
  const body = params.body?.trim() ? ` — ${params.body.trim()}` : "";
  return `${new Date().toISOString()} · ${params.actor} · ${params.disposition}${tags}${body}`;
}
