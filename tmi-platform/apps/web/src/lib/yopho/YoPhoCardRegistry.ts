/**
 * YoPho Interactive Card registry — shareable cardId artifacts.
 * Persists localStorage + in-memory API mirror for same-origin share.
 */

import {
  createDefaultComposition,
  defaultMotionClip,
  type YoPhoCardComposition,
  type YoPhoMotionClip,
  type YoPhoTextOverlay,
} from "./YoPhoCardComposition";
import type { YoPhoStudioStyleId } from "./YoPhoStudioStylePresets";
import type { YoPhoSceneId } from "./YoPhoScenePack";
import type { YoPhoMagicEffectId } from "./YoPhoMagicEffects";
import {
  compositionToDocument,
  markDocumentCanonical,
  type YoPhoCardDocument,
  type YoPhoCardKind,
  type YoPhoRarityLabel,
} from "./YoPhoCardDocument";

export type YoPhoCardRole = "fan" | "performer";

/** Now Playing — single track and/or playlist for "song right now" */
export interface YoPhoNowPlaying {
  playlistId?: string | null;
  trackId?: string | null;
  title?: string | null;
  artist?: string | null;
  audioUrl?: string | null;
  coverUrl?: string | null;
}

export interface PublishedYoPhoCard {
  cardId: string;
  role: YoPhoCardRole;
  displayName: string;
  slug?: string;
  subjectUrl: string;
  styleId: YoPhoStudioStyleId;
  sceneId: YoPhoSceneId;
  customBgUrl: string | null;
  textOverlay: YoPhoTextOverlay;
  collageUrls: (string | null)[];
  /** Optional attached playlist — enables Next Track on interactive card */
  playlistId?: string | null;
  /** Mood / moment title — who I am right now */
  moodTitle?: string | null;
  /** Display-only tag e.g. "This month" / "Today" */
  momentTag?: string | null;
  nowPlaying?: YoPhoNowPlaying | null;
  /** Motor-card motion hook (loop from optional ≤60s source) */
  motion?: YoPhoMotionClip | null;
  /** Magic effect presets active on this card */
  magicEffects?: YoPhoMagicEffectId[];
  /** Canonical scene document — source of truth (PNG/WebM are non-interactive teasers) */
  documentJson?: YoPhoCardDocument | null;
  kind?: YoPhoCardKind;
  isCanonical?: boolean;
  editionTitle?: string | null;
  /** Display-only — STANDARD | RARE. No ownership ledger. */
  rarity?: YoPhoRarityLabel;
  ownerKey: string;
  createdAt: string;
  updatedAt: string;
}

const LOCAL_INDEX = "tmi_yopho_published_cards";
const LOCAL_CARD = (id: string) => `tmi_yopho_card_${id}`;

function genCardId(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `yc_${Date.now().toString(36)}_${rand}`;
}

export function interactiveCardPath(cardId: string): string {
  return `/yopho/card/${encodeURIComponent(cardId)}`;
}

