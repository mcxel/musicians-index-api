/**
 * AvatarGlbRegistry — future photoreal / certified GLB slots for AvatarRig.
 *
 * Rule 18/20: no production bobblehead GLB exists in public/ yet.
 * certified=true only when a real file is QA'd; otherwise AvatarRig stays
 * procedural capsules. Face-scan photo storage is separate (landmarks placeholder).
 */

export type AvatarGlbSlotId =
  | "bobblehead_v0"
  | "bobblehead_fan_urban"
  | "bobblehead_fan_athlete"
  | "face_scan_mesh_v1";

export interface AvatarGlbSlot {
  id: AvatarGlbSlotId;
  /** Public URL path once asset is promoted into apps/web/public */
  publicPath: string;
  /** True only after file exists + visual QA — never invent certified. */
  certified: boolean;
  note: string;
}

export const AVATAR_GLB_REGISTRY: readonly AvatarGlbSlot[] = [
  {
    id: "bobblehead_v0",
    publicPath: "/models/avatars/bobblehead_v0.glb",
    certified: false,
    note: "Reserved slot — no production GLB in tree (VenueSceneFactory confirms 0 GLBs).",
  },
  {
    id: "bobblehead_fan_urban",
    publicPath: "/models/avatars/bobblehead_fan_urban.glb",
    certified: false,
    note: "Future urban Fan base mesh.",
  },
  {
    id: "bobblehead_fan_athlete",
    publicPath: "/models/avatars/bobblehead_fan_athlete.glb",
    certified: false,
    note: "Future athlete Fan base mesh.",
  },
  {
    id: "face_scan_mesh_v1",
    publicPath: "/models/avatars/face_scan_mesh_v1.glb",
    certified: false,
    note: "Face-scan → UV mesh pipeline not built (Rule 18). Photo/landmarks only.",
  },
] as const;

export function getAvatarGlbSlot(id: AvatarGlbSlotId): AvatarGlbSlot | undefined {
  return AVATAR_GLB_REGISTRY.find((s) => s.id === id);
}

/** Returns publicPath only when certified — otherwise null (procedural AvatarRig). */
export function resolveCertifiedAvatarGlbUrl(id?: AvatarGlbSlotId | null): string | null {
  if (!id) return null;
  const slot = getAvatarGlbSlot(id);
  if (!slot?.certified) return null;
  return slot.publicPath;
}

export function listCertifiedAvatarGlbs(): AvatarGlbSlot[] {
  return AVATAR_GLB_REGISTRY.filter((s) => s.certified);
}

export const AVATAR_GLB_HONEST_STATUS =
  "No certified AvatarRig GLB in public/ — procedural bobblehead v0. Face scan stores photo + landmarks placeholder only; 3D build pending.";
