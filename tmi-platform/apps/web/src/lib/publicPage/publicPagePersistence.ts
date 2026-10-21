/**
 * Gate C.6B-1 — public page persistence contract.
 *
 * Application logic only. Storage is injected. This module does not open
 * a database connection. ownerUserId is the authenticated User.id. The
 * physical relation is public_page_heads.owner_user_id → User.id.
 *
 * A store transaction here is an application-level boundary. It is not
 * proof of a real database transaction.
 */

import {
  getPublicPageBlockCatalogEntry,
  type PublicPageCapability,
  type PublicPageDocument,
  type PublicPageProfileKind,
} from "./publicPageDocument";
import { validatePublicPageDocument } from "./validatePublicPageDocument";

export type PublicPageRevisionState = "DRAFT" | "PUBLISHED" | "SUPERSEDED";

/** Authenticated User.id. Callers must not accept this value from a request body. */
export interface PublicPageActor {
  userId: string;
  capabilities: readonly PublicPageCapability[];
}

export interface PublicPageRevisionRecord {
  revisionId: string;
  headId: string;
  revisionNumber: number;
  state: PublicPageRevisionState;
  body: PublicPageDocument;
}

export interface PublicPageHeadRecord {
  headId: string;
  ownerUserId: string;
  profileKind: PublicPageProfileKind;
  draftRevisionId: string | null;
  publishedRevisionId: string | null;
}

export interface PublicPageStoreTx {
  getHead(ownerUserId: string, profileKind: PublicPageProfileKind): Promise<PublicPageHeadRecord | null>;
  insertHead(head: PublicPageHeadRecord): Promise<void>;
  updateHead(head: PublicPageHeadRecord): Promise<void>;
  insertRevision(revision: PublicPageRevisionRecord): Promise<void>;
  /** Changes lifecycle state only. Must not replace the stored body. */
  updateRevisionState(revisionId: string, state: PublicPageRevisionState): Promise<void>;
  getRevision(revisionId: string): Promise<PublicPageRevisionRecord | null>;
  listRevisions(headId: string): Promise<PublicPageRevisionRecord[]>;
}

export interface PublicPageStore {
  transaction<T>(work: (tx: PublicPageStoreTx) => Promise<T>): Promise<T>;
}

export type PublicPagePersistenceFailure =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "WRITER_LOCKED"
  | "INVALID_DOCUMENT"
  | "CAPABILITY_DENIED"
  | "NOT_FOUND"
  | "REVISION_CONFLICT"
  | "POLICY_DENIED"
  | "TRANSACTION_ABORTED";

export interface PublicPageFailure {
  ok: false;
  code: PublicPagePersistenceFailure;
  /** Present for conflicts so a later HTTP boundary can map 409. Not an HTTP route. */
  statusHint?: 409;
  issues?: readonly { code: string; path: string; message: string }[];
  /** This service never writes PublicProfileConfig. */
  touchesPublicProfileConfig: false;
  /** Account cascade was not executed against a database. */
  databaseCascadePhysicallyTested: false;
}

export type PublicPageDraftView = {
  ok: true;
  mode: "DRAFT";
  ownerUserId: string;
  profileKind: PublicPageProfileKind;
  revisionId: string;
  revisionNumber: number;
  document: PublicPageDocument;
  touchesPublicProfileConfig: false;
  databaseCascadePhysicallyTested: false;
};

export type PublicPagePublishedView = {
  ok: true;
  mode: "PUBLISHED";
  ownerUserId: string;
  profileKind: PublicPageProfileKind;
  revisionId: string;
  revisionNumber: number;
  document: PublicPageDocument;
  touchesPublicProfileConfig: false;
  databaseCascadePhysicallyTested: false;
};

export type PublicPageLegacyFallback = {
  ok: true;
  mode: "LEGACY_FALLBACK";
  ownerUserId: string;
  profileKind: PublicPageProfileKind;
  touchesPublicProfileConfig: false;
  databaseCascadePhysicallyTested: false;
};

export type PublicPageHistoryView = {
  ok: true;
  mode: "HISTORY";
  revisions: readonly {
    revisionId: string;
    revisionNumber: number;
    state: PublicPageRevisionState;
    document: PublicPageDocument;
  }[];
  touchesPublicProfileConfig: false;
  databaseCascadePhysicallyTested: false;
};

