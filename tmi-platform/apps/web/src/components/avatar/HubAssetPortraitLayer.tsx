"use client";

import MotionPortraitEngine from "./MotionPortraitEngine";
import { avatarRegistry } from "@/lib/assets/avatarRegistry";
import { hostRegistry } from "@/lib/assets/hostRegistry";
import { poseRegistry } from "@/lib/assets/poseRegistry";
import { expressionRegistry } from "@/lib/assets/expressionRegistry";
import { loadedAssets } from "@/lib/assets/assetRegistry";

type HubPortraitVariant = "circle" | "cutout" | "hero";
type HubPortraitState = "idle" | "speaking" | "featured" | "winner" | "live";

type HubAssetPortraitLayerProps = {
  name: string;
  accent?: string;
  variant?: HubPortraitVariant;
  state?: HubPortraitState;
  assetId?: string;
  avatarId?: string;
  hostId?: string;
};

function stateToGesture(state: HubPortraitState) {
  switch (state) {
    case "speaking":
      return "talk" as const;
    case "featured":
      return "point" as const;
    case "winner":
      return "celebrate" as const;
    case "live":
      return "wave" as const;
    default:
      return "idle" as const;
  }
}

function stateToPoseId(state: HubPortraitState): string {
  switch (state) {
    case "speaking":
      return "talking";
    case "featured":
      return "camera-look";
    case "winner":
      return "cheering";
    case "live":
      return "watching";
    default:
      return "idle";
  }
}

function stateToExpressionId(state: HubPortraitState): string {
  switch (state) {
    case "speaking":
      return "focused";
    case "featured":
      return "proud";
    case "winner":
      return "excited";
    case "live":
      return "hyped";
    default:
      return "neutral";
  }
}

export default function HubAssetPortraitLayer({
  name,
  accent = "#63e5ff",
  variant = "circle",
  state = "idle",
  assetId,
  avatarId,
  hostId,
}: HubAssetPortraitLayerProps) {
  const resolvedAsset = assetId ? loadedAssets.get(assetId) : undefined;
  const avatar = avatarId ? avatarRegistry.get(avatarId) : undefined;
  const host = hostId ? hostRegistry.get(hostId) : undefined;

  const poseId = host?.posesRef ?? stateToPoseId(state);
  const expressionId = avatar?.expressionsRef ?? host?.expressionsRef ?? stateToExpressionId(state);

  const pose = poseRegistry.get(poseId);
  const expression = expressionRegistry.get(expressionId);

  const mode = variant === "hero" ? "cutout" : variant;
  const loopPreset = state === "winner" || state === "live" ? "champion" : "standard";

  return (
    <div style={{ display: "grid", gap: 6 }}>
      <div style={{ transform: variant === "hero" ? "scale(1.18)" : "none", transformOrigin: "left top" }}>
        <MotionPortraitEngine
          name={name}
          accent={accent}
          mode={mode}
          gesture={stateToGesture(state)}
          loopPreset={loopPreset}
        />
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <span style={{ borderRadius: 999, border: `1px solid ${accent}44`, color: accent, padding: "2px 8px", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 800 }}>
          {state}
        </span>
        <span style={{ borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", padding: "2px 8px", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {variant}
        </span>
        <span style={{ borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.75)", padding: "2px 8px", fontSize: 9 }}>
          Pose: {pose?.poseId ?? poseId}
        </span>
        <span style={{ borderRadius: 999, border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.75)", padding: "2px 8px", fontSize: 9 }}>
          Expression: {expression?.expressionId ?? expressionId}
        </span>
        {resolvedAsset ? (
          <span style={{ borderRadius: 999, border: "1px solid rgba(0,255,136,0.4)", color: "#00ff88", padding: "2px 8px", fontSize: 9 }}>
            Asset: {resolvedAsset.type}
          </span>
        ) : null}
      </div>
    </div>
  );
}
