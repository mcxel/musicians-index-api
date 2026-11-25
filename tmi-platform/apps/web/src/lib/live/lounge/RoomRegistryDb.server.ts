/** SERVER-ONLY: QueueSql over the shared Prisma client, for RoomRegistryService. */
import prisma from "@/lib/prisma";
import type { QueueSql } from "@/lib/live/backstage/ChallengerQueueService";

type RawClient = { $queryRawUnsafe<T = unknown>(sql: string, ...values: unknown[]): Promise<T> };

export const prismaRegistrySql: QueueSql = {
  async query<R>(sql: string, params: unknown[] = []) {
    return ((await (prisma as unknown as RawClient).$queryRawUnsafe<R[]>(sql, ...params)) ?? []) as R[];
  },
};
