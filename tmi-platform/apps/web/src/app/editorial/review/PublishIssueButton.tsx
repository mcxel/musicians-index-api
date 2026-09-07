"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PublishIssueButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ slotCount: number; publishedSubmissionIds: string[] } | null>(null);
  const [error, setError] = useState("");

  async function publish() {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/editorial/publish-issue", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ issueKey: "current" }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        slotCount?: number;
        publishedSubmissionIds?: string[];
      };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Publish failed");
        return;
      }
      setResult({ slotCount: data.slotCount ?? 0, publishedSubmissionIds: data.publishedSubmissionIds ?? [] });
      router.refresh();
    } catch {
      setError("Unable to reach the composition service.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
      <button
        onClick={publish}
        disabled={busy}
        style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", color: "#050510", background: "#FFD700", border: "none", borderRadius: 8, padding: "8px 16px", cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1 }}
      >
        {busy ? "COMPOSING…" : "PUBLISH TODAY'S ISSUE"}
      </button>
      {result && (
        <span style={{ fontSize: 10, color: "#00FF88" }}>
          Built {result.slotCount} slots · {result.publishedSubmissionIds.length} writer {result.publishedSubmissionIds.length === 1 ? "story" : "stories"} published
        </span>
      )}
      {error && <span style={{ fontSize: 10, color: "#FF4466" }}>{error}</span>}
    </div>
  );
}
