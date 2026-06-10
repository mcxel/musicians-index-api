"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SettingsAccountPage() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwStatus, setPwStatus] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [delStatus, setDelStatus] = useState("");

  async function handlePassword() {
    if (!current) { setPwStatus("Enter your current password."); return; }
    if (!password || password !== confirm) { setPwStatus("New passwords don't match."); return; }
    if (password.length < 8) { setPwStatus("Minimum 8 characters."); return; }
    setPwBusy(true);
    setPwStatus("");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: current, newPassword: password }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (data.ok) {
        setPwStatus("Password updated successfully.");
        setCurrent(""); setPassword(""); setConfirm("");
      } else {
        setPwStatus(data.error ?? "Update failed.");
      }
    } catch {
      setPwStatus("Network error — try again.");
    } finally {
      setPwBusy(false);
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    setDelStatus("");
    try {
      const res = await fetch("/api/auth/deactivate", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json() as { ok?: boolean };
      if (data.ok) {
        router.replace("/auth?deleted=1");
      } else {
        setDelStatus("Deactivation failed — please contact support.");
        setDeleting(false);
      }
    } catch {
      setDelStatus("Network error — try again.");
      setDeleting(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/settings" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Settings</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#00FFFF", fontWeight: 800, marginBottom: 4 }}>SETTINGS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 32px" }}>Account</h1>

        <section style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "24px", marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, margin: "0 0 16px" }}>Change Password</h2>
          <div style={{ display: "grid", gap: 10 }}>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Current password" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 13 }} />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password (8+ characters)" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 13 }} />
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 13 }} />
            <button onClick={handlePassword} disabled={pwBusy} style={{ padding: "11px 24px", borderRadius: 8, background: "#00FFFF", color: "#05060c", fontWeight: 800, fontSize: 13, cursor: pwBusy ? "wait" : "pointer", border: "none", width: "fit-content", opacity: pwBusy ? 0.7 : 1 }}>{pwBusy ? "Updating..." : "Update Password"}</button>
            {pwStatus && <div style={{ fontSize: 12, color: pwStatus.includes("success") ? "#22c55e" : "#ef4444" }}>{pwStatus}</div>}
          </div>
        </section>

        <section style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: "24px" }}>
          <h2 style={{ fontSize: 14, fontWeight: 800, margin: "0 0 10px", color: "#ef4444" }}>Delete Account</h2>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 14px" }}>This is permanent and cannot be undone. All data will be removed.</p>
          {delStatus && <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 10 }}>{delStatus}</div>}
          {!delConfirm ? (
            <button onClick={() => setDelConfirm(true)} style={{ padding: "10px 22px", borderRadius: 8, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>Delete My Account</button>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={confirmDelete} disabled={deleting} style={{ padding: "10px 22px", borderRadius: 8, background: "#ef4444", color: "#fff", fontWeight: 800, fontSize: 12, cursor: "pointer", border: "none", opacity: deleting ? 0.6 : 1 }}>{deleting ? "Deleting..." : "Confirm Delete"}</button>
              <button onClick={() => setDelConfirm(false)} style={{ padding: "10px 22px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Cancel</button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
