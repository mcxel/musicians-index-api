export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { MediaEngine } from "@/lib/media/MediaAssetEngine";
import { MediaProcessingEngine } from "@/lib/media/MediaProcessingEngine";

// GET /api/media/status/[id]
// Returns processing job status for a specific asset
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const assetId = params.id;
  if (!assetId) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });

  const asset = MediaEngine.getAsset(assetId);
  const job = MediaProcessingEngine.getJobByAsset(assetId);

  return NextResponse.json({
    ok: true,
    assetId,
    assetStatus: asset?.status ?? "unknown",
    job: job
      ? {
          jobId:        job.jobId,
          status:       job.status,
          progress:     job.progress,
          currentStage: job.currentStage,
          stages:       job.stages,
          queuedAt:     job.queuedAt,
          startedAt:    job.startedAt,
          completedAt:  job.completedAt,
          errorMessage: job.errorMessage,
        }
      : null,
  });
}
