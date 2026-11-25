"use client";

/**
 * Embed of the canonical AvatarViewer showroom mode.
 * Reads the saved draft. Does not start playback or touch a live session.
 */

import { useEffect, useMemo, useState } from "react";
import { AvatarViewer } from "@/components/3d/AvatarLobbyCanvas";
import {
  getCanonicalAvatarDraft,
  hydrateCanonicalAvatarDraft,
  subscribeCanonicalAvatarDraft,
  type CanonicalAvatarDraftState,
} from "@/lib/avatars/CanonicalAvatarDraft";
import { resolveAvatarPreview } from "@/lib/avatars/AvatarPreviewRuntime";

export function AvatarShowroomPreview({
  height = 280,
  testId = "avatar-showroom-preview",
}: {
  height?: number;
  testId?: string;
}) {
  const [draft, setDraft] = useState<CanonicalAvatarDraftState>(() => getCanonicalAvatarDraft());

  useEffect(() => {
    setDraft(hydrateCanonicalAvatarDraft());
    return subscribeCanonicalAvatarDraft(setDraft);
  }, []);

  const preview = useMemo(() => resolveAvatarPreview(draft), [draft]);

  return (
    <div
      data-testid={testId}
      data-showroom-embed="1"
      data-avatar-base={draft.baseId}
      style={{ height, width: "100%", position: "relative", minHeight: 220 }}
    >
      <AvatarViewer
        {...(preview.rigProps ?? {})}
        fill
        showroomMode
        enableOrbit
        cameraFocus="body"
      />
    </div>
  );
}
