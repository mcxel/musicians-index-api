/**
 * Completion Pass 1 — real non-production PostgreSQL proofs for C.6B-3.
 * Connects only to a loopback database that already has public_page_heads.
 * Does not read DATABASE_URL.
 */

import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Client } from "pg";
import { Pool } from "pg";

import {
  FIXTURE_CANONICAL_BINDING_PAGE,
  FIXTURE_FREEFORM_MAGNET_PAGE,
  FIXTURE_INVALID_DOCUMENTS,
  FIXTURE_MINIMAL_FAN_PAGE,
  FIXTURE_MINIMAL_PERFORMER_PAGE,
  FIXTURE_RESPONSIVE_PAGE,
  FIXTURE_RICH_MULTIMEDIA_PAGE,
} from "@/lib/publicPage/publicPageFixtures";
import type { PublicPageDocument } from "@/lib/publicPage/publicPageDocument";
import {
  createPublicPagePersistence,
  type PublicPageActor,
  type PublicPageStore,
  type PublicPageStoreTx,
} from "@/lib/publicPage/publicPagePersistence";
import { createPrismaPublicPageStore } from "@/lib/publicPage/publicPagePrismaStore";

function copy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function composeLocalAuth(): { user: string; password: string } {
  const file = path.resolve(__dirname, "../../../../../../infrastructure/docker/docker-compose.yml");
  const text = readFileSync(file, "utf8");
  const user = text.match(/POSTGRES_USER:\s*(\S+)/)?.[1];
  const password = text.match(/POSTGRES_PASSWORD:\s*(\S+)/)?.[1];
  if (!user || !password) throw new Error("LOCAL_COMPOSE_AUTH_MISSING");
  return { user, password };
}

async function discoverLoopbackDatabase(): Promise<string> {
  const auth = composeLocalAuth();
  const admin = new Client({ host: "127.0.0.1", port: 5432, user: auth.user, password: auth.password, database: "postgres" });
  await admin.connect();
  try {
    const names = await admin.query<{ datname: string }>(
      "SELECT datname FROM pg_database WHERE datistemplate = false AND datname <> 'postgres' ORDER BY datname",
    );
    const matches: string[] = [];
    for (const row of names.rows) {
      const probe = new Client({
        host: "127.0.0.1",
        port: 5432,
        user: auth.user,
        password: auth.password,
        database: row.datname,
      });
      await probe.connect();
      try {
        const addr = await probe.query<{ host: string | null }>("SELECT host(inet_server_addr()) AS host");
        const host = addr.rows[0]?.host;
        if (host !== "127.0.0.1" && host !== "::1") throw new Error("LOCAL_TARGET_NOT_LOOPBACK");
        const ready = await probe.query(
          "SELECT to_regclass('public.\"User\"') AS user_table, to_regclass('public.public_page_heads') AS heads",
        );
        if (ready.rows[0]?.user_table && ready.rows[0]?.heads) matches.push(row.datname);
      } catch (error) {
        const code = (error as { code?: string }).code;
        if (code !== "42501" && code !== "3D000") throw error;
      } finally {
        await probe.end();
      }
    }
    if (matches.length !== 1) throw new Error(`LOCAL_TARGET_COUNT_${matches.length}`);
    return `postgresql://${encodeURIComponent(auth.user)}:${encodeURIComponent(auth.password)}@127.0.0.1:5432/${encodeURIComponent(matches[0])}`;
  } finally {
    await admin.end();
  }
}

let prisma: PrismaClient;
let persistence: ReturnType<typeof createPublicPagePersistence>;
const createdUsers: string[] = [];

function actor(userId: string, capabilities: PublicPageActor["capabilities"] = ["BASE"]): PublicPageActor {
  return { userId, capabilities };
}

async function makeUser(): Promise<string> {
  const id = `pp_${randomBytes(8).toString("hex")}`;
  await prisma.$executeRaw`INSERT INTO "User" (id, email) VALUES (${id}, ${`${id}@public-page-proof.invalid`})`;
  createdUsers.push(id);
  return id;
}

async function deleteUser(id: string): Promise<void> {
  await prisma.$executeRaw`DELETE FROM "User" WHERE id = ${id}`;
}

