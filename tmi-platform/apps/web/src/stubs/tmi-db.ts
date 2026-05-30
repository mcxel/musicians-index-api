/**
 * Stub for @tmi/db — returns in-memory no-op client until real Prisma/DB is wired.
 * Wire DATABASE_URL in env + remove this stub once the DB package resolves correctly.
 */

type FindManyArgs = {
  where?: Record<string, unknown>;
  take?: number;
  select?: Record<string, unknown>;
  orderBy?: Record<string, unknown>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stubTable(name: string) {
  return {
    findMany: async (_args?: FindManyArgs): Promise<any[]> => {
      console.warn(`[db stub] ${name}.findMany called — no real DB connected`);
      return [];
    },
    findUnique: async (_args?: Record<string, unknown>): Promise<null> => null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: async (_args?: Record<string, unknown>): Promise<any> => ({}),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: async (_args?: Record<string, unknown>): Promise<any> => ({}),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete: async (_args?: Record<string, unknown>): Promise<any> => ({}),
    count: async (_args?: Record<string, unknown>): Promise<number> => 0,
  };
}

export const db = {
  user:          stubTable("user"),
  artistProfile: stubTable("artistProfile"),
  booking:       stubTable("booking"),
  ticket:        stubTable("ticket"),
  $disconnect:   async () => {},
  $connect:      async () => {},
};

export type { FindManyArgs };
