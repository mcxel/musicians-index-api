"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useCheckoutClickLock } from "@/hooks/useCheckoutClickLock";
import {
  formatArtistCommercePrice,
  type ArtistCommerceProduct,
} from "@/lib/commerce/ArtistCommerceTypes";

export default function MeetAndGreetPage({
  params,
}: {
  params: Promise<{ artistSlug: string }>;
}) {
  const { artistSlug } = use(params);
  const displayName = artistSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const { busy, label, runCheckout, reset } = useCheckoutClickLock();
  const [product, setProduct] = useState<ArtistCommerceProduct | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/commerce/products?artistSlug=${encodeURIComponent(artistSlug)}&seed=1`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((d: { products?: ArtistCommerceProduct[] }) => {
        if (cancelled) return;
        const meet =
          d.products?.find((p) => p.type === "MEET_AND_GREET" && p.active) ?? null;
        setProduct(meet);
        if (!meet) setError("This artist has no active Meet & Greet product yet.");
      })
      .catch(() => {
        if (!cancelled) setError("Could not load artist store.");
      });
    return () => {
      cancelled = true;
    };
  }, [artistSlug]);

  const priceLabel = product ? formatArtistCommercePrice(product) : "—";
  const soldOut = product?.inventory != null && product.inventory <= 0;

  function book() {
    if (!product || busy || soldOut) return;
    setError("");
    void runCheckout(async () => {
      const res = await fetch("/api/commerce/checkout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          cancelUrl: `/meet/${artistSlug}`,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string; code?: string };
      if (!res.ok || !data.url) {
        setError(
          data.code === "AUTH_REQUIRED"
            ? "Sign in required to book."
            : data.error ?? "Checkout failed",
        );
        reset();
        return null;
      }
      return data.url;
    });
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050510", padding: "60px 20px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
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
            MEET & GREET
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
            Book a private session with {displayName}. 15 minutes, 1-on-1.
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#FF2DAA", marginTop: 10 }}>
            {priceLabel} per session
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 20px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
              {product?.title ?? "Meet & Greet Pass"}
            </div>
            <div
              style={{
                fontSize: 9,
                color: soldOut ? "#FF5555" : "#00FF88",
                marginTop: 3,
              }}
            >
              {soldOut
                ? "Sold out"
                : product?.inventory != null
                  ? `${product.inventory} remaining`
                  : "Available now"}
            </div>
          </div>
          {!soldOut && product ? (
            <button
              type="button"
              onClick={book}
              disabled={busy}
              style={{
                padding: "9px 16px",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.12em",
                color: "#050510",
                background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)",
                borderRadius: 7,
                border: "none",
                cursor: busy ? "wait" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {label ?? `BOOK ${priceLabel}`}
            </button>
          ) : (
            <span
              style={{
                fontSize: 9,
                color: "rgba(255,255,255,0.2)",
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              SOLD OUT
            </span>
          )}
        </div>
        {error && (
          <div style={{ marginTop: 12, fontSize: 11, color: "#FF2DAA", textAlign: "center" }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
