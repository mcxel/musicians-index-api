"use client";

/**
 * C.9 owner drawer. Visitors receive null.
 * Pointer moves call the same magnet bounds authority as the buttons.
 * Writes go through /api/public-page. The document is the only page source.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { readProfileTrail, saveProfileTrail } from "@/lib/profile/profileDiscoveryHistory";
import { getShareBaseUrl } from "@/lib/identity/ArtistShareIdentity";
import { canonicalShareOrigin } from "@/lib/publicPage/publicPageSocialCard";
import { canonicalIdentityCardPath, canonicalPublicPath, resolveOwnerPublicSlug } from "@/lib/identity/PublicProfileRuntime";
import { cardLinksForMember, presentCardLinks, readCardTokens } from "@/lib/identity/publicIdentityCard";
import { QRCodeSVG } from "qrcode.react";
import type { PublicPageBlockKind, PublicPageBounds, PublicPageCapability, PublicPageDocument, PublicPageMask, PublicPageProfileKind } from "@/lib/publicPage/publicPageDocument";
import type { FontPairing } from "@/lib/profile/PublicProfileStyleEngine";
import { APPROVED_PAGE_FONTS, PUBLIC_PAGE_SHAPES, WRITING_LABELS } from "@/lib/publicPage/publicPageShapes";
import {
  acceptProposal,
  applyMagnetBounds,
  blockAddAllowed,
  createMinimalPublicPage,
  dismissProposal,
  framesForViewport,
  placeAsMagnet,
  cycleBlockMask,
  addRepeatableBlock,
  addWritingBox,
  applyShape,
  dropObject,
  duplicateBlock,
  fitWritingToText,
  setMediaFrame,
  setMediaViewport,
  setWritingFit,
  setWritingTitle,
  setWritingTreatment,
  lowerMagnetLayer,
  patchBlockStyle,
  setBlockEffect,
  recordEdit,
  rotateBlock,
  redoEdit,
  undoEdit,
  pointerDeltaToMagnetPatch,
  clientPointToMagnet,
  centerMagnetOn,
  proposeHelpLayout,
  raiseMagnetLayer,
  bringMagnetToFront,
  sendMagnetToBack,
  reloadAfterConflict,
  removeBlock,
  reorderBlock,
  restoreStudioRevision,
  saveStudioDraft,
  sessionFromDraft,
  studioMount,
  studioStatusLabel,
  viewportWidth,
  type StudioSession,
  type StudioViewport,
} from "@/lib/publicPage/pageStudio";
import type { PublicPagePersistence } from "@/lib/publicPage/publicPagePersistence";
import PublicPagePublishedView from "@/components/profile/PublicPagePublishedView";
import QuickAddShelf, { type QuickAddAnchor } from "@/components/profile/QuickAddShelf";
import { presentPublicProfile } from "@/lib/publicPage/presentPublicPageDocument";
import HubDrawerHeader from "@/components/workspace/universal/HubDrawerHeader";
import { useHubDrawerBackContract } from "@/lib/workspace/universal/hubDrawerBackStack";
import { PUBLIC_PAGE_STARTERS, starterPreviewDocument } from "@/lib/publicPage/publicPageStarterRegistry";
import {
  addSection,
  colorTile,
  deleteSection,
  moveSection,
  proposeSupercharge,
  addPageLink,
  applyBrightStart,
  resizePreview,
  reshapePreview,
  setAccentColor,
  setFlickerPlace,
  setOpening,
  duplicateSectionPresentation,
  setSectionHeight,
  setSectionLayout,
  setSectionMinHeight,
  setOverlay,
  setUnderlay,
  moveBackground,
  presentBackground,
  scaleBackground,
  setPageSurface,
  imageTile,
  patternTile,
  setAtmosphere,
  setSectionBackground,
  setWorldBackground,
  setWritingColor,
  washTile,
  clearOverlay,
  clearUnderlay,
} from "@/lib/publicPage/publicPageComposition";
import { PUBLIC_PAGE_ATMOSPHERES, PUBLIC_PAGE_PATTERN_IDS, type PublicPageAtmosphere, type PublicPageFit, type PublicPagePatternId, type PublicPageSectionLayout } from "@/lib/publicPage/publicPageDocument";

const OBJECT_TOOLS: Array<{ kind: PublicPageBlockKind; label: string }> = [
  { kind: "PHOTO", label: "Photo" },
  { kind: "PHOTO_GALLERY", label: "Gallery" },
  { kind: "HEADING", label: "Text" },
  { kind: "QUOTE", label: "Quote" },
  { kind: "LONG_FORM_WRITING", label: "Writing" },
  { kind: "NOTE", label: "Memory" },
  { kind: "POEM", label: "Poem" },
  { kind: "SHAPE", label: "Shape" },
  { kind: "STICKER", label: "Decoration" },
  { kind: "FRAME", label: "Frame" },
  { kind: "TRACK", label: "Song" },
  { kind: "PLAYLIST", label: "Playlist" },
  { kind: "VIDEO_SNIP", label: "Snip" },
  { kind: "YOPHO", label: "YoPho" },
  { kind: "MEMBER_SPOTLIGHT", label: "My People" },
  { kind: "SOCIAL_LINKS", label: "Social" },
  { kind: "STATUS_LINE", label: "Status" },
];
const GATED_KINDS: PublicPageBlockKind[] = ["BOOKING_CTA", "MERCH_SHELF", "EVENT", "ALBUM"];
const OBJECT_COLORS = ["#FF2DAA", "#00FFFF", "#FFD700", "#AA2DFF", "#F4F1FF", "#7CFFB2"];
const VIEWPORTS: StudioViewport[] = ["DESKTOP", "TABLET", "PHONE", "VISITOR"];
const controlStyle: React.CSSProperties = { minHeight: 44, padding: "10px 12px" };

function placeIfFlow(document: PublicPageDocument, blockId: string): PublicPageDocument {
  const block = document.sections.flatMap((section) => section.blocks).find((item) => item.id === blockId);
  if (!block || block.placement === "MAGNET") return document;
  return placeAsMagnet(document, blockId, {
    x: block.bounds.x || 8,
    y: block.bounds.y || 8,
    w: Math.max(block.bounds.w, 16),
    h: Math.max(block.bounds.h, 8),
    z: Math.max(block.bounds.z, 1),
    column: "FULL",
  });
}

function backgroundScope(document: PublicPageDocument, selectedId: string | null, selectedSectionId: string | null): string | null | undefined {
  const sectionId = targetSectionId(document, selectedId, selectedSectionId);
  const section = document.sections.find((item) => item.sectionId === sectionId);
  if (section?.background && section.background.source !== "COLOR") return section.sectionId;
  if (document.worldBackground && document.worldBackground.source !== "COLOR") return null;
  return undefined;
}

function previewTarget(document: PublicPageDocument, selectedId: string | null): string | null {
  const links = document.sections.flatMap((section) => section.blocks).filter((block) => block.mediaLink);
  return (links.find((block) => block.id === selectedId) ?? links[links.length - 1])?.id ?? null;
}

function targetSectionId(document: PublicPageDocument, selectedId: string | null, selectedSectionId: string | null): string | null {
  if (selectedSectionId && document.sections.some((section) => section.sectionId === selectedSectionId)) return selectedSectionId;
  if (selectedId) {
    const hit = document.sections.find((section) => section.blocks.some((block) => block.id === selectedId));
    if (hit) return hit.sectionId;
  }
  return document.sections[0]?.sectionId ?? null;
}

function httpPersistence(role: string): PublicPagePersistence {
  const call = async (method: "GET" | "POST", search: string, body?: unknown) => {
    try {
      const response = await fetch(`/api/public-page${search}`, {
        method,
        headers: body ? { "content-type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const payload = (await response.json()) as { ok?: boolean; code?: string; mode?: string; document?: PublicPageDocument; revisionNumber?: number; revisionId?: string; revisions?: unknown };
      if (!response.ok || payload.ok === false) {
        return { ok: false as const, code: payload.code ?? "TRANSACTION_ABORTED", touchesPublicProfileConfig: false as const, databaseCascadePhysicallyTested: false as const };
      }
      return payload;
    } catch {
      return { ok: false as const, code: "TRANSACTION_ABORTED" as const, touchesPublicProfileConfig: false as const, databaseCascadePhysicallyTested: false as const };
    }
  };
  void role;
  return {
    async getOwnerDraft(_actor, profileKind) {
      const result = await call("GET", `?scope=draft&profileKind=${profileKind}`);
      return result as Awaited<ReturnType<PublicPagePersistence["getOwnerDraft"]>>;
    },
    async getPublishedPage(input) {
      const result = await call("GET", `?scope=published&profileKind=${input.profileKind}&ownerUserId=${encodeURIComponent(input.ownerUserId)}`);
      return result as Awaited<ReturnType<PublicPagePersistence["getPublishedPage"]>>;
    },
    async createDraft(_actor, profileKind, document) {
      const result = await call("POST", "", { op: "create", profileKind, document });
      return result as Awaited<ReturnType<PublicPagePersistence["createDraft"]>>;
    },
    async saveDraft(_actor, profileKind, expectedRevision, document) {
      const result = await call("POST", "", { op: "save", profileKind, expectedRevision, document });
      return result as Awaited<ReturnType<PublicPagePersistence["saveDraft"]>>;
    },
    async publishDraft(_actor, profileKind, expectedRevision) {
      const result = await call("POST", "", { op: "publish", profileKind, expectedRevision });
      return result as Awaited<ReturnType<PublicPagePersistence["publishDraft"]>>;
    },
    async listRevisionHistory(_actor, profileKind) {
      const result = await call("GET", `?scope=history&profileKind=${profileKind}`);
      return result as Awaited<ReturnType<PublicPagePersistence["listRevisionHistory"]>>;
    },
    async restoreRevision(_actor, profileKind, sourceRevisionId, expectedRevision) {
      const result = await call("POST", "", { op: "restore", profileKind, sourceRevisionId, expectedRevision });
      return result as Awaited<ReturnType<PublicPagePersistence["restoreRevision"]>>;
    },
  };
}

export default function YourPageStudio({
  isOwner,
  ownerUserId,
  role,
  profileKind,
  capabilities,
  accentColor,
  persistence,
  showLauncher = true,
  requestedOpen = false,
  onRequestedOpenChange,
  onStepWorkspace,
}: {
  isOwner: boolean;
  ownerUserId?: string;
  role: string;
  profileKind: PublicPageProfileKind;
  capabilities: readonly PublicPageCapability[];
  accentColor: string;
  persistence?: PublicPagePersistence;
  /** Public pages pass false. The private dashboard opens the drawer itself. */
  showLauncher?: boolean;
  requestedOpen?: boolean;
  onRequestedOpenChange?: (open: boolean) => void;
  onStepWorkspace?: (direction: -1 | 1) => void;
}) {
  const mount = studioMount(isOwner);
  const [open, setOpen] = useState(false);
  const isOpen = showLauncher ? open : requestedOpen;
  function closeStudio() {
    if (showLauncher) setOpen(false);
    else onRequestedOpenChange?.(false);
  }
  const [session, setSession] = useState<StudioSession | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ revisionId: string; revisionNumber: number }>>([]);
  const [bindingDraft, setBindingDraft] = useState("");
  const [addNotice, setAddNotice] = useState("");
  const [writingLabel, setWritingLabel] = useState<(typeof WRITING_LABELS)[number]>("Happy Days");
  const [customTitle, setCustomTitle] = useState("");
  const [photos, setPhotos] = useState<Array<{ id: string; title: string }>>([]);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [linkDraft, setLinkDraft] = useState("");
  const [authorMode, setAuthorMode] = useState<"EASY" | "PRO">("EASY");
  const [previewOpen, setPreviewOpen] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<"DESKTOP" | "TABLET" | "PHONE" | "PUBLIC">("DESKTOP");
  const [trayCategory, setTrayCategory] = useState<
    | "BACKGROUND"
    | "DIALOGUE"
    | "PHOTOS"
    | "SHAPES"
    | "FRAMES"
    | "UNDERLAYS"
    | "OVERLAYS"
    | "EFFECTS"
    | "MOTION"
    | "MEDIA"
    | "SECTIONS"
    | "LAYERS"
    | "WRITE"
    | "ADD"
  >("SHAPES");
  const [auditionSnapshot, setAuditionSnapshot] = useState<PublicPageDocument | null>(null);
  const [auditionLabel, setAuditionLabel] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"SPLIT" | "CANVAS" | "TOOLS">("SPLIT");
  const [workspace, setWorkspace] = useState<"DOCKED" | "FULL">("DOCKED");
  const [toolPath, setToolPath] = useState<Array<"YOUR PAGE" | "BACKGROUND">>(["YOUR PAGE"]);
  const [publicSlug, setPublicSlug] = useState<string | null>(null);
  const [cardQrOpen, setCardQrOpen] = useState(false);
  const [cardOrigin, setCardOrigin] = useState("");
  const [cardDeck, setCardDeck] = useState<Array<{ id: string; label: string; hidden: boolean }>>([]);
  const router = useRouter();
  useEffect(() => {
    if (!isOpen) return;
    setCardOrigin(window.location.origin);
    let cancelled = false;
    void fetch("/api/profile/self", { credentials: "include", cache: "no-store" })
      .then((response) => response.json())
      .then((data: { ok?: boolean; profile?: { username?: string | null; artistSlug?: string | null } }) => {
        if (cancelled || !data.ok || !data.profile) return;
        setPublicSlug(resolveOwnerPublicSlug(profileKind, data.profile));
      })
      .catch(() => { if (!cancelled) setPublicSlug(null); });
    return () => { cancelled = true; };
  }, [isOpen, profileKind]);

  useEffect(() => {
    if (!cardQrOpen) return;
    let cancelled = false;
    void fetch("/api/profile/role-extension", { credentials: "include", cache: "no-store" })
      .then((response) => response.json())
      .then((data: { ok?: boolean; extension?: Record<string, unknown> }) => {
        if (cancelled || !data.ok || !data.extension) return;
        const kind = profileKind === "PERFORMER" ? "performer" : "fan";
        const links = cardLinksForMember(data.extension, kind);
        const hidden = new Set(readCardTokens(data.extension, "_cardHidden"));
        const ordered = presentCardLinks(links, { ...data.extension, _cardHidden: "" });
        setCardDeck(ordered.map((link) => ({ id: link.id, label: link.label, hidden: hidden.has(link.id) })));
      })
      .catch(() => { if (!cancelled) setCardDeck([]); });
    return () => { cancelled = true; };
  }, [cardQrOpen, profileKind]);

  async function saveCardDeck(next: Array<{ id: string; label: string; hidden: boolean }>) {
    setCardDeck(next);
    await fetch("/api/profile/role-extension", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardOrder: next.map((link) => link.id).join(","),
        cardHidden: next.filter((link) => link.hidden).map((link) => link.id).join(","),
      }),
    }).catch(() => undefined);
  }

  async function sharePublishedPage() {
    if (!publicSlug) return;
    const url = `${canonicalShareOrigin(getShareBaseUrl())}${canonicalPublicPath(publicSlug)}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "TMI", url });
        return;
      } catch {
        /* The visitor dismissed the device sheet. Copy remains available. */
      }
    }
    await navigator.clipboard?.writeText(url);
  }

  function openPublishedPage() {
    if (!publicSlug || !ownerUserId) return;
    const saved = readProfileTrail(ownerUserId);
    const trail = saved?.ids.includes(publicSlug)
      ? { ids: saved.ids, index: saved.ids.indexOf(publicSlug) }
      : { ids: [publicSlug], index: 0 };
    saveProfileTrail(ownerUserId, trail);
    router.push(`${canonicalPublicPath(publicSlug)}?tmiProfiles=1&profileId=${encodeURIComponent(publicSlug)}`);
  }
  const [toolsOpen, setToolsOpen] = useState(true);
  const [quickAdd, setQuickAdd] = useState<QuickAddAnchor | null>(null);
  const [starterOpen, setStarterOpen] = useState(false);
  const [confirmLayoutOpen, setConfirmLayoutOpen] = useState(false);
  const hasMeaningfulWork = useMemo(() => {
    if (!session) return false;
    const blocks = session.document.sections.flatMap((s) => s.blocks);
    const magnets = blocks.filter((b) => b.placement === "MAGNET");
    const hasText = blocks.some((b) => (b.plainText?.text ?? "").trim().length > 0);
    return magnets.length > 0 || hasText || blocks.length > 2;
  }, [session]);

  const handleRequestChangeLayout = () => {
    if (hasMeaningfulWork) {
      setConfirmLayoutOpen(true);
    } else {
      setStarterOpen(true);
    }
  };
  const [starterPreview, setStarterPreview] = useState<string | null>(null);
  const starterOffered = useRef(false);
  const sessionLoad = useRef<Promise<StudioSession> | null>(null);
  const ensureSessionRef = useRef<(() => Promise<StudioSession>) | null>(null);
  const trayRef = useRef<HTMLDivElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const insertPointRef = useRef<{ x: number; y: number } | null>(null);
  const photoAnchorRef = useRef<{ x: number; y: number } | null>(null);
  const photoFromShelfRef = useRef(false);
  const port = useMemo(() => persistence ?? httpPersistence(role), [persistence, role]);
  const dragRef = useRef<{
    blockId: string;
    mode: "move" | "resize" | "crop" | "rotate";
    originX: number;
    originY: number;
    focalX: number;
    focalY: number;
    bounds: PublicPageBounds;
    document: PublicPageDocument;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (!ownerUserId || !isOpen) return;
    let cancelled = false;
    void fetch(`/api/media/images?userId=${encodeURIComponent(ownerUserId)}`, { credentials: "include" })
      .then((response) => response.json())
      .then((data: { ok?: boolean; items?: Array<{ id?: string; title?: string }> }) => {
        if (cancelled || !data.ok || !Array.isArray(data.items)) return;
        setPhotos(data.items.flatMap((item) => (item.id ? [{ id: item.id, title: item.title || "Photo" }] : [])));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [ownerUserId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const node = document.querySelector<HTMLElement>("[data-testid='your-page-studio']");
    node?.setAttribute("data-studio-phase", "start");
    const load = ensureSessionRef.current;
    if (!load) return;
    void load()
      .then(() => node?.setAttribute("data-studio-phase", "done"))
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "fail";
        node?.setAttribute("data-studio-phase", message.slice(0, 160));
      });
  }, [isOpen, profileKind, ownerUserId]);

  const drawerRef = useRef<HTMLElement | null>(null);
  const [leavePromptOpen, setLeavePromptOpen] = useState(false);
  const [leaveSaving, setLeaveSaving] = useState(false);
  const [leaveSaveFailed, setLeaveSaveFailed] = useState(false);
  const hasUnsavedWork = Boolean(session && session.document !== session.savedDocument);
  function requestClose(): boolean {
    if (hasUnsavedWork) {
      setLeaveSaveFailed(false);
      setLeavePromptOpen(true);
      return false;
    }
    closeStudio();
    return true;
  }
  useHubDrawerBackContract(Boolean(mount) && isOpen, () => {
    if (leavePromptOpen) {
      setLeavePromptOpen(false);
      return false;
    }
    return requestClose();
  });

  if (!mount) return null;
  const pageOwnerId = ownerUserId ?? "pending_owner";

  const actor = { userId: pageOwnerId, capabilities };

  async function ensureSession(): Promise<StudioSession> {
    if (session && session.persistenceState === "SERVER") return session;
    if (sessionLoad.current) return sessionLoad.current;
    const load = loadOwnerDraft().finally(() => {
      sessionLoad.current = null;
    });
    sessionLoad.current = load;
    return load;
  }
  ensureSessionRef.current = ensureSession;

  async function loadOwnerDraft(): Promise<StudioSession> {
    const stamp = (phase: string) => {
      document.querySelector("[data-testid='your-page-studio']")?.setAttribute("data-studio-phase", phase);
    };
    stamp("draft");
    const existing = await port.getOwnerDraft(actor, profileKind);
    const read =
      existing && existing.ok && existing.mode === "DRAFT"
        ? `DRAFT:${existing.revisionNumber}`
        : `MISS:${"code" in existing ? existing.code : "mode" in existing ? String(existing.mode) : "empty"}`;
    document.querySelector("[data-testid='your-page-studio']")?.setAttribute("data-draft-read", read);
    if (existing && existing.ok && existing.mode === "DRAFT" && typeof existing.revisionNumber === "number") {
      const next = sessionFromDraft(existing.document, existing.revisionNumber, capabilities);
      setSession(next);
      offerStarter(next.document);
      stamp("ready");
      return next;
    }
    const blank = applyBrightStart(createMinimalPublicPage({
      documentId: `doc_${profileKind.toLowerCase()}_${pageOwnerId}`,
      ownerUserId: pageOwnerId,
      profileKind,
    }));
    if (!existing.ok && existing.code === "NOT_FOUND") {
      const next = sessionFromDraft(blank, null, capabilities);
      setSession(next);
      offerStarter(next.document);
      stamp("local");
      return next;
    }
    const failed = {
      ...sessionFromDraft(blank, null, capabilities),
      phase: "SAVE_FAILED" as const,
      persistenceState: "SERVER" as const,
    };
    setSession(failed);
    stamp("error");
    return failed;
  }

  function offerStarter(document: PublicPageDocument) {
    if (starterOffered.current) return;
    const writing = document.sections.flatMap((section) => section.blocks).filter((block) =>
      block.kind === "LONG_FORM_WRITING" || block.kind === "STATUS_LINE" || block.kind === "QUOTE" || block.kind === "POEM");
    const filled = writing.some((block) => (block.plainText?.text ?? "").trim().length > 0);
    if (document.worldBackground || document.atmosphere || filled) return;
    starterOffered.current = true;
    setStarterOpen(true);
  }

  function applyStarter(starterId: string) {
    if (!session) return;
    const next = starterPreviewDocument(starterId, {
      ownerUserId: pageOwnerId,
      profileKind,
      documentId: session.document.documentId,
      photoRecordId: starterId === "blank" ? null : photos[0]?.id,
    });
    edit(next, session);
    setStarterPreview(null);
    setStarterOpen(false);
  }

  function edit(next: PublicPageDocument, current: StudioSession) {
    setSession(recordEdit(current, next));
  }

  function startAudition(label: string, nextDoc: PublicPageDocument) {
    if (!session) return;
    if (!auditionSnapshot) {
      setAuditionSnapshot(session.document);
    }
    setAuditionLabel(label);
    edit(nextDoc, session);
  }

  function cancelAudition() {
    if (!session || !auditionSnapshot) return;
    edit(auditionSnapshot, session);
    setAuditionSnapshot(null);
    setAuditionLabel(null);
  }

  function applyAudition() {
    setAuditionSnapshot(null);
    setAuditionLabel(null);
  }

  function beginPointer(event: React.PointerEvent<HTMLElement>, blockId: string, mode: "move" | "resize" | "rotate") {
    const crop = adjustingId === blockId && mode === "move";
    if (!session || session.viewport === "VISITOR") return;
    const block = session.document.sections.flatMap((section) => section.blocks).find((item) => item.id === blockId);
    if (!block || block.placement !== "MAGNET") return;
    const canvas = event.currentTarget.closest("[data-testid='magnet-canvas']") as HTMLElement | null;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    event.preventDefault();
    dragRef.current = {
      blockId,
      mode: crop ? "crop" : mode,
      originX: event.clientX,
      originY: event.clientY,
      focalX: block.style.mediaFocalX ?? 0.5,
      focalY: block.style.mediaFocalY ?? 0.5,
      bounds: block.bounds,
      document: session.document,
      width: rect.width,
      height: rect.height,
    };
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* A released or synthetic pointer still updates bounds from move events. */
    }
  }

  function movePointer(event: React.PointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag || !session) return;
    if (drag.mode === "rotate") {
      const deltaX = event.clientX - drag.originX;
      const currentBlock = drag.document.sections
        .flatMap((s) => s.blocks)
        .find((b) => b.id === drag.blockId);
      const currentAngle = currentBlock?.style.rotationDeg ?? 0;
      const nextAngle = Math.max(-180, Math.min(180, Math.round(currentAngle + deltaX * 0.5)));
      edit(patchBlockStyle(session.document, drag.blockId, { rotationDeg: nextAngle }), session);
      return;
    }
    if (drag.mode === "crop") {
      edit(setMediaViewport(drag.document, drag.blockId, {
        mediaFit: "FREE",
        mediaFocalX: drag.focalX - (event.clientX - drag.originX) / Math.max(drag.width, 1),
        mediaFocalY: drag.focalY - (event.clientY - drag.originY) / Math.max(drag.height, 1),
      }), session);
      return;
    }
    const patch = pointerDeltaToMagnetPatch(
      drag.bounds,
      drag.mode,
      event.clientX - drag.originX,
      event.clientY - drag.originY,
      drag.width,
      drag.height,
    );
    const sized = applyMagnetBounds(drag.document, drag.blockId, patch);
    edit(drag.mode === "resize" ? setWritingFit(sized, drag.blockId, "FIXED") : sized, session);
  }

  function placeShape(shapeId: PublicPageMask) {
    if (!session) return;
    if (selectedId) {
      // Re-selected object mutation: alter shape in-place without duplicate, lost content, or position reset
      const shaped = applyShape(session.document, selectedId, shapeId);
      startAudition("Shape: " + shapeId, shaped);
      setQuickAdd(null);
      return;
    }
    const point = insertPointRef.current;
    insertPointRef.current = null;
    const added = dropObject(session.document, "SHAPE", capabilities);
    if (!added.added || !added.blockId) {
      setAddNotice("Shape could not be placed.");
      return;
    }
    setSelectedId(added.blockId);
    setAddNotice("");
    const shaped = applyShape(added.document, added.blockId, shapeId);
    const finalDoc = point ? centerMagnetOn(shaped, added.blockId, point.x, point.y) : shaped;
    startAudition("Add " + shapeId + " shape", finalDoc);
    setQuickAdd(null);
  }

  function handleCreateTextObject(mode: "TEXT" | "HEADLINE" | "DIALOGUE" | "QUOTE") {
    if (!session) return;
    const isWhite = (session.document.theme.surfaceColorHex ?? "#FFFFFF").toUpperCase() === "#FFFFFF";
    const defaultColor = isWhite ? "#111111" : "#00FFFF";
    const existingMagnets = session.document.sections
      .flatMap((s) => s.blocks)
      .filter((b) => b.placement === "MAGNET");
    const count = existingMagnets.length;
    const cascadeStep = (count % 6) * 4;

    const kind: PublicPageBlockKind = mode === "HEADLINE" ? "HEADING" : mode === "QUOTE" ? "QUOTE" : "LONG_FORM_WRITING";
    const result = addRepeatableBlock(session.document, kind, capabilities);
    if (!result.added || !result.blockId) return;

    const width = mode === "HEADLINE" ? 70 : 60;
    const height = mode === "HEADLINE" ? 12 : 14;
    let nextDoc = placeAsMagnet(result.document, result.blockId, {
      x: Math.min(20 + cascadeStep, 36),
      y: Math.min(15 + cascadeStep, 50),
      w: width,
      h: height,
      z: count + 1,
      column: "FULL",
    });
    nextDoc = patchBlockStyle(nextDoc, result.blockId, {
      textFit: "AUTO",
      colorHex: defaultColor,
      backgroundTreatment: mode === "DIALOGUE" ? "SOLID" : "NONE",
      mask: mode === "DIALOGUE" ? "SPEECH_BUBBLE" : "ROUNDED",
    });
    nextDoc = fitWritingToText(nextDoc, result.blockId, "");

    edit(nextDoc, session);
    setSelectedId(result.blockId);
    setEditingBlockId(result.blockId);
  }

  function placeWriting(label: string) {
    if (!session) return;
    if (selectedId) {
      const block = session.document.sections.flatMap((s) => s.blocks).find((b) => b.id === selectedId);
      if (block) {
        const next = setWritingTitle(session.document, selectedId, label);
        startAudition("Text: " + label, next);
        setQuickAdd(null);
        return;
      }
    }
    const point = insertPointRef.current;
    insertPointRef.current = null;
    const added = addWritingBox(session.document, capabilities, label);
    if (!added.added || !added.blockId) return;
    setSelectedId(added.blockId);
    setAddNotice("");
    const finalDoc = point ? centerMagnetOn(added.document, added.blockId, point.x, point.y) : added.document;
    startAudition("Add " + label, finalDoc);
    setQuickAdd(null);
  }

  function placeKind(kind: "STICKER" | "FRAME") {
    if (!session) return;
    const point = insertPointRef.current;
    insertPointRef.current = null;
    const added = dropObject(session.document, kind, capabilities);
    if (!added.added || !added.blockId) {
      setAddNotice("That object could not be placed.");
      return;
    }
    setSelectedId(added.blockId);
    setAddNotice("");
    edit(point ? centerMagnetOn(added.document, added.blockId, point.x, point.y) : added.document, session);
    setQuickAdd(null);
  }

  function placePhoto(photoId: string, photoTitle: string) {
    if (!session) return;
    if (selectedId) {
      const block = session.document.sections.flatMap((s) => s.blocks).find((b) => b.id === selectedId);
      if (block && block.kind === "PHOTO") {
        const nextDoc = {
          ...session.document,
          sections: session.document.sections.map((section) => ({
            ...section,
            blocks: section.blocks.map((b) =>
              b.id === selectedId
                ? {
                    ...b,
                    a11y: { ...b.a11y, label: photoTitle },
                    bindingRef: {
                      authority: "CONTENT" as const,
                      recordId: photoId,
                      snapshotPolicy: "LIVE_RESOLVE" as const,
                    },
                  }
                : b
            ),
          })),
        };
        startAudition("Photo: " + photoTitle, nextDoc);
        return;
      }
    }
    const added = dropObject(session.document, "PHOTO", capabilities, photoId);
    if (!added.added || !added.blockId) {
      setAddNotice("Photo needs a real record id before it can be placed. Nothing was attached.");
      return;
    }
    setSelectedId(added.blockId);
    setAddNotice("");
    startAudition("Add photo " + photoTitle, added.document);
  }

  function openQuickAdd(detail: {
    clientX: number;
    clientY: number;
    rect: { left: number; top: number; width: number; height: number };
    blockId: string | null;
    kind: string | null;
  }) {
    const point = clientPointToMagnet(detail.clientX, detail.clientY, detail.rect);
    if (detail.blockId) setSelectedId(detail.blockId);
    setQuickAdd({
      clientX: detail.clientX,
      clientY: detail.clientY,
      magnetX: point.x,
      magnetY: point.y,
      blockId: detail.blockId,
      kind: detail.kind,
    });
  }

  function rememberInsert() {
    if (!quickAdd) return;
    insertPointRef.current = { x: quickAdd.magnetX, y: quickAdd.magnetY };
  }

  const frames = session ? framesForViewport(session.document, session.viewport) : [];
  const pagePresentation = session
    ? presentPublicProfile({ mode: "DOCUMENT_PREVIEW", document: session.document, authorizedCapabilities: capabilities })
    : null;
  const starterPresentation = session && starterPreview
    ? presentPublicProfile({
        mode: "DOCUMENT_PREVIEW",
        document: starterPreviewDocument(starterPreview, {
          ownerUserId: pageOwnerId,
          profileKind,
          documentId: session.document.documentId,
          photoRecordId: starterPreview === "blank" ? null : photos[0]?.id,
        }),
        authorizedCapabilities: capabilities,
      })
    : null;

  return (
    <section data-testid="your-page-studio" data-draft-load="await-server" data-profile-kind={profileKind} data-drawer={mount.drawer} data-studio-session={session ? "ready" : "pending"} data-studio-open={isOpen ? "1" : "0"}>
      {showLauncher ? (
        <button type="button" data-testid="your-page-open" onClick={() => { setOpen(true); void ensureSession(); }} style={{ color: accentColor, background: "transparent", border: `1px solid ${accentColor}`, borderRadius: 8, padding: "12px 14px", minHeight: 44, fontWeight: 800, letterSpacing: "0.08em" }}>
          YOUR PAGE
        </button>
      ) : null}
      {isOpen && session ? (
        <>
        {leavePromptOpen ? (
          <div
            data-testid="your-page-unsaved-prompt"
            role="alertdialog"
            aria-modal="true"
            aria-label="Unsaved changes"
            style={{ position: "fixed", inset: 0, zIndex: 120, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          >
            <div style={{ maxWidth: 360, width: "100%", background: "rgba(12, 10, 24, 0.98)", border: "2px solid #FF2DAA", borderRadius: 12, padding: 18, color: "#fff" }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#FF2DAA", letterSpacing: "0.08em", marginBottom: 8 }}>
                You have unsaved changes
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.4, color: "rgba(255,255,255,0.8)", marginBottom: 16 }}>
                {leaveSaveFailed
                  ? "Your draft could not be saved. Your edits are still here."
                  : "Save your draft before closing, or discard these edits."}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  type="button"
                  data-testid="your-page-unsaved-save-close"
                  disabled={leaveSaving}
                  style={{ ...controlStyle, minHeight: 44 }}
                  onClick={() => {
                    setLeaveSaving(true);
                    void saveStudioDraft(session, port, actor, profileKind).then((next) => {
                      setSession(next);
                      setLeaveSaving(false);
                      if (next.phase === "DRAFT_SAVED") {
                        setLeavePromptOpen(false);
                        closeStudio();
                      } else {
                        setLeaveSaveFailed(true);
                      }
                    });
                  }}
                >
                  {leaveSaving ? "Saving…" : "Save & Close"}
                </button>
                <button
                  type="button"
                  data-testid="your-page-unsaved-discard"
                  disabled={leaveSaving}
                  style={{ ...controlStyle, minHeight: 44 }}
                  onClick={() => {
                    setSession({
                      ...session,
                      document: session.savedDocument,
                      proposal: null,
                      phase: session.persistenceState === "LOCAL" ? "LOCAL_DRAFT" : "DRAFT_SAVED",
                    });
                    setLeavePromptOpen(false);
                    closeStudio();
                  }}
                >
                  Discard
                </button>
                <button
                  type="button"
                  data-testid="your-page-unsaved-keep"
                  style={{ ...controlStyle, minHeight: 44 }}
                  onClick={() => setLeavePromptOpen(false)}
                >
                  Keep Editing
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {confirmLayoutOpen ? (
          <div
            data-testid="change-layout-confirm-modal"
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 120,
              background: "rgba(0,0,0,0.85)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <div
              style={{
                maxWidth: 360,
                width: "100%",
                background: "rgba(12, 10, 24, 0.98)",
                border: "2px solid #FFD700",
                borderRadius: 12,
                padding: 18,
                color: "#fff",
                boxShadow: "0 0 24px rgba(255, 215, 0, 0.3)",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 900, color: "#FFD700", letterSpacing: "0.08em", marginBottom: 8 }}>
                CHANGE PAGE LAYOUT?
              </div>
              <p style={{ fontSize: 11, lineHeight: 1.4, color: "rgba(255,255,255,0.8)", marginBottom: 16 }}>
                Changing your layout will reset the current layout arrangement. Some positioning and layout settings may be lost. Preservable content will survive.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  data-testid="change-layout-cancel-btn"
                  onClick={() => setConfirmLayoutOpen(false)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  data-testid="change-layout-confirm-btn"
                  onClick={() => {
                    setConfirmLayoutOpen(false);
                    setStarterOpen(true);
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    background: "linear-gradient(135deg, #FFD700, #FF6B00)",
                    border: "none",
                    color: "#000",
                    fontSize: 10,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  CHANGE LAYOUT
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {starterOpen ? (
          <div data-testid="starter-picker" style={{ position: "fixed", zIndex: 80, top: 8, left: 8, right: 8, bottom: 8, overflow: "auto", background: "#050510", border: "1px solid #FF2DAA", borderRadius: 12, padding: 16 }}>
            <p style={{ color: "#F4F1FF", fontWeight: 800, letterSpacing: "0.08em" }}>BUILD YOUR WORLD</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
              {PUBLIC_PAGE_STARTERS.map((starter) => (
                <button
                  key={starter.id}
                  type="button"
                  data-testid={`starter-${starter.id}`}
                  onClick={() => setStarterPreview(starter.id)}
                  style={{ minHeight: 88, textAlign: "left", color: "#F4F1FF", background: starter.accentHex, border: starterPreview === starter.id ? "2px solid #FFFFFF" : "1px solid rgba(255,255,255,0.35)", borderRadius: 10, padding: 10, fontWeight: 800 }}
                >
                  <span style={{ display: "block", color: starter.accentHex === "#FFFFFF" || starter.accentHex === "#F4E7C5" || starter.accentHex === "#FFD700" ? "#120018" : "#F4F1FF" }}>{starter.name}</span>
                  <span style={{ display: "block", fontWeight: 500, fontSize: 12, color: "#120018" }}>{starter.summary}</span>
                </button>
              ))}
            </div>
            {starterPreview && starterPresentation && "mode" in starterPresentation && starterPresentation.mode === "DOCUMENT_PREVIEW" ? (
              <div data-testid="starter-preview" style={{ marginTop: 12 }}>
                <PublicPagePublishedView presentation={starterPresentation} />
                <button type="button" data-testid="starter-use" style={{ ...controlStyle, minHeight: 44 }} onClick={() => applyStarter(starterPreview)}>USE THIS STARTER</button>
              </div>
            ) : null}
            <button type="button" data-testid="starter-close" style={{ ...controlStyle, minHeight: 44 }} onClick={() => setStarterOpen(false)}>Close</button>
          </div>
        ) : null}
        {previewOpen && pagePresentation && "mode" in pagePresentation && pagePresentation.mode === "DOCUMENT_PREVIEW" ? (
          <div
            data-testid="studio-live-preview"
            data-device={previewDevice}
            data-public={previewDevice === "PUBLIC" ? "true" : "false"}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: workspace === "FULL" ? 0 : "min(440px, 100vw)",
              bottom: mobileView === "SPLIT" ? "62vh" : mobileView === "TOOLS" ? "72vh" : "72px",
              zIndex: 70,
              overflow: "auto",
              background: "#050510",
              padding: "10px 12px",
              borderBottom: "2px solid rgba(0, 255, 255, 0.45)",
            }}
          >
            {/* Canvas-Top Audition Bar */}
            {auditionSnapshot ? (
              <div
                data-testid="canvas-audition-bar"
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "rgba(10, 10, 26, 0.95)",
                  border: "1px solid #FF2DAA",
                  marginBottom: 10,
                  boxShadow: "0 4px 14px rgba(255, 45, 170, 0.4)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13 }}>👀</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>
                    {auditionLabel || "Auditioning"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    type="button"
                    onClick={cancelAudition}
                    style={{
                      minHeight: 30,
                      padding: "4px 10px",
                      borderRadius: 4,
                      background: "rgba(255,255,255,0.12)",
                      border: "1px solid rgba(255,255,255,0.25)",
                      color: "#fff",
                      fontSize: 9,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    ✕ CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={applyAudition}
                    style={{
                      minHeight: 30,
                      padding: "4px 12px",
                      borderRadius: 4,
                      background: "linear-gradient(135deg, #00FFFF, #00FF88)",
                      border: "none",
                      color: "#050510",
                      fontSize: 9,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    ✓ APPLY
                  </button>
                </div>
              </div>
            ) : null}
            {/* Canvas Quick Add Creation Rail */}
            <div
              data-testid="canvas-quick-add-rail"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "6px 14px",
                background: "rgba(5, 5, 16, 0.85)",
                backdropFilter: "blur(8px)",
                borderRadius: 999,
                border: "1px solid rgba(0, 255, 255, 0.3)",
                margin: "6px auto 10px",
                width: "fit-content",
                boxShadow: "0 2px 10px rgba(0, 255, 255, 0.2)",
              }}
            >
              <button
                type="button"
                data-testid="canvas-quick-text-stamp"
                onClick={() => handleCreateTextObject("TEXT")}
                style={{
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: "rgba(0, 255, 255, 0.15)",
                  border: "1px solid #00FFFF",
                  color: "#00FFFF",
                  fontSize: 10,
                  fontWeight: 900,
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>[ T ]</span>
                <span>QUICK TEXT STAMP</span>
              </button>
            </div>

            <div style={{ width: previewDevice === "PHONE" ? 390 : previewDevice === "TABLET" ? 768 : "100%", maxWidth: "100%", margin: "0 auto" }}>
              <PublicPagePublishedView
                presentation={pagePresentation}
                ownerUserId={previewDevice === "PUBLIC" ? undefined : pageOwnerId}
                selectedSectionId={previewDevice === "PUBLIC" ? null : selectedSectionId}
                onSelectSection={previewDevice === "PUBLIC" ? undefined : setSelectedSectionId}
                selectedBlockId={previewDevice === "PUBLIC" ? null : selectedId}
                onSelectBlock={previewDevice === "PUBLIC" ? undefined : setSelectedId}
                onMagnetPointerDown={previewDevice === "PUBLIC" ? undefined : ((blockId, mode, event) => beginPointer(event, blockId, mode))}
                onMagnetPointerMove={previewDevice === "PUBLIC" ? undefined : movePointer}
                onMagnetPointerUp={previewDevice === "PUBLIC" ? undefined : (() => { dragRef.current = null; })}
                adjustingBlockId={previewDevice === "PUBLIC" ? null : adjustingId}
                onBeginAdjust={previewDevice === "PUBLIC" ? undefined : setAdjustingId}
                onCanvasPlace={previewDevice === "PUBLIC" ? undefined : openQuickAdd}
                editingBlockId={previewDevice === "PUBLIC" ? null : editingBlockId}
                onUpdateBlockText={previewDevice === "PUBLIC" ? undefined : ((blockId, text) => edit(fitWritingToText(session.document, blockId, text), session))}
                onSetEditingBlockId={previewDevice === "PUBLIC" ? undefined : setEditingBlockId}
              />
            </div>
          </div>
        ) : null}
        <aside
          ref={drawerRef}
          data-testid="your-page-drawer"
          data-unsaved={hasUnsavedWork ? "1" : "0"}
          data-workspace={workspace}
          data-tools={workspace === "FULL" && !toolsOpen ? "collapsed" : "open"}
          aria-label="YOUR PAGE"
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === "Escape" && quickAdd) {
              setQuickAdd(null);
              return;
            }
            if (event.key === "Escape") requestClose();
          }}
          style={{
            position: "fixed",
            top: mobileView === "SPLIT" ? "38vh" : mobileView === "TOOLS" ? "28vh" : "calc(100vh - 72px)",
            right: 0,
            left: 0,
            bottom: 0,
            zIndex: 80,
            width: workspace === "FULL" ? "100vw" : "min(440px, 100vw)",
            height: mobileView === "SPLIT" ? "62vh" : mobileView === "TOOLS" ? "72vh" : "72px",
            overflow: "auto",
            padding: mobileView === "CANVAS" ? "8px 12px" : 14,
            background: "rgba(5,5,16,0.98)",
            borderLeft: "1px solid rgba(0,255,255,0.35)",
            borderTop: "2px solid #FF2DAA",
            color: "#fff",
            transition: "top 0.2s ease, height 0.2s ease",
          }}
        >
          <HubDrawerHeader drawerId="your-page" onClose={() => requestClose()} closeLabel="Close YOUR PAGE" scopeRef={drawerRef} />
          {/* YoPho Step 4 Scene Compositor Transform Strip */}
        {selectedId && session ? (() => {
          const selectedBlock = session.document.sections
            .flatMap((s) => s.blocks)
            .find((b) => b.id === selectedId);
          if (!selectedBlock) return null;
          return (
            <div
              data-testid="yopho-transform-strip"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 8,
                background: "rgba(10, 10, 26, 0.95)",
                border: "1px solid rgba(0, 255, 255, 0.35)",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.7)",
                marginBottom: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>
                  SELECTED: {selectedId} ({selectedBlock.kind})
                </span>
                <button
                  type="button"
                  data-testid="studio-object-delete"
                  onClick={() => {
                    edit(removeBlock(session.document, selectedId), session);
                    setSelectedId(null);
                  }}
                  style={{
                    fontSize: 8,
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: 4,
                    border: "1px solid rgba(255, 80, 80, 0.4)",
                    background: "rgba(255, 0, 0, 0.15)",
                    color: "#FFAAAA",
                    cursor: "pointer",
                  }}
                >
                  🗑 Delete
                </button>
              </div>

              {/* Two-Way Hybrid Input for Text/Dialogue */}
              {selectedBlock.kind === "LONG_FORM_WRITING" || selectedBlock.kind === "HEADING" || selectedBlock.kind === "QUOTE" || selectedBlock.kind === "NOTE" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <label style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.5)" }}>
                      EDIT WORDS (LIVE CANVAS SYNC)
                    </label>
                    <button
                      type="button"
                      data-testid="studio-inline-type-btn"
                      onClick={() => setEditingBlockId(selectedId)}
                      style={{
                        fontSize: 8,
                        fontWeight: 800,
                        padding: "2px 8px",
                        borderRadius: 4,
                        border: "1px solid #00FFFF",
                        background: editingBlockId === selectedId ? "rgba(0,255,255,0.25)" : "rgba(0,255,255,0.08)",
                        color: "#00FFFF",
                        cursor: "pointer",
                      }}
                    >
                      ✍️ Type on Canvas
                    </button>
                  </div>
                  <input
                    data-testid="studio-edit-words-input"
                    type="text"
                    value={selectedBlock.plainText?.text ?? selectedBlock.a11y?.label ?? ""}
                    onChange={(e) => {
                      const newText = e.target.value;
                      edit(fitWritingToText(session.document, selectedId, newText), session);
                    }}
                    placeholder="Type words..."
                    style={{
                      padding: "6px 10px",
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(0, 255, 255, 0.4)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      outline: "none",
                    }}
                  />
                </div>
              ) : null}

              {/* Transform Action Row: Move, Scale, Rotate */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.4)" }}>MOVE:</span>
                <button type="button" data-testid="nudge-left" style={{ ...controlStyle, minHeight: 28, padding: "2px 8px" }} onClick={() => edit(applyMagnetBounds(session.document, selectedId, { x: Math.max(0, selectedBlock.bounds.x - 4) }), session)}>◀</button>
                <button type="button" data-testid="nudge-right" style={{ ...controlStyle, minHeight: 28, padding: "2px 8px" }} onClick={() => edit(applyMagnetBounds(session.document, selectedId, { x: Math.min(90, selectedBlock.bounds.x + 4) }), session)}>▶</button>
                <button type="button" data-testid="nudge-up" style={{ ...controlStyle, minHeight: 28, padding: "2px 8px" }} onClick={() => edit(applyMagnetBounds(session.document, selectedId, { y: Math.max(0, selectedBlock.bounds.y - 4) }), session)}>▲</button>
                <button type="button" data-testid="nudge-down" style={{ ...controlStyle, minHeight: 28, padding: "2px 8px" }} onClick={() => edit(applyMagnetBounds(session.document, selectedId, { y: Math.min(90, selectedBlock.bounds.y + 4) }), session)}>▼</button>

                <span style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginLeft: 6 }}>SCALE:</span>
                <button type="button" data-testid="scale-down" style={{ ...controlStyle, minHeight: 28, padding: "2px 8px" }} onClick={() => edit(applyMagnetBounds(session.document, selectedId, { w: Math.max(10, selectedBlock.bounds.w - 4), h: Math.max(6, selectedBlock.bounds.h - 2) }), session)}>-</button>
                <button type="button" data-testid="scale-up" style={{ ...controlStyle, minHeight: 28, padding: "2px 8px" }} onClick={() => edit(applyMagnetBounds(session.document, selectedId, { w: Math.min(90, selectedBlock.bounds.w + 4), h: Math.min(80, selectedBlock.bounds.h + 2) }), session)}>+</button>

                <span style={{ fontSize: 8, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginLeft: 6 }}>ROTATE:</span>
                <button type="button" data-testid="rotate-ccw" style={{ ...controlStyle, minHeight: 28, padding: "2px 8px" }} onClick={() => edit(rotateBlock(session.document, selectedId, -15), session)}>↺ -15°</button>
                <button type="button" data-testid="rotate-cw" style={{ ...controlStyle, minHeight: 28, padding: "2px 8px" }} onClick={() => edit(rotateBlock(session.document, selectedId, 15), session)}>↻ +15°</button>
              </div>

              {/* Layers Row */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", paddingTop: 4, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <span style={{ fontSize: 8, fontWeight: 900, color: "#FFD700" }}>LAYERS:</span>
                <button type="button" data-testid="layer-bring-to-front" style={{ ...controlStyle, minHeight: 26, fontSize: 8, padding: "2px 8px" }} onClick={() => edit(bringMagnetToFront(session.document, selectedId), session)}>
                  ⤒ Bring to Front
                </button>
                <button type="button" data-testid="layer-step-forward" style={{ ...controlStyle, minHeight: 26, fontSize: 8, padding: "2px 8px" }} onClick={() => edit(raiseMagnetLayer(session.document, selectedId), session)}>
                  ↑ Forward
                </button>
                <button type="button" data-testid="layer-step-backward" style={{ ...controlStyle, minHeight: 26, fontSize: 8, padding: "2px 8px" }} onClick={() => edit(lowerMagnetLayer(session.document, selectedId), session)}>
                  ↓ Backward
                </button>
                <button type="button" data-testid="layer-send-to-back" style={{ ...controlStyle, minHeight: 26, fontSize: 8, padding: "2px 8px" }} onClick={() => edit(sendMagnetToBack(session.document, selectedId), session)}>
                  ⤓ Send to Back
                </button>
              </div>
            </div>
          );
        })() : null}
        <div data-testid="studio-nav" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <button
              type="button"
              data-testid="studio-back"
              style={controlStyle}
              onClick={() => {
                if (toolPath.length > 1) setToolPath((path) => path.slice(0, -1) as Array<"YOUR PAGE" | "BACKGROUND">);
                else requestClose();
              }}
            >
              ‹ BACK
            </button>
            <strong style={{ flex: 1 }}>{toolPath[toolPath.length - 1]}</strong>
            <button
              type="button"
              data-testid="view-your-page"
              style={controlStyle}
              disabled={!publicSlug}
              title={publicSlug ? "Open your public profile page" : "Public address is not ready yet"}
              onClick={openPublishedPage}
            >
              VIEW YOUR PAGE
            </button>
            <button
              type="button"
              data-testid="share-your-page"
              style={controlStyle}
              disabled={!publicSlug}
              onClick={() => void sharePublishedPage()}
            >
              SHARE YOUR PAGE
            </button>
            <button
              type="button"
              data-testid="show-identity-qr"
              style={controlStyle}
              disabled={!publicSlug}
              onClick={() => setCardQrOpen((open) => !open)}
            >
              SHOW QR
            </button>
            {onStepWorkspace ? (
              <>
                <button type="button" data-testid="studio-sibling-prev" aria-label="Previous workspace" style={controlStyle} onClick={() => onStepWorkspace(-1)}>‹</button>
                <button type="button" data-testid="studio-sibling-next" aria-label="Next workspace" style={controlStyle} onClick={() => onStepWorkspace(1)}>›</button>
              </>
            ) : null}
            <button type="button" data-testid="studio-nav-close" aria-label="Close YOUR PAGE" style={controlStyle} onClick={() => requestClose()}>×</button>
          </div>
          {cardQrOpen && publicSlug && cardOrigin ? (
            <div data-testid="identity-qr-panel" style={{ marginBottom: 12, padding: 12, borderRadius: 12, border: "1px solid rgba(0,255,255,0.35)" }}>
              <div data-testid="digital-business-card" style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", marginBottom: 8 }}>MY DIGITAL BUSINESS CARD</div>
              <div style={{ background: "#fff", padding: 8, width: "fit-content", borderRadius: 8 }}>
                <QRCodeSVG value={`${cardOrigin}${canonicalIdentityCardPath(publicSlug)}`} size={180} bgColor="#ffffff" fgColor="#050510" level="M" />
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                <a data-testid="view-link-card" href={canonicalIdentityCardPath(publicSlug)} style={{ color: "#00FFFF", fontSize: 11, fontWeight: 800 }}>VIEW LINK CARD</a>
                <button
                  type="button"
                  data-testid="share-card"
                  onClick={() => void navigator.clipboard?.writeText(`${cardOrigin}${canonicalIdentityCardPath(publicSlug)}`)}
                  style={{ background: "none", border: "none", color: "#fff", fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", padding: 0 }}
                >
                  SHARE CARD
                </button>
                <a href="/settings/profile" style={{ color: "#fff", fontSize: 11, fontWeight: 800 }}>MANAGE PUBLIC LINKS</a>
              </div>
              {cardDeck.length > 0 ? (
                <div data-testid="card-link-order" style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                  {cardDeck.map((link, index) => (
                    <div key={link.id} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ flex: 1, fontSize: 11, fontWeight: 800, opacity: link.hidden ? 0.4 : 1 }}>{link.label}</span>
                      <button type="button" style={controlStyle} disabled={index === 0} onClick={() => {
                        const next = cardDeck.slice();
                        const previous = next[index - 1];
                        if (!previous) return;
                        next[index - 1] = link;
                        next[index] = previous;
                        void saveCardDeck(next);
                      }}>UP</button>
                      <button type="button" style={controlStyle} disabled={index === cardDeck.length - 1} onClick={() => {
                        const next = cardDeck.slice();
                        const following = next[index + 1];
                        if (!following) return;
                        next[index + 1] = link;
                        next[index] = following;
                        void saveCardDeck(next);
                      }}>DOWN</button>
                      <button type="button" style={controlStyle} onClick={() => {
                        const next = cardDeck.map((item) => item.id === link.id ? { ...item, hidden: !item.hidden } : item);
                        void saveCardDeck(next);
                      }}>{link.hidden ? "SHOW" : "HIDE"}</button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          <div data-testid="studio-workspace-bar" style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <button type="button" data-testid="studio-workspace-toggle" style={controlStyle} onClick={() => setWorkspace((current) => current === "FULL" ? "DOCKED" : "FULL")}>
              {workspace === "FULL" ? "Dock" : "Full screen"}
            </button>
            {workspace === "FULL" ? (
              <button type="button" data-testid="studio-tools-toggle" style={controlStyle} onClick={() => setToolsOpen((current) => !current)}>
                {toolsOpen ? "Hide tools" : "Show tools"}
              </button>
            ) : null}
          </div>
          <p
            data-testid="studio-status"
            data-phase={session.phase}
            data-persistence={session.persistenceState.toLowerCase()}
            data-revision={session.expectedRevision ?? "none"}
            role={session.persistenceState === "LOCAL" || session.phase === "SAVE_FAILED" ? "alert" : "status"}
            style={{
              color: session.persistenceState === "LOCAL" || session.phase === "SAVE_FAILED" ? "#FFB454" : undefined,
              fontWeight: session.persistenceState === "LOCAL" || session.phase === "SAVE_FAILED" ? 800 : undefined,
            }}
          >
            {studioStatusLabel(session)}
          </p>
          {session.persistenceState === "LOCAL" ? (
            <p data-testid="studio-local-draft-warning" role="alert" style={{ color: "#FFB454", fontSize: 12, fontWeight: 800 }}>
              LOCAL DRAFT (NOT PERSISTED). Your edits stay here temporarily; retry Save when the server is available.
            </p>
          ) : null}
          {session.phase === "CONFLICT" ? (
            <button
              type="button"
              data-testid="studio-reload"
              onClick={() => {
                void port.getOwnerDraft(actor, profileKind).then((fresh) => {
                  if (fresh.ok && fresh.mode === "DRAFT") {
                    setSession(reloadAfterConflict(session, fresh.document, fresh.revisionNumber));
                  }
                });
              }}
            >
              Reload saved draft
            </button>
          ) : null}
          <div data-studio-tools="" style={workspace === "FULL" && !toolsOpen ? { display: "none" } : undefined}>
          <div data-testid="studio-viewports">
            {VIEWPORTS.map((viewport) => (
              <button key={viewport} type="button" data-testid={`viewport-${viewport}`} aria-pressed={session.viewport === viewport} style={controlStyle} onClick={() => setSession({ ...session, viewport })}>
                {viewport}
              </button>
            ))}
            <button type="button" data-testid="studio-preview-toggle" aria-pressed={previewOpen} style={controlStyle} onClick={() => setPreviewOpen((current) => !current)}>{previewOpen ? "Edit" : "Preview"}</button>
          </div>
          {previewOpen ? (
            <div data-testid="studio-preview-devices">
              {(["DESKTOP", "TABLET", "PHONE", "PUBLIC"] as const).map((device) => (
                <button key={device} type="button" data-testid={`preview-device-${device}`} aria-pressed={previewDevice === device} style={controlStyle} onClick={() => setPreviewDevice(device)}>{device}</button>
              ))}
            </div>
          ) : null}
          <div data-testid="studio-workshop" data-mode={authorMode}>
            <button type="button" style={controlStyle} data-testid="studio-mode-easy" aria-pressed={authorMode === "EASY"} onClick={() => setAuthorMode("EASY")}>EASY</button>
            <button type="button" style={controlStyle} data-testid="studio-mode-pro" aria-pressed={authorMode === "PRO"} onClick={() => setAuthorMode("PRO")}>PRO</button>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44 }}>
              Your color
              <input
                type="color"
                data-testid="studio-accent-color"
                aria-label="Your color"
                value={session.document.theme.accentColorHex}
                onChange={(event) => edit(setAccentColor(session.document, event.target.value), session)}
              />
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44 }}>
              Word color
              <input
                type="color"
                data-testid="studio-word-color"
                aria-label="Word color"
                value={session.document.sections.flatMap((section) => section.blocks).find((block) => block.style.colorHex)?.style.colorHex ?? "#FF2DAA"}
                onChange={(event) => edit(setWritingColor(session.document, event.target.value), session)}
              />
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44 }}>
              Page color
              <input
                type="color"
                data-testid="studio-page-color"
                aria-label="Page color"
                value={session.document.theme.surfaceColorHex ?? "#140010"}
                onChange={(event) => edit(setPageSurface(session.document, event.target.value), session)}
              />
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44 }}>
              Underlay
              <input
                type="color"
                data-testid="studio-underlay-color"
                aria-label="Underlay"
                defaultValue="#140018"
                onChange={(event) => {
                  const sectionId = targetSectionId(session.document, selectedId, selectedSectionId);
                  if (sectionId) edit(setUnderlay(session.document, sectionId, colorTile(`tile_underlay_${sectionId}`, event.target.value)), session);
                }}
              />
            </label>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44 }}>
              Atmosphere
              <select
                data-testid="studio-atmosphere"
                aria-label="Atmosphere"
                value={session.document.atmosphere ?? "NONE"}
                onChange={(event) => edit(setAtmosphere(session.document, event.target.value as PublicPageAtmosphere), session)}
              >
                {PUBLIC_PAGE_ATMOSPHERES.map((atmosphere) => (
                  <option key={atmosphere} value={atmosphere}>{atmosphere}</option>
                ))}
              </select>
            </label>
            <span data-testid="studio-pattern">
              {PUBLIC_PAGE_PATTERN_IDS.map((patternId) => (
                <button
                  key={patternId}
                  type="button"
                  data-testid={`studio-pattern-${patternId}`}
                  style={controlStyle}
                  onClick={() => {
                    const sectionId = targetSectionId(session.document, selectedId, selectedSectionId);
                    const tile = patternTile(`tile_pattern_${sectionId ?? "world"}_${patternId}`, patternId as PublicPagePatternId);
                    if (!tile) return;
                    if (sectionId) edit(setSectionBackground(session.document, sectionId, tile), session);
                    else edit(setWorldBackground(session.document, tile), session);
                  }}
                >
                  {patternId === "glitter" ? "Glitter dust" : patternId === "starburst" ? "Starburst" : patternId === "scanlines" ? "Neon scanlines" : patternId === "cyber_mesh" ? "Cyber mesh" : "Dark carbon"}
                </button>
              ))}
            </span>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44 }}>
              Overlay
              <input
                type="color"
                data-testid="studio-overlay-color"
                aria-label="Overlay"
                defaultValue="#FF2DAA"
                onChange={(event) => {
                  const sectionId = targetSectionId(session.document, selectedId, selectedSectionId);
                  if (sectionId) edit(setOverlay(session.document, sectionId, washTile(`tile_overlay_${sectionId}`, event.target.value, 34)), session);
                }}
              />
            </label>
            <button type="button" style={controlStyle} data-testid="studio-clear-underlay" onClick={() => { const sectionId = targetSectionId(session.document, selectedId, selectedSectionId); if (sectionId) edit(clearUnderlay(session.document, sectionId), session); }}>Clear underlay</button>
            <button type="button" style={controlStyle} data-testid="studio-clear-overlay" onClick={() => { const sectionId = targetSectionId(session.document, selectedId, selectedSectionId); if (sectionId) edit(clearOverlay(session.document, sectionId), session); }}>Clear overlay</button>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44 }}>
              Overlay strength
              <input
                type="range"
                min={0}
                max={70}
                defaultValue={34}
                data-testid="studio-overlay-opacity"
                aria-label="Overlay strength"
                onChange={(event) => {
                  const sectionId = targetSectionId(session.document, selectedId, selectedSectionId);
                  if (!sectionId) return;
                  const strength = Number(event.target.value);
                  if (strength <= 0) {
                    edit(clearOverlay(session.document, sectionId), session);
                    return;
                  }
                  const current = session.document.sections.find((section) => section.sectionId === sectionId)?.overlay?.colorHex ?? "#FF2DAA";
                  edit(setOverlay(session.document, sectionId, washTile(`tile_overlay_${sectionId}`, current, strength)), session);
                }}
              />
            </label>
            {selectedId ? (
              <span data-testid="studio-object-effects">
                <button type="button" style={controlStyle} data-testid="studio-flicker-object" onClick={() => edit(setBlockEffect(session.document, selectedId, "flicker"), session)}>Flicker this</button>
                <button type="button" style={controlStyle} data-testid="studio-glow-object" onClick={() => edit(setBlockEffect(session.document, selectedId, "glow"), session)}>Glow this</button>
                <button type="button" style={controlStyle} data-testid="studio-clear-effect" onClick={() => edit(setBlockEffect(session.document, selectedId, null), session)}>Stop effect</button>
                <button type="button" style={controlStyle} data-testid="studio-neon-edge" onClick={() => edit(patchBlockStyle(session.document, selectedId, { borderWidthPx: 2, textGlow: true }), session)}>Neon edge</button>
                <button type="button" style={controlStyle} data-testid="studio-clear-edge" onClick={() => edit(patchBlockStyle(session.document, selectedId, { borderWidthPx: 0 }), session)}>No edge</button>
              </span>
            ) : null}
            <button
              type="button"
              style={controlStyle}
              data-testid="studio-neon-flicker"
              aria-pressed={session.document.theme.flickerPlace === "MOTTO"}
              onClick={() => {
                const on = session.document.theme.flickerPlace === "MOTTO";
                edit(setFlickerPlace(session.document, on ? "OFF" : "MOTTO"), session);
              }}
            >
              Neon flicker
            </button>
            <button type="button" style={controlStyle} data-testid="studio-bright-start" onClick={() => edit(applyBrightStart(session.document), session)}>Start this look</button>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44 }}>
              Link
              <input
                data-testid="studio-link-url"
                aria-label="Link"
                value={linkDraft}
                onChange={(event) => setLinkDraft(event.target.value)}
                placeholder="Paste a Spotify, YouTube, or social link"
                style={{ minHeight: 44, minWidth: 220 }}
              />
            </label>
            <button
              type="button"
              style={controlStyle}
              data-testid="studio-add-link"
              onClick={() => {
                const next = addPageLink(session.document, linkDraft);
                if (!next) return;
                edit(next, session);
                setLinkDraft("");
              }}
            >
              Add link
            </button>
            <button type="button" style={controlStyle} data-testid="studio-preview-wider" onClick={() => { const id = previewTarget(session.document, selectedId); if (id) edit(resizePreview(session.document, id, { w: 8 }), session); }}>Wider</button>
            <button type="button" style={controlStyle} data-testid="studio-preview-taller" onClick={() => { const id = previewTarget(session.document, selectedId); if (id) edit(resizePreview(session.document, id, { h: 6 }), session); }}>Taller</button>
            <button type="button" style={controlStyle} data-testid="studio-preview-rectangle" onClick={() => { const id = previewTarget(session.document, selectedId); if (id) edit(reshapePreview(session.document, id, "RECTANGLE"), session); }}>Square</button>
            <button type="button" style={controlStyle} data-testid="studio-preview-rounded" onClick={() => { const id = previewTarget(session.document, selectedId); if (id) edit(reshapePreview(session.document, id, "ROUNDED"), session); }}>Rounded</button>
            <button type="button" style={controlStyle} data-testid="studio-preview-circle" onClick={() => { const id = previewTarget(session.document, selectedId); if (id) edit(reshapePreview(session.document, id, "CIRCLE"), session); }}>Circle</button>
            <button type="button" style={controlStyle} data-testid="studio-add-section" onClick={() => edit(addSection(session.document, "FULL"), session)}>Add section</button>
            <button type="button" style={controlStyle} data-testid="studio-duplicate-section" onClick={() => { const sectionId = targetSectionId(session.document, selectedId, selectedSectionId); if (sectionId) edit(duplicateSectionPresentation(session.document, sectionId), session); }}>Duplicate section</button>
            <button type="button" style={controlStyle} data-testid="studio-height-screen" onClick={() => { const sectionId = targetSectionId(session.document, selectedId, selectedSectionId); if (sectionId) edit(setSectionHeight(session.document, sectionId, "FULL_SCREEN"), session); }}>Full screen scene</button>
            <button type="button" style={controlStyle} data-testid="studio-height-auto" onClick={() => { const sectionId = targetSectionId(session.document, selectedId, selectedSectionId); if (sectionId) edit(setSectionHeight(session.document, sectionId, "AUTO"), session); }}>Fit scene</button>
            <button type="button" style={controlStyle} data-testid="studio-undo" onClick={() => setSession(undoEdit(session))}>Undo</button>
            <button type="button" style={controlStyle} data-testid="studio-redo" onClick={() => setSession(redoEdit(session))}>Redo</button>
            <button
              type="button"
              style={controlStyle}
              data-testid="studio-supercharge"
              onClick={() => setSession({ ...session, proposal: proposeSupercharge(session.document) })}
            >
              Supercharge
            </button>
            {authorMode === "PRO" ? (
              <span data-testid="studio-pro-tools">
                {(["FULL", "SPLIT_V_50", "SPLIT_H_50", "QUAD", "COLLAGE", "FREEFORM"] as PublicPageSectionLayout[]).map((layout) => (
                  <button
                    key={layout}
                    type="button"
                    style={controlStyle}
                    data-testid={`studio-layout-${layout}`}
                    onClick={() => {
                      const section = session.document.sections.find((item) => item.sectionId === targetSectionId(session.document, selectedId, selectedSectionId));
                      if (section) edit(setSectionLayout(session.document, section.sectionId, layout), session);
                    }}
                  >
                    {layout}
                  </button>
                ))}
                <button type="button" style={controlStyle} data-testid="studio-opening-compact" onClick={() => edit(setOpening(session.document, "COMPACT"), session)}>Compact opening</button>
                <button
                  type="button"
                  style={controlStyle}
                  data-testid="studio-section-taller"
                  onClick={() => {
                    const section = session.document.sections.find((item) => item.sectionId === targetSectionId(session.document, selectedId, selectedSectionId));
                    if (section) edit(setSectionMinHeight(session.document, section.sectionId, (section.minHeightPx ?? 420) + 80), session);
                  }}
                >
                  Taller
                </button>
                <button
                  type="button"
                  style={controlStyle}
                  data-testid="studio-section-shorter"
                  onClick={() => {
                    const section = session.document.sections.find((item) => item.sectionId === targetSectionId(session.document, selectedId, selectedSectionId));
                    if (section) edit(setSectionMinHeight(session.document, section.sectionId, (section.minHeightPx ?? 420) - 80), session);
                  }}
                >
                  Shorter
                </button>
                <button type="button" style={controlStyle} data-testid="studio-world-color" onClick={() => edit(setPageSurface(session.document, "#140018"), session)}>Page color</button>
                {toolPath[toolPath.length - 1] === "BACKGROUND" ? (
                <div data-testid="studio-background-fit">
                  {([
                    ["COVER", "Cover"],
                    ["CONTAIN", "Fit"],
                    ["ORIGINAL", "Original"],
                    ["CUSTOM", "Custom"],
                    ["STRETCH", "Stretch"],
                    ["TILE", "Tile"],
                    ["REPEAT_X", "Repeat across"],
                    ["REPEAT_Y", "Repeat down"],
                  ] as Array<[PublicPageFit, string]>).map(([fit, label]) => (
                    <button
                      key={fit}
                      type="button"
                      style={controlStyle}
                      data-testid={`studio-bg-${fit.toLowerCase()}`}
                      onClick={() => {
                        const scope = backgroundScope(session.document, selectedId, selectedSectionId);
                        if (scope === undefined) {
                          setAddNotice("Page color is the surface. A background picture has to be on the page before it can be scaled.");
                          return;
                        }
                        setAddNotice("");
                        const frame = fit === "CONTAIN" || fit === "CUSTOM" || fit === "ORIGINAL"
                          ? { fit, frameW: fit === "ORIGINAL" ? 42 : 72, frameH: fit === "ORIGINAL" ? 56 : 84, frameX: fit === "ORIGINAL" ? 29 : 14, frameY: 8 }
                          : { fit };
                        edit(presentBackground(session.document, scope, frame), session);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                  <button type="button" style={controlStyle} data-testid="studio-bg-smaller" onClick={() => {
                    const scope = backgroundScope(session.document, selectedId, selectedSectionId);
                    if (scope === undefined) return;
                    edit(scaleBackground(session.document, scope, -8), session);
                  }}>Smaller</button>
                  <button type="button" style={controlStyle} data-testid="studio-bg-larger" onClick={() => {
                    const scope = backgroundScope(session.document, selectedId, selectedSectionId);
                    if (scope === undefined) return;
                    edit(scaleBackground(session.document, scope, 8), session);
                  }}>Larger</button>
                  <button type="button" style={controlStyle} data-testid="studio-bg-left" onClick={() => {
                    const scope = backgroundScope(session.document, selectedId, selectedSectionId);
                    if (scope === undefined) return;
                    edit(moveBackground(session.document, scope, -4, 0), session);
                  }}>Picture left</button>
                  <button type="button" style={controlStyle} data-testid="studio-bg-right" onClick={() => {
                    const scope = backgroundScope(session.document, selectedId, selectedSectionId);
                    if (scope === undefined) return;
                    edit(moveBackground(session.document, scope, 4, 0), session);
                  }}>Picture right</button>
                </div>
                ) : (
                  <button type="button" style={controlStyle} data-testid="studio-open-background" onClick={() => setToolPath(["YOUR PAGE", "BACKGROUND"])}>Background</button>
                )}
                <button
                  type="button"
                  style={controlStyle}
                  data-testid="studio-section-up"
                  onClick={() => {
                    const section = session.document.sections.find((item) => item.sectionId === targetSectionId(session.document, selectedId, selectedSectionId));
                    if (section) edit(moveSection(session.document, section.sectionId, -1), session);
                  }}
                >
                  Section up
                </button>
                <button
                  type="button"
                  style={controlStyle}
                  data-testid="studio-section-down"
                  onClick={() => {
                    const section = session.document.sections.find((item) => item.sectionId === targetSectionId(session.document, selectedId, selectedSectionId));
                    if (section) edit(moveSection(session.document, section.sectionId, 1), session);
                  }}
                >
                  Section down
                </button>
                <button
                  type="button"
                  style={controlStyle}
                  data-testid="studio-section-delete"
                  onClick={() => {
                    const section = session.document.sections.find((item) => item.sectionId === targetSectionId(session.document, selectedId, selectedSectionId));
                    if (section) edit(deleteSection(session.document, section.sectionId), session);
                  }}
                >
                  Delete section
                </button>
              </span>
            ) : null}
          </div>
          <div data-testid="studio-writing" data-workflow="WRITING">
            <label>
              Writing label
              <select
                data-testid="studio-writing-label"
                value={writingLabel}
                onChange={(event) => setWritingLabel(event.target.value as (typeof WRITING_LABELS)[number])}
              >
                {WRITING_LABELS.map((label) => (
                  <option key={label} value={label}>{label}</option>
                ))}
              </select>
            </label>
            {writingLabel === "Custom" ? (
              <label>
                Your title
                <input data-testid="studio-custom-title" value={customTitle} onChange={(event) => setCustomTitle(event.target.value)} />
              </label>
            ) : null}
            <button
              type="button"
              data-testid="studio-add-writing"
              style={controlStyle}
              onClick={() => {
                const title = writingLabel === "Custom" ? customTitle : writingLabel;
                const added = addWritingBox(session.document, capabilities, title);
                if (!added.added || !added.blockId) return;
                setSelectedId(added.blockId);
                setAddNotice("");
                edit(added.document, session);
              }}
            >
              Add writing
            </button>
          </div>
          <div data-testid="studio-photos">
            <label>
              Add a photo
              <input
                ref={photoInputRef}
                data-testid="studio-photo-file"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onClick={() => {
                  if (photoFromShelfRef.current) {
                    photoFromShelfRef.current = false;
                    return;
                  }
                  photoAnchorRef.current = null;
                }}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file || !session) return;
                  void (async () => {
                    const body = new FormData();
                    body.append("file", file);
                    body.append("context", "memory_wall");
                    const uploaded = await fetch("/api/upload", { method: "POST", body, credentials: "include" });
                    const uploadBody = await uploaded.json().catch(() => ({})) as { url?: string; error?: string };
                    if (!uploaded.ok || !uploadBody.url) {
                      setAddNotice(uploadBody.error || "The image upload did not return a file. Nothing was placed.");
                      return;
                    }
                    const registered = await fetch("/api/media/images", {
                      method: "POST",
                      credentials: "include",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ ownerId: pageOwnerId, imageUrl: uploadBody.url, title: file.name, assetType: "IMAGE" }),
                    });
                    const registeredBody = await registered.json().catch(() => ({})) as { asset?: { id?: string }; error?: string };
                    const recordId = registeredBody.asset?.id;
                    if (!registered.ok || !recordId) {
                      setAddNotice(registeredBody.error || "The image library did not return an id. Nothing was placed.");
                      return;
                    }
                    const anchor = photoAnchorRef.current;
                    photoAnchorRef.current = null;
                    const added = dropObject(session.document, "PHOTO", capabilities, recordId);
                    if (!added.added || !added.blockId) {
                      setAddNotice("Photo needs a real record id before it can be placed. Nothing was attached.");
                      return;
                    }
                    setPhotos((current) => [{ id: recordId, title: file.name }, ...current.filter((item) => item.id !== recordId)]);
                    setSelectedId(added.blockId);
                    setAddNotice("");
                    edit(anchor ? centerMagnetOn(added.document, added.blockId, anchor.x, anchor.y) : added.document, session);
                  })();
                }}
              />
            </label>
            {photos.map((photo) => (
              <span key={photo.id}>
                <button type="button" data-testid={`studio-photo-${photo.id}`} style={controlStyle} onClick={() => {
                  const added = dropObject(session.document, "PHOTO", capabilities, photo.id);
                  if (!added.added || !added.blockId) {
                    setAddNotice("Photo needs a real record id before it can be placed. Nothing was attached.");
                    return;
                  }
                  setSelectedId(added.blockId);
                  setAddNotice("");
                  edit(added.document, session);
                }}>{photo.title}</button>
                <button type="button" data-testid={`studio-bg-${photo.id}`} style={controlStyle} onClick={() => {
                  edit(setWorldBackground(session.document, imageTile(`tile_${photo.id}`, photo.id)), session);
                }}>Background</button>
                <button type="button" data-testid={`studio-scene-${photo.id}`} style={controlStyle} onClick={() => {
                  const sectionId = targetSectionId(session.document, selectedId, selectedSectionId);
                  if (!sectionId) return;
                  edit(setSectionBackground(session.document, sectionId, imageTile(`tile_scene_${sectionId}`, photo.id)), session);
                }}>This scene</button>
              </span>
            ))}
          </div>
          <div data-testid="creator-tray" data-category={trayCategory}>
            {/* Live Audition Notification & Control Bar */}
            {auditionSnapshot ? (
              <div
                data-testid="audition-bar"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "linear-gradient(135deg, rgba(255, 45, 170, 0.28) 0%, rgba(170, 45, 255, 0.28) 100%)",
                  border: "1px solid #FF2DAA",
                  marginBottom: 12,
                  boxShadow: "0 4px 16px rgba(255, 45, 170, 0.35)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>👀</span>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.12em" }}>
                      LIVE AUDITION
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>
                      {auditionLabel || "Previewing changes"}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    data-testid="audition-cancel"
                    onClick={cancelAudition}
                    style={{
                      minHeight: 36,
                      padding: "6px 14px",
                      borderRadius: 6,
                      background: "rgba(255, 255, 255, 0.12)",
                      border: "1px solid rgba(255, 255, 255, 0.25)",
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    ✕ CANCEL
                  </button>
                  <button
                    type="button"
                    data-testid="audition-apply"
                    onClick={applyAudition}
                    style={{
                      minHeight: 36,
                      padding: "6px 16px",
                      borderRadius: 6,
                      background: "linear-gradient(135deg, #00FFFF, #00FF88)",
                      border: "none",
                      color: "#050510",
                      fontSize: 10,
                      fontWeight: 900,
                      cursor: "pointer",
                      boxShadow: "0 0 12px rgba(0, 255, 255, 0.4)",
                    }}
                  >
                    ✓ APPLY
                  </button>
                </div>
              </div>
            ) : null}

            {/* Unified Live Stack Action Bar */}
            <div
              data-testid="unified-live-action-bar"
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              <button
                type="button"
                data-testid="primary-quick-add-btn"
                onClick={() => setTrayCategory("DIALOGUE")}
                style={{
                  ...controlStyle,
                  flex: 1,
                  minHeight: 34,
                  fontSize: 10,
                  fontWeight: 900,
                  background: trayCategory === "DIALOGUE" ? "rgba(0, 255, 255, 0.25)" : "rgba(0, 255, 255, 0.12)",
                  border: "1px solid #00FFFF",
                  color: "#00FFFF",
                  cursor: "pointer",
                }}
              >
                + ADD
              </button>
              <button
                type="button"
                data-testid="primary-add-section-btn"
                onClick={() => setTrayCategory("SECTIONS")}
                style={{
                  ...controlStyle,
                  flex: 1,
                  minHeight: 34,
                  fontSize: 10,
                  fontWeight: 900,
                  background: trayCategory === "SECTIONS" ? "rgba(255, 45, 170, 0.25)" : "rgba(255, 45, 170, 0.12)",
                  border: "1px solid #FF2DAA",
                  color: "#FF2DAA",
                  cursor: "pointer",
                }}
              >
                + ADD SECTION
              </button>
              <button
                type="button"
                data-testid="studio-change-layout"
                onClick={handleRequestChangeLayout}
                style={{
                  ...controlStyle,
                  flex: 1,
                  minHeight: 34,
                  fontSize: 10,
                  fontWeight: 900,
                  background: "rgba(255, 215, 0, 0.12)",
                  border: "1px solid #FFD700",
                  color: "#FFD700",
                  cursor: "pointer",
                }}
              >
                CHANGE LAYOUT
              </button>
            </div>

            {/* Mobile View Toggle Bar (Phone / Galaxy S25 Ultra) */}
            <div
              data-testid="mobile-view-toggle"
              style={{
                display: "flex",
                gap: 6,
                marginBottom: 10,
                padding: 4,
                borderRadius: 8,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
              }}
            >
              <button
                type="button"
                data-testid="view-mode-canvas"
                aria-pressed={mobileView === "CANVAS"}
                onClick={() => { setMobileView("CANVAS"); setPreviewOpen(true); }}
                style={{
                  ...controlStyle,
                  flex: 1,
                  minHeight: 34,
                  fontSize: 10,
                  fontWeight: 800,
                  borderRadius: 6,
                  border: mobileView === "CANVAS" ? "1px solid #00FFFF" : "none",
                  background: mobileView === "CANVAS" ? "rgba(0, 255, 255, 0.18)" : "transparent",
                  color: mobileView === "CANVAS" ? "#00FFFF" : "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                }}
              >
                👀 CANVAS
              </button>
              <button
                type="button"
                data-testid="view-mode-split"
                aria-pressed={mobileView === "SPLIT"}
                onClick={() => { setMobileView("SPLIT"); setPreviewOpen(true); }}
                style={{
                  ...controlStyle,
                  flex: 1,
                  minHeight: 34,
                  fontSize: 10,
                  fontWeight: 800,
                  borderRadius: 6,
                  border: mobileView === "SPLIT" ? "1px solid #FF2DAA" : "none",
                  background: mobileView === "SPLIT" ? "rgba(255, 45, 170, 0.18)" : "transparent",
                  color: mobileView === "SPLIT" ? "#FF2DAA" : "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                }}
              >
                ◫ SPLIT
              </button>
              <button
                type="button"
                data-testid="view-mode-tools"
                aria-pressed={mobileView === "TOOLS"}
                onClick={() => setMobileView("TOOLS")}
                style={{
                  ...controlStyle,
                  flex: 1,
                  minHeight: 34,
                  fontSize: 10,
                  fontWeight: 800,
                  borderRadius: 6,
                  border: mobileView === "TOOLS" ? "1px solid #FFD700" : "none",
                  background: mobileView === "TOOLS" ? "rgba(255, 215, 0, 0.18)" : "transparent",
                  color: mobileView === "TOOLS" ? "#FFD700" : "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                }}
              >
                🛠 TOOLS
              </button>
            </div>

            {/* Creative Categories: Background, Dialogue, Photos, Shapes, Frames, Underlays, Overlays, Effects, Motion, Media, Sections, Layers */}
            <div data-testid="creator-tray-categories" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {[
                { id: "BACKGROUND", label: "Background", testId: "BACKGROUND" },
                { id: "DIALOGUE", label: "Dialogue / Text", testId: "WRITE" },
                { id: "PHOTOS", label: "Photos", testId: "MEDIA" },
                { id: "SHAPES", label: "Shapes", testId: "SHAPES" },
                { id: "FRAMES", label: "Frames / Masks", testId: "FRAMES" },
                { id: "UNDERLAYS", label: "Underlays", testId: "UNDERLAYS" },
                { id: "OVERLAYS", label: "Overlays", testId: "OVERLAYS" },
                { id: "EFFECTS", label: "Effects", testId: "EFFECTS" },
                { id: "MOTION", label: "Motion", testId: "MOTION" },
                { id: "MEDIA", label: "Media / Player", testId: "MEDIA_PLAYER" },
                { id: "SECTIONS", label: "Sections", testId: "SECTIONS" },
                { id: "LAYERS", label: "Layers", testId: "LAYERS" },
                { id: "ADD", label: "+ All Catalog", testId: "ADD" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  data-testid={`tray-category-${cat.testId}`}
                  aria-pressed={trayCategory === cat.id || (cat.id === "DIALOGUE" && trayCategory === "WRITE") || (cat.id === "PHOTOS" && trayCategory === "MEDIA")}
                  style={{
                    ...controlStyle,
                    fontSize: 10,
                    fontWeight: 800,
                    borderRadius: 6,
                    padding: "6px 10px",
                    background: trayCategory === cat.id ? "rgba(255, 45, 170, 0.25)" : "rgba(255,255,255,0.04)",
                    border: trayCategory === cat.id ? "1px solid #FF2DAA" : "1px solid rgba(255,255,255,0.12)",
                    color: trayCategory === cat.id ? "#FF2DAA" : "#fff",
                    cursor: "pointer",
                  }}
                  onClick={() => setTrayCategory(cat.id as any)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <button type="button" data-testid="creator-tray-up" aria-label="Scroll tray up" style={controlStyle} onClick={() => trayRef.current?.scrollBy({ top: -120, behavior: "smooth" })}>▲</button>
            <div
              ref={trayRef}
              data-testid="creator-tray-scroller"
              tabIndex={0}
              onWheel={(event) => event.stopPropagation()}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") trayRef.current?.scrollBy({ top: 80 });
                if (event.key === "ArrowUp") trayRef.current?.scrollBy({ top: -80 });
              }}
              style={{ maxHeight: 260, overflowY: "auto", overflowX: "hidden", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: 8, padding: 10 }}
            >
              {/* 1. BACKGROUND */}
              {trayCategory === "BACKGROUND" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>SURFACE COLOR</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      Page color:
                      <input
                        type="color"
                        data-testid="studio-page-color"
                        aria-label="Page color"
                        value={session.document.theme.surfaceColorHex ?? "#FFFFFF"}
                        onChange={(event) => edit(setPageSurface(session.document, event.target.value), session)}
                      />
                    </label>
                    <button
                      type="button"
                      data-testid="studio-bg-reset-white"
                      style={{
                        ...controlStyle,
                        minHeight: 32,
                        padding: "4px 12px",
                        fontSize: 10,
                        fontWeight: 800,
                        borderRadius: 6,
                        border: "1px solid #FFFFFF",
                        background: "rgba(255, 255, 255, 0.2)",
                        color: "#FFFFFF",
                        cursor: "pointer",
                      }}
                      onClick={() => edit(setPageSurface(session.document, "#FFFFFF"), session)}
                    >
                      Reset to White
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                    {[
                      { hex: "#FFFFFF", label: "White" },
                      { hex: "#050510", label: "Deep Space" },
                      { hex: "#00FFFF", label: "Cyan" },
                      { hex: "#FF2DAA", label: "Fuchsia" },
                      { hex: "#FFD700", label: "Gold" },
                      { hex: "#1A0A2A", label: "Purple" },
                      { hex: "#7C0030", label: "Crimson" },
                    ].map((swatch) => (
                      <button
                        key={swatch.hex}
                        type="button"
                        data-testid={`studio-bg-swatch-${swatch.label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                        title={swatch.label}
                        onClick={() => edit(setPageSurface(session.document, swatch.hex), session)}
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 4,
                          background: swatch.hex,
                          border: (session.document.theme.surfaceColorHex ?? "#FFFFFF").toUpperCase() === swatch.hex.toUpperCase() ? "2px solid #FFD700" : "1px solid rgba(255,255,255,0.4)",
                          cursor: "pointer",
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>ATMOSPHERE</div>
                  <select
                    data-testid="studio-atmosphere"
                    aria-label="Atmosphere"
                    value={session.document.atmosphere ?? "NONE"}
                    onChange={(event) => startAudition("Atmosphere: " + event.target.value, setAtmosphere(session.document, event.target.value as PublicPageAtmosphere))}
                    style={{ background: "#050510", color: "#fff", padding: 8, borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)" }}
                  >
                    {PUBLIC_PAGE_ATMOSPHERES.map((atm) => (
                      <option key={atm} value={atm}>{atm}</option>
                    ))}
                  </select>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>BACKGROUND PATTERNS</div>
                  <div data-testid="studio-pattern" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {PUBLIC_PAGE_PATTERN_IDS.map((patternId) => (
                      <button
                        key={patternId}
                        type="button"
                        data-testid={`studio-pattern-${patternId}`}
                        style={controlStyle}
                        onClick={() => {
                          const sectionId = targetSectionId(session.document, selectedId, selectedSectionId);
                          const tile = patternTile(`tile_pattern_${sectionId ?? "world"}_${patternId}`, patternId as PublicPagePatternId);
                          if (!tile) return;
                          const nextDoc = sectionId ? setSectionBackground(session.document, sectionId, tile) : setWorldBackground(session.document, tile);
                          startAudition("Pattern: " + patternId, nextDoc);
                        }}
                      >
                        {patternId === "glitter" ? "Glitter dust" : patternId === "starburst" ? "Starburst" : patternId === "scanlines" ? "Neon scanlines" : patternId === "cyber_mesh" ? "Cyber mesh" : "Dark carbon"}
                      </button>
                    ))}
                  </div>
                  {photos.length > 0 ? (
                    <>
                      <div style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>PHOTO BACKGROUNDS</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {photos.map((photo) => (
                          <button
                            key={photo.id}
                            type="button"
                            data-testid={`studio-bg-${photo.id}`}
                            style={controlStyle}
                            onClick={() => startAudition("Background photo: " + photo.title, setWorldBackground(session.document, imageTile(`tile_${photo.id}`, photo.id)))}
                          >
                            🌌 {photo.title}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}

              {/* 2. DIALOGUE / TEXT */}
              {trayCategory === "DIALOGUE" || trayCategory === "WRITE" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>WORDS & TEXT</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    <button
                      type="button"
                      data-testid="tray-tool-text"
                      style={{
                        ...controlStyle,
                        minHeight: 38,
                        padding: "8px 16px",
                        borderRadius: 6,
                        background: "linear-gradient(135deg, rgba(0,255,255,0.25), rgba(255,45,170,0.25))",
                        border: "2px solid #00FFFF",
                        color: "#00FFFF",
                        fontWeight: 900,
                        fontSize: 11,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                      onClick={() => handleCreateTextObject("TEXT")}
                    >
                      <span style={{ fontSize: 14, fontWeight: 900 }}>[ T ]</span>
                      <span>Text</span>
                    </button>
                    <button
                      type="button"
                      data-testid="tray-tool-headline"
                      style={{ ...controlStyle, minHeight: 38, padding: "8px 14px", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, cursor: "pointer", fontWeight: 800 }}
                      onClick={() => handleCreateTextObject("HEADLINE")}
                    >
                      Title / Headline
                    </button>
                    <button
                      type="button"
                      data-testid="tray-tool-dialogue"
                      style={{ ...controlStyle, minHeight: 38, padding: "8px 14px", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, cursor: "pointer", fontWeight: 800 }}
                      onClick={() => handleCreateTextObject("DIALOGUE")}
                    >
                      Dialogue
                    </button>
                    <button
                      type="button"
                      data-testid="tray-tool-quote"
                      style={{ ...controlStyle, minHeight: 38, padding: "8px 14px", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 6, cursor: "pointer", fontWeight: 800 }}
                      onClick={() => handleCreateTextObject("QUOTE")}
                    >
                      Quote
                    </button>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#FF2DAA", letterSpacing: "0.1em" }}>DIALOGUE SHAPES</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {(["SPEECH_BUBBLE", "NOTE", "CLOUD", "BURST", "TICKET"] as PublicPageMask[]).map((shapeId) => (
                      <button
                        key={shapeId}
                        type="button"
                        data-testid={`tray-dialogue-${shapeId.toLowerCase()}`}
                        style={controlStyle}
                        onClick={() => placeShape(shapeId)}
                      >
                        {shapeId.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#FF2DAA", letterSpacing: "0.1em" }}>WRITING STARTERS</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {WRITING_LABELS.map((label) => (
                      <button
                        key={label}
                        type="button"
                        data-testid={`tray-write-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                        style={controlStyle}
                        onClick={() => placeWriting(label)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    Text Color:
                    <input
                      type="color"
                      data-testid="studio-word-color"
                      aria-label="Word color"
                      value={session.document.sections.flatMap((section) => section.blocks).find((block) => block.style.colorHex)?.style.colorHex ?? "#FF2DAA"}
                      onChange={(event) => startAudition("Text color " + event.target.value, setWritingColor(session.document, event.target.value))}
                    />
                  </label>
                </div>
              ) : null}

              {/* 3. PHOTOS */}
              {trayCategory === "PHOTOS" || trayCategory === "MEDIA" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#FFD700", letterSpacing: "0.1em" }}>PHOTO LIBRARY</div>
                  {photos.length === 0 ? (
                    <p data-testid="creator-tray-media-hint" style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                      No photos found in library yet. Take or upload one below.
                    </p>
                  ) : null}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {photos.map((photo) => (
                      <button
                        key={photo.id}
                        type="button"
                        data-testid={`studio-photo-${photo.id}`}
                        style={controlStyle}
                        onClick={() => placePhoto(photo.id, photo.title)}
                      >
                        📷 {photo.title}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      data-testid="add-PHOTO_GALLERY"
                      style={controlStyle}
                      onClick={() => {
                        const added = dropObject(session.document, "PHOTO_GALLERY", capabilities);
                        if (added.added && added.blockId) {
                          setSelectedId(added.blockId);
                          startAudition("Add Gallery", added.document);
                        }
                      }}
                    >
                      🖼 Photo Gallery
                    </button>
                  </div>
                </div>
              ) : null}

              {/* 4. SHAPES */}
              {trayCategory === "SHAPES" ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {PUBLIC_PAGE_SHAPES.map((shape) => (
                    <button
                      key={shape.shapeId}
                      type="button"
                      data-testid={`tray-shape-${shape.shapeId}`}
                      style={{ ...controlStyle, display: "inline-flex", alignItems: "center", gap: 8 }}
                      onClick={() => placeShape(shape.shapeId)}
                    >
                      <span aria-hidden="true" style={{ width: 28, height: 28, background: accentColor, clipPath: shape.clipPath, borderRadius: shape.clipPath ? undefined : shape.radius, display: "inline-block" }} />
                      {shape.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {/* 5. FRAMES */}
              {trayCategory === "FRAMES" ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {[
                    { id: "NONE", label: "No Frame" },
                    { id: "THIN", label: "Thin Frame" },
                    { id: "HEAVY", label: "Heavy Frame" },
                    { id: "NEON", label: "Neon Frame" },
                    { id: "POLAROID", label: "Polaroid" },
                    { id: "CARD", label: "Card" },
                    { id: "TORN_PAPER", label: "Torn Paper" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      data-testid={`studio-frame-${f.id.toLowerCase()}`}
                      style={controlStyle}
                      onClick={() => {
                        if (!selectedId) {
                          setAddNotice("Select an object on canvas first to apply this frame.");
                          return;
                        }
                        startAudition("Frame: " + f.label, setMediaFrame(session.document, selectedId, f.id as any));
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              ) : null}

              {/* 6. UNDERLAYS */}
              {trayCategory === "UNDERLAYS" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#AA2DFF", letterSpacing: "0.1em" }}>SECTION UNDERLAY</div>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    Underlay Color:
                    <input
                      type="color"
                      data-testid="studio-underlay-color"
                      aria-label="Underlay"
                      defaultValue="#140018"
                      onChange={(event) => {
                        const sectionId = targetSectionId(session.document, selectedId, selectedSectionId);
                        if (sectionId) startAudition("Section underlay", setUnderlay(session.document, sectionId, colorTile(`tile_underlay_${sectionId}`, event.target.value)));
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    data-testid="studio-clear-underlay"
                    style={controlStyle}
                    onClick={() => {
                      const sectionId = targetSectionId(session.document, selectedId, selectedSectionId);
                      if (sectionId) startAudition("Clear underlay", clearUnderlay(session.document, sectionId));
                    }}
                  >
                    Clear underlay
                  </button>
                </div>
              ) : null}

              {/* 7. OVERLAYS */}
              {trayCategory === "OVERLAYS" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#FF2DAA", letterSpacing: "0.1em" }}>SECTION OVERLAY</div>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    Overlay Color:
                    <input
                      type="color"
                      data-testid="studio-overlay-color"
                      aria-label="Overlay"
                      defaultValue="#FF2DAA"
                      onChange={(event) => {
                        const sectionId = targetSectionId(session.document, selectedId, selectedSectionId);
                        if (sectionId) startAudition("Section overlay", setOverlay(session.document, sectionId, washTile(`tile_overlay_${sectionId}`, event.target.value, 34)));
                      }}
                    />
                  </label>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    Overlay Strength:
                    <input
                      type="range"
                      min={0}
                      max={70}
                      defaultValue={34}
                      data-testid="studio-overlay-opacity"
                      aria-label="Overlay strength"
                      onChange={(event) => {
                        const sectionId = targetSectionId(session.document, selectedId, selectedSectionId);
                        if (!sectionId) return;
                        const strength = Number(event.target.value);
                        if (strength <= 0) {
                          startAudition("Clear overlay", clearOverlay(session.document, sectionId));
                          return;
                        }
                        const current = session.document.sections.find((section) => section.sectionId === sectionId)?.overlay?.colorHex ?? "#FF2DAA";
                        startAudition("Overlay opacity " + strength, setOverlay(session.document, sectionId, washTile(`tile_overlay_${sectionId}`, current, strength)));
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    data-testid="studio-clear-overlay"
                    style={controlStyle}
                    onClick={() => {
                      const sectionId = targetSectionId(session.document, selectedId, selectedSectionId);
                      if (sectionId) startAudition("Clear overlay", clearOverlay(session.document, sectionId));
                    }}
                  >
                    Clear overlay
                  </button>
                </div>
              ) : null}

              {/* 8. EFFECTS */}
              {trayCategory === "EFFECTS" ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <button
                    type="button"
                    data-testid="studio-flicker-object"
                    style={controlStyle}
                    onClick={() => {
                      if (!selectedId) { setAddNotice("Select an object first."); return; }
                      startAudition("Flicker object", setBlockEffect(session.document, selectedId, "flicker"));
                    }}
                  >
                    ⚡ Flicker this
                  </button>
                  <button
                    type="button"
                    data-testid="studio-glow-object"
                    style={controlStyle}
                    onClick={() => {
                      if (!selectedId) { setAddNotice("Select an object first."); return; }
                      startAudition("Glow object", setBlockEffect(session.document, selectedId, "glow"));
                    }}
                  >
                    ✨ Glow this
                  </button>
                  <button
                    type="button"
                    data-testid="studio-clear-effect"
                    style={controlStyle}
                    onClick={() => {
                      if (!selectedId) return;
                      startAudition("Stop effect", setBlockEffect(session.document, selectedId, null));
                    }}
                  >
                    Stop effect
                  </button>
                  <button
                    type="button"
                    data-testid="studio-neon-edge"
                    style={controlStyle}
                    onClick={() => {
                      if (!selectedId) return;
                      startAudition("Neon edge", patchBlockStyle(session.document, selectedId, { borderWidthPx: 2, textGlow: true }));
                    }}
                  >
                    Neon edge
                  </button>
                  <button
                    type="button"
                    data-testid="studio-clear-edge"
                    style={controlStyle}
                    onClick={() => {
                      if (!selectedId) return;
                      startAudition("No edge", patchBlockStyle(session.document, selectedId, { borderWidthPx: 0 }));
                    }}
                  >
                    No edge
                  </button>
                </div>
              ) : null}

              {/* 9. MOTION */}
              {trayCategory === "MOTION" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    type="button"
                    data-testid="studio-neon-flicker"
                    aria-pressed={session.document.theme.flickerPlace === "MOTTO"}
                    style={controlStyle}
                    onClick={() => {
                      const on = session.document.theme.flickerPlace === "MOTTO";
                      startAudition("Motto flicker " + (on ? "OFF" : "ON"), setFlickerPlace(session.document, on ? "OFF" : "MOTTO"));
                    }}
                  >
                    {session.document.theme.flickerPlace === "MOTTO" ? "✓ Motto Flicker Active" : "Flicker Motto"}
                  </button>
                </div>
              ) : null}

              {/* 10. MEDIA / PLAYER */}
              {trayCategory === "MEDIA" ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <button
                    type="button"
                    data-testid="add-TRACK"
                    style={controlStyle}
                    onClick={() => {
                      const added = dropObject(session.document, "TRACK", capabilities, bindingDraft);
                      if (added.added && added.blockId) {
                        setSelectedId(added.blockId);
                        startAudition("Add Song", added.document);
                      }
                    }}
                  >
                    🎵 Song / Track
                  </button>
                  <button
                    type="button"
                    data-testid="add-PLAYLIST"
                    style={controlStyle}
                    onClick={() => {
                      const added = dropObject(session.document, "PLAYLIST", capabilities, bindingDraft);
                      if (added.added && added.blockId) {
                        setSelectedId(added.blockId);
                        startAudition("Add Playlist", added.document);
                      }
                    }}
                  >
                    📻 Playlist
                  </button>
                  <button
                    type="button"
                    data-testid="add-VIDEO_SNIP"
                    style={controlStyle}
                    onClick={() => {
                      const added = dropObject(session.document, "VIDEO_SNIP", capabilities, bindingDraft);
                      if (added.added && added.blockId) {
                        setSelectedId(added.blockId);
                        startAudition("Add Video Snip", added.document);
                      }
                    }}
                  >
                    🎬 Video Snip
                  </button>
                </div>
              ) : null}

              {/* 11. SECTIONS */}
              {trayCategory === "SECTIONS" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em" }}>ADD STRUCTURED SECTION</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    <button
                      type="button"
                      data-testid="studio-add-section"
                      style={controlStyle}
                      onClick={() => startAudition("Add Full Section", addSection(session.document, "FULL"))}
                    >
                      + Add Section
                    </button>
                    {(["FULL", "SPLIT_V_50", "SPLIT_H_50", "QUAD", "COLLAGE", "FREEFORM"] as PublicPageSectionLayout[]).map((layout) => (
                      <button
                        key={layout}
                        type="button"
                        data-testid={`studio-layout-${layout}`}
                        style={controlStyle}
                        onClick={() => {
                          const section = session.document.sections.find((item) => item.sectionId === targetSectionId(session.document, selectedId, selectedSectionId));
                          if (section) startAudition("Section layout " + layout, setSectionLayout(session.document, section.sectionId, layout));
                        }}
                      >
                        {layout}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      type="button"
                      data-testid="studio-duplicate-section"
                      style={controlStyle}
                      onClick={() => {
                        const sectionId = targetSectionId(session.document, selectedId, selectedSectionId);
                        if (sectionId) startAudition("Duplicate Section", duplicateSectionPresentation(session.document, sectionId));
                      }}
                    >
                      Duplicate section
                    </button>
                    <button
                      type="button"
                      data-testid="studio-height-screen"
                      style={controlStyle}
                      onClick={() => {
                        const sectionId = targetSectionId(session.document, selectedId, selectedSectionId);
                        if (sectionId) startAudition("Full Screen Scene", setSectionHeight(session.document, sectionId, "FULL_SCREEN"));
                      }}
                    >
                      Full screen scene
                    </button>
                    <button
                      type="button"
                      data-testid="studio-height-auto"
                      style={controlStyle}
                      onClick={() => {
                        const sectionId = targetSectionId(session.document, selectedId, selectedSectionId);
                        if (sectionId) startAudition("Fit Scene", setSectionHeight(session.document, sectionId, "AUTO"));
                      }}
                    >
                      Fit scene
                    </button>
                  </div>
                </div>
              ) : null}

              {/* 12. LAYERS */}
              {trayCategory === "LAYERS" ? (
                session.document.sections.flatMap((section) => section.blocks).map((block) => (
                  <div key={block.id} data-testid={`tray-layer-${block.id}`} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 4 }}>
                    <span style={{ flex: 1, fontSize: 11 }}>{block.a11y.label || block.kind}</span>
                    <button type="button" style={controlStyle} onClick={() => { setSelectedId(block.id); startAudition("Layer Forward", raiseMagnetLayer(placeIfFlow(session.document, block.id), block.id)); }}>Forward</button>
                    <button type="button" style={controlStyle} onClick={() => { setSelectedId(block.id); startAudition("Layer Back", lowerMagnetLayer(placeIfFlow(session.document, block.id), block.id)); }}>Back</button>
                  </div>
                ))
              ) : null}

              {/* 13. ALL CATALOG */}
              {trayCategory === "ADD" ? (
                <div data-testid="studio-catalog" data-workflow="ADD">
                  {[...OBJECT_TOOLS.map((tool) => tool.kind), ...GATED_KINDS].map((kind) => {
                    const allowed = blockAddAllowed(kind, capabilities);
                    const label = OBJECT_TOOLS.find((tool) => tool.kind === kind)?.label ?? kind;
                    return (
                      <button
                        key={kind}
                        type="button"
                        disabled={!allowed}
                        data-testid={`add-${kind}`}
                        data-locked={allowed ? "false" : "true"}
                        style={controlStyle}
                        onClick={() => {
                          const added = dropObject(session.document, kind, capabilities, bindingDraft);
                          if (!added.added || !added.blockId) {
                            setAddNotice(`${label} needs a real record id before it can be placed. Nothing was attached.`);
                            return;
                          }
                          setAddNotice("");
                          setSelectedId(added.blockId);
                          startAudition("Add " + label, added.document);
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
            <button type="button" data-testid="creator-tray-down" aria-label="Scroll tray down" style={controlStyle} onClick={() => trayRef.current?.scrollBy({ top: 120, behavior: "smooth" })}>▼</button>
          </div>
          {addNotice ? <p data-testid="studio-add-notice">{addNotice}</p> : null}
          {selectedId ? (
            <div data-testid="studio-object-tools" data-workflow="MOVE-SIZE-SHAPE-STYLE-LAYER">
              <button type="button" data-testid="studio-object-move" style={controlStyle} onClick={() => {
                const placed = placeIfFlow(session.document, selectedId);
                const block = placed.sections.flatMap((section) => section.blocks).find((item) => item.id === selectedId);
                if (!block) return;
                edit(applyMagnetBounds(placed, selectedId, { x: block.bounds.x + 4 }), session);
              }}>Move</button>
              <button type="button" data-testid="studio-object-resize" style={controlStyle} onClick={() => {
                const placed = placeIfFlow(session.document, selectedId);
                const block = placed.sections.flatMap((section) => section.blocks).find((item) => item.id === selectedId);
                if (!block) return;
                edit(setWritingFit(applyMagnetBounds(placed, selectedId, { w: block.bounds.w + 4, h: block.bounds.h + 4 }), selectedId, "FIXED"), session);
              }}>Resize</button>
              <button type="button" data-testid="studio-object-rotate" style={controlStyle} onClick={() => edit(rotateBlock(session.document, selectedId, 8), session)}>Rotate</button>
              <button type="button" data-testid="studio-object-forward" style={controlStyle} onClick={() => edit(raiseMagnetLayer(placeIfFlow(session.document, selectedId), selectedId), session)}>Forward</button>
              <button type="button" data-testid="studio-object-back" style={controlStyle} onClick={() => edit(lowerMagnetLayer(placeIfFlow(session.document, selectedId), selectedId), session)}>Back</button>
              <button type="button" data-testid="studio-object-shape" style={controlStyle} onClick={() => edit(cycleBlockMask(session.document, selectedId), session)}>Shape</button>
              {session.document.sections.flatMap((section) => section.blocks).some((block) => block.id === selectedId && (block.kind === "PHOTO" || block.kind === "VIDEO_SNIP")) ? (
                <span data-testid="studio-media-viewport">
                  <button type="button" data-testid="studio-fit-fill" style={controlStyle} onClick={() => edit(setMediaViewport(session.document, selectedId, { mediaFit: "FILL" }), session)}>Fill shape</button>
                  <button type="button" data-testid="studio-fit-inside" style={controlStyle} onClick={() => edit(setMediaViewport(session.document, selectedId, { mediaFit: "FIT", mediaZoom: 1 }), session)}>Fit inside</button>
                  <button type="button" data-testid="studio-adjust-photo" style={controlStyle} onClick={() => setAdjustingId(adjustingId === selectedId ? null : selectedId)}>{adjustingId === selectedId ? "Done" : "Adjust photo"}</button>
                  <button type="button" data-testid="studio-zoom-in" style={controlStyle} onClick={() => {
                    const block = session.document.sections.flatMap((section) => section.blocks).find((item) => item.id === selectedId);
                    edit(setMediaViewport(session.document, selectedId, { mediaFit: "FREE", mediaZoom: (block?.style.mediaZoom ?? 1) * 1.15 }), session);
                  }}>Zoom in</button>
                  <button type="button" data-testid="studio-zoom-out" style={controlStyle} onClick={() => {
                    const block = session.document.sections.flatMap((section) => section.blocks).find((item) => item.id === selectedId);
                    edit(setMediaViewport(session.document, selectedId, { mediaFit: "FREE", mediaZoom: (block?.style.mediaZoom ?? 1) / 1.15 }), session);
                  }}>Zoom out</button>
                  <button type="button" data-testid="studio-frame-none" style={controlStyle} onClick={() => edit(setMediaFrame(session.document, selectedId, "NONE"), session)}>No frame</button>
                  <button type="button" data-testid="studio-frame-thin" style={controlStyle} onClick={() => edit(setMediaFrame(session.document, selectedId, "THIN"), session)}>Thin frame</button>
                  <button type="button" data-testid="studio-frame-heavy" style={controlStyle} onClick={() => edit(setMediaFrame(session.document, selectedId, "HEAVY"), session)}>Heavy frame</button>
                  <button type="button" data-testid="studio-frame-neon" style={controlStyle} onClick={() => edit(setMediaFrame(session.document, selectedId, "NEON"), session)}>Neon frame</button>
                  <button type="button" data-testid="studio-frame-polaroid" style={controlStyle} onClick={() => edit(setMediaFrame(session.document, selectedId, "POLAROID"), session)}>Polaroid</button>
                  <button type="button" data-testid="studio-frame-card" style={controlStyle} onClick={() => edit(setMediaFrame(session.document, selectedId, "CARD"), session)}>Card</button>
                </span>
              ) : null}
              {session.document.sections.flatMap((section) => section.blocks).some((block) => block.id === selectedId && (block.kind === "LONG_FORM_WRITING" || block.kind === "NOTE" || block.kind === "QUOTE" || block.kind === "POEM" || block.kind === "HEADING" || block.kind === "STATUS_LINE")) ? (
                <span data-testid="studio-writing-treatment">
                  <button type="button" data-testid="studio-fill-transparent" style={controlStyle} onClick={() => edit(setWritingTreatment(session.document, selectedId, "TRANSPARENT"), session)}>Transparent</button>
                  <button type="button" data-testid="studio-fill-solid-dark" style={controlStyle} onClick={() => edit(setWritingTreatment(session.document, selectedId, "SOLID_DARK"), session)}>Solid dark</button>
                  <button type="button" data-testid="studio-fill-solid-light" style={controlStyle} onClick={() => edit(setWritingTreatment(session.document, selectedId, "SOLID_LIGHT"), session)}>Solid bright</button>
                  <button type="button" data-testid="studio-fill-glass" style={controlStyle} onClick={() => edit(setWritingTreatment(session.document, selectedId, "GLASS"), session)}>Glass</button>
                </span>
              ) : null}
              <label>
                Shape
                <select
                  data-testid="studio-shape"
                  value={session.document.sections.flatMap((section) => section.blocks).find((block) => block.id === selectedId)?.style.mask ?? "ROUNDED"}
                  onChange={(event) => edit(applyShape(session.document, selectedId, event.target.value as PublicPageMask), session)}
                >
                  {PUBLIC_PAGE_SHAPES.map((shape) => (
                    <option key={shape.shapeId} value={shape.shapeId}>{shape.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Font
                <select
                  data-testid="studio-font"
                  value={session.document.sections.flatMap((section) => section.blocks).find((block) => block.id === selectedId)?.style.fontPairingId ?? "INTER"}
                  onChange={(event) => edit(patchBlockStyle(session.document, selectedId, { fontPairingId: event.target.value as FontPairing }), session)}
                >
                  {APPROVED_PAGE_FONTS.map((font) => (
                    <option key={font.id} value={font.id}>{font.label}</option>
                  ))}
                </select>
              </label>
              <button type="button" data-testid="studio-text-auto" style={controlStyle} onClick={() => edit(setWritingFit(session.document, selectedId, "AUTO"), session)}>Auto grow</button>
              <button type="button" data-testid="studio-text-fixed" style={controlStyle} onClick={() => edit(setWritingFit(session.document, selectedId, "FIXED"), session)}>Fixed size</button>
              <button type="button" data-testid="studio-object-duplicate" style={controlStyle} onClick={() => {
                const copy = duplicateBlock(session.document, selectedId);
                if (copy.blockId) {
                  setSelectedId(copy.blockId);
                  edit(copy.document, session);
                }
              }}>Duplicate</button>
              <button type="button" data-testid="studio-object-delete" style={controlStyle} onClick={() => { edit(removeBlock(session.document, selectedId), session); setSelectedId(null); }}>Delete</button>
              {OBJECT_COLORS.map((color) => (
                <button key={color} type="button" data-testid={`studio-color-${color.slice(1)}`} aria-label={`Color ${color}`} style={{ ...controlStyle, background: color, minWidth: 44 }} onClick={() => edit(patchBlockStyle(session.document, selectedId, { colorHex: color, textGlow: true }), session)} />
              ))}
            </div>
          ) : null}
          <label>
            Binding id
            <input data-testid="studio-binding" value={bindingDraft} onChange={(event) => setBindingDraft(event.target.value)} />
          </label>
          </div>
          <div
            data-testid="magnet-canvas"
            data-viewport={session.viewport}
            data-width={viewportWidth(session.viewport)}
            style={{ position: "relative", width: session.viewport === "DESKTOP" ? "100%" : viewportWidth(session.viewport), maxWidth: "100%", minHeight: 220, marginTop: 12 }}
          >
            {pagePresentation && "mode" in pagePresentation && pagePresentation.mode === "DOCUMENT_PREVIEW" && pagePresentation.canvas ? (
              <PublicPagePublishedView
                presentation={pagePresentation}
                selectedSectionId={selectedSectionId}
                onSelectSection={setSelectedSectionId}
                selectedBlockId={selectedId}
                onSelectBlock={setSelectedId}
                onMagnetPointerDown={(blockId, mode, event) => beginPointer(event, blockId, mode)}
                onMagnetPointerMove={movePointer}
                onMagnetPointerUp={() => { dragRef.current = null; }}
                ownerUserId={pageOwnerId}
                adjustingBlockId={adjustingId}
                onBeginAdjust={setAdjustingId}
                onCanvasPlace={openQuickAdd}
                editingBlockId={editingBlockId}
                onUpdateBlockText={(blockId, text) => edit(fitWritingToText(session.document, blockId, text), session)}
                onSetEditingBlockId={setEditingBlockId}
              />
            ) : null}
            {pagePresentation && "mode" in pagePresentation && pagePresentation.mode === "DOCUMENT_PREVIEW" && pagePresentation.canvas ? null : frames.map((frame) => {
              const stored = session.document.sections.flatMap((section) => section.blocks).find((block) => block.id === frame.blockId);
              return (
              <div
                key={frame.blockId}
                data-testid={`canvas-block-${frame.blockId}`}
                data-stacked={frame.stacked ? "true" : "false"}
                data-editing={frame.editing ? "true" : "false"}
                data-x={stored?.bounds.x ?? frame.bounds.x}
                data-y={stored?.bounds.y ?? frame.bounds.y}
                data-w={stored?.bounds.w ?? frame.bounds.w}
                data-h={stored?.bounds.h ?? frame.bounds.h}
                data-z={stored?.bounds.z ?? frame.bounds.z}
                data-placement={stored?.placement ?? "FLOW"}
                style={frame.stacked ? { position: "relative", marginBottom: 8 } : { position: "absolute", left: `${frame.bounds.x}%`, top: frame.bounds.y * 2, width: `${frame.bounds.w}%`, minHeight: frame.bounds.h * 4, zIndex: frame.bounds.z }}
              >
                <button
                  type="button"
                  data-testid={`drag-${frame.blockId}`}
                  onClick={() => setSelectedId(frame.blockId)}
                  onPointerDown={(event) => beginPointer(event, frame.blockId, "move")}
                  onPointerMove={movePointer}
                  onPointerUp={() => { dragRef.current = null; }}
                >
                  {stored?.plainText?.text || frame.blockId}
                </button>
                {frame.editing ? (
                  <button
                    type="button"
                    data-testid={`resize-handle-${frame.blockId}`}
                    aria-label={`Resize ${frame.blockId}`}
                    onPointerDown={(event) => beginPointer(event, frame.blockId, "resize")}
                    onPointerMove={movePointer}
                    onPointerUp={() => { dragRef.current = null; }}
                  >
                    Corner
                  </button>
                ) : null}
                {frame.editing ? (
                  <span>
                    <button type="button" data-testid={`nudge-${frame.blockId}`} onClick={() => edit(applyMagnetBounds(session.document, frame.blockId, { x: frame.bounds.x + 4 }), session)}>Move</button>
                    <button type="button" data-testid={`resize-${frame.blockId}`} onClick={() => edit(applyMagnetBounds(session.document, frame.blockId, { w: frame.bounds.w + 4 }), session)}>Resize</button>
                    <button type="button" data-testid={`layer-${frame.blockId}`} onClick={() => edit(raiseMagnetLayer(session.document, frame.blockId), session)}>Layer</button>
                  </span>
                ) : null}
                <button type="button" onClick={() => edit(reorderBlock(session.document, frame.blockId, -1), session)}>Up</button>
                <button type="button" onClick={() => edit(reorderBlock(session.document, frame.blockId, 1), session)}>Down</button>
                <button type="button" onClick={() => edit(removeBlock(session.document, frame.blockId), session)}>Remove</button>
                <button type="button" onClick={() => edit(placeAsMagnet(session.document, frame.blockId, { x: 8, y: 8, w: 24, h: 12, z: 1 }), session)}>Magnet</button>
              </div>
              );
            })}
          </div>
          <button type="button" data-testid="studio-help" onClick={() => setSession({ ...session, proposal: proposeHelpLayout(session.document) })}>HELP ME</button>
          {session.proposal ? (
            <div data-testid="studio-proposal">
              <p>Layout proposal is not saved.</p>
              <button type="button" data-testid="studio-accept-proposal" onClick={() => setSession(acceptProposal(session))}>Accept</button>
              <button type="button" data-testid="studio-dismiss-proposal" onClick={() => setSession(dismissProposal(session))}>Dismiss</button>
            </div>
          ) : null}
          <button type="button" data-testid="studio-starters" style={{ ...controlStyle, minHeight: 44 }} onClick={() => setStarterOpen(true)}>Starting designs</button>
          <button type="button" data-testid="studio-save" style={controlStyle} onClick={() => { void saveStudioDraft(session, port, actor, profileKind).then(setSession); }}>Save draft</button>
          <button
            type="button"
            data-testid="studio-history"
            style={controlStyle}
            onClick={() => {
              void port.listRevisionHistory(actor, profileKind).then((listed) => {
                if (listed.ok) setHistory(listed.revisions.map((revision) => ({ revisionId: revision.revisionId, revisionNumber: revision.revisionNumber })));
              });
            }}
          >
            History
          </button>
          <ul data-testid="studio-history-list">
            {history.map((revision) => (
              <li key={revision.revisionId}>
                <button type="button" onClick={() => { void restoreStudioRevision(session, port, actor, profileKind, revision.revisionId).then(setSession); }}>
                  Restore v{revision.revisionNumber}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" data-testid="studio-close" style={controlStyle} onClick={() => requestClose()}>Close</button>
          {selectedId ? (
            <label>
              Title
              <input
                data-testid="studio-title"
                value={session.document.sections.flatMap((section) => section.blocks).find((block) => block.id === selectedId)?.a11y.label ?? ""}
                onChange={(event) => edit(setWritingTitle(session.document, selectedId, event.target.value), session)}
              />
            </label>
          ) : null}
          {selectedId ? (
            <label>
              Block text
              <textarea
                data-testid="studio-text"
                value={session.document.sections.flatMap((section) => section.blocks).find((block) => block.id === selectedId)?.plainText?.text ?? ""}
                onChange={(event) => edit(fitWritingToText(session.document, selectedId, event.target.value), session)}
              />
            </label>
          ) : null}
          {selectedId ? <p data-testid="studio-selected">{selectedId}</p> : null}
        </aside>
        {quickAdd ? (
          <QuickAddShelf
            anchor={quickAdd}
            onClose={() => setQuickAdd(null)}
            onWriting={(label) => { rememberInsert(); placeWriting(label); }}
            onShape={(shapeId) => { rememberInsert(); placeShape(shapeId); }}
            onPhoto={() => {
              photoFromShelfRef.current = true;
              photoAnchorRef.current = { x: quickAdd.magnetX, y: quickAdd.magnetY };
              setQuickAdd(null);
              photoInputRef.current?.click();
            }}
            onBox={() => { rememberInsert(); placeShape("RECTANGLE"); }}
            onDecor={() => { rememberInsert(); placeKind("STICKER"); }}
            onDuplicate={() => {
              if (!quickAdd.blockId) return;
              const copy = duplicateBlock(session.document, quickAdd.blockId);
              if (copy.blockId) {
                setSelectedId(copy.blockId);
                edit(copy.document, session);
              }
              setQuickAdd(null);
            }}
            onForward={() => {
              if (!quickAdd.blockId) return;
              edit(raiseMagnetLayer(session.document, quickAdd.blockId), session);
              setQuickAdd(null);
            }}
            onBack={() => {
              if (!quickAdd.blockId) return;
              edit(lowerMagnetLayer(session.document, quickAdd.blockId), session);
              setQuickAdd(null);
            }}
            onDelete={() => {
              if (!quickAdd.blockId) return;
              edit(removeBlock(session.document, quickAdd.blockId), session);
              setSelectedId(null);
              setQuickAdd(null);
            }}
            onAdjust={() => {
              if (quickAdd.blockId) setAdjustingId(quickAdd.blockId);
              setQuickAdd(null);
            }}
          />
        ) : null}
        </>
      ) : null}
    </section>
  );
}