const FLAGS = {
  touchesPublicProfileConfig: false as const,
  databaseCascadePhysicallyTested: false as const,
};

function fail(code: PublicPagePersistenceFailure, extra?: Pick<PublicPageFailure, "statusHint" | "issues">): PublicPageFailure {
  return { ok: false, code, ...extra, ...FLAGS };
}

function cloneDocument(document: PublicPageDocument): PublicPageDocument {
  return JSON.parse(JSON.stringify(document)) as PublicPageDocument;
}

function blocksOf(document: PublicPageDocument) {
  return document.sections.flatMap((section) => section.blocks);
}

function capabilityDenial(document: PublicPageDocument, capabilities: readonly PublicPageCapability[]): string | null {
  const authorized = new Set(capabilities);
  for (const block of blocksOf(document)) {
    const required = getPublicPageBlockCatalogEntry(block.kind)?.capability ?? "BASE";
    if (required !== "BASE" && !authorized.has(required)) return block.id;
  }
  return null;
}

function acceptBody(
  actor: PublicPageActor,
  profileKind: PublicPageProfileKind,
  document: PublicPageDocument,
): { ok: true; body: PublicPageDocument } | PublicPageFailure {
  if (profileKind === "WRITER_PORTFOLIO") return fail("WRITER_LOCKED");
  const validation = validatePublicPageDocument(document);
  if (!validation.ok) return fail("INVALID_DOCUMENT", { issues: validation.issues });
  if (document.profileKind !== profileKind) return fail("INVALID_DOCUMENT");
  const denied = capabilityDenial(document, actor.capabilities);
  if (denied) return fail("CAPABILITY_DENIED");
  const body = cloneDocument(document);
  body.ownerUserId = actor.userId;
  return { ok: true, body };
}

export class PublicPageRevisionConflict extends Error {
  readonly statusHint = 409 as const;
  constructor() {
    super("REVISION_CONFLICT");
    this.name = "PublicPageRevisionConflict";
  }
}

export interface PublicPagePersistence {
  getOwnerDraft(actor: PublicPageActor, profileKind: PublicPageProfileKind): Promise<PublicPageDraftView | PublicPageFailure>;
  getPublishedPage(input: {
    ownerUserId: string;
    profileKind: PublicPageProfileKind;
    visitorMayRead: boolean;
  }): Promise<PublicPagePublishedView | PublicPageLegacyFallback | PublicPageFailure>;
  createDraft(
    actor: PublicPageActor,
    profileKind: PublicPageProfileKind,
    document: PublicPageDocument,
  ): Promise<PublicPageDraftView | PublicPageFailure>;
  saveDraft(
    actor: PublicPageActor,
    profileKind: PublicPageProfileKind,
    expectedRevision: number,
    document: PublicPageDocument,
  ): Promise<PublicPageDraftView | PublicPageFailure>;
  publishDraft(
    actor: PublicPageActor,
    profileKind: PublicPageProfileKind,
    expectedRevision: number,
  ): Promise<PublicPagePublishedView | PublicPageFailure>;
  listRevisionHistory(actor: PublicPageActor, profileKind: PublicPageProfileKind): Promise<PublicPageHistoryView | PublicPageFailure>;
  restoreRevision(
    actor: PublicPageActor,
    profileKind: PublicPageProfileKind,
    sourceRevisionId: string,
    expectedRevision: number,
  ): Promise<PublicPageDraftView | PublicPageFailure>;
}

async function nextRevisionNumber(tx: PublicPageStoreTx, headId: string): Promise<number> {
  const revisions = await tx.listRevisions(headId);
  const highest = revisions.reduce((max, revision) => Math.max(max, revision.revisionNumber), 0);
  return highest + 1;
}

function draftView(actorId: string, profileKind: PublicPageProfileKind, revision: PublicPageRevisionRecord): PublicPageDraftView {
  return {
    ok: true,
    mode: "DRAFT",
    ownerUserId: actorId,
    profileKind,
    revisionId: revision.revisionId,
    revisionNumber: revision.revisionNumber,
    document: cloneDocument(revision.body),
    ...FLAGS,
  };
}

