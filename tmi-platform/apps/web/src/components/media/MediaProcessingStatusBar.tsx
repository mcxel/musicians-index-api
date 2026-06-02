"use client";

/**
 * MediaProcessingStatusBar — mini widget showing active processing jobs.
 * Polls /api/media/status when uploads are in-flight.
 * Renders as a compact strip for the performer hub.
 */

import { useState, useEffect, useCallback } from "react";

interface JobSummary {
  jobId: string;
  assetId: string;
  status: "queued" | "running" | "complete" | "failed";
  progress: number;
  currentStage: string | null;
  title?: string;
}

interface Props {
  assetIds: string[];   // IDs of recently uploaded assets to track
  accentColor?: string;
  onAllReady?: () => void;
}

export default function MediaProcessingStatusBar({ assetIds, accentColor = "#00FFFF", onAllReady }: Props) {
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [polling, setPolling] = useState(false);

  const fetchStatuses = useCallback(async () => {
    if (!assetIds.length) return;
    const results = await Promise.all(
      assetIds.map(id =>
        fetch(`/api/media/status/${id}`)
          .then(r => r.json())
          .catch(() => null)
      )
    );

    const summaries: JobSummary[] = results
      .filter(Boolean)
      .map((r) => ({
        jobId:        r.job?.jobId ?? r.assetId,
        assetId:      r.assetId,
        status:       r.job?.status ?? (r.assetStatus === "ready" ? "complete" : "queued"),
        progress:     r.job?.progress ?? (r.assetStatus === "ready" ? 100 : 0),
        currentStage: r.job?.currentStage ?? null,
      }));

    setJobs(summaries);

    const allDone = summaries.every(j => j.status === "complete" || j.status === "failed");
    if (allDone && summaries.length > 0) {
      setPolling(false);
      onAllReady?.();
    }
  }, [assetIds, onAllReady]);

  useEffect(() => {
    if (!assetIds.length) return;
    setPolling(true);
    fetchStatuses();
    const interval = setInterval(fetchStatuses, 800);
    return () => clearInterval(interval);
  }, [assetIds, fetchStatuses]);

  const active = jobs.filter(j => j.status === "running" || j.status === "queued");
  const done   = jobs.filter(j => j.status === "complete");
  const failed = jobs.filter(j => j.status === "failed");

  if (!jobs.length) return null;

  return (
    <div style={{ padding: "10px 14px", background: "rgba(0,0,0,0.4)", border: `1px solid ${accentColor}28`, borderRadius: 12, display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 8, letterSpacing: "0.25em", color: accentColor, fontWeight: 800 }}>
          MEDIA PIPELINE
          {polling && <span style={{ marginLeft: 6, fontSize: 7, color: "rgba(255,255,255,0.3)" }}>● LIVE</span>}
        </div>
        <div style={{ display: "flex", gap: 8, fontSize: 8, color: "rgba(255,255,255,0.4)" }}>
          {active.length > 0  && <span style={{ color: "#FFD700" }}>{active.length} processing</span>}
          {done.length > 0    && <span style={{ color: "#00FF88" }}>{done.length} ready</span>}
          {failed.length > 0  && <span style={{ color: "#FF2020" }}>{failed.length} failed</span>}
        </div>
      </div>

      {/* Job rows */}
      {jobs.map(job => (
        <div key={job.jobId} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Progress bar */}
            <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 2,
                width: `${job.progress}%`,
                background: job.status === "complete" ? "#00FF88" : job.status === "failed" ? "#FF2020" : `linear-gradient(90deg, ${accentColor}, ${accentColor}88)`,
                transition: "width 0.4s ease",
              }} />
            </div>
          </div>
          <div style={{ fontSize: 8, fontWeight: 700, flexShrink: 0, minWidth: 60, textAlign: "right",
            color: job.status === "complete" ? "#00FF88" : job.status === "failed" ? "#FF2020" : "rgba(255,255,255,0.4)"
          }}>
            {job.status === "complete" ? "✓ READY" :
             job.status === "failed"   ? "✗ FAILED" :
             job.currentStage ? job.currentStage.replace(/_/g, " ").toUpperCase() : "QUEUED"}
          </div>
        </div>
      ))}
    </div>
  );
}
