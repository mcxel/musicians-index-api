/**
 * YoPho card export — still (PNG) via CaptureEngine/html2canvas,
 * motion (WebM) via canvas + MediaRecorder. Honest formats only (Rule 20).
 */

import { snapElement } from "@/lib/capture/CaptureEngine";
import { exportSizeForFormat, type YoPhoFormat } from "./YoPhoFormatAuthority";

export type YoPhoStillFormat = "image/png" | "image/jpeg" | "image/webp";

export interface YoPhoStillExportResult {
  ok: boolean;
  blob?: Blob;
  mime: YoPhoStillFormat;
  filename: string;
  error?: string;
}

export interface YoPhoMotionExportResult {
  ok: boolean;
  blob?: Blob;
  mime: string;
  filename: string;
  /** Always true today — browser encode is WebM without ffmpeg */
  webmOnly: boolean;
  error?: string;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4_000);
}

function slugify(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "").slice(0, 48) || "yopho-card";
}

export async function exportYoPhoStill(
  element: HTMLElement,
  opts: { displayName: string; format?: YoPhoStillFormat } = { displayName: "card" },
): Promise<YoPhoStillExportResult> {
  const format = opts.format ?? "image/png";
  const base = slugify(opts.displayName);
  const ext = format === "image/png" ? "png" : format === "image/webp" ? "webp" : "jpg";
  const filename = `tmi-yopho-${base}.${ext}`;

  try {
    const snap = await snapElement(element, 2);
    const res = await fetch(snap.dataUrl);
    // snapElement returns JPEG dataUrl — re-encode to requested format when possible
    const img = await createImageBitmap(await res.blob());
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { ok: false, mime: format, filename, error: "Canvas unavailable" };
    ctx.drawImage(img, 0, 0);
    img.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, format, format === "image/jpeg" ? 0.92 : 0.95),
    );
    if (!blob) return { ok: false, mime: format, filename, error: "Still encode failed" };
    downloadBlob(blob, filename);
    return { ok: true, blob, mime: format, filename };
  } catch (err) {
    return {
      ok: false,
      mime: format,
      filename,
      error: err instanceof Error ? err.message : "Still export failed",
    };
  }
}

function pickRecorderMime(): { mime: string; ext: string } {
  if (typeof MediaRecorder === "undefined") {
    return { mime: "", ext: "webm" };
  }
  const candidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) {
      const ext = mime.includes("mp4") ? "mp4" : "webm";
      return { mime, ext };
    }
  }
  return { mime: "", ext: "webm" };
}

/**
 * ~4s motion export: ken-burns + foil shimmer drawn on canvas from a still snapshot.
 * Browser MediaRecorder typically yields WebM (not MP4) — label honestly.
 */
