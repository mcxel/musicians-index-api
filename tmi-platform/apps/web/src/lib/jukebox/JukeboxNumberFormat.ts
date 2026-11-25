/**
 * JukeboxNumberFormat — client-safe pure display/parse helpers (§6647/§6648).
 *
 * NO Prisma. NO server-only. Safe for HUD / venue / lounge client bundles.
 * Durable allocation authority lives in JukeboxNumberAuthority.ts (server).
 */

/** §6647/§6648 — zero-padded MIN 3-digit display; grows naturally past 999. */
export function formatJukeboxNumber(n: number): string {
  return String(Math.max(0, Math.floor(n))).padStart(3, "0");
}

/** Normalize a user-entered lookup ("#015", "15", " 015 ") to a number or null. */
export function parseJukeboxNumber(input: string): number | null {
  const cleaned = input.trim().replace(/^#/, "").trim();
  if (!/^\d+$/.test(cleaned)) return null;
  const n = parseInt(cleaned, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
