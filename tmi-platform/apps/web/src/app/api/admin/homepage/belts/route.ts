import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../_utils/require-admin";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json([], {
    headers: { "cache-control": "no-store" },
  });
}
