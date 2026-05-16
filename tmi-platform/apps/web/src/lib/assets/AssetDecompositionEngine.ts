import { loadedAssets } from "./assetRegistry";
import { updateReconstructionMemory } from "./reconstructionMemory";

export type AssetType = "HOST" | "AVATAR" | "PROP" | "UI" | "BACKGROUND" | "SPRITE";
export type DecompositionStatus = "pending" | "processing" | "complete" | "failed";

export interface AssetPart {
  partId: string;
  partName: string;
  category: "body" | "head" | "accessory" | "expression" | "pose" | "background" | "overlay" | "unknown";
  bounds?: { x: number; y: number; w: number; h: number };
  dominantColors?: string[];
  tags: string[];
}

export interface DecompositionResult {
  assetId: string;
  assetType: AssetType;
  sourceUrl: string;
  status: DecompositionStatus;
  parts: AssetPart[];
  variants: string[];        // generated variant IDs
  poses: string[];           // extracted pose IDs
  expressions: string[];     // extracted expression IDs
  metadata: {
    width?: number;
    height?: number;
    format?: string;
    colorPalette?: string[];
    estimatedSubject?: string;
    confidence?: number;
  };
  decomposedAt: number;
  processingMs: number;
}

export interface DecompositionJob {
  jobId: string;
  assetId: string;
  assetType: AssetType;
  sourceUrl: string;
  status: DecompositionStatus;
  enqueuedAt: number;
  startedAt?: number;
  result?: DecompositionResult;
  error?: string;
}

type JobListener = (job: DecompositionJob) => void;

function inferParts(assetType: AssetType, assetId: string): AssetPart[] {
  const base: AssetPart[] = [];

  if (assetType === "HOST" || assetType === "AVATAR") {
    base.push(
      { partId: `${assetId}-body`, partName: "Body", category: "body", tags: ["base", "torso"] },
      { partId: `${assetId}-head`, partName: "Head", category: "head", tags: ["face", "head"] },
      { partId: `${assetId}-expr-neutral`, partName: "Expression: Neutral", category: "expression", tags: ["expression", "neutral"] },
      { partId: `${assetId}-expr-happy`, partName: "Expression: Happy", category: "expression", tags: ["expression", "happy"] },
      { partId: `${assetId}-expr-talking`, partName: "Expression: Talking", category: "expression", tags: ["expression", "talking", "lipsync"] },
      { partId: `${assetId}-pose-idle`, partName: "Pose: Idle", category: "pose", tags: ["pose", "idle", "standing"] },
      { partId: `${assetId}-pose-gesture`, partName: "Pose: Gesture", category: "pose", tags: ["pose", "gesture"] },
    );
  } else if (assetType === "PROP") {
    base.push(
      { partId: `${assetId}-main`, partName: "Main Prop", category: "accessory", tags: ["prop", "object"] },
      { partId: `${assetId}-shadow`, partName: "Shadow Layer", category: "overlay", tags: ["shadow", "layer"] },
    );
  } else if (assetType === "UI") {
    base.push(
      { partId: `${assetId}-frame`, partName: "Frame", category: "background", tags: ["ui", "frame"] },
      { partId: `${assetId}-content`, partName: "Content Area", category: "overlay", tags: ["ui", "content"] },
    );
  } else if (assetType === "BACKGROUND") {
    base.push(
      { partId: `${assetId}-bg`, partName: "Background", category: "background", tags: ["background", "scene"] },
      { partId: `${assetId}-fg`, partName: "Foreground Elements", category: "overlay", tags: ["foreground", "elements"] },
    );
  } else {
    base.push({ partId: `${assetId}-base`, partName: "Base Layer", category: "unknown", tags: ["base"] });
  }

  return base;
}

function extractColorPalette(assetType: AssetType): string[] {
  const palettes: Record<AssetType, string[]> = {
    HOST: ["#1a0a2e", "#ff2daa", "#00ffff", "#ffd700"],
    AVATAR: ["#0d0520", "#aa2dff", "#00ffff", "#ffffff"],
    PROP: ["#2a1a4e", "#ffd700", "#00ffff", "#ff6b35"],
    UI: ["#050510", "#00ffff", "#aa2dff", "#ff2daa"],
    BACKGROUND: ["#0a0118", "#1a0a30", "#050510", "#000000"],
    SPRITE: ["#050510", "#00ffff", "#ff2daa", "#ffd700"],
  };
  return palettes[assetType] ?? palettes.UI;
}

