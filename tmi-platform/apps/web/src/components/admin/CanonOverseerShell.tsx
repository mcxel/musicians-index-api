"use client";

/**
 * CanonOverseerShell — compatibility re-export.
 *
 * Ground-up layout lives in OverseerFlightDeck (2026-07-29 Marcel mandate).
 * Prior patch attempts on this file (Quick Dock congestion, vh squash, fake alert
 * pills) are superseded. Prefer importing OverseerFlightDeck directly for new work.
 */

export { default } from "@/components/admin/OverseerFlightDeck";
export type {
  ShellDockButton,
  ShellPanel,
  ShellWorkspaceDefinition,
} from "@/components/admin/OverseerFlightDeck";
