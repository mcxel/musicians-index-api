"use client";

/**
 * Embeddable Runtime Check / Certification diagnostics.
 * Same data as /admin/runtime-check — no page navigation.
 */

import { useCallback, useEffect, useState } from "react";

type CheckStatus = "ok" | "warn" | "fail";

interface Check {
  name: string;
  status: CheckStatus;
  value?: string | number | boolean;
  note?: string;
}

interface RuntimeCheckResult {
  overall: CheckStatus;
  summary: { ok: number; warn: number; fail: number };
  checks: Check[];
  timestamp: string;
  mode: "production" | "soft-launch";
}

const STATUS_COLORS: Record<CheckStatus, string> = {
  ok: "#00FF88",
  warn: "#FFD700",
  fail: "#FF4444",
};

const STATUS_ICONS: Record<CheckStatus, string> = {
  ok: "✅",
  warn: "⚠️",
  fail: "❌",
};

type Props = {
  /** Certification label variant (same checks) */
  modeLabel?: "Runtime Check" | "Certification";
  compact?: boolean;
};

export default function RuntimeCheckPanel({
  modeLabel = "Runtime Check",
  compact = false,
}: Props) {
  const [result, setResult] = useState<RuntimeCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runCheck = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/system/runtime-check", { cache: "no-store" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      setResult((await res.json()) as RuntimeCheckResult);
    } catch {
      setError("Unable to reach runtime-check. Retry.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void runCheck();
  }, [runCheck]);

  const overallColor = result ? STATUS_COLORS[result.overall] : "#888";

  return (
    <div
      data-runtime-check-panel
      style={{
        height: "100%",
        minHeight: 0,
        overflow: "auto",
        padding: compact ? 10 : 14,
        background: "#050510",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 8,
              letterSpacing: "0.28em",
              color: "#00FF88",
              fontWeight: 800,
              marginBottom: 4,
            }}
          >
            SYSTEM
          </div>
          <div style={{ fontSize: compact ? 14 : 16, fontWeight: 900 }}>{modeLabel}</div>
        </div>
        <button
          type="button"
          onClick={() => void runCheck()}
          disabled={loading}
          style={{
            padding: "8px 14px",
            fontSize: 10,
            fontWeight: 800,
            color: "#00FF88",
            border: "1px solid rgba(0,255,136,0.4)",
            borderRadius: 8,
            background: "rgba(0,255,136,0.08)",
            cursor: loading ? "wait" : "pointer",
            letterSpacing: "0.1em",
            fontFamily: "inherit",
          }}
        >
          {loading ? "RUNNING…" : "↻ RUN CHECK"}
        </button>
      </div>

      {error ? (
        <div
          style={{
            background: "rgba(255,68,68,0.08)",
            border: "1px solid rgba(255,68,68,0.3)",
            borderRadius: 10,
            padding: 12,
            color: "#FF4444",
            fontSize: 12,
          }}
        >
          {error}
        </div>
      ) : null}

      {loading && !result ? (
        <div style={{ padding: 40, textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
          Loading system checks…
        </div>
      ) : null}

      {result ? (
        <>
          <div
            style={{
              background: `${overallColor}10`,
              border: `1px solid ${overallColor}44`,
              borderRadius: 10,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 900, color: overallColor }}>
              {STATUS_ICONS[result.overall]}{" "}
              {result.overall === "ok"
                ? "ALL SYSTEMS GO"
                : result.overall === "warn"
                  ? "READY — REVIEW WARNINGS"
                  : "ACTION REQUIRED"}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
              {result.summary.ok} passed · {result.summary.warn} warnings · {result.summary.fail}{" "}
              failures · {result.mode}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {result.checks.map((check, i) => {
              const color = STATUS_COLORS[check.status];
              return (
                <div
                  key={`${check.name}-${i}`}
                  style={{
                    background: `${color}06`,
                    border: `1px solid ${color}22`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{STATUS_ICONS[check.status]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{check.name}</div>
                    {check.note ? (
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                        {check.note}
                      </div>
                    ) : null}
                  </div>
                  {check.value !== undefined ? (
                    <div style={{ fontSize: 10, fontWeight: 700, color, fontFamily: "monospace" }}>
                      {String(check.value)}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
