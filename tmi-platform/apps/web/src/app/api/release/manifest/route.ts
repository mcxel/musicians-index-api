import { NextResponse } from "next/server";
import { CANONICAL_RELEASE_MANIFEST } from "@/lib/system/TmiReleaseMigrationAuthority";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(CANONICAL_RELEASE_MANIFEST, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
