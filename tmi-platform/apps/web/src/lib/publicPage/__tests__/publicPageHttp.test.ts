/**
 * Gate C.7 — Public Page HTTP boundary against an injected store.
 * These tests never call getTmiAuth or the default Prisma client.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  FIXTURE_MINIMAL_FAN_PAGE,
  FIXTURE_MINIMAL_PERFORMER_PAGE,
} from "@/lib/publicPage/publicPageFixtures";
import { handlePublicPageRequest, type PublicPageHttpActor, type PublicPageHttpResult } from "@/lib/publicPage/publicPageHttp";
import type { PublicPageDocument, PublicPageProfileKind } from "@/lib/publicPage/publicPageDocument";
import {
  createPublicPagePersistence,
  type PublicPageHeadRecord,
  type PublicPagePersistence,
  type PublicPageRevisionRecord,
  type PublicPageStore,
} from "@/lib/publicPage/publicPagePersistence";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createMemoryStore(): PublicPageStore {
  const heads = new Map<string, PublicPageHeadRecord>();
  const revisions = new Map<string, PublicPageRevisionRecord>();
  const key = (ownerUserId: string, profileKind: string) => `${ownerUserId}\0${profileKind}`;
  const tx = () => ({
    async getHead(ownerUserId: string, profileKind: PublicPageProfileKind) {
      const head = heads.get(key(ownerUserId, profileKind));
      return head ? clone(head) : null;
    },
    async insertHead(head: PublicPageHeadRecord) {
      heads.set(key(head.ownerUserId, head.profileKind), clone(head));
    },
    async updateHead(head: PublicPageHeadRecord) {
      heads.set(key(head.ownerUserId, head.profileKind), clone(head));
    },
    async insertRevision(revision: PublicPageRevisionRecord) {
      revisions.set(revision.revisionId, clone(revision));
    },
    async updateRevisionState(revisionId: string, state: PublicPageRevisionRecord["state"]) {
      const current = revisions.get(revisionId);
      if (!current) throw new Error("MISSING_REVISION");
      revisions.set(revisionId, { ...current, state });
    },
    async getRevision(revisionId: string) {
      const revision = revisions.get(revisionId);
      return revision ? clone(revision) : null;
    },
    async listRevisions(headId: string) {
      return [...revisions.values()].filter((revision) => revision.headId === headId).map((revision) => clone(revision));
    },
  });
  return {
    async transaction(work) {
      const headSnap = clone([...heads.entries()]);
      const revisionSnap = clone([...revisions.entries()]);
      try {
        return await work(tx());
      } catch (error) {
        heads.clear();
        for (const [id, head] of headSnap) heads.set(id, head);
        revisions.clear();
        for (const [id, revision] of revisionSnap) revisions.set(id, revision);
        throw error;
      }
    },
  };
}

function harness() {
  let seq = 0;
  return createPublicPagePersistence(createMemoryStore(), () => `http_${++seq}`);
}

function fan(userId = "user_a"): PublicPageHttpActor {
  return { userId, role: "FAN" };
}

function owned(document: PublicPageDocument, userId: string): PublicPageDocument {
  const copy = clone(document);
  copy.ownerUserId = userId;
  return copy;
}

function textOf(document: PublicPageDocument | undefined) {
  return document?.sections.flatMap((section) => section.blocks).find((block) => block.plainText)?.plainText?.text;
}

async function call(
  persistence: PublicPagePersistence,
  method: "GET" | "POST",
  actor: PublicPageHttpActor | null,
  input: { scope?: string; profileKind?: string; ownerUserId?: string; body?: unknown },
): Promise<PublicPageHttpResult> {
  const searchParams = new URLSearchParams();
  if (input.scope) searchParams.set("scope", input.scope);
  if (input.profileKind) searchParams.set("profileKind", input.profileKind);
  if (input.ownerUserId) searchParams.set("ownerUserId", input.ownerUserId);
  return handlePublicPageRequest(persistence, {
    method,
    actor,
    searchParams,
    body: input.body ?? null,
  });
}

describe("Gate C.7 public page HTTP boundary", () => {
  it("rejects an unauthenticated write", async () => {
    const persistence = harness();
    const result = await call(persistence, "POST", null, {
      body: { op: "create", profileKind: "FAN", document: owned(FIXTURE_MINIMAL_FAN_PAGE, "user_a") },
    });
    expect(result.status).toBe(401);
    expect(result.body.code).toBe("UNAUTHENTICATED");
  });

  it("ignores a forged owner id and leaves the other user unchanged", async () => {
    const persistence = harness();
    const victim = await call(persistence, "POST", fan("user_b"), {
      body: { op: "create", profileKind: "FAN", document: owned(FIXTURE_MINIMAL_FAN_PAGE, "user_b") },
    });
    expect(victim.status).toBe(200);
    const forged = owned(FIXTURE_MINIMAL_FAN_PAGE, "user_b");
    forged.sections[0].blocks[0].plainText = { text: "Forged overwrite" };
    const attack = await call(persistence, "POST", fan("user_a"), {
      body: { op: "create", profileKind: "FAN", ownerUserId: "user_b", document: forged },
    });
    expect(attack.status).toBe(200);
    expect(attack.body.mode).toBe("DRAFT");
    expect((attack.body.document as PublicPageDocument).ownerUserId).toBe("user_a");
    const victimRead = await call(persistence, "GET", fan("user_b"), { scope: "draft", profileKind: "FAN" });
    expect(textOf(victimRead.body.document as PublicPageDocument)).toBe("One poem is a finished page.");
  });

  it("creates, saves, and rejects a stale save with 409", async () => {
    const persistence = harness();
    const created = await call(persistence, "POST", fan(), {
      body: { op: "create", profileKind: "FAN", document: owned(FIXTURE_MINIMAL_FAN_PAGE, "user_a") },
    });
    expect(created.status).toBe(200);
    expect(created.body.mode).toBe("DRAFT");
    const edited = clone(created.body.document as PublicPageDocument);
    edited.sections[0].blocks[0].plainText = { text: "Saved line" };
    const saved = await call(persistence, "POST", fan(), {
      body: { op: "save", profileKind: "FAN", expectedRevision: created.body.revisionNumber, document: edited },
    });
    expect(saved.status).toBe(200);
    expect(textOf(saved.body.document as PublicPageDocument)).toBe("Saved line");
    const stale = await call(persistence, "POST", fan(), {
      body: { op: "save", profileKind: "FAN", expectedRevision: created.body.revisionNumber, document: edited },
    });
    expect(stale.status).toBe(409);
    expect(stale.body.code).toBe("REVISION_CONFLICT");
  });

  it("publishes and rejects a stale publish with 409", async () => {
    const persistence = harness();
    const created = await call(persistence, "POST", fan(), {
      body: { op: "create", profileKind: "FAN", document: owned(FIXTURE_MINIMAL_FAN_PAGE, "user_a") },
    });
    const published = await call(persistence, "POST", fan(), {
      body: { op: "publish", profileKind: "FAN", expectedRevision: created.body.revisionNumber },
    });
    expect(published.status).toBe(200);
    expect(published.body.mode).toBe("PUBLISHED");
    const stale = await call(persistence, "POST", fan(), {
      body: { op: "publish", profileKind: "FAN", expectedRevision: 99 },
    });
    expect(stale.status).toBe(409);
    expect(stale.body.code).toBe("REVISION_CONFLICT");
  });

  it("returns 400 for an invalid document and 403 when a fan sends a performer block", async () => {
    const persistence = harness();
    const invalid = await call(persistence, "POST", fan(), {
      body: { op: "create", profileKind: "FAN", document: { documentPurpose: "NOT_A_PAGE" } },
    });
    expect(invalid.status).toBe(400);
    expect(invalid.body.code).toBe("INVALID_DOCUMENT");
    const denied = await call(persistence, "POST", fan(), {
      body: { op: "create", profileKind: "PERFORMER", document: owned(FIXTURE_MINIMAL_PERFORMER_PAGE, "user_a") },
    });
    expect(denied.status).toBe(403);
    expect(denied.body.code).toBe("CAPABILITY_DENIED");
  });

  it("keeps history and restore owner-only", async () => {
    const persistence = harness();
    const created = await call(persistence, "POST", fan("user_a"), {
      body: { op: "create", profileKind: "FAN", document: owned(FIXTURE_MINIMAL_FAN_PAGE, "user_a") },
    });
    const outsiderHistory = await call(persistence, "GET", fan("user_b"), { scope: "history", profileKind: "FAN" });
    expect(outsiderHistory.status).toBe(404);
    const anonymousHistory = await call(persistence, "GET", null, { scope: "history", profileKind: "FAN" });
    expect(anonymousHistory.status).toBe(401);
    const ownerHistory = await call(persistence, "GET", fan("user_a"), { scope: "history", profileKind: "FAN" });
    expect(ownerHistory.status).toBe(200);
    const revisions = ownerHistory.body.revisions as Array<{ revisionId: string; revisionNumber: number }>;
    expect(revisions).toHaveLength(1);
    const anonymousRestore = await call(persistence, "POST", null, {
      body: {
        op: "restore",
        profileKind: "FAN",
        sourceRevisionId: revisions[0].revisionId,
        expectedRevision: created.body.revisionNumber,
      },
    });
    expect(anonymousRestore.status).toBe(401);
    const outsiderRestore = await call(persistence, "POST", fan("user_b"), {
      body: {
        op: "restore",
        profileKind: "FAN",
        sourceRevisionId: revisions[0].revisionId,
        expectedRevision: 1,
        ownerUserId: "user_a",
      },
    });
    expect(outsiderRestore.status).toBe(404);
    const restored = await call(persistence, "POST", fan("user_a"), {
      body: {
        op: "restore",
        profileKind: "FAN",
        sourceRevisionId: revisions[0].revisionId,
        expectedRevision: created.body.revisionNumber,
      },
    });
    expect(restored.status).toBe(200);
    expect(restored.body.mode).toBe("DRAFT");
    const sourceStill = await call(persistence, "GET", fan("user_a"), { scope: "history", profileKind: "FAN" });
    const source = (sourceStill.body.revisions as Array<{ revisionId: string; state: string }>).find(
      (revision) => revision.revisionId === revisions[0].revisionId,
    );
    expect(source?.state).toBe("DRAFT");
  });

  it("returns published text only and a truthful legacy fallback when nothing is published", async () => {
    const persistence = harness();
    const absent = await call(persistence, "GET", null, {
      scope: "published",
      profileKind: "FAN",
      ownerUserId: "user_a",
    });
    expect(absent.status).toBe(200);
    expect(absent.body.mode).toBe("LEGACY_FALLBACK");
    expect(absent.body).not.toHaveProperty("document");
    const created = await call(persistence, "POST", fan(), {
      body: { op: "create", profileKind: "FAN", document: owned(FIXTURE_MINIMAL_FAN_PAGE, "user_a") },
    });
    const draftOnly = await call(persistence, "GET", null, {
      scope: "published",
      profileKind: "FAN",
      ownerUserId: "user_a",
    });
    expect(draftOnly.body.mode).toBe("LEGACY_FALLBACK");
    expect(draftOnly.body).not.toHaveProperty("document");
    await call(persistence, "POST", fan(), {
      body: { op: "publish", profileKind: "FAN", expectedRevision: created.body.revisionNumber },
    });
    const edited = clone(created.body.document as PublicPageDocument);
    edited.sections[0].blocks[0].plainText = { text: "Private newer draft" };
    const saved = await call(persistence, "POST", fan(), {
      body: { op: "save", profileKind: "FAN", expectedRevision: created.body.revisionNumber, document: edited },
    });
    expect(saved.status).toBe(200);
    const published = await call(persistence, "GET", null, {
      scope: "published",
      profileKind: "FAN",
      ownerUserId: "user_a",
    });
    expect(published.status).toBe(200);
    expect(published.body.mode).toBe("PUBLISHED");
    expect(textOf(published.body.document as PublicPageDocument)).toBe("One poem is a finished page.");
  });

  it("does not mutate public profile config or content", () => {
    const http = readFileSync(join(__dirname, "..", "publicPageHttp.ts"), "utf8");
    const route = readFileSync(join(__dirname, "..", "..", "..", "app", "api", "public-page", "route.ts"), "utf8");
    for (const source of [http, route]) {
      expect(source).not.toMatch(/saveProfileConfig\s*\(/);
      expect(source).not.toMatch(/from ["'][^"']*ProfileConfigService["']/);
      expect(source).not.toMatch(/prisma\.content/);
      expect(source).not.toMatch(/prisma\.publicProfileConfig/);
      expect(source).not.toMatch(/contentRevision\.(create|update|delete|upsert)/);
    }
    expect(http).not.toMatch(/\bprisma\./);
  });
});
