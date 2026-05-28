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
    <section
      style={{
        border: "1px solid rgba(0,255,255,.22)",
        borderRadius: 14,
        padding: 16,
        background: "linear-gradient(180deg, rgba(8,10,22,.9), rgba(6,8,18,.8))",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h3 style={{ margin: 0, color: "#9be7ff", fontSize: 18 }}>Stripe Webhook Observatory</h3>
        <span style={statusPill(Boolean(data?.webhookConnected))}>{data?.webhookConnected ? "CONNECTED" : "NOT CONNECTED"}</span>
      </div>

      {loading && <p style={{ marginTop: 10, color: "#cbd5e1" }}>Loading Stripe telemetry...</p>}
      {error && <p style={{ marginTop: 10, color: "#fca5a5" }}>Failed to load: {error}</p>}

      {data && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 12 }}>
            <div style={{ border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, padding: 10 }}>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>Stripe Mode</div>
              <div style={{ color: "#fff", fontWeight: 700 }}>{modeLabel}</div>
            </div>
            <div style={{ border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, padding: 10 }}>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>Webhook Secret</div>
              <div style={{ color: data.webhookSecretConfigured ? "#34d399" : "#fca5a5", fontWeight: 700 }}>
                {data.webhookSecretConfigured ? "Configured" : "Missing"}
              </div>
            </div>
            <div style={{ border: "1px solid rgba(255,255,255,.12)", borderRadius: 10, padding: 10 }}>
              <div style={{ color: "#94a3b8", fontSize: 12 }}>Last Event</div>
              <div style={{ color: "#fff", fontWeight: 700 }}>{formatTs(data.lastEventTs)}</div>
            </div>
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <div style={{ color: "#e2e8f0", fontWeight: 700 }}>Delivery Health</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={statusPill(data.deliveryHealth.ok200Count > 0)}>200 OK: {data.deliveryHealth.ok200Count}</span>
              <span style={statusPill(data.deliveryHealth.failedDeliveries === 0)}>Failed: {data.deliveryHealth.failedDeliveries}</span>
              <span style={statusPill(data.deliveryHealth.retryCount === 0)}>Retries: {data.deliveryHealth.retryCount}</span>
            </div>
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <div style={{ color: "#e2e8f0", fontWeight: 700 }}>Event Health</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={statusPill(data.eventHealth.checkoutSessionCompleted)}>checkout.session.completed</span>
              <span style={statusPill(data.eventHealth.invoicePaymentSucceeded)}>invoice.payment_succeeded</span>
              <span style={statusPill(data.eventHealth.paymentIntentSucceeded)}>payment_intent.succeeded</span>
              <span style={statusPill(data.eventHealth.customerSubscriptionCreated)}>customer.subscription.created</span>
            </div>
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <div style={{ color: "#e2e8f0", fontWeight: 700 }}>Pipeline Status</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={statusPill(data.pipelineStatus.userUpgraded)}>User Upgraded</span>
              <span style={statusPill(data.pipelineStatus.payoutQueued)}>Payout Queued</span>
              <span style={statusPill(data.pipelineStatus.emailSent)}>Email Sent</span>
            </div>
          </div>

          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <div style={{ color: "#e2e8f0", fontWeight: 700 }}>Revenue Incident Guard</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={statusPill(!data.incidentStatus.payoutQueuePaused)}>
                Payout Queue: {data.incidentStatus.payoutQueuePaused ? "PAUSED" : "ACTIVE"}
              </span>
              <span style={statusPill(data.incidentStatus.recentIncidents.length === 0)}>
                Active Incidents: {data.incidentStatus.recentIncidents.length}
              </span>
            </div>
            {data.incidentStatus.payoutQueuePaused && (
              <div style={{ color: "#fca5a5", fontSize: 12 }}>
                {data.incidentStatus.payoutQueuePauseReason || "Payout queue paused by incident guard"}
              </div>
            )}
            {data.incidentStatus.recentIncidents.length > 0 && (
              <div style={{ display: "grid", gap: 6 }}>
                {data.incidentStatus.recentIncidents.slice(0, 3).map((incident) => (
                  <div key={incident.id} style={{ border: "1px solid rgba(252,165,165,.3)", borderRadius: 8, padding: "6px 8px" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ color: severityColor(incident.severity), fontSize: 11, fontWeight: 700 }}>{incident.severity}</div>
                      <div style={{ color: "#fca5a5", fontSize: 11, fontWeight: 700 }}>{incident.code}</div>
                    </div>
                    <div style={{ color: "#e2e8f0", fontSize: 12 }}>{incident.message}</div>
                    <div style={{ color: "#94a3b8", fontSize: 11 }}>{formatTs(incident.timestamp)}</div>
                  </div>
                ))}
              </div>
            )}

            {data.incidentStatus.payoutQueuePaused && (
              <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                <label style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 700 }} htmlFor="resume-reason">
                  Resume Reason (required)
                </label>
                <textarea
                  id="resume-reason"
                  value={resumeReason}
                  onChange={(e) => setResumeReason(e.target.value)}
                  rows={3}
                  placeholder="Describe why it is safe to resume payouts"
                  style={{
                    width: "100%",
                    border: "1px solid rgba(255,255,255,.2)",
                    borderRadius: 8,
                    padding: "8px 10px",
                    background: "rgba(2,6,23,.7)",
                    color: "#e2e8f0",
                    fontSize: 12,
                  }}
                />
                <button
                  type="button"
                  onClick={handleResumeQueue}
                  disabled={resumeState === "submitting"}
                  style={{
                    border: "1px solid rgba(16,185,129,.45)",
                    borderRadius: 8,
                    background: "rgba(16,185,129,.18)",
                    color: "#34d399",
                    fontWeight: 800,
                    letterSpacing: 0.2,
                    padding: "8px 10px",
                    cursor: resumeState === "submitting" ? "not-allowed" : "pointer",
                  }}
                >
                  {resumeState === "submitting" ? "Resuming..." : "Resume Payout Queue"}
                </button>
                {resumeMessage && <div style={{ color: "#cbd5e1", fontSize: 12 }}>{resumeMessage}</div>}
              </div>
            )}

            {data.incidentStatus.recentResumeAudits.length > 0 && (
              <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 12 }}>Recent Resume Audits</div>
                {data.incidentStatus.recentResumeAudits.slice(0, 2).map((audit) => (
                  <div key={audit.id} style={{ border: "1px solid rgba(125,211,252,.25)", borderRadius: 8, padding: "6px 8px" }}>
                    <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 700 }}>{audit.actorName} ({audit.actorRole})</div>
                    <div style={{ color: "#e2e8f0", fontSize: 12 }}>{audit.reason}</div>
                    <div style={{ color: "#94a3b8", fontSize: 11 }}>{formatTs(audit.timestamp)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ color: "#e2e8f0", fontWeight: 700, marginBottom: 8 }}>Last 5 Events</div>
            <div style={{ display: "grid", gap: 6 }}>
              {data.recentEvents.map((event, idx) => (
                <div
                  key={`${event.ts}-${event.kind}-${idx}`}
                  style={{
                    border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: 8,
                    padding: "8px 10px",
                    display: "grid",
                    gap: 3,
                  }}
                >
                  <div style={{ color: "#cbd5e1", fontSize: 12 }}>{formatTs(event.ts)}</div>
                  <div style={{ color: "#fff", fontWeight: 700 }}>{event.kind}</div>
                  <div style={{ color: "#94a3b8", fontSize: 12 }}>Category: {event.category}</div>
                  {Boolean(event.meta?.eventType) && (
                    <div style={{ color: "#7dd3fc", fontSize: 12 }}>Stripe: {String(event.meta?.eventType)}</div>
                  )}
                </div>
              ))}
              {data.recentEvents.length === 0 && (
                <div style={{ color: "#94a3b8", fontSize: 13 }}>No telemetry events captured yet.</div>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
