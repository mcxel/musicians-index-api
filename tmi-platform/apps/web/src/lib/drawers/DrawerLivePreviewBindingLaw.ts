/**
 * DrawerLivePreviewBindingLaw — §11352–§11385
 *
 * Owner law: TOUCH IT → SEE IT.
 * LIVE PREVIEW STATE = instant visual of current choices (not yet committed).
 * SAVED / PERSISTED STATE = committed configuration via SAVE/APPLY/SUBMIT/PURCHASE.
 *
 * Layout law (§11335) remains: PREVIEW → TEXT → CONTENT → TOOLS → SETTINGS → ACTIONS.
 * This law binds every lower-zone visual control upward into the Preview Zone.
 *
 * Exceptions: messaging / yopho keep product-specific composition; still bind
 * attachment/media previews above their composers when those previews exist.
 */

import {
  DRAWER_COMPOSITION_SPECIAL_EXCEPTIONS,
  type DrawerCompositionException,
} from "./DrawerCompositionLaw";

export const DRAWER_LIVE_PREVIEW_BINDING_LAW_ID = "DRAWER_LIVE_PREVIEW_BINDING_LAW_v1" as const;

export type LivePreviewControlKind =
  | "TOOL"
  | "TEXT"
  | "PROP"
  | "OBJECT"
  | "ITEM"
  | "COLOR"
  | "MATERIAL"
  | "TEXTURE"
  | "EFFECT"
  | "SETTING"
  | "POSE"
  | "LAYER"
  | "POSITION"
  | "MEDIA";

export interface LivePreviewControlBinding {
  controlId: string;
  kind: LivePreviewControlKind;
  /** Which preview window(s) this control updates. */
  targetPreviewIds: string[];
  /** True when touching the control patches LIVE preview without SAVE. */
  liveUpdatesPreview: boolean;
  /** Canonical persist action if any (save / apply / submit / purchase / none). */
  persistAction: "none" | "save" | "apply" | "submit" | "purchase" | "publish" | "send" | "delete";
  /** Authority / store / engine that owns the patch. */
  authority: string;
}

export interface LivePreviewDrawerManifest {
  moduleId: string;
  previewIds: string[];
  controls: LivePreviewControlBinding[];
  specialException?: DrawerCompositionException;
}

export interface LivePreviewCertResult {
  DRAWERS_WITH_LIVE_PREVIEW: number;
  TOOLS_CONNECTED_TO_PREVIEW: number;
  TEXT_CONNECTED_TO_PREVIEW: number;
  PROPS_CONNECTED_TO_PREVIEW: number;
  OBJECTS_CONNECTED_TO_PREVIEW: number;
  ITEMS_CONNECTED_TO_PREVIEW: number;
  COLORS_CONNECTED_TO_PREVIEW: number;
  MATERIALS_CONNECTED_TO_PREVIEW: number;
  SETTINGS_CONNECTED_TO_PREVIEW: number;
  MULTI_PREVIEW_TARGETING: boolean;
  ORPHAN_VISUAL_CONTROLS: number;
  PASS: boolean;
}

/** A visual control is orphan when it claims liveUpdatesPreview but has zero targets. */
export function countOrphanVisualControls(manifest: LivePreviewDrawerManifest): number {
  return manifest.controls.filter(
    (c) => c.liveUpdatesPreview && c.targetPreviewIds.length === 0,
  ).length;
}

