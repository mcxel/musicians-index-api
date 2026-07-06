"use client";

import type { ReactNode } from "react";

/**
 * WorkspaceTemplate — the shared frame every drawer workspace inherits:
 * Header (icon/title/status/subtitle) → Toolbar → Canvas → Status Strip → Footer Actions.
 * Individual workspaces (Notes, Lobby Wall, Memory Wall, etc.) supply content for
 * each slot; none of them invent their own header/spacing/typography anymore.
 */
export interface WorkspaceTemplateProps {
  icon: string;
  title: string;
  subtitle?: string;
  /** Small status pill in the header, e.g. "LIVE", "5 notes", "Waiting". Omit if nothing to report. */
  status?: { label: string; tone?: "neutral" | "live" | "positive" | "warning" };
  toolbar?: ReactNode;
  children: ReactNode;
  statusStrip?: ReactNode;
  footerActions?: ReactNode;
}

const TONE_COLOR: Record<NonNullable<WorkspaceTemplateProps["status"]>["tone"] & string, string> = {
  neutral: "rgba(205,229,255,0.6)",
  live: "#ff6b6b",
  positive: "#7dffb8",
  warning: "#FFD700",
};

export function WorkspaceTemplate({
  icon,
  title,
  subtitle,
  status,
  toolbar,
  children,
  statusStrip,
  footerActions,
}: WorkspaceTemplateProps) {
  const toneColor = TONE_COLOR[status?.tone ?? "neutral"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, height: "100%", minHeight: 0 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "rgba(205, 229, 255, 0.9)", fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
            <span>{icon}</span>
            <span>{title.toUpperCase()}</span>
          </div>
          {subtitle && <div style={{ fontSize: 11, color: "rgba(240, 244, 255, 0.6)" }}>{subtitle}</div>}
        </div>
        {status && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              flexShrink: 0,
              borderRadius: 999,
              border: `1px solid ${toneColor}55`,
              background: `${toneColor}14`,
              color: toneColor,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.06em",
              padding: "3px 9px",
            }}
          >
            {status.tone === "live" && (
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: toneColor, boxShadow: `0 0 6px ${toneColor}aa` }} />
            )}
            {status.label}
          </div>
        )}
      </div>

      {/* Toolbar */}
      {toolbar && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {toolbar}
        </div>
      )}

      {/* Canvas */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {children}
      </div>

      {/* Status strip */}
      {statusStrip && (
        <div style={{ fontSize: 10, color: "rgba(205,229,255,0.5)", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 8 }}>
          {statusStrip}
        </div>
      )}

      {/* Footer actions */}
      {footerActions && <div style={{ display: "flex", gap: 8 }}>{footerActions}</div>}
    </div>
  );
}

export default WorkspaceTemplate;
