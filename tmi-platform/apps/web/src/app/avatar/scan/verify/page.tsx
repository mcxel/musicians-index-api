"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { generateFromFace } from "@/lib/avatar/avatarEngine";
import type { AvatarConfig } from "@/lib/avatar/avatarEngine";

type VerifyStatus = "pending" | "verifying" | "passed" | "failed";

const VERIFY_CHECKS = [
  "Facial geometry mapping",
  "Liveness detection",
  "Depth sensor calibration",
  "Anti-spoof analysis",
  "Seed hash generation",
];

export default function AvatarScanVerifyPage() {
  const searchParams = useSearchParams() ?? undefined;
  const scanId = searchParams?.get("scanId") || `scan_${Date.now().toString(36)}`;

  const [status, setStatus] = useState<VerifyStatus>("pending");
  const [checks, setChecks] = useState<boolean[]>([]);
  const [avatar, setAvatar] = useState<AvatarConfig | null>(null);

  function startVerification() {
    setStatus("verifying");
    setChecks([]);

    VERIFY_CHECKS.forEach((_, i) => {
      setTimeout(() => {
        setChecks(prev => {
          const next = [...prev, true];
          if (next.length === VERIFY_CHECKS.length) {
            const generated = generateFromFace(scanId, "current-user");
            setAvatar(generated);
            setStatus("passed");
          }
          return next;
        });
      }, 400 * (i + 1));
    });
  }

  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: "0 0 60px" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(2,6,23,0.96)", borderBottom: "1px solid rgba(255,45,170,0.3)", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(8px)" }}>
        <Link href="/avatar/scan" style={{ color: "#f9a8d4", fontSize: 10, textDecoration: "none", border: "1px solid rgba(255,45,170,0.35)", borderRadius: 5, padding: "3px 9px", fontWeight: 700 }}>← SCAN</Link>
        <strong style={{ color: "#f9a8d4", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>VERIFY</strong>
      </header>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {(["SCAN", "VERIFY", "BUILD", "WARDROBE"] as const).map((step, i) => {
            const routes = ["/avatar/scan", "/avatar/scan/verify", "/avatar/scan/build", "/avatar/scan/wardrobe"];
            const active = i === 1;
            return (
              <Link key={step} href={routes[i]} style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 6, border: `1px solid ${active ? "#FF2DAA" : "#334155"}`, background: active ? "rgba(255,45,170,0.12)" : "transparent", color: active ? "#f9a8d4" : "#475569", fontSize: 9, fontWeight: 700, textDecoration: "none", letterSpacing: "0.1em" }}>
                {i + 1}. {step}
              </Link>
            );
          })}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ color: "#64748b", fontSize: 10, letterSpacing: "0.1em", marginBottom: 4 }}>SCAN ID</div>
          <div style={{ fontFamily: "monospace", color: "#94a3b8", fontSize: 12, background: "rgba(255,255,255,0.04)", border: "1px solid #1e293b", borderRadius: 6, padding: "8px 12px" }}>{scanId}</div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1e293b", borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ color: "#94a3b8", fontSize: 10, letterSpacing: "0.12em", marginBottom: 12 }}>VERIFICATION CHECKS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {VERIFY_CHECKS.map((check, i) => {
              const done = i < checks.length;
              const running = status === "verifying" && i === checks.length;
              return (
                <div key={check} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: done ? "rgba(34,197,94,0.2)" : running ? "rgba(255,45,170,0.2)" : "rgba(255,255,255,0.06)", border: `1px solid ${done ? "#22c55e" : running ? "#FF2DAA" : "#334155"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: done ? "#22c55e" : running ? "#FF2DAA" : "#334155", flexShrink: 0 }}>
                    {done ? "✓" : running ? "●" : "○"}
                  </div>
                  <span style={{ color: done ? "#e2e8f0" : running ? "#f9a8d4" : "#475569", fontSize: 11 }}>{check}</span>
                  {running && <span style={{ color: "#FF2DAA", fontSize: 9, marginLeft: "auto" }}>RUNNING...</span>}
                </div>
              );
            })}
          </div>
        </div>

        {status === "passed" && avatar && (
          <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
            <div style={{ color: "#22c55e", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>IDENTITY VERIFIED</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {[
                ["Skin Tone", avatar.skinTone],
                ["Hair Style", avatar.hairStyle],
                ["Animation", avatar.animation],
                ["Avatar ID", avatar.id.slice(-8)],
              ].map(([k, v]) => (
                <div key={k} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 6, padding: "6px 10px" }}>
                  <div style={{ color: "#475569", fontSize: 9 }}>{k}</div>
                  <div style={{ color: "#94a3b8", fontSize: 11, marginTop: 2 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === "pending" && (
          <button onClick={startVerification} style={{ width: "100%", background: "linear-gradient(135deg, rgba(255,45,170,0.2), rgba(170,45,255,0.2))", border: "1px solid rgba(255,45,170,0.5)", borderRadius: 8, color: "#f9a8d4", fontSize: 13, padding: "12px 0", cursor: "pointer", fontWeight: 700, letterSpacing: "0.12em" }}>
            RUN VERIFICATION
          </button>
        )}

        {status === "passed" && (
          <Link href={`/avatar/scan/build?scanId=${scanId}`} style={{ display: "block", textAlign: "center", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 8, color: "#22c55e", fontSize: 12, padding: "12px 0", fontWeight: 700, textDecoration: "none" }}>
            BUILD AVATAR →
          </Link>
        )}
      </div>
    </main>
  );
}
