/**
 * Pure structural validator for PublicPageDocument (Gate C.2).
 *
 * Does not query Prisma, resolve domain records, or rewrite invalid documents.
 */

import {
  PUBLIC_PAGE_ATMOSPHERES,
  PUBLIC_PAGE_BINDING_AUTHORITIES,
  PUBLIC_PAGE_BLENDS,
  PUBLIC_PAGE_BLOCK_KINDS,
  PUBLIC_PAGE_DEPTHS,
  PUBLIC_PAGE_DOCUMENT_PURPOSES,
  PUBLIC_PAGE_DOCUMENT_SCHEMA_VERSION,
  PUBLIC_PAGE_FITS,
  PUBLIC_PAGE_INTERACTIONS,
  PUBLIC_PAGE_MASKS,
  PUBLIC_PAGE_MEDIA_SOURCES,
  PUBLIC_PAGE_PATTERN_IDS,
  PUBLIC_PAGE_OPENINGS,
  PUBLIC_PAGE_PARALLAX,
  PUBLIC_PAGE_PEOPLE_PRESENTATIONS,
  PUBLIC_PAGE_PERFORMANCE_TIERS,
  PUBLIC_PAGE_PURPOSES_RUNTIME_CONNECTED,
  PUBLIC_PAGE_SECTION_HEIGHTS,
  PUBLIC_PAGE_SECTION_LAYOUTS,
  PUBLIC_PAGE_SECTION_TRANSITIONS,
  PUBLIC_PAGE_TEXT_REVEALS,
  PUBLIC_PAGE_LINK_SERVICES,
  REJECTED_PUBLIC_PAGE_BLOCK_KINDS,
  getPublicPageBlockCatalogEntry,
  isPublicPageBlockKind,
  type PublicPageDocument,
} from "./publicPageDocument";
import { isRegisteredEffect, isSafeDeliveryPath } from "./publicPageComposition";

export interface PublicPageValidationIssue {
  code: string;
  path: string;
  message: string;
}

export type PublicPageValidationResult =
  | { ok: true }
  | { ok: false; issues: PublicPageValidationIssue[] };

const ID_RE = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/;
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;
const ISO_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

