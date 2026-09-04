"use client";

import { useEffect, useState } from "react";

export default function ConcertTicketButton({
  eventId,
  price,
  venueSlug,
  autoStart = false,
}: {
  eventId: string;
  price: number;
  venueSlug: string;
  autoStart?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tickets/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          eventSlug: eventId,
          eventId,
          venueSlug,
          tier: "STANDARD",
          quantity: 1,
          faceValue: price,
          successUrl: `${window.location.origin}/concerts/${encodeURIComponent(eventId)}?status=success`,
          cancelUrl: `${window.location.origin}/concerts/${encodeURIComponent(eventId)}?status=cancelled`,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (res.status === 401) {
        window.location.href = `/auth?next=/concerts/${encodeURIComponent(eventId)}`;
        return;
      }
      if (!res.ok || !data.url) {
        setError(data.error === "payments_not_configured" ? "Payments not configured." : "Checkout unavailable.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Checkout unavailable.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (autoStart) void start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={() => void start()}
        style={{
          display: "inline-block",
          padding: "12px 32px",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.15em",
          color: "#050510",
          background: "#FFD700",
          borderRadius: 10,
          border: "none",
          cursor: busy ? "wait" : "pointer",
        }}
      >
        {busy ? "OPENING CHECKOUT…" : `GET TICKET · $${price}`}
      </button>
      {error ? <div style={{ marginTop: 10, fontSize: 12, color: "#FF3B5C" }}>{error}</div> : null}
    </div>
  );
}
