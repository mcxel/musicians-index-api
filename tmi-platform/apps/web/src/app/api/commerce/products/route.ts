/**
 * GET  /api/commerce/products?artistId=|artistSlug=  — public active catalog
 * POST /api/commerce/products — artist create
 * PATCH /api/commerce/products — artist update (body.id required)
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resolveTipArtistUserId } from "@/lib/tips/tipFulfillment";
import {
  ARTIST_COMMERCE_PRODUCT_TYPES,
  createArtistProduct,
  ensureDefaultArtistProducts,
  isArtistCommerceProductType,
  updateArtistProduct,
  type ArtistCommerceProductInput,
  type ArtistCommerceProductType,
} from "@/lib/commerce/ArtistCommerceCatalog";

async function resolveSessionArtistId(req: NextRequest): Promise<string | null> {
  const email = req.cookies.get("tmi_user_email")?.value ?? "";
  if (!email) return null;
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
    select: { id: true, role: true },
  });
  if (!user) return null;
  const role = String(user.role ?? "").toUpperCase();
  const allowed = new Set(["PERFORMER", "ARTIST", "BAND", "ADMIN", "STAFF"]);
  if (!allowed.has(role)) return null;
  return user.id;
}

async function resolveCatalogArtistId(
  artistIdParam: string,
  artistSlug: string,
): Promise<string> {
  if (artistSlug) {
    return (await resolveTipArtistUserId(artistSlug)) ?? "";
  }
  if (!artistIdParam) return "";
  const byId = await prisma.user.findUnique({
    where: { id: artistIdParam },
    select: { id: true },
  });
  if (byId) return byId.id;
  // Call sites sometimes pass a performer slug as entityId / artistId
  return (await resolveTipArtistUserId(artistIdParam)) ?? "";
}

export async function GET(req: NextRequest) {
  const artistIdParam = req.nextUrl.searchParams.get("artistId")?.trim() ?? "";
  const artistSlug = req.nextUrl.searchParams.get("artistSlug")?.trim() ?? "";
  const mine = req.nextUrl.searchParams.get("mine") === "1";
  // `seed` query kept for API compat; catalog always ensures missing default types.

  let artistId = "";
  if (mine) {
    artistId = (await resolveSessionArtistId(req)) ?? "";
    if (!artistId) {
      return NextResponse.json({ error: "Sign in as performer required" }, { status: 401 });
    }
  } else {
    artistId = await resolveCatalogArtistId(artistIdParam, artistSlug);
  }
  if (!artistId) {
    return NextResponse.json({ error: "artistId or artistSlug required" }, { status: 400 });
  }

  try {
    // Always fill missing default types (VIP / licensing / merch / shoutout / meet).
    // Idempotent by type — never invents STRIPE_PRICE_* env products.
    const products = await ensureDefaultArtistProducts(artistId);
    return NextResponse.json({ ok: true, artistId, products });
  } catch (err) {
    console.error("[commerce/products GET]", err);
    return NextResponse.json({ error: "catalog_unavailable" }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const artistId = await resolveSessionArtistId(req);
  if (!artistId) {
    return NextResponse.json({ error: "Sign in as performer required" }, { status: 401 });
  }

  let body: ArtistCommerceProductInput & { type?: string } = {} as ArtistCommerceProductInput;
  try {
    body = (await req.json()) as ArtistCommerceProductInput;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const typeRaw = String(body.type ?? "").toUpperCase();
  if (!isArtistCommerceProductType(typeRaw)) {
    return NextResponse.json(
      { error: "Invalid type", allowed: ARTIST_COMMERCE_PRODUCT_TYPES },
      { status: 400 },
    );
  }

  try {
      const product = await createArtistProduct(artistId, {
      type: typeRaw as ArtistCommerceProductType,
      title: body.title,
      description: body.description,
      priceCents: Math.round(Number(body.priceCents)),
      currency: body.currency,
      active: body.active,
      inventory: body.inventory,
      imageUrl: body.imageUrl,
    });
    return NextResponse.json({ ok: true, product });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "create_failed";
    const status = msg === "price_too_low" || msg === "title_required" ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function PATCH(req: NextRequest) {
  const artistId = await resolveSessionArtistId(req);
  if (!artistId) {
    return NextResponse.json({ error: "Sign in as performer required" }, { status: 401 });
  }

  let body: Partial<ArtistCommerceProductInput> & { id?: string; priceDollars?: number } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = (body.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const patch: Partial<ArtistCommerceProductInput> = {};
  if (body.type && isArtistCommerceProductType(String(body.type).toUpperCase())) {
    patch.type = String(body.type).toUpperCase() as ArtistCommerceProductType;
  }
  if (body.title !== undefined) patch.title = body.title;
  if (body.description !== undefined) patch.description = body.description;
  if (body.priceCents !== undefined) patch.priceCents = Math.round(Number(body.priceCents));
  else if (body.priceDollars !== undefined) {
    patch.priceCents = Math.round(Number(body.priceDollars) * 100);
  }
  if (body.currency !== undefined) patch.currency = body.currency;
  if (body.active !== undefined) patch.active = Boolean(body.active);
  if (body.inventory !== undefined) patch.inventory = body.inventory;
  if (body.imageUrl !== undefined) patch.imageUrl = body.imageUrl;

  try {
    const product = await updateArtistProduct(artistId, id, patch);
    if (!product) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, product });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "update_failed";
    const status = msg === "price_too_low" || msg === "title_required" ? 400 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
