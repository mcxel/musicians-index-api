import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { put } from "@vercel/blob";

const VALID_GENRES = ["Trap","Hip-Hop","R&B","EDM","Dance","Afrobeat","Latin","Rock","Pop","House","Drill","Reggaeton","Other"];

async function parseBody(req: NextRequest): Promise<{ fields: Record<string, string>; file?: File }> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("multipart/form-data") || ct.includes("application/x-www-form-urlencoded")) {
    const fd = await req.formData();
    const out: Record<string, string> = {};
    let file: File | undefined;
    fd.forEach((v, k) => {
      if (typeof v === "string") {
        out[k] = v;
      } else if (typeof v === "object" && v !== null && "name" in v) {
        file = v as unknown as File;
      }
    });
    return { fields: out, file };
  }
  try { return { fields: (await req.json()) as Record<string, string> }; } catch { return { fields: {} }; }
}

export async function POST(req: NextRequest) {
  const producerId = req.cookies.get("tmi_session_id")?.value ?? "anonymous";

  if (producerId === "anonymous") {
    return NextResponse.json({ ok: false, error: "Unauthorized. Please log in to submit beats." }, { status: 401 });
  }

  const { fields: body, file } = await parseBody(req);

  const title    = (body.title ?? "").trim();
  const genre    = VALID_GENRES.includes(body.genre) ? body.genre : "Other";
  const bpm      = Math.min(Math.max(Math.floor(Number(body.bpm ?? 120)), 60), 220);
  const key      = body.key || null;
  const tags     = (body.tags ?? "").split(",").map((t: string) => t.trim()).filter(Boolean);
  const basicPrice     = Math.floor(Number(body.basicPrice     ?? 2999));
  const premiumPrice   = Math.floor(Number(body.premiumPrice   ?? 7999));
  const exclusivePrice = body.exclusivePrice ? Math.floor(Number(body.exclusivePrice)) : null;
  const producerName   = body.producerName || null;
  const slug           = `beat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  if (!title) {
    return NextResponse.json({ ok: false, error: "title is required" }, { status: 400 });
  }

  // Upload audio file to Vercel Blob if provided
  let previewUrl = body.previewUrl || body.audioUrl || body.fileUrl || "pending";
  if (file && file.size > 0) {
    try {
      const blob = await put(`beats/${producerId}/${slug}-${file.name}`, file, {
        access: "public",
        addRandomSuffix: false,
      });
      previewUrl = blob.url;
    } catch {
      // Blob upload failed — mark as pending so the record is valid
      previewUrl = "pending";
    }
  }

  const taggedUrl = body.taggedUrl || previewUrl;

  const beat = await prisma.beat.create({
    data: {
      producerId,
      slug,
      title,
      genre,
      bpm,
      key,
      tags,
      previewUrl,
      taggedUrl,
      basicPrice,
      premiumPrice,
      exclusivePrice,
      producerName,
      status: "draft",
      moderationStatus: "PENDING",
      adminSubmitted: false,
    },
  });

  return NextResponse.json({ ok: true, beat }, { status: 201 });
}
