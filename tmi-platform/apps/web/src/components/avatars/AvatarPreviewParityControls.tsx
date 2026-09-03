"use client";

/**
 * Phase 2 Preview Parity UI adapters — env + presentation selectors only.
 * Patches CanonicalAvatarDraft; does not create a second runtime.
 */

import type { CSSProperties } from "react";
import {
  PHASE2_CERT_ENVIRONMENTS,
  PHASE2_CERT_PANELS,
  gatePreviewAction,
  runArmsUpFitTest,
  type AvatarPreviewEnvironmentId,
  type AvatarPresentationPanelTargetId,
} from "@/lib/avatars/AvatarPreviewRuntime";
import { patchCanonicalAvatarDraft } from "@/lib/avatars/CanonicalAvatarDraft";
import {
  PHASE1_MOTION_SUITE,
  type AvatarPreviewAction,
} from "@/lib/avatars/AvatarPreviewActions";
import type { AvatarViewportBinding } from "@/lib/avatars/AvatarGlbRegistry";

const ENV_LABEL: Record<(typeof PHASE2_CERT_ENVIRONMENTS)[number], string> = {
  FAN_LOBBY: "Fan Lobby",
  WORLD_CONCERT: "World Concert",
  LOW_LIGHT_LOUNGE_STYLE: "Lounge light",
};

const PANEL_LABEL: Record<(typeof PHASE2_CERT_PANELS)[number], string> = {
  JUMBOTRON: "Jumbotron",
  FAN_CAM: "Fan Cam",
  GROUP_CAM: "Group Cam",
};

export type AvatarPreviewParityControlsProps = {
  environmentId: AvatarPreviewEnvironmentId;
  panelTargetId: AvatarPresentationPanelTargetId | null;
  previewAction: AvatarPreviewAction;
  viewport: AvatarViewportBinding;
  accentColor?: string;
  /** compact = Quick Panel; full = Studio strip */
  density?: "compact" | "full";
};

export default function AvatarPreviewParityControls({
  environmentId,
  panelTargetId,
  previewAction,
  viewport,
  accentColor = "#00E5FF",
  density = "compact",
}: AvatarPreviewParityControlsProps) {
  const fontSize = density === "full" ? 9 : 8;
  const arms = runArmsUpFitTest(viewport);

  return (
    <div
      data-testid="avatar-preview-parity-controls"
      style={{ display: "flex", flexDirection: "column", gap: density === "full" ? 10 : 8 }}
    >
      <div style={{ fontSize, fontWeight: 800, color: accentColor, letterSpacing: "0.08em" }}>
        ENV PREVIEW
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {PHASE2_CERT_ENVIRONMENTS.map((id) => {
          const active = environmentId === id;
          return (
            <button
              key={id}
              type="button"
              data-testid={`avatar-env-${id}`}
              data-env-id={id}
              aria-pressed={active}
              onClick={() => patchCanonicalAvatarDraft({ environmentId: id })}
              style={chipStyle(active, accentColor, fontSize)}
            >
              {ENV_LABEL[id]}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize, fontWeight: 800, color: accentColor, letterSpacing: "0.08em" }}>
        PRESENTATION
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {PHASE2_CERT_PANELS.map((id) => {
          const active = panelTargetId === id;
          return (
            <button
              key={id}
              type="button"
              data-testid={`avatar-panel-${id}`}
              data-panel-id={id}
              aria-pressed={active}
              onClick={() => patchCanonicalAvatarDraft({ panelTargetId: id })}
              style={chipStyle(active, accentColor, fontSize)}
            >
              {PANEL_LABEL[id]}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize, fontWeight: 800, color: accentColor, letterSpacing: "0.08em" }}>
        MOTION
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {PHASE1_MOTION_SUITE.map((action) => {
          const gate = gatePreviewAction(action, viewport);
          const disabled = !gate.allowed;
          const active = previewAction === action;
          return (
            <button
              key={action}
              type="button"
              data-testid={`avatar-motion-${action}`}
              disabled={disabled}
              title={disabled ? gate.reason ?? "Unavailable" : `Preview ${action}`}
              onClick={() => {
                if (!disabled) patchCanonicalAvatarDraft({ previewAction: action });
              }}
              style={{
                ...chipStyle(active && !disabled, accentColor, fontSize),
                opacity: disabled ? 0.55 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              {action}
            </button>
          );
        })}
        <button
          type="button"
          data-testid="avatar-motion-ARMS_UP"
          disabled={!arms.allowed}
          title={
            arms.allowed
              ? "ARMS_UP production fit stress"
              : arms.gate.reason ?? arms.fit.reason
          }
          onClick={() => {
            if (arms.allowed) patchCanonicalAvatarDraft({ previewAction: "ARMS_UP" });
          }}
          style={{
            ...chipStyle(previewAction === "ARMS_UP" && arms.allowed, accentColor, fontSize),
            opacity: arms.allowed ? 1 : 0.55,
            cursor: arms.allowed ? "pointer" : "not-allowed",
          }}
        >
          ARMS_UP
        </button>
      </div>

      {environmentId === "LOW_LIGHT_LOUNGE_STYLE" ? (
        <div
          data-testid="avatar-lounge-lighting-law"
          style={{ fontSize: 7, color: "rgba(255,200,80,0.9)", lineHeight: 1.35 }}
        >
          LOW_LIGHT_LOUNGE_STYLE = lighting/material only · production Lounge = NO AVATARS
        </div>
      ) : null}
      {panelTargetId === "GROUP_CAM" ? (
        <div
          data-testid="avatar-group-cam-editor-only"
          style={{ fontSize: 7, color: "rgba(255,45,170,0.85)", lineHeight: 1.35 }}
        >
          GROUP_CAM = editor mannequins only · never real participants
        </div>
      ) : null}
    </div>
  );
}

function chipStyle(active: boolean, accent: string, fontSize: number): CSSProperties {
  return {
    fontSize,
    fontWeight: 800,
    padding: "4px 10px",
    borderRadius: 6,
    border: `1px solid ${active ? accent : "rgba(255,255,255,0.15)"}`,
    background: active ? `${accent}22` : "rgba(255,255,255,0.04)",
    color: active ? accent : "rgba(255,255,255,0.7)",
    cursor: "pointer",
    textTransform: "uppercase",
  };
}