const SECTION_KINDS = new Set([
  "HERO",
  "IDENTITY",
  "PRIMARY",
  "SIDEBAR",
  "FOOTER_DOCK",
  "CUSTOM",
]);
const VISIBILITIES = new Set(["PUBLIC", "FRIENDS_ONLY", "OWNER_ONLY", "HIDDEN"]);
const PROFILE_KINDS = new Set(["FAN", "PERFORMER", "WRITER_PORTFOLIO"]);
const STATUSES = new Set(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const PLACEMENTS = new Set(["FLOW", "MAGNET"]);
const COLUMNS = new Set(["L", "R", "FULL"]);
const BACKGROUNDS = new Set(["NONE", "GLASS", "SOLID", "GRADIENT"]);
const SIZE_SCALES = new Set(["XS", "SM", "MD", "LG", "XL"]);
const WEIGHTS = new Set(["REGULAR", "MEDIUM", "BOLD"]);
const FONT_PAIRINGS = new Set(["INTER", "GROTESK", "EDITORIAL", "DISPLAY", "MONO", "SCRIPT", "CONDENSED", "ROUNDED"]);
const TEXT_FITS = new Set(["AUTO", "FIXED"]);
const MEDIA_FITS = new Set(["FILL", "FIT", "FREE"]);
const FRAME_PRESETS = new Set(["NONE", "THIN", "HEAVY", "NEON", "POLAROID", "CARD"]);
const INTENSITIES = new Set(["OFF", "LOW", "NORMAL", "HIGH"]);
const SEMANTIC_ROLES = new Set(["REGION", "IMG", "ARTICLE", "NOTE", "PRESENTATION", "LINK"]);
const VIEWPORTS = new Set(["DESKTOP", "TABLET", "PHONE"]);
const MOBILE_STRATEGIES = new Set(["STACK_PRESERVE_ORDER", "SECTION_TEMPLATES"]);
const MAGNET_COLLAPSE = new Set(["FLOW", "CAROUSEL_WITHIN_SECTION"]);
const AUTHORITIES = new Set<string>(PUBLIC_PAGE_BINDING_AUTHORITIES);
const SNAPSHOTS = new Set(["LIVE_RESOLVE", "PINNED_REVISION"]);
const REJECTED_KINDS = new Set<string>(REJECTED_PUBLIC_PAGE_BLOCK_KINDS);
const PURPOSE_SET = new Set<string>(PUBLIC_PAGE_DOCUMENT_PURPOSES);
const CONNECTED_PURPOSES = new Set<string>(PUBLIC_PAGE_PURPOSES_RUNTIME_CONNECTED);

const UNSAFE_KEY_RE = /^(cssText|customCss|customHtml|html|script|javascript)$/i;
const UNSAFE_VALUE_RE = /javascript\s*:|@import\b|<script\b/i;

const THEME_KEYS = new Set([
  "accentColorHex",
  "stylePackId",
  "animationIntensity",
  "fontPairingId",
  "flickerPlace",
  "surfaceColorHex",
  "surfaceGradientHex",
]);
const FLICKER_PLACES = new Set(["MOTTO", "OFF"]);
const STYLE_KEYS = new Set([
  "opacity",
  "blurPx",
  "borderWidthPx",
  "cornerRadiusPx",
  "backgroundTreatment",
  "glowAccentRef",
  "fontPairingId",
  "sizeScale",
  "weight",
  "skinRef",
  "align",
  "letterSpacingEm",
  "lineHeight",
  "colorHex",
  "outline",
  "textShadow",
  "textGlow",
  "textFit",
  "mediaFit",
  "mediaZoom",
  "mediaFocalX",
  "mediaFocalY",
  "mediaRotationDeg",
  "mediaFlipX",
  "mediaFlipY",
  "framePreset",
  "rotationDeg",
  "maxWidthCh",
  "textReveal",
  "mask",
  "blend",
  "depth",
  "motionPreset",
  "motionIntensity",
  "motionSpeed",
  "peoplePresentation",
  "interaction",
]);
const BOUNDS_KEYS = new Set(["x", "y", "w", "h", "z", "column"]);
const BINDING_KEYS = new Set(["authority", "recordId", "snapshotPolicy", "pinnedRevisionLabel"]);
const A11Y_KEYS = new Set(["label", "description", "reduceMotionSafe", "semanticRole"]);
const BLOCK_KEYS = new Set([
  "id",
  "kind",
  "placement",
  "bounds",
  "style",
  "visibility",
  "a11y",
  "bindingRef",
  "plainText",
  "mediaLink",
]);
const MEDIA_LINK_KEYS = new Set(["service", "externalId"]);
const LINK_SERVICES = new Set<string>(PUBLIC_PAGE_LINK_SERVICES);
const LINK_ID_RE = /^[A-Za-z0-9_./@-]{1,180}$/;
const SECTION_KEYS = new Set([
  "sectionId",
  "kind",
  "order",
  "visibility",
  "blocks",
  "layout",
  "panes",
  "background",
  "overlay",
  "transition",
  "minHeightPx",
  "heightMode",
  "paddingPx",
  "gapPx",
  "hidden",
  "atmosphere",
]);
const RESPONSIVE_KEYS = new Set([
  "mobileStrategy",
  "magnetCollapse",
  "viewports",
  "phoneCertificationTarget",
]);
const DOCUMENT_KEYS = new Set([
  "documentId",
  "ownerUserId",
  "schemaVersion",
  "documentPurpose",
  "profileKind",
  "status",
  "publishedVersion",
  "draftRevisionLabel",
  "theme",
  "sections",
  "responsiveRules",
  "a11y",
  "updatedAt",
  "worldBackground",
  "openingPresentation",
  "performanceTier",
  "atmosphere",
]);

function issue(code: string, path: string, message: string): PublicPageValidationIssue {
  return { code, path, message };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rejectUnknownKeys(
  value: Record<string, unknown>,
  allowed: Set<string>,
  path: string,
  issues: PublicPageValidationIssue[],
): void {
  for (const key of Object.keys(value)) {
    if (UNSAFE_KEY_RE.test(key)) {
      issues.push(issue("UNSAFE_PRESENTATION", `${path}.${key}`, `Unsafe field "${key}" is not allowed.`));
      continue;
    }
    if (!allowed.has(key)) {
      issues.push(issue("UNKNOWN_FIELD", `${path}.${key}`, `Field "${key}" is not part of the composition contract.`));
    }
  }
}

function rejectUnsafeStrings(value: unknown, path: string, issues: PublicPageValidationIssue[]): void {
  if (typeof value === "string" && UNSAFE_VALUE_RE.test(value)) {
    issues.push(issue("UNSAFE_PRESENTATION", path, "Executable markup, javascript URLs, and @import are not allowed."));
  }
}

function requireId(value: unknown, path: string, issues: PublicPageValidationIssue[]): void {
  if (typeof value !== "string" || !ID_RE.test(value)) {
    issues.push(issue("MALFORMED_ID", path, "Identifier must be a non-empty safe token."));
  }
}

function validateA11y(value: unknown, path: string, issues: PublicPageValidationIssue[], decorativeOptional: boolean): void {
  if (!isRecord(value)) {
    issues.push(issue("A11Y", path, "Accessibility metadata must be an object."));
    return;
  }
  rejectUnknownKeys(value, A11Y_KEYS, path, issues);
  const role = value.semanticRole;
  const isDecorative = role === "PRESENTATION";
  if (role !== undefined && (typeof role !== "string" || !SEMANTIC_ROLES.has(role))) {
    issues.push(issue("A11Y", `${path}.semanticRole`, "Semantic role is not recognized."));
  }
  if (typeof value.reduceMotionSafe !== "boolean") {
    issues.push(issue("A11Y", `${path}.reduceMotionSafe`, "reduceMotionSafe must be boolean."));
  }
  if (value.label !== undefined && typeof value.label !== "string") {
    issues.push(issue("A11Y", `${path}.label`, "Label must be a string."));
  }
  if (value.description !== undefined && typeof value.description !== "string") {
    issues.push(issue("A11Y", `${path}.description`, "Description must be a string when present."));
  }
  const label = typeof value.label === "string" ? value.label.trim() : "";
  if (!isDecorative && !decorativeOptional && label.length === 0) {
    issues.push(issue("A11Y", `${path}.label`, "Non-decorative nodes require a label."));
  }
  rejectUnsafeStrings(value.label, `${path}.label`, issues);
  rejectUnsafeStrings(value.description, `${path}.description`, issues);
}

function validateStyle(value: unknown, path: string, issues: PublicPageValidationIssue[]): void {
  if (!isRecord(value)) {
    issues.push(issue("PRESENTATION", path, "Style tokens must be an object."));
    return;
  }
  rejectUnknownKeys(value, STYLE_KEYS, path, issues);
  const numeric: Array<[string, number, number]> = [
    ["opacity", 0, 1],
    ["blurPx", 0, 64],
    ["borderWidthPx", 0, 24],
    ["cornerRadiusPx", 0, 64],
    ["mediaZoom", 0.5, 8],
    ["mediaFocalX", 0, 1],
    ["mediaFocalY", 0, 1],
    ["mediaRotationDeg", -180, 180],
  ];
  for (const [key, min, max] of numeric) {
    if (value[key] === undefined) continue;
    if (typeof value[key] !== "number" || !Number.isFinite(value[key] as number)) {
      issues.push(issue("PRESENTATION", `${path}.${key}`, `${key} must be a finite number.`));
      continue;
    }
    const n = value[key] as number;
    if (n < min || n > max) {
      issues.push(issue("PRESENTATION", `${path}.${key}`, `${key} is outside ${min}–${max}.`));
    }
  }
  if (value.backgroundTreatment !== undefined && !BACKGROUNDS.has(String(value.backgroundTreatment))) {
    issues.push(issue("PRESENTATION", `${path}.backgroundTreatment`, "Background treatment is not a certified primitive."));
  }
  if (value.sizeScale !== undefined && !SIZE_SCALES.has(String(value.sizeScale))) {
    issues.push(issue("PRESENTATION", `${path}.sizeScale`, "Size scale is not recognized."));
  }
  if (value.weight !== undefined && !WEIGHTS.has(String(value.weight))) {
    issues.push(issue("PRESENTATION", `${path}.weight`, "Font weight is not recognized."));
  }
  if (value.fontPairingId !== undefined && !FONT_PAIRINGS.has(String(value.fontPairingId))) {
    issues.push(issue("PRESENTATION", `${path}.fontPairingId`, "Font pairing is not a certified pairing id."));
  }
  if (value.textFit !== undefined && !TEXT_FITS.has(String(value.textFit))) {
    issues.push(issue("PRESENTATION", `${path}.textFit`, "Text fit must be AUTO or FIXED."));
  }
  if (value.mediaFit !== undefined && !MEDIA_FITS.has(String(value.mediaFit))) {
    issues.push(issue("PRESENTATION", `${path}.mediaFit`, "Media fit must be FILL, FIT, or FREE."));
  }
  if (value.framePreset !== undefined && !FRAME_PRESETS.has(String(value.framePreset))) {
    issues.push(issue("PRESENTATION", `${path}.framePreset`, "Frame preset is not registered."));
  }
  for (const key of ["mediaFlipX", "mediaFlipY"] as const) {
    if (value[key] !== undefined && typeof value[key] !== "boolean") {
      issues.push(issue("PRESENTATION", `${path}.${key}`, `${key} must be boolean.`));
    }
  }
  if (value.glowAccentRef !== undefined && typeof value.glowAccentRef !== "string") {
    issues.push(issue("PRESENTATION", `${path}.glowAccentRef`, "Glow accent must be a token or hex string."));
  }
  if (typeof value.glowAccentRef === "string" && value.glowAccentRef.length > 0 && !HEX_RE.test(value.glowAccentRef) && !ID_RE.test(value.glowAccentRef)) {
    issues.push(issue("PRESENTATION", `${path}.glowAccentRef`, "Glow accent must be a hex color or token id."));
  }
  if (value.skinRef !== undefined && (typeof value.skinRef !== "string" || !ID_RE.test(value.skinRef))) {
    issues.push(issue("PRESENTATION", `${path}.skinRef`, "Skin reference must be a certified id."));
  }
  if (value.align !== undefined && !new Set(["START", "CENTER", "END"]).has(String(value.align))) {
    issues.push(issue("PRESENTATION", `${path}.align`, "Text alignment is not recognized."));
  }
  if (value.colorHex !== undefined && (typeof value.colorHex !== "string" || !HEX_RE.test(value.colorHex))) {
    issues.push(issue("PRESENTATION", `${path}.colorHex`, "Text color must be #RRGGBB."));
  }
  for (const key of ["outline", "textShadow", "textGlow"] as const) {
    if (value[key] !== undefined && typeof value[key] !== "boolean") {
      issues.push(issue("PRESENTATION", `${path}.${key}`, `${key} must be boolean.`));
    }
  }
  if (value.textReveal !== undefined && !new Set(PUBLIC_PAGE_TEXT_REVEALS).has(value.textReveal as never)) {
    issues.push(issue("PRESENTATION", `${path}.textReveal`, "Text reveal is not a registered preset."));
  }
  if (value.mask !== undefined && !new Set(PUBLIC_PAGE_MASKS).has(value.mask as never)) {
    issues.push(issue("PRESENTATION", `${path}.mask`, "Mask is not in the registered library."));
  }
  if (value.blend !== undefined && !new Set(PUBLIC_PAGE_BLENDS).has(value.blend as never)) {
    issues.push(issue("PRESENTATION", `${path}.blend`, "Blend mode is not registered."));
  }
  if (value.depth !== undefined && !new Set(PUBLIC_PAGE_DEPTHS).has(value.depth as never)) {
    issues.push(issue("PRESENTATION", `${path}.depth`, "Depth layer is not recognized."));
  }
  if (value.peoplePresentation !== undefined && !new Set(PUBLIC_PAGE_PEOPLE_PRESENTATIONS).has(value.peoplePresentation as never)) {
    issues.push(issue("PRESENTATION", `${path}.peoplePresentation`, "My People presentation is not recognized."));
  }
  if (value.interaction !== undefined && !new Set(PUBLIC_PAGE_INTERACTIONS).has(value.interaction as never)) {
    issues.push(issue("PRESENTATION", `${path}.interaction`, "Interaction is not a registered presentation behavior."));
  }
  if (value.motionPreset !== undefined) {
    if (typeof value.motionPreset !== "string" || !isRegisteredEffect(value.motionPreset)) {
      issues.push(issue("MOTION", `${path}.motionPreset`, "Motion preset is not in the effect registry."));
    }
  }
  const styleNumeric: Array<[string, number, number]> = [
    ["letterSpacingEm", -0.2, 1],
    ["lineHeight", 0.8, 3],
    ["rotationDeg", -180, 180],
    ["maxWidthCh", 8, 120],
    ["motionIntensity", 0, 100],
    ["motionSpeed", 0.25, 2],
  ];
  for (const [key, min, max] of styleNumeric) {
    if (value[key] === undefined) continue;
    if (typeof value[key] !== "number" || !Number.isFinite(value[key] as number) || (value[key] as number) < min || (value[key] as number) > max) {
      issues.push(issue("PRESENTATION", `${path}.${key}`, `${key} is outside ${min}–${max}.`));
    }
  }
  for (const key of Object.keys(value)) rejectUnsafeStrings(value[key], `${path}.${key}`, issues);
}

const TILE_KEYS = new Set([
  "tileId",
  "source",
  "assetAuthority",
  "assetId",
  "posterAssetId",
  "deliveryPath",
  "posterPath",
  "colorHex",
  "fit",
  "frameX",
  "frameY",
  "frameW",
  "frameH",
  "focalX",
  "focalY",
  "opacity",
  "overlayHex",
  "overlayOpacity",
  "blur",
  "brightness",
  "contrast",
  "saturation",
  "tintHex",
  "parallax",
  "loop",
  "muted",
  "speed",
  "mask",
  "blend",
]);

function validateMediaTile(value: unknown, path: string, issues: PublicPageValidationIssue[]): void {
  if (!isRecord(value)) {
    issues.push(issue("MEDIA_TILE", path, "Media tile must be an object."));
    return;
  }
  rejectUnknownKeys(value, TILE_KEYS, path, issues);
  requireId(value.tileId, `${path}.tileId`, issues);
  if (!new Set(PUBLIC_PAGE_MEDIA_SOURCES).has(value.source as never)) {
    issues.push(issue("MEDIA_TILE", `${path}.source`, "Media source is not a safe presentation surface."));
  }
  if (value.assetAuthority !== undefined && !AUTHORITIES.has(String(value.assetAuthority))) {
    issues.push(issue("MEDIA_TILE", `${path}.assetAuthority`, "Media authority is not canonical."));
  }
  if (value.assetId !== undefined && (typeof value.assetId !== "string" || !ID_RE.test(value.assetId))) {
    issues.push(issue("MEDIA_TILE", `${path}.assetId`, "Media asset id must be a canonical token."));
  }
  if (value.posterAssetId !== undefined && (typeof value.posterAssetId !== "string" || !ID_RE.test(value.posterAssetId))) {
    issues.push(issue("MEDIA_TILE", `${path}.posterAssetId`, "Poster asset id must be a canonical token."));
  }
  for (const key of ["deliveryPath", "posterPath"] as const) {
    if (value[key] === undefined) continue;
    if (typeof value[key] !== "string" || !isSafeDeliveryPath(value[key] as string)) {
      issues.push(issue("MEDIA_TILE", `${path}.${key}`, "Delivery path must be a relative app path, not an ownership URL."));
    }
  }
  if (value.colorHex !== undefined && (typeof value.colorHex !== "string" || !HEX_RE.test(value.colorHex))) {
    issues.push(issue("MEDIA_TILE", `${path}.colorHex`, "Tile color must be #RRGGBB."));
  }
  if (value.overlayHex !== undefined && (typeof value.overlayHex !== "string" || !HEX_RE.test(value.overlayHex))) {
    issues.push(issue("MEDIA_TILE", `${path}.overlayHex`, "Overlay color must be #RRGGBB."));
  }
  if (value.tintHex !== undefined && (typeof value.tintHex !== "string" || !HEX_RE.test(value.tintHex))) {
    issues.push(issue("MEDIA_TILE", `${path}.tintHex`, "Tint must be #RRGGBB."));
  }
  if (value.fit !== undefined && !new Set(PUBLIC_PAGE_FITS).has(value.fit as never)) {
    issues.push(issue("MEDIA_TILE", `${path}.fit`, "Fit is not a registered presentation mode."));
  }
  if (value.parallax !== undefined && !new Set(PUBLIC_PAGE_PARALLAX).has(value.parallax as never)) {
    issues.push(issue("MEDIA_TILE", `${path}.parallax`, "Parallax preset is not recognized."));
  }
  if (value.mask !== undefined && !new Set(PUBLIC_PAGE_MASKS).has(value.mask as never)) {
    issues.push(issue("MEDIA_TILE", `${path}.mask`, "Mask is not in the registered library."));
  }
  if (value.blend !== undefined && !new Set(PUBLIC_PAGE_BLENDS).has(value.blend as never)) {
    issues.push(issue("MEDIA_TILE", `${path}.blend`, "Blend mode is not registered."));
  }
  if (value.source === "VIDEO_LOOP") {
    if (value.muted === false) {
      issues.push(issue("VIDEO_LOOP", `${path}.muted`, "Background video stays muted. Audible playback belongs to the canonical player."));
    }
    if (typeof value.posterAssetId !== "string" && typeof value.posterPath !== "string") {
      issues.push(issue("VIDEO_LOOP", `${path}.posterAssetId`, "A video loop needs a poster fallback."));
    }
    if (typeof value.assetId !== "string") {
      issues.push(issue("VIDEO_LOOP", `${path}.assetId`, "A video loop needs a canonical asset id."));
    }
  }
  if ((value.source === "IMAGE" || value.source === "ANIMATED_IMAGE") && value.assetId === undefined && value.deliveryPath === undefined && value.colorHex === undefined) {
    issues.push(issue("MEDIA_TILE", `${path}.assetId`, "Image tiles need a canonical asset id or a safe delivery path."));
  }
  if (value.source === "PATTERN" && !PUBLIC_PAGE_PATTERN_IDS.includes(value.assetId as never)) {
    issues.push(issue("MEDIA_TILE", `${path}.assetId`, "Pattern wallpaper must be an approved pattern id."));
  }
  const tileNumeric: Array<[string, number, number]> = [
    ["focalX", 0, 100],
    ["focalY", 0, 100],
    ["frameX", 0, 100],
    ["frameY", 0, 100],
    ["frameW", 8, 100],
    ["frameH", 8, 100],
    ["opacity", 0, 100],
    ["overlayOpacity", 0, 100],
    ["blur", 0, 20],
    ["brightness", 0, 2],
    ["contrast", 0, 2],
    ["saturation", 0, 2],
    ["speed", 0.25, 1.5],
  ];
  for (const [key, min, max] of tileNumeric) {
    if (value[key] === undefined) continue;
    if (typeof value[key] !== "number" || !Number.isFinite(value[key] as number) || (value[key] as number) < min || (value[key] as number) > max) {
      issues.push(issue("MEDIA_TILE", `${path}.${key}`, `${key} is outside ${min}–${max}.`));
    }
  }
}

function validateBounds(value: unknown, path: string, issues: PublicPageValidationIssue[]): void {
  if (!isRecord(value)) {
    issues.push(issue("BOUNDS", path, "Bounds must be an object."));
    return;
  }
  rejectUnknownKeys(value, BOUNDS_KEYS, path, issues);
  for (const key of ["x", "y", "w", "h", "z"]) {
    if (typeof value[key] !== "number" || !Number.isFinite(value[key] as number)) {
      issues.push(issue("BOUNDS", `${path}.${key}`, `${key} must be a finite number.`));
    }
  }
  if (typeof value.w === "number" && value.w <= 0) {
    issues.push(issue("BOUNDS", `${path}.w`, "Width must be greater than zero."));
  }
  if (typeof value.h === "number" && value.h <= 0) {
    issues.push(issue("BOUNDS", `${path}.h`, "Height must be greater than zero."));
  }
  if (value.column !== undefined && !COLUMNS.has(String(value.column))) {
    issues.push(issue("BOUNDS", `${path}.column`, "Column must be L, R, or FULL."));
  }
}

function validateBinding(value: unknown, path: string, issues: PublicPageValidationIssue[]): void {
  if (!isRecord(value)) {
    issues.push(issue("BINDING", path, "Canonical binding must be an object."));
    return;
  }
  rejectUnknownKeys(value, BINDING_KEYS, path, issues);
  if (typeof value.authority !== "string" || !AUTHORITIES.has(value.authority)) {
    issues.push(issue("BINDING_AUTHORITY", `${path}.authority`, "Binding authority is not recognized."));
  }
  if (typeof value.recordId !== "string" || value.recordId.trim().length === 0) {
    issues.push(issue("BINDING_RECORD", `${path}.recordId`, "Canonical record id must be non-empty."));
  }
  if (typeof value.snapshotPolicy !== "string" || !SNAPSHOTS.has(value.snapshotPolicy)) {
    issues.push(issue("BINDING_SNAPSHOT", `${path}.snapshotPolicy`, "Snapshot policy must be LIVE_RESOLVE or PINNED_REVISION."));
  }
  if (value.snapshotPolicy === "PINNED_REVISION") {
    if (typeof value.pinnedRevisionLabel !== "string" || value.pinnedRevisionLabel.trim().length === 0) {
      issues.push(issue("BINDING_SNAPSHOT", `${path}.pinnedRevisionLabel`, "Pinned revision requires a non-empty label."));
    }
  }
}

function validateMediaLink(value: unknown, path: string, issues: PublicPageValidationIssue[]): void {
  if (!isRecord(value)) {
    issues.push(issue("MEDIA_LINK", path, "A link preview must be an object."));
    return;
  }
  rejectUnknownKeys(value, MEDIA_LINK_KEYS, path, issues);
  if (typeof value.service !== "string" || !LINK_SERVICES.has(value.service)) {
    issues.push(issue("MEDIA_LINK", `${path}.service`, "Link service is not recognized."));
  }
  if (value.externalId !== undefined && (typeof value.externalId !== "string" || value.externalId.includes("..") || !LINK_ID_RE.test(value.externalId))) {
    issues.push(issue("MEDIA_LINK", `${path}.externalId`, "Link id is not a safe token."));
  }
}

function validateBlock(
  value: unknown,
  path: string,
  issues: PublicPageValidationIssue[],
  ids: Map<string, string>,
): void {
  if (!isRecord(value)) {
    issues.push(issue("BLOCK", path, "Block must be an object."));
    return;
  }
  rejectUnknownKeys(value, BLOCK_KEYS, path, issues);
  if (typeof value.id === "string") {
    if (!ID_RE.test(value.id)) {
      issues.push(issue("MALFORMED_ID", `${path}.id`, "Block id is malformed."));
    } else if (ids.has(value.id)) {
      issues.push(issue("DUPLICATE_ID", `${path}.id`, `Block id "${value.id}" duplicates ${ids.get(value.id)}.`));
    } else {
      ids.set(value.id, path);
    }
  } else {
    issues.push(issue("MALFORMED_ID", `${path}.id`, "Block id is required."));
  }
  if (typeof value.kind !== "string") {
    issues.push(issue("BLOCK_KIND", `${path}.kind`, "Block kind is required."));
  } else if (REJECTED_KINDS.has(value.kind)) {
    issues.push(issue("REJECTED_BLOCK_KIND", `${path}.kind`, `"${value.kind}" is not allowed on a public page.`));
  } else if (!isPublicPageBlockKind(value.kind)) {
    issues.push(issue("BLOCK_KIND", `${path}.kind`, `Unsupported block kind "${value.kind}".`));
  }
  if (!PLACEMENTS.has(String(value.placement))) {
    issues.push(issue("PLACEMENT", `${path}.placement`, "Placement must be FLOW or MAGNET."));
  }
  if (!VISIBILITIES.has(String(value.visibility))) {
    issues.push(issue("VISIBILITY", `${path}.visibility`, "Visibility is not a recognized declaration."));
  }
  validateBounds(value.bounds, `${path}.bounds`, issues);
  validateStyle(value.style, `${path}.style`, issues);
  validateA11y(value.a11y, `${path}.a11y`, issues, false);
  if (value.bindingRef !== undefined) validateBinding(value.bindingRef, `${path}.bindingRef`, issues);
  if (value.mediaLink !== undefined) validateMediaLink(value.mediaLink, `${path}.mediaLink`, issues);
  if (value.plainText !== undefined) {
    if (!isRecord(value.plainText) || typeof value.plainText.text !== "string") {
      issues.push(issue("PLAIN_TEXT", `${path}.plainText`, "Plain text must be { text: string }."));
    } else {
      rejectUnsafeStrings(value.plainText.text, `${path}.plainText.text`, issues);
      const extra = Object.keys(value.plainText).filter((key) => key !== "text");
      for (const key of extra) {
        issues.push(issue("UNKNOWN_FIELD", `${path}.plainText.${key}`, "Plain text cannot carry extra payloads."));
      }
    }
  }
  if (typeof value.kind === "string" && isPublicPageBlockKind(value.kind)) {
    const entry = getPublicPageBlockCatalogEntry(value.kind);
    if (entry?.requiresBinding && value.bindingRef === undefined) {
      issues.push(issue("BINDING_REQUIRED", `${path}.bindingRef`, `${value.kind} requires a canonical binding.`));
    }
  }
}

function validateSection(
  value: unknown,
  path: string,
  issues: PublicPageValidationIssue[],
  ids: Map<string, string>,
): void {
  if (!isRecord(value)) {
    issues.push(issue("SECTION", path, "Section must be an object."));
    return;
  }
  rejectUnknownKeys(value, SECTION_KEYS, path, issues);
  requireId(value.sectionId, `${path}.sectionId`, issues);
  if (typeof value.sectionId === "string" && ID_RE.test(value.sectionId)) {
    if (ids.has(value.sectionId)) {
      issues.push(issue("DUPLICATE_ID", `${path}.sectionId`, "Section id is duplicated."));
    } else {
      ids.set(value.sectionId, path);
    }
  }
  if (!SECTION_KINDS.has(String(value.kind))) {
    issues.push(issue("SECTION", `${path}.kind`, "Section kind is not recognized."));
  }
  if (typeof value.order !== "number" || !Number.isInteger(value.order)) {
    issues.push(issue("SECTION", `${path}.order`, "Section order must be an integer."));
  }
  if (!VISIBILITIES.has(String(value.visibility))) {
    issues.push(issue("VISIBILITY", `${path}.visibility`, "Section visibility is not recognized."));
  }
  if (!Array.isArray(value.blocks)) {
    issues.push(issue("SECTION", `${path}.blocks`, "Section blocks must be an array."));
    return;
  }
  value.blocks.forEach((block, index) => validateBlock(block, `${path}.blocks[${index}]`, issues, ids));
  if (value.layout !== undefined && !new Set(PUBLIC_PAGE_SECTION_LAYOUTS).has(value.layout as never)) {
    issues.push(issue("SECTION", `${path}.layout`, "Section layout is not a registered composition."));
  }
  if (value.transition !== undefined && !new Set(PUBLIC_PAGE_SECTION_TRANSITIONS).has(value.transition as never)) {
    issues.push(issue("SECTION", `${path}.transition`, "Section transition is not registered."));
  }
  if (value.atmosphere !== undefined && !new Set(PUBLIC_PAGE_ATMOSPHERES).has(value.atmosphere as never)) {
    issues.push(issue("SECTION", `${path}.atmosphere`, "Atmosphere is not a registered visual effect."));
  }
  if (value.heightMode !== undefined && !new Set(PUBLIC_PAGE_SECTION_HEIGHTS).has(value.heightMode as never)) {
    issues.push(issue("SECTION", `${path}.heightMode`, "Section height is not a registered size."));
  }
  if (value.hidden !== undefined && typeof value.hidden !== "boolean") {
    issues.push(issue("SECTION", `${path}.hidden`, "Hidden must be boolean."));
  }
  if (value.background !== undefined) validateMediaTile(value.background, `${path}.background`, issues);
  if (value.overlay !== undefined) validateMediaTile(value.overlay, `${path}.overlay`, issues);
  if (value.panes !== undefined) {
    if (!Array.isArray(value.panes)) {
      issues.push(issue("SECTION", `${path}.panes`, "Panes must be an array."));
    } else {
      value.panes.forEach((pane, index) => validatePane(pane, `${path}.panes[${index}]`, issues));
    }
  }
  for (const key of ["minHeightPx", "paddingPx", "gapPx"] as const) {
    if (value[key] === undefined) continue;
    if (typeof value[key] !== "number" || (value[key] as number) < 0 || (value[key] as number) > 4000) {
      issues.push(issue("SECTION", `${path}.${key}`, `${key} is outside 0–4000.`));
    }
  }
}

function validatePane(value: unknown, path: string, issues: PublicPageValidationIssue[]): void {
  if (!isRecord(value)) {
    issues.push(issue("PANE", path, "Pane must be an object."));
    return;
  }
  rejectUnknownKeys(value, new Set(["paneId", "order", "tile", "blockIds"]), path, issues);
  requireId(value.paneId, `${path}.paneId`, issues);
  if (typeof value.order !== "number" || !Number.isInteger(value.order)) {
    issues.push(issue("PANE", `${path}.order`, "Pane order must be an integer."));
  }
  if (value.tile !== undefined) validateMediaTile(value.tile, `${path}.tile`, issues);
  if (value.blockIds !== undefined && (!Array.isArray(value.blockIds) || value.blockIds.some((id) => typeof id !== "string"))) {
    issues.push(issue("PANE", `${path}.blockIds`, "Pane block ids must be strings."));
  }
}

function validateResponsive(value: unknown, path: string, issues: PublicPageValidationIssue[]): void {
  if (!isRecord(value)) {
    issues.push(issue("RESPONSIVE", path, "Responsive rules must be an object."));
    return;
  }
  rejectUnknownKeys(value, RESPONSIVE_KEYS, path, issues);
  if (!MOBILE_STRATEGIES.has(String(value.mobileStrategy))) {
    issues.push(issue("RESPONSIVE", `${path}.mobileStrategy`, "Mobile strategy is not recognized."));
  }
  if (!MAGNET_COLLAPSE.has(String(value.magnetCollapse))) {
    issues.push(issue("RESPONSIVE", `${path}.magnetCollapse`, "Magnet collapse behavior is not recognized."));
  }
  if (!Array.isArray(value.viewports) || value.viewports.length === 0) {
    issues.push(issue("RESPONSIVE", `${path}.viewports`, "At least one viewport class is required."));
  } else {
    for (const viewport of value.viewports) {
      if (typeof viewport !== "string" || !VIEWPORTS.has(viewport)) {
        issues.push(issue("RESPONSIVE", `${path}.viewports`, "Viewport class must be DESKTOP, TABLET, or PHONE."));
        break;
      }
    }
  }
  if (
    value.phoneCertificationTarget !== undefined &&
    value.phoneCertificationTarget !== "390x844"
  ) {
    issues.push(
      issue(
        "RESPONSIVE",
        `${path}.phoneCertificationTarget`,
        "Phone certification target annotation must be 390x844 when present. It is not a layout size.",
      ),
    );
  }
}

function validateTheme(value: unknown, path: string, issues: PublicPageValidationIssue[]): void {
  if (!isRecord(value)) {
    issues.push(issue("THEME", path, "Theme must be an object."));
    return;
  }
  rejectUnknownKeys(value, THEME_KEYS, path, issues);
  if (typeof value.accentColorHex !== "string" || !HEX_RE.test(value.accentColorHex)) {
    issues.push(issue("THEME", `${path}.accentColorHex`, "Accent must be a #RRGGBB color."));
  }
  if (typeof value.stylePackId !== "string" || !ID_RE.test(value.stylePackId)) {
    issues.push(issue("THEME", `${path}.stylePackId`, "Style pack id must be a presentation identity."));
  }
  if (!INTENSITIES.has(String(value.animationIntensity))) {
    issues.push(issue("THEME", `${path}.animationIntensity`, "Animation intensity is not recognized."));
  }
  if (!FONT_PAIRINGS.has(String(value.fontPairingId))) {
    issues.push(issue("THEME", `${path}.fontPairingId`, "fontPairingId belongs on the document theme and must be a certified pairing."));
  }
  if (value.flickerPlace !== undefined && !FLICKER_PLACES.has(String(value.flickerPlace))) {
    issues.push(issue("THEME", `${path}.flickerPlace`, "Flicker place must be MOTTO or OFF."));
  }
  for (const key of ["surfaceColorHex", "surfaceGradientHex"] as const) {
    if (value[key] !== undefined && (typeof value[key] !== "string" || !HEX_RE.test(value[key] as string))) {
      issues.push(issue("THEME", `${path}.${key}`, "Page surface color must be #RRGGBB."));
    }
  }
  for (const forbidden of ["coinCost", "priceCents", "requiredTier", "acquisitionPath", "path"]) {
    if (forbidden in value) {
      issues.push(issue("THEME", `${path}.${forbidden}`, "Commerce acquisition metadata does not belong on the page document."));
    }
  }
}

export function validatePublicPageDocument(input: unknown): PublicPageValidationResult {
  const issues: PublicPageValidationIssue[] = [];
  if (!isRecord(input)) {
    return { ok: false, issues: [issue("DOCUMENT", "$", "Document must be an object.")] };
  }
  rejectUnknownKeys(input, DOCUMENT_KEYS, "$", issues);
  requireId(input.documentId, "$.documentId", issues);
  requireId(input.ownerUserId, "$.ownerUserId", issues);
  if (input.schemaVersion !== PUBLIC_PAGE_DOCUMENT_SCHEMA_VERSION) {
    issues.push(
      issue(
        "SCHEMA_VERSION",
        "$.schemaVersion",
        `schemaVersion must be ${PUBLIC_PAGE_DOCUMENT_SCHEMA_VERSION}. Stored migrations are not implemented.`,
      ),
    );
  }
  if (typeof input.documentPurpose !== "string" || !PURPOSE_SET.has(input.documentPurpose)) {
    issues.push(issue("DOCUMENT_PURPOSE", "$.documentPurpose", "Document purpose is not recognized."));
  } else if (!CONNECTED_PURPOSES.has(input.documentPurpose)) {
    issues.push(
      issue(
        "DOCUMENT_PURPOSE",
        "$.documentPurpose",
        `${input.documentPurpose} is a lineage extension only and is not a validated runtime document in C.2.`,
      ),
    );
  }
  if (!PROFILE_KINDS.has(String(input.profileKind))) {
    issues.push(issue("DOCUMENT", "$.profileKind", "Profile kind must be FAN, PERFORMER, or WRITER_PORTFOLIO."));
  }
  if (!STATUSES.has(String(input.status))) {
    issues.push(issue("DOCUMENT", "$.status", "Status must be DRAFT, PUBLISHED, or ARCHIVED."));
  }
  if (input.publishedVersion !== null && (typeof input.publishedVersion !== "number" || !Number.isInteger(input.publishedVersion) || input.publishedVersion < 1)) {
    issues.push(issue("DOCUMENT", "$.publishedVersion", "publishedVersion must be a positive integer or null."));
  }
  if (input.draftRevisionLabel !== null && typeof input.draftRevisionLabel !== "string") {
    issues.push(issue("DOCUMENT", "$.draftRevisionLabel", "draftRevisionLabel must be a string or null."));
  }
  if (typeof input.updatedAt !== "string" || !ISO_RE.test(input.updatedAt)) {
    issues.push(issue("DOCUMENT", "$.updatedAt", "updatedAt must be an ISO timestamp string."));
  }
  validateTheme(input.theme, "$.theme", issues);
  validateResponsive(input.responsiveRules, "$.responsiveRules", issues);
  validateA11y(input.a11y, "$.a11y", issues, false);
  if (!Array.isArray(input.sections)) {
    issues.push(issue("SECTION", "$.sections", "Sections must be an array."));
  } else {
    if (input.sections.length === 0) {
      issues.push(issue("SECTION", "$.sections", "A document needs at least one section. It does not need every section kind."));
    }
    const ids = new Map<string, string>();
    input.sections.forEach((section, index) => validateSection(section, `$.sections[${index}]`, issues, ids));
    const blockCount = input.sections.reduce((count, section) => {
      if (isRecord(section) && Array.isArray(section.blocks)) return count + section.blocks.length;
      return count;
    }, 0);
    if (blockCount === 0) {
      issues.push(issue("BLOCK", "$.sections", "A valid page needs at least one block. Empty placeholder blocks are not required."));
    }
  }
  if (input.worldBackground !== undefined) validateMediaTile(input.worldBackground, "$.worldBackground", issues);
  if (input.openingPresentation !== undefined && !new Set(PUBLIC_PAGE_OPENINGS).has(input.openingPresentation as never)) {
    issues.push(issue("OPENING", "$.openingPresentation", "Opening presentation is not a registered option."));
  }
  if (input.performanceTier !== undefined && !new Set(PUBLIC_PAGE_PERFORMANCE_TIERS).has(input.performanceTier as never)) {
    issues.push(issue("PERFORMANCE", "$.performanceTier", "Performance tier is not recognized."));
  }
  if (input.atmosphere !== undefined && !new Set(PUBLIC_PAGE_ATMOSPHERES).has(input.atmosphere as never)) {
    issues.push(issue("ATMOSPHERE", "$.atmosphere", "Atmosphere is not a registered visual effect."));
  }
  return issues.length === 0 ? { ok: true } : { ok: false, issues };
}

export function assertCatalogHasNoRejectedKinds(): string[] {
  return PUBLIC_PAGE_BLOCK_KINDS.filter((kind) => REJECTED_KINDS.has(kind));
}

export function documentHasHeroBlock(doc: PublicPageDocument): boolean {
  return doc.sections.some(
    (section) => section.kind === "HERO" || section.blocks.some((block) => block.kind === "HERO_BANNER"),
  );
}
