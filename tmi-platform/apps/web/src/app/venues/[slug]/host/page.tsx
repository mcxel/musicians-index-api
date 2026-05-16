"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type HostState = {
  venueSlug: string;
  hostName: string;
  micActive: boolean;
  currentScript: string | null;
  cueQueue: { id: string; type: string; script: string }[];
  announcementLog: string[];
  emergencyMode: boolean;
};

export default function VenueHostPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const [host, setHost] = useState<HostState | null>(null);
  const [hostId, setHostId] = useState("host-001");
  const [hostName, setHostName] = useState("DJ Marcus");
  const [announcement, setAnnouncement] = useState("");
  const [cueScript, setCueScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { fetchHost(); }, [slug]);

  async function fetchHost() {
    setLoading(true);
    try {
      const res = await fetch(`/api/live/host?venue=${slug}`);
      if (res.ok) setHost(await res.json());
      else setHost(null);
    } catch {
      setHost(null);
    } finally {
      setLoading(false);
    }
  }

  async function hostAction(action: string, extra: Record<string, unknown> = {}) {
    setMsg(null);
    try {
      const res = await fetch("/api/live/host", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, venueSlug: slug, ...extra }),
      });
      if (!res.ok) throw new Error("Failed");
      setMsg(`Done: ${action}`);
      await fetchHost();
    } catch {
      setMsg("Action failed");
    }
  }

  async function registerHost(e: React.FormEvent) {
    e.preventDefault();
    await hostAction("register", { hostId, hostName });
  }

  async function makeAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    if (!announcement) return;
    await hostAction("announce", { text: announcement });
    setAnnouncement("");
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>
      <section style={{ padding: "56px 24px 32px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
          <Link href={`/venues/${slug}/live`} style={{ color: "#666", textDecoration: "none", fontSize: 13 }}>{"<- Venue Live"}</Link>
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 900, marginBottom: 8 }}>{slug} — Host Control</h1>
        <p style={{ color: "#999", fontSize: 14 }}>Host mic, cue queue, announcements, emergency override.</p>
      </section>

      <section style={{ maxWidth: 780, margin: "0 auto", padding: "40px 24px" }}>
        {msg && <p style={{ color: "#00FF88", fontSize: 13, marginBottom: 16 }}>{msg}</p>}
        {loading && <p style={{ color: "#666" }}>Loading host state...</p>}

        {!host && !loading && (
          <form onSubmit={registerHost} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #333", borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
            <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 18 }}>Register Host for {slug}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 5 }}>Host ID</label>
                <input value={hostId} onChange={(e) => setHostId(e.target.value)}
                  style={{ width: "100%", background: "#0d0d1f", border: "1px solid #333", borderRadius: 7, color: "#fff", padding: "8px 12px", fontSize: 13, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#888", display: "block", marginBottom: 5 }}>Host Name</label>
                <input value={hostName} onChange={(e) => setHostName(e.target.value)}
                  style={{ width: "100%", background: "#0d0d1f", border: "1px solid #333", borderRadius: 7, color: "#fff", padding: "8px 12px", fontSize: 13, boxSizing: "border-box" }} />
              </div>
            </div>
            <button type="submit"
              style={{ background: "#FF8C00", color: "#050510", border: "none", borderRadius: 8, padding: "9px 22px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
              Register Host
            </button>
          </form>
        )}

        {host && (
          <>
            <div style={{ background: "rgba(255,140,0,0.07)", border: "1px solid #FF8C0033", borderRadius: 12, padding: "22px 26px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <h3 style={{ fontWeight: 800, fontSize: 18, margin: 0 }}>{host.hostName}</h3>
                {host.emergencyMode && <span style={{ color: "#ff4444", fontWeight: 800, fontSize: 11 }}>EMERGENCY</span>}
              </div>
              <div style={{ fontSize: 13, color: host.micActive ? "#00FF88" : "#555", marginBottom: 12 }}>
                Mic: {host.micActive ? "HOT 🎤" : "OFF"}
              </div>
              {host.currentScript && (
                <div style={{ background: "#0d0d1f", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#FFD700", marginBottom: 12 }}>
                  {host.currentScript}
                </div>
              )}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => hostAction(host.micActive ? "deactivate-mic" : "activate-mic")}
                  style={{ background: host.micActive ? "#333" : "#00FF88", color: host.micActive ? "#fff" : "#050510", border: "none", borderRadius: 6, padding: "7px 16px", fontWeight: 800, cursor: "pointer", fontSize: 12 }}>
                  {host.micActive ? "Cut Mic" : "Activate Mic"}
                </button>
                <button onClick={() => hostAction("trigger-cue")}
                  style={{ background: "#FF8C00", color: "#050510", border: "none", borderRadius: 6, padding: "7px 16px", fontWeight: 800, cursor: "pointer", fontSize: 12 }}>
                  Trigger Cue ({host.cueQueue.length})
                </button>
                <button onClick={() => hostAction("emergency")}
                  style={{ background: "#ff444422", color: "#ff4444", border: "1px solid #ff444444", borderRadius: 6, padding: "7px 16px", fontWeight: 800, cursor: "pointer", fontSize: 12 }}>
                  Emergency
                </button>
              </div>
            </div>

            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #333", borderRadius: 12, padding: "20px 24px", marginBottom: 16 }}>
              <h4 style={{ fontWeight: 800, fontSize: 13, marginBottom: 12 }}>Queue Cue</h4>
              <div style={{ display: "flex", gap: 10 }}>
                <input value={cueScript} onChange={(e) => setCueScript(e.target.value)} placeholder="Cue script..."
                  style={{ flex: 1, background: "#0d0d1f", border: "1px solid #333", borderRadius: 7, color: "#fff", padding: "8px 12px", fontSize: 13 }} />
                <button onClick={() => { if (cueScript) { hostAction("queue-cue", { cueType: "banter", script: cueScript }); setCueScript(""); } }}
                  disabled={!cueScript}
                  style={{ background: "#AA2DFF", color: "#fff", border: "none", borderRadius: 7, padding: "8px 16px", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>
                  Queue
                </button>
              </div>
            </div>

            <form onSubmit={makeAnnouncement} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid #333", borderRadius: 12, padding: "20px 24px" }}>
              <h4 style={{ fontWeight: 800, fontSize: 13, marginBottom: 12 }}>Announcement</h4>
              <div style={{ display: "flex", gap: 10 }}>
                <input value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Announcement text..."
                  style={{ flex: 1, background: "#0d0d1f", border: "1px solid #333", borderRadius: 7, color: "#fff", padding: "8px 12px", fontSize: 13 }} />
                <button type="submit" disabled={!announcement}
                  style={{ background: "#00BFFF", color: "#050510", border: "none", borderRadius: 7, padding: "8px 16px", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>
                  Send
                </button>
              </div>
              {host.announcementLog.slice(-3).map((log, i) => (
                <p key={i} style={{ fontSize: 11, color: "#555", marginTop: 6 }}>{log}</p>
              ))}
            </form>
          </>
        )}
      </section>
    </main>
  );
}
