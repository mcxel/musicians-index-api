"use client";

/**
 * HostMotionAvatarRenderer — the Phase 1 (2D_ANIMATED) IAvatarRenderer
 * implementation, wrapping the real HostMotionAvatar component (real blink/
 * lip-sync/emotion engines, found and fixed earlier this session — see
 * [[project_audience_runtime_wiring_2026_06_19]]). Any future 3D/point-cloud/
 * AI-generated renderer implements the same IAvatarRenderer shape; consumers
 * that go through getActiveAvatarRenderer() never need to change when that
 * swap happens.
 */

import { HostMotionAvatar } from "@/components/hosts/HostMotionAvatar";
import type { IAvatarRenderer, AvatarState } from "@/lib/avatars/AvatarRendererContract";

function HostMotionAvatarComponent({ state }: { state: AvatarState }) {
  return (
    <HostMotionAvatar
      hostId={state.hostId}
      displayName={state.displayName}
      avatarSrc={state.avatarSrc}
      emotionalState={state.emotion ?? "neutral"}
      activeLine={state.isSpeaking ? state.activeLine : undefined}
    />
  );
}

export const HostMotionAvatarRenderer: IAvatarRenderer = {
  type: "2D_ANIMATED",
  Component: HostMotionAvatarComponent,
};
