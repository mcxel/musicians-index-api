/**
 * SecureMediaIngestGate — deterministic allowlist + quarantine stages.
 * Guardian may observe; this gate fails closed. No raw quarantine → runtime.
 */

export type IngestKind =
  | "REFERENCE_IMAGE"
  | "AUDIO"
  | "VIDEO"
  | "MODEL_3D"
  | "YOPHO_ASSET"
  | "BROADCAST_GRAPHICS_REFERENCE";

export type QuarantineStage =
  | "EDGE_RECEIPT"
  | "QUARANTINE_1"
  | "TYPE_VALIDATED"
  | "MALWARE_SCAN"
  | "SANITIZED"
  | "QUARANTINE_2"
  | "HASHED"
  | "APPROVED_STORAGE"
  | "REJECTED"
  | "BLOCKED_SCANNER_UNAVAILABLE";

const IMAGE_EXT = new Set([".jpg", ".jpeg"]);
const AUDIO_EXT = new Set([".mp3", ".wav", ".aiff", ".aif", ".flac"]);
const VIDEO_EXT = new Set([".mp4", ".mov"]);

const IMAGE_MIME = new Set(["image/jpeg"]);
const AUDIO_MIME = new Set([
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/wave", "audio/x-wav",
  "audio/aiff", "audio/x-aiff", "audio/flac", "audio/x-flac",
]);
const VIDEO_MIME = new Set(["video/mp4", "video/quicktime"]);

const FORBIDDEN_EXT = new Set([
  ".exe", ".dll", ".bat", ".cmd", ".ps1", ".js", ".ts", ".html", ".htm", ".svg",
  ".zip", ".rar", ".7z", ".glb", ".fbx", ".obj", ".wasm", ".sh",
]);

export interface IngestValidationResult {
  ok: boolean;
  kind?: IngestKind;
  stage: QuarantineStage;
  ext: string;
  reason?: string;
  failClosed: boolean;
}

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i).toLowerCase();
}

/** Magic-byte hints — JPEG SOI, WAV RIFF, MP3 ID3/frame sync, MP4/MOV ftyp. */
export function sniffContainer(bytes: Uint8Array): "jpeg" | "wav" | "mp3" | "flac" | "aiff" | "mp4" | "mov" | "glb" | "unknown" {
  if (bytes.length >= 4) {
    const magic = String.fromCharCode(bytes[0]!, bytes[1]!, bytes[2]!, bytes[3]!);
    if (magic === "glTF") return "glb";
    if (magic === "fLaC") return "flac";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes.length >= 12) {
    const riff = String.fromCharCode(bytes[0]!, bytes[1]!, bytes[2]!, bytes[3]!);
    const wave = String.fromCharCode(bytes[8]!, bytes[9]!, bytes[10]!, bytes[11]!);
    if (riff === "RIFF" && wave === "WAVE") return "wav";
    if (riff === "FORM" && (wave === "AIFF" || wave === "AIFC")) return "aiff";
  }
  if (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) return "mp3";
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1]! & 0xe0) === 0xe0) return "mp3";
  if (bytes.length >= 12) {
    const ftyp = String.fromCharCode(bytes[4]!, bytes[5]!, bytes[6]!, bytes[7]!);
    if (ftyp === "ftyp") {
      const brand = String.fromCharCode(bytes[8]!, bytes[9]!, bytes[10]!, bytes[11]!);
      if (brand.startsWith("qt")) return "mov";
      return "mp4";
    }
  }
  return "unknown";
}

