"use client";

import dynamic from "next/dynamic";
import type { AvatarCameraFocus } from "@/components/3d/AvatarLobbyCanvas";
import {
  cosmeticIdsToAttachments,
  forgeSelectionToCosmeticIds,
  resolveOutfitTint,
} from "@/lib/avatars/fanAvatarLoadout";
import {
  DEFAULT_FAN_AVATAR_GLB_SLOT,
  resolveAvatarViewportBinding,
} from "@/lib/avatars/AvatarGlbRegistry";

const AvatarViewer = dynamic(
  () => import("@/components/3d/AvatarLobbyCanvas").then((m) => m.AvatarViewer),
  { ssr: false },
);

export type AvatarForgePreview3DProps = {
  profileName: string;
  skin: string;
  hair: string;
  eyes: string;
  outfit: string;
  propName: string;
  background: string;
  lighting: string;
  pose: string;
  accessories: string[];
  bodyHeight?: number;
  bodyMass?: number;
  equippedCosmeticIds?: string[];
  portraitUrl?: string;
  hero?: boolean;
  cameraFocus?: AvatarCameraFocus;
};

const HAIR_TINT: Record<string, string> = {
  Fade: "#3d2314",
  Locs: "#1a0f0a",
  Braids: "#2a1810",
  Afro: "#0d0d0d",
  Bald: "#c0865e",
};

/**
 * R3F AvatarRig driven by forge state — costumes, accessories, animated props.
 * Label: 3D Avatar Runtime v0 — evolving.
 */
export default function AvatarForgePreview3D({
  profileName,
  skin,
  hair,
  eyes,
  outfit,
  propName,
  background,
  lighting,
  pose,
  accessories,
  bodyHeight = 50,
  bodyMass = 50,
  equippedCosmeticIds = [],
  portraitUrl,
  hero = false,
  cameraFocus = "body",
}: AvatarForgePreview3DProps) {
  const ids = forgeSelectionToCosmeticIds({
    outfit,
    propName,
    accessories,
    equippedCosmeticIds,
  });
  const attachments = cosmeticIdsToAttachments(ids);
  const outfitTint = resolveOutfitTint(ids);
  const viewport = resolveAvatarViewportBinding(DEFAULT_FAN_AVATAR_GLB_SLOT);
  const heightLabel = bodyHeight < 33 ? "Short" : bodyHeight < 66 ? "Average" : "Tall";
  const massLabel =
    bodyMass < 25 ? "Slim" : bodyMass < 50 ? "Athletic" : bodyMass < 75 ? "Average" : "Solid";
  const isPlaying = pose === "Dance" || pose === "Champion";
  const isSeated = pose === "Sit";
  const crown = ids.includes("crown") || outfit === "Royal Stage";
  const activeProp =
    attachments.find((a) => a.socketId === "socket_primary_hand")?.id ?? undefined;

  const viewer = (
    <AvatarViewer
      active
      color={skin}
      hairColor={HAIR_TINT[hair] ?? skin}
      visorColor={
        eyes.includes("Neon") ? "#00FFFF" : eyes.includes("Emerald") ? "#00FF88" : "#FFD700"
      }
      crown={crown}
      isPlaying={isPlaying}
      isSeated={isSeated || pose === "Sit"}
      attachments={attachments}
      outfitTint={outfitTint}
      activePropId={activeProp}
      portraitUrl={portraitUrl}
      bodyHeight={bodyHeight}
      bodyMass={bodyMass}
      size={hero ? 420 : 280}
      fill={hero}
      cameraFocus={cameraFocus}
      enableOrbit
      glbSlotId={viewport.glbUrl ? viewport.slotId : undefined}
      glbUrl={viewport.glbUrl ?? undefined}
    />
  );

  if (hero) {
    return (
      <section
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          minHeight: 320,
          background: "radial-gradient(ellipse at 50% 28%, #3a1a62 0%, #12081c 48%, #07050f 100%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {viewer}
        </div>
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 12,
            right: 12,
            display: "flex",
            justifyContent: "space-between",
            pointerEvents: "none",
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", color: "#00FFFF99" }}>
            3D AVATAR RUNTIME v0 — EVOLVING
          </span>
          <span style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.45)" }}>
            {profileName || "Fan avatar"} · {heightLabel} · {massLabel}
          </span>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 10,
            left: 12,
            right: 12,
            fontSize: 9,
            color: "rgba(255,255,255,0.4)",
            pointerEvents: "none",
          }}
        >
            {viewport.glbUrl
              ? "Foundry bobblehead_v0 · socket costumes · drag to orbit"
              : "Capsule + socket costumes · drag to orbit · Foundry GLB not bound"}
        </div>
      </section>
    );
  }

  return (
    <section
      style={{
        background: "radial-gradient(circle at top, #2e1a4c, #0f0817 72%)",
        border: "1px solid #63428f",
        borderRadius: 18,
        padding: 18,
        minHeight: 380,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <h3 style={{ color: "#f5edff", margin: 0, fontSize: 16 }}>3D Preview</h3>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", color: "#00FFFF99" }}>
          3D AVATAR RUNTIME v0 — EVOLVING
        </span>
      </div>
      <div
        style={{
          borderRadius: 16,
          border: "1px solid #7e61a5",
          background: "#170f24",
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {viewer}
      </div>
      <div style={{ marginTop: 8, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
        {profileName || "Unnamed"} · {outfit} · {pose} · capsule + sockets — not a finished mesh pipeline.
        {background ? ` · ${background}` : ""}
        {lighting ? ` · ${lighting}` : ""}
      </div>
    </section>
  );
}
