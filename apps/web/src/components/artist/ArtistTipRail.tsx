"use client";

/**
 * ArtistTipRail — tip jar / tips-received surface.
 * Rule 20: no fabricated tip activity. Send uses POST /api/tips → Stripe Checkout.
 */

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useState } from "react";

const TIP_AMOUNTS = [5, 10, 25, 50, 100];

export type ArtistTipRailMode = "send" | "received";

export interface ArtistTipRailProps {
  /** Performer slug or user id for Stripe tip recipient (required for send). */
  artistSlug?: string;
  /** send = fan tips artist; received = artist views tip history (honest empty until ledger feed exists). */
  mode?: ArtistTipRailMode;
  roomId?: string;
}

export default function ArtistTipRail({
  artistSlug,
  mode = "send",
  roomId,
}: ArtistTipRailProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSend = mode === "send" && Boolean(artistSlug?.trim());

  const handleSend = useCallback(async () => {
    if (!selected || !artistSlug?.trim()) return;
    setStatus("loading");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          artistSlug: artistSlug.trim(),
          amount: selected,
          ...(roomId ? { roomId } : {}),
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string; code?: string };
      if (!res.ok || !data.url) {
        setStatus("error");
        setErrorMsg(
          data.error ??
            (data.code === "STRIPE_NOT_CONFIGURED"
              ? "Tips unavailable — payments not configured."
              : "Could not start tip checkout."),
        );
        return;
      }
      window.location.href = data.url;
    } catch {
      setStatus("error");
      setErrorMsg("Network error — tip not sent.");
    }
  }, [selected, artistSlug, roomId]);

  if (mode === "received") {
    return (
      <div
        data-testid="artist-tip-rail-received"
        style={{
          background: "linear-gradient(135deg, rgba(170,45,255,0.04) 0%, rgba(0,0,0,0) 100%)",
          border: "1px solid rgba(170,45,255,0.12)",
          borderLeft: "3px solid #AA2DFF",
          borderRadius: 10,
          padding: "20px 24px",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#AA2DFF",
            marginBottom: 12,
          }}
        >
          ♥ TIPS RECEIVED
        </div>
        <div
          data-testid="artist-tip-rail-empty"
          style={{
            padding: "16px 12px",
            borderRadius: 8,
            border: "1px dashed rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.45)",
            fontSize: 12,
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          No tips recorded yet. When fans tip through live checkout, settled tips will appear here.
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="artist-tip-rail-send"
      style={{
        background: "linear-gradient(135deg, rgba(170,45,255,0.04) 0%, rgba(0,0,0,0) 100%)",
        border: "1px solid rgba(170,45,255,0.12)",
        borderLeft: "3px solid #AA2DFF",
        borderRadius: 10,
        padding: "20px 24px",
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#AA2DFF",
          }}
        >
          ♥ TIP JAR
        </div>
      </div>

      {!canSend ? (
        <div
          data-testid="artist-tip-rail-unavailable"
          style={{
            padding: "12px",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.45)",
            fontSize: 12,
          }}
        >
          Tip checkout unavailable — artist recipient not bound.
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {TIP_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setSelected(selected === amt ? null : amt)}
                style={{
                  flex: "0 0 auto",
                  padding: "8px 14px",
                  borderRadius: 8,
                  border:
                    selected === amt
                      ? "1px solid rgba(170,45,255,0.7)"
                      : "1px solid rgba(170,45,255,0.2)",
                  background:
                    selected === amt ? "rgba(170,45,255,0.15)" : "rgba(170,45,255,0.04)",
                  color: selected === amt ? "#AA2DFF" : "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ${amt}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.button
              key="send"
              type="button"
              onClick={() => void handleSend()}
              disabled={!selected || status === "loading"}
              style={{
                width: "100%",
                marginBottom: 12,
                padding: "10px 0",
                borderRadius: 8,
                background: selected ? "rgba(170,45,255,0.18)" : "rgba(255,255,255,0.03)",
                border: selected
                  ? "1px solid rgba(170,45,255,0.5)"
                  : "1px solid rgba(255,255,255,0.07)",
                color: selected ? "#AA2DFF" : "rgba(255,255,255,0.2)",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.2em",
                cursor: selected && status !== "loading" ? "pointer" : "default",
                textTransform: "uppercase",
              }}
            >
              {status === "loading"
                ? "OPENING CHECKOUT…"
                : selected
                  ? `SEND $${selected} TIP`
                  : "SELECT AN AMOUNT"}
            </motion.button>
          </AnimatePresence>

          {errorMsg ? (
            <div
              data-testid="artist-tip-rail-error"
              style={{
                fontSize: 11,
                color: "#FF6B9A",
                marginBottom: 8,
              }}
            >
              {errorMsg}
            </div>
          ) : null}

          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.35)",
              lineHeight: 1.4,
            }}
          >
            Tips process through Stripe Checkout. You will leave this page to pay securely.
          </div>
        </>
      )}
    </div>
  );
}
