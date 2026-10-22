/**
 * C.9 Page Studio and Magnet canvas.
 * Persistence is the in-memory service. No database and no dev server.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

import { FIXTURE_FREEFORM_MAGNET_PAGE, FIXTURE_MINIMAL_FAN_PAGE } from "@/lib/publicPage/publicPageFixtures";
import { canonicalShareOrigin, composePublishedSocialCard, publishedSocialImagePath } from "@/lib/publicPage/publicPageSocialCard";
import { renderPublishedSocialPng } from "@/lib/publicPage/publicPageSocialPng";
import type { PublicPageProfileKind } from "@/lib/publicPage/publicPageDocument";
import { editDraftPlainText } from "@/lib/publicPage/editPublicPageDraft";
import {
  acceptProposal,
  addRepeatableBlock,
  applyMagnetBounds,
  patchBlockStyle,
  raiseMagnetLayer,
  recordEdit,
  redoEdit,
  rotateBlock,
  setBlockEffect,
  setWritingTitle,
  undoEdit,
  bindingAuthorityFor,
  cycleBlockMask,
  addWritingBox,
  applyShape,
  dropObject,
  duplicateBlock,
  fitWritingToText,
  setMediaFrame,
  setMediaViewport,
  setWritingTreatment,
  setWritingFit,
  writingContentPx,
  lowerMagnetLayer,
  pointerDeltaToMagnetPatch,
  clientPointToMagnet,
  centerMagnetOn,
  placeShelf,
  shelfWindow,
  blockAddAllowed,
  createMinimalPublicPage,
  dismissProposal,
  framesForViewport,
  markUnsaved,
  placeAsMagnet,
  proposeHelpLayout,
  publishStudioDraft,
  reloadAfterConflict,
  removeBlock,
  reorderBlock,
  restoreStudioRevision,
  saveStudioDraft,
  sessionFromDraft,
  studioMount,
  studioStatusLabel,
  viewportWidth,
} from "@/lib/publicPage/pageStudio";
import {
  createPublicPagePersistence,
  type PublicPageActor,
  type PublicPageHeadRecord,
  type PublicPagePersistence,
  type PublicPageRevisionRecord,
  type PublicPageStore,
} from "@/lib/publicPage/publicPagePersistence";
import { patternTile, setAtmosphere, setOverlay, setPageSurface, setSectionBackground, setWorldBackground, washTile } from "@/lib/publicPage/publicPageComposition";
import { HEART_CLIP_ID, HEART_CONTOUR_PATH, rectangularCardFrameAllowed } from "@/lib/publicPage/publicPageShapes";
import { validatePublicPageDocument } from "@/lib/publicPage/validatePublicPageDocument";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function memoryStore(): PublicPageStore {
  const heads = new Map<string, PublicPageHeadRecord>();
  const revisions = new Map<string, PublicPageRevisionRecord>();
  const key = (ownerUserId: string, profileKind: string) => `${ownerUserId}\0${profileKind}`;
  return {
    async transaction(work) {
      const headSnap = clone([...heads.entries()]);
      const revisionSnap = clone([...revisions.entries()]);
      try {
        return await work({
          async getHead(ownerUserId, profileKind) {
            const head = heads.get(key(ownerUserId, profileKind));
            return head ? clone(head) : null;
          },
          async insertHead(head) {
            heads.set(key(head.ownerUserId, head.profileKind), clone(head));
          },
          async updateHead(head) {
            heads.set(key(head.ownerUserId, head.profileKind), clone(head));
          },
          async insertRevision(revision) {
            revisions.set(revision.revisionId, clone(revision));
          },
          async updateRevisionState(revisionId, state) {
            const current = revisions.get(revisionId);
            if (!current) throw new Error("MISSING_REVISION");
            revisions.set(revisionId, { ...current, state, body: clone(current.body) });
          },
          async getRevision(revisionId) {
            const revision = revisions.get(revisionId);
            return revision ? clone(revision) : null;
          },
          async listRevisions(headId) {
            return [...revisions.values()].filter((revision) => revision.headId === headId).map((revision) => clone(revision));
          },
        });
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

const ACTOR: PublicPageActor = { userId: "user_fan_1", capabilities: ["BASE"] };
let seq = 0;

function persistence(): PublicPagePersistence {
  return createPublicPagePersistence(memoryStore(), () => `id_${++seq}`);
}

describe("Page Studio and Magnet canvas", () => {
  it("mounts the drawer only for the owner", () => {
    expect(studioMount(false)).toBeNull();
    expect(studioMount(true)).toEqual({ drawer: "YOUR_PAGE" });
    const fan = readFileSync(join(__dirname, "../../../components/profile/FanPublicPage.tsx"), "utf8");
    const performer = readFileSync(join(__dirname, "../../../components/profile/PerformerPublicPage.tsx"), "utf8");
    const shell = readFileSync(join(__dirname, "../../../components/commandCenter/CommandCenterShell.tsx"), "utf8");
    const rail = readFileSync(join(__dirname, "../../../components/commandCenter/HubNavigationRail.tsx"), "utf8");
    expect(fan).not.toContain("<YourPageStudio");
    expect(fan).not.toContain("your-page-open");
    expect(performer).not.toContain("<YourPageStudio");
    expect(performer).not.toContain("your-page-open");
    expect(shell).toContain("<YourPageStudio");
    expect(shell).toContain("showLauncher={false}");
    expect(shell).not.toContain('router.push("/p/');
    expect(rail).toContain("hub-nav-your-page");
    expect(rail).toContain("hub-nav-performer-page");
    expect(rail).toContain("hub-nav-article-editor");
    expect(rail).toContain("hub-nav-magazine");
  });

  it("keeps a failed draft creation explicitly local and retries through createDraft", async () => {
    const store = persistence();
    const unavailable = {
      ok: false as const,
      code: "TRANSACTION_ABORTED" as const,
      touchesPublicProfileConfig: false as const,
      databaseCascadePhysicallyTested: false as const,
    };
    const localDocument = createMinimalPublicPage({
      documentId: "local-fan-draft",
      ownerUserId: ACTOR.userId,
      profileKind: "FAN",
    });
    const local = sessionFromDraft(localDocument, null, ["BASE"]);
    expect(local.persistenceState).toBe("LOCAL");
    expect(local.phase).toBe("LOCAL_DRAFT");
    expect(local.expectedRevision).toBeNull();
    expect(studioStatusLabel(local)).toBe("LOCAL DRAFT (NOT PERSISTED)");

    let attempts = 0;
    const retryPort: PublicPagePersistence = {
      ...store,
      async createDraft(actor, profileKind, document) {
        attempts += 1;
        return attempts === 1 ? unavailable : store.createDraft(actor, profileKind, document);
      },
    };
    const failedRetry = await saveStudioDraft(local, retryPort, ACTOR, "FAN");
    expect(failedRetry.phase).toBe("LOCAL_DRAFT");
    expect(failedRetry.document).toEqual(local.document);
    expect(studioStatusLabel(failedRetry)).toBe("LOCAL DRAFT (NOT PERSISTED)");
    const succeededRetry = await saveStudioDraft(failedRetry, retryPort, ACTOR, "FAN");
    expect(succeededRetry.persistenceState).toBe("SERVER");
    expect(succeededRetry.phase).toBe("DRAFT_SAVED");
    expect(succeededRetry.expectedRevision).toBe(1);
    expect(attempts).toBe(2);
  });

  it("failed server save preserves edits and only a successful retry marks saved", async () => {
    const store = persistence();
    const created = await store.createDraft(ACTOR, "FAN", FIXTURE_MINIMAL_FAN_PAGE);
    if (!created.ok) throw new Error(created.code);
    const edited = markUnsaved(
      sessionFromDraft(created.document, created.revisionNumber, ["BASE"]),
      editDraftPlainText(created.document, "blk_poem", "Unsaved but preserved."),
    );
    const failed: PublicPagePersistence = {
      ...store,
      async saveDraft() {
        return {
          ok: false as const,
          code: "TRANSACTION_ABORTED" as const,
          touchesPublicProfileConfig: false as const,
          databaseCascadePhysicallyTested: false as const,
        };
      },
    };
    const failedSave = await saveStudioDraft(edited, failed, ACTOR, "FAN");
    expect(failedSave.phase).toBe("SAVE_FAILED");
    expect(studioStatusLabel(failedSave)).toBe("Save failed — retry");
    expect(failedSave.document.sections[0].blocks[0].plainText?.text).toBe("Unsaved but preserved.");
    const retrySave = await saveStudioDraft(failedSave, store, ACTOR, "FAN");
    expect(retrySave.phase).toBe("DRAFT_SAVED");
    expect(retrySave.expectedRevision).toBe(created.revisionNumber + 1);
  });

  it("adds repeatable blocks with unique ids", () => {
    const first = addRepeatableBlock(FIXTURE_MINIMAL_FAN_PAGE, "QUOTE", ["BASE"]);
    const second = addRepeatableBlock(first.document, "POEM", ["BASE"]);
    const ids = second.document.sections.flatMap((section) => section.blocks.map((block) => block.id));
    expect(ids).toHaveLength(FIXTURE_MINIMAL_FAN_PAGE.sections[0].blocks.length + 2);
    expect(new Set(ids).size).toBe(ids.length);
    expect(validatePublicPageDocument(second.document).ok).toBe(true);
  });

  it("deletes and reorders without breaking the document", () => {
    const added = addRepeatableBlock(FIXTURE_MINIMAL_FAN_PAGE, "QUOTE", ["BASE"]);
    const quoteId = added.blockId!;
    const reordered = reorderBlock(added.document, quoteId, -1);
    expect(reordered.sections[0].blocks[0].id).toBe(quoteId);
    const removed = removeBlock(reordered, quoteId);
    expect(removed.sections[0].blocks.some((block) => block.id === quoteId)).toBe(false);
    expect(validatePublicPageDocument(removed).ok).toBe(true);
    expect(removeBlock(removed, removed.sections[0].blocks[0].id)).toBe(removed);
  });

  it("updates magnet bounds in memory with snap and clamp", () => {
    const placed = placeAsMagnet(FIXTURE_MINIMAL_FAN_PAGE, "blk_poem", { x: 3, y: 101, w: 7, h: 1, z: 1.2 });
    const moved = applyMagnetBounds(placed, "blk_poem", { x: 10, y: 6 });
    const bounds = moved.sections[0].blocks[0].bounds;
    expect(bounds).toMatchObject({ x: 12, y: 8, w: 8, h: 4, z: 1 });
    const resized = applyMagnetBounds(moved, "blk_poem", { w: 200, x: -20 });
    expect(resized.sections[0].blocks[0].bounds.x).toBe(0);
    expect(resized.sections[0].blocks[0].bounds.w).toBeLessThanOrEqual(96);
    expect(resized).not.toBe(FIXTURE_FREEFORM_MAGNET_PAGE);
    const start = placed.sections[0].blocks[0].bounds;
    const dragged = applyMagnetBounds(
      placed,
      "blk_poem",
      pointerDeltaToMagnetPatch(start, "move", 40, 20, 400, 200),
    );
    expect(dragged.sections[0].blocks[0].bounds.x).toBeGreaterThanOrEqual(0);
    expect(dragged.sections[0].blocks[0].bounds.x % 4).toBe(0);
    const clamped = applyMagnetBounds(
      dragged,
      "blk_poem",
      pointerDeltaToMagnetPatch(dragged.sections[0].blocks[0].bounds, "move", -800, 0, 400, 200),
    );
    expect(clamped.sections[0].blocks[0].bounds.x).toBe(0);
    const grown = applyMagnetBounds(
      clamped,
      "blk_poem",
      pointerDeltaToMagnetPatch(clamped.sections[0].blocks[0].bounds, "resize", 80, 40, 400, 200),
    );
    expect(grown.sections[0].blocks[0].bounds.w).toBeGreaterThan(clamped.sections[0].blocks[0].bounds.w);
    const second = applyMagnetBounds(
      grown,
      "blk_poem",
      pointerDeltaToMagnetPatch(grown.sections[0].blocks[0].bounds, "move", 16, 0, 400, 200),
    );
    expect(second.sections[0].blocks[0].bounds.x).toBeGreaterThan(0);
  });

  it("saves with the current expected revision and marks the draft clean", async () => {
    const store = persistence();
    const created = await store.createDraft(ACTOR, "FAN", FIXTURE_MINIMAL_FAN_PAGE);
    if (!created.ok) throw new Error(created.code);
    const seen: number[] = [];
    const watching: PublicPagePersistence = {
      ...store,
      saveDraft: async (actor, profileKind, expectedRevision, document) => {
        seen.push(expectedRevision);
        return store.saveDraft(actor, profileKind, expectedRevision, document);
      },
    };
    let session = sessionFromDraft(created.document, created.revisionNumber, ["BASE"]);
    session = markUnsaved(session, editDraftPlainText(session.document, "blk_poem", "Edited poem."));
    expect(studioStatusLabel(session)).toBe("Unsaved Changes");
    session = await saveStudioDraft(session, watching, ACTOR, "FAN");
    expect(seen).toEqual([created.revisionNumber]);
    expect(session.phase).toBe("DRAFT_SAVED");
    expect(studioStatusLabel(session)).toBe("Draft Saved");
    expect(session.document.sections[0].blocks[0].plainText?.text).toBe("Edited poem.");
  });

  it("publishes through one persistence swap and shows the published version", async () => {
    const store = persistence();
    const created = await store.createDraft(ACTOR, "FAN", FIXTURE_MINIMAL_FAN_PAGE);
    if (!created.ok) throw new Error(created.code);
    const session = await publishStudioDraft(
      sessionFromDraft(created.document, created.revisionNumber, ["BASE"]),
      store,
      ACTOR,
      "FAN",
    );
    expect(session.phase).toBe("PUBLISHED");
    expect(studioStatusLabel(session)).toBe(`Published (v${session.publishedRevision})`);
    const published = await store.getPublishedPage({ ownerUserId: ACTOR.userId, profileKind: "FAN", visitorMayRead: true });
    expect(published.ok && published.mode === "PUBLISHED").toBe(true);
  });

  it("lists history and restores a copy without rewriting the historical record", async () => {
    const store = persistence();
    const created = await store.createDraft(ACTOR, "FAN", FIXTURE_MINIMAL_FAN_PAGE);
    if (!created.ok) throw new Error(created.code);
    const edited = editDraftPlainText(created.document, "blk_poem", "Later draft.");
    const saved = await store.saveDraft(ACTOR, "FAN", created.revisionNumber, edited);
    if (!saved.ok) throw new Error(saved.code);
    const history = await store.listRevisionHistory(ACTOR, "FAN");
    if (!history.ok) throw new Error(history.code);
    expect(history.revisions.length).toBeGreaterThan(1);
    const source = history.revisions[0];
    const sourceBody = JSON.stringify(source.document);
    const restored = await restoreStudioRevision(
      sessionFromDraft(saved.document, saved.revisionNumber, ["BASE"]),
      store,
      ACTOR,
      "FAN",
      source.revisionId,
    );
    expect(restored.document.sections[0].blocks[0].plainText?.text).toBe("One poem is a finished page.");
    const again = await store.listRevisionHistory(ACTOR, "FAN");
    if (!again.ok) throw new Error(again.code);
    const still = again.revisions.find((revision) => revision.revisionId === source.revisionId);
    expect(JSON.stringify(still?.document)).toBe(sourceBody);
    expect(restored.expectedRevision).not.toBe(source.revisionNumber);
  });

  it("keeps the working draft when the revision is stale and offers reload", async () => {
    const store = persistence();
    const created = await store.createDraft(ACTOR, "FAN", FIXTURE_MINIMAL_FAN_PAGE);
    if (!created.ok) throw new Error(created.code);
    const saved = await store.saveDraft(
      ACTOR,
      "FAN",
      created.revisionNumber,
      editDraftPlainText(created.document, "blk_poem", "Server copy."),
    );
    if (!saved.ok) throw new Error(saved.code);
    const stale = {
      ...sessionFromDraft(saved.document, created.revisionNumber, ["BASE"]),
      document: editDraftPlainText(saved.document, "blk_poem", "Local copy."),
      phase: "UNSAVED" as const,
    };
    const conflicted = await saveStudioDraft(stale, store, ACTOR, "FAN");
    expect(conflicted.phase).toBe("CONFLICT");
    expect(studioStatusLabel(conflicted)).toBe("Conflict (Reload Required)");
    expect(conflicted.document.sections[0].blocks[0].plainText?.text).toBe("Local copy.");
    const fresh = await store.getOwnerDraft(ACTOR, "FAN");
    if (!fresh.ok) throw new Error(fresh.code);
    const reloaded = reloadAfterConflict(conflicted, fresh.document, fresh.revisionNumber);
    expect(reloaded.phase).toBe("DRAFT_SAVED");
    expect(reloaded.document.sections[0].blocks[0].plainText?.text).toBe("Server copy.");
  });

  it("locks performer blocks for a base account", () => {
    expect(blockAddAllowed("BOOKING_CTA", ["BASE"])).toBe(false);
    expect(blockAddAllowed("BOOKING_CTA", ["BASE", "PERFORMER"])).toBe(true);
    const denied = addRepeatableBlock(FIXTURE_MINIMAL_FAN_PAGE, "BOOKING_CTA", ["BASE"], "booking_1");
    expect(denied.added).toBe(false);
    expect(denied.document).toBe(FIXTURE_MINIMAL_FAN_PAGE);
  });

  it("switches viewport simulation without inventing page content", () => {
    const magnet = placeAsMagnet(FIXTURE_MINIMAL_FAN_PAGE, "blk_poem", { x: 12, y: 8, w: 20, h: 12, z: 2 });
    expect(viewportWidth("DESKTOP")).toBe(1200);
    expect(viewportWidth("TABLET")).toBe(768);
    expect(viewportWidth("PHONE")).toBe(390);
    const desktop = framesForViewport(magnet, "DESKTOP")[0];
    const phone = framesForViewport(magnet, "PHONE")[0];
    const visitor = framesForViewport(magnet, "VISITOR")[0];
    expect(desktop.stacked).toBe(false);
    expect(desktop.editing).toBe(true);
    expect(desktop.bounds.x).toBe(12);
    expect(phone.stacked).toBe(true);
    expect(visitor.editing).toBe(false);
    expect(magnet.sections[0].blocks[0].bounds.x).toBe(12);
  });

  it("keeps an AI proposal out of the draft until the owner accepts it", () => {
    const proposal = proposeHelpLayout(FIXTURE_MINIMAL_FAN_PAGE);
    expect(proposal).not.toBeNull();
    expect(FIXTURE_MINIMAL_FAN_PAGE.sections[0].blocks[0].placement).toBe("FLOW");
    const session = sessionFromDraft(FIXTURE_MINIMAL_FAN_PAGE, 1, ["BASE"]);
    const proposed = { ...session, proposal };
    expect(proposed.document).toBe(FIXTURE_MINIMAL_FAN_PAGE);
    expect(acceptProposal(proposed).document.sections[0].blocks[0].placement).toBe("MAGNET");
    expect(acceptProposal(proposed).phase).toBe("UNSAVED");
    expect(dismissProposal(proposed).proposal).toBeNull();
    expect(dismissProposal(proposed).document.sections[0].blocks[0].placement).toBe("FLOW");
  });

  it("starts a blank page as the minimal valid document", () => {
    const blank = createMinimalPublicPage({
      documentId: "doc_blank",
      ownerUserId: "user_fan_1",
      profileKind: "FAN" satisfies PublicPageProfileKind,
    });
    expect(validatePublicPageDocument(blank).ok).toBe(true);
    expect(blank.sections[0].blocks[0].plainText?.text).toBe("");
    const studio = readFileSync(join(__dirname, "../pageStudio.ts"), "utf8");
    expect(studio.includes("saveProfileConfig(")).toBe(false);
  });

  it("drops an object as a magnet the owner can move, restyle, layer, and duplicate", () => {
    const photo = dropObject(FIXTURE_MINIMAL_FAN_PAGE, "PHOTO", ["BASE"]);
    expect(photo.added).toBe(false);
    const quote = dropObject(FIXTURE_MINIMAL_FAN_PAGE, "QUOTE", ["BASE"]);
    expect(quote.added).toBe(true);
    const placed = quote.document.sections.flatMap((section) => section.blocks).find((block) => block.id === quote.blockId);
    expect(placed?.placement).toBe("MAGNET");
    expect(placed?.bounds.w).toBe(28);
    const playlist = dropObject(quote.document, "PLAYLIST", ["BASE"], "playlist_fixture");
    expect(playlist.document.sections.flatMap((section) => section.blocks).find((block) => block.kind === "PLAYLIST")?.bindingRef?.authority).toBe("PLAYLIST");
    expect(bindingAuthorityFor("YOPHO")).toBe("YOPHO_CARD");
    const shaped = cycleBlockMask(quote.document, quote.blockId!);
    expect(shaped.sections.flatMap((section) => section.blocks).find((block) => block.id === quote.blockId)?.style.mask).toBe("CIRCLE");
    const raised = dropObject(shaped, "SHAPE", ["BASE"]);
    const heart = raised.document.sections.flatMap((section) => section.blocks).find((block) => block.id === raised.blockId);
    expect(heart?.placement).toBe("MAGNET");
    expect(heart?.style.mask).toBe("CIRCLE");
    expect(heart?.style.backgroundTreatment).toBe("SOLID");
    const back = lowerMagnetLayer(raised.document, raised.blockId!);
    expect(back.sections.flatMap((section) => section.blocks).find((block) => block.id === raised.blockId)?.bounds.z).toBeLessThan(heart!.bounds.z);
    const copy = duplicateBlock(raised.document, raised.blockId!);
    expect(copy.blockId).not.toBe(raised.blockId);
    expect(validatePublicPageDocument(copy.document).ok).toBe(true);
    const fan = readFileSync(join(__dirname, "../../../components/profile/FanPublicPage.tsx"), "utf8");
    const performer = readFileSync(join(__dirname, "../../../components/profile/PerformerPublicPage.tsx"), "utf8");
    expect(fan).toContain("<PublicPageViewerStrip");
    expect(performer).toContain("<PublicPageViewerStrip");
    expect(readFileSync(join(__dirname, "../../../components/profile/YourPageStudio.tsx"), "utf8")).toContain("dropObject");
  });

  it("uses one writing box for every label and one shape list for every object", () => {
    const happy = addWritingBox(FIXTURE_MINIMAL_FAN_PAGE, ["BASE"], "Happy Days");
    const hearted = addWritingBox(happy.document, ["BASE"], "From My Heart");
    const custom = addWritingBox(hearted.document, ["BASE"], "Things that make me laugh");
    const writings = custom.document.sections.flatMap((section) => section.blocks).filter((block) => block.kind === "LONG_FORM_WRITING");
    expect(writings).toHaveLength(3);
    expect(new Set(writings.map((block) => block.kind)).size).toBe(1);
    expect(writings.map((block) => block.a11y.label)).toEqual(["Happy Days", "From My Heart", "Things that make me laugh"]);
    const id = happy.blockId!;
    const beforeSection = custom.document.sections.find((section) => section.blocks.some((block) => block.id === id));
    const longWriting = "Today was a long day.\n".repeat(200);
    const written = fitWritingToText(custom.document, id, longWriting);
    const grown = written.sections.flatMap((section) => section.blocks).find((block) => block.id === id);
    const grownSection = written.sections.find((section) => section.blocks.some((block) => block.id === id));
    expect(writingContentPx(longWriting, grown!.bounds.w)).toBeGreaterThan(4000);
    expect(grownSection?.minHeightPx).toBe(beforeSection?.minHeightPx);
    expect(grown!.plainText?.text).toBe(longWriting);
    const heart = applyShape(written, id, "HEART");
    const speech = applyShape(heart, id, "SPEECH_BUBBLE");
    const rectangle = applyShape(speech, id, "RECTANGLE");
    const restored = rectangle.sections.flatMap((section) => section.blocks).find((block) => block.id === id);
    expect(restored?.style.mask).toBe("RECTANGLE");
    expect(restored?.plainText?.text).toBe(grown!.plainText?.text);
    expect(restored?.a11y.label).toBe("Happy Days");
    const memory = dropObject(rectangle, "NOTE", ["BASE"]);
    const memoryHeart = applyShape(memory.document, memory.blockId!, "HEART");
    expect(memoryHeart.sections.flatMap((section) => section.blocks).find((block) => block.id === memory.blockId)?.style.mask).toBe("HEART");
    const fixed = setWritingFit(memoryHeart, id, "FIXED");
    const held = fitWritingToText(fixed, id, `${grown!.plainText?.text ?? ""}\nstill here`);
    const heldBlock = held.sections.flatMap((section) => section.blocks).find((block) => block.id === id);
    expect(heldBlock?.bounds.h).toBe(restored?.bounds.h);
    expect(heldBlock?.plainText?.text.endsWith("still here")).toBe(true);
    expect(validatePublicPageDocument(held).ok).toBe(true);
    const studio = readFileSync(join(__dirname, "../../../components/profile/YourPageStudio.tsx"), "utf8");
    expect(studio).toContain("studio-add-writing");
    expect(studio).toContain("studio-shape");
    expect(studio).not.toContain("HeartWritingBox");
    expect(studio).not.toContain("HeartPhoto");
  });

  it("clips a photo with a shape without cutting the canonical file", () => {
    const placed = dropObject(FIXTURE_MINIMAL_FAN_PAGE, "PHOTO", ["BASE"], "img_portrait_7721");
    expect(placed.added).toBe(true);
    const id = placed.blockId!;
    const heart = applyShape(placed.document, id, "HEART");
    const framed = setMediaViewport(heart, id, { mediaFit: "FREE", mediaZoom: 1.8, mediaFocalX: 0.2, mediaFocalY: 0.32 });
    const neon = setMediaFrame(framed, id, "NEON");
    const block = neon.sections.flatMap((section) => section.blocks).find((item) => item.id === id);
    expect(block?.bindingRef?.recordId).toBe("img_portrait_7721");
    expect(block?.style.mask).toBe("HEART");
    expect(block?.style.mediaZoom).toBe(1.8);
    expect(block?.style.mediaFocalX).toBe(0.2);
    expect(block?.style.framePreset).toBe("NEON");
    expect(block?.plainText).toBeUndefined();
    const circle = applyShape(neon, id, "CIRCLE");
    const swapped = circle.sections.flatMap((section) => section.blocks).find((item) => item.id === id);
    expect(swapped?.style.mask).toBe("CIRCLE");
    expect(swapped?.bindingRef?.recordId).toBe("img_portrait_7721");
    expect(swapped?.style.mediaFocalY).toBe(0.32);
    const back = applyShape(circle, id, "HEART");
    const bare = setMediaFrame(back, id, "NONE");
    const still = bare.sections.flatMap((section) => section.blocks).find((item) => item.id === id);
    expect(still?.style.mask).toBe("HEART");
    expect(still?.style.framePreset).toBe("NONE");
    expect(still?.style.mediaZoom).toBe(1.8);
    expect(validatePublicPageDocument(bare).ok).toBe(true);
    const canvas = readFileSync(join(__dirname, "../../../components/profile/PublicPageCanvas.tsx"), "utf8");
    expect(canvas).toContain("data-cookie-cutter");
    expect(canvas).toContain("clipPath");
    expect(canvas).not.toContain("HeartPhoto");
  });

  it("places a quick-add object on the clicked magnet point and keeps the shelf inside the viewport", () => {
    expect(clientPointToMagnet(100, 50, { left: 0, top: 0, width: 200, height: 100 })).toEqual({ x: 48, y: 48 });
    expect(clientPointToMagnet(-40, 10, { left: 0, top: 0, width: 100, height: 100 }).x).toBe(0);
    expect(clientPointToMagnet(400, 400, { left: 0, top: 0, width: 100, height: 100 })).toEqual({ x: 96, y: 96 });
    const dropped = dropObject(FIXTURE_MINIMAL_FAN_PAGE, "SHAPE", ["BASE"]);
    const shaped = applyShape(dropped.document, dropped.blockId!, "HEART");
    const centered = centerMagnetOn(shaped, dropped.blockId!, 48, 48);
    const heart = centered.sections.flatMap((section) => section.blocks).find((block) => block.id === dropped.blockId);
    expect(heart?.style.mask).toBe("HEART");
    expect(heart?.bounds.x).toBe(40);
    expect(heart?.bounds.y).toBe(40);
    const edge = centerMagnetOn(shaped, dropped.blockId!, 0, 0);
    const clamped = edge.sections.flatMap((section) => section.blocks).find((block) => block.id === dropped.blockId);
    expect(clamped?.bounds.x).toBe(0);
    expect(clamped?.bounds.y).toBe(0);
    const flipped = placeShelf(390, 780, 216, 248, 400, 800);
    expect(flipped.left + 216).toBeLessThanOrEqual(400 - 8);
    expect(flipped.top + 248).toBeLessThanOrEqual(800 - 8);
    expect(flipped.left).toBeGreaterThanOrEqual(8);
    const corner = placeShelf(0, 0, 216, 248, 390, 844);
    expect(corner.left).toBe(8);
    expect(corner.top).toBe(8);
    const shapes = shelfWindow(["RECTANGLE", "CIRCLE", "HEART", "STAR", "DIAMOND", "HEXAGON"], 1, 4);
    expect(shapes.pages).toBe(2);
    expect(shapes.items).toEqual(["DIAMOND", "HEXAGON"]);
    const studio = readFileSync(join(__dirname, "../../../components/profile/YourPageStudio.tsx"), "utf8");
    const shelf = readFileSync(join(__dirname, "../../../components/profile/QuickAddShelf.tsx"), "utf8");
    expect(studio).toContain("onCanvasPlace");
    expect(studio).toContain("studio-workspace-toggle");
    expect(studio).toContain("view-your-page");
    expect(studio).toContain("canonicalPublicPath");
    const articleSection = readFileSync(join(__dirname, "../../../components/drawers/PerformerBioMagazineDrawer.tsx"), "utf8");
    expect(articleSection).toContain("view-performer-spread");
    expect(articleSection).toContain("magazineReaderArticleUrl");
    expect(articleSection).not.toContain("wavetek-rise-billboard");
    const savedAt = articleSection.indexOf('setSaveStatus("saved")');
    const okAt = articleSection.lastIndexOf("if (res.ok)", savedAt);
    expect(okAt).toBeGreaterThan(-1);
    expect(savedAt).toBeGreaterThan(okAt);
    expect(articleSection.slice(okAt, savedAt)).not.toContain('setSaveStatus("saved")');
    expect(articleSection).toContain('setSaveStatus("failed")');
    expect(studio).not.toContain("QuickAddDocument2");
    expect(shelf).toContain("quick-add-back");
    expect(shelf).not.toContain("HeartWritingBox");
  });

  it("builds a second page from a blank document with member commands, then restyles that same page", async () => {
    const blank = createMinimalPublicPage({
      documentId: "doc_c9e_blank",
      ownerUserId: "user_fan_c9e",
      profileKind: "FAN" satisfies PublicPageProfileKind,
    });
    const originalId = blank.sections[0].blocks[0].id;
    const writing = addWritingBox(blank, ["BASE"], "Night Notes");
    const photo = dropObject(writing.document, "PHOTO", ["BASE"], "img_member_portrait");
    const sticker = dropObject(photo.document, "STICKER", ["BASE"]);
    expect(writing.added && photo.added && sticker.added).toBe(true);
    let doc = setPageSurface(sticker.document, "#050510");
    doc = setOverlay(doc, doc.sections[0].sectionId, washTile("tile_scrim", "#140018", 40));
    doc = setBlockEffect(doc, writing.blockId!, "flicker");
    doc = patchBlockStyle(doc, writing.blockId!, { colorHex: "#F4F1FF", fontPairingId: "SCRIPT" });
    doc = setWritingTitle(doc, writing.blockId!, "After Midnight");
    doc = applyShape(doc, photo.blockId!, "HEART");
    doc = setMediaFrame(doc, photo.blockId!, "NEON");
    const photoBefore = doc.sections.flatMap((section) => section.blocks).find((block) => block.id === photo.blockId)!;
    doc = applyMagnetBounds(doc, photo.blockId!, { x: photoBefore.bounds.x + 4, w: photoBefore.bounds.w + 4, h: photoBefore.bounds.h + 4 });
    doc = rotateBlock(doc, photo.blockId!, 8);
    doc = raiseMagnetLayer(doc, photo.blockId!);
    doc = removeBlock(doc, sticker.blockId!);
    const star = dropObject(doc, "SHAPE", ["BASE"]);
    let session = sessionFromDraft(star.document, 1, ["BASE"]);
    session = recordEdit(session, applyShape(session.document, star.blockId!, "STAR"));
    const starred = session.document.sections.flatMap((section) => section.blocks).find((block) => block.id === star.blockId);
    expect(starred?.style.mask).toBe("STAR");
    session = undoEdit(session);
    expect(session.document.sections.flatMap((section) => section.blocks).find((block) => block.id === star.blockId)?.style.mask).toBe("CIRCLE");
    session = redoEdit(session);
    expect(session.document.sections.flatMap((section) => section.blocks).find((block) => block.id === star.blockId)?.style.mask).toBe("STAR");
    const restyled = setPageSurface(
      patchBlockStyle(session.document, writing.blockId!, { colorHex: "#140018", fontPairingId: "DISPLAY" }),
      "#F4F1FF",
    );
    const blocks = restyled.sections.flatMap((section) => section.blocks);
    const note = blocks.find((block) => block.id === writing.blockId);
    const portrait = blocks.find((block) => block.id === photo.blockId);
    const untouched = blocks.find((block) => block.id === originalId);
    expect(note?.a11y.label).toBe("After Midnight");
    expect(note?.style.motionPreset).toBe("flicker");
    expect(note?.style.fontPairingId).toBe("DISPLAY");
    expect(note?.style.colorHex).toBe("#140018");
    expect(untouched?.style.motionPreset).toBeUndefined();
    expect(portrait?.style.mask).toBe("HEART");
    expect(portrait?.style.framePreset).toBe("NEON");
    expect(portrait?.style.rotationDeg).toBe(8);
    expect(portrait?.bounds.x).toBe(photoBefore.bounds.x + 4);
    expect(portrait?.bindingRef?.recordId).toBe("img_member_portrait");
    expect(blocks.some((block) => block.id === sticker.blockId)).toBe(false);
    expect(restyled.theme.surfaceColorHex).toBe("#F4F1FF");
    expect(restyled.sections[0].overlay?.opacity).toBeLessThanOrEqual(70);
    expect(restyled.sections[0].overlay?.blend).toBeUndefined();
    expect(validatePublicPageDocument(restyled).ok).toBe(true);
    const store = persistence();
    const created = await store.createDraft(ACTOR, "FAN", blank);
    if (!created.ok) throw new Error(created.code);
    const saved = await saveStudioDraft(sessionFromDraft(restyled, created.revisionNumber, ["BASE"]), store, ACTOR, "FAN");
    expect(saved.phase).toBe("DRAFT_SAVED");
    expect(saved.document.sections.flatMap((section) => section.blocks).find((block) => block.id === writing.blockId)?.a11y.label).toBe("After Midnight");
    const studio = readFileSync(join(__dirname, "../../../components/profile/YourPageStudio.tsx"), "utf8");
    const canvas = readFileSync(join(__dirname, "../../../components/profile/PublicPageCanvas.tsx"), "utf8");
    for (const control of [
      "studio-flicker-object",
      "studio-glow-object",
      "studio-overlay-opacity",
      "studio-page-color",
      "studio-object-move",
      "studio-object-resize",
      "studio-object-rotate",
      "studio-frame-neon",
      "studio-add-writing",
      "studio-undo",
      "studio-redo",
    ]) {
      expect(studio).toContain(control);
    }
    expect(canvas).toContain('data-layer="overlay"');
    expect(canvas).toContain("zIndex: 2");
    expect(canvas).toContain('data-cookie-cutter="true"');
  });

  it("closes the creator parity gaps and builds six different pages from blank commands", () => {
    const studio = readFileSync(join(__dirname, "../../../components/profile/YourPageStudio.tsx"), "utf8");
    const canvas = readFileSync(join(__dirname, "../../../components/profile/PublicPageCanvas.tsx"), "utf8");
    for (const control of [
      "studio-frame-polaroid",
      "studio-frame-card",
      "studio-scene-",
      "studio-fill-transparent",
      "studio-fill-solid-dark",
      "studio-fill-solid-light",
      "studio-fill-glass",
      "studio-atmosphere",
      "studio-pattern-${patternId}",
      "Glitter dust",
      "Starburst",
      "Neon scanlines",
      "Cyber mesh",
      "Dark carbon",
    ]) {
      expect(studio).toContain(control);
    }
    expect(canvas).toContain("8px 8px 36px");
    expect(canvas).toContain("backdropFilter");
    expect(canvas).toContain("card_light");
    expect(patternTile("tile_bad", "not_a_pattern" as "glitter")).toBeNull();

    function page(id: string) {
      return createMinimalPublicPage({ documentId: id, ownerUserId: `owner_${id}`, profileKind: "FAN" });
    }
    function writingOn(document: ReturnType<typeof page>, title: string) {
      const added = addWritingBox(document, ["BASE"], title);
      if (!added.blockId) throw new Error("writing");
      return { document: editDraftPlainText(added.document, added.blockId, `${title} stays editable.`), blockId: added.blockId };
    }

    const denseWriting = writingOn(page("c9f_dense"), "My People");
    let dense = setWorldBackground(denseWriting.document, patternTile("tile_dense", "carbon")!);
    dense = setSectionBackground(dense, dense.sections[0].sectionId, patternTile("tile_dense_scene", "starburst")!);
    const denseNote = addWritingBox(dense, ["BASE"], "Today");
    const denseSticker = dropObject(denseNote.document, "STICKER", ["BASE"]);
    dense = dropObject(denseSticker.document, "SHAPE", ["BASE"]).document;
    dense = setWritingTreatment(dense, denseWriting.blockId, "SOLID_DARK");

    const cyberWriting = writingOn(setPageSurface(page("c9f_cyber"), "#050510"), "Signal");
    let cyber = setWritingTreatment(cyberWriting.document, cyberWriting.blockId, "GLASS");
    cyber = setAtmosphere(cyber, "GLITTER");
    cyber = setSectionBackground(cyber, cyber.sections[0].sectionId, patternTile("tile_cyber", "cyber_mesh")!);
    cyber = setOverlay(cyber, cyber.sections[0].sectionId, washTile("tile_cyber_wash", "#050510", 28));
    const cyberPhoto = dropObject(cyber, "PHOTO", ["BASE"], "img_cyber");
    cyber = setMediaFrame(cyberPhoto.document, cyberPhoto.blockId!, "NEON");

    const editorialWriting = writingOn(setPageSurface(page("c9f_editorial"), "#F4F1FF"), "The Feature");
    let editorial = setWritingTreatment(editorialWriting.document, editorialWriting.blockId, "TRANSPARENT");
    editorial = setWritingTreatment(editorial, editorialWriting.blockId, "SOLID_LIGHT");
    const editorialPhoto = dropObject(editorial, "PHOTO", ["BASE"], "img_editorial");
    editorial = setMediaFrame(editorialPhoto.document, editorialPhoto.blockId!, "CARD");

    const scrapWriting = writingOn(page("c9f_scrap"), "Note");
    let scrap = setWritingTreatment(scrapWriting.document, scrapWriting.blockId, "SOLID_LIGHT");
    const scrapPhoto = dropObject(scrap, "PHOTO", ["BASE"], "img_scrap");
    scrap = setMediaFrame(scrapPhoto.document, scrapPhoto.blockId!, "POLAROID");
    scrap = rotateBlock(scrap, scrapPhoto.blockId!, 12);
    const scrapSticker = dropObject(scrap, "STICKER", ["BASE"]);
    scrap = rotateBlock(scrapSticker.document, scrapSticker.blockId!, -8);
    scrap = setWorldBackground(scrap, patternTile("tile_scrap", "glitter")!);

    const cinemaWriting = writingOn(page("c9f_cinema"), "Hold");
    let cinema = setAtmosphere(cinemaWriting.document, "STARS");
    cinema = setWritingTreatment(cinema, cinemaWriting.blockId, "TRANSPARENT");
    cinema = setPageSurface(cinema, "#050510");
    cinema = setSectionBackground(cinema, cinema.sections[0].sectionId, patternTile("tile_cinema", "scanlines")!);

    const minimalWriting = writingOn(page("c9f_minimal"), "One line");
    let minimal = setWritingTreatment(minimalWriting.document, minimalWriting.blockId, "TRANSPARENT");
    minimal = setAtmosphere(minimal, "NONE");
    minimal = setPageSurface(minimal, "#050510");

    const pages = [dense, cyber, editorial, scrap, cinema, minimal];
    for (const built of pages) expect(validatePublicPageDocument(built).ok).toBe(true);
    expect(new Set(pages.map((built) => built.atmosphere ?? "NONE")).size).toBeGreaterThan(1);
    expect(dense.worldBackground?.assetId).toBe("carbon");
    expect(cyber.sections[0].background?.assetId).toBe("cyber_mesh");
    expect(editorial.sections.flatMap((section) => section.blocks).find((block) => block.id === editorialPhoto.blockId)?.style.framePreset).toBe("CARD");
    expect(scrap.sections.flatMap((section) => section.blocks).find((block) => block.id === scrapPhoto.blockId)?.style.framePreset).toBe("POLAROID");
    expect(minimal.sections.flatMap((section) => section.blocks).filter((block) => block.kind !== "STATUS_LINE").length).toBe(1);

    let session = sessionFromDraft(cyber, 1, ["BASE"]);
    session = recordEdit(session, setWritingTreatment(session.document, cyberWriting.blockId, "TRANSPARENT"));
    session = recordEdit(session, setMediaFrame(session.document, cyberPhoto.blockId!, "POLAROID"));
    session = recordEdit(session, setSectionBackground(session.document, session.document.sections[0].sectionId, patternTile("tile_cyber_next", "carbon")!));
    expect(session.document.sections[0].background?.assetId).toBe("carbon");
    session = undoEdit(session);
    expect(session.document.sections[0].background?.assetId).toBe("cyber_mesh");
    session = undoEdit(session);
    expect(session.document.sections.flatMap((section) => section.blocks).find((block) => block.id === cyberPhoto.blockId)?.style.framePreset).toBe("NEON");
    session = redoEdit(session);
    expect(session.document.sections.flatMap((section) => section.blocks).find((block) => block.id === cyberPhoto.blockId)?.style.framePreset).toBe("POLAROID");
    const glassAgain = setWritingTreatment(session.document, cyberWriting.blockId, "GLASS");
    expect(glassAgain.sections.flatMap((section) => section.blocks).find((block) => block.id === cyberWriting.blockId)?.style.skinRef).toBe("card_glass");
    expect(validatePublicPageDocument(glassAgain).ok).toBe(true);
  });

  it("offsets sequential drops and refuses a rectangular polaroid on a heart", () => {
    const blank = createMinimalPublicPage({
      documentId: "doc_place",
      ownerUserId: "user_place",
      profileKind: "FAN" satisfies PublicPageProfileKind,
    });
    const writing = dropObject(blank, "LONG_FORM_WRITING", ["BASE"]);
    const photo = dropObject(writing.document, "PHOTO", ["BASE"], "img_place_owner");
    const shape = dropObject(photo.document, "SHAPE", ["BASE"]);
    const decoration = dropObject(shape.document, "STICKER", ["BASE"]);
    const writingAgain = dropObject(decoration.document, "LONG_FORM_WRITING", ["BASE"]);
    const drops = [writing, photo, shape, decoration, writingAgain];
    expect(drops.every((drop) => drop.added)).toBe(true);
    const points = drops.map((drop) => {
      const block = drop.document.sections.flatMap((section) => section.blocks).find((item) => item.id === drop.blockId);
      return `${block?.bounds.x},${block?.bounds.y}`;
    });
    expect(new Set(points).size).toBe(points.length);
    const asked = centerMagnetOn(writingAgain.document, writingAgain.blockId!, 48, 48);
    const placed = asked.sections.flatMap((section) => section.blocks).find((block) => block.id === writingAgain.blockId);
    expect(placed?.bounds.x).toBeGreaterThan(0);
    expect(rectangularCardFrameAllowed("RECTANGLE")).toBe(true);
    expect(rectangularCardFrameAllowed("HEART")).toBe(false);
    expect(rectangularCardFrameAllowed("CIRCLE")).toBe(false);
    expect(rectangularCardFrameAllowed("STAR")).toBe(false);
    expect(HEART_CONTOUR_PATH).toContain(" C ");
    expect(HEART_CLIP_ID).toBe("tmi-shape-heart");
    const canvas = readFileSync(join(__dirname, "../../../components/profile/PublicPageCanvas.tsx"), "utf8");
    expect(canvas).toContain("HEART_CLIP_ID");
    expect(canvas).toContain('clipPathUnits="objectBoundingBox"');
    expect(canvas).toContain("rectangularCardFrameAllowed");
    expect(canvas).not.toContain("M 50 18 L 82 8");
    expect(canvas).toContain('entry.kind !== "DIVIDER"');
  });

  it("builds a revision-aware social card from public text only", () => {
    const blank = createMinimalPublicPage({
      documentId: "doc_share",
      ownerUserId: "user_secret_should_not_leak",
      profileKind: "FAN" satisfies PublicPageProfileKind,
    });
    const status = blank.sections[0]?.blocks[0];
    expect(status).toBeTruthy();
    const withMotto = {
      ...blank,
      theme: { ...blank.theme, accentColorHex: "#FF2DAA", surfaceColorHex: "#120018" },
      sections: blank.sections.map((section, index) => index === 0 ? {
        ...section,
        blocks: [
          { ...status!, plainText: { text: "The room is mine." } },
          { ...status!, id: "blk_private", visibility: "OWNER_ONLY" as const, plainText: { text: "secret draft line" } },
        ],
      } : section),
    };
    const card = composePublishedSocialCard({ displayName: "Wavetek", document: withMotto, revisionNumber: 12 });
    expect(card.title).toBe("Wavetek | TMI");
    expect(card.description).toBe("The room is mine.");
    expect(card.accentHex).toBe("#FF2DAA");
    expect(card.surfaceHex).toBe("#120018");
    expect(publishedSocialImagePath("Wavetek", 12)).toBe("/p/wavetek/og?rev=12");
    expect(publishedSocialImagePath("Wavetek", 13)).not.toBe(publishedSocialImagePath("Wavetek", 12));
    expect(canonicalShareOrigin("http://localhost:3000")).toBe("https://themusiciansindex.com");
    expect(canonicalShareOrigin("https://themusiciansindex.com")).toBe("https://themusiciansindex.com");
    const packed = JSON.stringify(card);
    expect(packed).not.toContain("user_secret_should_not_leak");
    expect(packed).not.toContain("secret draft line");
    const unpublished = composePublishedSocialCard({ displayName: "Wavetek", document: null, revisionNumber: 99 });
    expect(unpublished.revisionNumber).toBeNull();
    expect(unpublished.motto).toBe("");
    const png = renderPublishedSocialPng(card);
    expect(png[0]).toBe(137);
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
});