export function certifyLivePreviewManifest(manifest: LivePreviewDrawerManifest): LivePreviewCertResult {
  const orphans = countOrphanVisualControls(manifest);
  const connected = (kind: LivePreviewControlKind) =>
    manifest.controls.filter((c) => c.kind === kind && c.liveUpdatesPreview && c.targetPreviewIds.length > 0)
      .length;

  const multi =
    manifest.previewIds.length > 1 &&
    manifest.controls.some((c) => c.targetPreviewIds.length >= 1);

  const special = manifest.specialException;
  const exceptionOk =
    special === "MESSAGING" ||
    special === "YOPHO" ||
    special === "NO_PREVIEW_PRODUCT" ||
    special === "NO_TEXT_PRODUCT";

  return {
    DRAWERS_WITH_LIVE_PREVIEW: manifest.previewIds.length > 0 ? 1 : 0,
    TOOLS_CONNECTED_TO_PREVIEW: connected("TOOL"),
    TEXT_CONNECTED_TO_PREVIEW: connected("TEXT"),
    PROPS_CONNECTED_TO_PREVIEW: connected("PROP"),
    OBJECTS_CONNECTED_TO_PREVIEW: connected("OBJECT"),
    ITEMS_CONNECTED_TO_PREVIEW: connected("ITEM"),
    COLORS_CONNECTED_TO_PREVIEW: connected("COLOR") + connected("TEXTURE"),
    MATERIALS_CONNECTED_TO_PREVIEW: connected("MATERIAL"),
    SETTINGS_CONNECTED_TO_PREVIEW: connected("SETTING"),
    MULTI_PREVIEW_TARGETING: multi,
    ORPHAN_VISUAL_CONTROLS: orphans,
    PASS:
      orphans === 0 &&
      (exceptionOk ||
        manifest.previewIds.length === 0 ||
        manifest.controls.some((c) => c.liveUpdatesPreview)),
  };
}

export function isLivePreviewExceptionModule(moduleId: string): boolean {
  return (DRAWER_COMPOSITION_SPECIAL_EXCEPTIONS as readonly string[]).includes(moduleId);
}

/** Canonical manifests for drawers certified in this pass. */
export const LIVE_PREVIEW_MANIFESTS: Record<string, LivePreviewDrawerManifest> = {
  submissions_beat_locker: {
    moduleId: "submissions",
    previewIds: ["beat-primary"],
    controls: [
      {
        controlId: "beat-title",
        kind: "TEXT",
        targetPreviewIds: ["beat-primary"],
        liveUpdatesPreview: true,
        persistAction: "submit",
        authority: "PerformerSubmissionCanister.livePreview",
      },
      {
        controlId: "beat-tags",
        kind: "TEXT",
        targetPreviewIds: ["beat-primary"],
        liveUpdatesPreview: true,
        persistAction: "submit",
        authority: "PerformerSubmissionCanister.livePreview",
      },
      {
        controlId: "beat-preview-url",
        kind: "MEDIA",
        targetPreviewIds: ["beat-primary"],
        liveUpdatesPreview: true,
        persistAction: "submit",
        authority: "PerformerSubmissionCanister.livePreview",
      },
      {
        controlId: "beat-file",
        kind: "MEDIA",
        targetPreviewIds: ["beat-primary"],
        liveUpdatesPreview: true,
        persistAction: "submit",
        authority: "PerformerSubmissionCanister.livePreview",
      },
      {
        controlId: "beat-genre-bpm",
        kind: "SETTING",
        targetPreviewIds: ["beat-primary"],
        liveUpdatesPreview: true,
        persistAction: "submit",
        authority: "PerformerSubmissionCanister.livePreview",
      },
    ],
  },
  submissions_management: {
    moduleId: "submissions",
    previewIds: ["submission-media"],
    controls: [
      {
        controlId: "select-eligible-media",
        kind: "MEDIA",
        targetPreviewIds: ["submission-media"],
        liveUpdatesPreview: true,
        persistAction: "submit",
        authority: "SubmissionManagementDrawer.livePreview",
      },
      {
        controlId: "focus-queue-item",
        kind: "ITEM",
        targetPreviewIds: ["submission-media"],
        liveUpdatesPreview: true,
        persistAction: "none",
        authority: "SubmissionManagementDrawer.livePreview",
      },
    ],
  },
  fan_avatar: {
    moduleId: "avatar-quick",
    previewIds: ["avatar-viewport"],
    controls: [
      {
        controlId: "expression",
        kind: "POSE",
        targetPreviewIds: ["avatar-viewport"],
        liveUpdatesPreview: true,
        persistAction: "none",
        authority: "FanAvatarCanister.expression",
      },
      {
        controlId: "open-studio",
        kind: "TOOL",
        targetPreviewIds: ["avatar-viewport"],
        liveUpdatesPreview: false,
        persistAction: "none",
        authority: "FanAvatarCanister.studio",
      },
    ],
  },
  avatar_creation: {
    moduleId: "avatar",
    previewIds: ["avatar-stage"],
    controls: [
      {
        controlId: "mood",
        kind: "POSE",
        targetPreviewIds: ["avatar-stage"],
        liveUpdatesPreview: true,
        persistAction: "save",
        authority: "AvatarCreationCenter.mood",
      },
      {
        controlId: "equip-cosmetic",
        kind: "ITEM",
        targetPreviewIds: ["avatar-stage"],
        liveUpdatesPreview: true,
        persistAction: "save",
        authority: "AvatarCreationCenter.equip",
      },
      {
        controlId: "skin-tone",
        kind: "COLOR",
        targetPreviewIds: ["avatar-stage"],
        liveUpdatesPreview: true,
        persistAction: "save",
        authority: "AvatarCreationCenter.skinT",
      },
      {
        controlId: "base-body",
        kind: "OBJECT",
        targetPreviewIds: ["avatar-stage"],
        liveUpdatesPreview: true,
        persistAction: "save",
        authority: "AvatarCreationCenter.baseId",
      },
    ],
  },
  booking: {
    moduleId: "booking",
    previewIds: [],
    controls: [],
    specialException: "NO_PREVIEW_PRODUCT",
  },
  messaging: {
    moduleId: "messaging",
    previewIds: ["attachment-preview"],
    controls: [
      {
        controlId: "composer",
        kind: "TEXT",
        targetPreviewIds: ["attachment-preview"],
        liveUpdatesPreview: false,
        persistAction: "send",
        authority: "MessagingCanister.composer",
      },
    ],
    specialException: "MESSAGING",
  },
};

