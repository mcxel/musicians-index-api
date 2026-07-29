import { createHash } from "crypto";
import type { EvidenceKind, EvidenceMessage } from "./types";

export type EvidencePackageInput = {
  reporterId: string;
  accusedId?: string | null;
  surface: string;
  roomId?: string | null;
  contentSnapshot?: string | null;
  messages?: EvidenceMessage[];
  screenshotUrl?: string | null;
  presenceSnapshot?: unknown;
  reasons: string[];
  detail?: string;
};

export type PreservedEvidenceItem = {
  kind: EvidenceKind;
  contentHash: string;
  payloadJson: string;
};

/** SHA-256 of canonical JSON — immutable-ish fingerprint for the vault. */
export function hashPayload(payload: unknown): string {
  const canonical = typeof payload === "string" ? payload : JSON.stringify(payload);
  return createHash("sha256").update(canonical).digest("hex");
}

/**
 * Build immutable-ish evidence items for a case.
 * Does not write — EvidenceVault.preserveCasePackage persists.
 */
export function buildEvidenceItems(input: EvidencePackageInput): PreservedEvidenceItem[] {
  const items: PreservedEvidenceItem[] = [];
  const preservedAt = new Date().toISOString();

  const core = {
    reporterId: input.reporterId,
    accusedId: input.accusedId ?? null,
    surface: input.surface,
    roomId: input.roomId ?? null,
    reasons: input.reasons,
    detail: input.detail ?? null,
    preservedAt,
  };
  items.push({
    kind: "hash_record",
    contentHash: hashPayload(core),
    payloadJson: JSON.stringify(core),
  });

  if (input.contentSnapshot) {
    items.push({
      kind: "content_snapshot",
      contentHash: hashPayload(input.contentSnapshot),
      payloadJson: JSON.stringify({ snapshot: input.contentSnapshot, preservedAt }),
    });
  }

  if (input.messages && input.messages.length > 0) {
    items.push({
      kind: "message_bundle",
      contentHash: hashPayload(input.messages),
      payloadJson: JSON.stringify({ messages: input.messages, preservedAt }),
    });
  }

  if (input.screenshotUrl) {
    items.push({
      kind: "screenshot",
      contentHash: hashPayload(input.screenshotUrl),
      payloadJson: JSON.stringify({ url: input.screenshotUrl, preservedAt }),
    });
  }

  if (input.presenceSnapshot != null) {
    items.push({
      kind: "presence_frame",
      contentHash: hashPayload(input.presenceSnapshot),
      payloadJson: JSON.stringify({ presence: input.presenceSnapshot, preservedAt }),
    });
  }

  return items;
}
