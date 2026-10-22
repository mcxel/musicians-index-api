import { NextResponse } from "next/server";

export const runtime = "edge";

export function GET(): NextResponse {
  return NextResponse.json({ t: Date.now() }, {
    headers: { "Cache-Control": "no-store, no-cache" },
  });
}
