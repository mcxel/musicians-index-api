"use client";
import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sendInvitesAction, type SendInvitesReturn } from "@/app/admin/actions";

const DEFAULT_ENTRY = "https://tmi.berntoutglobal.com/rooms/world-dance-party";

const PLACEHOLDER = `Christina F leeanncoats.79@gmail.com
Antion K Antoineking122@gmail.com
Terrence G Dontaige@yahoo.com
Terry Terrry2890@gmail.com
Jerome N AustinNunsuch@gmail.com`;

export default function InvitePanel() {
  const [rawText, setRawText] = useState("");
  const [entryUrl, setEntryUrl] = useState(DEFAULT_ENTRY);
  const [result, setResult] = useState<SendInvitesReturn | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSend = () => {
    setResult(null);
    startTransition(async () => {
      const res = await sendInvitesAction(rawText, entryUrl);
      setResult(res);
    });
  };

  const lineCount = rawText.split("\n").filter((l) => l.trim() && !l.startsWith("#") && l.includes("@")).length;

  return (
    <div style={{
      background: "rgba(255,45,170,0.04)", border: "1px solid rgba(255,45,170,0.2)",
      borderRadius: 16, padding: 24, marginBottom: 36,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 5, color: "#FF2DAA", fontWeight: 800, marginBottom: 4 }}>
            SEND INVITES
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            Paste names + emails — one per line. Max 20 per batch.
          </div>
        </div>
        {lineCount > 0 && (
          <div style={{ fontSize: 11, color: "#00FF88", fontWeight: 700 }}>
            {lineCount} recipient{lineCount !== 1 ? "s" : ""} detected
          </div>
        )}
      </div>

      <textarea
        value={rawText}
        onChange={(e) => { setRawText(e.target.value); setResult(null); }}
        placeholder={PLACEHOLDER}
        rows={6}
        style={{
          width: "100%", boxSizing: "border-box",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8, color: "#fff", fontSize: 12, padding: "12px 14px",
          fontFamily: "monospace", resize: "vertical", outline: "none",
          marginBottom: 12,
        }}
      />

      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <div style={{ fontSize: 9, letterSpacing: 2, color: "#888", fontWeight: 700, whiteSpace: "nowrap" }}>
          ENTRY URL
        </div>
        <input
          value={entryUrl}
          onChange={(e) => setEntryUrl(e.target.value)}
          style={{
            flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 6, color: "#aaa", fontSize: 11, padding: "6px 10px", outline: "none",
            fontFamily: "monospace",
          }}
        />
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSend}
        disabled={isPending || lineCount === 0}
        style={{
          padding: "12px 28px", borderRadius: 10, cursor: lineCount > 0 && !isPending ? "pointer" : "default",
          background: lineCount > 0 && !isPending
            ? "linear-gradient(135deg, #FF2DAA, #AA2DFF)"
            : "rgba(255,255,255,0.05)",
          border: "none",
          color: lineCount > 0 && !isPending ? "#fff" : "#444",
          fontSize: 10, fontWeight: 900, letterSpacing: 3,
        }}
      >
        {isPending ? "SENDING…" : `SEND ${lineCount > 0 ? lineCount : ""} INVITE${lineCount !== 1 ? "S" : ""}`}
      </motion.button>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: 16 }}
          >
            {result.error ? (
              <div style={{ color: "#FF6B6B", fontSize: 11 }}>⚠ {result.error}</div>
            ) : (
              <>
                <div style={{ fontSize: 11, marginBottom: 10 }}>
                  <span style={{ color: "#00FF88", fontWeight: 700 }}>✓ {result.sent} sent</span>
                  {result.failed > 0 && (
                    <span style={{ color: "#FF6B6B", fontWeight: 700, marginLeft: 12 }}>
                      ✗ {result.failed} failed
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {result.results.map((r) => (
                    <div key={r.email} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 10 }}>
                      <span style={{ color: r.success ? "#00FF88" : "#FF6B6B", fontWeight: 700 }}>
                        {r.success ? "✓" : "✗"}
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.6)", fontFamily: "monospace" }}>{r.email}</span>
                      <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 9 }}>via {r.provider}</span>
                      {r.error && <span style={{ color: "#FF6B6B", fontSize: 9 }}>{r.error}</span>}
                    </div>
                  ))}
                </div>
                {result.sent > 0 && (
                  <div style={{ marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                    Watch the Live Rooms panel above — presence will update when they arrive.
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
