export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { issueSignedToken } from "@vercel/blob";
import {
  handleUpload,
  handleUploadPresigned,
  type HandleUploadBody,
  type HandleUploadPresignedBody,
} from "@vercel/blob/client";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import {
  blobClientUploadMode,
  blobOwnerPrefix,
  isBlobStorageAvailable,
  isSafeBlobPathname,
} from "@/lib/media/blobStorage";

const ALLOWED_CONTENT_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
  "audio/mp4",
  "audio/aac",
  "audio/flac",
  "audio/x-flac",
  "audio/webm",
  "audio/x-m4a",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/ogg",
];

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;

export async function GET() {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ error: "Sign in to upload.", available: false, mode: "none" }, { status: 401 });
  }
  const mode = blobClientUploadMode();
  return NextResponse.json({
    available: isBlobStorageAvailable(),
    mode,
    ownerPrefix: blobOwnerPrefix(auth.user.id),
  });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const mode = blobClientUploadMode();
  if (mode === "none") {
    return NextResponse.json(
      { error: "Cloud storage is not available in this environment." },
      { status: 503 },
    );
  }

  const body = (await request.json()) as HandleUploadBody | HandleUploadPresignedBody;

  try {
    if (mode === "oidc-presigned") {
      const jsonResponse = await handleUploadPresigned({
        body: body as HandleUploadPresignedBody,
        request,
        getSignedToken: async (pathname) => {
          const auth = await getTmiAuth();
          if (!auth) throw new Error("Not authorized");
          const owned =
            isSafeBlobPathname(pathname) && pathname.startsWith(`${blobOwnerPrefix(auth.user.id)}/`);
          if (!owned) throw new Error("Invalid upload path");
          const token = await issueSignedToken({
            pathname,
            operations: ["put"],
            allowedContentTypes: ALLOWED_CONTENT_TYPES,
            maximumSizeInBytes: MAX_UPLOAD_BYTES,
            validUntil: Date.now() + 60 * 60 * 1000,
          });
          return {
            token,
            urlOptions: {
              allowedContentTypes: ALLOWED_CONTENT_TYPES,
              maximumSizeInBytes: MAX_UPLOAD_BYTES,
              addRandomSuffix: true,
              allowOverwrite: false,
              validUntil: Date.now() + 15 * 60 * 1000,
            },
          };
        },
      });
      return NextResponse.json(jsonResponse);
    }

    const jsonResponse = await handleUpload({
      body: body as HandleUploadBody,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const auth = await getTmiAuth();
        if (!auth) throw new Error("Not authorized");
        const owned =
          isSafeBlobPathname(pathname) && pathname.startsWith(`${blobOwnerPrefix(auth.user.id)}/`);
        if (!owned) throw new Error("Invalid upload path");
        return {
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          addRandomSuffix: true,
          allowOverwrite: false,
          tokenPayload: JSON.stringify({ userId: auth.user.id }),
        };
      },
      onUploadCompleted: async () => {
        // Canonical Song bind happens via authenticated persist after the client upload.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload token failed";
    const status = message === "Not authorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