export function compositionToDraft(
  comp: YoPhoCardComposition,
  meta: {
    role: YoPhoCardRole;
    displayName: string;
    slug?: string;
    subjectUrl: string;
    ownerKey: string;
    playlistId?: string | null;
    cardId?: string;
    moodTitle?: string | null;
    momentTag?: string | null;
    nowPlaying?: YoPhoNowPlaying | null;
    motion?: YoPhoMotionClip | null;
    isCanonical?: boolean;
    editionTitle?: string | null;
    kind?: YoPhoCardKind;
    rarity?: YoPhoRarityLabel;
    quote?: string | null;
  },
): PublishedYoPhoCard {
  const now = new Date().toISOString();
  const cardId = meta.cardId ?? genCardId();
  const isCanonical = meta.isCanonical ?? Boolean(comp.isCanonical);
  const rarity = meta.rarity ?? comp.rarity ?? "STANDARD";
  let documentJson = compositionToDocument(
    {
      ...comp,
      motion: meta.motion ?? comp.motion,
      playlistId: meta.playlistId ?? comp.playlistId,
      rarity,
    },
    {
      id: cardId,
      ownerKey: meta.ownerKey,
      role: meta.role,
      displayName: meta.displayName,
      slug: meta.slug,
      subjectUrl: meta.subjectUrl,
      title: meta.editionTitle ?? comp.editionTitle ?? undefined,
      kind: meta.kind ?? comp.kind,
      isCanonical,
      rarity,
      moodTitle: meta.moodTitle,
      momentTag: meta.momentTag,
      quote: meta.quote,
      audio: meta.nowPlaying ?? null,
      createdAt: now,
    },
  );
  if (isCanonical) {
    documentJson = markDocumentCanonical(documentJson, meta.ownerKey);
  }
  return {
    cardId,
    role: meta.role,
    displayName: meta.displayName,
    slug: meta.slug,
    subjectUrl: meta.subjectUrl,
    styleId: comp.styleId,
    sceneId: comp.sceneId,
    customBgUrl: comp.customBgUrl,
    textOverlay: comp.textOverlay,
    collageUrls: comp.collageUrls,
    playlistId: meta.playlistId ?? comp.playlistId ?? null,
    moodTitle: meta.moodTitle ?? null,
    momentTag: meta.momentTag ?? null,
    nowPlaying: meta.nowPlaying ?? null,
    motion: meta.motion ?? comp.motion ?? defaultMotionClip(),
    magicEffects: comp.magicEffects ?? [],
    documentJson,
    kind: documentJson.kind,
    isCanonical: documentJson.isCanonical,
    editionTitle: documentJson.title,
    rarity: documentJson.rarity,
    ownerKey: meta.ownerKey,
    createdAt: now,
    updatedAt: now,
  };
}

export function savePublishedCardLocal(card: PublishedYoPhoCard): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_CARD(card.cardId), JSON.stringify(card));
    const raw = localStorage.getItem(LOCAL_INDEX);
    const ids: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    if (!ids.includes(card.cardId)) {
      ids.unshift(card.cardId);
      localStorage.setItem(LOCAL_INDEX, JSON.stringify(ids.slice(0, 40)));
    }
  } catch {
    /* ignore */
  }
}

export function loadPublishedCardLocal(cardId: string): PublishedYoPhoCard | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_CARD(cardId));
    if (!raw) return null;
    return JSON.parse(raw) as PublishedYoPhoCard;
  } catch {
    return null;
  }
}

/** Publish to local + API. Returns cardId for share URL. */
export async function publishYoPhoCard(
  card: PublishedYoPhoCard,
): Promise<{ ok: boolean; cardId: string; error?: string }> {
  const next = { ...card, updatedAt: new Date().toISOString() };
  savePublishedCardLocal(next);
  try {
    const res = await fetch("/api/yopho/cards", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(next),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      // Local publish still usable for same-browser share
      return {
        ok: true,
        cardId: next.cardId,
        error: data.error ?? "API sync deferred — card saved on this device",
      };
    }
    return { ok: true, cardId: next.cardId };
  } catch {
    return {
      ok: true,
      cardId: next.cardId,
      error: "Offline — card saved on this device only",
    };
  }
}

export async function fetchPublishedCard(
  cardId: string,
): Promise<PublishedYoPhoCard | null> {
  try {
    const res = await fetch(`/api/yopho/cards/${encodeURIComponent(cardId)}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as { card?: PublishedYoPhoCard };
      if (data.card?.cardId) {
        savePublishedCardLocal(data.card);
        return data.card;
      }
    }
  } catch {
    /* fall through */
  }
  return loadPublishedCardLocal(cardId);
}

export function draftCompositionFromPublished(card: PublishedYoPhoCard): YoPhoCardComposition {
  const base = createDefaultComposition();
  return {
    ...base,
    styleId: card.styleId,
    sceneId: card.sceneId,
    customBgUrl: card.customBgUrl,
    textOverlay: card.textOverlay,
    collageUrls: card.collageUrls,
    cardId: card.cardId,
    playlistId: card.playlistId ?? null,
    motion: card.motion ?? defaultMotionClip(),
    magicEffects: card.magicEffects ?? [],
    isCanonical: card.isCanonical ?? false,
    editionTitle: card.editionTitle ?? null,
    kind: card.kind ?? base.kind,
    rarity: card.rarity ?? card.documentJson?.rarity ?? "STANDARD",
    brandingFooter: card.documentJson?.brandingFooter ?? base.brandingFooter,
    documentJson: card.documentJson ?? null,
    updatedAt: card.updatedAt,
  };
}
