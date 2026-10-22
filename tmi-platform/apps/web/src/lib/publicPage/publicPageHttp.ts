/**
 * C.7 — authenticated Public Page HTTP boundary.
 * Owner identity is the authenticated actor. Request bodies cannot select ownerUserId.
 */

import type { PublicPageDocument, PublicPageProfileKind } from "@/lib/publicPage/publicPageDocument";
import type { PublicPageActor, PublicPagePersistence, PublicPagePersistenceFailure } from "@/lib/publicPage/publicPagePersistence";

const PROFILE_KINDS = new Set<PublicPageProfileKind>(["FAN", "PERFORMER", "WRITER_PORTFOLIO"]);
const PERFORMER_ROLES = new Set(["PERFORMER", "ARTIST", "BAND", "PRODUCER"]);
const WRITE_OPS = new Set(["create", "save", "publish", "restore"]);

export interface PublicPageHttpActor {
  userId: string;
  role: string;
}

export interface PublicPageHttpRequest {
  method: "GET" | "POST";
  actor: PublicPageHttpActor | null;
  searchParams: URLSearchParams;
  body: unknown;
}

export interface PublicPageHttpResult {
  status: number;
  body: Record<string, unknown>;
}

function capabilitiesForRole(role: string): PublicPageActor["capabilities"] {
  if (PERFORMER_ROLES.has(role.trim().toUpperCase())) return ["BASE", "PERFORMER"];
  return ["BASE"];
}

function actorOf(httpActor: PublicPageHttpActor): PublicPageActor {
  return { userId: httpActor.userId, capabilities: capabilitiesForRole(httpActor.role) };
}

function profileKindOf(value: unknown): PublicPageProfileKind | null {
  return typeof value === "string" && PROFILE_KINDS.has(value as PublicPageProfileKind)
    ? (value as PublicPageProfileKind)
    : null;
}

function revisionOf(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function statusFor(code: PublicPagePersistenceFailure): number {
  if (code === "UNAUTHENTICATED") return 401;
  if (code === "FORBIDDEN" || code === "CAPABILITY_DENIED" || code === "WRITER_LOCKED" || code === "POLICY_DENIED") return 403;
  if (code === "INVALID_DOCUMENT") return 400;
  if (code === "REVISION_CONFLICT") return 409;
  if (code === "NOT_FOUND") return 404;
  return 500;
}

function failure(status: number, code: string, extra: Record<string, unknown> = {}): PublicPageHttpResult {
  return {
    status,
    body: {
      ok: false,
      code,
      touchesPublicProfileConfig: false,
      touchesContent: false,
      ...extra,
    },
  };
}

function fromPersistence(result: { ok: true } | { ok: false; code: PublicPagePersistenceFailure }): PublicPageHttpResult {
  if (!result.ok) return failure(statusFor(result.code), result.code);
  const body: Record<string, unknown> = { ...(result as unknown as Record<string, unknown>), touchesContent: false };
  if (body.mode === "LEGACY_FALLBACK") delete body.document;
  return { status: 200, body };
}

export async function handlePublicPageRequest(
  persistence: PublicPagePersistence,
  request: PublicPageHttpRequest,
): Promise<PublicPageHttpResult> {
  if (request.method === "GET") return handleGet(persistence, request);
  if (request.method === "POST") return handlePost(persistence, request);
  return failure(400, "INVALID_INPUT");
}

async function handleGet(persistence: PublicPagePersistence, request: PublicPageHttpRequest): Promise<PublicPageHttpResult> {
  const scope = request.searchParams.get("scope");
  const profileKind = profileKindOf(request.searchParams.get("profileKind"));
  if (!profileKind || (scope !== "draft" && scope !== "published" && scope !== "history")) {
    return failure(400, "INVALID_INPUT");
  }

  if (scope === "published") {
    const pageOwnerId = request.searchParams.get("ownerUserId")?.trim() ?? "";
    if (!pageOwnerId) return failure(400, "INVALID_INPUT");
    return fromPersistence(
      await persistence.getPublishedPage({
        ownerUserId: pageOwnerId,
        profileKind,
        visitorMayRead: true,
      }),
    );
  }

  if (!request.actor) return failure(401, "UNAUTHENTICATED");
  const actor = actorOf(request.actor);
  if (scope === "draft") return fromPersistence(await persistence.getOwnerDraft(actor, profileKind));
  return fromPersistence(await persistence.listRevisionHistory(actor, profileKind));
}

async function handlePost(persistence: PublicPagePersistence, request: PublicPageHttpRequest): Promise<PublicPageHttpResult> {
  if (!request.actor?.userId) return failure(401, "UNAUTHENTICATED");
  if (!isRecord(request.body)) return failure(400, "INVALID_INPUT");

  const op = request.body.op;
  const profileKind = profileKindOf(request.body.profileKind);
  if (typeof op !== "string" || !WRITE_OPS.has(op) || !profileKind) return failure(400, "INVALID_INPUT");

  const actor = actorOf(request.actor);
  const document = isRecord(request.body.document) ? (request.body.document as unknown as PublicPageDocument) : null;

  if (op === "create") {
    if (!document) return failure(400, "INVALID_INPUT");
    return fromPersistence(await persistence.createDraft(actor, profileKind, document));
  }

  const expectedRevision = revisionOf(request.body.expectedRevision);
  if (expectedRevision === null) return failure(400, "INVALID_INPUT");

  if (op === "save") {
    if (!document) return failure(400, "INVALID_INPUT");
    return fromPersistence(await persistence.saveDraft(actor, profileKind, expectedRevision, document));
  }
  if (op === "publish") {
    return fromPersistence(await persistence.publishDraft(actor, profileKind, expectedRevision));
  }

  const sourceRevisionId = typeof request.body.sourceRevisionId === "string" ? request.body.sourceRevisionId.trim() : "";
  if (!sourceRevisionId) return failure(400, "INVALID_INPUT");
  return fromPersistence(await persistence.restoreRevision(actor, profileKind, sourceRevisionId, expectedRevision));
}