export class AssetDecompositionEngine {
  private static _instance: AssetDecompositionEngine | null = null;
  private _queue: Map<string, DecompositionJob> = new Map();
  private _completed: Map<string, DecompositionResult> = new Map();
  private _listeners: Set<JobListener> = new Set();

  static getInstance(): AssetDecompositionEngine {
    if (!AssetDecompositionEngine._instance) {
      AssetDecompositionEngine._instance = new AssetDecompositionEngine();
    }
    return AssetDecompositionEngine._instance;
  }

  enqueue(assetId: string, assetType: AssetType, sourceUrl: string): DecompositionJob {
    const existing = this._queue.get(assetId);
    if (existing) return existing;

    const job: DecompositionJob = {
      jobId: `job-${Math.random().toString(36).slice(2, 8)}`,
      assetId,
      assetType,
      sourceUrl,
      status: "pending",
      enqueuedAt: Date.now(),
    };

    this._queue.set(assetId, job);
    this._emit(job);
    this._process(job);
    return job;
  }

  private async _process(job: DecompositionJob): Promise<void> {
    job.status = "processing";
    job.startedAt = Date.now();
    this._emit(job);

    // Simulate async decomposition (replace with vision API in prod)
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));

    try {
      const parts = inferParts(job.assetType, job.assetId);
      const colorPalette = extractColorPalette(job.assetType);
      const poses = parts.filter((p) => p.category === "pose").map((p) => p.partId);
      const expressions = parts.filter((p) => p.category === "expression").map((p) => p.partId);
      const variants = [`${job.assetId}-v2-alt`, `${job.assetId}-v2-dark`];

      const result: DecompositionResult = {
        assetId: job.assetId,
        assetType: job.assetType,
        sourceUrl: job.sourceUrl,
        status: "complete",
        parts,
        variants,
        poses,
        expressions,
        metadata: {
          format: job.sourceUrl.split(".").pop() ?? "png",
          colorPalette,
          estimatedSubject: job.assetType.toLowerCase(),
          confidence: 0.82 + Math.random() * 0.15,
        },
        decomposedAt: Date.now(),
        processingMs: Date.now() - (job.startedAt ?? Date.now()),
      };

      job.status = "complete";
      job.result = result;
      this._completed.set(job.assetId, result);

      // Persist to reconstruction memory
      updateReconstructionMemory({
        assetId: job.assetId,
        originalSource: job.sourceUrl,
        partsExtracted: parts.map((p) => p.partId),
        variantsCreated: variants,
        posesCreated: poses,
        expressionsCreated: expressions,
        updatedAt: Date.now(),
      });

    } catch (err) {
      job.status = "failed";
      job.error = String(err);
    }

    this._emit(job);
  }

  // ── Batch decomposition ──────────────────────────────────────────────────────

  enqueueMany(assets: { assetId: string; assetType: AssetType; sourceUrl: string }[]): DecompositionJob[] {
    return assets.map(({ assetId, assetType, sourceUrl }) => this.enqueue(assetId, assetType, sourceUrl));
  }

  // ── Registry-based auto-decomposition ───────────────────────────────────────

  decomposeRegisteredAssets(): void {
    for (const [id, asset] of loadedAssets) {
      if (!this._completed.has(id)) {
        this.enqueue(id, asset.type as AssetType, "");
      }
    }
  }

  // ── Query ────────────────────────────────────────────────────────────────────

  getResult(assetId: string): DecompositionResult | null {
    return this._completed.get(assetId) ?? null;
  }

  getJob(assetId: string): DecompositionJob | null {
    return this._queue.get(assetId) ?? null;
  }

  getParts(assetId: string): AssetPart[] {
    return this._completed.get(assetId)?.parts ?? [];
  }

  getMetadata(assetId: string) {
    return this._completed.get(assetId)?.metadata ?? null;
  }

  getStats(): { total: number; pending: number; processing: number; complete: number; failed: number } {
    const jobs = [...this._queue.values()];
    return {
      total: jobs.length,
      pending: jobs.filter((j) => j.status === "pending").length,
      processing: jobs.filter((j) => j.status === "processing").length,
      complete: jobs.filter((j) => j.status === "complete").length,
      failed: jobs.filter((j) => j.status === "failed").length,
    };
  }

  // ── Subscription ─────────────────────────────────────────────────────────────

  onJob(cb: JobListener): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  private _emit(job: DecompositionJob): void {
    for (const cb of this._listeners) cb({ ...job });
  }
}

export const assetDecompositionEngine = AssetDecompositionEngine.getInstance();
