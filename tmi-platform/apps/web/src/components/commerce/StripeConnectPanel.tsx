"use client";

/**
 * StripeConnectPanel — Express Connect onboarding CTA for performers.
 * Rule 20: never claim "paid out" without Connect + Stripe transfer confirmation.
 */

import { useCallback, useEffect, useState } from "react";

type ConnectStatus = {
  state: "loading" | "empty" | "data" | "error";
  connectReady: boolean;
  stripeAccountId: string | null;
  stripeOnboarded: boolean;
  availableBalanceCents?: number;
  pendingBalanceCents?: number;
  message: string;
};

export default function StripeConnectPanel({
  accentColor = "#00E5FF",
}: {
  accentColor?: string;
}) {
  const [status, setStatus] = useState<ConnectStatus>({
    state: "loading",
    connectReady: false,
    stripeAccountId: null,
    stripeOnboarded: false,
    message: "Loading Connect status…",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/stripe/connect/status", { cache: "no-store" });
      const data = (await res.json()) as ConnectStatus;
      setStatus({
        state: data.state ?? "data",
        connectReady: Boolean(data.connectReady),
        stripeAccountId: data.stripeAccountId ?? null,
        stripeOnboarded: Boolean(data.stripeOnboarded),
        availableBalanceCents: data.availableBalanceCents,
        pendingBalanceCents: data.pendingBalanceCents,
        message: data.message ?? "",
      });
    } catch {
      setStatus({
        state: "error",
        connectReady: false,
        stripeAccountId: null,
        stripeOnboarded: false,
        message: "Unable to load Connect status. Retry.",
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startOnboarding = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/connect/onboard", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string; code?: string };
      if (!res.ok || !data.url) {
        setError(
          data.code === "STRIPE_NOT_CONFIGURED"
            ? "Stripe keys not configured (ENV). Payouts unavailable until STRIPE_SECRET_KEY is set."
            : data.error ?? "Could not start Connect onboarding.",
        );
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error starting Connect onboarding.");
    } finally {
      setBusy(false);
    }
  };

  const ac = accentColor;

  return (
    <div
      style={{
        padding: 14,
        borderRadius: 10,
        border: `1px solid ${ac}44`,
        background: "rgba(5,5,16,0.65)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: ac }}>
        STRIPE CONNECT PAYOUTS
      </div>
      <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.45 }}>
        {status.state === "loading" ? "Loading Connect status…" : status.message}
      </p>
      {typeof status.availableBalanceCents === "number" && (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
          Available: ${(status.availableBalanceCents / 100).toFixed(2)}
          {typeof status.pendingBalanceCents === "number"
            ? ` · Pending: $${(status.pendingBalanceCents / 100).toFixed(2)}`
            : ""}
        </div>
      )}
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
        Status:{" "}
        {status.connectReady
          ? "READY — InstantPayout can transfer"
          : status.stripeAccountId
            ? "PENDING_CONNECT — funds stay in wallet"
            : "NOT STARTED"}
      </div>
      {!status.connectReady && (
        <button
          type="button"
          disabled={busy || status.state === "loading"}
          onClick={() => void startOnboarding()}
          style={{
            alignSelf: "flex-start",
            padding: "8px 14px",
            borderRadius: 8,
            border: `1px solid ${ac}`,
            background: `${ac}22`,
            color: "#fff",
            fontWeight: 700,
            fontSize: 12,
            cursor: busy ? "wait" : "pointer",
          }}
        >
          {busy
            ? "Opening Stripe…"
            : status.stripeAccountId
              ? "CONTINUE STRIPE ONBOARDING"
              : "CONNECT STRIPE EXPRESS"}
        </button>
      )}
      {error && (
        <p style={{ margin: 0, fontSize: 11, color: "#FF6B8A" }}>{error}</p>
      )}
    </div>
  );
}
