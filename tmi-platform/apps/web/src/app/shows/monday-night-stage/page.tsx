import { redirect } from "next/navigation";

// LEGACY (2026-07-20) — superseded by /rooms/monday-stage, which has the
// real 3D venue/audience (ArenaEventShell) + live video that this prototype
// never had. Its real parts (Bebo hook/boo mechanic, MondayNightStageEngine,
// MondayNightStagePanel) were ported into the canonical route, not deleted.
// Kept as a redirect, not removed, per the Duplicate Route Convergence rule.
export default function ShowsMondayNightStageLegacyPage() {
  redirect("/rooms/monday-stage");
}
