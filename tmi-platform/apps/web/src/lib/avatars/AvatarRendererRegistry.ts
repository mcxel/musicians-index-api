/**
 * Single switch point for which IAvatarRenderer is active platform-wide.
 * Host surfaces stay on 2D_ANIMATED. Fan creation / lobby surfaces use 3D_MESH
 * (Primitive3D Avatar Runtime v0 — capsule + socket planes).
 */

import type { AvatarRendererType, IAvatarRenderer } from "@/lib/avatars/AvatarRendererContract";
import { HostMotionAvatarRenderer } from "@/lib/avatars/HostMotionAvatarRenderer";
import { Primitive3DAvatarRenderer } from "@/lib/avatars/Primitive3DAvatarRenderer";

/** Platform host default — real 2D animated host portraits. */
const CURRENT_RENDERER_TYPE: AvatarRendererType = "2D_ANIMATED";

/** Fan ownership surfaces (forge, lobby self, Flex apparel preview). */
const FAN_RENDERER_TYPE: AvatarRendererType = "3D_MESH";

const RENDERERS: Partial<Record<AvatarRendererType, IAvatarRenderer>> = {
  "2D_ANIMATED": HostMotionAvatarRenderer,
  "3D_MESH": Primitive3DAvatarRenderer,
  Primitive3D: Primitive3DAvatarRenderer,
};

export function getActiveAvatarRenderer(): IAvatarRenderer {
  return RENDERERS[CURRENT_RENDERER_TYPE] ?? HostMotionAvatarRenderer;
}

/** Fan creation + lobby — 3D Avatar Runtime v0 (evolving). Falls back to 2D if mesh entry missing. */
export function getFanAvatarRenderer(): IAvatarRenderer {
  return RENDERERS[FAN_RENDERER_TYPE] ?? RENDERERS.Primitive3D ?? HostMotionAvatarRenderer;
}

export function getAvatarRenderer(type: AvatarRendererType): IAvatarRenderer {
  return RENDERERS[type] ?? getActiveAvatarRenderer();
}

export function listRegisteredAvatarRenderers(): AvatarRendererType[] {
  return Object.keys(RENDERERS) as AvatarRendererType[];
}
