"use client";

import { useEffect, useState } from "react";
import type { CommerceCategory } from "@/lib/commerce/commerceEngine";

type CommerceItem = {
  id: string;
  name: string;
  category: CommerceCategory;
  price: number;
  stock: number;
};

type CheckoutResult = {
  checkoutId: string;
  subtotal: number;
  creatorRoyalty: number;
  sponsorSplit: number;
  venueCut: number;
  platformNet: number;
};

export default function StoreCategoryClient({ category, title }: { category: CommerceCategory; title: string }) {
  const [items, setItems] = useState<CommerceItem[]>([]);
  const [status, setStatus] = useState("");

  const loadItems = async () => {
    const response = await fetch(`/api/store/items?category=${encodeURIComponent(category)}`, { cache: "no-store" });
    const payload = await response.json();
    setItems(payload.items ?? []);
  };

  useEffect(() => {
    void loadItems();
  }, [category]);

  const buy = async (itemId: string) => {
    setStatus("Processing checkout...");
    const response = await fetch("/api/store/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ itemId, qty: 1 }] }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setStatus(payload.error ?? "checkout_failed");
      return;
    }

    const checkout = payload.checkout as CheckoutResult;
    setStatus(
      `Checkout ${checkout.checkoutId} | subtotal $${checkout.subtotal.toFixed(2)} | creator $${checkout.creatorRoyalty.toFixed(2)} | venue $${checkout.venueCut.toFixed(2)}`,
    );
    await loadItems();
  };

  return (
    <main style={{ minHeight: "100vh", background: "#090712", color: "#fff", padding: 20 }}>
      <section style={{ maxWidth: 860, margin: "0 auto", border: "1px solid #5f4485", borderRadius: 16, background: "#140d22", padding: 20 }}>
        <h1 style={{ marginTop: 0 }}>{title}</h1>
        <p style={{ color: "#cbb7e8", fontSize: 13 }}>Operational catalog with real checkout and inventory sync.</p>
        <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
          {items.map((item) => (
            <div key={item.id} style={{ border: "1px solid #3f2d62", borderRadius: 12, padding: 12, background: "#120b1f" }}>
              <div style={{ fontWeight: 700 }}>{item.name}</div>
              <div style={{ color: "#cbb7e8", fontSize: 12 }}>
                ${item.price.toFixed(2)} | stock {item.stock}
              </div>
              <button
                type="button"
                disabled={item.stock <= 0}
                onClick={() => void buy(item.id)}
                style={{ marginTop: 8, borderRadius: 999, border: "1px solid #8064b2", background: "#2c1c47", color: "#fff", padding: "6px 12px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}
              >
                Buy 1
              </button>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, color: "#b8e4ff", fontSize: 12 }}>{status}</div>
      </section>
    </main>
  );
}
