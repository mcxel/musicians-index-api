/**
 * POST /api/account/capabilities — persist unified account capability profiles after signup.
 */
export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server";
import { resolveCampaignOwnerId } from "@/lib/auth/resolveCampaignOwnerId";
import {
  saveBusinessPartnerProfile,
  type BusinessPartnerCapability,
  type BusinessPartnerProfile,
} from "@/lib/auth/BusinessPartnerCapabilities";
import {
  saveVenueProfessionalProfile,
  type VenueProfessionalCapability,
  type VenueProfessionalProfile,
} from "@/lib/auth/VenueProfessionalCapabilities";

export async function POST(req: NextRequest) {
  const userId = await resolveCampaignOwnerId(req);
  if (!userId) {
    return NextResponse.json({ error: "Authentication required", ok: false }, { status: 401 });
  }

  let body: {
    businessPartner?: BusinessPartnerProfile;
    venueProfessional?: VenueProfessionalProfile;
  } = {};

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body", ok: false }, { status: 400 });
  }

  const saved: Record<string, unknown> = {};

  if (body.businessPartner?.businessName && body.businessPartner.capabilities?.length) {
    saved.businessPartner = await saveBusinessPartnerProfile(userId, {
      ...body.businessPartner,
      capabilities: body.businessPartner.capabilities as BusinessPartnerCapability[],
    });
  }

  if (body.venueProfessional?.capabilities?.length) {
    saved.venueProfessional = await saveVenueProfessionalProfile(userId, {
      ...body.venueProfessional,
      capabilities: body.venueProfessional.capabilities as VenueProfessionalCapability[],
    });
  }

  if (Object.keys(saved).length === 0) {
    return NextResponse.json({ error: "No capability profile provided", ok: false }, { status: 400 });
  }

  return NextResponse.json({ ok: true, ...saved }, { status: 201 });
}
