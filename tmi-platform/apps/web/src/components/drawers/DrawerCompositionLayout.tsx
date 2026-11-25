"use client";

/**
 * DrawerCompositionLayout — enforces §11335–§11350 zone order in the DOM.
 * Slots omitted when unused (do not manufacture Preview or Text zones).
 *
 * Order locked:
 * PREVIEW → TEXT_DIALOGUE → CONTENT → INSTRUMENTS → SETTINGS → ACTIONS
 */

import type { CSSProperties, ReactNode } from "react";
import { DRAWER_COMPOSITION_LAW_ID } from "@/lib/drawers/DrawerCompositionLaw";
import { DRAWER_LIVE_PREVIEW_BINDING_LAW_ID } from "@/lib/drawers/DrawerLivePreviewBindingLaw";

export interface DrawerCompositionLayoutProps {
  moduleId?: string;
  preview?: ReactNode;
  /** Count of primary preview windows inside `preview` (for cert data attrs). */
  previewCount?: number;
  textDialogue?: ReactNode;
  content?: ReactNode;
  instruments?: ReactNode;
  settings?: ReactNode;
  actions?: ReactNode;
  /** messaging | yopho | none */
  exception?: "none" | "messaging" | "yopho";
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}

export default function DrawerCompositionLayout({
  moduleId,
  preview,
  previewCount,
  textDialogue,
  content,
  instruments,
  settings,
  actions,
  exception = "none",
  style,
  className,
  children,
}: DrawerCompositionLayoutProps) {
  const resolvedPreviewCount =
    previewCount ?? (preview ? 1 : 0);
  const hasText = Boolean(textDialogue);

  return (
    <div
      className={className}
      data-drawer-composition-law={DRAWER_COMPOSITION_LAW_ID}
      data-live-preview-binding={DRAWER_LIVE_PREVIEW_BINDING_LAW_ID}
      data-drawer-module={moduleId ?? ""}
      data-drawer-composition-exception={exception}
      data-preview-count={resolvedPreviewCount}
      data-text-dialogue-required={hasText ? "1" : "0"}
      data-testid="drawer-composition-layout"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: "100%",
        minWidth: 0,
        ...style,
      }}
    >
      {preview ? (
        <section
          data-drawer-zone="PREVIEW"
          data-testid="drawer-zone-preview"
          aria-label="Preview"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
            minWidth: 0,
          }}
        >
          {preview}
        </section>
      ) : null}

      {textDialogue ? (
        <section
          data-drawer-zone="TEXT_DIALOGUE"
          data-testid="drawer-zone-text-dialogue"
          aria-label="Text dialogue"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            width: "100%",
            minWidth: 0,
            // Grow with content; never cover the preview zone above.
            flexShrink: 0,
          }}
        >
          {textDialogue}
        </section>
      ) : null}

      {content ? (
        <section data-drawer-zone="CONTENT" data-testid="drawer-zone-content" aria-label="Content">
          {content}
        </section>
      ) : null}

      {instruments ? (
        <section
          data-drawer-zone="INSTRUMENTS"
          data-testid="drawer-zone-instruments"
          aria-label="Instruments"
        >
          {instruments}
        </section>
      ) : null}

      {settings ? (
        <section data-drawer-zone="SETTINGS" data-testid="drawer-zone-settings" aria-label="Settings">
          {settings}
        </section>
      ) : null}

      {actions ? (
        <section data-drawer-zone="ACTIONS" data-testid="drawer-zone-actions" aria-label="Actions">
          {actions}
        </section>
      ) : null}

      {/* Escape hatch for exception layouts (YoPho / Messaging) that manage their own order. */}
      {children}
    </div>
  );
}
