"use client";

/**
 * UniversalDrawerBase — shared shell for all Command Center / overlay drawers.
 * Chrome (header, close, swap chips, surface) lives here.
 * Open/close + content motion come from DrawerAnimationProfile via registry.
 */

import { AnimatePresence, motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";
import {
  getDrawerAnimationProfile,
  overlayShellVariants,
  type DrawerAnimationId,
} from "@/lib/drawers/DrawerAnimationProfile";
import { useTheme } from "@/lib/design/ThemeEngine";

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
  overlayHeight = "min(78vh, 720px)",
}: UniversalDrawerBaseProps) {
  const theme = useTheme();
  const profile = getDrawerAnimationProfile(animationId, theme);
  const accent = accentColor ?? theme.tertiary;
  const shellVariants =
    mode === "overlay" ? overlayShellVariants(profile) : profile.shell;

  const shellLayout: CSSProperties =
    mode === "overlay"
      ? {
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 120,
          height: overlayHeight,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          background: theme.bgSurface || "#050510",
          borderTop: `1px solid ${accent}55`,
          boxShadow: `0 -24px 60px rgba(0,0,0,0.75), 0 0 24px ${theme.drawerGlow}22`,
          perspective: 900,
          transformOrigin: "bottom center",
          ...style,
        }
      : {
          // under_dashboard: normal flow, below the monitor grid — the
          // grid has its own fixed minHeight (CommandCenterShell) so this
          // drawer expanding never resizes it; the page/container grows and
          // scrolls instead (2026-08-05 blueprint: "Reserved Bottom Drawer
          // Dock" — monitors + MasterControlDock never move or get
          // covered). This previously used position:absolute to overlay the
          // monitors instead, which fixed the original squash bug but
          // covered the stage — no longer needed now that the parent no
          // longer height-caps/clips (verify that's still true before
          // reverting this to position:absolute again).
          position: "relative",
          width: "100%",
          minHeight: 420,
          overflow: "hidden",
          background: theme.bgSurface,
          borderTop: `1px solid ${accent}55`,
          boxShadow: `0 -16px 40px rgba(0,0,0,0.55), 0 0 24px ${theme.drawerGlow}22`,
          display: "flex",
          flexDirection: "column",
          perspective: 900,
          transformOrigin: "bottom center",
          ...style,
        };

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key={`udb-${animationId}`}
          variants={shellVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={profile.transition}
          style={shellLayout}
          role={mode === "overlay" ? "dialog" : "region"}
          aria-label={ariaLabel ?? title}
        >
          <div
            style={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: mode === "overlay" ? "10px 16px" : "8px 14px",
              background: "rgba(0,0,0,0.72)",
              borderBottom: `1px solid ${theme.primary}33`,
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: accent }}>
              {title}
            </div>
            {subtitle ? (
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{subtitle}</span>
            ) : null}
            {headerExtra}
            <div style={{ flex: 1 }} />
            <button
              type="button"
              onClick={onClose}
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