export function validateIngestFile(input: {
  filename: string;
  mime?: string;
  sizeBytes: number;
  kind: IngestKind;
  maxBytes: number;
  headerBytes?: Uint8Array;
  scannerAvailable?: boolean;
}): IngestValidationResult {
  const ext = extOf(input.filename);
  // .glb/.fbx are forbidden on general paths; MODEL_3D allowlists them below.
  if (FORBIDDEN_EXT.has(ext) && input.kind !== "MODEL_3D") {
    return { ok: false, stage: "REJECTED", ext, reason: "Forbidden file type", failClosed: true };
  }
  if (input.sizeBytes <= 0) {
    return { ok: false, stage: "REJECTED", ext, reason: "Empty file", failClosed: true };
  }
  if (input.sizeBytes > input.maxBytes) {
    return { ok: false, stage: "REJECTED", ext, reason: "Oversized file", failClosed: true };
  }
  if (input.scannerAvailable === false) {
    return {
      ok: false,
      stage: "BLOCKED_SCANNER_UNAVAILABLE",
      ext,
      reason: "Scanner unavailable — fail closed",
      failClosed: true,
    };
  }

  let allowedExt: Set<string>;
  let allowedMime: Set<string>;
  if (input.kind === "REFERENCE_IMAGE") {
    allowedExt = IMAGE_EXT;
    allowedMime = IMAGE_MIME;
  } else if (input.kind === "AUDIO") {
    allowedExt = AUDIO_EXT;
    allowedMime = AUDIO_MIME;
  } else if (input.kind === "MODEL_3D") {
    allowedExt = new Set([".glb"]);
    allowedMime = new Set(["model/gltf-binary", "application/octet-stream"]);
  } else if (input.kind === "YOPHO_ASSET" || input.kind === "BROADCAST_GRAPHICS_REFERENCE") {
    allowedExt = IMAGE_EXT;
    allowedMime = IMAGE_MIME;
  } else {
    allowedExt = VIDEO_EXT;
    allowedMime = VIDEO_MIME;
  }

  if (!allowedExt.has(ext)) {
    return { ok: false, stage: "REJECTED", ext, reason: `Unsupported extension for ${input.kind}`, failClosed: true };
  }
  if (input.mime && !allowedMime.has(input.mime)) {
    return { ok: false, stage: "REJECTED", ext, reason: "MIME/extension mismatch", failClosed: true };
  }

  if (!input.headerBytes || input.headerBytes.length === 0) {
    return {
      ok: false,
      stage: "REJECTED",
      ext,
      reason: "Binary header bytes required for container validation",
      failClosed: true,
    };
  }
  if (input.headerBytes && input.headerBytes.length > 0) {
    const sniff = sniffContainer(input.headerBytes);
    const expect =
      input.kind === "MODEL_3D"
        ? "glb"
        : input.kind === "REFERENCE_IMAGE" ||
            input.kind === "YOPHO_ASSET" ||
            input.kind === "BROADCAST_GRAPHICS_REFERENCE"
          ? "jpeg"
          : input.kind === "AUDIO"
            ? ext === ".wav"
              ? "wav"
              : ext === ".flac"
                ? "flac"
                : ext === ".aiff" || ext === ".aif"
                  ? "aiff"
                  : "mp3"
            : ext === ".mov"
              ? "mov"
              : "mp4";
    let match = false;
    if (expect === "jpeg" && sniff === "jpeg") match = true;
    else if (expect === "wav" && sniff === "wav") match = true;
    else if (expect === "mp3" && sniff === "mp3") match = true;
    else if (expect === "flac" && sniff === "flac") match = true;
    else if (expect === "aiff" && sniff === "aiff") match = true;
    else if (expect === "glb" && sniff === "glb") match = true;
    else if ((expect === "mp4" || expect === "mov") && (sniff === "mp4" || sniff === "mov")) match = true;

    if (!match) {
      return {
        ok: false,
        stage: "REJECTED",
        ext,
        reason: `Signature mismatch (sniff=${sniff}, expected=${expect})`,
        failClosed: true,
      };
    }
  }

  return { ok: true, kind: input.kind, stage: "TYPE_VALIDATED", ext, failClosed: false };
}


/** Canonical content hash (sha256 hex). Never trust filename alone. */
export async function computeContentHash(bytes: Uint8Array): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    const digest = await subtle.digest("SHA-256", bytes as BufferSource);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Node fallback
  const { createHash } = await import("crypto");
  return createHash("sha256").update(Buffer.from(bytes)).digest("hex");
}

export function computeContentHashSync(bytes: Uint8Array): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createHash } = require("crypto") as typeof import("crypto");
  return createHash("sha256").update(Buffer.from(bytes)).digest("hex");
}
