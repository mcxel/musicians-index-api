"use client";

import { useState } from "react";
import Link from "next/link";
import AvatarFaceScanPanel from "@/components/avatar/AvatarFaceScanPanel";

type ScanStage = "idle" | "scanning" | "processing" | "complete" | "error";

export default function AvatarScanPage() {
  const [stage, setStage] = useState<ScanStage>("idle");
  const [scanActive, setScanActive] = useState(false);
  const [scanId, setScanId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  function startScan() {
    setStage("scanning");
    setScanActive(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          const id = `scan_${Date.now().toString(36)}`;
          setScanId(id);
          setScanActive(false);
          setStage("processing");
          setTimeout(() => setStage("complete"), 1800);
          return 100;
        }
        return p + Math.floor(Math.random() * 8 + 4);
      });
    }, 120);
  }

  function resetScan() {
    setStage("idle");
    setScanActive(false);
    setScanId(null);
    setProgress(0);
  }

  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: "0 0 60px" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(2,6,23,0.96)", borderBottom: "1px solid rgba(255,45,170,0.3)", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(8px)" }}>
        <Link href="/avatar" style={{ color: "#f9a8d4", fontSize: 10, textDecoration: "none", border: "1px solid rgba(255,45,170,0.35)", borderRadius: 5, padding: "3px 9px", fontWeight: 700 }}>← AVATAR</Link>
        <strong style={{ color: "#f9a8d4", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>FACE SCAN</strong>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Link href="/avatar/scan/verify" style={{ color: "#64748b", fontSize: 10, textDecoration: "none", border: "1px solid #334155", borderRadius: 5, padding: "3px 9px" }}>VERIFY →</Link>
          <Link href="/avatar/scan/build" style={{ color: "#64748b", fontSize: 10, textDecoration: "none", border: "1px solid #334155", borderRadius: 5, padding: "3px 9px" }}>BUILD →</Link>
        </div>
      </header>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 20px" }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 18, color: "#f9a8d4", fontWeight: 700 }}>Face Scan — Avatar Seed Capture</h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: 12 }}>Capture your facial scan to generate a personalized TMI avatar. Your scan data never leaves this device.</p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["SCAN", "VERIFY", "BUILD", "WARDROBE"] as const).map((step, i) => {
            const routes = ["/avatar/scan", "/avatar/scan/verify", "/avatar/scan/build", "/avatar/scan/wardrobe"];
            const active = i === 0;
            const done = false;
            return (
              <Link key={step} href={routes[i]} style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 6, border: `1px solid ${active ? "#FF2DAA" : "#334155"}`, background: active ? "rgba(255,45,170,0.12)" : "transparent", color: active ? "#f9a8d4" : "#475569", fontSize: 9, fontWeight: 700, textDecoration: "none", letterSpacing: "0.1em" }}>
                {i + 1}. {step}
              </Link>
            );
          })}
        </div>

        <AvatarFaceScanPanel scanActive={scanActive} setScanActive={setScanActive} />

        <div style={{ marginTop: 20 }}>
          {stage !== "complete" && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#94a3b8", fontSize: 10 }}>SCAN PROGRESS</span>
                <span style={{ color: "#f9a8d4", fontSize: 10 }}>{progress}%</span>
              </div>
              <div style={{ height: 4, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #FF2DAA, #AA2DFF)", borderRadius: 2, transition: "width 0.1s" }} />
              </div>
            </div>
          )}

          {stage === "idle" && (
            <button onClick={startScan} style={{ width: "100%", background: "linear-gradient(135deg, rgba(255,45,170,0.2), rgba(170,45,255,0.2))", border: "1px solid rgba(255,45,170,0.5)", borderRadius: 8, color: "#f9a8d4", fontSize: 13, padding: "12px 0", cursor: "pointer", fontWeight: 700, letterSpacing: "0.12em" }}>
              INITIATE FACE SCAN
            </button>
          )}

          {stage === "scanning" && (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ color: "#FF2DAA", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>SCANNING...</div>
              <div style={{ color: "#64748b", fontSize: 10 }}>Hold still — reading facial geometry</div>
            </div>
          )}

          {stage === "processing" && (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <div style={{ color: "#AA2DFF", fontSize: 12, fontWeight: 700, marginBottom: 4 }}>PROCESSING SCAN DATA...</div>
              <div style={{ color: "#64748b", fontSize: 10 }}>Generating avatar seed from facial map</div>
            </div>
          )}

          {stage === "complete" && scanId && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.35)", borderRadius: 8, padding: "12px 16px", textAlign: "center" }}>
                <div style={{ color: "#22c55e", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>SCAN COMPLETE</div>
                <div style={{ color: "#64748b", fontSize: 10, marginBottom: 8 }}>Scan ID: <span style={{ color: "#94a3b8", fontFamily: "monospace" }}>{scanId}</span></div>
                <div style={{ color: "#94a3b8", fontSize: 11 }}>Face seed captured — proceed to verification</div>
              </div>
              <Link href={`/avatar/scan/verify?scanId=${scanId}`} style={{ display: "block", textAlign: "center", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: 8, color: "#22c55e", fontSize: 12, padding: "10px 0", fontWeight: 700, textDecoration: "none" }}>
                PROCEED TO VERIFY →
              </Link>
              <button onClick={resetScan} style={{ background: "transparent", border: "1px solid #334155", borderRadius: 8, color: "#64748b", fontSize: 11, padding: "8px 0", cursor: "pointer" }}>
                RESCAN
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
