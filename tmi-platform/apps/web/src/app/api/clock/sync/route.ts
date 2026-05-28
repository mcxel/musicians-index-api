import { NextResponse } from "next/server";
import { serverTimestamp } from "@/lib/engines/runtime/UniversalClockRuntime";

export const runtime = "edge";

export function GET(): NextResponse {
  return NextResponse.json(serverTimestamp(), {
    headers: { "Cache-Control": "no-store, no-cache" },
  });
}
