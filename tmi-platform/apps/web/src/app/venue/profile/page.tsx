"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import MemoryWall from "@/components/media/MemoryWall";
import OmniPresenceEngine from "@/components/presence/OmniPresenceEngine";

const ACCENT = "#22c55e";
const BG = "#050510";


interface MeUser { id: string; email: string; name?: string; role: string; }
interface VenueStat { label: string; value: string; color: string; icon: string; }
interface VenueEvent { id: string; title: string; date: string; status: string; color: string; tickets: number; }
interface VenueRoom { id: string; name: string; capacity: number; live: boolean; viewers: number; color: string; }
interface Activity { id: string; text: string; time: string; color: string; }

export default function VenueProfilePage() {
  const router = useRouter();
  const [user, setUser]           = useState<MeUser | null>(null);
  const [editing, setEditing]     = useState(false);
  const [name, setName]           = useState("TMI Arena");
  const [bio, setBio]             = useState("Premier digital venue on The Musician's Index. Hosting battles, concerts, premieres, and live cyphers for artists at every level.");
  const [saveStatus, setSaveStatus] = useState("");
  const [stats, setStats]         = useState<VenueStat[]>([]);
  const [events, setEvents]       = useState<VenueEvent[]>([]);
  const [rooms, setRooms]         = useState<VenueRoom[]>([]);
  const [activity, setActivity]   = useState<Activity[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sessionRes, profileRes] = await Promise.all([
          fetch("/api/auth/session", { credentials: "include" }),
          fetch("/api/venue/profile", { credentials: "include" })
        ]);
        const sessionData = await sessionRes.json();
        if (!sessionData.authenticated || !sessionData.user) { router.replace("/auth"); return; }
        setUser(sessionData.user);
        if (sessionData.user.name) setName(sessionData.user.name);

        const profileData = await profileRes.json();
        setStats(profileData.stats || []);
        setEvents(profileData.events || []);
        setRooms(profileData.rooms || []);
        setActivity(profileData.activity || []);
      } catch (err) {
        console.error("Failed to fetch venue data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (!user) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: `3px solid ${ACCENT}`, borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: BG, color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}}
        .stat-card:hover{transform:translateY(-2px);transition:transform .2s}
      `}</style>

      {/* Nav */}
      <nav style={{ background: "rgba(0,0,0,0.85)", borderBottom: `1px solid ${ACCENT}22`, padding: "12px 24px", display: "flex", gap: 20, alignItems: "center", overflowX: "auto", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: ACCENT, textDecoration: "none", letterSpacing: "0.12em", flexShrink: 0 }}>TMI</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
        <Link href="/hub/venue" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Venue Hub</Link>
        <span style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
        <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>Venue Profile</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <Link href="/venues/dashboard" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Dashboard</Link>
          <Link href="/settings" style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Settings</Link>
        </div>
      </nav>

      {/* Background glow */}
      <div style={{ position: "fixed", inset: 0, background: `radial-gradient(circle at 40% 20%, ${ACCENT}07, transparent 50%)`, pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "32px 24px", animation: "fadeUp .4s ease" }}>

        {/* Hero card */}
        <div style={{ display: "flex", gap: 24, padding: "28px 32px", background: `linear-gradient(135deg, ${ACCENT}0E 0%, rgba(5,5,16,0.97) 100%)`, border: `1px solid ${ACCENT}28`, borderRadius: 20, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-start", boxShadow: `0 8px 40px ${ACCENT}0A` }}>
          <div style={{ width: 96, height: 96, borderRadius: 18, background: `linear-gradient(135deg, ${ACCENT}, #06402a)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, flexShrink: 0, boxShadow: `0 0 32px ${ACCENT}30` }}>🏟️</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 9, letterSpacing: "0.25em", color: ACCENT, fontWeight: 800 }}>VENUE · TMI CERTIFIED</span>
              <span style={{ background: `${ACCENT}20`, border: `1px solid ${ACCENT}40`, borderRadius: 4, padding: "1px 8px", fontSize: 8, color: ACCENT, fontWeight: 900 }}>DIAMOND</span>
              <span style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 4, padding: "1px 8px", fontSize: 8, color: "#ef4444", fontWeight: 900, animation: "pulse 2s infinite" }}>● LIVE</span>
            </div>
            <h1 style={{ margin: "0 0 6px", fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 900 }}>{name}</h1>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 520 }}>{bio}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link href="/ticketing/create" style={{ padding: "9px 18px", borderRadius: 8, background: ACCENT, color: "#020a05", fontSize: 10, fontWeight: 900, textDecoration: "none", letterSpacing: "0.08em" }}>+ CREATE EVENT</Link>
              <Link href="/tickets/print" style={{ padding: "9px 18px", borderRadius: 8, background: `${ACCENT}12`, border: `1px solid ${ACCENT}35`, color: ACCENT, fontSize: 10, fontWeight: 800, textDecoration: "none" }}>🖨️ PRINT TICKETS</Link>
              <Link href="/venues/sell" style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 800, textDecoration: "none" }}>💳 SELL TICKETS</Link>
              <Link href="/admin/ticket-scanner" style={{ padding: "9px 18px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: 800, textDecoration: "none" }}>📷 SCAN</Link>
            </div>
          </div>
          <button onClick={() => setEditing(!editing)} style={{ padding: "9px 20px", borderRadius: 9, background: `${ACCENT}14`, border: `1px solid ${ACCENT}45`, color: ACCENT, fontSize: 10, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>
            {editing ? "CANCEL" : "EDIT PROFILE"}
          </button>
        </div>

        {/* Edit form */}
        {editing && (
          <div style={{ padding: "24px", background: "rgba(255,255,255,0.02)", border: `1px solid ${ACCENT}20`, borderRadius: 16, marginBottom: 24 }}>
            <form onSubmit={async (e) => { e.preventDefault(); setSaveStatus(""); try { const r = await fetch("/api/profile/update", { method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify({ displayName: name, bio }) }); setSaveStatus(r.ok ? "Saved!" : "Save failed."); } catch { setSaveStatus("Network error."); } }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Venue Name",      val: name,   setter: setName },
              ].map((f) => (
                <div key={f.label}>
                  <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>{f.label}</label>
                  <input type="text" value={f.val} onChange={(e) => f.setter(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}20`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>DESCRIPTION</label>
                <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: `1px solid ${ACCENT}20`, color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical" }} />
              </div>
              {[{ label: "City / Location" }, { label: "Max Capacity" }, { label: "Contact Email" }].map((f) => (
                <div key={f.label}>
                  <label style={{ display: "block", fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", fontWeight: 800, marginBottom: 6 }}>{f.label}</label>
                  <input type="text" style={{ width: "100%", padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button type="submit" style={{ padding: "10px 24px", borderRadius: 8, background: ACCENT, color: BG, border: "none", fontSize: 12, fontWeight: 900, cursor: "pointer" }}>SAVE</button>
                  {saveStatus && <span style={{ fontSize: 11, color: saveStatus === "Saved!" ? "#00FF88" : "#FF4444" }}>{saveStatus}</span>}
                </div>
                <Link href="/account/deactivate" style={{ color: "#ff4444", fontSize: 11, textDecoration: "none" }}>Deactivate Account</Link>
              </div>
            </form>
          </div>
        )}

        {/* Stats grid */}
        {!loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
            {stats && stats.length > 0 ? stats.map((s, i) => (
              <div key={s.label} className="stat-card" style={{ padding: "18px 16px", background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 14, textAlign: "center", animation: `fadeUp .4s ease ${i * 0.06}s both` }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 9, fontWeight: 800, marginTop: 6, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em" }}>{s.label}</div>
              </div>
            )) : (
              <div style={{ gridColumn: "1 / -1", padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
                No venue data available yet.
              </div>
            )}
          </div>
        )}
        {loading && <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 24, opacity: 0.5 }}>
          {[...Array(6)].map((_, i) => <div key={i} style={{ padding: "18px", background: "rgba(255,255,255,0.02)", borderRadius: 14, height: 80 }} />)}
        </div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {/* Live Rooms */}
          <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: ACCENT, fontWeight: 800 }}>🔴 LIVE ROOMS</div>
              <Link href="/rooms" style={{ fontSize: 9, color: ACCENT, textDecoration: "none", fontWeight: 700 }}>MANAGE →</Link>
            </div>
            {rooms && rooms.length > 0 ? rooms.map(r => (
              <Link key={r.id} href={`/rooms/${r.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)", textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {r.live && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ef4444", display: "inline-block", animation: "pulse 2s infinite" }} />}
                  <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{r.name}</span>
                </div>
                <span style={{ fontSize: 10, color: r.live ? r.color : "rgba(255,255,255,0.25)" }}>
                  {r.live ? `${r.viewers} viewers` : "Offline"}
                </span>
              </Link>
            )) : (
              <div style={{ padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 11 }}>No active rooms.</div>
            )}
            <Link href="/rooms/create" style={{ display: "block", marginTop: 12, padding: "9px 14px", borderRadius: 8, background: `${ACCENT}10`, border: `1px solid ${ACCENT}25`, color: ACCENT, fontSize: 10, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>+ OPEN NEW ROOM</Link>
          </div>

          {/* Upcoming Events */}
          <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#00FFFF", fontWeight: 800 }}>📅 UPCOMING EVENTS</div>
              <Link href="/ticketing" style={{ fontSize: 9, color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>ALL →</Link>
            </div>
            {events && events.length > 0 ? events.map(ev => (
              <div key={ev.id} style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", marginBottom: 3, lineHeight: 1.3 }}>{ev.title}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 9, color: ev.color }}>{ev.date}</span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{ev.tickets} tickets sold</span>
                </div>
              </div>
            )) : (
              <div style={{ padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 11 }}>No upcoming events.</div>
            )}
            <Link href="/ticketing/create" style={{ display: "block", marginTop: 12, padding: "9px 14px", borderRadius: 8, background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.2)", color: "#00FFFF", fontSize: 10, fontWeight: 800, textDecoration: "none", textAlign: "center" }}>+ CREATE EVENT</Link>
          </div>
        </div>

        {/* Activity feed */}
        <div style={{ padding: "20px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#FFD700", fontWeight: 800, marginBottom: 14 }}>⚡ RECENT ACTIVITY</div>
          {activity && activity.length > 0 ? activity.map(a => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{a.text}</div>
              <div style={{ fontSize: 9, color: a.color, flexShrink: 0, marginLeft: 16 }}>{a.time}</div>
            </div>
          )) : (
            <div style={{ padding: "12px", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 11 }}>No recent activity.</div>
          )}
        </div>

        {/* Quick nav */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginBottom: 24 }}>
          {[
            { href: "/hub/venue",         label: "Venue Hub",      color: ACCENT    },
            { href: "/venue/bookings",    label: "Bookings",       color: "#00FFFF" },
            { href: "/ticketing",         label: "Ticketing",      color: "#FFD700" },
            { href: "/venues/designer",   label: "Seat Designer",  color: "#AA2DFF" },
            { href: "/tickets/print",     label: "Print Tickets",  color: "#FF6B35" },
            { href: "/admin/venues",      label: "Admin View",     color: "#FF2DAA" },
            { href: "/billing",           label: "Billing",        color: "#00FF88" },
            { href: "/settings",          label: "Settings",       color: "rgba(255,255,255,0.4)" },
          ].map((a) => (
            <Link key={a.href} href={a.href} style={{ display: "block", padding: "13px 12px", borderRadius: 10, background: `${a.color}0A`, border: `1px solid ${a.color}28`, color: a.color, fontSize: 11, fontWeight: 800, textDecoration: "none", textAlign: "center", transition: "background .2s" }}>{a.label}</Link>
          ))}
        </div>

        {/* Memory wall + canisters */}
        <MemoryWall accentColor={ACCENT} title="Venue Memory Wall" />

        {/* Omni presence */}
        <OmniPresenceEngine displayName={name || "Venue"} defaultTab="messages" />
      </div>
    </main>
  );
}
