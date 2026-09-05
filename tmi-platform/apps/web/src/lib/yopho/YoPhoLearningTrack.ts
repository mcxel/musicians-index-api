/**
 * YoPho Free learning track — 500 XP pathway via XpActionRegistry (Rule 9).
 * Client tracks local progress for UI; durable grants go through /api/yopho/learn-xp.
 * No cash. No parallel points engine.
 */

import {
  YOPHO_LEARNING_ACTION_KEYS,
  YOPHO_LEARNING_TRACK_TARGET_XP,
  getXpValue,
  type XpActionKey,
} from "@/lib/xp/XpActionRegistry";

export type YoPhoLearningActionKey = (typeof YOPHO_LEARNING_ACTION_KEYS)[number];

const STORAGE_KEY = "tmi_yopho_learning_track_v1";

export interface YoPhoLearningStep {
  key: YoPhoLearningActionKey;
  label: string;
  xp: number;
  hint: string;
}

export const YOPHO_LEARNING_STEPS: YoPhoLearningStep[] = [
  {
    key: "yopho_set_background",
    label: "Set background",
    xp: getXpValue("yopho_set_background"),
    hint: "Fill the Background slot first — the base of every card.",
  },
  {
    key: "yopho_add_image_layer",
    label: "Add image layer",
    xp: getXpValue("yopho_add_image_layer"),
    hint: "Add a photo or cutout on top (Free: up to 2 after background).",
  },
  {
    key: "yopho_add_effect",
    label: "Apply FX / filter",
    xp: getXpValue("yopho_add_effect"),
    hint: "Mix FX between and on layers — system layers don’t burn image slots.",
  },
  {
    key: "yopho_save_composition",
    label: "Save composition",
    xp: getXpValue("yopho_save_composition"),
    hint: "Save your baseball-card / album-cover composition.",
  },
  {
    key: "yopho_share_card",
    label: "Share + QR",
    xp: getXpValue("yopho_share_card"),
    hint: "Copy/share the card link — QR rides the protected TMI × YoPho footer.",
  },
  {
    key: "yopho_complete_onboarding",
    label: "Finish how-to",
    xp: getXpValue("yopho_complete_onboarding"),
    hint: "Dismiss the Free how-to after reading the layered creation steps.",
  },
];

export interface YoPhoLearningProgress {
  completed: YoPhoLearningActionKey[];
  earnedXp: number;
  targetXp: number;
  updatedAt: string;
}

function emptyProgress(): YoPhoLearningProgress {
  return {
    completed: [],
    earnedXp: 0,
    targetXp: YOPHO_LEARNING_TRACK_TARGET_XP,
    updatedAt: new Date().toISOString(),
  };
}

export function isYoPhoLearningAction(key: string): key is YoPhoLearningActionKey {
  return (YOPHO_LEARNING_ACTION_KEYS as readonly string[]).includes(key);
}

export function loadYoPhoLearningProgress(): YoPhoLearningProgress {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<YoPhoLearningProgress>;
    const completed = Array.isArray(parsed.completed)
      ? parsed.completed.filter(isYoPhoLearningAction)
      : [];
    const earnedXp = completed.reduce((sum, key) => sum + getXpValue(key), 0);
    return {
      completed,
      earnedXp,
      targetXp: YOPHO_LEARNING_TRACK_TARGET_XP,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return emptyProgress();
  }
}

export function markYoPhoLearningLocal(key: YoPhoLearningActionKey): YoPhoLearningProgress {
  const prev = loadYoPhoLearningProgress();
  if (prev.completed.includes(key)) return prev;
  const next: YoPhoLearningProgress = {
    completed: [...prev.completed, key],
    earnedXp: prev.earnedXp + getXpValue(key),
    targetXp: YOPHO_LEARNING_TRACK_TARGET_XP,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
  return next;
}

export interface ClaimYoPhoLearningResult {
  ok: boolean;
  granted: number;
  reason?: string;
  progress: YoPhoLearningProgress;
  total?: number;
}

/**
 * Claim a once-only learning action. Updates local UI progress always when newly completed;
 * durable XP only when the API grants (signed-in). Honest empty grant when unauthenticated.
 */
export async function claimYoPhoLearningXp(
  actionKey: YoPhoLearningActionKey | XpActionKey,
): Promise<ClaimYoPhoLearningResult> {
  if (!isYoPhoLearningAction(actionKey)) {
    return { ok: false, granted: 0, reason: "invalid_action", progress: loadYoPhoLearningProgress() };
  }

  const before = loadYoPhoLearningProgress();
  if (before.completed.includes(actionKey)) {
    return { ok: true, granted: 0, reason: "already_earned", progress: before };
  }

  let granted = 0;
  let reason: string | undefined;
  let total: number | undefined;

  try {
    const res = await fetch("/api/yopho/learn-xp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ actionKey }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      granted?: number;
      reason?: string;
      total?: number;
      error?: string;
    };
    if (!res.ok) {
      reason = data.error ?? "request_failed";
    } else {
      granted = typeof data.granted === "number" ? data.granted : 0;
      reason = data.reason;
      total = data.total;
    }
  } catch {
    reason = "network_error";
  }

  // Always record local completion for the learning UI once the action truly happened.
  // Durable XP may be 0 when unauthenticated — Rule 20 honest state.
  const progress = markYoPhoLearningLocal(actionKey);
  return { ok: true, granted, reason, progress, total };
}

export function yoPhoLearningPct(progress: YoPhoLearningProgress): number {
  if (progress.targetXp <= 0) return 0;
  return Math.min(100, Math.round((progress.earnedXp / progress.targetXp) * 100));
}
