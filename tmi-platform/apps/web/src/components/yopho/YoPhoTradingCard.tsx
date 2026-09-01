"use client";

/**
 * YoPhoTradingCard — premium trading card + studio editor.
 * Style packs · scene packs · custom BG/text · still/motion export · share · money CTAs.
 * Rule 20: real data / honest empty. Rule 26: performer photo identity vs fan creative.
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent } from "react";
import Link from "next/link";
import DrawerBezelChrome from "@/components/drawers/DrawerBezelChrome";
import YoPhoStudioStyleOverlay from "@/components/yopho/YoPhoStudioStyleOverlay";
import { getPerformerBySlug } from "@/lib/performers/PerformerRegistry";
import {
  getActiveSessions,
  onSessionsChanged,
  type LiveSession,
} from "@/lib/broadcast/GlobalLiveSessionRegistry";
import {
  YOPHO_STUDIO_STYLE_PRESETS,
  getStudioStylePreset,
  type YoPhoStudioStyleId,
} from "@/lib/yopho/YoPhoStudioStylePresets";
import { YOPHO_SCENE_PACKS, getScenePack, type YoPhoSceneId } from "@/lib/yopho/YoPhoScenePack";
import { downscaleImageFile } from "@/lib/yopho/downscaleImageFile";
import {
  loadCardComposition,
  saveCardComposition,
  defaultMotionClip,
  YOPHO_MOTION_DURATIONS,
  YOPHO_MOTION_SOURCE_MAX_SEC,
  TMI_TEXT_COLORS,
  type YoPhoCardComposition,
  type YoPhoMotionDurationSec,
  type TextOverlayPosition,
} from "@/lib/yopho/YoPhoCardComposition";
import {
  copyYoPhoShareLink,
  fetchShareThreadOptions,
  nativeShareYoPhoCard,
  shareYoPhoToThread,
  type MessageThreadOption,
} from "@/lib/yopho/shareYoPhoCard";
import { claimYoPhoLearningXp } from "@/lib/yopho/YoPhoLearningTrack";
import { exportYoPhoMotion, exportYoPhoStill } from "@/lib/yopho/exportYoPhoCard";
import {
  compositionToDraft,
  interactiveCardPath,
  publishYoPhoCard,
  type YoPhoNowPlaying,
} from "@/lib/yopho/YoPhoCardRegistry";
import { YOPHO_MAGIC_EFFECTS } from "@/lib/yopho/YoPhoMagicEffects";
import {
  duplicateAsEdition,
  roleModuleHints,
  toggleMagicEffect,
  type YoPhoRarityLabel,
} from "@/lib/yopho/YoPhoCardDocument";
import {
  createYoPhoDraft,
  getCurrentEdition,
  listArchivedEditions,
  listDraftAndPreviewEditions,
  previewYoPhoEdition,
  publishYoPhoEdition,
  YOPHO_AVAILABILITY_LABELS,
  type YoPhoEditionAvailability,
  type YoPhoEditionRecord,
} from "@/lib/yopho/YoPhoEditionEngine";
import { livingOsCommandBus } from "@/lib/os/livingOsCommandBus";
import YoPhoMagicEffectOverlay from "@/components/yopho/YoPhoMagicEffectOverlay";
import YoPhoBrandingFooter from "@/components/yopho/YoPhoBrandingFooter";
import YoPhoMediaModuleComposer from "@/components/yopho/YoPhoMediaModuleComposer";
import YoPhoCardMediaPlayer from "@/components/yopho/YoPhoCardMediaPlayer";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  mediaModuleToNowPlaying,
  resolveCardMediaModules,
} from "@/lib/yopho/YoPhoMediaModule";
import { normalizeYoPhoTier } from "@/lib/yopho/YoPhoImageCapacity";

type EditorTab = "identity" | "scene" | "effects" | "music" | "motion" | "share" | "editions";

export type YoPhoCardRole = "fan" | "performer";

export interface YoPhoTradingCardProps {
  role: YoPhoCardRole;
  displayName: string;
  slug?: string;
  userKey?: string;
  imageUrl?: string;
  /** Extra photos for collage slots */
  extraImages?: string[];
  compact?: boolean;
  showMoneyCtas?: boolean;
  showShare?: boolean;
  showEditor?: boolean;
  style?: CSSProperties;
}

const HOLO_CSS = `
@keyframes tmi-yopho-holo-sweep {
  0% { background-position: 0% 40%; opacity: 0.45; }
  50% { background-position: 100% 60%; opacity: 0.8; }
  100% { background-position: 0% 40%; opacity: 0.45; }
}
@keyframes tmi-yopho-foil-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.65; }
}
`;

function findLiveSession(
  sessions: LiveSession[],
  opts: { slug?: string; name?: string; roomId?: string },
): LiveSession | null {
  const slug = opts.slug?.toLowerCase();
  const name = opts.name?.toLowerCase();
  const roomId = opts.roomId;
  for (const s of sessions) {
    if (roomId && s.roomId === roomId) return s;
    if (slug && (s.userId.toLowerCase() === slug || s.roomId.toLowerCase().includes(slug))) return s;
    if (name && s.displayName.toLowerCase() === name) return s;
  }
  return null;
}

function chipStyle(color: string): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.08em",
    color,
    background: `${color}14`,
    border: `1px solid ${color}55`,
    borderRadius: 999,
    padding: "6px 10px",
    cursor: "pointer",
    textDecoration: "none",
    fontFamily: "inherit",
  };
}

