import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await getTmiAuth();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") || auth?.user?.id;

  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        id: { startsWith: "img_" },
        metadata: { path: ["ownerId"], equals: userId },
      },
      orderBy: { id: "desc" },
    });

    const items = products.map((p) => {
      const meta = (p.metadata as Record<string, unknown>) || {};
      return {
        id: p.id,
        ownerId: meta.ownerId as string,
        title: p.name,
        imageUrl: (meta.imageUrl as string) || p.description || "",
        assetType: (meta.assetType as string) || "IMAGE",
        createdAt: (meta.uploadedAt as string) || new Date().toISOString(),
      };
    });

    return NextResponse.json({ ok: true, items, total: items.length });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* empty */
  }

  const ownerId = (typeof body.ownerId === "string" ? body.ownerId : "") || auth?.user?.id;
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : "";
  const title = typeof body.title === "string" ? body.title : "Uploaded Artwork";
  const assetType = typeof body.assetType === "string" ? body.assetType : "ARTWORK";

  if (!ownerId || !imageUrl) {
    return NextResponse.json(
      { ok: false, error: "ownerId and imageUrl required" },
      { status: 400 }
    );
  }

  try {
    const uploadedAt = new Date().toISOString();
    const product = await prisma.product.create({
      data: {
        id: `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        active: true,
        name: title,
        description: imageUrl,
        image: imageUrl,
        metadata: {
          ownerId,
          imageUrl,
          assetType,
          uploadedAt,
        },
      },
    });

    const meta = (product.metadata as Record<string, unknown>) || {};
    return NextResponse.json({
      ok: true,
      asset: {
        id: product.id,
        ownerId: meta.ownerId,
        title: product.name,
        imageUrl: meta.imageUrl,
        assetType: meta.assetType,
        createdAt: meta.uploadedAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await getTmiAuth();
  const { searchParams } = new URL(req.url);
  const assetId = searchParams.get("id");
  const requestingUserId = searchParams.get("userId") || auth?.user?.id;

  if (!assetId || !requestingUserId) {
    return NextResponse.json(
      { ok: false, error: "asset id and requesting userId required" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.product.findUnique({ where: { id: assetId } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Asset not found" }, { status: 404 });
    }

    const meta = (existing.metadata as Record<string, unknown>) || {};
    if (meta.ownerId !== requestingUserId) {
      return NextResponse.json(
        { ok: false, error: "Forbidden: You are not the owner of this image asset" },
        { status: 403 }
      );
    }

    await prisma.product.delete({ where: { id: assetId } });
    return NextResponse.json({ ok: true, deletedId: assetId });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
