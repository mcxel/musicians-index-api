"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useCheckoutClickLock } from "@/hooks/useCheckoutClickLock";
import {
  formatArtistCommercePrice,
  type ArtistCommerceProduct,
} from "@/lib/commerce/ArtistCommerceTypes";

export default function ShoutoutPage({ params }: { params: Promise<{ artistSlug: string }> }) {
  const { artistSlug } = use(params);
  const displayName = artistSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const { busy, label, runCheckout, reset } = useCheckoutClickLock();

  const [yourName, setYourName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [requestMsg, setRequestMsg] = useState("");
  const [product, setProduct] = useState<ArtistCommerceProduct | null>(null);
  const [loadError, setLoadError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/commerce/products?artistSlug=${encodeURIComponent(artistSlug)}&seed=1`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d: { products?: ArtistCommerceProduct[] }) => {
        if (cancelled) return;
        const shout =
          d.products?.find((p) => p.type === "SHOUTOUT" && p.active) ??
          d.products?.find((p) => p.type === "SHOUTOUT") ??
          null;
        setProduct(shout);
        if (!shout) setLoadError("This artist has no active shoutout product yet.");
      })
      .catch(() => {
        if (!cancelled) setLoadError("Could not load artist store.");
      });
    return () => {
      cancelled = true;
    };
  }, [artistSlug]);

  const canProceed =
    Boolean(product) && yourName.trim().length > 0 && requestMsg.trim().length > 0 && !busy;

  function handleOrder() {
    if (!canProceed || !product) return;
    setCheckoutError("");
    void runCheckout(async () => {
      const res = await fetch("/api/commerce/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          yourName: yourName.trim(),
          occasion: occasion.trim(),
          requestMsg: requestMsg.trim(),
          cancelUrl: `/shoutout/${artistSlug}`,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string; code?: string };
      if (!res.ok || !data.url) {
        setCheckoutError(
          data.code === "AUTH_REQUIRED"
            ? "Sign in required to request a shoutout."
            : data.error ?? "Checkout failed",
        );
        reset();
        return null;
      }
      return data.url;
    });
  }

  const priceLabel = product ? formatArtistCommercePrice(product) : "—";

  return (
    <div style={{ minHeight: "100vh", background: "#050510", padding: "60px 20px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link
            href={`/artists/${artistSlug}`}
            style={{
              fontSize: 9,
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.3)",
              textDecoration: "none",
            }}
          >
            ← {displayName}
          </Link>
          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#fff",
              letterSpacing: 2,
              marginTop: 10,
            }}
          >
            REQUEST A SHOUTOUT
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
            Get a personal message from {displayName} — delivered within 7 days.
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#AA2DFF", marginTop: 10 }}>
            {priceLabel}
          </div>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
            padding: 24,
          }}
        >
          {loadError && (
            <div style={{ color: "#FF2DAA", fontSize: 12, marginBottom: 12 }}>{loadError}</div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 8,
                letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.35)",
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              YOUR NAME *
            </label>
            <input
              type="text"
              value={yourName}
              onChange={(e) => setYourName(e.target.value)}
              placeholder="What should they call you?"
              style={{
                width: "100%",
                padding: "11px 13px",
                fontSize: 13,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 7,
                color: "#fff",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label
              style={{
                display: "block",
                fontSize: 8,
                letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.35)",
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              OCCASION (OPTIONAL)
            </label>
            <input
              type="text"
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              placeholder="e.g. Birthday, Anniversary, Just because..."
              style={{
                width: "100%",
                padding: "11px 13px",
                fontSize: 13,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 7,
                color: "#fff",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 8,
                letterSpacing: "0.18em",
                color: "rgba(255,255,255,0.35)",
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              YOUR MESSAGE REQUEST *
            </label>
            <textarea
              rows={4}
              value={requestMsg}
              onChange={(e) => setRequestMsg(e.target.value)}
              placeholder="Tell them what you'd like them to say..."
              style={{
                width: "100%",
                padding: "11px 13px",
                fontSize: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 7,
                color: "#fff",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>
          <button
            type="button"
            onClick={handleOrder}
            disabled={!canProceed}
            style={{
              display: "block",
              width: "100%",
              textAlign: "center",
              padding: "13px",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.15em",
              color: "#fff",
              background: canProceed
                ? "linear-gradient(135deg,#AA2DFF,#FF2DAA)"
                : "rgba(255,255,255,0.1)",
              borderRadius: 7,
              border: "none",
              cursor: canProceed ? "pointer" : "not-allowed",
              opacity: canProceed ? 1 : 0.5,
            }}
          >
            {label ?? `REQUEST SHOUTOUT — ${priceLabel} →`}
          </button>
          {checkoutError && (
            <div style={{ textAlign: "center", fontSize: 10, color: "#FF2DAA", marginTop: 8 }}>
              {checkoutError}
            </div>
          )}
          {!canProceed && !busy && (
            <div
              style={{
                textAlign: "center",
                fontSize: 10,
                color: "rgba(255,255,255,0.25)",
                marginTop: 8,
              }}
            >
              Fill in your name and message to continue
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
