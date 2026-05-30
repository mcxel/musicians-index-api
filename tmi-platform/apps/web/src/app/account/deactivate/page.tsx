"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DeactivateAccountPage() {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleDeactivate(e: React.FormEvent) {
    e.preventDefault();
    if (confirm.trim().toUpperCase() !== "DELETE") {
      setError('Type DELETE (all caps) to confirm.');
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/deactivate", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        router.replace("/home/1?notice=account-deactivated");
      } else {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data?.error ?? `Failed (${res.status}). Please try again.`);
        setBusy(false);
      }
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0f", color: "#fff", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ maxWidth: 480, width: "100%" }}>
        <Link href="/account" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none", letterSpacing: "0.1em" }}>
          ← Back to Account
        </Link>

        <div style={{ marginTop: 24, padding: "28px 24px", background: "rgba(255,45,45,0.06)", border: "1px solid rgba(255,45,45,0.25)", borderRadius: 16 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#FF5555", margin: "0 0 10px" }}>Deactivate Account</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.7, marginBottom: 20 }}>
            This will immediately end your session and deactivate your account. You will lose access to:
          </p>

          <ul style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.9, paddingLeft: 20, marginBottom: 24 }}>
            <li>Your profile, rankings, and XP</li>
            <li>Active subscriptions and season passes</li>
            <li>Purchased beats, NFTs, and digital items</li>
            <li>Battle history and cypher records</li>
            <li>Saved articles and magazine bookmarks</li>
          </ul>

          <div style={{ background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "rgba(255,215,0,0.9)", lineHeight: 1.6 }}>
            💡 If you just need a break, contact support instead — we can pause your account without losing your data.
            {" "}<Link href="/support" style={{ color: "#FFD700", fontWeight: 700 }}>Contact Support →</Link>
          </div>

          <form onSubmit={(e) => void handleDeactivate(e)}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", marginBottom: 8, textTransform: "uppercase" }}>
              Type DELETE to confirm
            </label>
            <input
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${confirm.toUpperCase() === "DELETE" ? "rgba(255,85,85,0.6)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: 8,
                color: "#fff",
                fontSize: 16,
                letterSpacing: "0.15em",
                fontFamily: "monospace",
                boxSizing: "border-box",
                outline: "none",
                marginBottom: 16,
              }}
            />

            {error && (
              <div style={{ padding: "10px 14px", background: "rgba(255,45,45,0.1)", border: "1px solid rgba(255,45,45,0.3)", borderRadius: 8, fontSize: 13, color: "#ff8888", marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="submit"
                disabled={busy || confirm.trim().toUpperCase() !== "DELETE"}
                style={{
                  flex: 1,
                  padding: "12px",
                  background: confirm.trim().toUpperCase() === "DELETE" && !busy ? "#FF3333" : "rgba(255,51,51,0.2)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: busy || confirm.trim().toUpperCase() !== "DELETE" ? "not-allowed" : "pointer",
                  letterSpacing: "0.06em",
                }}
              >
                {busy ? "Deactivating…" : "Deactivate My Account"}
              </button>
              <Link
                href="/account"
                style={{
                  flex: 1,
                  padding: "12px",
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                  display: "grid",
                  placeItems: "center",
                  letterSpacing: "0.04em",
                }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
