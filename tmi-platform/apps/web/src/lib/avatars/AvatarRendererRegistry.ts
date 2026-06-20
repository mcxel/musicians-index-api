/**
 * Single switch point for which IAvatarRenderer is active platform-wide.
 * Swapping to a future 3D/point-cloud/AI renderer means adding it here and
 * changing CURRENT_RENDERER_TYPE — no consumer of getActiveAvatarRenderer()
 * needs to change. Until a real 3D renderer exists, this only has one real
 * entry; the registry shape exists now so adding the second one later is a
 * one-line change, not a rewrite.
 */

import type { AvatarRendererType, IAvatarRenderer } from "@/lib/avatars/AvatarRendererContract";
import { HostMotionAvatarRenderer } from "@/lib/avatars/HostMotionAvatarRenderer";

const CURRENT_RENDERER_TYPE: AvatarRendererType = "2D_ANIMATED";

const RENDERERS: Partial<Record<AvatarRendererType, IAvatarRenderer>> = {
  "2D_ANIMATED": HostMotionAvatarRenderer,
};

export function getActiveAvatarRenderer(): IAvatarRenderer {
  return RENDERERS[CURRENT_RENDERER_TYPE] ?? HostMotionAvatarRenderer;
}