function CtaChip({ href, color, label }: { href: string; color: string; label: string }) {
  return (
    <Link href={href} style={chipStyle(color)}>
      {label}
    </Link>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  background: "#0a0a18",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 12,
  padding: "8px 10px",
};

export default function YoPhoTradingCard({
  role,
  displayName,
  slug,
  userKey = "local",
  imageUrl,
  extraImages = [],
  compact = false,
  showMoneyCtas = true,
  showShare = true,
  showEditor = true,
  style,
}: YoPhoTradingCardProps) {
  const performer = useMemo(() => (slug ? getPerformerBySlug(slug) : null), [slug]);
  const resolvedName = performer?.name ?? displayName;
  const resolvedSlug = performer?.slug ?? slug;
  const { tier: membershipTier } = useAuth();
  const accountTier = normalizeYoPhoTier(membershipTier);
  // Rule 20 — no fake/stock placeholder presented as user content; empty string → honest empty card art
  const subjectUrl = (imageUrl ?? performer?.profileImageUrl ?? "").trim();

  const [comp, setComp] = useState<YoPhoCardComposition>(() =>
    loadCardComposition(role, userKey),
  );
  const [editorTab, setEditorTab] = useState<EditorTab>("identity");
  const [bgStatus, setBgStatus] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [threads, setThreads] = useState<MessageThreadOption[] | null>(null);
  const [showThreadPicker, setShowThreadPicker] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [bgUrlInput, setBgUrlInput] = useState("");
  const [moodTitle, setMoodTitle] = useState("");
  const [momentTag, setMomentTag] = useState("This month");
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  const [songAudioUrl, setSongAudioUrl] = useState("");
  const [playlistIdInput, setPlaylistIdInput] = useState(comp.playlistId ?? "");
  const [editionTitleInput, setEditionTitleInput] = useState(comp.editionTitle ?? "");
  const [fanQuote, setFanQuote] = useState("");
  const [fanFavorite, setFanFavorite] = useState("");
  const [publishStatus, setPublishStatus] = useState<string | null>(null);
  const [publishedPath, setPublishedPath] = useState<string | null>(
    comp.cardId ? interactiveCardPath(comp.cardId) : null,
  );
  const [availability, setAvailability] = useState<YoPhoEditionAvailability>("Unlimited");
  const [maxSupplyInput, setMaxSupplyInput] = useState("");
  const [editionTick, setEditionTick] = useState(0);
  const magicEffects = comp.magicEffects ?? [];
  const footerPct = comp.brandingFooter?.heightPct ?? 0.1;

  const currentEdition = useMemo(
    () => getCurrentEdition(userKey),
    [userKey, editionTick, publishStatus],
  );
  const archivedEditions = useMemo(
    () => listArchivedEditions(userKey),
    [userKey, editionTick, publishStatus],
  );
  const draftEditions = useMemo(
    () => listDraftAndPreviewEditions(userKey),
    [userKey, editionTick, publishStatus],
  );

  const cardRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const motionFileRef = useRef<HTMLInputElement>(null);
  const [motionStatus, setMotionStatus] = useState<string | null>(null);
  const motion = comp.motion ?? defaultMotionClip();

  useEffect(() => {
    saveCardComposition(role, userKey, comp);
  }, [comp, role, userKey]);

  const [liveSessions, setLiveSessions] = useState<LiveSession[]>(() => getActiveSessions());
  useEffect(() => onSessionsChanged(setLiveSessions), []);

  const liveSession = useMemo(
    () =>
      findLiveSession(liveSessions, {
        slug: resolvedSlug,
        name: resolvedName,
        roomId: performer?.roomId,
      }),
    [liveSessions, resolvedSlug, resolvedName, performer?.roomId],
  );
  const isLive = Boolean(liveSession);
  const liveHref = liveSession
    ? `/live/rooms/${encodeURIComponent(liveSession.roomId)}`
    : performer?.liveRoomRoute ?? "/live/lobby";

  const genre = performer?.category ?? null;
  const rank =
    performer && typeof performer.rank === "number" && performer.rank > 0 ? performer.rank : null;
  const country =
    performer?.countryName && performer.countryName !== "Global"
      ? `${performer.flag ? `${performer.flag} ` : ""}${performer.countryName}`
      : null;
  const tier = performer?.tier ?? null;

  const stylePreset = getStudioStylePreset(comp.styleId);
  const scene = getScenePack(comp.sceneId);
  const bezelVariant = role === "performer" ? "gold" : "chrome";
  const accent = role === "performer" ? "#FFD700" : "#00E5FF";
  const portraitH = compact ? 210 : 268;

  const nowPlaying: YoPhoNowPlaying | null = useMemo(() => {
    const modules = resolveCardMediaModules({
      mediaModules: comp.mediaModules,
      nowPlaying: null,
      playlistId: playlistIdInput.trim() || comp.playlistId,
    });
    const fromModule = mediaModuleToNowPlaying(modules[0] ?? null);
    if (fromModule) return fromModule;
    if (!songTitle.trim() && !songAudioUrl.trim() && !playlistIdInput.trim()) return null;
    return {
      playlistId: playlistIdInput.trim() || null,
      title: songTitle.trim() || null,
      artist: songArtist.trim() || null,
      audioUrl: songAudioUrl.trim() || null,
    };
  }, [comp.mediaModules, comp.playlistId, songTitle, songArtist, songAudioUrl, playlistIdInput]);

  const cardMediaModules = useMemo(
    () =>
      resolveCardMediaModules({
        mediaModules: comp.mediaModules,
        nowPlaying,
        playlistId: playlistIdInput.trim() || comp.playlistId,
      }),
    [comp.mediaModules, nowPlaying, playlistIdInput, comp.playlistId],
  );

  const shareArtifact = useMemo(
    () => ({
      type: "yopho_card" as const,
      cardId: comp.cardId ?? undefined,
      slug: resolvedSlug,
      id: performer?.id ?? userKey,
      displayName: resolvedName,
      songTitle: nowPlaying?.title ?? null,
    }),
    [comp.cardId, resolvedSlug, performer?.id, userKey, resolvedName, nowPlaying?.title],
  );
  const canShareInteractive = Boolean(comp.cardId);

  function patch(partial: Partial<YoPhoCardComposition>) {
    setComp((c) => ({ ...c, ...partial, updatedAt: new Date().toISOString() }));
  }

  function patchText(partial: Partial<YoPhoCardComposition["textOverlay"]>) {
    setComp((c) => ({
      ...c,
      textOverlay: { ...c.textOverlay, ...partial },
      updatedAt: new Date().toISOString(),
    }));
  }

  async function onBgFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setBgStatus("Please choose an image file (PNG, JPG, WebP)");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setBgStatus("Image too large (max 8MB for card preview)");
      return;
    }
    setBgStatus("Loading preview…");
    try {
      const { blob } = await downscaleImageFile(file);
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(blob);
      });
      // Prefer persisting data URL locally; try profile banner update as optional durable path
      patch({ customBgUrl: dataUrl });
      setBgStatus("Custom background applied (saved on this device)");
      try {
        const res = await fetch("/api/profile/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ bannerUrl: dataUrl }),
        });
        if (res.ok) setBgStatus("Custom background applied + profile banner updated");
      } catch {
        /* local preview still valid */
      }
    } catch {
      setBgStatus("Could not read image");
    }
    setTimeout(() => setBgStatus(null), 2500);
  }

  function applyBgUrl() {
    const url = bgUrlInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !url.startsWith("data:image/")) {
      setBgStatus("Paste an https:// image URL or use Upload");
      return;
    }
    patch({ customBgUrl: url });
    setBgStatus("Custom background URL applied");
    setTimeout(() => setBgStatus(null), 2000);
  }

  function clearCustomBg() {
    patch({ customBgUrl: null });
    setBgStatus("Back to scene preset");
    setTimeout(() => setBgStatus(null), 1500);
  }

  async function handleDownloadStill() {
    if (!cardRef.current) return;
    setExportBusy(true);
    setExportStatus("Rendering still…");
    const res = await exportYoPhoStill(cardRef.current, {
      displayName: resolvedName,
      format: "image/png",
    });
    setExportStatus(res.ok ? `Downloaded ${res.filename}` : res.error ?? "Still export failed");
    setExportBusy(false);
    setTimeout(() => setExportStatus(null), 3000);
  }

  async function handleDownloadMotion() {
    if (!cardRef.current) return;
    setExportBusy(true);
    setExportStatus("Recording motion…");
    const res = await exportYoPhoMotion(cardRef.current, {
      displayName: resolvedName,
      durationMs: Math.min(20_000, Math.max(2000, motion.durationSec * 1000)),
    });
    if (res.ok) {
      setExportStatus(
        res.webmOnly
          ? `Downloaded ${res.filename} (WebM — browser cannot encode MP4 without ffmpeg)`
          : `Downloaded ${res.filename}`,
      );
    } else {
      setExportStatus(res.error ?? "Motion export failed");
    }
    setExportBusy(false);
    setTimeout(() => setExportStatus(null), 4500);
  }

  async function onMotionFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setMotionStatus("Please choose a video file (MP4 / WebM)");
      return;
    }
    if (file.size > 40 * 1024 * 1024) {
      setMotionStatus("Video too large (max 40MB for card preview)");
      return;
    }
    setMotionStatus("Reading motion clip…");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read failed"));
        reader.readAsDataURL(file);
      });
      // Probe duration — trim hook if source > max
      const dur = await new Promise<number>((resolve) => {
        const v = document.createElement("video");
        v.preload = "metadata";
        v.onloadedmetadata = () => resolve(Number.isFinite(v.duration) ? v.duration : 0);
        v.onerror = () => resolve(0);
        v.src = dataUrl;
      });
      if (dur > YOPHO_MOTION_SOURCE_MAX_SEC) {
        setMotionStatus(
          `Source is ${Math.round(dur)}s — card will loop a ${motion.durationSec}s hook from start (max source ${YOPHO_MOTION_SOURCE_MAX_SEC}s recommended)`,
        );
      } else {
        setMotionStatus(`Motion clip ready · ${motion.durationSec}s hook loop`);
      }
      patch({
        motion: {
          ...motion,
          sourceUrl: dataUrl,
          mimeType: file.type,
          hookStartSec: 0,
        },
      });
    } catch {
      setMotionStatus("Could not read motion file");
    }
    setTimeout(() => setMotionStatus(null), 3500);
  }

  async function publishInteractiveCard(opts?: {
    asEdition?: boolean;
    forceCanonical?: boolean;
  }): Promise<string | null> {
    setPublishStatus("Publishing interactive YoPho card…");
    const asEdition = Boolean(opts?.asEdition);
    const forceCanonical = Boolean(opts?.forceCanonical) || (!asEdition && Boolean(comp.isCanonical));
    let working = {
      ...comp,
      playlistId: playlistIdInput.trim() || null,
      mediaModules: cardMediaModules,
      motion,
      editionTitle: editionTitleInput.trim() || comp.editionTitle || null,
      magicEffects,
    };
    let cardId = asEdition ? undefined : (comp.cardId ?? undefined);

    const draft = compositionToDraft(working, {
      role,
      displayName: resolvedName,
      slug: resolvedSlug,
      subjectUrl,
      ownerKey: userKey,
      playlistId: playlistIdInput.trim() || null,
      cardId,
      moodTitle: moodTitle.trim() || (role === "fan" ? fanQuote.trim() : "") || null,
      momentTag:
        momentTag.trim() ||
        (role === "fan" && fanFavorite.trim() ? fanFavorite.trim() : "") ||
        null,
      nowPlaying,
      mediaModules: cardMediaModules,
      motion,
      isCanonical: forceCanonical && !asEdition,
      rarity: working.rarity ?? "STANDARD",
      quote: role === "fan" ? fanQuote.trim() || null : null,
      editionTitle:
        editionTitleInput.trim() ||
        (asEdition ? `${resolvedName} · Edition` : working.editionTitle) ||
        null,
      kind: asEdition
        ? "PROMOTIONAL_EDITION"
        : forceCanonical
          ? "CANONICAL_IDENTITY"
          : working.kind ?? "MEMORY_EDITION",
    });

    if (asEdition && draft.documentJson) {
      const edition = duplicateAsEdition(
        draft.documentJson,
        editionTitleInput.trim() || `${resolvedName} · Edition`,
      );
      draft.cardId = edition.id;
      draft.documentJson = edition;
      draft.isCanonical = false;
      draft.kind = "PROMOTIONAL_EDITION";
      draft.editionTitle = edition.title;
    }

    const res = await publishYoPhoCard(draft);
    if (!res.ok) {
      setPublishStatus(res.error ?? "Publish failed");
      return null;
    }

    // Edition lifecycle: Draft → Publish as Current; prior Current → Archived
    let editionRec: YoPhoEditionRecord | null = null;
    try {
      if (asEdition || !forceCanonical) {
        editionRec = publishYoPhoEdition({
          ownerKey: userKey,
          editionId: res.cardId,
          title:
            editionTitleInput.trim() ||
            draft.editionTitle ||
            `${resolvedName} · Edition`,
          kind: draft.kind ?? "PROMOTIONAL_EDITION",
          theme: momentTag.trim() || null,
          availability,
          maxSupply:
            availability === "LimitedEdition" && maxSupplyInput.trim()
              ? Math.max(1, Number(maxSupplyInput) || 1)
              : null,
          createIfMissing: true,
        });
        livingOsCommandBus.executeAction("ACTION_PUBLISH_YOPHO", {
          role: role === "performer" ? "performer" : "fan",
          userId: userKey,
          payload: {
            editionId: editionRec.id,
            editionNumber: editionRec.editionNumber,
          },
        });
      } else {
        // Canonical publish still gets an edition pointer so collectors can attach
        editionRec = publishYoPhoEdition({
          ownerKey: userKey,
          editionId: res.cardId,
          title: draft.editionTitle || `${resolvedName} · Identity`,
          kind: "CANONICAL_IDENTITY",
          theme: momentTag.trim() || null,
          availability,
          maxSupply:
            availability === "LimitedEdition" && maxSupplyInput.trim()
              ? Math.max(1, Number(maxSupplyInput) || 1)
              : null,
          createIfMissing: true,
        });
        livingOsCommandBus.executeAction("ACTION_PUBLISH_YOPHO", {
          role: role === "performer" ? "performer" : "fan",
          userId: userKey,
          payload: {
            editionId: editionRec.id,
            editionNumber: editionRec.editionNumber,
          },
        });
      }
    } catch {
      /* local edition ledger optional if storage blocked */
    }
    setEditionTick((n) => n + 1);

    const editionBadge = editionRec
      ? `ED #${editionRec.editionNumber}`
      : draft.isCanonical
        ? "CANONICAL"
        : draft.editionTitle ?? null;

    patch({
      cardId: res.cardId,
      playlistId: playlistIdInput.trim() || null,
      mediaModules: cardMediaModules,
      documentJson: draft.documentJson ?? null,
      isCanonical: Boolean(draft.isCanonical),
      kind: draft.kind,
      editionTitle: draft.editionTitle ?? null,
      rarity: draft.rarity ?? comp.rarity ?? "STANDARD",
      magicEffects,
      brandingFooter: {
        ...(comp.brandingFooter ?? {}),
        enabled: true,
        heightPct: footerPct,
        showQr: true,
        qrTarget: "card",
        label: "TMI × YoPho",
        rarity: draft.rarity ?? "STANDARD",
        showEditionBadge: true,
        editionBadge,
      },
    });
    const path = interactiveCardPath(res.cardId);
    setPublishedPath(path);
    setPublishStatus(
      res.error
        ? `Live at ${path} (${res.error})`
        : editionRec
          ? `Edition #${editionRec.editionNumber} published · ${path}`
          : `Interactive YoPho card live · ${path}`,
    );
    void claimYoPhoLearningXp("yopho_save_composition");
    return res.cardId;
  }

  function handleCreateDraft() {
    const draft = createYoPhoDraft({
      creatorOwnerKey: userKey,
      title: editionTitleInput.trim() || `${resolvedName} · Draft`,
      kind: comp.kind ?? "PROMOTIONAL_EDITION",
      theme: momentTag.trim() || null,
      availability,
      maxSupply:
        availability === "LimitedEdition" && maxSupplyInput.trim()
          ? Math.max(1, Number(maxSupplyInput) || 1)
          : null,
      id: comp.cardId ?? undefined,
    });
    livingOsCommandBus.executeAction("ACTION_CREATE_YOPHO_DRAFT", {
      role: role === "performer" ? "performer" : "fan",
      userId: userKey,
      payload: { editionId: draft.id },
    });
    patch({ cardId: draft.id, editionTitle: draft.title });
    setEditionTick((n) => n + 1);
    setPublishStatus(`Draft saved · ${draft.id}`);
  }

  function handlePreviewDraft(editionId: string) {
    previewYoPhoEdition(userKey, editionId);
    livingOsCommandBus.executeAction("ACTION_CREATE_YOPHO_DRAFT", {
      role: role === "performer" ? "performer" : "fan",
      userId: userKey,
      payload: { editionId, status: "PREVIEW" },
    });
    setEditionTick((n) => n + 1);
    setPublishStatus(`Preview ready · ${editionId}`);
  }

  async function handleShareInteractive() {
    const id = comp.cardId ?? (await publishInteractiveCard());
    if (!id) return;
    const artifact = {
      type: "yopho_card" as const,
      cardId: id,
      slug: resolvedSlug,
      displayName: resolvedName,
      songTitle: nowPlaying?.title ?? null,
    };
    const res = await nativeShareYoPhoCard(artifact);
    if (res.skipped && !res.ok) {
      const copy = await copyYoPhoShareLink(artifact);
      setShareStatus(copy.ok ? "Interactive card link copied" : copy.error ?? "Copy failed");
      if (copy.ok) void claimYoPhoLearningXp("yopho_share_card");
    } else {
      setShareStatus(res.ok ? "Shared interactive YoPho card" : res.error ?? "Share failed");
      if (res.ok) void claimYoPhoLearningXp("yopho_share_card");
    }
    setTimeout(() => setShareStatus(null), 2500);
  }

  async function handleCopyLink() {
    let id = comp.cardId;
    if (!id) id = (await publishInteractiveCard()) ?? undefined;
    if (!id) {
      setShareStatus("Publish the interactive card first");
      return;
    }
    const res = await copyYoPhoShareLink({
      type: "yopho_card",
      cardId: id,
      slug: resolvedSlug,
      displayName: resolvedName,
      songTitle: nowPlaying?.title ?? null,
    });
    setShareStatus(res.ok ? "Interactive card link copied" : res.error ?? "Copy failed");
    setTimeout(() => setShareStatus(null), 2000);
  }

  async function handleNativeShare() {
    await handleShareInteractive();
  }

  async function openThreadPicker() {
    if (!canShareInteractive) {
      const id = await publishInteractiveCard();
      if (!id) return;
    }
    setShowThreadPicker(true);
    if (threads === null) setThreads(await fetchShareThreadOptions());
  }

  async function handleShareToThread(threadId: string) {
    let id = comp.cardId;
    if (!id) id = (await publishInteractiveCard()) ?? undefined;
    if (!id) return;
    const res = await shareYoPhoToThread({
      threadId,
      artifact: {
        type: "yopho_card",
        cardId: id,
        slug: resolvedSlug,
        displayName: resolvedName,
        songTitle: nowPlaying?.title ?? null,
      },
    });
    setShareStatus(res.ok ? "Sent interactive YoPho card" : res.error ?? "Send failed");
    setShowThreadPicker(false);
    setTimeout(() => setShareStatus(null), 2000);
  }

  async function handleFollow() {
    if (!resolvedSlug || followBusy || following) return;
    setFollowBusy(true);
    try {
      const res = await fetch("/api/artist/follow", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ artistSlug: resolvedSlug }),
      });
      if (res.ok) setFollowing(true);
      else setShareStatus("Sign in to follow");
    } catch {
      setShareStatus("Follow failed");
    } finally {
      setFollowBusy(false);
      setTimeout(() => setShareStatus(null), 2000);
    }
  }

  const backdropCss = comp.customBgUrl
    ? undefined
    : scene.backdropCss === "transparent"
      ? "linear-gradient(165deg,#0a0614,#050510)"
      : scene.backdropCss;

  const textPos: CSSProperties =
    comp.textOverlay.position === "top"
      ? { top: 14, left: 12, right: 12 }
      : comp.textOverlay.position === "center"
        ? { top: "42%", left: 12, right: 12 }
        : { bottom: `${footerPct * 100 + 4}%`, left: 12, right: 12 };

  const profilePathForQr =
    role === "performer" && resolvedSlug
      ? `/performers/${resolvedSlug}`
      : role === "fan"
        ? "/hub/fan"
        : "/performers";

  const collageSlots =
    scene.collageLayout === "none"
      ? []
      : scene.collageLayout === "2up"
        ? [subjectUrl, extraImages[0] ?? comp.collageUrls[0]]
        : scene.collageLayout === "3up" || scene.collageLayout === "strip"
          ? [subjectUrl, extraImages[0] ?? comp.collageUrls[0], extraImages[1] ?? comp.collageUrls[1]]
          : [subjectUrl, extraImages[0] ?? comp.collageUrls[0]];

  return (
    <div style={{ width: "100%", maxWidth: 420, margin: "0 auto", ...style }}>
      <style>{HOLO_CSS}</style>

      {/* ── Capture target (bezel + composed art) ── */}
      <div ref={cardRef} data-yopho-trading-card={role}>
        <DrawerBezelChrome
          variant={bezelVariant}
          seriesLabel={role === "performer" ? "TMI · PERFORMER CARD" : "TMI · FAN CARD"}
          accentColor={accent}
        >
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              background: "#050510",
            }}
          >
            {/* Scene / custom BG */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 0,
                background: backdropCss,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {comp.customBgUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={comp.customBgUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : scene.assetUrl && !comp.customBgUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={scene.assetUrl}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: 0.45,
                    mixBlendMode: "screen",
                  }}
                />
              ) : null}
            </div>

            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                background:
                  "linear-gradient(120deg, transparent 20%, rgba(0,229,255,0.14) 40%, rgba(255,45,170,0.16) 55%, rgba(255,215,0,0.14) 70%, transparent 85%)",
                backgroundSize: "220% 220%",
                animation: "tmi-yopho-holo-sweep 5.5s ease-in-out infinite",
                mixBlendMode: "screen",
                pointerEvents: "none",
              }}
            />
            <YoPhoMagicEffectOverlay effects={magicEffects} />
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 6,
                zIndex: 3,
                borderRadius: 4,
                border: `1px solid ${accent}55`,
                boxShadow: `inset 0 0 24px ${accent}18`,
                pointerEvents: "none",
                animation: "tmi-yopho-foil-pulse 3.2s ease-in-out infinite",
              }}
            />

            {/* Meta header */}
            <div
              style={{
                position: "relative",
                zIndex: 9,
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 12px 4px",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.16em", color: accent }}>
                  {role === "performer" ? "PERFORMER" : "FAN"}
                </span>
                {genre ? (
                  <span
                    style={{
                      fontSize: 8,
                      fontWeight: 800,
                      color: "#FF2DAA",
                      border: "1px solid rgba(255,45,170,0.4)",
                      borderRadius: 999,
                      padding: "2px 7px",
                    }}
                  >
                    {genre}
                  </span>
                ) : null}
                {tier ? (
                  <span style={{ fontSize: 8, fontWeight: 800, color: "#FFD700" }}>
                    {String(tier).toUpperCase()}
                  </span>
                ) : null}
              </div>
              {isLive ? (
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 900,
                    color: "#fff",
                    background: "linear-gradient(90deg,#E63000,#FF2DAA)",
                    borderRadius: 999,
                    padding: "3px 9px",
                  }}
                >
                  ● LIVE
                </span>
              ) : null}
            </div>

            {/* Subject / collage */}
            <div style={{ position: "relative", zIndex: 4, padding: "4px 10px 0", height: portraitH }}>
              {scene.collageLayout === "none" ? (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 8px 28px rgba(0,0,0,0.55)",
                    background: "rgba(5,5,18,0.9)",
                  }}
                >
                  {subjectUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={subjectUrl}
                        alt={resolvedName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          filter:
                            stylePreset.overlay === "vaseline"
                              ? "blur(0.4px) brightness(1.05)"
                              : stylePreset.overlay === "minilab"
                                ? "sepia(0.25) saturate(1.2)"
                                : undefined,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "radial-gradient(ellipse at center, transparent 42%, rgba(5,5,16,0.55) 100%)",
                          pointerEvents: "none",
                        }}
                      />
                      <YoPhoStudioStyleOverlay
                        kind={stylePreset.overlay}
                        displayName={resolvedName}
                      />
                    </>
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: 6,
                        border: "1px dashed rgba(0,255,255,0.35)",
                        color: "rgba(255,255,255,0.55)",
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      <span>Put your image here</span>
                      <span style={{ fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.35)" }}>
                        No demo photo
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      scene.collageLayout === "2up"
                        ? "1fr 1fr"
                        : scene.collageLayout === "magazine"
                          ? "1.4fr 1fr"
                          : "1fr 1fr 1fr",
                    gridTemplateRows:
                      scene.collageLayout === "strip" ? "1fr 1fr 1fr" : "1fr",
                    gap: 4,
                    height: "100%",
                  }}
                >
                  {(scene.collageLayout === "strip"
                    ? collageSlots
                    : collageSlots
                  ).map((url, i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: 8,
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.04)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gridColumn: scene.collageLayout === "magazine" && i === 0 ? "1" : undefined,
                        gridRow: scene.collageLayout === "magazine" && i === 0 ? "1 / span 2" : undefined,
                      }}
                    >
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>
                          Empty slot
                        </span>
                      )}
                    </div>
                  ))}
                  <YoPhoStudioStyleOverlay kind={stylePreset.overlay} displayName={resolvedName} />
                </div>
              )}

              {/* Custom text overlay */}
              {comp.textOverlay.text.trim() ? (
                <div
                  style={{
                    position: "absolute",
                    zIndex: 10,
                    textAlign: "center",
                    pointerEvents: "none",
                    ...textPos,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontSize: comp.textOverlay.fontSize,
                      fontWeight: 900,
                      color: comp.textOverlay.color,
                      letterSpacing: "0.04em",
                      textShadow: comp.textOverlay.outline
                        ? "0 0 2px #000, 0 2px 0 #000, 0 0 12px rgba(0,0,0,0.8)"
                        : `0 0 16px ${comp.textOverlay.color}66`,
                      display: "inline-block",
                      maxWidth: "100%",
                      wordBreak: "break-word",
                    }}
                  >
                    {comp.textOverlay.text}
                  </span>
                </div>
              ) : null}

              <YoPhoCardMediaPlayer
                modules={cardMediaModules}
                displayName={resolvedName}
                interactive
              />
            </div>

            {/* Name plate */}
            <div style={{ position: "relative", zIndex: 9, padding: "12px 14px 8px", textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontSize: compact ? 20 : 24,
                  fontWeight: 900,
                  color: "#fff",
                  textShadow: `0 0 18px ${accent}66, 0 2px 0 rgba(0,0,0,0.6)`,
                }}
              >
                {resolvedName}
              </div>
              <div
                style={{
                  marginTop: 6,
                  display: "flex",
                  justifyContent: "center",
                  gap: 10,
                  flexWrap: "wrap",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.55)",
                }}
              >
                {rank != null ? <span style={{ color: "#FFD700" }}>#{rank}</span> : null}
                {country ? <span>{country}</span> : null}
                <span style={{ color: "rgba(255,255,255,0.35)" }}>{stylePreset.label}</span>
              </div>
            </div>

            {role === "performer" && showMoneyCtas && resolvedSlug ? (
              <div
                style={{
                  position: "relative",
                  zIndex: 9,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  justifyContent: "center",
                  padding: "4px 12px 10px",
                }}
              >
                <CtaChip href={`/tip/${resolvedSlug}`} color="#FF2DAA" label="💸 TIP" />
                <button type="button" onClick={handleFollow} disabled={followBusy || following} style={chipStyle("#00E5FF")}>
                  {following ? "✓ FOLLOWING" : "＋ FOLLOW"}
                </button>
                <CtaChip href={`/fan-club/${resolvedSlug}`} color="#FFD700" label="⭐ FAN CLUB" />
                <CtaChip href={`/booking/artists/${resolvedSlug}`} color="#AA2DFF" label="📅 BOOK" />
                {isLive ? (
                  <CtaChip href={liveHref} color="#E63000" label="🔴 JOIN LIVE" />
                ) : (
                  <CtaChip href={`/performers/${resolvedSlug}`} color="rgba(255,255,255,0.55)" label="PROFILE" />
                )}
                <CtaChip href="/subscribe" color="#00FF88" label="💎 SUBSCRIBE" />
              </div>
            ) : null}

            {role === "fan" && showMoneyCtas ? (
              <div
                style={{
                  position: "relative",
                  zIndex: 9,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  justifyContent: "center",
                  padding: "4px 12px 10px",
                }}
              >
                <CtaChip href="/hub/fan?drawer=yopho" color="#FF2DAA" label="✨ EDIT YOPHO" />
                <CtaChip href="/hub/fan" color="#00E5FF" label="FAN HQ" />
                <CtaChip href="/subscribe" color="#FFD700" label="💎 UPGRADE" />
              </div>
            ) : null}

            {/* Clearance so name/CTAs sit above protected branding band */}
            <div style={{ minHeight: 44 }} aria-hidden />

            <YoPhoBrandingFooter
              cardId={comp.cardId}
              profilePath={profilePathForQr}
              config={{
                ...comp.brandingFooter,
                rarity: comp.rarity ?? comp.brandingFooter?.rarity ?? "STANDARD",
                editionBadge: comp.isCanonical
                  ? "CANONICAL"
                  : editionTitleInput.trim() ||
                    comp.editionTitle ||
                    momentTag ||
                    comp.brandingFooter?.editionBadge ||
                    null,
                showEditionBadge: true,
              }}
              showSafeGuide={showEditor}
              heightPct={footerPct}
            />
          </div>
        </DrawerBezelChrome>
      </div>

      {/* ── Editor / export / share (outside capture target so chrome stays clean) ── */}
      {showEditor ? (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(5,5,16,0.9)",
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", color: "#00E5FF" }}>
              YOPHO · LIVING CARD EDITOR
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
              Layered collectible · who I am right now — not Photoshop
            </div>
            <div
              style={{
                fontSize: 10,
                color: role === "performer" ? "#FFD700" : "#00E5FF",
                marginTop: 6,
                lineHeight: 1.45,
              }}
            >
              {roleModuleHints(role)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {(
              [
                ["identity", "IDENTITY"],
                ["scene", "SCENE"],
                ["effects", "EFFECTS"],
                ["music", "MUSIC"],
                ["motion", "MOTION"],
                ["editions", "EDITIONS"],
                ["share", "SHARE"],
              ] as const
            ).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setEditorTab(tab)}
                style={{
                  ...chipStyle(editorTab === tab ? accent : "rgba(255,255,255,0.4)"),
                  background: editorTab === tab ? `${accent}22` : "transparent",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {editorTab === "identity" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700", marginBottom: 6 }}>
                  MOOD / MOMENT
                </div>
                <input
                  value={moodTitle}
                  onChange={(e) => setMoodTitle(e.target.value.slice(0, 64))}
                  placeholder="Optional — e.g. Crown season energy"
                  style={inputStyle}
                />
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {["Today", "This week", "This month"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setMomentTag(tag)}
                      style={chipStyle(momentTag === tag ? "#FFD700" : "rgba(255,255,255,0.4)")}
                    >
                      {tag.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: "#00E5FF", marginBottom: 6 }}>
                  CARD TITLE · CANONICAL / EDITION
                </div>
                <input
                  value={editionTitleInput}
                  onChange={(e) => setEditionTitleInput(e.target.value.slice(0, 72))}
                  placeholder="Edition title (optional)"
                  style={{ ...inputStyle, marginBottom: 8 }}
                />
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        isCanonical: true,
                        kind: "CANONICAL_IDENTITY",
                        editionTitle: editionTitleInput.trim() || `${resolvedName} · Identity`,
                      })
                    }
                    style={chipStyle(comp.isCanonical ? "#FFD700" : "rgba(255,255,255,0.4)")}
                  >
                    {comp.isCanonical ? "★ CANONICAL" : "SET CANONICAL"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        isCanonical: false,
                        kind: "MEMORY_EDITION",
                        editionTitle: editionTitleInput.trim() || `${resolvedName} · Memory`,
                      })
                    }
                    style={chipStyle(
                      !comp.isCanonical && comp.kind === "MEMORY_EDITION"
                        ? "#00E5FF"
                        : "rgba(255,255,255,0.4)",
                    )}
                  >
                    MEMORY EDITION
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        isCanonical: false,
                        kind: "PROMOTIONAL_EDITION",
                        editionTitle: editionTitleInput.trim() || `${resolvedName} · Edition`,
                      })
                    }
                    style={chipStyle(
                      !comp.isCanonical && comp.kind === "PROMOTIONAL_EDITION"
                        ? "#FF2DAA"
                        : "rgba(255,255,255,0.4)",
                    )}
                  >
                    PROMO EDITION
                  </button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: "#FF2DAA", marginBottom: 6 }}>
                  RARITY LABEL · DISPLAY ONLY
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(["STANDARD", "RARE"] as YoPhoRarityLabel[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        patch({
                          rarity: r,
                          brandingFooter: {
                            enabled: true,
                            heightPct: footerPct,
                            showQr: true,
                            qrTarget: "card",
                            label: "TMI × YoPho",
                            ...(comp.brandingFooter ?? {}),
                            rarity: r,
                            showEditionBadge: true,
                          },
                        })
                      }
                      style={chipStyle(
                        (comp.rarity ?? "STANDARD") === r ? "#FF2DAA" : "rgba(255,255,255,0.4)",
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                  Footer badge only — no ownership ledger, trading, or price claims.
                </div>
              </div>

              {role === "fan" ? (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: "#AA2DFF", marginBottom: 6 }}>
                    FAN MODULES · QUOTE · FAVORITES
                  </div>
                  <input
                    value={fanQuote}
                    onChange={(e) => setFanQuote(e.target.value.slice(0, 120))}
                    placeholder="Quote / caption (fan identity)"
                    style={{ ...inputStyle, marginBottom: 6 }}
                  />
                  <input
                    value={fanFavorite}
                    onChange={(e) => setFanFavorite(e.target.value.slice(0, 80))}
                    placeholder="Favorite artist or vibe right now"
                    style={inputStyle}
                  />
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700", marginBottom: 6 }}>
                    PERFORMER · REAL IDENTITY
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.45 }}>
                    Use your real photo/video. Tip, follow, fan club, booking, and live join appear on the card
                    when live — no avatar ownership controls (Rule 26).
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: "#00E5FF", marginBottom: 6 }}>
                  CUSTOM BACKGROUND
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button type="button" onClick={() => fileRef.current?.click()} style={chipStyle("#FF2DAA")}>
                    UPLOAD IMAGE
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" hidden onChange={onBgFile} />
                  {comp.customBgUrl ? (
                    <button type="button" onClick={clearCustomBg} style={chipStyle("#FFD700")}>
                      CLEAR → PRESET
                    </button>
                  ) : null}
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <input
                    value={bgUrlInput}
                    onChange={(e) => setBgUrlInput(e.target.value)}
                    placeholder="https://… image URL"
                    style={{ flex: 1, ...inputStyle }}
                  />
                  <button type="button" onClick={applyBgUrl} style={chipStyle("#00E5FF")}>
                    APPLY URL
                  </button>
                </div>
                {bgStatus ? (
                  <div style={{ fontSize: 10, color: accent, marginTop: 6, fontWeight: 700 }}>{bgStatus}</div>
                ) : null}
              </div>

              <div>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: "#FFD700", marginBottom: 6 }}>
                  CUSTOM TEXT
                </div>
                <input
                  value={comp.textOverlay.text}
                  onChange={(e) => patchText({ text: e.target.value.slice(0, 48) })}
                  placeholder="e.g. 2026 · Tour name · slogan"
                  style={{ ...inputStyle, marginBottom: 8 }}
                />
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                  {(["top", "center", "bottom"] as TextOverlayPosition[]).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => patchText({ position: pos })}
                      style={chipStyle(
                        comp.textOverlay.position === pos ? "#FFD700" : "rgba(255,255,255,0.4)",
                      )}
                    >
                      {pos.toUpperCase()}
                    </button>
                  ))}
                  <label
                    style={{
                      fontSize: 10,
                      color: "rgba(255,255,255,0.5)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Size
                    <input
                      type="range"
                      min={14}
                      max={48}
                      value={comp.textOverlay.fontSize}
                      onChange={(e) => patchText({ fontSize: Number(e.target.value) })}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => patchText({ outline: !comp.textOverlay.outline })}
                    style={chipStyle(comp.textOverlay.outline ? "#00FF88" : "rgba(255,255,255,0.4)")}
                  >
                    OUTLINE {comp.textOverlay.outline ? "ON" : "OFF"}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {TMI_TEXT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Color ${c}`}
                      onClick={() => patchText({ color: c })}
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: c,
                        border:
                          comp.textOverlay.color === c
                            ? "2px solid #fff"
                            : "1px solid rgba(255,255,255,0.3)",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {editorTab === "scene" ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 180, overflowY: "auto" }}>
              {YOPHO_SCENE_PACKS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  title={s.tagline}
                  onClick={() => {
                    const next: Partial<YoPhoCardComposition> = { sceneId: s.id as YoPhoSceneId };
                    if (s.defaultSignText && !comp.textOverlay.text) {
                      next.textOverlay = { ...comp.textOverlay, text: s.defaultSignText };
                    }
                    patch(next);
                  }}
                  style={{
                    ...chipStyle(comp.sceneId === s.id ? "#00E5FF" : "rgba(255,255,255,0.45)"),
                    background: comp.sceneId === s.id ? "rgba(0,229,255,0.15)" : "transparent",
                  }}
                >
                  {s.label}
                </button>
              ))}
              {comp.customBgUrl ? (
                <div style={{ width: "100%", fontSize: 10, color: "#FFD700", marginTop: 4 }}>
                  Custom background is active — clear it under Identity to show scene kit fully
                </div>
              ) : null}
            </div>
          ) : null}

          {editorTab === "effects" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: "#FF2DAA" }}>
                STUDIO STYLES
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 120, overflowY: "auto" }}>
                {YOPHO_STUDIO_STYLE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    title={p.tagline}
                    onClick={() => patch({ styleId: p.id as YoPhoStudioStyleId })}
                    style={{
                      ...chipStyle(comp.styleId === p.id ? "#FF2DAA" : "rgba(255,255,255,0.45)"),
                      background: comp.styleId === p.id ? "rgba(255,45,170,0.18)" : "transparent",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: "#00E5FF" }}>
                UNDERLAY / FOREGROUND · INSTANT PREVIEW
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>
                Rain, fog, neon, smoke — CSS overlays. No AI wait.
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {YOPHO_MAGIC_EFFECTS.map((fx) => {
                  const on = magicEffects.includes(fx.id);
                  return (
                    <button
                      key={fx.id}
                      type="button"
                      title={`${fx.slot} · ${fx.tagline}`}
                      onClick={() =>
                        patch({ magicEffects: toggleMagicEffect(magicEffects, fx.id) })
                      }
                      style={{
                        ...chipStyle(on ? fx.accent : "rgba(255,255,255,0.4)"),
                        background: on ? `${fx.accent}22` : "transparent",
                      }}
                    >
                      {on ? "✓ " : ""}
                      {fx.label}
                      <span style={{ opacity: 0.55, marginLeft: 4 }}>
                        {fx.slot === "underlay" ? "↓" : "↑"}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
                Protected footer (TMI × YoPho + QR) — dashed safe guide on preview. Not deletable.
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 900, color: "#FFD700", letterSpacing: "0.12em" }}>
                  FOOTER HEIGHT
                </span>
                {[0.08, 0.1, 0.12].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() =>
                      patch({
                        brandingFooter: {
                          enabled: true,
                          showQr: true,
                          qrTarget: "card" as const,
                          label: "TMI × YoPho",
                          ...(comp.brandingFooter ?? {}),
                          heightPct: pct,
                        },
                        canvas: {
                          aspectRatio: "9:16" as const,
                          width: 360,
                          height: 640,
                          ...(comp.canvas ?? {}),
                          safeAreaBottomPct: pct,
                        },
                      })
                    }
                    style={chipStyle(
                      Math.abs((comp.brandingFooter?.heightPct ?? 0.1) - pct) < 0.001
                        ? "#FFD700"
                        : "rgba(255,255,255,0.4)",
                    )}
                  >
                    {Math.round(pct * 100)}%
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {editorTab === "music" ? (
            <YoPhoMediaModuleComposer
              role={role}
              userKey={userKey}
              accountTier={accountTier}
              modules={cardMediaModules}
              onChange={(next) => {
                const primary = next[0];
                setPlaylistIdInput(
                  primary && (primary.type === "playlist" || primary.type === "album")
                    ? primary.sourceId ?? ""
                    : "",
                );
                setSongTitle(primary?.title ?? "");
                setSongArtist(primary?.artist ?? "");
                setSongAudioUrl(primary?.audioUrl ?? "");
                patch({
                  mediaModules: next,
                  playlistId:
                    primary && (primary.type === "playlist" || primary.type === "album")
                      ? primary.sourceId
                      : null,
                });
              }}
            />
          ) : null}

          {editorTab === "motion" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: "#00FF88" }}>
                MOTOR CLIP · LOOP DURATION
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {YOPHO_MOTION_DURATIONS.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() =>
                      patch({
                        motion: { ...motion, durationSec: sec as YoPhoMotionDurationSec },
                      })
                    }
                    style={chipStyle(
                      motion.durationSec === sec ? "#00FF88" : "rgba(255,255,255,0.4)",
                    )}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                <button type="button" onClick={() => motionFileRef.current?.click()} style={chipStyle("#00E5FF")}>
                  UPLOAD MOTION
                </button>
                <input
                  ref={motionFileRef}
                  type="file"
                  accept="video/mp4,video/webm,video/*"
                  hidden
                  onChange={onMotionFile}
                />
                {motion.sourceUrl ? (
                  <button
                    type="button"
                    onClick={() => patch({ motion: defaultMotionClip() })}
                    style={chipStyle("#FF2DAA")}
                  >
                    CLEAR MOTION
                  </button>
                ) : null}
                <label
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.5)",
                    display: "flex",
                    gap: 4,
                    alignItems: "center",
                  }}
                >
                  Hook start (s)
                  <input
                    type="number"
                    min={0}
                    max={YOPHO_MOTION_SOURCE_MAX_SEC}
                    step={0.1}
                    value={motion.hookStartSec}
                    onChange={(e) =>
                      patch({
                        motion: {
                          ...motion,
                          hookStartSec: Math.max(0, Number(e.target.value) || 0),
                        },
                      })
                    }
                    style={{ width: 64, ...inputStyle, padding: "4px 6px" }}
                  />
                </label>
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>
                Upload MP4/WebM (source up to ~{YOPHO_MOTION_SOURCE_MAX_SEC}s). Card loops the selected{" "}
                {motion.durationSec}s hook. Still + ken-burns if no clip.
                {motion.sourceUrl ? " · Clip attached." : ""}
              </div>
              {motionStatus ? (
                <div style={{ fontSize: 10, color: "#00FF88", fontWeight: 700 }}>{motionStatus}</div>
              ) : null}
            </div>
          ) : null}

          {editorTab === "editions" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
                Publish locks immutable metadata (id, creator, edition #, publishedAt, type/theme). Prior{" "}
                <strong style={{ color: "#FFD700" }}>Current</strong> becomes Archived. Fans keep collected
                editions after you publish again.
              </div>

              {currentEdition ? (
                <div
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    border: "1px solid rgba(255,215,0,0.4)",
                    background: "rgba(255,215,0,0.08)",
                  }}
                >
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "#FFD700" }}>
                    CURRENT POINTER · EDITION #{currentEdition.editionNumber}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginTop: 4 }}>
                    {currentEdition.title}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                    {YOPHO_AVAILABILITY_LABELS[currentEdition.availability]}
                    {currentEdition.collectedCount > 0
                      ? ` · ${currentEdition.collectedCount} collected`
                      : ""}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  No Current edition yet — publish a new edition below.
                </div>
              )}

              <div>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "#00E5FF", marginBottom: 6 }}>
                  AVAILABILITY · STORE INTENT
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(Object.keys(YOPHO_AVAILABILITY_LABELS) as YoPhoEditionAvailability[]).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAvailability(a)}
                      style={chipStyle(availability === a ? "#00E5FF" : "rgba(255,255,255,0.4)")}
                    >
                      {YOPHO_AVAILABILITY_LABELS[a].toUpperCase()}
                    </button>
                  ))}
                </div>
                {availability === "LimitedEdition" ? (
                  <input
                    value={maxSupplyInput}
                    onChange={(e) => setMaxSupplyInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Max supply (soft enforce)"
                    style={{ ...inputStyle, marginTop: 8 }}
                  />
                ) : null}
              </div>

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button type="button" onClick={handleCreateDraft} style={chipStyle("#AA2DFF")}>
                  SAVE DRAFT
                </button>
                <button
                  type="button"
                  onClick={() => void publishInteractiveCard({ asEdition: true })}
                  style={chipStyle("#FF2DAA")}
                >
                  PUBLISH NEW EDITION
                </button>
              </div>

              {draftEditions.length > 0 ? (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                    DRAFTS / PREVIEW
                  </div>
                  {draftEditions.map((ed) => (
                    <div
                      key={ed.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                        alignItems: "center",
                        padding: "6px 8px",
                        marginBottom: 4,
                        borderRadius: 6,
                        border: "1px solid rgba(255,255,255,0.1)",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.65)",
                      }}
                    >
                      <span>
                        {ed.status} · {ed.title}
                      </span>
                      {ed.status === "DRAFT" ? (
                        <button
                          type="button"
                          onClick={() => handlePreviewDraft(ed.id)}
                          style={chipStyle("#00E5FF")}
                        >
                          PREVIEW
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : null}

              {archivedEditions.length > 0 ? (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                    ARCHIVED EDITIONS · {archivedEditions.length}
                  </div>
                  {archivedEditions.map((ed) => (
                    <div
                      key={ed.id}
                      style={{
                        padding: "6px 8px",
                        marginBottom: 4,
                        borderRadius: 6,
                        border: "1px solid rgba(255,255,255,0.08)",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.5)",
                      }}
                    >
                      #{ed.editionNumber} · {ed.title}
                      <span style={{ marginLeft: 8, color: "rgba(255,255,255,0.3)" }}>
                        collectors keep copies
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          {editorTab === "share" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
                <strong style={{ color: "#00E5FF" }}>Interactive YoPho card URL</strong> is the real share —
                layered scene, {motion.durationSec}s motor loop, pause reaction, song. PNG/WebM are teasers only.
              </div>
              <button
                type="button"
                onClick={handleShareInteractive}
                style={{ ...chipStyle("#00E5FF"), padding: "10px 14px", fontSize: 11 }}
              >
                ✦ SHARE INTERACTIVE YOPHO CARD
              </button>
              <button type="button" onClick={() => void publishInteractiveCard()} style={chipStyle("#FFD700")}>
                PUBLISH / REFRESH CARD URL
              </button>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => void publishInteractiveCard({ forceCanonical: true })}
                  style={chipStyle("#FFD700")}
                >
                  PUBLISH AS CANONICAL
                </button>
                <button
                  type="button"
                  onClick={() => void publishInteractiveCard({ asEdition: true })}
                  style={chipStyle("#00E5FF")}
                >
                  PUBLISH NEW EDITION
                </button>
              </div>
              {publishedPath ? (
                <a href={publishedPath} style={{ fontSize: 11, color: "#00FF88", fontWeight: 700 }}>
                  Open {publishedPath} →
                </a>
              ) : null}
              {publishStatus ? (
                <div style={{ fontSize: 10, color: accent, fontWeight: 700 }}>{publishStatus}</div>
              ) : null}
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  paddingTop: 10,
                  fontSize: 10,
                  color: "rgba(255,255,255,0.4)",
                  lineHeight: 1.45,
                }}
              >
                Optional teasers (not interactive) — for platforms that only accept image/video:
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  disabled={exportBusy}
                  onClick={handleDownloadStill}
                  style={chipStyle("#00FF88")}
                >
                  DOWNLOAD STILL (PNG)
                </button>
                <button
                  type="button"
                  disabled={exportBusy}
                  onClick={handleDownloadMotion}
                  style={chipStyle("rgba(255,255,255,0.45)")}
                >
                  MOTION TEASER (WebM · not interactive)
                </button>
              </div>
              {exportStatus ? (
                <div style={{ fontSize: 10, color: accent, fontWeight: 700 }}>{exportStatus}</div>
              ) : null}
            </div>
          ) : null}

        </div>
      ) : null}

      {showShare ? (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
            <button type="button" onClick={handleShareInteractive} style={chipStyle("#00E5FF")}>
              ✦ SHARE INTERACTIVE
            </button>
            <button type="button" onClick={handleCopyLink} style={chipStyle(accent)}>
              COPY CARD URL
            </button>
            <button type="button" onClick={openThreadPicker} style={chipStyle("#FF2DAA")}>
              SEND IN MSG
            </button>
          </div>
          {shareStatus ? (
            <div style={{ textAlign: "center", fontSize: 10, color: accent, fontWeight: 700 }}>
              {shareStatus}
            </div>
          ) : null}
          {showThreadPicker ? (
            <div
              style={{
                background: "rgba(0,0,0,0.45)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: 8,
                maxHeight: 140,
                overflowY: "auto",
              }}
            >
              {threads === null ? (
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
                  Loading conversations…
                </div>
              ) : threads.length === 0 ? (
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
                  No conversations yet. Open Messages to start one.
                </div>
              ) : (
                threads.map((t) => (
                  <button
                    key={t.threadId}
                    type="button"
                    onClick={() => handleShareToThread(t.threadId)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      background: "transparent",
                      border: "none",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "8px 6px",
                      cursor: "pointer",
                    }}
                  >
                    {t.name}
                  </button>
                ))
              )}
              <button
                type="button"
                onClick={() => setShowThreadPicker(false)}
                style={{ ...chipStyle("rgba(255,255,255,0.45)"), width: "100%", marginTop: 6 }}
              >
                Cancel
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
