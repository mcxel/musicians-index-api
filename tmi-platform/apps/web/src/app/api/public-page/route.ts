import { randomUUID } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import prisma from "@/lib/prisma";
import { handlePublicPageRequest, type PublicPageHttpActor } from "@/lib/publicPage/publicPageHttp";
import { createPublicPagePersistence } from "@/lib/publicPage/publicPagePersistence";
import { createPrismaPublicPageStore } from "@/lib/publicPage/publicPagePrismaStore";

export const dynamic = "force-dynamic";

function persistence() {
  return createPublicPagePersistence(createPrismaPublicPageStore(prisma), () => randomUUID());
}

async function actor(): Promise<PublicPageHttpActor | null> {
  const auth = await getTmiAuth();
  if (!auth?.user?.id) return null;
  return { userId: auth.user.id, role: auth.user.role };
}

export async function GET(req: NextRequest) {
  const result = await handlePublicPageRequest(persistence(), {
    method: "GET",
    actor: await actor(),
    searchParams: req.nextUrl.searchParams,
    body: null,
  });
  return NextResponse.json(result.body, { status: result.status });
}

export async function POST(req: NextRequest) {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    body = null;
  }
  const result = await handlePublicPageRequest(persistence(), {
    method: "POST",
    actor: await actor(),
    searchParams: req.nextUrl.searchParams,
    body,
  });
  return NextResponse.json(result.body, { status: result.status });
}
