import { NextResponse, type NextRequest } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import prisma from "@/lib/prisma";
import {
  evaluateAgeVerification,
  parseDateOfBirthInput,
  PLATFORM_MIN_AGE,
} from "@/lib/messaging/AgeVerification";
import { getMessagingEligibility } from "@/lib/messaging/MessagingEligibility";

export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth?.user?.id) {
    return NextResponse.json({ ok: false, error: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      dateOfBirth?: string;
      dob?: string;
      ageYears?: number;
    };
    const dobRaw = body.dateOfBirth ?? body.dob;
    let dob: Date | null = null;
    let age: number | null = null;

    if (dobRaw) {
      dob = parseDateOfBirthInput(dobRaw);
      if (dob) {
        const evalResult = evaluateAgeVerification({ dateOfBirth: dob });
        age = evalResult.ageYears;
      }
    } else if (typeof body.ageYears === "number" && body.ageYears >= PLATFORM_MIN_AGE) {
      age = Math.floor(body.ageYears);
    }

    const result = evaluateAgeVerification({ dateOfBirth: dob, ageYears: age });

    if (result.rejected) {
      return NextResponse.json(
        {
          ok: false,
          error: `You must be ${PLATFORM_MIN_AGE} or older.`,
          code: "AGE_RESTRICTED",
          ageStatus: result.status,
          ageYears: result.ageYears,
        },
        { status: 403 },
      );
    }

    if (!result.eligibleForMessagingAge || age == null) {
      return NextResponse.json(
        {
          ok: false,
          error: "Valid date of birth required.",
          code: "AGE_VERIFICATION_REQUIRED",
          ageStatus: result.status,
        },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        dateOfBirth: dob ?? undefined,
        age,
        isMinor: age < 18,
      },
    });

    const eligibility = await getMessagingEligibility(auth.user.id);
    return NextResponse.json({
      ok: true,
      ageYears: age,
      ageStatus: result.status,
      eligibility,
      message: "Age verification saved.",
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to update account age." }, { status: 500 });
  }
}
