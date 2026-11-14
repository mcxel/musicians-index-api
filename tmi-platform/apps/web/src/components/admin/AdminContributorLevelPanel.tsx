"use client";

/**
 * AdminContributorLevelPanel
 *
 * Admin UI to promote/demote a contributor account's editorial-economy
 * level — the real path to trusted-editor/staff-editor, which
 * /editorial/review requires before anyone can approve or reject a
 * submission. Calls POST /api/admin/users/set-contributor-level.
 */

import { useState } from "react";

const LEVELS = [
  { id: "new-contributor", label: "NEW CONTRIBUTOR", color: "#888" },
  { id: "verified-contributor", label: "VERIFIED CONTRIBUTOR", color: "#00FFFF" },
  { id: "trusted-editor", label: "TRUSTED EDITOR", color: "#AA2DFF" },
  { id: "staff-editor", label: "STAFF EDITOR", color: "#FFD700" },
] as const;

type LevelId = (typeof LEVELS)[number]["id"];

type SetLevelResult = { ok: boolean; email?: string; level?: string; error?: string };

export default function AdminContributorLevelPanel() {
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState<LevelId | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SetLevelResult | null>(null);

  async function handleSubmit() {
    if (!email.includes("@") || !level) return;
    setIsSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/users/set-contributor-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), level }),
        credentials: "include",
      });
      const data = await res.json();
      setResult(res.ok ? { ok: true, ...data } : { ok: false, error: data.error ?? "Unknown error" });
    } catch {
      setResult({ ok: false, error: "Network error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  function reset() {
    setEmail("");
    setLevel("");
    setResult(null);
  }

  return (
    <div
      style={{
        background: "radial-gradient(circle at 100% 0%, rgba(255,215,0,0.06), transparent 50%), #06070d",
        border: "1px solid rgba(255,215,0,0.3)",
        borderRadius: 16,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(255,215,0,0.15)",
            border: "2px solid rgba(255,215,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          📝
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.12em", color: "#FFD700" }}>
            CONTRIBUTOR LEVEL
          </div>
          <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
            Real promotion path for /editorial/review access
          </div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#888", letterSpacing: "0.1em", marginBottom: 8 }}>
          ACCOUNT EMAIL
        </div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="contributor@example.com"
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,215,0,0.3)",
            borderRadius: 8,
            padding: "10px 14px",
            color: "#fff",
            fontSize: 13,
            outline: "none",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#888", letterSpacing: "0.1em", marginBottom: 8 }}>
          SET LEVEL
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {LEVELS.map((lvl) => {
            const active = level === lvl.id;
            return (
              <button
                key={lvl.id}
                onClick={() => setLevel(lvl.id)}
                style={{
                  background: active ? `${lvl.color}22` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? lvl.color : "#333"}`,
                  borderRadius: 8,
                  padding: "6px 10px",
                  color: active ? lvl.color : "#666",
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: "pointer",
                  letterSpacing: "0.06em",
                }}
              >
                {lvl.label}
              </button>
            );
          })}
        </div>
      </div>

      {result && (
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            border: `1px solid ${result.ok ? "#00FFFF44" : "#FF2DAA44"}`,
            background: result.ok ? "rgba(0,255,255,0.06)" : "rgba(255,45,170,0.06)",
          }}
        >
          {result.ok ? (
            <>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.08em" }}>
                ✓ LEVEL SET
              </div>
              <div style={{ fontSize: 10, color: "#888", marginTop: 6 }}>
                {result.email} → <strong style={{ color: "#fff" }}>{result.level}</strong>
              </div>
              <button
                onClick={reset}
                style={{
                  marginTop: 10,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid #333",
                  borderRadius: 6,
                  color: "#888",
                  fontSize: 10,
                  padding: "5px 12px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  letterSpacing: "0.08em",
                }}
              >
                SET ANOTHER ACCOUNT
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#FF2DAA" }}>✗ {result.error ?? "Error"}</div>
              <button
                onClick={() => setResult(null)}
                style={{ marginTop: 8, background: "none", border: "none", color: "#666", fontSize: 10, cursor: "pointer", fontFamily: "inherit" }}
              >
                Try again
              </button>
            </>
          )}
        </div>
      )}

      {!result && (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !email.includes("@") || !level}
          style={{
            background: !level ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg, rgba(255,215,0,0.3), rgba(255,215,0,0.15))",
            border: `1px solid ${!level ? "#333" : "#FFD700"}`,
            borderRadius: 10,
            padding: 14,
            color: !level ? "#555" : "#FFD700",
            fontSize: 13,
            fontWeight: 900,
            cursor: !level || isSubmitting ? "not-allowed" : "pointer",
            letterSpacing: "0.12em",
          }}
        >
          {isSubmitting ? "SETTING…" : !level ? "SELECT A LEVEL FIRST" : "📝 SET CONTRIBUTOR LEVEL"}
        </button>
      )}
    </div>
  );
}
