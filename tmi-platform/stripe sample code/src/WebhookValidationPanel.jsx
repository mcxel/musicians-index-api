import React, { useEffect, useState } from "react";

function Dot({ ok }) {
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        display: "inline-block",
        background: ok ? "#00c851" : "#ff4444",
        boxShadow: ok ? "0 0 8px rgba(0,200,81,0.8)" : "0 0 8px rgba(255,68,68,0.8)",
      }}
    />
  );
}

export default function WebhookValidationPanel() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/webhook-health", { cache: "no-store" });
      if (!res.ok) throw new Error(`Health endpoint error ${res.status}`);
      const json = await res.json();
      setData(json);
      setError("");
    } catch (e) {
      setError(e.message || "Failed to load webhook health");
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  if (!data) {
    return (
      <div className="validation-panel">
        <div className="validation-title">Final Webhook Validation</div>
        <p className="validation-copy">Loading Stripe webhook health...</p>
        {error ? <p className="validation-error">{error}</p> : null}
      </div>
    );
  }

  const isTestMode = data.stripeMode === "test";
  const checkoutSeen = Boolean(data?.flow?.checkout_session_completed_seen);
  const invoiceSeen = Boolean(data?.flow?.invoice_payment_succeeded_seen);

  return (
    <div className="validation-panel">
      <div className="validation-title">Final Webhook Validation</div>

      <div className="validation-grid">
        <div className="validation-row">
          <span>Stripe Mode</span>
          <span className={isTestMode ? "badge-test" : "badge-live"}>{String(data.stripeMode || "unknown").toUpperCase()}</span>
        </div>
        <div className="validation-row">
          <span>Webhook Secret Configured</span>
          <span><Dot ok={Boolean(data.endpointConfigured)} /></span>
        </div>
        <div className="validation-row">
          <span>checkout.session.completed Seen</span>
          <span><Dot ok={checkoutSeen} /></span>
        </div>
        <div className="validation-row">
          <span>invoice.payment_succeeded Seen</span>
          <span><Dot ok={invoiceSeen} /></span>
        </div>
      </div>

      <div className="validation-copy">
        {isTestMode
          ? "You are in Stripe sandbox/test mode. Keep validating here before going live."
          : "Live mode active. Ensure strict webhook monitoring and reconciliation."}
      </div>

      <div className="validation-copy">
        Supported webhook paths:
        <ul>
          {(data.webhookUrlOptions || []).map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>
      </div>

      <div className="validation-copy">
        Stripe should show 200 OK for test sends. If not, inspect logs and signature config.
      </div>

      {data.lastError ? <p className="validation-error">Last error: {String(data.lastError)}</p> : null}
    </div>
  );
}
