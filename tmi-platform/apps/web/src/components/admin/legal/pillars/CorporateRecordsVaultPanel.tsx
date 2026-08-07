"use client";

import { useEffect, useState } from "react";

type RecordMeta = {
  recordId: string;
  kind: string;
  title: string;
  description: string;
  version: string;
  vaultLocator: string;
  containsSecrets: false;
  counselReviewed: boolean;
  tags: string[];
};

export default function CorporateRecordsVaultPanel() {
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "empty">("loading");
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<RecordMeta[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    setStatus("loading");
    fetch("/api/admin/legal/vault", { credentials: "include", cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? `HTTP ${r.status}`);
        const list = (data.records ?? []) as RecordMeta[];
        setRecords(list);
        setTypes((data.registryTypes ?? []) as string[]);
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
        <div style={{ fontSize: 14, fontWeight: 900, color: "#FFD700" }}>Corporate Records Vault</div>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.45 }}>
          Metadata index for documents in an encrypted, logically isolated Legal Vault.
          Secrets and API keys are forbidden here.
        </p>
      </div>

      {types.length > 0 ? (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.04em" }}>
          Registry types: {types.join(" · ")}
        </div>
      ) : null}

      {status === "loading" ? <div style={msg}>Loading vault metadata…</div> : null}
      {status === "error" ? <div style={{ ...msg, color: "#FF8A8A" }}>{error}</div> : null}
      {status === "empty" ? <div style={msg}>No corporate record metadata registered yet.</div> : null}

      {status === "ready"
        ? records.map((r) => (
            <div
              key={r.recordId}
              style={{
                border: "1px solid rgba(255,215,0,0.22)",
                borderRadius: 10,
                padding: 12,
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{r.title}</div>
                <div style={{ fontSize: 10, color: "#FFD700", fontWeight: 800 }}>{r.kind}</div>
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{r.description}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                {r.vaultLocator} · v{r.version} · secrets: never · counsel:{" "}
                {r.counselReviewed ? "reviewed" : "pending"}
              </div>
            </div>
          ))
        : null}
    </div>
  );
}

const msg = {
  fontSize: 12,
  color: "rgba(255,255,255,0.45)",
  padding: 16,
  border: "1px dashed rgba(255,255,255,0.15)",
  borderRadius: 10,
  textAlign: "center" as const,
};
