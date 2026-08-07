"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PrivacyRow = {
  requestId: string;
  caseId: string;
  requesterEmail: string;
  requestType: string;
  status: string;
  createdAt: string;
  notes: string;
};

export default function PrivacyRightsCenterPanel() {
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "empty">("loading");
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<PrivacyRow[]>([]);

  useEffect(() => {
    fetch("/api/admin/legal/privacy", { credentials: "include", cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
        const list = (data.requests ?? []) as PrivacyRow[];
        setRows(list);
        setStatus(list.length === 0 ? "empty" : "ready");
      })
      .catch((e: Error) => {
        setError(e.message);
        setStatus("error");
      });
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 900, color: "#00FF88" }}>Privacy Rights Center</div>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
          PrivacyRequestEngine — separate from government disclosure. Human review required.
          Not legal advice.
        </p>
      </div>
      <Link
        href="/legal/privacy"
        style={{
          fontSize: 10,
          fontWeight: 800,
          color: "#00FF88",
          textDecoration: "none",
          border: "1px solid rgba(0,255,136,0.4)",
          borderRadius: 8,
          padding: "7px 11px",
          width: "fit-content",
        }}
      >
        Open public privacy intake →
      </Link>

      {status === "loading" ? <div style={empty}>Loading privacy requests…</div> : null}
      {status === "error" ? <div style={{ ...empty, color: "#FF8A8A" }}>{error}</div> : null}
      {status === "empty" ? (
        <div style={empty}>No privacy rights requests yet — honest empty state.</div>
      ) : null}

      {status === "ready"
        ? rows.map((r) => (
            <div
              key={r.requestId}
              style={{
                border: "1px solid rgba(0,255,136,0.25)",
                borderRadius: 10,
                padding: 12,
                background: "rgba(0,255,136,0.05)",
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
                {r.requestId} · {r.requestType} · {r.status}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                {r.requesterEmail} · case {r.caseId} · {r.createdAt}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{r.notes}</div>
            </div>
          ))
        : null}
    </div>
  );
}

const empty = {
  fontSize: 12,
  color: "rgba(255,255,255,0.45)",
  padding: 16,
  border: "1px dashed rgba(255,255,255,0.15)",
  borderRadius: 10,
  textAlign: "center" as const,
};
