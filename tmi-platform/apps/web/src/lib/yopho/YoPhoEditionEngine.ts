/**
 * YoPhoEditionEngine — Phase 1 published collectible editions.
 *
 * Lifecycle: Draft → Preview → Publish (Current).
 * On publish: previous Current → Archived; editionNumber increments.
 * Immutable after publish: id, creator, editionNumber, publishedAt, type/theme.
 * Fans collect by editionId; later publishes never remove prior collections.
 *
 * Soft-enforces LimitedEdition / TimeLimited when local storage allows.
 * Gift/trade deferred. No NFT mint. No fake floor prices (Rule 20).
 */

import type { YoPhoCardKind } from "./YoPhoCardDocument";

export type YoPhoEditionLifecycleStatus = "DRAFT" | "PREVIEW" | "CURRENT" | "ARCHIVED";

export type YoPhoEditionAvailability =
  | "Unlimited"
  | "LimitedEdition"
  | "TimeLimited"
  | "EventExclusive"
  | "SubscriberExclusive"
  | "ChampionshipReward"
  | "InviteOnly";

/** Alias constants matching Living OS action naming (without ACTION_ prefix). */
export const CREATE_YOPHO_DRAFT = "ACTION_CREATE_YOPHO_DRAFT" as const;
export const PUBLISH_YOPHO = "ACTION_PUBLISH_YOPHO" as const;
export const ARCHIVE_YOPHO = "ACTION_ARCHIVE_YOPHO" as const;
export const COLLECT_YOPHO = "ACTION_COLLECT_YOPHO" as const;

