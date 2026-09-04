/**
 * Browser helper for the canonical media upload path.
 * Small files go through the authenticated TMI API (server put).
 * Large files go browser → Blob (presigned/OIDC or handleUpload) then persist.
 */

import { VERCEL_SERVER_UPLOAD_MAX_BYTES } from "@/lib/media/blobStorage";
import { isDurablePlayableMediaUrl } from "@/lib/media/durablePlayableUrl";

export { VERCEL_SERVER_UPLOAD_MAX_BYTES };

export type CanonicalMediaUploadResult =
  | { ok: true; url: string; id: string }
  | { ok: false; error: string; status: number };

type BlobUploadCapability = {
  available?: boolean;
  mode?: "oidc-presigned" | "rw-token" | "none";
  ownerPrefix?: string;
  error?: string;
};

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_") || "upload";
}

async function persistBlobPathname(input: {
  persistVia: string;
  blobPathname: string;
  title?: string;
  extraForm?: Record<string, string>;
}): Promise<CanonicalMediaUploadResult> {
  const res = await fetch(input.persistVia, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      blobPathname: input.blobPathname,
      title: input.title,
      ...(input.extraForm ?? {}),
    }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    url?: string;
    id?: string;
    error?: string;
  };
  if (!res.ok || !data.url) {
    return {
      ok: false,
      error: data.error ?? "Upload stored but library bind failed.",
      status: res.status || 500,
    };
  }
  if (!isDurablePlayableMediaUrl(data.url) || !data.id) {
    return { ok: false, error: "Upload did not return a playable library item.", status: 503 };
  }
  return { ok: true, url: data.url, id: data.id };
}

export async function uploadCanonicalMediaFile(
  file: File,
  options?: {
    title?: string;
    persistVia?: "/api/upload/media" | "/api/media/upload";
    extraForm?: Record<string, string>;
  },
): Promise<CanonicalMediaUploadResult> {
  const persistVia = options?.persistVia ?? "/api/upload/media";
  const title = options?.title ?? file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

  if (file.size > VERCEL_SERVER_UPLOAD_MAX_BYTES) {
    const capRes = await fetch("/api/media/blob-upload", { credentials: "include" });
    const cap = (await capRes.json().catch(() => ({}))) as BlobUploadCapability;
    if (!capRes.ok || !cap.available || cap.mode === "none" || !cap.ownerPrefix) {
      return {
        ok: false,
        error:
          cap.error ??
          "This file is larger than the server upload limit. Cloud storage is not available in this environment.",
        status: capRes.status === 401 ? 401 : 503,
      };
    }

    const pathname = `${cap.ownerPrefix}/${Date.now()}-${safeFileName(file.name)}`;
    let uploadedPathname = pathname;

    if (cap.mode === "oidc-presigned") {
      const { uploadPresigned } = await import("@vercel/blob/client");
      const blob = await uploadPresigned(pathname, file, {
        access: "private",
        handleUploadUrl: "/api/media/blob-upload",
        clientPayload: JSON.stringify({ title }),
      });
      uploadedPathname = blob.pathname;
    } else {
      const { upload } = await import("@vercel/blob/client");
      const blob = await upload(pathname, file, {
        access: "private",
        handleUploadUrl: "/api/media/blob-upload",
        clientPayload: JSON.stringify({ title }),
      });
      uploadedPathname = blob.pathname;
    }

    return persistBlobPathname({
      persistVia,
      blobPathname: uploadedPathname,
      title,
      extraForm: options?.extraForm,
    });
  }

  const fd = new FormData();
  fd.append("file", file);
  fd.append("title", title);
  if (options?.extraForm) {
    for (const [k, v] of Object.entries(options.extraForm)) fd.append(k, v);
  }

  const res = await fetch(persistVia, { method: "POST", body: fd, credentials: "include" });
  const data = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    url?: string;
    id?: string;
    error?: string;
  };
  if (!res.ok || !data.url) {
    return { ok: false, error: data.error ?? "Upload failed. Track was not saved.", status: res.status || 500 };
  }
  if (!isDurablePlayableMediaUrl(data.url) || !data.id) {
    return { ok: false, error: "Upload did not return a playable library item.", status: 503 };
  }
  return { ok: true, url: data.url, id: data.id };
}