export async function exportYoPhoMotion(
  element: HTMLElement,
  opts: { displayName: string; durationMs?: number } = { displayName: "card" },
): Promise<YoPhoMotionExportResult> {
  const durationMs = opts.durationMs ?? 4000;
  const base = slugify(opts.displayName);
  const { mime, ext } = pickRecorderMime();
  const filename = `tmi-yopho-${base}.${ext}`;
  const webmOnly = ext === "webm";

  if (!mime || typeof MediaRecorder === "undefined") {
    return {
      ok: false,
      mime: "video/webm",
      filename,
      webmOnly: true,
      error: "Video recording not supported in this browser",
    };
  }

  try {
    const snap = await snapElement(element, 2);
    const res = await fetch(snap.dataUrl);
    const bitmap = await createImageBitmap(await res.blob());

    const w = Math.min(bitmap.width, 720);
    const h = Math.round((bitmap.height / bitmap.width) * w);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return { ok: false, mime, filename, webmOnly, error: "Canvas unavailable" };
    }

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 2_500_000 });
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    const done = new Promise<Blob>((resolve, reject) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: mime }));
      recorder.onerror = () => reject(new Error("MediaRecorder error"));
    });

    recorder.start(100);
    const start = performance.now();

    await new Promise<void>((resolveFrame) => {
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        // Ken Burns: slow zoom + pan
        const scale = 1 + t * 0.08;
        const ox = Math.sin(t * Math.PI * 2) * 8;
        const oy = Math.cos(t * Math.PI * 1.5) * 6;
        ctx.fillStyle = "#050510";
        ctx.fillRect(0, 0, w, h);
        ctx.save();
        ctx.translate(w / 2 + ox, h / 2 + oy);
        ctx.scale(scale, scale);
        ctx.drawImage(bitmap, -w / 2, -h / 2, w, h);
        ctx.restore();

        // Foil / neon shimmer sweep
        const sweep = (Math.sin(t * Math.PI * 4) + 1) / 2;
        const grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(Math.max(0, sweep - 0.15), "rgba(0,229,255,0)");
        grad.addColorStop(sweep, "rgba(255,45,170,0.22)");
        grad.addColorStop(Math.min(1, sweep + 0.15), "rgba(255,215,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Light-leak edge pulse
        ctx.fillStyle = `rgba(255,215,0,${0.08 + 0.1 * Math.sin(t * Math.PI * 3)})`;
        ctx.fillRect(0, 0, w * 0.08, h);

        if (t < 1) requestAnimationFrame(tick);
        else resolveFrame();
      };
      requestAnimationFrame(tick);
    });

    recorder.stop();
    stream.getTracks().forEach((tr) => tr.stop());
    bitmap.close();

    const blob = await done;
    if (!blob.size) {
      return { ok: false, mime, filename, webmOnly, error: "Empty video — try again" };
    }
    downloadBlob(blob, filename);
    return { ok: true, blob, mime, filename, webmOnly };
  } catch (err) {
    return {
      ok: false,
      mime: mime || "video/webm",
      filename,
      webmOnly: true,
      error: err instanceof Error ? err.message : "Motion export failed",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Dual-format export (§5574, §5607) — ONE YoPho, BOTH geometries, reusable blobs
// ─────────────────────────────────────────────────────────────────────────────

export interface YoPhoFormatRenderResult {
  ok: boolean;
  format: YoPhoFormat;
  blob?: Blob;
  mime: YoPhoStillFormat;
  width: number;
  height: number;
  error?: string;
}

/**
 * Render the visible YoPho element into a canonical-format still blob WITHOUT
 * auto-downloading. The blob is a reusable derivative (§5604) — it can be saved
 * to the creator media authority (§5605) or downloaded. Returns the canonical
 * target pixel size for the format (§5561).
 *
 * NOTE: the source element is rendered at its current on-screen composition;
 * the caller is responsible for presenting the document in the target format
 * (YoPhoFormatAuthority.presentDocumentInFormat) before calling, so the render
 * matches the intended geometry (no blind crop — §5576). This helper scales the
 * captured pixels to the canonical export size.
 */
export async function renderYoPhoFormatBlob(
  element: HTMLElement,
  format: YoPhoFormat,
  opts: { mime?: YoPhoStillFormat } = {},
): Promise<YoPhoFormatRenderResult> {
  const mime = opts.mime ?? "image/png";
  const { width, height } = exportSizeForFormat(format);
  try {
    const snap = await snapElement(element, 2);
    const res = await fetch(snap.dataUrl);
    const img = await createImageBitmap(await res.blob());
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      img.close();
      return { ok: false, format, mime, width, height, error: "Canvas unavailable" };
    }
    // Scale the captured composition to the canonical export rect.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);
    img.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mime, mime === "image/jpeg" ? 0.92 : 0.95),
    );
    if (!blob) return { ok: false, format, mime, width, height, error: "Encode failed" };
    return { ok: true, format, blob, mime, width, height };
  } catch (err) {
    return {
      ok: false,
      format,
      mime,
      width,
      height,
      error: err instanceof Error ? err.message : "Format render failed",
    };
  }
}

export interface YoPhoDualRenderResult {
  ok: boolean;
  tradingCard: YoPhoFormatRenderResult;
  albumCover: YoPhoFormatRenderResult;
  error?: string;
}

/**
 * Render BOTH canonical geometries for one YoPho (§5574 dual-export). The two
 * results are derivatives of the SAME YoPho identity (§5607) — not two cards.
 * Callers provide the already-formatted elements for each geometry.
 */
export async function renderYoPhoDualFormatBlobs(input: {
  tradingCardElement: HTMLElement;
  albumCoverElement: HTMLElement;
  mime?: YoPhoStillFormat;
}): Promise<YoPhoDualRenderResult> {
  const tradingCard = await renderYoPhoFormatBlob(input.tradingCardElement, "TRADING_CARD", {
    mime: input.mime,
  });
  const albumCover = await renderYoPhoFormatBlob(input.albumCoverElement, "ALBUM_COVER", {
    mime: input.mime,
  });
  return {
    ok: tradingCard.ok && albumCover.ok,
    tradingCard,
    albumCover,
    error: tradingCard.error ?? albumCover.error,
  };
}
