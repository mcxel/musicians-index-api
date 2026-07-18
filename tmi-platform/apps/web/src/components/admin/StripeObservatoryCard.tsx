"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";

type HealthResponse = {
  stripeMode: "test" | "live" | "not_configured" | "unknown";
  webhookSecretConfigured: boolean;
  webhookConnected: boolean;
  lastEventTs: number | null;
  lastVerifiedEvent: {
    ts: number;
    eventType: string | null;
    livemode: boolean | null;
  } | null;
  eventHealth: {
    checkoutSessionCompleted: boolean;
    invoicePaymentSucceeded: boolean;
    paymentIntentSucceeded: boolean;
    customerSubscriptionCreated: boolean;
  };
  deliveryHealth: {
    ok200Count: number;
    failedDeliveries: number;
    retryCount: number;
  };
  pipelineStatus: {
    userUpgraded: boolean;
    payoutQueued: boolean;
    emailSent: boolean;
  };
  incidentStatus: {
    payoutQueuePaused: boolean;
    payoutQueuePausedAt: number | null;
    payoutQueuePauseReason: string;
    recentIncidents: Array<{
      id: string;
      code: string;
      severity: "INFO" | "WARN" | "CRITICAL" | "LOCKDOWN";
      message: string;
      timestamp: number;
      meta?: Record<string, unknown>;
    }>;
    recentResumeAudits: Array<{
      id: string;
      timestamp: number;
      actorEmail: string;
      actorRole: string;
      actorName: string;
      reason: string;
      previousPauseReason: string;
    }>;
  };
  recentEvents: Array<{
    ts: number;
    kind: string;
    category: string;
    meta?: Record<string, unknown>;
  }>;
};

function formatTs(value: number | null | undefined): string {
  if (!value) return "No events yet";
  return new Date(value).toLocaleString();
}

function statusPill(ok: boolean): CSSProperties {
  return {
    display: "inline-block",
    borderRadius: 999,
    padding: "3px 10px",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.4,
    background: ok ? "rgba(16,185,129,.18)" : "rgba(239,68,68,.16)",
    border: ok ? "1px solid rgba(16,185,129,.45)" : "1px solid rgba(239,68,68,.45)",
    color: ok ? "#34d399" : "#fca5a5",
  };
}

export default function StripeObservatoryCard() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeReason, setResumeReason] = useState("");
  const [resumeState, setResumeState] = useState<"idle" | "submitting">("idle");
  const [resumeMessage, setResumeMessage] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const fetchHealth = async () => {
      try {
        const res = await fetch("/api/stripe/webhook-health", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const json = (await res.json()) as HealthResponse;
        if (alive) {
          setData(json);
          setError(null);
        }
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : "Failed to load Stripe health");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    fetchHealth();
    const timer = window.setInterval(fetchHealth, 15000);

    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  const modeLabel = useMemo(() => {
    if (!data) return "...";
    if (data.stripeMode === "test") return "Sandbox";
    if (data.stripeMode === "live") return "Live";
    if (data.stripeMode === "not_configured") return "Not Configured";
    return "Unknown";
  }, [data]);

  const severityColor = (severity: "INFO" | "WARN" | "CRITICAL" | "LOCKDOWN"): string => {
    if (severity === "INFO") return "#7dd3fc";
    if (severity === "WARN") return "#facc15";
    if (severity === "CRITICAL") return "#fb7185";
    return "#f43f5e";
  };

  const handleResumeQueue = async () => {
    if (!resumeReason.trim()) {
      setResumeMessage("Resume reason is required.");
      return;
    }

    setResumeState("submitting");
    setResumeMessage(null);
    try {
      const res = await fetch("/api/admin/stripe-incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resume_payout_queue",
          reason: resumeReason.trim(),
        }),
      });
      const json = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok || !json.ok) {
        setResumeMessage(json.error ?? json.message ?? "Failed to resume payout queue");
      } else {
        setResumeMessage("Payout queue resumed and audited.");
        setResumeReason("");
      }
    } catch (err) {
      setResumeMessage(err instanceof Error ? err.message : "Failed to resume payout queue");
    } finally {
      setResumeState("idle");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: "'Inter', sans-serif" }}>
      {/* Small sparkline chart */}
      <div style={{ height: 60, position: "relative", background: "rgba(0,0,0,0.2)", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
        <svg width="100%" height="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
          <defs>
            <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#AA2DFF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#AA2DFF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 0 50 Q 30 30, 60 40 T 120 20 T 180 30 T 200 10 L 200 60 L 0 60 Z" fill="url(#purpleGrad)" />
          <path d="M 0 50 Q 30 30, 60 40 T 120 20 T 180 30 T 200 10" fill="none" stroke="#AA2DFF" strokeWidth="2" />
          <path d="M 0 45 Q 40 40, 80 25 T 160 35 T 200 15" fill="none" stroke="#FFD700" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Integration checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {[
          { name: "Meta Business Suite", count: 18, checked: false },
          { name: "stripe", checked: true },
          { name: "Pay Pa/", checked: true },
          { name: "SSR Hosting", checked: true },
          { name: "Pundworthy", count: 29, checked: true }
        ].map((item, idx) => (
          <div key={idx} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "5px 8px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,215,0,0.15)",
            borderRadius: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {item.checked ? (
                <span style={{ color: "#00FF88", fontSize: 10, fontWeight: 900 }}>✔</span>
              ) : (
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>☐</span>
              )}
              <span style={{ fontSize: 9, fontWeight: 900, color: "#ffe9bb", textTransform: "uppercase" }}>{item.name}</span>
            </div>
            {item.count ? (
              <span style={{ background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 8, fontWeight: 900, padding: "1px 5px", borderRadius: 4 }}>{item.count}</span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
