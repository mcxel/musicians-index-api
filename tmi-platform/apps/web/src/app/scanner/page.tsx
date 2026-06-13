"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

type ScanStatus = "idle" | "starting" | "scanning" | "found" | "error" | "denied";

const DEMO_CODES: Record<string, { event: string; holder: string; type: string; seat: string; valid: boolean }> = {
  "TMI2026001A12VIPFLOOR": { event: "Monthly Idol S2 Premiere", holder: "Fan Member",  type: "VIP Floor Pass",   seat: "A-12", valid: true  },
  "TMI2026002B03RESERVED":  { event: "Battle Night IV",           holder: "Jordan King",  type: "Reserved Seating", seat: "B-03", valid: true  },
  "TMI2026000USED":         { event: "Cypher Night Finale",       holder: "Alex Rivera",  type: "General Admission",seat: "GA",   valid: false },
};

export default function ScannerPage() {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const [status, setStatus]     = useState<ScanStatus>("idle");
  const [manualId, setManualId] = useState("");
  const [result, setResult]     = useState<null | { ticketId: string; event: string; holder: string; type: string; seat: string; valid: boolean; msg: string }>(null);
  const [history, setHistory]   = useState<typeof result[]>([]);
  const [cameraMode, setCameraMode] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraMode(false);
  }, []);

  const startCamera = useCallback(async () => {
    setStatus("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraMode(true);
      setStatus("scanning");
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "NotAllowedError") setStatus("denied");
      else setStatus("error");
    }
  }, []);

  useEffect(() => () => { stopCamera(); }, [stopCamera]);

  const processCode = useCallback((code: string) => {
    const id = code.trim().toUpperCase();
    if (!id) return;
    const demo = DEMO_CODES[id];
    const r = demo
      ? { ticketId: id, event: demo.event, holder: demo.holder, type: demo.type, seat: demo.seat, valid: demo.valid, msg: demo.valid ? "VALID — Clear to enter" : "ALREADY USED — Deny entry" }
      : { ticketId: id, event: "—", holder: "—", type: "—", seat: "—", valid: false, msg: "TICKET NOT FOUND" };
    setResult(r);
    setHistory(prev => [r, ...prev.slice(0, 9)]);
    if (!cameraMode) stopCamera();
  }, [cameraMode, stopCamera]);

  const validateManual = () => {
    if (!manualId.trim()) return;
    processCode(manualId);
    setManualId("");
  };

  const reset = () => { setResult(null); setStatus(cameraMode ? "scanning" : "idle"); inputRef.current?.focus(); };

  const glow = result ? (result.valid ? "0 0 40px rgba(0,255,136,0.3)" : "0 0 40px rgba(255,68,68,0.25)") : "none";

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} @keyframes scan{0%{top:10%}100%{top:85%}}`}</style>

      <nav style={{ background: "rgba(0,0,0,0.85)", borderBottom: "1px solid rgba(0,255,255,0.18)", padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/home/1"    style={{ fontSize: 11, fontWeight: 900, color: "#00FFFF", textDecoration: "none", letterSpacing: "0.12em" }}>TMI</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
        <Link href="/ticketing" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Ticketing</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
        <span style={{ fontSize: 11, color: "#00FFFF", fontWeight: 700 }}>Camera Scanner</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 14 }}>
          <Link href="/tickets/validate" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Manual Validate</Link>
          <Link href="/hub/venue"        style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Venue Hub</Link>
        </div>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 900, marginBottom: 8 }}>📷 TICKET SCANNER</div>
          <h1 style={{ fontSize: "clamp(24px,4vw,38px)", fontWeight: 900, margin: "0 0 8px", background: "linear-gradient(135deg, #fff, #00FFFF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Camera Check-In</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>Scan a QR code or barcode to validate admission, or enter the ticket ID manually below.</p>
        </div>

        {/* Camera viewport */}
        <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", background: "#0a0a1a", border: `1px solid ${cameraMode ? "#00FFFF40" : "rgba(255,255,255,0.08)"}`, marginBottom: 24, boxShadow: glow, transition: "box-shadow .4s ease" }}>
          <video ref={videoRef} playsInline muted autoPlay style={{ width: "100%", display: "block", aspectRatio: "4/3", objectFit: "cover", opacity: cameraMode ? 1 : 0.1, background: "#0a0a1a" }} />

          {cameraMode && status === "scanning" && (
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <div style={{ position: "absolute", inset: 40, border: "2px solid #00FFFF", borderRadius: 12, opacity: 0.6 }} />
              <div style={{ position: "absolute", left: "15%", right: "15%", height: 2, background: "linear-gradient(90deg, transparent, #00FFFF, transparent)", animation: "scan 2s ease-in-out infinite alternate" }} />
              <div style={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", gap: 6, background: "rgba(0,0,0,0.7)", borderRadius: 8, padding: "5px 10px" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "pulse 1.5s infinite" }} />
                <span style={{ fontSize: 9, fontWeight: 900, color: "#ef4444", letterSpacing: "0.1em" }}>SCANNING</span>
              </div>
            </div>
          )}

          {!cameraMode && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "rgba(5,5,16,0.85)" }}>
              <div style={{ fontSize: 48, opacity: 0.4 }}>📷</div>
              {status === "denied" && <p style={{ fontSize: 12, color: "#ef4444", textAlign: "center", maxWidth: 260, padding: "0 16px" }}>Camera access denied. Please allow camera access in your browser settings, then try again.</p>}
              {status === "error"  && <p style={{ fontSize: 12, color: "#ef4444", textAlign: "center" }}>Could not access camera. Use manual entry below.</p>}
              <button onClick={startCamera} style={{ padding: "12px 32px", borderRadius: 10, background: "#00FFFF", color: "#020810", fontWeight: 900, fontSize: 12, border: "none", cursor: "pointer", letterSpacing: "0.06em" }}>
                {status === "starting" ? "STARTING..." : "📷 START CAMERA"}
              </button>
            </div>
          )}
        </div>

        {cameraMode && (
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <button onClick={stopCamera} style={{ padding: "9px 20px", borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.55)", fontWeight: 800, fontSize: 11, cursor: "pointer" }}>Stop Camera</button>
          </div>
        )}

        {/* Manual entry */}
        <div style={{ padding: "20px 24px", background: "rgba(0,255,255,0.03)", border: "1px solid rgba(0,255,255,0.15)", borderRadius: 16, marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.4)", fontWeight: 800, marginBottom: 12 }}>OR ENTER TICKET ID MANUALLY</div>
          <div style={{ display: "flex", gap: 10 }}>
            <input ref={inputRef} value={manualId} onChange={e => setManualId(e.target.value)} onKeyDown={e => e.key === "Enter" && validateManual()} placeholder="TMI2026001A12VIPFLOOR" style={{ flex: 1, padding: "12px 16px", borderRadius: 9, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,255,255,0.25)", color: "#fff", fontSize: 13, fontFamily: "monospace", outline: "none" }} />
            <button onClick={validateManual} style={{ padding: "12px 22px", borderRadius: 9, background: "#00FFFF", color: "#020810", fontWeight: 900, fontSize: 11, border: "none", cursor: "pointer" }}>CHECK</button>
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.keys(DEMO_CODES).map(id => (
              <button key={id} onClick={() => setManualId(id)} style={{ padding: "4px 10px", borderRadius: 6, background: "rgba(0,255,255,0.06)", border: "1px solid rgba(0,255,255,0.2)", color: "#00FFFF", fontSize: 9, fontFamily: "monospace", cursor: "pointer", fontWeight: 700 }}>{id}</button>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div style={{ padding: "24px", background: result.valid ? "rgba(0,255,136,0.06)" : "rgba(255,68,68,0.06)", border: `1px solid ${result.valid ? "#00FF88" : "#FF4444"}35`, borderRadius: 18, marginBottom: 20, animation: "fadeIn .3s ease" }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: result.valid ? "#00FF88" : "#FF4444", marginBottom: 14 }}>{result.msg}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[["TICKET ID", result.ticketId], ["EVENT", result.event], ["HOLDER", result.holder], ["TYPE", result.type], ["SEAT", result.seat]].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: l === "TICKET ID" ? "monospace" : "inherit" }}>{v}</div>
                </div>
              ))}
            </div>
            <button onClick={reset} style={{ marginTop: 16, padding: "9px 20px", borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontWeight: 800, fontSize: 11, cursor: "pointer" }}>SCAN NEXT</button>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, marginBottom: 24 }}>
            <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 800, marginBottom: 12 }}>SCAN HISTORY ({history.length})</div>
            {history.map((h, i) => h && (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "monospace" }}>{h.ticketId}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{h.event}</div>
                </div>
                <span style={{ fontSize: 8, fontWeight: 900, color: h.valid ? "#00FF88" : "#FF4444", background: `${h.valid ? "#00FF88" : "#FF4444"}18`, border: `1px solid ${h.valid ? "#00FF88" : "#FF4444"}40`, borderRadius: 4, padding: "2px 8px" }}>{h.valid ? "VALID" : "DENIED"}</span>
              </div>
            ))}
          </div>
        )}

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
          {[
            { href: "/tickets/validate", label: "Manual Validate", color: "#00FFFF" },
            { href: "/tickets/print",    label: "Print Tickets",  color: "#FFD700" },
            { href: "/hub/venue",        label: "Venue Hub",      color: "#FF2DAA" },
            { href: "/ticketing",        label: "All Ticketing",  color: "#AA2DFF" },
          ].map(a => (
            <Link key={a.href} href={a.href} style={{ display: "block", padding: "12px", borderRadius: 10, background: `${a.color}0A`, border: `1px solid ${a.color}28`, color: a.color, fontSize: 11, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>{a.label}</Link>
          ))}
        </div>
      </div>
    </main>
  );
}
