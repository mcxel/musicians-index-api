/**
 * DrawerCompositionLaw — §11335–§11350
 *
 * Global deep-drawer visual hierarchy (ordinary preview-based drawers):
 *   HEADER
 *   → PREVIEW WINDOW(S)          (grouped at top; never interleaved with tools)
 *   → TEXT DIALOGUE / COMPOSER   (only if the product needs one)
 *   → CONTENT / INFORMATION
 *   → INSTRUMENTS / TOOLS
 *   → SETTINGS / ACTIONS
 *
 * Exceptions (do not over-correct):
 *   - messaging  — conversation history → optional attachment preview → composer
 *   - yopho      — intentional distributed multi-media composition
 *   - notifications / tickets / favorites / pure-info drawers — no manufactured Preview Zone
 *
 * See / feel / control: SEE IT → TYPE ABOUT IT IF NEEDED → CONTROL IT.
 */

export const DRAWER_COMPOSITION_LAW_ID = "DRAWER_COMPOSITION_LAW_v1" as const;

export type DrawerCompositionZone =
  | "HEADER"
  | "PREVIEW"
  | "TEXT_DIALOGUE"
  | "CONTENT"
  | "INSTRUMENTS"
  | "SETTINGS"
  | "ACTIONS";

/** Canonical top→bottom order for ordinary preview-based drawers. */
export const DRAWER_COMPOSITION_ORDER: readonly DrawerCompositionZone[] = [
  "HEADER",
  "PREVIEW",
  "TEXT_DIALOGUE",
  "CONTENT",
  "INSTRUMENTS",
  "SETTINGS",
  "ACTIONS",
] as const;

export type DrawerCompositionException =
  | "NONE"
  | "MESSAGING"
  | "YOPHO"
  | "NO_PREVIEW_PRODUCT"
  | "NO_TEXT_PRODUCT";

/** Modules that must not invent a Preview Zone merely to satisfy the law. */
export const DRAWER_COMPOSITION_NO_PREVIEW_MODULES = [
  "notifications",
  "tickets",
  "favorites",
  "scores",
  "analytics",
  "prize_vault",
  "messaging",
] as const;

/** Modules with intentional non-standard media layouts. */
export const DRAWER_COMPOSITION_SPECIAL_EXCEPTIONS = ["yopho", "messaging"] as const;

export interface DrawerCompositionCertInput {
  moduleId?: string;
  previewCount: number;
  textDialogueRequired: boolean;
  /** DOM / zone order indices — lower = higher on screen. */
  firstPreviewIndex: number | null;
  lastPreviewIndex: number | null;
  textDialogueIndex: number | null;
  firstControlIndex: number | null;
  textInputReal: boolean;
  dialogueOverlapsPreview: boolean;
  specialException?: DrawerCompositionException;
}

export interface DrawerCompositionCertResult {
  PREVIEW_COUNT: number;
  PREVIEW_AT_TOP: boolean | "N/A";
  TEXT_DIALOGUE_REQUIRED: boolean;
  TEXT_DIALOGUE_POSITION: "BELOW_PREVIEWS" | "NONE" | "VIOLATION" | "EXCEPTION";
  TEXT_INPUT_REAL: boolean | "N/A";
  CONTROLS_BELOW_DIALOGUE: boolean | "N/A";
  DIALOGUE_OVERLAP: "NONE" | "VIOLATION";
  SPECIAL_EXCEPTION: DrawerCompositionException;
  PASS: boolean;
}

function isSpecial(moduleId?: string): DrawerCompositionException {
  if (!moduleId) return "NONE";
  if (moduleId === "messaging") return "MESSAGING";
  if (moduleId === "yopho") return "YOPHO";
  if ((DRAWER_COMPOSITION_NO_PREVIEW_MODULES as readonly string[]).includes(moduleId)) {
    return "NO_PREVIEW_PRODUCT";
  }
  return "NONE";
}

/**
 * Pure certification of zone ordering. Indices are relative order tokens
 * (not px). Pass when previews finish before text, and text finishes before controls.
 */
export function certifyDrawerComposition(input: DrawerCompositionCertInput): DrawerCompositionCertResult {
  const special = input.specialException ?? isSpecial(input.moduleId);
  const previewCount = Math.max(0, input.previewCount);

  if (special === "MESSAGING" || special === "YOPHO") {
    return {
      PREVIEW_COUNT: previewCount,
      PREVIEW_AT_TOP: "N/A",
      TEXT_DIALOGUE_REQUIRED: input.textDialogueRequired,
      TEXT_DIALOGUE_POSITION: "EXCEPTION",
      TEXT_INPUT_REAL: input.textDialogueRequired ? input.textInputReal : "N/A",
      CONTROLS_BELOW_DIALOGUE: "N/A",
      DIALOGUE_OVERLAP: input.dialogueOverlapsPreview ? "VIOLATION" : "NONE",
      SPECIAL_EXCEPTION: special,
      PASS: !input.dialogueOverlapsPreview,
    };
  }

  const hasPreview = previewCount > 0;
  const previewAtTop =
    !hasPreview ||
    (input.firstPreviewIndex != null &&
      (input.firstControlIndex == null || input.firstPreviewIndex < input.firstControlIndex) &&
      (input.textDialogueIndex == null || input.firstPreviewIndex < input.textDialogueIndex));

  let textPos: DrawerCompositionCertResult["TEXT_DIALOGUE_POSITION"] = "NONE";
  if (input.textDialogueRequired) {
    if (!hasPreview) {
      // No preview product: text must still sit above instruments/settings.
      textPos =
        input.textDialogueIndex != null &&
        (input.firstControlIndex == null || input.textDialogueIndex < input.firstControlIndex)
          ? "BELOW_PREVIEWS"
          : "VIOLATION";
    } else if (
      input.textDialogueIndex != null &&
      input.lastPreviewIndex != null &&
      input.textDialogueIndex > input.lastPreviewIndex &&
      (input.firstControlIndex == null || input.textDialogueIndex < input.firstControlIndex)
    ) {
      textPos = "BELOW_PREVIEWS";
    } else {
      textPos = "VIOLATION";
    }
  }

  const controlsBelow =
    !input.textDialogueRequired
      ? "N/A"
      : input.textDialogueIndex != null &&
          input.firstControlIndex != null &&
          input.textDialogueIndex < input.firstControlIndex
        ? true
        : input.firstControlIndex == null
          ? true
          : false;

  const overlap = input.dialogueOverlapsPreview ? "VIOLATION" : "NONE";

  const pass =
    (previewAtTop === true || !hasPreview) &&
    (textPos === "NONE" || textPos === "BELOW_PREVIEWS") &&
    controlsBelow !== false &&
    overlap === "NONE";

  return {
    PREVIEW_COUNT: previewCount,
    PREVIEW_AT_TOP: hasPreview ? previewAtTop : "N/A",
    TEXT_DIALOGUE_REQUIRED: input.textDialogueRequired,
    TEXT_DIALOGUE_POSITION: textPos,
    TEXT_INPUT_REAL: input.textDialogueRequired ? input.textInputReal : "N/A",
    CONTROLS_BELOW_DIALOGUE: controlsBelow,
    DIALOGUE_OVERLAP: overlap,
    SPECIAL_EXCEPTION: special,
    PASS: pass,
  };
}
