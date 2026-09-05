/**
 * GET/PUT /api/booking/profile — canonical booking profile (one store, no duplicate DB).
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getOrCreateBookingProfile,
  upsertBookingProfile,
  type BookingProfile,
  type LookingForRole,
  type PerformanceType,
} from "@/lib/booking/BookingProfileStore";

export const dynamic = "force-dynamic";

function parseEntity(
  searchParams: URLSearchParams,
  body?: Partial<BookingProfile>,
): { entityType: "performer" | "venue"; entityId: string } | null {
  const entityType = (body?.entityType ?? searchParams.get("entityType") ?? "performer") as
    | "performer"
    | "venue";
  const entityId = (body?.entityId ?? searchParams.get("entityId") ?? "").trim();
  if (!entityId) return null;
  if (entityType !== "performer" && entityType !== "venue") return null;
  return { entityType, entityId };
}

export async function GET(req: NextRequest) {
  const parsed = parseEntity(req.nextUrl.searchParams);
  if (!parsed) {
    return NextResponse.json({ error: "entityId required" }, { status: 400 });
  }
  const profile = getOrCreateBookingProfile(parsed.entityType, parsed.entityId);
  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest) {
  let body: Partial<BookingProfile>;
  try {
    body = (await req.json()) as Partial<BookingProfile>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = parseEntity(req.nextUrl.searchParams, body);
  if (!parsed) {
    return NextResponse.json({ error: "entityId required" }, { status: 400 });
  }

  const categories = Array.isArray(body.categories)
    ? (body.categories.filter(Boolean) as PerformanceType[])
    : undefined;
  const lookingFor = Array.isArray(body.lookingFor)
    ? (body.lookingFor.filter(Boolean) as LookingForRole[])
    : undefined;

  const profile = upsertBookingProfile({
    entityId: parsed.entityId,
    entityType: parsed.entityType,
    bookMeEnabled: body.bookMeEnabled,
    categories,
    rateMinCents: typeof body.rateMinCents === "number" ? body.rateMinCents : undefined,
    rateMaxCents: typeof body.rateMaxCents === "number" ? body.rateMaxCents : undefined,
    travelRadiusMiles:
      typeof body.travelRadiusMiles === "number" ? body.travelRadiusMiles : undefined,
    publicCity: typeof body.publicCity === "string" ? body.publicCity : undefined,
    publicRegion: typeof body.publicRegion === "string" ? body.publicRegion : undefined,
    availableTonight: body.availableTonight,
    availableThisWeekend: body.availableThisWeekend,
    virtualAvailable: body.virtualAvailable,
    lookingFor,
    notes: typeof body.notes === "string" ? body.notes : undefined,
  });

  return NextResponse.json({ profile });
}
