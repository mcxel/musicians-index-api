import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../_utils/require-admin";

const defaultSettings = {
  previewAt: null,
  automation: {
    enabled: false,
    logResolutions: false,
  },
  surfaceThemes: [],
};

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  return NextResponse.json(defaultSettings, {
    headers: { "cache-control": "no-store" },
  });
}
