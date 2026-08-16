import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await getTmiAuth();
  const { searchParams } = new URL(req.url);
  const sellerId = searchParams.get("sellerId") || undefined;

  try {
    const products = await prisma.product.findMany({
      where: {
        id: { startsWith: "com_" },
        ...(sellerId ? { metadata: { path: ["sellerId"], equals: sellerId } } : {}),
      },
      orderBy: { id: "desc" },
    });

    const items = products.map((p) => {
      const meta = (p.metadata as Record<string, unknown>) || {};
      return {
        id: p.id,
        sellerId: (meta.sellerId as string) || "tmi-platform",
        name: p.name,
        description: p.description || "",
        priceCoins: (meta.priceCoins as number) || 100,
        imageUrl: p.image || "",
        itemType: (meta.itemType as string) || "MERCH",
        createdAt: (meta.createdAt as string) || new Date().toISOString(),
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

  const action = (typeof body.action === "string" ? body.action : "create-product");

  if (action === "create-product") {
    const sellerId = (typeof body.sellerId === "string" ? body.sellerId : "") || auth?.user?.id;
    const name = typeof body.name === "string" ? body.name : "TMI Official Merch";
    const description = typeof body.description === "string" ? body.description : "";
    const priceCoins = typeof body.priceCoins === "number" ? body.priceCoins : 100;
    const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl : "";
    const itemType = typeof body.itemType === "string" ? body.itemType : "MERCH";

    if (!sellerId || !name) {
      return NextResponse.json(
        { ok: false, error: "sellerId and name required" },
        { status: 400 }
      );
    }

    try {
      const createdAt = new Date().toISOString();
      const product = await prisma.product.create({
        data: {
          id: `com_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          active: true,
          name,
          description,
          image: imageUrl,
          metadata: {
            sellerId,
            priceCoins,
            itemType,
            createdAt,
          },
        },
      });

      const meta = (product.metadata as Record<string, unknown>) || {};
      return NextResponse.json({
        ok: true,
        product: {
          id: product.id,
          sellerId: meta.sellerId,
          name: product.name,
          priceCoins: meta.priceCoins,
          itemType: meta.itemType,
          createdAt: meta.createdAt,
        },
      });
    } catch (err: any) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
  }

  if (action === "checkout") {
    const buyerId = (typeof body.buyerId === "string" ? body.buyerId : "") || auth?.user?.id;
    const productId = typeof body.productId === "string" ? body.productId : "";

    if (!buyerId || !productId) {
      return NextResponse.json(
        { ok: false, error: "buyerId and productId required" },
        { status: 400 }
      );
    }

    try {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
      }

      const meta = (product.metadata as Record<string, unknown>) || {};
      const priceCoins = (meta.priceCoins as number) || 100;

      const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      return NextResponse.json({
        ok: true,
        order: {
          id: orderId,
          buyerId,
          productId,
          productName: product.name,
          priceCoins,
          status: "COMPLETED",
          completedAt: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
}

export async function DELETE(req: NextRequest) {
  const auth = await getTmiAuth();
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("id");
  const requestingUserId = searchParams.get("userId") || auth?.user?.id;

  if (!productId || !requestingUserId) {
    return NextResponse.json(
      { ok: false, error: "product id and requesting userId required" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
    }

    const meta = (existing.metadata as Record<string, unknown>) || {};
    if (meta.sellerId !== requestingUserId) {
      return NextResponse.json(
        { ok: false, error: "Forbidden: You are not the seller of this product" },
        { status: 403 }
      );
    }

    await prisma.product.delete({ where: { id: productId } });
    return NextResponse.json({ ok: true, deletedId: productId });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
