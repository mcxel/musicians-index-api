"use client";

import type { AgeAssuranceState, OneToOneDecision, PrivateInteractContext, YouthSocialBand } from "./YouthSocialGuard";

const FAIL_CLOSED: OneToOneDecision = {
  allowed: false,
  blocked: true,
  reason: "blocked: age unknown — 1:1 social denied until age is on the account",
  code: "UNKNOWN_AGE",
  actorBand: "UNKNOWN",
  targetBand: "UNKNOWN",
  context: "DM",
  actorAssurance: "UNVERIFIED",
  targetAssurance: "UNVERIFIED",
};

function asBand(value: unknown): YouthSocialBand {
  if (value === "YOUTH" || value === "ADULT" || value === "UNKNOWN" || value === "BELOW_PLATFORM") {
    return value;
  }
  return "UNKNOWN";
}

function asContext(value: unknown): PrivateInteractContext {
  if (
    value === "DM" ||
    value === "CALL" ||
    value === "PRIVATE_VIDEO" ||
    value === "BREAKOUT_INVITE" ||
    value === "PRIVATE_MONITOR_ROUTE" ||
    value === "SCREEN_SHARE"
  ) {
    return value;
  }
  return "DM";
}

function asAssurance(value: unknown): AgeAssuranceState {
  if (
    value === "UNVERIFIED" ||
    value === "SELF_DECLARED" ||
    value === "AGE_ESTIMATED" ||
    value === "VERIFIED_TEEN" ||
    value === "VERIFIED_ADULT" ||
    value === "VERIFICATION_REQUIRED" ||
    value === "VERIFICATION_FAILED"
  ) {
    return value;
  }
  return "UNVERIFIED";
}

function asDecision(raw: unknown): OneToOneDecision {
  if (!raw || typeof raw !== "object") return FAIL_CLOSED;
  const rec = raw as Record<string, unknown>;
  const allowed = rec.allowed === true;
  const reason =
    typeof rec.reason === "string" && rec.reason.trim()
      ? rec.reason
      : FAIL_CLOSED.reason;
  return {
    allowed,
    blocked: !allowed,
    reason,
    code: (typeof rec.code === "string" ? rec.code : allowed ? "ADULT_PEERS" : "UNKNOWN_AGE") as OneToOneDecision["code"],
    actorBand: asBand(rec.actorBand),
    targetBand: asBand(rec.targetBand),
    context: asContext(rec.context),
    actorAssurance: asAssurance(rec.actorAssurance),
    targetAssurance: asAssurance(rec.targetAssurance),
  };
}

/** Client entry: server re-reads Prisma age/family. Fail closed on network/auth errors. */
export async function requestOneToOneSocial(targetUserId: string): Promise<OneToOneDecision> {
  const id = targetUserId.trim();
  if (!id) {
    return {
      ...FAIL_CLOSED,
      code: "NO_TARGET",
      reason: "blocked: 1:1 social requires two real account identities",
    };
  }

  try {
    const res = await fetch("/api/trustSafety/one-to-one", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ targetUserId: id }),
    });
    const data: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const rec = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
      const reason =
        typeof rec.error === "string"
          ? rec.error
          : typeof rec.reason === "string"
            ? rec.reason
            : FAIL_CLOSED.reason;
      return {
        ...FAIL_CLOSED,
        reason,
        code: (typeof rec.code === "string" ? rec.code : "UNKNOWN_AGE") as OneToOneDecision["code"],
        actorBand: asBand(rec.actorBand),
        targetBand: asBand(rec.targetBand),
      };
    }
    return asDecision(data);
  } catch {
    return FAIL_CLOSED;
  }
}