export function createPublicPagePersistence(store: PublicPageStore, newId: () => string): PublicPagePersistence {
  return {
    async getOwnerDraft(actor, profileKind) {
      if (!actor.userId) return fail("UNAUTHENTICATED");
      return store.transaction(async (tx) => {
        const head = await tx.getHead(actor.userId, profileKind);
        if (!head?.draftRevisionId) return fail("NOT_FOUND");
        const revision = await tx.getRevision(head.draftRevisionId);
        if (!revision || revision.state !== "DRAFT") return fail("NOT_FOUND");
        return draftView(actor.userId, profileKind, revision);
      });
    },

    async getPublishedPage(input) {
      if (!input.visitorMayRead) return fail("POLICY_DENIED");
      return store.transaction(async (tx) => {
        const head = await tx.getHead(input.ownerUserId, input.profileKind);
        if (!head?.publishedRevisionId) {
          return { ok: true as const, mode: "LEGACY_FALLBACK" as const, ownerUserId: input.ownerUserId, profileKind: input.profileKind, ...FLAGS };
        }
        const revision = await tx.getRevision(head.publishedRevisionId);
        if (!revision || revision.state !== "PUBLISHED") {
          return { ok: true as const, mode: "LEGACY_FALLBACK" as const, ownerUserId: input.ownerUserId, profileKind: input.profileKind, ...FLAGS };
        }
        return {
          ok: true as const,
          mode: "PUBLISHED" as const,
          ownerUserId: input.ownerUserId,
          profileKind: input.profileKind,
          revisionId: revision.revisionId,
          revisionNumber: revision.revisionNumber,
          document: cloneDocument(revision.body),
          ...FLAGS,
        };
      });
    },

    async createDraft(actor, profileKind, document) {
      if (!actor.userId) return fail("UNAUTHENTICATED");
      const accepted = acceptBody(actor, profileKind, document);
      if (!accepted.ok) return accepted;
      try {
        return await store.transaction(async (tx) => {
          const existing = await tx.getHead(actor.userId, profileKind);
          if (existing?.draftRevisionId) {
            const current = await tx.getRevision(existing.draftRevisionId);
            if (!current) return fail("NOT_FOUND");
            return draftView(actor.userId, profileKind, current);
          }
          const headId = newId();
          const revisionId = newId();
          const body = accepted.body;
          body.documentId = headId;
          body.status = "DRAFT";
          body.publishedVersion = null;
          const revision: PublicPageRevisionRecord = {
            revisionId,
            headId,
            revisionNumber: 1,
            state: "DRAFT",
            body,
          };
          await tx.insertHead({
            headId,
            ownerUserId: actor.userId,
            profileKind,
            draftRevisionId: null,
            publishedRevisionId: null,
          });
          await tx.insertRevision(revision);
          await tx.updateHead({
            headId,
            ownerUserId: actor.userId,
            profileKind,
            draftRevisionId: revisionId,
            publishedRevisionId: null,
          });
          return draftView(actor.userId, profileKind, revision);
        });
      } catch {
        return fail("TRANSACTION_ABORTED");
      }
    },

    async saveDraft(actor, profileKind, expectedRevision, document) {
      if (!actor.userId) return fail("UNAUTHENTICATED");
      const accepted = acceptBody(actor, profileKind, document);
      if (!accepted.ok) return accepted;
      try {
        return await store.transaction(async (tx) => {
          const head = await tx.getHead(actor.userId, profileKind);
          if (!head?.draftRevisionId) return fail("NOT_FOUND");
          const current = await tx.getRevision(head.draftRevisionId);
          if (!current) return fail("NOT_FOUND");
          if (current.revisionNumber !== expectedRevision) throw new PublicPageRevisionConflict();
          const nextNumber = await nextRevisionNumber(tx, head.headId);
          const revisionId = newId();
          const body = accepted.body;
          body.documentId = head.headId;
          body.status = "DRAFT";
          body.publishedVersion = null;
          const revision: PublicPageRevisionRecord = {
            revisionId,
            headId: head.headId,
            revisionNumber: nextNumber,
            state: "DRAFT",
            body,
          };
          await tx.insertRevision(revision);
          await tx.updateHead({ ...head, draftRevisionId: revisionId });
          return draftView(actor.userId, profileKind, revision);
        });
      } catch (error) {
        if (error instanceof PublicPageRevisionConflict) return fail("REVISION_CONFLICT", { statusHint: 409 });
        return fail("TRANSACTION_ABORTED");
      }
    },

    async publishDraft(actor, profileKind, expectedRevision) {
      if (!actor.userId) return fail("UNAUTHENTICATED");
      if (profileKind === "WRITER_PORTFOLIO") return fail("WRITER_LOCKED");
      try {
        return await store.transaction(async (tx) => {
          const head = await tx.getHead(actor.userId, profileKind);
          if (!head?.draftRevisionId) return fail("NOT_FOUND");
          const draft = await tx.getRevision(head.draftRevisionId);
          if (!draft || draft.state !== "DRAFT") return fail("NOT_FOUND");
          if (draft.revisionNumber !== expectedRevision) throw new PublicPageRevisionConflict();
          const denied = capabilityDenial(draft.body, actor.capabilities);
          if (denied) return fail("CAPABILITY_DENIED");
          const validation = validatePublicPageDocument(draft.body);
          if (!validation.ok) return fail("INVALID_DOCUMENT", { issues: validation.issues });

          const revisionId = newId();
          const body = cloneDocument(draft.body);
          body.status = "PUBLISHED";
          body.publishedVersion = draft.revisionNumber;
          const published: PublicPageRevisionRecord = {
            revisionId,
            headId: head.headId,
            revisionNumber: await nextRevisionNumber(tx, head.headId),
            state: "PUBLISHED",
            body,
          };
          await tx.insertRevision(published);
          if (head.publishedRevisionId) {
            await tx.updateRevisionState(head.publishedRevisionId, "SUPERSEDED");
          }
          await tx.updateHead({ ...head, publishedRevisionId: revisionId });
          const stored = await tx.getRevision(revisionId);
          if (!stored) return fail("TRANSACTION_ABORTED");
          return {
            ok: true as const,
            mode: "PUBLISHED" as const,
            ownerUserId: actor.userId,
            profileKind,
            revisionId: stored.revisionId,
            revisionNumber: stored.revisionNumber,
            document: cloneDocument(stored.body),
            ...FLAGS,
          };
        });
      } catch (error) {
        if (error instanceof PublicPageRevisionConflict) return fail("REVISION_CONFLICT", { statusHint: 409 });
        return fail("TRANSACTION_ABORTED");
      }
    },

    async listRevisionHistory(actor, profileKind) {
      if (!actor.userId) return fail("UNAUTHENTICATED");
      return store.transaction(async (tx) => {
        const head = await tx.getHead(actor.userId, profileKind);
        if (!head) return fail("NOT_FOUND");
        const revisions = await tx.listRevisions(head.headId);
        return {
          ok: true as const,
          mode: "HISTORY" as const,
          revisions: revisions
            .slice()
            .sort((a, b) => a.revisionNumber - b.revisionNumber)
            .map((revision) => ({
              revisionId: revision.revisionId,
              revisionNumber: revision.revisionNumber,
              state: revision.state,
              document: cloneDocument(revision.body),
            })),
          ...FLAGS,
        };
      });
    },

    async restoreRevision(actor, profileKind, sourceRevisionId, expectedRevision) {
      if (!actor.userId) return fail("UNAUTHENTICATED");
      try {
        return await store.transaction(async (tx) => {
          const head = await tx.getHead(actor.userId, profileKind);
          if (!head?.draftRevisionId) return fail("NOT_FOUND");
          const current = await tx.getRevision(head.draftRevisionId);
          const source = await tx.getRevision(sourceRevisionId);
          if (!current || !source || source.headId !== head.headId) return fail("NOT_FOUND");
          if (current.revisionNumber !== expectedRevision) throw new PublicPageRevisionConflict();
          const accepted = acceptBody(actor, profileKind, source.body);
          if (!accepted.ok) return accepted;
          const revisionId = newId();
          const body = accepted.body;
          body.documentId = head.headId;
          body.status = "DRAFT";
          body.publishedVersion = null;
          const revision: PublicPageRevisionRecord = {
            revisionId,
            headId: head.headId,
            revisionNumber: await nextRevisionNumber(tx, head.headId),
            state: "DRAFT",
            body,
          };
          await tx.insertRevision(revision);
          await tx.updateHead({ ...head, draftRevisionId: revisionId });
          return draftView(actor.userId, profileKind, revision);
        });
      } catch (error) {
        if (error instanceof PublicPageRevisionConflict) return fail("REVISION_CONFLICT", { statusHint: 409 });
        return fail("TRANSACTION_ABORTED");
      }
    },
  };
}