async function legacyCounts(): Promise<{ content: number | null; revision: number | null; config: number | null }> {
  const present = await prisma.$queryRawUnsafe<Array<{ content: string | null; revision: string | null; config: string | null }>>(
    `SELECT to_regclass('public."Content"')::text AS content,
            to_regclass('public."ContentRevision"')::text AS revision,
            to_regclass('public."PublicProfileConfig"')::text AS config`,
  );
  async function count(table: string | null): Promise<number | null> {
    if (!table) return null;
    const rows = await prisma.$queryRawUnsafe<Array<{ n: bigint }>>(`SELECT COUNT(*)::bigint AS n FROM ${table}`);
    return Number(rows[0]?.n ?? 0);
  }
  return {
    content: await count(present[0]?.content ?? null),
    revision: await count(present[0]?.revision ?? null),
    config: await count(present[0]?.config ?? null),
  };
}

let legacyBefore: { content: number | null; revision: number | null; config: number | null };

beforeAll(async () => {
  const connectionString = await discoverLoopbackDatabase();
  const pool = new Pool({ connectionString, host: "127.0.0.1" });
  prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  persistence = createPublicPagePersistence(createPrismaPublicPageStore(prisma), () => `pp_${randomBytes(8).toString("hex")}`);
  legacyBefore = await legacyCounts();
}, 30000);

afterAll(async () => {
  for (const id of createdUsers) {
    await prisma.$executeRaw`DELETE FROM "User" WHERE id = ${id}`.catch(() => undefined);
  }
  const legacyAfter = await legacyCounts();
  expect(legacyAfter).toEqual(legacyBefore);
  await prisma.$disconnect();
});

