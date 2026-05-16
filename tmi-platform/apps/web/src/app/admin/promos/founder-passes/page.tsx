"use client";

import { useEffect, useState } from "react";
import { getFounderShareLinks, getFounderDiamondPasses, initializeFounderDiamondPasses } from "@/lib/promos/FounderDiamondPassEngine";
import Link from "next/link";

export default function FounderDiamondPassesPage() {
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    initializeFounderDiamondPasses();
  }, []);

  const passes = getFounderDiamondPasses();
  const links = getFounderShareLinks();

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main className="min-h-screen" style={{ background: "#050510", color: "#fff", padding: "40px 24px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="text-xs font-mono tracking-widest mb-2" style={{ color: "#FFD700" }}>
              FOUNDER GRANTS
            </div>
            <h1 className="text-2xl font-black">Diamond Fan Passes — Lifetime</h1>
            <p className="text-sm text-white/40 mt-1">
              Personal grants from Marcel Dickens. Active forever. No expiration.
            </p>
          </div>
          <Link
            href="/admin/promos"
            className="text-xs px-4 py-2 rounded-full"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
          >
            ← All Promos
          </Link>
        </div>

        {/* Pass Cards */}
        <div className="space-y-4">
          {passes.map((pass, i) => {
            const linkData = links[i];
            return (
              <div
                key={pass.email}
                className="rounded-2xl p-6"
                style={{ background: "rgba(255,215,0,0.05)", border: "2px solid rgba(255,215,0,0.25)" }}
              >
                {/* Tier badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💎</span>
                    <div>
                      <div className="text-base font-black text-white">{pass.name}</div>
                      <div className="text-xs text-white/40">{pass.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs px-3 py-1 rounded-full font-black"
                      style={{ background: "rgba(255,215,0,0.2)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.4)" }}
                    >
                      DIAMOND
                    </span>
                    <span
                      className="text-xs px-3 py-1 rounded-full font-bold"
                      style={{ background: "rgba(0,255,136,0.15)", color: "#00FF88", border: "1px solid rgba(0,255,136,0.3)" }}
                    >
                      LIFETIME
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label: "Granted By", value: pass.grantedBy },
                    { label: "Grant Date", value: pass.grantedAt.toLocaleDateString() },
                    { label: "Role", value: "Fan" },
                    { label: "Status", value: pass.active ? "✓ Active" : "Revoked" },
                  ].map(d => (
                    <div key={d.label} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="text-xs text-white/30 mb-1">{d.label}</div>
                      <div className="text-xs font-bold text-white">{d.value}</div>
                    </div>
                  ))}
                </div>

                {/* Promo Code */}
                <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="text-xs text-white/30 mb-2 font-mono">PROMO CODE</div>
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-sm font-mono" style={{ color: "#FFD700" }}>{pass.code}</code>
                    <button
                      onClick={() => copyToClipboard(pass.code, `code-${i}`)}
                      className="text-xs px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        background: copied === `code-${i}` ? "rgba(0,255,136,0.2)" : "rgba(255,215,0,0.15)",
                        color: copied === `code-${i}` ? "#00FF88" : "#FFD700",
                        border: `1px solid ${copied === `code-${i}` ? "rgba(0,255,136,0.4)" : "rgba(255,215,0,0.3)"}`,
                      }}
                    >
                      {copied === `code-${i}` ? "✓ Copied" : "Copy Code"}
                    </button>
                  </div>
                </div>

                {/* Share Link */}
                <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="text-xs text-white/30 mb-2 font-mono">SHARE LINK — SEND TO MEMBER</div>
                  <div className="flex items-center justify-between gap-3">
                    <code className="text-xs font-mono text-white/60 truncate">{linkData.link}</code>
                    <button
                      onClick={() => copyToClipboard(linkData.link, `link-${i}`)}
                      className="text-xs px-3 py-1.5 rounded-lg transition-all shrink-0"
                      style={{
                        background: copied === `link-${i}` ? "rgba(0,255,136,0.2)" : "rgba(0,255,255,0.1)",
                        color: copied === `link-${i}` ? "#00FF88" : "#00FFFF",
                        border: `1px solid ${copied === `link-${i}` ? "rgba(0,255,136,0.4)" : "rgba(0,255,255,0.3)"}`,
                      }}
                    >
                      {copied === `link-${i}` ? "✓ Copied" : "Copy Link"}
                    </button>
                  </div>
                </div>

                {/* Email action */}
                <div className="mt-4 flex gap-3">
                  <a
                    href={`mailto:${pass.email}?subject=Your%20Free%20Diamond%20Fan%20Pass%20%E2%80%94%20The%20Musician's%20Index&body=Hey%20${encodeURIComponent(pass.name)}!%0A%0AYou've%20been%20granted%20a%20FREE%20Lifetime%20Diamond%20Fan%20Pass%20by%20Marcel%20Dickens%20at%20The%20Musician's%20Index.%0A%0ARedeem%20your%20pass%20here%3A%0A${encodeURIComponent(linkData.link)}%0A%0AOr%20use%20promo%20code%3A%20${pass.code}%0A%0AWelcome%20to%20TMI!`}
                    className="text-xs px-4 py-2 rounded-full"
                    style={{ background: "rgba(255,45,170,0.12)", border: "1px solid rgba(255,45,170,0.3)", color: "#FF2DAA" }}
                  >
                    ✉️ Send Email to {pass.email}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTAs */}
        <div className="flex gap-4 mt-10 flex-wrap">
          <Link
            href="/admin/promos/create"
            className="px-6 py-3 rounded-full text-sm font-bold"
            style={{ background: "#FFD700", color: "#000" }}
          >
            Create New Promo Code →
          </Link>
          <Link
            href="/admin/promos"
            className="px-6 py-3 rounded-full text-sm font-bold"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}
          >
            All Promo Codes
          </Link>
        </div>
      </div>
    </main>
  );
}
