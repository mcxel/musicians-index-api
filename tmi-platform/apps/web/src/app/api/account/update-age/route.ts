import { NextResponse, type NextRequest } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import prisma from "@/lib/prisma";
import { ageYearsFromDateOfBirth } from "@/lib/trustSafety/YouthSocialGuard";

export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { dateOfBirth?: string; ageYears?: number };
    let dob: Date | null = null;
    let age: number | null = null;

    if (body.dateOfBirth) {
      const parsed = new Date(body.dateOfBirth);
      if (!isNaN(parsed.getTime())) {
        dob = parsed;
        age = ageYearsFromDateOfBirth(parsed);
      }
    } else if (typeof body.ageYears === "number" && body.ageYears >= 13) {
      age = Math.floor(body.ageYears);
    }

    if (age == null || age < 13) {
      return NextResponse.json({ ok: false, error: "Valid date of birth required (minimum age 13)." }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        dateOfBirth: dob ?? undefined,
        age: age,
      },
    });

    return NextResponse.json({
      ok: true,
      ageYears: age,
      message: "Canonical account age updated and persisted.",
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to update account age." }, { status: 500 });
  }
}
