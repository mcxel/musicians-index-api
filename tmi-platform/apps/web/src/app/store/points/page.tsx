"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import BuyPointsSection from "@/components/store/BuyPointsSection";

function PointsStoreInner() {
  const params = useSearchParams();
  const purchased = params?.get("purchased") ?? null;
  const [role, setRole] = useState<"FAN" | "PERFORMER">("FAN");

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d: { user?: { role?: string } }) => {
        const r = (d.user?.role ?? "FAN").toUpperCase();
        if (["PERFORMER", "ARTIST", "BAND"].includes(r)) setRole("PERFORMER");
        else setRole("FAN");
      })
      .catch(() => {});
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ maxWidth: 960, margin: "0 auto", padding: "52px 24px 40px" }}>
        <Link
          href="/store"
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: 20,
          }}
        >
          ← Back to Store
        </Link>
        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FFD700", fontWeight: 800, marginBottom: 10 }}>
          POINTS STORE
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, margin: "0 0 12px" }}>
          Buy Points. Enter. Customize.
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", maxWidth: 560, lineHeight: 1.7, marginBottom: 20 }}>
          Micro packs for broke artists · spend on participation, playlist skins, venue upgrades, and cosmetics.
          {role === "PERFORMER"
            ? " Performers: no avatar ownership UI — venue/stage + shared cosmetics only."
            : " Fans: full avatar cosmetics path (Rule 26)."}
        </p>

        {purchased === "1" && (
          <div
            style={{
              marginBottom: 20,
              padding: "12px 16px",
              borderRadius: 10,
              background: "rgba(0,255,136,0.1)",
              border: "1px solid rgba(0,255,136,0.35)",
              color: "#00FF88",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            Payment received — points grant when Stripe webhook confirms.
          </div>
        )}

        <BuyPointsSection role={role} accent="#FFD700" showSpendCatalog />
      </section>
    </main>
  );
}

export default function PointsStorePage() {
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: "100vh", background: "#050510", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          Loading points store…
        </main>
      }
    >
      <PointsStoreInner />
    </Suspense>
  );
}
