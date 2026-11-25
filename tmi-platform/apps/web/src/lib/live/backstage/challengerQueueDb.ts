/**
 * Production adapters for ChallengerQueueService. SERVER-ONLY.
 * - QueueDb on Prisma: one interactive transaction + pg_advisory_xact_lock per room.
 * - Room context from the live-session registry (never from the request body).
 */

import prisma from "@/lib/prisma";
import { ensureHydrated } from "@/lib/broadcast/GlobalLiveSessionRegistry.server";
import { getSessionByRoomId } from "@/lib/broadcast/globalLiveSessionStore";
import type { QueueDb, QueueRoomContext, QueueSql } from "./ChallengerQueueService";

type RawClient = {
  $queryRawUnsafe<T = unknown>(sql: string, ...values: unknown[]): Promise<T>;
  $executeRawUnsafe(sql: string, ...values: unknown[]): Promise<number>;
};

function sqlOn(client: RawClient): QueueSql {
  return {
    async query<R>(sql: string, params: unknown[] = []) {
      return (await client.$queryRawUnsafe<R[]>(sql, ...params)) ?? [];
    },
  };
}

export const prismaQueueDb: QueueDb = {
  read: sqlOn(prisma as unknown as RawClient),
  async withRoomLock(roomId, fn) {
    return prisma.$transaction(async (tx) => {
      const raw = tx as unknown as RawClient;
      // executeRaw: pg_advisory_xact_lock returns `void`, which queryRaw cannot deserialize.
      await raw.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(hashtext($1))`, `tmi-challenger-queue:${roomId}`);
      return fn(sqlOn(raw));
    });
  },
};

export async function resolveQueueRoomContext(roomId: string): Promise<QueueRoomContext | null> {
  await ensureHydrated().catch(() => undefined);
  const s = getSessionByRoomId(roomId);
  if (!s) return null;
  return {
    roomId,
    hostUserId: s.userId,
    sessionKey: String(s.startedAt),
    category: String(s.category),
    audienceSize: typeof s.viewerCount === "number" ? s.viewerCount : null,
  };
}

/** Postgres "relation does not exist" — the migration has not been applied. */
export function isMissingTableError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /42P01|does not exist/i.test(msg) && /live_(challenger|director|reaction|room_turn|guest_media)/i.test(msg);
}
