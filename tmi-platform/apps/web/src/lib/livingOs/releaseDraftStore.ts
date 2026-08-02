/**
 * releaseDraftStore — Release Manager drafts for RELEASE_NEW_WORK.
 * Persists to localStorage (no DB table yet).
 */

export type ReleaseLifecycleStatus =
  | "Draft"
  | "Scheduled"
  | "Publishing"
  | "Live"
  | "Featured"
  | "Archived";

export type LaunchWizardItemId =
  | "upload_audio"
  | "cover"
  | "yopho_edition"
  | "magazine"
  | "listening_party"
  | "beat_listing"
  | "store"
  | "notify"
  | "publish";

export interface LaunchWizardItem {
  id: LaunchWizardItemId;
  label: string;
  /** Creator opted this step into the launch. */
  optedIn: boolean;
  /** Checklist done before publish (manual prep). */
  checked: boolean;
}

export interface ReleaseDraft {
  releaseId: string;
  performerId: string;
  title: string;
  audioUrl?: string;
  coverUrl?: string;
  productBuyUrl?: string;
  priceCents?: number;
  status: ReleaseLifecycleStatus;
  scheduledAt?: string;
  wizard: LaunchWizardItem[];
  lastRunId?: string;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_LAUNCH_WIZARD: LaunchWizardItem[] = [
  { id: "upload_audio", label: "Upload Audio", optedIn: true, checked: false },
  { id: "cover", label: "Cover", optedIn: true, checked: false },
  { id: "yopho_edition", label: "YoPho Edition", optedIn: false, checked: false },
  { id: "magazine", label: "Magazine", optedIn: false, checked: false },
  { id: "listening_party", label: "Listening Party", optedIn: false, checked: false },
  { id: "beat_listing", label: "Beat Listing", optedIn: false, checked: false },
  { id: "store", label: "Store", optedIn: true, checked: false },
  { id: "notify", label: "Notify", optedIn: true, checked: false },
  { id: "publish", label: "Publish", optedIn: true, checked: false },
];

const STORAGE_PREFIX = "tmi_release_drafts_";

function storageKey(performerId: string): string {
  return `${STORAGE_PREFIX}${performerId}`;
}

function readLocal(performerId: string): ReleaseDraft[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(performerId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ReleaseDraft[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(performerId: string, drafts: ReleaseDraft[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(performerId), JSON.stringify(drafts));
  } catch {
    /* quota */
  }
}

function genId(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `rel_${Date.now().toString(36)}_${rand}`;
}

export function listReleaseDrafts(performerId: string): ReleaseDraft[] {
  if (!performerId) return [];
  return readLocal(performerId).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getReleaseDraft(
  performerId: string,
  releaseId: string,
): ReleaseDraft | null {
  return listReleaseDrafts(performerId).find((d) => d.releaseId === releaseId) ?? null;
}

export function createReleaseDraft(
  performerId: string,
  partial?: Partial<Pick<ReleaseDraft, "title" | "status">>,
): ReleaseDraft {
  const now = new Date().toISOString();
  const draft: ReleaseDraft = {
    releaseId: genId(),
    performerId,
    title: partial?.title?.trim() || "Untitled Release",
    status: partial?.status ?? "Draft",
    wizard: DEFAULT_LAUNCH_WIZARD.map((w) => ({ ...w })),
    createdAt: now,
    updatedAt: now,
  };
  const all = readLocal(performerId);
  writeLocal(performerId, [draft, ...all]);
  return draft;
}

export function upsertReleaseDraft(draft: ReleaseDraft): ReleaseDraft {
  const next: ReleaseDraft = { ...draft, updatedAt: new Date().toISOString() };
  const all = readLocal(draft.performerId).filter((d) => d.releaseId !== draft.releaseId);
  writeLocal(draft.performerId, [next, ...all]);
  return next;
}

export function archiveReleaseDraft(performerId: string, releaseId: string): ReleaseDraft | null {
  const existing = getReleaseDraft(performerId, releaseId);
  if (!existing) return null;
  return upsertReleaseDraft({ ...existing, status: "Archived" });
}

export function filterReleasesByStatus(
  drafts: ReleaseDraft[],
  status: ReleaseLifecycleStatus | "All",
): ReleaseDraft[] {
  if (status === "All") return drafts;
  return drafts.filter((d) => d.status === status);
}
