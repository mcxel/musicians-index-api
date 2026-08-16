import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await getTmiAuth();
  const { searchParams } = new URL(req.url);
  const authorId = searchParams.get("authorId") || undefined;

  try {
    const products = await prisma.product.findMany({
      where: {
        id: { startsWith: "mag_" },
        ...(authorId ? { metadata: { path: ["authorId"], equals: authorId } } : {}),
      },
      orderBy: { id: "desc" },
    });

    const issues = products.map((p) => {
      const meta = (p.metadata as Record<string, unknown>) || {};
      return {
        id: p.id,
        authorId: (meta.authorId as string) || "editorial-team",
        issueTitle: p.name,
        issueNumber: (meta.issueNumber as number) || 1,
        coverUrl: p.image || p.description || "",
        articleTitle: (meta.articleTitle as string) || p.name,
        content: p.description || "",
        publishedAt: (meta.publishedAt as string) || new Date().toISOString(),
      };
    });

    return NextResponse.json({ ok: true, issues, total: issues.length });
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

  const authorId = (typeof body.authorId === "string" ? body.authorId : "") || auth?.user?.id;
  const issueTitle = typeof body.issueTitle === "string" ? body.issueTitle : "TMI Magazine Vol. 1";
  const issueNumber = typeof body.issueNumber === "number" ? body.issueNumber : 1;
  const coverUrl = typeof body.coverUrl === "string" ? body.coverUrl : "";
  const articleTitle = typeof body.articleTitle === "string" ? body.articleTitle : issueTitle;
  const content = typeof body.content === "string" ? body.content : "";

  if (!authorId || !issueTitle) {
    return NextResponse.json(
      { ok: false, error: "authorId and issueTitle required" },
      { status: 400 }
    );
  }

  try {
    const publishedAt = new Date().toISOString();
    const product = await prisma.product.create({
      data: {
        id: `mag_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        active: true,
        name: issueTitle,
        description: content || issueTitle,
        image: coverUrl,
        metadata: {
          authorId,
          issueNumber,
          articleTitle,
          coverUrl,
          publishedAt,
        },
      },
    });

    const meta = (product.metadata as Record<string, unknown>) || {};
    return NextResponse.json({
      ok: true,
      issue: {
        id: product.id,
        authorId: meta.authorId,
        issueTitle: product.name,
        issueNumber: meta.issueNumber,
        coverUrl: product.image,
        articleTitle: meta.articleTitle,
        publishedAt: meta.publishedAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await getTmiAuth();
  const { searchParams } = new URL(req.url);
  const issueId = searchParams.get("id");
  const requestingUserId = searchParams.get("userId") || auth?.user?.id;

  if (!issueId || !requestingUserId) {
    return NextResponse.json(
      { ok: false, error: "issue id and requesting userId required" },
      { status: 400 }
    );
  }

  try {
    const existing = await prisma.product.findUnique({ where: { id: issueId } });
    if (!existing) {
      return NextResponse.json({ ok: false, error: "Magazine issue not found" }, { status: 404 });
    }

    const meta = (existing.metadata as Record<string, unknown>) || {};
    if (meta.authorId !== requestingUserId) {
      return NextResponse.json(
        { ok: false, error: "Forbidden: You are not the author of this magazine issue" },
        { status: 403 }
      );
    }

    await prisma.product.delete({ where: { id: issueId } });
    return NextResponse.json({ ok: true, deletedId: issueId });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
