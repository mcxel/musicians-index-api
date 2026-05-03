"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type BillboardSnapshot = {
  venueSlug: string;
  current: {
    id: string;
    sponsorName: string;
    message: string;
    ctaLabel: string;
    ctaUrl: string;
    impressions: number;
    clicks: number;
    displayDurationSec: number;
  } | null;
  queueLength: number;
  rotationCount: number;
  totalImpressions: number;
  previewWindows: string[];
};

export default function LiveBillboardsPage() {
  const [snapshot, setSnapshot] = useState<BillboardSnapshot | null>(null);
  const [venueSlug, setVenueSlug] = useState("main-stage");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [sponsorForm, setSponsorForm] = useState({ sponsorId: "", sponsorName: "", message: "", ctaLabel: "Learn More", ctaUrl: "#", displayDurationSec: 30, priority: 5 });

  useEffect(() => { fetchBillboards(); }, [venueSlug]);

  async function fetchBillboards() {
    setLoading(true);
    try {
      const res = await fetch(`/api/live/billboards?venue=${venueSlug}`);
      setSnapshot(await res.json());
    } catch {
      setMsg("Failed to load billboard data");
    } finally {
      setLoading(false);
    }
  }

  async function billboardAction(action: string, extra: Record<string, unknown> = {}) {
    setMsg(null);
    try {
      const res = await fetch("/api/live/billboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, venueSlug, ...extra }),
      });
      if (!res.ok) throw new Error("Action failed");
      setMsg(`Done: ${action}`);
      await fetchBillboards();
    } catch {
      setMsg("Action failed");
    }
  }

  async function addSponsor(e: React.FormEvent) {
    e.preventDefault();
    await billboardAction("add-sponsor", { slot: { ...sponsorForm, imageUrl: null } });
    setSponsorForm({ sponsorId: "", sponsorName: "", message: "", ctaLabel: "Learn More", ctaUrl: "#", displayDurationSec: 30, priority: 5 });
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ padding: "56px 24px 32px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ marginBottom: 8 }}>
          <Link href="/live" style={{ color: "#666", textDecoration: "none", fontSize: 13 }}>{"<- Live Hub"}</Link>
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, marginBottom: 8 }}>Live Billboards</h1>
        <p style={{ color: "#999", fontSize: 14 }}>Sponsor bubbles, ad rotation, live preview windows, impression tracking.</p>
      </section>

      <section style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "center", flexWrap: "wrap" }}>
          <select value={venueSlug} onChange={(e) => setVenueSlug(e.target.value)}
            style={{ background: "#0d0d1f", border: "1px solid #333", borderRadius: 8, color: "#fff", padding: "8px 14px", fontSize: 14 }}>
            {["main-stage","cypher-room","battle-zone","concert-hall"].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
          <button onClick={() => billboardAction("rotate")}
            style={{ background: "#FFD70022", color: "#FFD700", border: "1px solid #FFD70044", borderRadius: 7, padding: "7px 16px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
            Rotate Now
          </button>
        </div>

        {msg && <p style={{ color: "#00FF88", fontSize: 13, marginBottom: 16 }}>{msg}</p>}
        {loading && <p style={{ color: "#666" }}>Loading...</p>}

        {snapshot && !loading && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Total Impressions", value: snapshot.totalImpressions, color: "#FFD700" },
                { label: "Rotations", value: snapshot.rotationCount, color: "#FF2DAA" },
                { label: "Queue Length", value: snapshot.queueLength, color: "#00BFFF" },
              ].map((s) => (
                <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #333", borderRadius: 10, padding: "16px 18px" }}>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>

            {snapshot.current ? (
              <div style={{ background: "rgba(255,215,0,0.06)", border: "1px solid #FFD70033", borderRadius: 14, padding: "24px 28px", marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: "#FFD700", fontWeight: 800, letterSpacing: "0.1em", marginBottom: 10 }}>CURRENT BILLBOARD</div>
                <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>{snapshot.current.sponsorName}</h3>
                <p style={{ fontSize: 14, color: "#bbb", marginBottom: 12 }}>{snapshot.current.message}</p>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <a href={snapshot.current.ctaUrl} style={{ background: "#FFD700", color: "#050510", borderRadius: 7, padding: "7px 18px", fontWeight: 800, fontSize: 13, textDecoration: "none" }}>
                    {snapshot.current.ctaLabel}
                  </a>
                  <button onClick={() => billboardAction("click")}
                    style={{ background: "transparent", color: "#aaa", border: "1px solid #333", borderRadius: 7, padding: "7px 14px", fontSize: 12, cursor: "pointer" }}>
                    Track Click
                  </button>
                  <span style={{ fontSize: 12, color: "#666", marginLeft: "auto" }}>
                    {snapshot.current.impressions} impressions · {snapshot.current.clicks} clicks
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ color: "#555", marginBottom: 24 }}>No active billboard. Add a sponsor below.</p>
            )}
          </>
        )}

        <form onSubmit={addSponsor} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #333", borderRadius: 12, padding: "24px 28px" }}>
          <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 18 }}>Add Sponsor Slot</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            {([
              ["Sponsor ID", "sponsorId", "sponsor-001"],
              ["Sponsor Name", "sponsorName", "Beats by Dre"],
              ["Message", "message", "Studio-quality sound"],
              ["CTA Label", "ctaLabel", "Shop Now"],
            ] as [string, string, string][]).map(([label, field, placeholder]) => (
              <div key={field}>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 5 }}>{label}</label>
                <input
                  value={(sponsorForm as Record<string, unknown>)[field] as string}
                  onChange={(e) => setSponsorForm((p) => ({ ...p, [field]: e.target.value }))}
                  placeholder={placeholder}
                  style={{ width: "100%", background: "#0d0d1f", border: "1px solid #333", borderRadius: 7, color: "#fff", padding: "8px 12px", fontSize: 13, boxSizing: "border-box" }}
                />
              </div>
            ))}
          </div>
          <button type="submit" disabled={!sponsorForm.sponsorId || !sponsorForm.sponsorName}
            style={{ background: "#FFD700", color: "#050510", border: "none", borderRadius: 8, padding: "9px 24px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
            Add Sponsor
          </button>
        </form>
      </section>
    </main>
  );
}
