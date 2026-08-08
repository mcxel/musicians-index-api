"use client";

import dynamic from "next/dynamic";
import {
  forgeSelectionToCosmeticIds,
  cosmeticIdsToAttachments,
  resolveOutfitTint,
} from "@/lib/avatars/fanAvatarLoadout";

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
}: AvatarForgePreview3DProps) {
  const ids = forgeSelectionToCosmeticIds({
    outfit,
    propName,
    accessories,
    equippedCosmeticIds,
  });
  const attachments = cosmeticIdsToAttachments(ids);
  const outfitTint = resolveOutfitTint(ids);
  const heightLabel = bodyHeight < 33 ? "Short" : bodyHeight < 66 ? "Average" : "Tall";
  const massLabel =
    bodyMass < 25 ? "Slim" : bodyMass < 50 ? "Athletic" : bodyMass < 75 ? "Average" : "Solid";
  const isPlaying = pose === "Dance" || pose === "Champion";
  const isSeated = pose === "Sit";
  const crown = ids.includes("crown") || outfit === "Royal Stage";
  const activeProp =
    attachments.find((a) => a.socketId === "socket_primary_hand")?.id ?? undefined;

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
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14 }}>
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
            size={280}
            enableOrbit
          />
        </div>
        <div style={{ color: "#ddc8fa", fontSize: 12, lineHeight: 1.8 }}>
          <div style={{ fontWeight: 800, color: "#fff", marginBottom: 4 }}>{profileName || "Unnamed"}</div>
          <div>Hair: {hair}</div>
          <div>Eyes: {eyes}</div>
          <div>Outfit / costume: {outfit}</div>
          <div>Prop: {propName}</div>
          <div>Accessories: {accessories.join(", ") || "None"}</div>
          <div>Loadout SKUs: {ids.join(", ") || "—"}</div>
          <div>Background: {background}</div>
          <div>Lighting: {lighting}</div>
          <div>
            Pose: {pose} · {heightLabel} · {massLabel}
          </div>
          <div style={{ marginTop: 8, fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
            Capsule + socket costumes/props — not a finished mesh pipeline.
          </div>
        </div>
      </div>
    </section>
  );
}
