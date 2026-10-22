/**
 * Gate C.6B-1 — mocked persistence proof.
 * The store below is test infrastructure. It is not a production database.
 * Rollback here proves the service contract only, not a Prisma transaction.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  FIXTURE_CANONICAL_BINDING_PAGE,
  FIXTURE_FREEFORM_MAGNET_PAGE,
  FIXTURE_MINIMAL_FAN_PAGE,
  FIXTURE_MINIMAL_PERFORMER_PAGE,
  FIXTURE_RESPONSIVE_PAGE,
  FIXTURE_RICH_MULTIMEDIA_PAGE,
} from "@/lib/publicPage/publicPageFixtures";
import type { PublicPageDocument, PublicPageProfileKind } from "@/lib/publicPage/publicPageDocument";
import {
  createPublicPagePersistence,
  type PublicPageActor,
  type PublicPageHeadRecord,
  type PublicPagePersistence,
  type PublicPageRevisionRecord,
  type PublicPageStore,
} from "@/lib/publicPage/publicPagePersistence";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createMemoryStore(failOnSupersede: () => boolean): PublicPageStore {
  const heads = new Map<string, PublicPageHeadRecord>();
  const revisions = new Map<string, PublicPageRevisionRecord>();
  const key = (ownerUserId: string, profileKind: string) => `${ownerUserId}\0${profileKind}`;

  function tx() {
    return {
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
        if (failOnSupersede() && state === "SUPERSEDED") {
          throw new Error("SIMULATED_PUBLISH_FAILURE");
        }
        const current = revisions.get(revisionId);
        if (!current) throw new Error("MISSING_REVISION");
        revisions.set(revisionId, { ...current, state, body: clone(current.body) });
      },
      async getRevision(revisionId: string) {
        const revision = revisions.get(revisionId);
        return revision ? clone(revision) : null;
      },
      async listRevisions(headId: string) {
        return [...revisions.values()].filter((revision) => revision.headId === headId).map((revision) => clone(revision));
      },
    };
  }

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
  let failSupersede = false;
  let seq = 0;
  const persistence = createPublicPagePersistence(createMemoryStore(() => failSupersede), () => `id_${++seq}`);
  return {
    persistence,
    armPublishFailure() {
      failSupersede = true;
    },
  };
}

function actor(userId: string, capabilities: PublicPageActor["capabilities"] = ["BASE"]): PublicPageActor {
  return { userId, capabilities };
}

function owned(document: PublicPageDocument, userId: string, profileKind: PublicPageProfileKind = document.profileKind): PublicPageDocument {
  const copy = clone(document);
  copy.ownerUserId = userId;
  copy.profileKind = profileKind;
  return copy;
}

function quotesOf(document: PublicPageDocument) {
  return document.sections.flatMap((section) => section.blocks).filter((block) => block.kind === "QUOTE");
}

function tracksOf(document: PublicPageDocument) {
  return document.sections.flatMap((section) => section.blocks).filter((block) => block.kind === "TRACK");
}

async function createFan(persistence: PublicPagePersistence, userId: string, document: PublicPageDocument) {
  return persistence.createDraft(actor(userId), "FAN", owned(document, userId, "FAN"));
}

describe("Gate C.6B-1 mocked public page persistence", () => {
  it("01 creates one draft and no published pointer", async () => {
    const { persistence } = harness();
    const created = await createFan(persistence, "user_a", FIXTURE_MINIMAL_FAN_PAGE);
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.mode).toBe("DRAFT");
    expect(created.revisionNumber).toBe(1);
    const published = await persistence.getPublishedPage({ ownerUserId: "user_a", profileKind: "FAN", visitorMayRead: true });
    expect(published).toMatchObject({ ok: true, mode: "LEGACY_FALLBACK" });
  });

  it("02 returns legacy fallback and does not write config when nothing is published", async () => {
    const { persistence } = harness();
    const published = await persistence.getPublishedPage({ ownerUserId: "user_a", profileKind: "FAN", visitorMayRead: true });
    expect(published).toEqual({
      ok: true,
      mode: "LEGACY_FALLBACK",
      ownerUserId: "user_a",
      profileKind: "FAN",
      touchesPublicProfileConfig: false,
      databaseCascadePhysicallyTested: false,
    });
  });

  it("03 keeps two quotes independent across save and reload", async () => {
    const { persistence } = harness();
    const userId = "user_quotes";
    const created = await createFan(persistence, userId, FIXTURE_RICH_MULTIMEDIA_PAGE);
    if (!created.ok || created.mode !== "DRAFT") throw new Error("create failed");
    const edited = clone(created.document);
    const quotes = quotesOf(edited);
    quotes[0].plainText = { text: "Alpha quote" };
    quotes[1].plainText = { text: "Beta quote" };
    const saved = await persistence.saveDraft(actor(userId), "FAN", created.revisionNumber, edited);
    expect(saved.ok).toBe(true);
    const reloaded = await persistence.getOwnerDraft(actor(userId), "FAN");
    if (!reloaded.ok || reloaded.mode !== "DRAFT") throw new Error("reload failed");
    expect(quotesOf(reloaded.document).map((block) => block.plainText?.text)).toEqual(["Alpha quote", "Beta quote"]);
    expect(quotesOf(reloaded.document).map((block) => block.id)).toEqual(["blk_quote_a", "blk_quote_b"]);
  });

  it("04 keeps two tracks out of a soundtrack slot", async () => {
    const { persistence } = harness();
    const userId = "user_tracks";
    const created = await createFan(persistence, userId, FIXTURE_RICH_MULTIMEDIA_PAGE);
    if (!created.ok) throw new Error("create failed");
    const reloaded = await persistence.getOwnerDraft(actor(userId), "FAN");
    if (!reloaded.ok || reloaded.mode !== "DRAFT") throw new Error("reload failed");
    expect(tracksOf(reloaded.document).map((block) => block.bindingRef?.recordId)).toEqual(["track_1", "track_2"]);
    expect(reloaded.document).not.toHaveProperty("soundtrack");
  });

  it("05 stores hero inside the document body", async () => {
    const { persistence } = harness();
    const userId = "user_hero";
    const created = await persistence.createDraft(actor(userId), "FAN", owned(FIXTURE_RESPONSIVE_PAGE, userId, "FAN"));
    if (!created.ok || created.mode !== "DRAFT") throw new Error("create failed");
    const published = await persistence.publishDraft(actor(userId), "FAN", created.revisionNumber);
    if (!published.ok || published.mode !== "PUBLISHED") throw new Error("publish failed");
    const hero = published.document.sections.flatMap((section) => section.blocks).find((block) => block.kind === "HERO_BANNER");
    expect(hero?.plainText?.text).toBe("Hero lives in the document, not in profile config.");
    expect(published.touchesPublicProfileConfig).toBe(false);
  });

  it("06 round-trips magnet bounds unchanged", async () => {
    const { persistence } = harness();
    const userId = "user_magnet";
    const created = await createFan(persistence, userId, FIXTURE_FREEFORM_MAGNET_PAGE);
    if (!created.ok || created.mode !== "DRAFT") throw new Error("create failed");
    const reloaded = await persistence.getOwnerDraft(actor(userId), "FAN");
    if (!reloaded.ok || reloaded.mode !== "DRAFT") throw new Error("reload failed");
    const bounds = reloaded.document.sections.flatMap((section) => section.blocks).map((block) => block.bounds);
    expect(bounds).toEqual([
      { x: 4, y: 8, w: 20, h: 12, z: 2, column: "L" },
      { x: 40, y: 6, w: 30, h: 8, z: 3, column: "R" },
    ]);
  });

  it("07 rejects an invalid document and writes nothing", async () => {
    const { persistence } = harness();
    const invalid = owned(FIXTURE_MINIMAL_FAN_PAGE, "user_invalid", "FAN");
    invalid.documentPurpose = "MAGAZINE_ARTICLE";
    const created = await persistence.createDraft(actor("user_invalid"), "FAN", invalid);
    expect(created).toMatchObject({ ok: false, code: "INVALID_DOCUMENT" });
    const published = await persistence.getPublishedPage({ ownerUserId: "user_invalid", profileKind: "FAN", visitorMayRead: true });
    expect(published).toMatchObject({ mode: "LEGACY_FALLBACK" });
    const draft = await persistence.getOwnerDraft(actor("user_invalid"), "FAN");
    expect(draft).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });

  it("08 does not let a different user modify the owner page", async () => {
    const { persistence } = harness();
    const created = await createFan(persistence, "user_owner", FIXTURE_MINIMAL_FAN_PAGE);
    if (!created.ok || created.mode !== "DRAFT") throw new Error("create failed");
    const intruder = await persistence.saveDraft(
      actor("user_other"),
      "FAN",
      created.revisionNumber,
      owned(FIXTURE_MINIMAL_FAN_PAGE, "user_other", "FAN"),
    );
    expect(intruder).toMatchObject({ ok: false, code: "NOT_FOUND" });
    const ownerDraft = await persistence.getOwnerDraft(actor("user_owner"), "FAN");
    if (!ownerDraft.ok || ownerDraft.mode !== "DRAFT") throw new Error("owner reload failed");
    expect(ownerDraft.document.sections[0].blocks[0].plainText?.text).toBe("One poem is a finished page.");
  });

  it("09 rejects a stale expected revision on save", async () => {
    const { persistence } = harness();
    const userId = "user_stale_save";
    const created = await createFan(persistence, userId, FIXTURE_MINIMAL_FAN_PAGE);
    if (!created.ok || created.mode !== "DRAFT") throw new Error("create failed");
    const stale = await persistence.saveDraft(actor(userId), "FAN", created.revisionNumber - 1, created.document);
    expect(stale).toMatchObject({ ok: false, code: "REVISION_CONFLICT", statusHint: 409 });
    const reloaded = await persistence.getOwnerDraft(actor(userId), "FAN");
    expect(reloaded).toMatchObject({ ok: true, revisionNumber: 1 });
  });

  it("10 rejects a stale expected revision on publish", async () => {
    const { persistence } = harness();
    const userId = "user_stale_publish";
    const created = await createFan(persistence, userId, FIXTURE_MINIMAL_FAN_PAGE);
    if (!created.ok || created.mode !== "DRAFT") throw new Error("create failed");
    const stale = await persistence.publishDraft(actor(userId), "FAN", 99);
    expect(stale).toMatchObject({ ok: false, code: "REVISION_CONFLICT", statusHint: 409 });
    const published = await persistence.getPublishedPage({ ownerUserId: userId, profileKind: "FAN", visitorMayRead: true });
    expect(published).toMatchObject({ mode: "LEGACY_FALLBACK" });
  });

  it("11 rolls back a failed publish so the previous published pointer remains", async () => {
    const { persistence, armPublishFailure } = harness();
    const userId = "user_atomic";
    const created = await createFan(persistence, userId, FIXTURE_MINIMAL_FAN_PAGE);
    if (!created.ok || created.mode !== "DRAFT") throw new Error("create failed");
    const first = await persistence.publishDraft(actor(userId), "FAN", created.revisionNumber);
    if (!first.ok || first.mode !== "PUBLISHED") throw new Error("first publish failed");
    const nextBody = clone(created.document);
    nextBody.sections[0].blocks[0].plainText = { text: "Replacement that must not publish." };
    const saved = await persistence.saveDraft(actor(userId), "FAN", created.revisionNumber, nextBody);
    if (!saved.ok || saved.mode !== "DRAFT") throw new Error("save failed");
    armPublishFailure();
    const aborted = await persistence.publishDraft(actor(userId), "FAN", saved.revisionNumber);
    expect(aborted).toMatchObject({ ok: false, code: "TRANSACTION_ABORTED" });
    const published = await persistence.getPublishedPage({ ownerUserId: userId, profileKind: "FAN", visitorMayRead: true });
    if (!published.ok || published.mode !== "PUBLISHED") throw new Error("published read failed");
    expect(published.revisionId).toBe(first.revisionId);
    expect(published.document.sections[0].blocks[0].plainText?.text).toBe("One poem is a finished page.");
    const history = await persistence.listRevisionHistory(actor(userId), "FAN");
    if (!history.ok) throw new Error("history failed");
    expect(history.revisions.find((revision) => revision.revisionId === first.revisionId)?.state).toBe("PUBLISHED");
    expect(history.revisions.some((revision) => revision.document.sections[0].blocks[0].plainText?.text === "Replacement that must not publish." && revision.state === "PUBLISHED")).toBe(false);
  });

  it("12 returns only the published document to a visitor", async () => {
    const { persistence } = harness();
    const userId = "user_public";
    const created = await createFan(persistence, userId, FIXTURE_MINIMAL_FAN_PAGE);
    if (!created.ok || created.mode !== "DRAFT") throw new Error("create failed");
    await persistence.publishDraft(actor(userId), "FAN", created.revisionNumber);
    const visitor = await persistence.getPublishedPage({ ownerUserId: userId, profileKind: "FAN", visitorMayRead: true });
    expect(visitor).toMatchObject({ ok: true, mode: "PUBLISHED" });
  });

  it("13 does not return the private draft to a visitor", async () => {
    const { persistence } = harness();
    const userId = "user_private";
    const created = await createFan(persistence, userId, FIXTURE_MINIMAL_FAN_PAGE);
    if (!created.ok || created.mode !== "DRAFT") throw new Error("create failed");
    await persistence.publishDraft(actor(userId), "FAN", created.revisionNumber);
    const secret = clone(created.document);
    secret.sections[0].blocks[0].plainText = { text: "Private draft sentence." };
    await persistence.saveDraft(actor(userId), "FAN", created.revisionNumber, secret);
    const visitor = await persistence.getPublishedPage({ ownerUserId: userId, profileKind: "FAN", visitorMayRead: true });
    expect(JSON.stringify(visitor)).not.toContain("Private draft sentence.");
    const owner = await persistence.getOwnerDraft(actor(userId), "FAN");
    if (!owner.ok || owner.mode !== "DRAFT") throw new Error("owner draft missing");
    expect(owner.document.sections[0].blocks[0].plainText?.text).toBe("Private draft sentence.");
  });

  it("14 keeps the previous published revision as superseded history", async () => {
    const { persistence } = harness();
    const userId = "user_history";
    const created = await createFan(persistence, userId, FIXTURE_MINIMAL_FAN_PAGE);
    if (!created.ok || created.mode !== "DRAFT") throw new Error("create failed");
    const first = await persistence.publishDraft(actor(userId), "FAN", created.revisionNumber);
    if (!first.ok) throw new Error("publish failed");
    const nextBody = clone(created.document);
    nextBody.sections[0].blocks[0].plainText = { text: "Second published poem." };
    const saved = await persistence.saveDraft(actor(userId), "FAN", created.revisionNumber, nextBody);
    if (!saved.ok || saved.mode !== "DRAFT") throw new Error("save failed");
    const second = await persistence.publishDraft(actor(userId), "FAN", saved.revisionNumber);
    expect(second.ok).toBe(true);
    const history = await persistence.listRevisionHistory(actor(userId), "FAN");
    if (!history.ok) throw new Error("history failed");
    const previous = history.revisions.find((revision) => revision.revisionId === first.revisionId);
    expect(previous?.state).toBe("SUPERSEDED");
    expect(previous?.document.sections[0].blocks[0].plainText?.text).toBe("One poem is a finished page.");
  });

  it("15 restores into a new revision and leaves the historical source unchanged", async () => {
    const { persistence } = harness();
    const userId = "user_restore";
    const created = await createFan(persistence, userId, FIXTURE_MINIMAL_FAN_PAGE);
    if (!created.ok || created.mode !== "DRAFT") throw new Error("create failed");
    const first = await persistence.publishDraft(actor(userId), "FAN", created.revisionNumber);
    if (!first.ok || first.mode !== "PUBLISHED") throw new Error("publish failed");
    const nextBody = clone(created.document);
    nextBody.sections[0].blocks[0].plainText = { text: "Later draft." };
    const saved = await persistence.saveDraft(actor(userId), "FAN", created.revisionNumber, nextBody);
    if (!saved.ok || saved.mode !== "DRAFT") throw new Error("save failed");
    await persistence.publishDraft(actor(userId), "FAN", saved.revisionNumber);
    const before = await persistence.listRevisionHistory(actor(userId), "FAN");
    if (!before.ok) throw new Error("history failed");
    const source = before.revisions.find((revision) => revision.revisionId === first.revisionId);
    if (!source) throw new Error("source missing");
    const sourceSnapshot = clone(source);
    const current = await persistence.getOwnerDraft(actor(userId), "FAN");
    if (!current.ok || current.mode !== "DRAFT") throw new Error("draft missing");
    const restored = await persistence.restoreRevision(actor(userId), "FAN", source.revisionId, current.revisionNumber);
    if (!restored.ok || restored.mode !== "DRAFT") throw new Error("restore failed");
    expect(restored.revisionId).not.toBe(source.revisionId);
    expect(restored.document.sections[0].blocks[0].plainText?.text).toBe("One poem is a finished page.");
    const after = await persistence.listRevisionHistory(actor(userId), "FAN");
    if (!after.ok) throw new Error("history missing");
    expect(after.revisions.find((revision) => revision.revisionId === source.revisionId)).toEqual(sourceSnapshot);
  });

  it("16 rejects a performer booking block for a base-only actor", async () => {
    const { persistence } = harness();
    const userId = "user_base";
    const created = await persistence.createDraft(
      actor(userId, ["BASE"]),
      "PERFORMER",
      owned(FIXTURE_MINIMAL_PERFORMER_PAGE, userId, "PERFORMER"),
    );
    expect(created).toMatchObject({ ok: false, code: "CAPABILITY_DENIED" });
    const published = await persistence.getPublishedPage({ ownerUserId: userId, profileKind: "PERFORMER", visitorMayRead: true });
    expect(published).toMatchObject({ mode: "LEGACY_FALLBACK" });
    const draft = await persistence.getOwnerDraft(actor(userId), "PERFORMER");
    expect(draft).toMatchObject({ ok: false, code: "NOT_FOUND" });
  });

  it("17 stores bindings as authority plus record id", async () => {
    const { persistence } = harness();
    const userId = "user_bind";
    const created = await persistence.createDraft(
      actor(userId, ["BASE", "PERFORMER"]),
      "PERFORMER",
      owned(FIXTURE_CANONICAL_BINDING_PAGE, userId, "PERFORMER"),
    );
    if (!created.ok || created.mode !== "DRAFT") throw new Error("create failed");
    const playlist = created.document.sections.flatMap((section) => section.blocks).find((block) => block.kind === "PLAYLIST");
    expect(playlist?.bindingRef).toEqual({ authority: "PLAYLIST", recordId: "playlist_9", snapshotPolicy: "LIVE_RESOLVE" });
    expect(playlist?.bindingRef).not.toHaveProperty("title");
    expect(playlist?.bindingRef).not.toHaveProperty("audioUrl");
  });

  it("18 does not bypass a denied visitor policy and does not claim a database cascade", async () => {
    const { persistence } = harness();
    const userId = "user_hidden";
    const created = await createFan(persistence, userId, FIXTURE_MINIMAL_FAN_PAGE);
    if (!created.ok || created.mode !== "DRAFT") throw new Error("create failed");
    await persistence.publishDraft(actor(userId), "FAN", created.revisionNumber);
    const denied = await persistence.getPublishedPage({ ownerUserId: userId, profileKind: "FAN", visitorMayRead: false });
    expect(denied).toMatchObject({
      ok: false,
      code: "POLICY_DENIED",
      touchesPublicProfileConfig: false,
      databaseCascadePhysicallyTested: false,
    });
    expect(denied).not.toHaveProperty("document");
  });

  it("19 does not call or mutate public profile config", async () => {
    const source = readFileSync(join(__dirname, "..", "publicPagePersistence.ts"), "utf8");
    expect(source).not.toMatch(/saveProfileConfig\s*\(/);
    expect(source).not.toMatch(/from ["'][^"']*ProfileConfigService["']/);
    expect(source).not.toMatch(/from ["'][^"']*schema\.prisma["']/);
    expect(source).not.toMatch(/\bprisma\./);
    const { persistence } = harness();
    const userId = "user_config";
    const created = await createFan(persistence, userId, FIXTURE_MINIMAL_FAN_PAGE);
    if (!created.ok || created.mode !== "DRAFT") throw new Error("create failed");
    const published = await persistence.publishDraft(actor(userId), "FAN", created.revisionNumber);
    expect(created.touchesPublicProfileConfig).toBe(false);
    expect(published).toMatchObject({ touchesPublicProfileConfig: false });
  });

  it("20 is accompanied by the existing public-page regression files", () => {
    const suiteDir = __dirname;
    for (const name of ["validatePublicPageDocument.test.ts", "presentPublicPageDocument.test.ts", "editPublicPageDraft.test.ts"]) {
      expect(readFileSync(join(suiteDir, name), "utf8").length).toBeGreaterThan(0);
    }
  });
});