describe("C.6B-3 real non-production persistence", () => {
  it("1 creates one draft atomically", async () => {
    const userId = await makeUser();
    const created = await persistence.createDraft(actor(userId), "FAN", copy(FIXTURE_MINIMAL_FAN_PAGE));
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.mode).toBe("DRAFT");
    expect(created.revisionNumber).toBe(1);
    const heads = await prisma.publicPageHead.count({ where: { ownerUserId: userId } });
    const revisions = await prisma.publicPageRevision.count({ where: { head: { ownerUserId: userId } } });
    expect(heads).toBe(1);
    expect(revisions).toBe(1);
  });

  it("2 prevents a duplicate head", async () => {
    const userId = await makeUser();
    const first = await persistence.createDraft(actor(userId), "FAN", copy(FIXTURE_MINIMAL_FAN_PAGE));
    const second = await persistence.createDraft(actor(userId), "FAN", copy(FIXTURE_MINIMAL_FAN_PAGE));
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(second.revisionId).toBe(first.revisionId);
    expect(await prisma.publicPageHead.count({ where: { ownerUserId: userId } })).toBe(1);
  });

  it("3 invalid document leaves no partial write", async () => {
    const userId = await makeUser();
    const before = await prisma.publicPageHead.count({ where: { ownerUserId: userId } });
    const denied = await persistence.createDraft(actor(userId), "FAN", copy(FIXTURE_INVALID_DOCUMENTS.malformedId) as PublicPageDocument);
    expect(denied.ok).toBe(false);
    if (denied.ok) return;
    expect(denied.code).toBe("INVALID_DOCUMENT");
    expect(await prisma.publicPageHead.count({ where: { ownerUserId: userId } })).toBe(before);
    expect(await prisma.publicPageRevision.count({ where: { head: { ownerUserId: userId } } })).toBe(0);
  });

  it("4 rejects a stale save", async () => {
    const userId = await makeUser();
    const created = await persistence.createDraft(actor(userId), "FAN", copy(FIXTURE_MINIMAL_FAN_PAGE));
    if (!created.ok) throw new Error(created.code);
    const saved = await persistence.saveDraft(actor(userId), "FAN", created.revisionNumber, copy(FIXTURE_MINIMAL_FAN_PAGE));
    if (!saved.ok) throw new Error(saved.code);
    const stale = await persistence.saveDraft(actor(userId), "FAN", created.revisionNumber, copy(FIXTURE_MINIMAL_FAN_PAGE));
    expect(stale.ok).toBe(false);
    if (stale.ok) return;
    expect(stale.code).toBe("REVISION_CONFLICT");
    expect(stale.statusHint).toBe(409);
  });

  it("5 rejects a stale publish", async () => {
    const userId = await makeUser();
    const created = await persistence.createDraft(actor(userId), "FAN", copy(FIXTURE_MINIMAL_FAN_PAGE));
    if (!created.ok) throw new Error(created.code);
    const saved = await persistence.saveDraft(actor(userId), "FAN", created.revisionNumber, copy(FIXTURE_MINIMAL_FAN_PAGE));
    if (!saved.ok) throw new Error(saved.code);
    const stale = await persistence.publishDraft(actor(userId), "FAN", created.revisionNumber);
    expect(stale.ok).toBe(false);
    if (stale.ok) return;
    expect(stale.code).toBe("REVISION_CONFLICT");
    expect(stale.statusHint).toBe(409);
    const head = await prisma.publicPageHead.findFirst({ where: { ownerUserId: userId } });
    expect(head?.publishedRevisionId).toBeNull();
  });

  it("6 protects concurrent revision uniqueness", async () => {
    const userId = await makeUser();
    const created = await persistence.createDraft(actor(userId), "FAN", copy(FIXTURE_MINIMAL_FAN_PAGE));
    if (!created.ok) throw new Error(created.code);
    const [a, b] = await Promise.all([
      persistence.saveDraft(actor(userId), "FAN", created.revisionNumber, copy(FIXTURE_MINIMAL_FAN_PAGE)),
      persistence.saveDraft(actor(userId), "FAN", created.revisionNumber, copy(FIXTURE_MINIMAL_FAN_PAGE)),
    ]);
    const results = [a, b];
    expect(results.filter((result) => result.ok).length).toBe(1);
    expect(results.filter((result) => !result.ok && (result.code === "REVISION_CONFLICT" || result.code === "TRANSACTION_ABORTED")).length).toBe(1);
    const numbers = await prisma.publicPageRevision.findMany({
      where: { head: { ownerUserId: userId } },
      select: { revisionNumber: true },
    });
    expect(new Set(numbers.map((row) => row.revisionNumber)).size).toBe(numbers.length);
  });

  it("7 and 8 publish atomically and a failed publish keeps the old pointer", async () => {
    const userId = await makeUser();
    const created = await persistence.createDraft(actor(userId), "FAN", copy(FIXTURE_MINIMAL_FAN_PAGE));
    if (!created.ok) throw new Error(created.code);
    const published = await persistence.publishDraft(actor(userId), "FAN", created.revisionNumber);
    expect(published.ok).toBe(true);
    if (!published.ok) return;
    const head = await prisma.publicPageHead.findFirst({ where: { ownerUserId: userId } });
    const publishedId = head?.publishedRevisionId;
    expect(publishedId).toBeTruthy();

    const saved = await persistence.saveDraft(actor(userId), "FAN", created.revisionNumber, copy(FIXTURE_MINIMAL_FAN_PAGE));
    if (!saved.ok) throw new Error(saved.code);
    const inner = createPrismaPublicPageStore(prisma);
    let armed = false;
    const failing: PublicPageStore = {
      transaction(work) {
        return inner.transaction(async (tx) => {
          const wrapped: PublicPageStoreTx = {
            ...tx,
            async updateRevisionState(revisionId, state) {
              await tx.updateRevisionState(revisionId, state);
              if (armed && state === "SUPERSEDED") throw new Error("FORCED_PUBLISH_ROLLBACK");
            },
          };
          return work(wrapped);
        });
      },
    };
    armed = true;
    const rolled = await createPublicPagePersistence(failing, () => `pp_${randomBytes(8).toString("hex")}`).publishDraft(
      actor(userId),
      "FAN",
      saved.revisionNumber,
    );
    expect(rolled.ok).toBe(false);
    const after = await prisma.publicPageHead.findFirst({ where: { ownerUserId: userId } });
    expect(after?.publishedRevisionId).toBe(publishedId);
    const states = await prisma.publicPageRevision.findMany({
      where: { head: { ownerUserId: userId } },
      select: { state: true },
    });
    expect(states.filter((row) => row.state === "PUBLISHED")).toHaveLength(1);
    expect(states.some((row) => row.state === "SUPERSEDED")).toBe(false);
  });

  it("9 republish supersedes the previous published revision", async () => {
    const userId = await makeUser();
    const created = await persistence.createDraft(actor(userId), "FAN", copy(FIXTURE_MINIMAL_FAN_PAGE));
    if (!created.ok) throw new Error(created.code);
    const first = await persistence.publishDraft(actor(userId), "FAN", created.revisionNumber);
    if (!first.ok) throw new Error(first.code);
    const saved = await persistence.saveDraft(actor(userId), "FAN", created.revisionNumber, copy(FIXTURE_MINIMAL_FAN_PAGE));
    if (!saved.ok) throw new Error(saved.code);
    const second = await persistence.publishDraft(actor(userId), "FAN", saved.revisionNumber);
    expect(second.ok).toBe(true);
    const previous = await prisma.publicPageRevision.findUnique({ where: { id: first.revisionId } });
    expect(previous?.state).toBe("SUPERSEDED");
  });

  it("10 and 11 public read returns published only", async () => {
    const userId = await makeUser();
    const created = await persistence.createDraft(actor(userId), "FAN", copy(FIXTURE_MINIMAL_FAN_PAGE));
    if (!created.ok) throw new Error(created.code);
    const draftOnly = await persistence.getPublishedPage({ ownerUserId: userId, profileKind: "FAN", visitorMayRead: true });
    expect(draftOnly.ok && draftOnly.mode).toBe("LEGACY_FALLBACK");
    const published = await persistence.publishDraft(actor(userId), "FAN", created.revisionNumber);
    if (!published.ok) throw new Error(published.code);
    const saved = await persistence.saveDraft(actor(userId), "FAN", created.revisionNumber, copy(FIXTURE_RICH_MULTIMEDIA_PAGE));
    if (!saved.ok) throw new Error(saved.code);
    const visible = await persistence.getPublishedPage({ ownerUserId: userId, profileKind: "FAN", visitorMayRead: true });
    expect(visible.ok && visible.mode).toBe("PUBLISHED");
    if (!visible.ok || visible.mode !== "PUBLISHED") return;
    expect(visible.revisionId).toBe(published.revisionId);
    expect(visible.document.status).toBe("PUBLISHED");
    expect(JSON.stringify(visible.document)).not.toContain("First quote.");
  });

  it("12 and 13 restore creates a new revision and leaves the source unchanged", async () => {
    const userId = await makeUser();
    const created = await persistence.createDraft(actor(userId), "FAN", copy(FIXTURE_MINIMAL_FAN_PAGE));
    if (!created.ok) throw new Error(created.code);
    const sourceBefore = await prisma.publicPageRevision.findUnique({ where: { id: created.revisionId } });
    const saved = await persistence.saveDraft(actor(userId), "FAN", created.revisionNumber, copy(FIXTURE_RICH_MULTIMEDIA_PAGE));
    if (!saved.ok) throw new Error(saved.code);
    const restored = await persistence.restoreRevision(actor(userId), "FAN", created.revisionId, saved.revisionNumber);
    expect(restored.ok).toBe(true);
    if (!restored.ok) return;
    expect(restored.revisionId).not.toBe(created.revisionId);
    const sourceAfter = await prisma.publicPageRevision.findUnique({ where: { id: created.revisionId } });
    expect(sourceAfter?.state).toBe(sourceBefore?.state);
    expect(sourceAfter?.body).toEqual(sourceBefore?.body);
  });

  it("14 isolates owners", async () => {
    const owner = await makeUser();
    const other = await makeUser();
    const created = await persistence.createDraft(actor(owner), "FAN", copy(FIXTURE_MINIMAL_FAN_PAGE));
    if (!created.ok) throw new Error(created.code);
    const foreign = await persistence.getOwnerDraft(actor(other), "FAN");
    expect(foreign.ok).toBe(false);
    if (foreign.ok) return;
    expect(foreign.code).toBe("NOT_FOUND");
  });

  it("15 denies BOOKING_CTA without performer capability", async () => {
    const userId = await makeUser();
    const created = await persistence.createDraft(actor(userId, ["BASE"]), "PERFORMER", copy(FIXTURE_MINIMAL_PERFORMER_PAGE));
    expect(created.ok).toBe(false);
    if (created.ok) return;
    expect(created.code).toBe("CAPABILITY_DENIED");
    expect(await prisma.publicPageHead.count({ where: { ownerUserId: userId } })).toBe(0);
  });

  it("16 and 17 keep two quotes and two tracks", async () => {
    const userId = await makeUser();
    const created = await persistence.createDraft(actor(userId), "FAN", copy(FIXTURE_RICH_MULTIMEDIA_PAGE));
    if (!created.ok) throw new Error(created.code);
    const blocks = created.document.sections.flatMap((section) => section.blocks);
    expect(blocks.filter((block) => block.kind === "QUOTE")).toHaveLength(2);
    expect(blocks.filter((block) => block.kind === "TRACK")).toHaveLength(2);
  });

  it("18 keeps HERO as document data", async () => {
    const userId = await makeUser();
    const created = await persistence.createDraft(actor(userId), "FAN", copy(FIXTURE_RESPONSIVE_PAGE));
    if (!created.ok) throw new Error(created.code);
    expect(created.document.sections.some((section) => section.kind === "HERO")).toBe(true);
  });

  it("19 round-trips magnet bounds", async () => {
    const userId = await makeUser();
    const created = await persistence.createDraft(actor(userId), "FAN", copy(FIXTURE_FREEFORM_MAGNET_PAGE));
    if (!created.ok) throw new Error(created.code);
    const loaded = await persistence.getOwnerDraft(actor(userId), "FAN");
    if (!loaded.ok) throw new Error(loaded.code);
    const magnet = loaded.document.sections.flatMap((section) => section.blocks).find((block) => block.id === "blk_magnet_a");
    expect(magnet?.bounds).toEqual({ x: 4, y: 8, w: 20, h: 12, z: 2, column: "L" });
  });

  it("20 keeps bindings as authority plus recordId", async () => {
    const userId = await makeUser();
    const created = await persistence.createDraft(actor(userId, ["PERFORMER"]), "PERFORMER", copy(FIXTURE_CANONICAL_BINDING_PAGE));
    if (!created.ok) throw new Error(created.code);
    const bindings = created.document.sections.flatMap((section) => section.blocks).map((block) => block.bindingRef).filter(Boolean);
    expect(bindings.length).toBeGreaterThan(0);
    for (const binding of bindings) {
      expect(binding && "authority" in binding && "recordId" in binding).toBe(true);
      expect(JSON.stringify(binding)).not.toMatch(/title|url|mediaUrl|payload/i);
    }
  });

  it("21 user delete cascades disposable public-page rows", async () => {
    const userId = await makeUser();
    const created = await persistence.createDraft(actor(userId), "FAN", copy(FIXTURE_MINIMAL_FAN_PAGE));
    if (!created.ok) throw new Error(created.code);
    await deleteUser(userId);
    expect(await prisma.publicPageHead.count({ where: { ownerUserId: userId } })).toBe(0);
    expect(await prisma.publicPageRevision.count({ where: { id: created.revisionId } })).toBe(0);
  });

  it("22 head delete cascades revisions", async () => {
    const userId = await makeUser();
    const created = await persistence.createDraft(actor(userId), "FAN", copy(FIXTURE_MINIMAL_FAN_PAGE));
    if (!created.ok) throw new Error(created.code);
    await prisma.publicPageHead.deleteMany({ where: { ownerUserId: userId } });
    expect(await prisma.publicPageRevision.count({ where: { id: created.revisionId } })).toBe(0);
  });

  it("23 pointer deletion sets the draft pointer null", async () => {
    const userId = await makeUser();
    const created = await persistence.createDraft(actor(userId), "FAN", copy(FIXTURE_MINIMAL_FAN_PAGE));
    if (!created.ok) throw new Error(created.code);
    await prisma.publicPageRevision.delete({ where: { id: created.revisionId } });
    const head = await prisma.publicPageHead.findFirst({ where: { ownerUserId: userId } });
    expect(head?.draftRevisionId).toBeNull();
  });

  it("24 and 25 leave legacy Content and PublicProfileConfig untouched", async () => {
    expect(legacyBefore.content).toBeNull();
    expect(legacyBefore.revision).toBeNull();
    expect(legacyBefore.config).toBeNull();
  });
});
