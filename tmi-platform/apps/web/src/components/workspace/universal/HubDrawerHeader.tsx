"use client";

/**
 * HubDrawerHeader — shared Hub drawer header:
 * ✕ CLOSE | TITLE | (PREV · NEXT · FULL when the drawer supports them) | HELP
 * then the one-line purpose and, when HELP is on, the inline walkthrough.
 * The walkthrough is inline (never a floating layer), so it cannot cover working controls.
 */

import { useState, type ReactNode, type RefObject } from "react";
import { hubDrawerGuide } from "@/lib/workspace/universal/hubDrawerGuides";

const HIGHLIGHT_MS = 1600;

function showControl(scope: HTMLElement | null, testId: string): boolean {
  const target = (scope ?? document).querySelector<HTMLElement>(`[data-testid="${testId}"]`);
  if (!target) return false;
  target.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
  const previous = target.style.outline;
  target.style.outline = "2px solid #FFD700";
  window.setTimeout(() => {
    target.style.outline = previous;
  }, HIGHLIGHT_MS);
  return true;
}

export const HUB_DRAWER_HEADER_BUTTON = {
  minWidth: 44,
  minHeight: 44,
  padding: "0 8px",
  borderRadius: 8,
  fontFamily: "inherit",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "0.06em",
  cursor: "pointer",
  flexShrink: 0,
} as const;

export default function HubDrawerHeader({
  drawerId,
  title,
  onClose,
  closeLabel,
  scopeRef,
  actions,
}: {
  drawerId: string;
  title?: string;
  onClose: () => void;
  closeLabel?: string;
  scopeRef?: RefObject<HTMLElement>;
  actions?: ReactNode;
}) {
  const guide = hubDrawerGuide(drawerId);
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const [missing, setMissing] = useState<string | null>(null);
  const heading = title ?? guide?.title ?? drawerId.replace(/-/g, " ").toUpperCase();

  return (
    <div
      data-testid="hub-drawer-header"
      data-hub-drawer-id={drawerId}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        padding: "8px 10px",
        background: "rgba(5,5,16,0.98)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button
          type="button"
          data-testid="hub-drawer-close"
          aria-label={closeLabel ?? `Close ${heading}`}
          onClick={onClose}
          style={{
            ...HUB_DRAWER_HEADER_BUTTON,
            border: "1px solid #FF2DAA",
            background: "rgba(255,45,170,0.12)",
            color: "#FF2DAA",
          }}
        >
          ✕ CLOSE
        </button>
        <strong
          data-testid="hub-drawer-title"
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: "0.1em",
            color: "#FFD700",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {heading}
        </strong>
        {actions}
        {guide && guide.steps.length > 0 ? (
          <button
            type="button"
            data-testid="hub-drawer-walkthrough-toggle"
            aria-expanded={walkthroughOpen}
            aria-label={walkthroughOpen ? "Hide help" : "Help: how this works"}
            onClick={() => {
              setWalkthroughOpen((open) => !open);
              setMissing(null);
            }}
            style={{
              ...HUB_DRAWER_HEADER_BUTTON,
              border: "1px solid rgba(0,229,255,0.55)",
              background: walkthroughOpen ? "rgba(0,229,255,0.18)" : "rgba(0,229,255,0.06)",
              color: "#00E5FF",
            }}
          >
            {walkthroughOpen ? "HIDE" : "HELP"}
          </button>
        ) : null}
      </div>
      {guide ? (
        <p data-testid="hub-drawer-purpose" style={{ margin: 0, fontSize: 12, lineHeight: 1.4, color: "rgba(255,255,255,0.78)" }}>
          {guide.purpose}
        </p>
      ) : null}
      {guide && walkthroughOpen ? (
        <ol data-testid="hub-drawer-walkthrough" style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
          {guide.steps.map((step, index) => (
            <li key={step.id}>
              <button
                type="button"
                data-testid={`hub-drawer-walkthrough-step-${step.id}`}
                onClick={() => setMissing(showControl(scopeRef?.current ?? null, step.targetTestId) ? null : step.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  minHeight: 44,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.14)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#fff",
                  fontFamily: "inherit",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontWeight: 900, color: "#FFD700", width: 16, flexShrink: 0 }}>{index + 1}</span>
                <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 800 }}>{step.label}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
                    {missing === step.id ? "That control is not on screen right now." : step.hint}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
