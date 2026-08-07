"use client";

// Canon source: Adminisratation Hub.jpg — Approve Queue rail
// Rule 20: real SubmissionEngine queue via /api/admin/approvals — no seed items.

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type ApprovalStatus = "pending" | "approved" | "rejected" | "live" | "expired";

interface ApprovalItem {
  id: string;
  type: string;
  name: string;
  artist: string;
  genre: string;
  submitted: string;
  status: ApprovalStatus;
}

const STATUS_COLOR: Record<ApprovalStatus, string> = {
  pending: "#FFD700",
  approved: "#00FF88",
  rejected: "#FF4444",
  live: "#00FFFF",
  expired: "rgba(255,255,255,0.35)",
};

type LoadState = "loading" | "ready" | "error";

export default function ApprovalQueueRail() {
  const [queue, setQueue] = useState<ApprovalItem[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [flash, setFlash] = useState<Record<string, "approved" | "denied">>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/approvals", { credentials: "include", cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const data = (await r.json()) as { ok?: boolean; queue?: ApprovalItem[] };
      setQueue(Array.isArray(data.queue) ? data.queue.filter((i) => i.status === "pending") : []);
      setState("ready");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(id: string, action: "approve" | "reject") {
    setBusy(id);
    setFlash((prev) => ({ ...prev, [id]: action === "approve" ? "approved" : "denied" }));
    try {
      const r = await fetch("/api/admin/approvals", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (!r.ok) throw new Error("fail");
      setTimeout(() => {
        setQueue((q) => q.filter((item) => item.id !== id));
        setFlash((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }, 400);
    } catch {
      setFlash((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div data-approval-queue-rail style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 8, fontWeight: 900, color: "rgba(255,255,255,0.45)", letterSpacing: "0.2em" }}>
          APPROVAL QUEUE · {state === "ready" ? queue.length : "—"}
        </span>
        <Link href="/admin/approvals" style={{ fontSize: 7, color: "#00FFFF", textDecoration: "none", letterSpacing: "0.1em" }}>
          ALL →
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {state === "loading" && (
          <p style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "16px 0", letterSpacing: "0.15em" }}>
            LOADING QUEUE…
          </p>
        )}
        {state === "error" && (
          <p style={{ fontSize: 8, color: "rgba(255,100,100,0.7)", textAlign: "center", padding: "16px 0", letterSpacing: "0.1em" }}>
            UNABLE TO LOAD QUEUE
          </p>
        )}
        {state === "ready" && queue.length === 0 && (
          <p style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", textAlign: "center", padding: "16px 0", letterSpacing: "0.15em" }}>
            QUEUE CLEAR — NO PENDING SUBMISSIONS
          </p>
        )}
        {queue.map((item) => {
          const color = STATUS_COLOR[item.status] ?? "#00FFFF";
          const flashState = flash[item.id];
          return (
            <div
              key={item.id}
              style={{
                padding: "8px 10px",
                borderRadius: 7,
                background:
                  flashState === "approved"
                    ? "rgba(0,255,136,0.15)"
                    : flashState === "denied"
                      ? "rgba(255,68,68,0.15)"
                      : `${color}06`,
                border: `1px solid ${flashState ? (flashState === "approved" ? "#00FF88" : "#FF4444") : `${color}20`}`,
                transition: "background 0.2s, border-color 0.2s",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 6, marginBottom: 6 }}>
                <span
                  style={{
                    fontSize: 6,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    color,
                    background: `${color}15`,
                    borderRadius: 3,
                    padding: "1px 5px",
                    flexShrink: 0,
                    textTransform: "uppercase",
                  }}
                >
                  {item.type}
                </span>
                <span style={{ flex: 1, fontSize: 7, color: "rgba(255,255,255,0.25)", textAlign: "right" }}>
                  {item.submitted}
                </span>
              </div>

              <p style={{ fontSize: 9, fontWeight: 800, color: "#fff", marginBottom: 2, letterSpacing: "0.04em" }}>
                {item.name}
              </p>
              <p style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                {item.artist}
                {item.genre ? ` · ${item.genre}` : ""}
              </p>

              <div style={{ display: "flex", gap: 5 }}>
                <button
                  type="button"
                  disabled={busy === item.id}
                  onClick={() => void act(item.id, "approve")}
                  style={{
                    flex: 1,
                    padding: "4px 0",
                    borderRadius: 5,
                    background: "rgba(0,255,136,0.1)",
                    border: "1px solid rgba(0,255,136,0.3)",
                    color: "#00FF88",
                    fontSize: 7,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    cursor: busy === item.id ? "wait" : "pointer",
                  }}
                >
                  APPROVE
                </button>
                <button
                  type="button"
                  disabled={busy === item.id}
                  onClick={() => void act(item.id, "reject")}
                  style={{
                    flex: 1,
                    padding: "4px 0",
                    borderRadius: 5,
                    background: "rgba(255,68,68,0.08)",
                    border: "1px solid rgba(255,68,68,0.25)",
                    color: "#FF4444",
                    fontSize: 7,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    cursor: busy === item.id ? "wait" : "pointer",
                  }}
                >
                  DENY
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
