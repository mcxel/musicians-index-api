import { NextResponse } from "next/server";
import { buildRuntimeStatus } from "@/program-bridge";

// GET /api/internal/runtime/status
// Polled by BerntoutGlobal_XXL_HUD every 3-10s.
// Returns the current runtime snapshot.

export async function GET() {
  const status = buildRuntimeStatus();
  return NextResponse.json(status, {
    headers: {
      "Cache-Control": "no-store",
      "X-Module-Id": "xxl",
    },
  });
}
