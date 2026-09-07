"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditorialReviewActions({ submissionId }: { submissionId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");

  async function act(action: "approve" | "reject") {
    setBusy(action);
    setError("");
    try {
      const reason = action === "reject" ? window.prompt("Rejection reason (shown to the contributor):") ?? "" : undefined;
      if (action === "reject" && !reason) {
        setBusy(null);
        return;
      }
      const res = await fetch("/api/editorial/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ submissionId, action, reason }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Action failed");
        return;
      }
      router.refresh();
    } catch {
      setError("Unable to reach the review service.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
      <button
        onClick={() => act("approve")}
        disabled={busy !== null}
        style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", color: "#050510", background: "#00FF88", border: "none", borderRadius: 6, padding: "6px 12px", cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1 }}
      >
        {busy === "approve" ? "…" : "APPROVE"}
      </button>
      <button
        onClick={() => act("reject")}
        disabled={busy !== null}
        style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", color: "#fff", background: "rgba(255,68,102,0.15)", border: "1px solid rgba(255,68,102,0.4)", borderRadius: 6, padding: "6px 12px", cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1 }}
      >
        {busy === "reject" ? "…" : "REJECT"}
      </button>
      {error && <span style={{ fontSize: 9, color: "#FF4466" }}>{error}</span>}
    </div>
  );
}
