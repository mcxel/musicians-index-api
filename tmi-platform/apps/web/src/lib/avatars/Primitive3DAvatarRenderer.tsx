"use client";

/**
 * Primitive3D / 3D_MESH v0 renderer — wraps capsule AvatarRig from AvatarLobbyCanvas.
 * Honest label: 3D Avatar Runtime v0 (evolving). Not photoreal / not finished bobblehead pipeline.
 */

import dynamic from "next/dynamic";
import type { IAvatarRenderer, AvatarState } from "@/lib/avatars/AvatarRendererContract";
import type { SocketAttachmentDef } from "@/components/3d/AvatarSocketAttachment";

const AvatarViewer = dynamic(
  () => import("@/components/3d/AvatarLobbyCanvas").then((m) => m.AvatarViewer),
  { ssr: false },
);

export type Primitive3DAvatarState = AvatarState & {
  portraitUrl?: string;
  bodyColor?: string;
  hairColor?: string;
  crown?: boolean;
  attachments?: SocketAttachmentDef[];
  size?: number;
};

function Primitive3DAvatarComponent({ state }: { state: AvatarState }) {
  const s = state as Primitive3DAvatarState;
  // Fan bobbleheads: never paste portrait as world identity (Marcel lock).
  const usePortrait = Boolean(s.portraitUrl ?? s.avatarSrc) && !(s as { bobbleheadRatio?: number }).bobbleheadRatio;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "rgba(0,255,255,0.7)" }}>
        3D AVATAR RUNTIME v0 — EVOLVING
      </div>
      <AvatarViewer
        active
        color={s.bodyColor ?? "#AA2DFF"}
        hairColor={s.hairColor}
        portraitUrl={usePortrait ? (s.portraitUrl ?? s.avatarSrc) : undefined}
        crown={s.crown ?? false}
        attachments={s.attachments}
        size={s.size ?? 160}
        enableOrbit
        bobbleheadRatio={(s as { bobbleheadRatio?: number }).bobbleheadRatio ?? 1.35}
      />
    </div>
  );
}

export const Primitive3DAvatarRenderer: IAvatarRenderer = {
  type: "3D_MESH",
  Component: Primitive3DAvatarComponent,
};