export interface YoPhoEditionRecord {
  /** = interactive card id / editionId */
  id: string;
  creatorOwnerKey: string;
  editionNumber: number;
  status: YoPhoEditionLifecycleStatus;
  title: string;
  kind: YoPhoCardKind;
  theme: string | null;
  availability: YoPhoEditionAvailability;
  /** Soft max for LimitedEdition */
  maxSupply: number | null;
  availableUntil: string | null;
  collectedCount: number;
  publishedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface YoPhoCollectorRecord {
  fanUserId: string;
  editionId: string;
  creatorOwnerKey: string;
  collectedAt: string;
}

const EDITIONS_KEY = (ownerKey: string) => `tmi_yopho_editions_${ownerKey}`;
const CURRENT_PTR_KEY = (ownerKey: string) => `tmi_yopho_current_edition_${ownerKey}`;
const COLLECTOR_KEY = (fanUserId: string) => `tmi_yopho_collections_${fanUserId}`;
const COUNTER_KEY = (ownerKey: string) => `tmi_yopho_edition_counter_${ownerKey}`;

function genEditionId(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `yc_${Date.now().toString(36)}_${rand}`;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

function nextEditionNumber(ownerKey: string): number {
  const current = readJson<number>(COUNTER_KEY(ownerKey), 0);
  const next = current + 1;
  writeJson(COUNTER_KEY(ownerKey), next);
  return next;
}

function saveEditionList(ownerKey: string, editions: YoPhoEditionRecord[]): void {
  writeJson(EDITIONS_KEY(ownerKey), editions);
}

export function listEditionsForCreator(ownerKey: string): YoPhoEditionRecord[] {
  if (!ownerKey) return [];
  return readJson<YoPhoEditionRecord[]>(EDITIONS_KEY(ownerKey), []).sort(
    (a, b) => b.editionNumber - a.editionNumber,
  );
}

export function getEdition(ownerKey: string, editionId: string): YoPhoEditionRecord | null {
  return listEditionsForCreator(ownerKey).find((e) => e.id === editionId) ?? null;
}

export function getEditionById(editionId: string): YoPhoEditionRecord | null {
  if (typeof window === "undefined" || !editionId) return null;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("tmi_yopho_editions_")) continue;
      const list = readJson<YoPhoEditionRecord[]>(key, []);
      const hit = list.find((e) => e.id === editionId);
      if (hit) return hit;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function getCurrentEdition(ownerKey: string): YoPhoEditionRecord | null {
  if (!ownerKey) return null;
  const ptr = readJson<string | null>(CURRENT_PTR_KEY(ownerKey), null);
  const list = listEditionsForCreator(ownerKey);
  if (ptr) {
    const byPtr = list.find((e) => e.id === ptr && e.status === "CURRENT");
    if (byPtr) return byPtr;
  }
  return list.find((e) => e.status === "CURRENT") ?? null;
}

export function listArchivedEditions(ownerKey: string): YoPhoEditionRecord[] {
  return listEditionsForCreator(ownerKey).filter((e) => e.status === "ARCHIVED");
}

export function listDraftAndPreviewEditions(ownerKey: string): YoPhoEditionRecord[] {
  return listEditionsForCreator(ownerKey).filter(
    (e) => e.status === "DRAFT" || e.status === "PREVIEW",
  );
}

export interface CreateYoPhoDraftInput {
  creatorOwnerKey: string;
  title: string;
  kind?: YoPhoCardKind;
  theme?: string | null;
  availability?: YoPhoEditionAvailability;
  maxSupply?: number | null;
  availableUntil?: string | null;
  /** Optional pre-assigned id (e.g. from composition cardId). */
  id?: string;
}

/** CREATE_YOPHO_DRAFT — Draft lifecycle entry. */
export function createYoPhoDraft(input: CreateYoPhoDraftInput): YoPhoEditionRecord {
  const now = new Date().toISOString();
  const ownerKey = input.creatorOwnerKey;
  const record: YoPhoEditionRecord = {
    id: input.id ?? genEditionId(),
    creatorOwnerKey: ownerKey,
    editionNumber: 0, // assigned on publish
    status: "DRAFT",
    title: input.title.trim() || "Untitled YoPho Edition",
    kind: input.kind ?? "PROMOTIONAL_EDITION",
    theme: input.theme ?? null,
    availability: input.availability ?? "Unlimited",
    maxSupply: input.maxSupply ?? null,
    availableUntil: input.availableUntil ?? null,
    collectedCount: 0,
    publishedAt: null,
    archivedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  const list = listEditionsForCreator(ownerKey).filter((e) => e.id !== record.id);
  saveEditionList(ownerKey, [...list, record]);
  return record;
}

/** Move Draft → Preview. */
export function previewYoPhoEdition(
  ownerKey: string,
  editionId: string,
): YoPhoEditionRecord | null {
  const list = listEditionsForCreator(ownerKey);
  const idx = list.findIndex((e) => e.id === editionId);
  if (idx < 0) return null;
  const ed = list[idx]!;
  if (ed.status !== "DRAFT" && ed.status !== "PREVIEW") return ed;
  const next: YoPhoEditionRecord = {
    ...ed,
    status: "PREVIEW",
    updatedAt: new Date().toISOString(),
  };
  list[idx] = next;
  saveEditionList(ownerKey, list);
  return next;
}

export interface PublishYoPhoEditionInput {
  ownerKey: string;
  /** Draft/Preview edition id, or create-from-card id. */
  editionId?: string;
  title?: string;
  kind?: YoPhoCardKind;
  theme?: string | null;
  availability?: YoPhoEditionAvailability;
  maxSupply?: number | null;
  availableUntil?: string | null;
  /** When publishing a fresh card that has no draft row yet. */
  createIfMissing?: boolean;
}

/**
 * PUBLISH_YOPHO — promotes to Current, archives prior Current,
 * assigns incrementing editionNumber. Metadata frozen at publish.
 */
export function publishYoPhoEdition(input: PublishYoPhoEditionInput): YoPhoEditionRecord {
  const { ownerKey } = input;
  const now = new Date().toISOString();
  let list = listEditionsForCreator(ownerKey);

  let target: YoPhoEditionRecord | undefined = input.editionId
    ? list.find((e) => e.id === input.editionId)
    : undefined;

  if (!target && input.createIfMissing !== false) {
    target = createYoPhoDraft({
      creatorOwnerKey: ownerKey,
      title: input.title ?? "YoPho Edition",
      kind: input.kind,
      theme: input.theme,
      availability: input.availability,
      maxSupply: input.maxSupply,
      availableUntil: input.availableUntil,
      id: input.editionId,
    });
    list = listEditionsForCreator(ownerKey);
  }

  if (!target) {
    throw new Error("YoPho edition not found to publish");
  }

  // Immutable publish fields — never rewrite after first publish
  const alreadyPublished = Boolean(target.publishedAt);
  const editionNumber = alreadyPublished
    ? target.editionNumber
    : nextEditionNumber(ownerKey);

  const published: YoPhoEditionRecord = {
    ...target,
    title: alreadyPublished ? target.title : (input.title?.trim() || target.title),
    kind: alreadyPublished ? target.kind : (input.kind ?? target.kind),
    theme: alreadyPublished
      ? target.theme
      : input.theme !== undefined
        ? input.theme
        : target.theme,
    availability: alreadyPublished
      ? target.availability
      : (input.availability ?? target.availability),
    maxSupply: alreadyPublished
      ? target.maxSupply
      : input.maxSupply !== undefined
        ? input.maxSupply
        : target.maxSupply,
    availableUntil: alreadyPublished
      ? target.availableUntil
      : input.availableUntil !== undefined
        ? input.availableUntil
        : target.availableUntil,
    editionNumber,
    status: "CURRENT",
    publishedAt: target.publishedAt ?? now,
    archivedAt: null,
    updatedAt: now,
  };

  const nextList = list.map((e) => {
    if (e.id === published.id) return published;
    if (e.status === "CURRENT") {
      return { ...e, status: "ARCHIVED" as const, archivedAt: now, updatedAt: now };
    }
    return e;
  });
  if (!nextList.some((e) => e.id === published.id)) {
    nextList.push(published);
  }

  saveEditionList(ownerKey, nextList);
  writeJson(CURRENT_PTR_KEY(ownerKey), published.id);
  return published;
}

/** ARCHIVE_YOPHO — force archive (e.g. retire Current without publishing next). */
export function archiveYoPhoEdition(
  ownerKey: string,
  editionId: string,
): YoPhoEditionRecord | null {
  const now = new Date().toISOString();
  const list = listEditionsForCreator(ownerKey);
  const idx = list.findIndex((e) => e.id === editionId);
  if (idx < 0) return null;
  const ed = list[idx]!;
  if (ed.status === "ARCHIVED") return ed;
  const next: YoPhoEditionRecord = {
    ...ed,
    status: "ARCHIVED",
    archivedAt: now,
    updatedAt: now,
  };
  list[idx] = next;
  saveEditionList(ownerKey, list);
  const ptr = readJson<string | null>(CURRENT_PTR_KEY(ownerKey), null);
  if (ptr === editionId) {
    writeJson(CURRENT_PTR_KEY(ownerKey), null);
  }
  return next;
}

function isCollectibleNow(ed: YoPhoEditionRecord): { ok: boolean; reason?: string } {
  if (ed.status !== "CURRENT" && ed.status !== "ARCHIVED") {
    return { ok: false, reason: "Edition is not published" };
  }
  // Archived CURRENT-era editions remain collectible if already published (fans keep history).
  // Soft: new collects only allowed for CURRENT unless Unlimited archive keep.
  if (ed.status === "ARCHIVED" && ed.availability !== "Unlimited") {
    // Still allow collect of archived for Unlimited; others soft-block new collects
    if (ed.availability === "LimitedEdition" || ed.availability === "TimeLimited") {
      // Allow if already under supply — archived limited can still fill remaining soft supply
    }
  }
  if (ed.availability === "TimeLimited" && ed.availableUntil) {
    if (Date.now() > new Date(ed.availableUntil).getTime()) {
      return { ok: false, reason: "Time-limited window ended" };
    }
  }
  if (
    ed.availability === "LimitedEdition" &&
    ed.maxSupply != null &&
    ed.collectedCount >= ed.maxSupply
  ) {
    return { ok: false, reason: "Limited edition supply reached" };
  }
  // EventExclusive / SubscriberExclusive / ChampionshipReward / InviteOnly — store intent; soft allow
  return { ok: true };
}

/** COLLECT_YOPHO — fan collects editionId; later publishes never remove this. */
export function collectYoPhoEdition(
  fanUserId: string,
  editionId: string,
  opts?: { creatorOwnerKey?: string },
): { ok: boolean; record?: YoPhoCollectorRecord; error?: string } {
  if (!fanUserId || !editionId) {
    return { ok: false, error: "fanUserId and editionId required" };
  }
  const ed = getEditionById(editionId);
  if (ed) {
    const gate = isCollectibleNow(ed);
    if (!gate.ok) {
      return { ok: false, error: gate.reason };
    }
  }
  // Soft allow when edition ledger isn't on this device (cross-browser share) —
  // still record ownership by editionId so later publishes never strip the collection.

  const existing = listCollectedEditions(fanUserId);
  if (existing.some((c) => c.editionId === editionId)) {
    return {
      ok: true,
      record: existing.find((c) => c.editionId === editionId),
    };
  }

  const record: YoPhoCollectorRecord = {
    fanUserId,
    editionId,
    creatorOwnerKey: ed?.creatorOwnerKey ?? opts?.creatorOwnerKey ?? "unknown",
    collectedAt: new Date().toISOString(),
  };
  writeJson(COLLECTOR_KEY(fanUserId), [...existing, record]);

  if (ed) {
    const list = listEditionsForCreator(ed.creatorOwnerKey);
    const nextList = list.map((e) =>
      e.id === editionId
        ? { ...e, collectedCount: e.collectedCount + 1, updatedAt: new Date().toISOString() }
        : e,
    );
    saveEditionList(ed.creatorOwnerKey, nextList);
  }

  return { ok: true, record };
}

export function listCollectedEditions(fanUserId: string): YoPhoCollectorRecord[] {
  if (!fanUserId) return [];
  return readJson<YoPhoCollectorRecord[]>(COLLECTOR_KEY(fanUserId), []);
}

export function fanOwnsEdition(fanUserId: string, editionId: string): boolean {
  return listCollectedEditions(fanUserId).some((c) => c.editionId === editionId);
}

export const YOPHO_AVAILABILITY_LABELS: Record<YoPhoEditionAvailability, string> = {
  Unlimited: "Unlimited",
  LimitedEdition: "Limited Edition",
  TimeLimited: "Time Limited",
  EventExclusive: "Event Exclusive",
  SubscriberExclusive: "Subscriber Exclusive",
  ChampionshipReward: "Championship Reward",
  InviteOnly: "Invite Only",
};
