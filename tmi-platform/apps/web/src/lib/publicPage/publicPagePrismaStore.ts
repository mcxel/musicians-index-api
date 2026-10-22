/**
 * Prisma store for the canonical public-page persistence contract.
 * The service stays in publicPagePersistence.ts. This file only maps that
 * store onto publicPageHead / publicPageRevision.
 */

import type { Prisma, PrismaClient } from "@prisma/client";

import type { PublicPageDocument } from "./publicPageDocument";
import type {
  PublicPageHeadRecord,
  PublicPageRevisionRecord,
  PublicPageRevisionState,
  PublicPageStore,
  PublicPageStoreTx,
} from "./publicPagePersistence";

type PublicPageDb = PrismaClient | Prisma.TransactionClient;

function asDocument(body: Prisma.JsonValue): PublicPageDocument {
  return body as unknown as PublicPageDocument;
}

function mapHead(row: {
  id: string;
  ownerUserId: string;
  profileKind: PublicPageHeadRecord["profileKind"];
  draftRevisionId: string | null;
  publishedRevisionId: string | null;
}): PublicPageHeadRecord {
  return {
    headId: row.id,
    ownerUserId: row.ownerUserId,
    profileKind: row.profileKind,
    draftRevisionId: row.draftRevisionId,
    publishedRevisionId: row.publishedRevisionId,
  };
}

function mapRevision(row: {
  id: string;
  headId: string;
  revisionNumber: number;
  state: PublicPageRevisionState;
  body: Prisma.JsonValue;
}): PublicPageRevisionRecord {
  return {
    revisionId: row.id,
    headId: row.headId,
    revisionNumber: row.revisionNumber,
    state: row.state,
    body: asDocument(row.body),
  };
}

function txFrom(db: PublicPageDb): PublicPageStoreTx {
  return {
    async getHead(ownerUserId, profileKind) {
      const row = await db.publicPageHead.findUnique({
        where: { ownerUserId_profileKind: { ownerUserId, profileKind } },
      });
      return row ? mapHead(row) : null;
    },
    async insertHead(head) {
      await db.publicPageHead.create({
        data: {
          id: head.headId,
          ownerUserId: head.ownerUserId,
          profileKind: head.profileKind,
          draftRevisionId: head.draftRevisionId,
          publishedRevisionId: head.publishedRevisionId,
        },
      });
    },
    async updateHead(head) {
      await db.publicPageHead.update({
        where: { id: head.headId },
        data: {
          draftRevisionId: head.draftRevisionId,
          publishedRevisionId: head.publishedRevisionId,
        },
      });
    },
    async insertRevision(revision) {
      await db.publicPageRevision.create({
        data: {
          id: revision.revisionId,
          headId: revision.headId,
          revisionNumber: revision.revisionNumber,
          state: revision.state,
          body: revision.body as unknown as Prisma.InputJsonValue,
        },
      });
    },
    async updateRevisionState(revisionId, state) {
      await db.publicPageRevision.update({
        where: { id: revisionId },
        data: { state },
      });
    },
    async getRevision(revisionId) {
      const row = await db.publicPageRevision.findUnique({ where: { id: revisionId } });
      return row ? mapRevision(row) : null;
    },
    async listRevisions(headId) {
      const rows = await db.publicPageRevision.findMany({
        where: { headId },
        orderBy: { revisionNumber: "asc" },
      });
      return rows.map(mapRevision);
    },
  };
}

export function createPrismaPublicPageStore(prisma: PrismaClient): PublicPageStore {
  return {
    transaction(work) {
      return prisma.$transaction((tx) => work(txFrom(tx)));
    },
  };
}