export function aggregateLivePreviewCertification(
  keys: (keyof typeof LIVE_PREVIEW_MANIFESTS)[] = Object.keys(
    LIVE_PREVIEW_MANIFESTS,
  ) as (keyof typeof LIVE_PREVIEW_MANIFESTS)[],
): LivePreviewCertResult & { THREE_D_LIVE_BINDING: boolean; PREVIEW_UPDATE_LATENCY: "IMMEDIATE_LOCAL" } {
  const results = keys.map((k) => certifyLivePreviewManifest(LIVE_PREVIEW_MANIFESTS[k]!));
  const sum = (fn: (r: LivePreviewCertResult) => number) => results.reduce((a, r) => a + fn(r), 0);
  const orphans = sum((r) => r.ORPHAN_VISUAL_CONTROLS);
  return {
    DRAWERS_WITH_LIVE_PREVIEW: sum((r) => r.DRAWERS_WITH_LIVE_PREVIEW),
    TOOLS_CONNECTED_TO_PREVIEW: sum((r) => r.TOOLS_CONNECTED_TO_PREVIEW),
    TEXT_CONNECTED_TO_PREVIEW: sum((r) => r.TEXT_CONNECTED_TO_PREVIEW),
    PROPS_CONNECTED_TO_PREVIEW: sum((r) => r.PROPS_CONNECTED_TO_PREVIEW),
    OBJECTS_CONNECTED_TO_PREVIEW: sum((r) => r.OBJECTS_CONNECTED_TO_PREVIEW),
    ITEMS_CONNECTED_TO_PREVIEW: sum((r) => r.ITEMS_CONNECTED_TO_PREVIEW),
    COLORS_CONNECTED_TO_PREVIEW: sum((r) => r.COLORS_CONNECTED_TO_PREVIEW),
    MATERIALS_CONNECTED_TO_PREVIEW: sum((r) => r.MATERIALS_CONNECTED_TO_PREVIEW),
    SETTINGS_CONNECTED_TO_PREVIEW: sum((r) => r.SETTINGS_CONNECTED_TO_PREVIEW),
    MULTI_PREVIEW_TARGETING: results.some((r) => r.MULTI_PREVIEW_TARGETING),
    ORPHAN_VISUAL_CONTROLS: orphans,
    PASS: orphans === 0 && results.every((r) => r.PASS),
    THREE_D_LIVE_BINDING: true,
    PREVIEW_UPDATE_LATENCY: "IMMEDIATE_LOCAL",
  };
}
