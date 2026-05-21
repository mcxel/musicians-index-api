import type { ModuleEvent } from "@tmi/module-runtime";

// ─── Events emitted BY Danika's Law ──────────────────────────────────────────

export interface LawReferralReceived {
  artistId: string;
  artistName: string;
  referralSource: "tmi" | "direct" | "organic";
  intakeUrl: string;
}

export interface LawQuestionAnswered {
  sessionId: string;
  topic: string;
  creditsUsed: number;
  creditsRemaining: number;
  isHighStakes: boolean;
  answerTokens: number;
  durationMs: number;
}

export interface LawPaymentCompleted {
  userId: string;
  packageId: "starter" | "standard" | "pro";
  amountCents: number;
  creditsGranted: number;
  stripePaymentIntentId: string;
}

export interface LawSessionStarted {
  sessionId: string;
  userId: string;
  entryPath: string;
  referralCorrelationId?: string;
}

// ─── Events consumed FROM other modules ──────────────────────────────────────

export interface TmiArtistReferral {
  artistId: string;
  artistName: string;
  sessionId: string;
  referralReason: "legal_help" | "contract_review" | "dmca" | "general";
}

export interface TmiSessionActive {
  sessionId: string;
  userId: string;
}

// ─── Typed event wrappers ─────────────────────────────────────────────────────

export const LAW_EVENT_TYPES = {
  REFERRAL_RECEIVED: "law.referral.received",
  QUESTION_ANSWERED: "law.question.answered",
  PAYMENT_COMPLETED: "law.payment.completed",
  SESSION_STARTED: "law.session.started",
} as const;

export const TMI_EVENT_TYPES_CONSUMED = {
  ARTIST_REFERRAL: "tmi.artist.referral",
  SESSION_ACTIVE: "tmi.session.active",
} as const;

export type LawEvent =
  | ModuleEvent<LawReferralReceived>
  | ModuleEvent<LawQuestionAnswered>
  | ModuleEvent<LawPaymentCompleted>
  | ModuleEvent<LawSessionStarted>;
