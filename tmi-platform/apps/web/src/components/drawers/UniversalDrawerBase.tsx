"use client";

/**
 * UniversalDrawerBase — shared shell for all Command Center / overlay drawers.
 * Chrome (header, close, swap chips, surface) lives here.
 * Open/close + content motion come from DrawerAnimationProfile via registry.
 */

import { AnimatePresence, motion } from "framer-motion";
import { useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { DrawerSlotExpansionContext } from "@/lib/drawers/drawerExpansionContext";
import { useMobileGpsMonitorLayoutStore } from "@/lib/commandCenter/mobileGpsMonitorLayoutStore";
import {
  INITIAL_DRAWER_PRESENTATION,
  reduceDrawerPresentation,
  type DrawerPresentationState,
} from "@/lib/drawers/drawerPresentation";
import {
  DRAWER_OPEN_HEIGHT,
  getDrawerAnimationProfile,
  overlayShellVariants,
  type DrawerAnimationId,
} from "@/lib/drawers/DrawerAnimationProfile";
import { useTheme } from "@/lib/design/ThemeEngine";
import DrawerGuideDirector from "@/components/drawers/DrawerGuideDirector";
import type { UniversalDrawerModuleId } from "@/lib/drawers/UniversalDrawerRegistry";
import { DRAWER_COMPOSITION_LAW_ID } from "@/lib/drawers/DrawerCompositionLaw";

export interface UniversalDrawerBaseProps {
  open: boolean;
  /** Animation personality for this drawer type (not the shell). */
  animationId: DrawerAnimationId;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  /** Under-dashboard height drawer (Command Center) vs fixed bottom overlay. */
  mode?: "under_dashboard" | "overlay";
  /** Optional swap chips row (module drawers). */
  headerExtra?: ReactNode;
  accentColor?: string;
  contentKey?: string;
  ariaLabel?: string;
  style?: CSSProperties;
  overlayHeight?: string;
  /** Gate 13 — Drawer Guide coaching */
  guideDrawerId?: UniversalDrawerModuleId;
  guideUserId?: string;
  guidePersona?: string;
}

export default function UniversalDrawerBase({
  open,
  animationId,
  title,
  subtitle,
  onClose,
  children,
  mode = "under_dashboard",
  headerExtra,
  accentColor,
  contentKey,
  ariaLabel,
  style,
  overlayHeight = DRAWER_OPEN_HEIGHT,
  guideDrawerId,
  guideUserId,
  guidePersona = "fan",
}: UniversalDrawerBaseProps) {
  const theme = useTheme();
  const inSlot = useContext(DrawerSlotExpansionContext);
  const sharedPresentation = useMobileGpsMonitorLayoutStore((s) => s.drawerPresentation);
  const applySharedPresentation = useMobileGpsMonitorLayoutStore((s) => s.applyDrawerPresentation);
  const [localPresentation, setLocalPresentation] = useState<DrawerPresentationState>(INITIAL_DRAWER_PRESENTATION);
  const presentation = inSlot ? sharedPresentation : localPresentation.presentation;
  const applyPresentation = (action: "expand" | "fullscreen" | "restore" | "close" | "escape") => {
    if (inSlot) {
      const shouldClose = applySharedPresentation(action);
      if (shouldClose) onClose();
      return;
    }
    const next = reduceDrawerPresentation(localPresentation, action);
    setLocalPresentation(next.state);
    if (next.close) onClose();
  };
  const profile = getDrawerAnimationProfile(animationId, theme);
  const accent = accentColor ?? theme.tertiary;
  const shellVariants =
    presentation === "compact"
      ? mode === "overlay"
        ? overlayShellVariants(profile)
        : profile.shell
      : { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 0 } };
  const underDashRef = useRef<HTMLDivElement | null>(null);

  /** §20995-E desktop: bring under-dashboard drawers into the visible WORK band. */
  useEffect(() => {
    if (!open || mode !== "under_dashboard" || typeof window === "undefined") return;
    const node = underDashRef.current;
    if (!node) return;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => {
      node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    });
  }, [open, mode, animationId]);

  const presentationStyle: CSSProperties =
    presentation === "compact"
      ? {}
      : inSlot
        ? { maxHeight: "none", height: "100%", minHeight: 0, flex: "1 1 auto" }
        : presentation === "fullscreen"
          ? {
              position: "fixed",
              inset: 0,
              zIndex: 160,
              width: "100%",
              height: "100dvh",
              maxHeight: "none",
              minHeight: 0,
              boxSizing: "border-box",
              paddingTop: "env(safe-area-inset-top)",
              paddingBottom: "env(safe-area-inset-bottom)",
            }
          : {
              position: "fixed",
              left: "max(8px, env(safe-area-inset-left))",
              right: "max(8px, env(safe-area-inset-right))",
              bottom: "max(8px, env(safe-area-inset-bottom))",
              height: "min(88dvh, calc(100dvh - 72px))",
              maxHeight: "none",
              zIndex: 150,
            };

  const shellLayout: CSSProperties =
    mode === "overlay"
      ? {
          position: "fixed",
          left: 0,
          right: 0,
          // Sit on the screen bottom — dock floats above; no dead band under the sheet.
          bottom: 0,
          zIndex: 120,
          height: overlayHeight,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: "var(--tmi-drawer-bg, " + (theme.bgSurface || "#050510") + ")",
          borderTop: `1px solid var(--tmi-drawer-border, ${accent}55)`,
          color: "var(--tmi-drawer-text, #fff)",
          boxShadow: `0 -24px 60px rgba(0,0,0,0.75), 0 0 24px ${theme.drawerGlow}22`,
          perspective: 900,
          transformOrigin: "bottom center",
          ...presentationStyle,
          ...style,
        }
      : {
          // under_dashboard: normal flow below monitors (§20995-E bounded height).
          position: "relative",
          width: "100%",
          minHeight: DRAWER_OPEN_HEIGHT,
          maxHeight: "calc(100vh - 140px)",
          marginBottom: 0,
          overflow: "hidden",
          background: "var(--tmi-drawer-bg, " + theme.bgSurface + ")",
          borderTop: `1px solid var(--tmi-drawer-border, ${accent}55)`,
          color: "var(--tmi-drawer-text, #fff)",
          boxShadow: `0 -16px 40px rgba(0,0,0,0.55), 0 0 24px ${theme.drawerGlow}22`,
          display: "flex",
          flexDirection: "column",
          perspective: 900,
          transformOrigin: "bottom center",
          ...presentationStyle,
          ...style,
        };

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          ref={underDashRef}
          key={`udb-${animationId}`}
          variants={shellVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={profile.transition}
          style={shellLayout}
          role={mode === "overlay" ? "dialog" : "region"}
          aria-label={ariaLabel ?? title}
          data-drawer-composition-law={DRAWER_COMPOSITION_LAW_ID}
          data-drawer-guide-id={guideDrawerId ?? ""}
          data-drawer-presentation={presentation}
          className="tmi-drawer-chrome"
        >
          <div
            className="tmi-drawer-header-chrome"
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: mode === "overlay" ? "10px 16px" : "8px 14px",
              background: "var(--tmi-drawer-header, rgba(0,0,0,0.72))",
              borderBottom: `1px solid var(--tmi-drawer-border, ${theme.primary}33)`,
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: accent }}>
              {title}
            </div>
            {subtitle ? (
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{subtitle}</span>
            ) : null}
            {headerExtra}
      {guideDrawerId ? (
        <DrawerGuideDirector
          drawerId={guideDrawerId}
          open={open}
          userId={guideUserId}
          persona={guidePersona}
          accentColor={accent}
        />
      ) : null}
            <div style={{ flex: 1 }} />
            <button type="button" className="tmi-chrome-btn" data-tmi-chrome="btn" data-testid="tmi-drawer-size-expand" onClick={() => applyPresentation("expand")} style={{ minHeight: 44, minWidth: 44, borderRadius: 8, padding: "6px 10px", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>EXPAND</button>
            <button type="button" className="tmi-chrome-btn" data-tmi-chrome="btn" data-testid="tmi-drawer-size-fullscreen" onClick={() => applyPresentation("fullscreen")} style={{ minHeight: 44, minWidth: 44, borderRadius: 8, padding: "6px 10px", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>FULL SCREEN</button>
            <button type="button" className="tmi-chrome-btn" data-tmi-chrome="btn" data-testid="tmi-drawer-size-restore" onClick={() => applyPresentation("restore")} disabled={presentation === "compact"} style={{ minHeight: 44, minWidth: 44, borderRadius: 8, padding: "6px 10px", fontSize: 10, fontWeight: 800, cursor: "pointer" }}>RESTORE</button>
            <button
              type="button"
              data-testid="tmi-drawer-size-close"
              onClick={() => applyPresentation("close")}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,68,68,0.45)",
                color: "#FF6666",
                borderRadius: 8,
                padding: mode === "overlay" ? "6px 12px" : "5px 10px",
                fontSize: mode === "overlay" ? 11 : 10,
                fontWeight: 800,
                cursor: "pointer",
                letterSpacing: "0.08em",
              }}
            >
              CLOSE
            </button>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={contentKey ?? animationId}
                variants={profile.content}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={profile.transition}
                style={{
                  minHeight: mode === "overlay" ? "100%" : 260,
                  height: mode === "overlay" ? "100%" : undefined,
                  transformStyle: "preserve-3d",
                }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
